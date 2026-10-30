import { NextResponse } from 'next/server';
import { getRazorpayPublicKey, isRazorpayConfigured, isLiveMode } from '@/lib/razorpay';

export async function GET() {
  const isConfigured = isRazorpayConfigured();
  const live = isLiveMode();
  const keyId = getRazorpayPublicKey();

  return NextResponse.json({
    keyId: isConfigured ? keyId : 'rzp_test_placeholder_key',
    isConfigured,
    isLiveMode: live,
    supportedMethods: ['upi', 'card', 'netbanking', 'wallet'],
    mode: live ? 'live' : 'test',
  });
}

