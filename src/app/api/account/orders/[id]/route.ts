import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Strict customer isolation check
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: session.userId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                sku: true,
                images: true,
                isBundle: true,
              },
            },
          },
        },
        shippingAddress: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let parsedNotes: Record<string, unknown> = {};
    try {
      if (order.notes) parsedNotes = JSON.parse(order.notes);
    } catch {
      parsedNotes = {};
    }

    const formatted = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal / 100,
      shipping: order.shipping / 100,
      tax: order.tax / 100,
      grandTotal: order.grandTotal / 100,
      notes: parsedNotes,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      shippingAddress: order.shippingAddress,
      items: order.items.map((item) => {
        let images: string[] = [];
        try {
          images = JSON.parse(item.product.images);
        } catch {
          images = ['/images/brother-ink-products.jpg'];
        }
        return {
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          sku: item.product.sku,
          slug: item.product.slug,
          isBundle: item.product.isBundle,
          image: images[0] || '/images/brother-ink-products.jpg',
          price: item.price / 100,
          quantity: item.quantity,
          itemTotal: (item.price / 100) * item.quantity,
        };
      }),
    };

    return NextResponse.json({ order: formatted });
  } catch (err) {
    console.error('[GET /api/account/orders/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

