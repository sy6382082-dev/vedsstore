/**
 * scripts/export-sqlite-data.ts
 *
 * Exports all existing data from local SQLite database (prisma/dev.db)
 * to a structured JSON file (prisma/data-backup.json).
 *
 * Usage:
 *   npx tsx scripts/export-sqlite-data.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },
  },
});

async function main() {
  console.log('🔄 Exporting data from SQLite database (prisma/dev.db)...');

  const [
    users,
    profiles,
    addresses,
    categories,
    products,
    bundleItems,
    inventory,
    carts,
    cartItems,
    wishlists,
    wishlistItems,
    orders,
    orderItems,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.profile.findMany(),
    prisma.address.findMany(),
    prisma.category.findMany(),
    prisma.product.findMany(),
    prisma.bundleItem.findMany(),
    prisma.inventory.findMany(),
    prisma.cart.findMany(),
    prisma.cartItem.findMany(),
    prisma.wishlist.findMany(),
    prisma.wishlistItem.findMany(),
    prisma.order.findMany(),
    prisma.orderItem.findMany(),
  ]);

  const exportData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      source: 'SQLite (prisma/dev.db)',
      recordCounts: {
        users: users.length,
        profiles: profiles.length,
        addresses: addresses.length,
        categories: categories.length,
        products: products.length,
        bundleItems: bundleItems.length,
        inventory: inventory.length,
        carts: carts.length,
        cartItems: cartItems.length,
        wishlists: wishlists.length,
        wishlistItems: wishlistItems.length,
        orders: orders.length,
        orderItems: orderItems.length,
      },
    },
    users,
    profiles,
    addresses,
    categories,
    products,
    bundleItems,
    inventory,
    carts,
    cartItems,
    wishlists,
    wishlistItems,
    orders,
    orderItems,
  };

  const outputPath = path.join(rootDir, 'prisma', 'data-backup.json');
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf8');

  console.log('✅ SQLite data exported successfully to prisma/data-backup.json:');
  console.log(`   - Users:        ${users.length}`);
  console.log(`   - Categories:   ${categories.length}`);
  console.log(`   - Products:     ${products.length}`);
  console.log(`   - Inventory:    ${inventory.length}`);
  console.log(`   - Orders:       ${orders.length}`);
  console.log(`   - Addresses:    ${addresses.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Failed to export SQLite data:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

