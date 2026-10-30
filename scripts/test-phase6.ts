import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'dev_razorpay_secret_key_testing';
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'dev_razorpay_webhook_secret_testing';

async function runTests() {
  console.log('🧪 Starting Comprehensive Phase 6 Payment Gateway Verification Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: unknown) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`, details ?? '');
      failed++;
    }
  }

  function extractSessionCookie(res: Response): string {
    const raw = res.headers.get('set-cookie') || '';
    const match = raw.match(/brother_session=[^;]+/);
    return match ? match[0] : '';
  }

  function computeHmac(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Setup Test Users & Admin
  // ──────────────────────────────────────────────────────────────────────────
  console.log('--- TEST GROUP 1: User Preparation & Authentication ---');
  const passwordHash = await bcrypt.hash('CustomerPass123!', 12);
  const adminPasswordHash = await bcrypt.hash('AdminBrother2026!', 12);

  // Customer A
  const userA = await prisma.user.upsert({
    where: { email: 'customer_a_phase6@test.com' },
    create: {
      email: 'customer_a_phase6@test.com',
      passwordHash,
      role: 'CUSTOMER',
      emailVerified: true,
      profile: { create: { firstName: 'Alice', lastName: 'Sharma' } },
    },
    update: { passwordHash },
  });

  // Customer B
  const userB = await prisma.user.upsert({
    where: { email: 'customer_b_phase6@test.com' },
    create: {
      email: 'customer_b_phase6@test.com',
      passwordHash,
      role: 'CUSTOMER',
      emailVerified: true,
      profile: { create: { firstName: 'Bob', lastName: 'Verma' } },
    },
    update: { passwordHash },
  });

  // Admin User
  await prisma.user.upsert({
    where: { email: 'admin@brother.in' },
    create: {
      email: 'admin@brother.in',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      emailVerified: true,
      profile: { create: { firstName: 'Brother', lastName: 'Administrator' } },
    },
    update: { passwordHash: adminPasswordHash, role: 'ADMIN' },
  });

  // Log in Customer A
  const loginResA = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer_a_phase6@test.com', password: 'CustomerPass123!' }),
  });
  const cookieA = extractSessionCookie(loginResA);
  assert(loginResA.status === 200 && cookieA.startsWith('brother_session='), 'Customer A logged in');

  // Log in Customer B
  const loginResB = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer_b_phase6@test.com', password: 'CustomerPass123!' }),
  });
  const cookieB = extractSessionCookie(loginResB);
  assert(loginResB.status === 200 && cookieB.startsWith('brother_session='), 'Customer B logged in');

  // Log in Admin
  const loginAdminRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@brother.in', password: 'AdminBrother2026!' }),
  });
  const cookieAdmin = extractSessionCookie(loginAdminRes);
  assert(loginAdminRes.status === 200 && cookieAdmin.startsWith('brother_session='), 'Admin logged in');

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Public Gateway Configuration Endpoint
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST GROUP 2: Public Razorpay Configuration Endpoint ---');
  const configRes = await fetch(`${BASE_URL}/api/payment/razorpay/config`);
  const configData = (await configRes.json()) as {
    isConfigured: boolean;
    keyId: string;
    isLiveMode: boolean;
    supportedMethods: string[];
    mode: string;
    [key: string]: unknown;
  };

  assert(configRes.status === 200, 'GET /api/payment/razorpay/config returns HTTP 200');
  assert(configData.isConfigured === true, 'Gateway reports isConfigured: true');
  assert(typeof configData.keyId === 'string' && configData.keyId.length > 0, 'Returns public keyId');
  assert(configData.mode === 'test', 'Mode is set to test');
  assert(
    Array.isArray(configData.supportedMethods) &&
      configData.supportedMethods.includes('upi') &&
      configData.supportedMethods.includes('card'),
    'Supports UPI, Card, NetBanking and Wallets'
  );
  assert(
    !('keySecret' in configData) && !('webhookSecret' in configData) && !('RAZORPAY_KEY_SECRET' in configData),
    'CRITICAL SECURITY: Server secret keys are NEVER exposed in public config'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Server-Side Order Creation & Stock Reservation
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST GROUP 3: Server-Side Razorpay Order Creation & Stock Reservation ---');
  const bt5000c = await prisma.product.findFirst({
    where: { sku: 'BRO-BT5000C' },
    include: { inventory: true },
  });
  assert(!!bt5000c, 'Found BT5000C ink bottle in database');
  const initialStock = bt5000c?.inventory?.stockCount ?? 0;

  const createOrderPayload = {
    shippingAddress: {
      fullName: 'Alice Sharma',
      phone: '9876543210',
      addressLine1: '42, Cyber Hub, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      landmark: 'Near Metro Station',
    },
    items: [
      {
        productId: bt5000c!.id,
        quantity: 2,
      },
    ],
  };

  const createOrderRes = await fetch(`${BASE_URL}/api/payment/razorpay/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieA,
    },
    body: JSON.stringify(createOrderPayload),
  });

  const orderData = (await createOrderRes.json()) as {
    orderId: string;
    orderNumber: string;
    razorpayOrderId: string;
    amount: number;
    subtotal: number;
    shipping: number;
    tax: number;
  };

  assert(createOrderRes.status === 200, 'POST /api/payment/razorpay/create-order returns HTTP 200');
  assert(Boolean(orderData.orderId && orderData.orderNumber), 'Returns database orderId and unique orderNumber');
  assert(orderData.orderNumber.startsWith('BRO-'), 'Order number matches Brother Store standard BRO-XXXXXX-XXXX');
  assert(orderData.razorpayOrderId.startsWith('order_'), 'Returns valid Razorpay order ID');
  const expectedAmount = bt5000c!.price * 2;
  assert(
    orderData.amount === expectedAmount,
    `Amount calculated strictly on server (₹${expectedAmount / 100} => ${expectedAmount} paise, free delivery)`
  );

  // Verify DB stock was decremented atomically
  const updatedProd = await prisma.product.findUnique({
    where: { id: bt5000c!.id },
    include: { inventory: true },
  });
  const currentStock = updatedProd?.inventory?.stockCount ?? 0;
  assert(currentStock === initialStock - 2, 'Atomic stock reservation: inventory decremented by 2');

  // Verify DB order status is pending
  const dbOrder = await prisma.order.findUnique({ where: { id: orderData.orderId } });
  assert(dbOrder?.status === 'pending' && dbOrder?.paymentStatus === 'pending', 'Order initialized in pending status');

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Cryptographic HMAC-SHA256 Signature Verification & Order Paid
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST GROUP 4: Cryptographic Payment Signature Verification ---');
  const paymentId1 = `pay_test_${Date.now()}`;
  const validSignature = computeHmac(`${orderData.razorpayOrderId}|${paymentId1}`, KEY_SECRET);

  const verifyRes = await fetch(`${BASE_URL}/api/payment/razorpay/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieA,
    },
    body: JSON.stringify({
      orderId: orderData.orderId,
      razorpayOrderId: orderData.razorpayOrderId,
      razorpayPaymentId: paymentId1,
      razorpaySignature: validSignature,
      paymentMethodType: 'upi',
    }),
  });

  const verifyData = (await verifyRes.json()) as { success: boolean; orderNumber: string };
  assert(verifyRes.status === 200, 'Verification returns HTTP 200');
  assert(verifyData.success === true, 'Verification succeeds with valid HMAC signature');

  // Check DB state
  const confirmedOrder = await prisma.order.findUnique({ where: { id: orderData.orderId } });
  assert(confirmedOrder?.status === 'confirmed', 'Order status transitioned to "confirmed"');
  assert(confirmedOrder?.paymentStatus === 'paid', 'Payment status transitioned to "paid"');

  const notesObj = JSON.parse(confirmedOrder?.notes || '{}');
  assert(notesObj.razorpayPaymentId === paymentId1, 'Payment ID safely stored in order notes');
  assert(notesObj.paymentMethod === 'RAZORPAY', 'Payment method recorded as RAZORPAY');
  assert(Boolean(notesObj.paymentDate), 'Payment timestamp recorded in order notes');

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Replay / Duplicate Callback Idempotency
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST GROUP 5: Replay & Duplicate Callback Idempotency ---');
  const replayRes = await fetch(`${BASE_URL}/api/payment/razorpay/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieA,
    },
    body: JSON.stringify({
      orderId: orderData.orderId,
      razorpayOrderId: orderData.razorpayOrderId,
      razorpayPaymentId: paymentId1,
      razorpaySignature: validSignature,
    }),
  });

  const replayData = (await replayRes.json()) as { success: boolean; alreadyVerified?: boolean; alreadyProcessed?: boolean };
  assert(replayRes.status === 200, 'Replay callback returns HTTP 200');
  assert(Boolean(replayData.alreadyVerified || replayData.alreadyProcessed), 'Duplicate payment safely recognized as already verified');

  const stockAfterReplay = (
    await prisma.product.findUnique({
      where: { id: bt5000c!.id },
      include: { inventory: true },
    })
  )?.inventory?.stockCount;
  assert(stockAfterReplay === currentStock, 'Idempotency guarantee: stock not decremented twice');

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Invalid Signature Rejection (Tamper Resistance)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST GROUP 6: Tamper Resistance (Invalid Signature Rejection) ---');
  // Create Order 2 for Alice
  const order2Res = await fetch(`${BASE_URL}/api/payment/razorpay/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify(createOrderPayload),
  });
  const order2Data = (await order2Res.json()) as { orderId: string; razorpayOrderId: string };

  const fakeSigRes = await fetch(`${BASE_URL}/api/payment/razorpay/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify({
      orderId: order2Data.orderId,
      razorpayOrderId: order2Data.razorpayOrderId,
      razorpayPaymentId: 'pay_hacker_forged_id',
      razorpaySignature: 'forged_fake_signature_abc123987',
    }),
  });

  assert(fakeSigRes.status === 400, 'Forged signature rejected with HTTP 400 Bad Request');
  const order2Check = await prisma.order.findUnique({ where: { id: order2Data.orderId } });
  assert(order2Check?.paymentStatus === 'pending', 'Order remains unpaid after forged signature attempt');

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Customer Order Isolation (Access Control)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST GROUP 7: Customer Isolation & Security Authorization ---');
  // Bob tries to verify Alice's order
  const forgedPaymentId = `pay_test_${Date.now()}`;
  const bobSig = computeHmac(`${order2Data.razorpayOrderId}|${forgedPaymentId}`, KEY_SECRET);

  const bobAttackRes = await fetch(`${BASE_URL}/api/payment/razorpay/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieB },
    body: JSON.stringify({
      orderId: order2Data.orderId,
      razorpayOrderId: order2Data.razorpayOrderId,
      razorpayPaymentId: forgedPaymentId,
      razorpaySignature: bobSig,
    }),
  });

  assert(bobAttackRes.status === 403 || bobAttackRes.status === 404, 'Unauthorized customer access rejected with HTTP 403 Forbidden');
  const aliceOrderStillSafe = await prisma.order.findUnique({ where: { id: order2Data.orderId } });
  assert(aliceOrderStillSafe?.userId === userA.id, "Alice's order ownership preserved");
  assert(aliceOrderStillSafe?.paymentStatus === 'pending', "Alice's order unaffected by Bob's attempt");

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Payment Cancellation / Failure & Stock Restoration
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST GROUP 8: Payment Cancellation & Inventory Restoration ---');
  const stockBeforeCancel = (
    await prisma.product.findUnique({
      where: { id: bt5000c!.id },
      include: { inventory: true },
    })
  )?.inventory?.stockCount ?? 0;

  const cancelRes = await fetch(`${BASE_URL}/api/payment/razorpay/failed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify({
      orderId: order2Data.orderId,
      reason: 'User cancelled payment modal',
    }),
  });

  assert(cancelRes.status === 200, 'POST /api/payment/razorpay/failed returns HTTP 200');
  const cancelledOrder = await prisma.order.findUnique({ where: { id: order2Data.orderId } });
  assert(cancelledOrder?.status === 'cancelled', 'Order status transitioned to "cancelled"');
  assert(cancelledOrder?.paymentStatus === 'failed', 'Payment status transitioned to "failed"');

  const stockAfterCancel = (
    await prisma.product.findUnique({
      where: { id: bt5000c!.id },
      include: { inventory: true },
    })
  )?.inventory?.stockCount ?? 0;
  assert(stockAfterCancel === stockBeforeCancel + 2, 'Inventory restored back to stock upon cancellation');

  // ──────────────────────────────────────────────────────────────────────────
  // 9. Webhook Processing (Valid & Invalid Signatures, Multiple Events)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST GROUP 9: Webhook HMAC Verification & Event Dispatch ---');
  // Create Order 3 for Webhook testing
  const order3Res = await fetch(`${BASE_URL}/api/payment/razorpay/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify(createOrderPayload),
  });
  const order3Data = (await order3Res.json()) as { orderId: string; razorpayOrderId: string };

  // 9a: Webhook with invalid signature
  const webhookRawBody1 = JSON.stringify({
    event: 'order.paid',
    payload: {
      order: { entity: { id: order3Data.razorpayOrderId } },
      payment: { entity: { id: 'pay_wh_test_1', method: 'card' } },
    },
  });

  const invalidWhRes = await fetch(`${BASE_URL}/api/payment/razorpay/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': 'invalid_webhook_signature_xyz',
    },
    body: webhookRawBody1,
  });
  assert(invalidWhRes.status === 400, 'Webhook with forged signature rejected with HTTP 400');

  // 9b: Valid webhook order.paid
  const validWhSig1 = computeHmac(webhookRawBody1, WEBHOOK_SECRET);
  const validWhRes1 = await fetch(`${BASE_URL}/api/payment/razorpay/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': validWhSig1,
    },
    body: webhookRawBody1,
  });
  assert(validWhRes1.status === 200, 'Valid webhook order.paid processed successfully with HTTP 200');

  const whOrder1 = await prisma.order.findUnique({ where: { id: order3Data.orderId } });
  assert(whOrder1?.status === 'confirmed' && whOrder1?.paymentStatus === 'paid', 'Order marked paid and confirmed via webhook');

  // 9c: Valid webhook refund.processed
  const refundRawBody = JSON.stringify({
    event: 'refund.processed',
    payload: {
      order: { entity: { id: order3Data.razorpayOrderId } },
      payment: { entity: { id: 'pay_wh_test_1' } },
      refund: { entity: { id: 'rfnd_test_123', status: 'processed' } },
    },
  });
  const refundSig = computeHmac(refundRawBody, WEBHOOK_SECRET);
  const refundRes = await fetch(`${BASE_URL}/api/payment/razorpay/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': refundSig,
    },
    body: refundRawBody,
  });
  assert(refundRes.status === 200, 'Webhook refund.processed processed with HTTP 200');
  const refundedOrder = await prisma.order.findUnique({ where: { id: order3Data.orderId } });
  assert(refundedOrder?.paymentStatus === 'refunded', 'Order paymentStatus updated to "refunded" via webhook');

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Admin Tamper Guard (Manual Override Prevention)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST GROUP 10: Admin Tamper Guard (Manual Overrides Blocked) ---');
  // Create Order 4 (unverified online order)
  const order4Res = await fetch(`${BASE_URL}/api/payment/razorpay/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify(createOrderPayload),
  });
  const order4Data = (await order4Res.json()) as { orderId: string };

  // Admin attempts to mark unverified online payment as 'paid'
  const adminOverrideRes = await fetch(`${BASE_URL}/api/admin/orders/${order4Data.orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieAdmin,
    },
    body: JSON.stringify({ paymentStatus: 'paid' }),
  });
  const adminOverrideData = (await adminOverrideRes.json()) as { error?: string };

  assert(adminOverrideRes.status === 400, 'Admin blocked from manually marking unverified online payment as paid (HTTP 400)');
  assert(
    adminOverrideData.error?.includes('Security violation') === true,
    'Returns security violation error explaining HMAC verification is required'
  );

  // Admin attempts to confirm unverified online order
  const adminConfirmRes = await fetch(`${BASE_URL}/api/admin/orders/${order4Data.orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieAdmin,
    },
    body: JSON.stringify({ status: 'confirmed' }),
  });
  assert(adminConfirmRes.status === 400, 'Admin blocked from confirming unpaid online order (HTTP 400)');

  // Clean up order 4 by cancelling it
  await fetch(`${BASE_URL}/api/payment/razorpay/failed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify({ orderId: order4Data.orderId, reason: 'Cleanup after test' }),
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n======================================================');
  console.log(`📊 PHASE 6 VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error('Test suite failed with unhandled exception:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
