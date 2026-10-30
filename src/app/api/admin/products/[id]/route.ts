import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        inventory: true,
        bundleParentItems: {
          include: { componentProduct: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let images: string[] = [];
    let features: string[] = [];
    let specifications: Record<string, string> = {};

    try { images = JSON.parse(product.images); } catch { images = []; }
    try { features = JSON.parse(product.features); } catch { features = []; }
    try { specifications = JSON.parse(product.specifications); } catch { specifications = {}; }

    return NextResponse.json({
      product: {
        ...product,
        price: product.price / 100,
        originalPrice: product.originalPrice / 100,
        stockCount: product.inventory?.stockCount ?? 0,
        lowStockAlert: product.inventory?.lowStockAlert ?? 5,
        images,
        features,
        specifications,
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/products/[id]]', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { inventory: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const {
      name,
      sku,
      categoryId,
      subCategory,
      price,
      originalPrice,
      description,
      stockCount,
      lowStockAlert,
      status,
      badge,
      featured,
      images,
      features,
      specifications,
    } = body;

    // Check SKU collision with other products
    if (sku?.trim()) {
      const collision = await prisma.product.findFirst({
        where: {
          sku: sku.trim(),
          NOT: { id },
        },
      });
      if (collision) {
        return NextResponse.json(
          { error: `SKU "${sku}" is already assigned to another product.` },
          { status: 400 }
        );
      }
    }

    const pricePaise =
      typeof price === 'number' ? Math.round(price * 100) : existing.price;
    const origPricePaise =
      typeof originalPrice === 'number'
        ? Math.round(originalPrice * 100)
        : existing.originalPrice;
    const discount =
      origPricePaise > pricePaise
        ? Math.round(((origPricePaise - pricePaise) / origPricePaise) * 100)
        : 0;

    const newStatus = status ?? existing.status;
    const isActive = newStatus === 'published';

    const updated = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.update({
        where: { id },
        data: {
          ...(name?.trim() ? { name: name.trim() } : {}),
          sku: sku !== undefined ? (sku.trim() || null) : existing.sku,
          ...(categoryId ? { categoryId } : {}),
          subCategory: subCategory !== undefined ? (subCategory.trim() || null) : existing.subCategory,
          price: pricePaise,
          originalPrice: origPricePaise,
          discount,
          ...(description !== undefined ? { description: description.trim() } : {}),
          status: newStatus,
          isActive,
          badge: badge !== undefined ? (badge.trim() || null) : existing.badge,
          featured: featured !== undefined ? Boolean(featured) : existing.featured,
          ...(images ? { images: JSON.stringify(images) } : {}),
          ...(features ? { features: JSON.stringify(features) } : {}),
          ...(specifications ? { specifications: JSON.stringify(specifications) } : {}),
        },
      });

      if (stockCount !== undefined || lowStockAlert !== undefined) {
        await tx.inventory.upsert({
          where: { productId: id },
          create: {
            productId: id,
            stockCount: Math.max(0, Number(stockCount ?? 0)),
            reserved: 0,
            lowStockAlert: Math.max(1, Number(lowStockAlert ?? 5)),
          },
          update: {
            ...(stockCount !== undefined ? { stockCount: Math.max(0, Number(stockCount)) } : {}),
            ...(lowStockAlert !== undefined ? { lowStockAlert: Math.max(1, Number(lowStockAlert)) } : {}),
          },
        });
      }

      return prod;
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('[PUT /api/admin/products/[id]]', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: { select: { id: true } },
        bundleParentItems: { select: { id: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // If product has historical orders, softly archive it to preserve order history
    if (product.orderItems.length > 0) {
      await prisma.product.update({
        where: { id },
        data: { status: 'archived', isActive: false },
      });
      return NextResponse.json({
        success: true,
        archived: true,
        message: 'Product archived because past orders reference it.',
      });
    }

    // Otherwise safe delete
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Product deleted permanently.' });
  } catch (error) {
    console.error('[DELETE /api/admin/products/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

