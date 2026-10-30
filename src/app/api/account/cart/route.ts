import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { computeProductStock } from '@/lib/inventory';

interface IncomingItem {
  productId: string;
  quantity: number;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                inventory: true,
                bundleParentItems: {
                  include: {
                    componentProduct: {
                      include: { inventory: true },
                    },
                  },
                },
              },
            },
          },
          orderBy: { addedAt: 'asc' },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    const formattedItems = await Promise.all(
      cart.items.map(async (ci) => {
        const prod = ci.product;
        const stockInfo = await computeProductStock(prod.id);
        let images: string[] = [];
        try {
          images = JSON.parse(prod.images as string);
        } catch {
          images = ['/images/brother-ink-products.jpg'];
        }

        let features: string[] = [];
        try {
          features = JSON.parse(prod.features as string);
        } catch {
          features = [];
        }

        let specifications: Record<string, string> = {};
        try {
          specifications = JSON.parse(prod.specifications as string);
        } catch {
          specifications = {};
        }

        return {
          product: {
            id: prod.id,
            slug: prod.slug,
            sku: prod.sku,
            name: prod.name,
            description: prod.description,
            price: prod.price / 100,
            originalPrice: prod.originalPrice / 100,
            discount: prod.discount,
            category: prod.category.name,
            categorySlug: prod.category.slug,
            subCategory: prod.subCategory ?? undefined,
            rating: prod.rating,
            reviewCount: prod.reviewCount,
            images,
            features,
            specifications,
            badge: prod.badge ?? undefined,
            featured: prod.featured,
            isBundle: prod.isBundle,
            isDemo: prod.isDemo,
            isActive: prod.isActive,
            status: prod.status as 'published' | 'draft' | 'archived',
            stockCount: stockInfo?.availableStock ?? 0,
            createdAt: prod.createdAt.toISOString(),
            updatedAt: prod.updatedAt.toISOString(),
          },
          quantity: Math.min(ci.quantity, stockInfo?.availableStock || ci.quantity || 1),
        };
      })
    );

    return NextResponse.json({ items: formattedItems });
  } catch (err) {
    console.error('[GET /api/account/cart]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as {
      action?: 'merge' | 'sync' | 'update' | 'remove';
      items?: IncomingItem[];
      productId?: string;
      quantity?: number;
    };

    const cart = await prisma.cart.upsert({
      where: { userId: session.userId },
      create: { userId: session.userId },
      update: {},
    });

    if (body.action === 'merge' && Array.isArray(body.items)) {
      for (const item of body.items) {
        if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0) continue;

        // Resolve product by id or slug
        const prod = await prisma.product.findFirst({
          where: {
            OR: [{ id: item.productId }, { slug: item.productId }],
            isActive: true,
            status: 'published',
          },
        });
        if (!prod) continue;

        const stock = await computeProductStock(prod.id);
        const maxAvail = stock?.availableStock ?? 10;
        if (maxAvail <= 0) continue;

        const existing = await prisma.cartItem.findUnique({
          where: {
            cartId_productId: {
              cartId: cart.id,
              productId: prod.id,
            },
          },
        });

        if (existing) {
          // Merge without duplicating: preserve higher quantity up to available stock
          const newQty = Math.min(Math.max(existing.quantity, item.quantity), maxAvail);
          await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: newQty },
          });
        } else {
          const qty = Math.min(item.quantity, maxAvail);
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: prod.id,
              quantity: qty,
            },
          });
        }
      }
    } else if (body.action === 'sync' && Array.isArray(body.items)) {
      // Replace cart items with valid items
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

      for (const item of body.items) {
        if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0) continue;
        const prod = await prisma.product.findFirst({
          where: {
            OR: [{ id: item.productId }, { slug: item.productId }],
            isActive: true,
            status: 'published',
          },
        });
        if (!prod) continue;

        const stock = await computeProductStock(prod.id);
        const maxAvail = stock?.availableStock ?? 10;
        if (maxAvail <= 0) continue;

        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: prod.id,
            quantity: Math.min(item.quantity, maxAvail),
          },
        });
      }
    } else if (body.action === 'remove' && body.productId) {
      const prod = await prisma.product.findFirst({
        where: { OR: [{ id: body.productId }, { slug: body.productId }] },
      });
      if (prod) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id, productId: prod.id },
        });
      }
    }

    // Return the updated full cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                inventory: true,
              },
            },
          },
          orderBy: { addedAt: 'asc' },
        },
      },
    });

    const formattedItems = await Promise.all(
      (updatedCart?.items ?? []).map(async (ci) => {
        const prod = ci.product;
        const stockInfo = await computeProductStock(prod.id);
        let images: string[] = [];
        try {
          images = JSON.parse(prod.images as string);
        } catch {
          images = ['/images/brother-ink-products.jpg'];
        }

        return {
          product: {
            id: prod.id,
            slug: prod.slug,
            sku: prod.sku,
            name: prod.name,
            description: prod.description,
            price: prod.price / 100,
            originalPrice: prod.originalPrice / 100,
            discount: prod.discount,
            category: prod.category.name,
            categorySlug: prod.category.slug,
            subCategory: prod.subCategory ?? undefined,
            rating: prod.rating,
            reviewCount: prod.reviewCount,
            images,
            features: [],
            specifications: {},
            badge: prod.badge ?? undefined,
            featured: prod.featured,
            isBundle: prod.isBundle,
            isDemo: prod.isDemo,
            isActive: prod.isActive,
            status: prod.status as 'published' | 'draft' | 'archived',
            stockCount: stockInfo?.availableStock ?? 0,
            createdAt: prod.createdAt.toISOString(),
            updatedAt: prod.updatedAt.toISOString(),
          },
          quantity: ci.quantity,
        };
      })
    );

    return NextResponse.json({ items: formattedItems });
  } catch (err) {
    console.error('[POST /api/account/cart]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/account/cart]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

