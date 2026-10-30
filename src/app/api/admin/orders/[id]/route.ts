import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';

const VALID_STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
const VALID_PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = (await req.json()) as { status?: string; paymentStatus?: string };
    const { status, paymentStatus } = body;

    if (!status && !paymentStatus) {
      return NextResponse.json(
        { error: 'Provide at least status or paymentStatus to update' },
        { status: 400 }
      );
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json(
        { error: `Invalid paymentStatus. Must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
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

    // Inspect order notes to verify payment gateway details
    let notesObj: Record<string, unknown> = {};
    try {
      if (order.notes) notesObj = JSON.parse(order.notes);
    } catch {
      notesObj = {};
    }

    const paymentMethod = typeof notesObj.paymentMethod === 'string' ? notesObj.paymentMethod : '';
    const gateway = typeof notesObj.gateway === 'string' ? notesObj.gateway : '';
    const razorpayOrderId = typeof notesObj.razorpayOrderId === 'string' ? notesObj.razorpayOrderId : '';
    const razorpayPaymentId = typeof notesObj.razorpayPaymentId === 'string' ? notesObj.razorpayPaymentId : '';

    const isOnlinePayment =
      paymentMethod.startsWith('RAZORPAY') ||
      gateway === 'razorpay' ||
      Boolean(razorpayOrderId);
    const hasVerifiedPaymentId = Boolean(razorpayPaymentId);

    // SECURITY GUARD: Strictly prevent admins from manually marking unverified online payments as paid
    if (paymentStatus === 'paid' && isOnlinePayment && !hasVerifiedPaymentId) {
      return NextResponse.json(
        {
          error:
            'Security violation: Cannot manually mark an unverified online Razorpay payment as paid. Online transactions require cryptographic HMAC-SHA256 verification from Razorpay.',
        },
        { status: 400 }
      );
    }

    // SECURITY GUARD: Prevent confirming or fulfilling an online payment order that has not been paid
    if (
      status &&
      ['confirmed', 'packed', 'shipped', 'delivered'].includes(status) &&
      isOnlinePayment &&
      order.paymentStatus !== 'paid' &&
      !hasVerifiedPaymentId
    ) {
      return NextResponse.json(
        {
          error:
            'Cannot confirm or advance status for an unpaid online order. The customer must complete verification first.',
        },
        { status: 400 }
      );
    }

    // Atomically handle inventory restoration if changing to 'cancelled'
    const updated = await prisma.$transaction(async (tx) => {
      if (status === 'cancelled' && order.status !== 'cancelled') {
        // Restore inventory for each item
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
      }

      const updateData: { status?: string; paymentStatus?: string; notes?: string } = {};
      if (status) updateData.status = status;
      if (paymentStatus) {
        updateData.paymentStatus = paymentStatus;
        if (paymentStatus === 'refunded') {
          notesObj.refundStatus = 'processed';
          notesObj.refundDate = new Date().toISOString();
          updateData.notes = JSON.stringify(notesObj);
        }
      }

      return tx.order.update({
        where: { id: order.id },
        data: updateData,
      });
    });

    return NextResponse.json({
      success: true,
      order: {
        id: updated.id,
        orderNumber: updated.orderNumber,
        status: updated.status,
        paymentStatus: updated.paymentStatus,
      },
    });
  } catch (err) {
    console.error('[PATCH /api/admin/orders/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
