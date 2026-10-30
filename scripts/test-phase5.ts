import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting Comprehensive Phase 5 Verification Suite...\n');

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

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Prepare test users
  // ──────────────────────────────────────────────────────────────────────────
  console.log('--- TEST GROUP 1: User Preparation ---');
  const passwordHash = await bcrypt.hash('CustomerPass123!', 12);

  // Customer A
  await prisma.user.upsert({
    where: { email: 'customer_a@test.com' },
    create: {
      email: 'customer_a@test.com',
      passwordHash,
      role: 'CUSTOMER',
      emailVerified: true,
      profile: { create: { firstName: 'Alice', lastName: 'Sharma' } },
    },
    update: { passwordHash },
  });

  // Customer B
  await prisma.user.upsert({
    where: { email: 'customer_b@test.com' },
    create: {
      email: 'customer_b@test.com',
      passwordHash,
      role: 'CUSTOMER',
      emailVerified: true,
      profile: { create: { firstName: 'Bob', lastName: 'Verma' } },
    },
    update: { passwordHash },
  });

  // Log in Customer A
  const loginResA = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer_a@test.com', password: 'CustomerPass123!' }),
  });
  const cookieA = extractSessionCookie(loginResA);
  assert(loginResA.status === 200 && cookieA.startsWith('brother_session='), 'Customer A authenticated successfully');

  // Log in Customer B
  const loginResB = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer_b@test.com', password: 'CustomerPass123!' }),
  });
  const cookieB = extractSessionCookie(loginResB);
  assert(loginResB.status === 200 && cookieB.startsWith('brother_session='), 'Customer B authenticated successfully');

  // Log in Admin
  const loginAdminRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@brother.in', password: 'AdminBrother2026!', adminOnly: true }),
  });
  const cookieAdmin = extractSessionCookie(loginAdminRes);
  assert(loginAdminRes.status === 200 && cookieAdmin.startsWith('brother_session='), 'Admin authenticated successfully');

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Shopping Cart Persistence & Merging
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST GROUP 2: Shopping Cart Persistence & Merging ---');
  // Clear cart first
  await fetch(`${BASE_URL}/api/account/cart`, { method: 'DELETE', headers: { cookie: cookieA } });

  // Guest had Cyan ink bottle in local cart; upon login, merge action is dispatched
  const cyanProduct = await prisma.product.findUnique({ where: { slug: 'brother-bt5000c' } });
  const mergeRes = await fetch(`${BASE_URL}/api/account/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieA },
    body: JSON.stringify({
      action: 'merge',
      items: [{ productId: cyanProduct!.id, quantity: 2 }],
    }),
  });
  const mergeData = await mergeRes.json();
  assert(
    mergeRes.status === 200 &&
      mergeData.items.some(
        (i: { product: { slug: string }; quantity: number }) =>
          i.product.slug === 'brother-bt5000c' && i.quantity === 2
      ),
    'Guest cart merged into logged-in user cart without duplication',
    mergeData
  );

  // Fetch persisted cart for Customer A
  const getCartRes = await fetch(`${BASE_URL}/api/account/cart`, { headers: { cookie: cookieA } });
  const getCartData = await getCartRes.json();
  assert(
    getCartRes.status === 200 && getCartData.items?.length === 1,
    'Cart persisted across sessions on the server',
    getCartData
  );

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Checkout Validation & Error Handling
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST GROUP 3: Checkout Validation & Error Handling ---');
  // Reject order if mobile number is invalid
  const invalidPhoneRes = await fetch(`${BASE_URL}/api/checkout/place-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieA },
    body: JSON.stringify({
      shippingAddress: {
        fullName: 'Alice Sharma',
        phone: '123', // Invalid
        addressLine1: 'Flat 402, Lotus Towers',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400051',
      },
      paymentMethod: 'COD',
      items: [{ productId: cyanProduct!.id, quantity: 1 }],
    }),
  });
  const invalidPhoneData = await invalidPhoneRes.json();
  assert(
    invalidPhoneRes.status === 400 && invalidPhoneData.error.includes('10-digit'),
    'Server rejects invalid phone number with clear validation message',
    invalidPhoneData
  );

  // Reject order if PIN code is invalid
  const invalidPinRes = await fetch(`${BASE_URL}/api/checkout/place-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieA },
    body: JSON.stringify({
      shippingAddress: {
        fullName: 'Alice Sharma',
        phone: '9876543210',
        addressLine1: 'Flat 402, Lotus Towers',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '123', // Invalid PIN
      },
      paymentMethod: 'COD',
      items: [{ productId: cyanProduct!.id, quantity: 1 }],
    }),
  });
  const invalidPinData = await invalidPinRes.json();
  assert(
    invalidPinRes.status === 400 && invalidPinData.error.includes('PIN'),
    'Server rejects invalid PIN code with clear validation message',
    invalidPinData
  );

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Order Creation & Inventory Deduction (Regular Product)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST GROUP 4: Regular Product Order Placement & Inventory Deduction ---');
  const cyanInvBefore = await prisma.inventory.findUnique({ where: { productId: cyanProduct!.id } });
  const initialCyanStock = cyanInvBefore!.stockCount;

  const orderRes = await fetch(`${BASE_URL}/api/checkout/place-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieA },
    body: JSON.stringify({
      shippingAddress: {
        fullName: 'Alice Sharma',
        phone: '9876543210',
        addressLine1: 'Flat 402, Lotus Towers, BKC',
        landmark: 'Near City Mall',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400051',
      },
      paymentMethod: 'COD',
      items: [{ productId: cyanProduct!.id, quantity: 2 }],
      idempotencyKey: 'idemp-test-order-1',
    }),
  });
  const orderData = await orderRes.json();
  assert(orderRes.status === 200 && orderData.success === true, 'Regular order placed successfully', orderData);
  assert(
    orderData.order?.orderNumber?.startsWith('BRO-'),
    'Generated unique order number starting with BRO-',
    orderData.order
  );

  const cyanInvAfter = await prisma.inventory.findUnique({ where: { productId: cyanProduct!.id } });
  assert(
    cyanInvAfter!.stockCount === initialCyanStock - 2,
    `Inventory deducted accurately: was ${initialCyanStock}, now ${cyanInvAfter!.stockCount}`
  );

  const orderAId = orderData.order.id;

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Four-Bottle Bundle Order Placement & Atomic Multi-Component Inventory
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST GROUP 5: 4-Bottle Bundle Atomic Component Deduction ---');
  const bundleProduct = await prisma.product.findUnique({
    where: { slug: 'brother-bt5000-set4' },
    include: {
      bundleParentItems: {
        include: { componentProduct: { include: { inventory: true } } },
      },
    },
  });

  const componentsBefore = bundleProduct!.bundleParentItems.map((bi) => ({
    name: bi.componentProduct.name,
    id: bi.componentProduct.id,
    stock: bi.componentProduct.inventory!.stockCount,
  }));

  const bundleOrderRes = await fetch(`${BASE_URL}/api/checkout/place-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieA },
    body: JSON.stringify({
      shippingAddress: {
        fullName: 'Alice Sharma',
        phone: '9876543210',
        addressLine1: 'Flat 402, Lotus Towers, BKC',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400051',
      },
      paymentMethod: 'COD',
      items: [{ productId: bundleProduct!.id, quantity: 1 }],
      idempotencyKey: 'idemp-test-bundle-order',
    }),
  });
  const bundleOrderData = await bundleOrderRes.json();
  assert(
    bundleOrderRes.status === 200 && bundleOrderData.success === true,
    'Bundle order placed successfully',
    bundleOrderData
  );

  const bundleOrderAId = bundleOrderData.order.id;

  // Check all 4 component inventories
  for (const comp of componentsBefore) {
    const updatedComp = await prisma.inventory.findUnique({ where: { productId: comp.id } });
    assert(
      updatedComp!.stockCount === comp.stock - 1,
      `Component "${comp.name}" atomically decremented by 1 (was ${comp.stock}, now ${updatedComp!.stockCount})`
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Duplicate Submission / Idempotency Prevention
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST GROUP 6: Duplicate Submission Prevention ---');
  const duplicateRes = await fetch(`${BASE_URL}/api/checkout/place-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieA },
    body: JSON.stringify({
      shippingAddress: {
        fullName: 'Alice Sharma',
        phone: '9876543210',
        addressLine1: 'Flat 402, Lotus Towers, BKC',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400051',
      },
      paymentMethod: 'COD',
      items: [{ productId: bundleProduct!.id, quantity: 1 }],
      idempotencyKey: 'idemp-test-bundle-order', // SAME IDEMPOTENCY KEY
    }),
  });
  const duplicateData = await duplicateRes.json();
  assert(
    duplicateRes.status === 200 && duplicateData.duplicatePrevented === true,
    'Duplicate submission intercepted safely via idempotency guard',
    duplicateData
  );

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Customer Isolation & Security
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST GROUP 7: Customer Isolation & Access Security ---');
  // Customer A accesses their own order
  const custAOrderRes = await fetch(`${BASE_URL}/api/account/orders/${orderAId}`, {
    headers: { cookie: cookieA },
  });
  assert(custAOrderRes.status === 200, 'Customer A can view their own order details');

  // Customer B tries to access Customer A's order
  const custBOrderRes = await fetch(`${BASE_URL}/api/account/orders/${orderAId}`, {
    headers: { cookie: cookieB },
  });
  assert(
    custBOrderRes.status === 404,
    'Customer B CANNOT access Customer A order (Returned 404 Not Found)'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Order Cancellation & Safe Inventory Restoration
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST GROUP 8: Order Cancellation & Inventory Restoration ---');
  const cancelRes = await fetch(`${BASE_URL}/api/account/orders/${bundleOrderAId}/cancel`, {
    method: 'POST',
    headers: { cookie: cookieA },
  });
  const cancelData = await cancelRes.json();
  assert(
    cancelRes.status === 200 && cancelData.success === true,
    'Customer cancelled order successfully',
    cancelData
  );

  // Verify bundle components are restored
  for (const comp of componentsBefore) {
    const restoredComp = await prisma.inventory.findUnique({ where: { productId: comp.id } });
    assert(
      restoredComp!.stockCount === comp.stock,
      `Component "${comp.name}" stock safely restored (back to ${restoredComp!.stockCount})`
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 9. Admin Order Management Dashboard
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST GROUP 9: Admin Order Management & Authorization ---');
  // Customer A tries to access admin orders endpoint
  const unauthorizedAdminRes = await fetch(`${BASE_URL}/api/admin/orders`, {
    headers: { cookie: cookieA },
  });
  assert(
    unauthorizedAdminRes.status === 403,
    'Customer cannot access /api/admin/orders (403 Forbidden)'
  );

  // Admin accesses /api/admin/orders
  const adminOrdersRes = await fetch(`${BASE_URL}/api/admin/orders`, {
    headers: { cookie: cookieAdmin },
  });
  const adminOrdersData = await adminOrdersRes.json();
  assert(
    adminOrdersRes.status === 200 &&
      Array.isArray(adminOrdersData.orders) &&
      adminOrdersData.orders.length > 0,
    `Admin can list all customer orders (${adminOrdersData.orders?.length} orders found)`,
    adminOrdersData.metrics
  );

  // Admin updates order status to 'confirmed'
  const adminUpdateRes = await fetch(`${BASE_URL}/api/admin/orders/${orderAId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', cookie: cookieAdmin },
    body: JSON.stringify({ status: 'confirmed' }),
  });
  const adminUpdateData = await adminUpdateRes.json();
  assert(
    adminUpdateRes.status === 200 && adminUpdateData.order?.status === 'confirmed',
    'Admin successfully updated order status to "confirmed"',
    adminUpdateData
  );

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests()
  .catch((e) => {
    console.error('Test runner encountered an error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
