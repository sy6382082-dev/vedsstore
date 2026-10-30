import crypto from 'crypto';
import Razorpay from 'razorpay';

export function getRazorpayClient(): Razorpay | null {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret || !key_id.startsWith('rzp_')) {
    return null;
  }

  return new Razorpay({ key_id, key_secret });
}

export function isRazorpayConfigured(): boolean {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  return Boolean(key_id && key_secret && key_id.startsWith('rzp_'));
}

export function isLiveMode(): boolean {
  const key_id = process.env.RAZORPAY_KEY_ID;
  return Boolean(key_id && key_id.startsWith('rzp_live_'));
}

export function getRazorpayPublicKey(): string {
  return process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key';
}

/**
 * Verifies Razorpay payment signature using HMAC SHA-256 with constant-time equality check.
 * Algorithm: HMAC_SHA256(order_id + "|" + payment_id, secret) == signature
 */
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'dev_razorpay_secret_key_testing';
  if (!secret || !signature || !orderId || !paymentId) {
    return false;
  }

  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');

    const genBuf = Buffer.from(generatedSignature, 'utf-8');
    const sigBuf = Buffer.from(signature, 'utf-8');

    if (genBuf.length !== sigBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(genBuf, sigBuf);
  } catch (err) {
    console.error('Signature verification error', err);
    return false;
  }
}

/**
 * Verifies Razorpay webhook signature using HMAC SHA-256.
 * Algorithm: HMAC_SHA256(raw_body, webhook_secret) == x-razorpay-signature
 */
export function verifyWebhookSignature({
  rawBody,
  signature,
}: {
  rawBody: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dev_razorpay_webhook_secret_testing';
  if (!secret || !signature || !rawBody) {
    return false;
  }

  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest('hex');

    const expBuf = Buffer.from(expectedSignature, 'utf-8');
    const sigBuf = Buffer.from(signature, 'utf-8');

    if (expBuf.length !== sigBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expBuf, sigBuf);
  } catch (err) {
    console.error('Webhook signature verification error', err);
    return false;
  }
}

