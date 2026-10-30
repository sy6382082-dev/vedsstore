import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-razorpay-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature header' }, { status: 400 });
    }

    const rawBody = await req.text();

    // 1. Verify Webhook Signature via HMAC SHA-256
    const isValid = verifyWebhookSignature({ rawBody, signature });
    if (!isValid) {
      console.warn('[Razorpay Webhook] Invalid webhook signature detected');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody) as {
      event: string;
      payload?: {
        payment?: {
          entity?: {
            id: string;
            order_id?: string;
            amount: number;
            currency: string;
            status: string;
            method?: string;
            notes?: Record<string, string>;
          };
        };
        order?: {
          entity?: {
            id: string;
            receipt?: string;
            status: string;
            notes?: Record<string, string>;
          };
        };
        refund?: {
          entity?: {
            id: string;
            payment_id: string;
            amount: number;
            status: string;
          };
        };
      };
    };

    const eventType = event.event;
    const paymentEntity = event.payload?.payment?.entity;
    const orderEntity = event.payload?.order?.entity;

    // Resolve order from receipt, notes.orderNumber, notes.orderId, or razorpayOrderId
    const orderNumberOrId =
      orderEntity?.receipt ||
      orderEntity?.notes?.orderNumber ||
      paymentEntity?.notes?.orderNumber;
    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;

    if (!orderNumberOrId && !razorpayOrderId) {
      return NextResponse.json({ received: true, note: 'No matching order identifier found' });
    }

    // Find the order in DB
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(orderNumberOrId ? [{ orderNumber: orderNumberOrId }, { id: orderNumberOrId }] : []),
          ...(razorpayOrderId ? [{ notes: { contains: razorpayOrderId } }] : []),
        ],
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
      console.warn(`[Razorpay Webhook] Order not found for identifier: ${orderNumberOrId || razorpayOrderId}`);
      return NextResponse.json({ received: true, note: 'Order not found in database' });
    }

    // 2. Handle Event Types
    if (eventType === 'order.paid' || eventType === 'payment.captured') {
      // Duplicate payment guard
      if (order.paymentStatus === 'paid') {
        return NextResponse.json({ received: true, alreadyProcessed: true });
      }

      let existingNotes: Record<string, unknown> = {};
      try {
        if (order.notes) existingNotes = JSON.parse(order.notes);
      } catch {
        existingNotes = {};
      }

      const updatedNotes = JSON.stringify({
        ...existingNotes,
        paymentMethod: 'RAZORPAY',
        razorpayOrderId: razorpayOrderId || existingNotes.razorpayOrderId,
        razorpayPaymentId: paymentEntity?.id || existingNotes.razorpayPaymentId,
        paymentMethodType: paymentEntity?.method || 'online',
        paymentDate: new Date().toISOString(),
        webhookProcessed: true,
      });

      await prisma.$transaction(async (tx) => {
        // Clear server cart items for user
        const userCart = await tx.cart.findUnique({ where: { userId: order.userId } });
        if (userCart) {
          await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'paid',
            status: 'confirmed',
            notes: updatedNotes,
          },
        });
      });

      console.log(`[Razorpay Webhook] Successfully marked order ${order.orderNumber} as PAID`);
    } else if (eventType === 'payment.failed') {
      if (order.paymentStatus !== 'paid') {
        // Safely restore inventory if payment failed
        await prisma.$transaction(async (tx) => {
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

          await tx.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'failed',
              status: 'cancelled',
              notes: JSON.stringify({
                ...existingNotes,
                webhookFailedAt: new Date().toISOString(),
              }),
            },
          });
        });
      }
    } else if (eventType === 'refund.processed') {
      let existingNotes: Record<string, unknown> = {};
      try {
        if (order.notes) existingNotes = JSON.parse(order.notes);
      } catch {
        existingNotes = {};
      }

      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'refunded',
          notes: JSON.stringify({
            ...existingNotes,
            refundStatus: 'processed',
            refundId: event.payload?.refund?.entity?.id,
            refundAmount: event.payload?.refund?.entity?.amount,
            refundDate: new Date().toISOString(),
          }),
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error('[POST /api/payment/razorpay/webhook]', err);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}

