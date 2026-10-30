import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

interface FailedBody {
  orderId: string;
  reason?: string;
  errorDescription?: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const body = (await req.json()) as FailedBody;
    const { orderId, reason, errorDescription } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Customer Isolation Check
    if (order.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to modify this order.' },
        { status: 403 }
      );
    }

    // If order was already paid, do not cancel or release stock!
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({
        success: false,
        message: 'Order is already marked as paid.',
      });
    }

    // Release reserved inventory safely inside transaction
    await prisma.$transaction(async (tx) => {
      // Restore inventory
      for (const item of order.items) {
        const prod = item.product;
        if (prod.isBundle && prod.bundleParentItems?.length > 0) {
          for (const bundleItem of prod.bundleParentItems) {
            const qtyToRestore = item.quantity * bundleItem.quantity;
            await tx.inventory.update({
              where: { productId: bundleItem.componentProductId },
              data: { stockCount: { increment: qtyToRestore } },
            });
          }
        } else {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: { stockCount: { increment: item.quantity } },
          });
        }
      }

      let existingNotes: Record<string, unknown> = {};
      try {
        if (order.notes) existingNotes = JSON.parse(order.notes);
      } catch {
        existingNotes = {};
      }

      const updatedNotes = JSON.stringify({
        ...existingNotes,
        paymentFailureReason: reason || 'Payment cancelled by customer',
        paymentFailureDetails: errorDescription || null,
        failedAt: new Date().toISOString(),
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'cancelled',
          paymentStatus: 'failed',
          notes: updatedNotes,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Payment cancelled and inventory released. You can retry with another method.',
    });
  } catch (err: unknown) {
    console.error('[POST /api/payment/razorpay/failed]', err);
    return NextResponse.json({ error: 'Failed to record payment cancellation.' }, { status: 500 });
  }
}

