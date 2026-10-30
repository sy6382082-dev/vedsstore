import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(
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
              include: {
                bundleParentItems: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'cancelled') {
      return NextResponse.json(
        { error: 'This order is already cancelled.' },
        { status: 400 }
      );
    }

    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return NextResponse.json(
        {
          error: `Orders with status "${order.status}" cannot be cancelled online. Please contact support.`,
        },
        { status: 400 }
      );
    }

    // Atomically restore inventory and update status inside a transaction
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        const prod = item.product;
        if (prod.isBundle && prod.bundleParentItems?.length > 0) {
          // Restore bundle components
          for (const bundleItem of prod.bundleParentItems) {
            const qtyToRestore = item.quantity * bundleItem.quantity;
            await tx.inventory.update({
              where: { productId: bundleItem.componentProductId },
              data: { stockCount: { increment: qtyToRestore } },
            });
          }
        } else {
          // Restore regular product inventory
          await tx.inventory.update({
            where: { productId: item.productId },
            data: { stockCount: { increment: item.quantity } },
          });
        }
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'cancelled',
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully and inventory restored.',
    });
  } catch (err) {
    console.error('[POST /api/account/orders/[id]/cancel]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

