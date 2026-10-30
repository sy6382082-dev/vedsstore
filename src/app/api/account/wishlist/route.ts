import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.userId },
      include: {
        items: {
          include: { product: { include: { inventory: true } } },
          orderBy: { addedAt: 'desc' },
        },
      },
    });

    const items = (wishlist?.items ?? []).map((item) => {
      let images: string[] = [];
      try { images = JSON.parse(item.product.images as string); } catch { images = []; }
      const stock = (item.product.inventory?.stockCount ?? 0) - (item.product.inventory?.reserved ?? 0);
      return {
        id: item.id,
        addedAt: item.addedAt,
        product: {
          ...item.product,
          price: item.product.price / 100,
          originalPrice: item.product.originalPrice / 100,
          images,
          stockCount: Math.max(0, stock),
          inStock: stock > 0,
        },
      };
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error('[GET /api/account/wishlist]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as { productId: string };
    const { productId } = body;
    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    // Upsert wishlist for user
    const wishlist = await prisma.wishlist.upsert({
      where: { userId: session.userId },
      create: { userId: session.userId },
      update: {},
    });

    // Toggle: add if not exists, remove if exists
    const existing = await prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: 'removed', productId });
    } else {
      await prisma.wishlistItem.create({
        data: { wishlistId: wishlist.id, productId },
      });
      return NextResponse.json({ action: 'added', productId });
    }
  } catch (err) {
    console.error('[POST /api/account/wishlist]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

