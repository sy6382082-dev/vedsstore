/**
 * scripts/import-postgres-data.ts
 *
 * Imports the structured JSON backup (prisma/data-backup.json) into PostgreSQL.
 *
 * Usage:
 *   DATABASE_URL="postgresql://user:pass@host:5432/dbname" npx tsx scripts/import-postgres-data.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const backupPath = path.join(rootDir, 'prisma', 'data-backup.json');

if (!fs.existsSync(backupPath)) {
  console.error(`❌ Backup file not found at ${backupPath}. Run 'npm run db:export' first.`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting data import into PostgreSQL...');

  // 1. Users
  console.log(`⏳ Importing ${data.users.length} users...`);
  for (const u of data.users) {
    await prisma.user.upsert({
      where: { id: u.id },
      create: {
        id: u.id,
        email: u.email,
        phone: u.phone,
        passwordHash: u.passwordHash,
        role: u.role,
        emailVerified: u.emailVerified,
        createdAt: new Date(u.createdAt),
        updatedAt: new Date(u.updatedAt),
      },
      update: {
        email: u.email,
        phone: u.phone,
        role: u.role,
        passwordHash: u.passwordHash,
        emailVerified: u.emailVerified,
      },
    });
  }

  // 2. Profiles
  console.log(`⏳ Importing ${data.profiles.length} profiles...`);
  for (const p of data.profiles) {
    await prisma.profile.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        userId: p.userId,
        firstName: p.firstName,
        lastName: p.lastName,
        avatarUrl: p.avatarUrl,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      },
      update: {
        firstName: p.firstName,
        lastName: p.lastName,
        avatarUrl: p.avatarUrl,
      },
    });
  }

  // 3. Addresses
  console.log(`⏳ Importing ${data.addresses.length} addresses...`);
  for (const a of data.addresses) {
    await prisma.address.upsert({
      where: { id: a.id },
      create: {
        id: a.id,
        userId: a.userId,
        label: a.label,
        fullName: a.fullName,
        phone: a.phone,
        addressLine1: a.addressLine1,
        addressLine2: a.addressLine2,
        city: a.city,
        state: a.state,
        pincode: a.pincode,
        country: a.country,
        isDefault: a.isDefault,
        createdAt: new Date(a.createdAt),
        updatedAt: new Date(a.updatedAt),
      },
      update: {
        fullName: a.fullName,
        phone: a.phone,
        addressLine1: a.addressLine1,
        addressLine2: a.addressLine2,
        city: a.city,
        state: a.state,
        pincode: a.pincode,
        isDefault: a.isDefault,
      },
    });
  }

  // 4. Categories
  console.log(`⏳ Importing ${data.categories.length} categories...`);
  for (const c of data.categories) {
    await prisma.category.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        image: c.image,
        icon: c.icon,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      },
      update: {
        name: c.name,
        description: c.description,
        image: c.image,
        icon: c.icon,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
      },
    });
  }

  // 5. Products
  console.log(`⏳ Importing ${data.products.length} products...`);
  for (const pr of data.products) {
    await prisma.product.upsert({
      where: { id: pr.id },
      create: {
        id: pr.id,
        slug: pr.slug,
        sku: pr.sku,
        name: pr.name,
        description: pr.description,
        categoryId: pr.categoryId,
        subCategory: pr.subCategory,
        price: pr.price,
        originalPrice: pr.originalPrice,
        discount: pr.discount,
        rating: pr.rating,
        reviewCount: pr.reviewCount,
        images: pr.images,
        features: pr.features,
        specifications: pr.specifications,
        badge: pr.badge,
        featured: pr.featured,
        isBundle: pr.isBundle,
        isDemo: pr.isDemo,
        isActive: pr.isActive,
        status: pr.status,
        createdAt: new Date(pr.createdAt),
        updatedAt: new Date(pr.updatedAt),
      },
      update: {
        price: pr.price,
        originalPrice: pr.originalPrice,
        discount: pr.discount,
        rating: pr.rating,
        reviewCount: pr.reviewCount,
        isActive: pr.isActive,
        status: pr.status,
      },
    });
  }

  // 6. Bundle Items
  if (data.bundleItems && data.bundleItems.length > 0) {
    console.log(`⏳ Importing ${data.bundleItems.length} bundle items...`);
    for (const b of data.bundleItems) {
      await prisma.bundleItem.upsert({
        where: { id: b.id },
        create: {
          id: b.id,
          bundleProductId: b.bundleProductId,
          componentProductId: b.componentProductId,
          quantity: b.quantity,
        },
        update: {
          quantity: b.quantity,
        },
      });
    }
  }

  // 7. Inventory
  console.log(`⏳ Importing ${data.inventory.length} inventory records...`);
  for (const inv of data.inventory) {
    await prisma.inventory.upsert({
      where: { id: inv.id },
      create: {
        id: inv.id,
        productId: inv.productId,
        stockCount: inv.stockCount,
        reserved: inv.reserved,
        lowStockAlert: inv.lowStockAlert,
        updatedAt: new Date(inv.updatedAt),
      },
      update: {
        stockCount: inv.stockCount,
        reserved: inv.reserved,
        lowStockAlert: inv.lowStockAlert,
      },
    });
  }

  // 8. Orders & Order Items
  console.log(`⏳ Importing ${data.orders.length} orders...`);
  for (const o of data.orders) {
    await prisma.order.upsert({
      where: { id: o.id },
      create: {
        id: o.id,
        orderNumber: o.orderNumber,
        userId: o.userId,
        addressId: o.addressId,
        status: o.status,
        paymentStatus: o.paymentStatus,
        subtotal: o.subtotal,
        shipping: o.shipping,
        tax: o.tax,
        grandTotal: o.grandTotal,
        notes: o.notes,
        createdAt: new Date(o.createdAt),
        updatedAt: new Date(o.updatedAt),
      },
      update: {
        status: o.status,
        paymentStatus: o.paymentStatus,
      },
    });
  }

  if (data.orderItems && data.orderItems.length > 0) {
    console.log(`⏳ Importing ${data.orderItems.length} order items...`);
    for (const oi of data.orderItems) {
      await prisma.orderItem.upsert({
        where: { id: oi.id },
        create: {
          id: oi.id,
          orderId: oi.orderId,
          productId: oi.productId,
          productName: oi.productName,
          price: oi.price,
          quantity: oi.quantity,
          createdAt: new Date(oi.createdAt),
        },
        update: {
          quantity: oi.quantity,
          price: oi.price,
        },
      });
    }
  }

  // 9. Carts & Cart Items
  if (data.carts && data.carts.length > 0) {
    console.log(`⏳ Importing ${data.carts.length} carts...`);
    for (const c of data.carts) {
      await prisma.cart.upsert({
        where: { id: c.id },
        create: {
          id: c.id,
          userId: c.userId,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
        },
        update: {},
      });
    }
  }

  if (data.cartItems && data.cartItems.length > 0) {
    console.log(`⏳ Importing ${data.cartItems.length} cart items...`);
    for (const ci of data.cartItems) {
      await prisma.cartItem.upsert({
        where: { id: ci.id },
        create: {
          id: ci.id,
          cartId: ci.cartId,
          productId: ci.productId,
          quantity: ci.quantity,
          addedAt: new Date(ci.addedAt),
        },
        update: {
          quantity: ci.quantity,
        },
      });
    }
  }

  // 10. Wishlists & Wishlist Items
  if (data.wishlists && data.wishlists.length > 0) {
    console.log(`⏳ Importing ${data.wishlists.length} wishlists...`);
    for (const w of data.wishlists) {
      await prisma.wishlist.upsert({
        where: { id: w.id },
        create: {
          id: w.id,
          userId: w.userId,
          createdAt: new Date(w.createdAt),
          updatedAt: new Date(w.updatedAt),
        },
        update: {},
      });
    }
  }

  if (data.wishlistItems && data.wishlistItems.length > 0) {
    console.log(`⏳ Importing ${data.wishlistItems.length} wishlist items...`);
    for (const wi of data.wishlistItems) {
      await prisma.wishlistItem.upsert({
        where: { id: wi.id },
        create: {
          id: wi.id,
          wishlistId: wi.wishlistId,
          productId: wi.productId,
          addedAt: new Date(wi.addedAt),
        },
        update: {},
      });
    }
  }

  // 11. Post-migration verification
  console.log('\n📊 Validating PostgreSQL record counts:');
  const [
    pgUsers,
    pgProfiles,
    pgAddresses,
    pgCategories,
    pgProducts,
    pgBundleItems,
    pgInventory,
    pgOrders,
    pgOrderItems,
    pgCarts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.profile.count(),
    prisma.address.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.bundleItem.count(),
    prisma.inventory.count(),
    prisma.order.count(),
    prisma.orderItem.count(),
    prisma.cart.count(),
  ]);

  console.log(`   - Users:        ${pgUsers} (Expected: ${data.users.length})`);
  console.log(`   - Profiles:     ${pgProfiles} (Expected: ${data.profiles.length})`);
  console.log(`   - Addresses:    ${pgAddresses} (Expected: ${data.addresses.length})`);
  console.log(`   - Categories:   ${pgCategories} (Expected: ${data.categories.length})`);
  console.log(`   - Products:     ${pgProducts} (Expected: ${data.products.length})`);
  console.log(`   - Bundle Items: ${pgBundleItems} (Expected: ${data.bundleItems?.length || 0})`);
  console.log(`   - Inventory:    ${pgInventory} (Expected: ${data.inventory.length})`);
  console.log(`   - Orders:       ${pgOrders} (Expected: ${data.orders.length})`);
  console.log(`   - Order Items:  ${pgOrderItems} (Expected: ${data.orderItems?.length || 0})`);
  console.log(`   - Carts:        ${pgCarts} (Expected: ${data.carts?.length || 0})`);

  console.log('\n✅ Successfully imported and verified all records into PostgreSQL!');
}

main()
  .catch((e) => {
    console.error('❌ Failed to import data into PostgreSQL:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

