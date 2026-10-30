import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { verifyPaymentSignature, getRazorpayClient } from '@/lib/razorpay';

interface VerifyBody {
  orderId: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  method?: string;
  paymentMethodType?: string;
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

    const body = (await req.json()) as VerifyBody;
    const orderId = body.orderId;
    const razorpay_order_id = body.razorpay_order_id || body.razorpayOrderId;
    const razorpay_payment_id = body.razorpay_payment_id || body.razorpayPaymentId;
    const razorpay_signature = body.razorpay_signature || body.razorpaySignature;
    const method = body.method || body.paymentMethodType;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required Razorpay payment credentials.' },
        { status: 400 }
      );
    }

    // 1. Fetch order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // 2. Strict Customer Isolation: Customer cannot verify or modify another customer's order
    if (order.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to verify this order.' },
        { status: 403 }
      );
    }

    // 3. Duplicate Payment Processing Guard
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
        },
      });
    }

    // 4. Cryptographic HMAC SHA-256 Signature Verification
    const isSignatureValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isSignatureValid) {
      console.warn(`[Razorpay] Invalid payment signature for order ${order.orderNumber}`);
      return NextResponse.json(
        { error: 'Invalid payment signature. Verification failed on server.' },
        { status: 400 }
      );
    }

    // Optional: fetch real payment details from Razorpay if live/test credentials are active
    let paymentMethodDetail = method || 'online';
    const rzp = getRazorpayClient();
    if (rzp && !process.env.RAZORPAY_KEY_ID?.includes('placeholder')) {
      try {
        const paymentInfo = await rzp.payments.fetch(razorpay_payment_id);
        if (paymentInfo && typeof paymentInfo.method === 'string') {
          paymentMethodDetail = paymentInfo.method;
        }
      } catch (e) {
        console.warn('Could not fetch payment method detail from Razorpay API', e);
      }
    }

    // 5. Update Order to Paid Atomically
    let existingNotes: Record<string, unknown> = {};
    try {
      if (order.notes) existingNotes = JSON.parse(order.notes);
    } catch {
      existingNotes = {};
    }

    const updatedNotes = JSON.stringify({
      ...existingNotes,
      paymentMethod: 'RAZORPAY',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentMethodType: paymentMethodDetail,
      paymentDate: new Date().toISOString(),
      refundStatus: null,
    });

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Clear server cart items for user
      const userCart = await tx.cart.findUnique({ where: { userId: session.userId } });
      if (userCart) {
        await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
      }

      return tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid',
          status: 'confirmed',
          notes: updatedNotes,
        },
      });
    });

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
      },
    });
  } catch (err: unknown) {
    console.error('[POST /api/payment/razorpay/verify]', err);
    return NextResponse.json({ error: 'Server payment verification error.' }, { status: 500 });
  }
}
