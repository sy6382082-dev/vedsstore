import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { isLiveMode } from '@/lib/razorpay';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isLiveMode()) {
      return NextResponse.json(
        { error: 'Test signatures are disabled in live production mode.' },
        { status: 403 }
      );
    }

    const body = (await req.json()) as { orderId: string; paymentId: string };
    const { orderId, paymentId } = body;

    if (!orderId || !paymentId) {
      return NextResponse.json({ error: 'orderId and paymentId are required' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dev_razorpay_secret_key_testing';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${orderId}|${paymentId}`);
    const signature = hmac.digest('hex');

    return NextResponse.json({ signature });
  } catch (err) {
    console.error('[POST /api/payment/razorpay/test-signature]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

