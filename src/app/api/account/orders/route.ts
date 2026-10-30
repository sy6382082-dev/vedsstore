import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.userId },
      include: {
        items: true,
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = orders.map((order) => ({
      ...order,
      subtotal: order.subtotal / 100,
      shipping: order.shipping / 100,
      tax: order.tax / 100,
      grandTotal: order.grandTotal / 100,
      items: order.items.map((item) => ({
        ...item,
        price: item.price / 100,
      })),
    }));

    return NextResponse.json({ orders: formatted });
  } catch (err) {
    console.error('[GET /api/account/orders]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

