import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  let email = (args[0] || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  let rawPassword = args[1] || process.env.ADMIN_PASSWORD || '';

  // If credentials are not provided via arguments or env vars, prompt interactively
  if (!email || !rawPassword) {
    if (process.stdin.isTTY) {
      const rl = readline.createInterface({ input, output });
      try {
        if (!email) {
          const emailInput = await rl.question('Admin email [default: admin@ved-hub.in]: ');
          email = (emailInput.trim() || 'admin@ved-hub.in').toLowerCase();
        }
        if (!rawPassword) {
          const passInput = await rl.question('Enter admin password (min 8 chars): ');
          rawPassword = passInput.trim();
        }
      } finally {
        rl.close();
      }
    }
  }

  if (!email || !rawPassword) {
    console.error(`
❌ Missing admin credentials!

Usage:
  npx tsx scripts/provision-admin.ts <email> <password>
Example:
  npx tsx scripts/provision-admin.ts admin@brother.in YourPassword123!

Or pass arguments with npm:
  npm run admin:provision -- admin@brother.in YourPassword123!
    `);
    process.exit(1);
  }

  if (rawPassword.length < 8) {
    console.error('❌ Password must be at least 8 characters long.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(rawPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      role: 'ADMIN',
      emailVerified: true,
      profile: {
        create: {
          firstName: 'VED-HUB',
          lastName: 'Administrator',
        },
      },
    },
    update: {
      passwordHash,
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  console.log(`\n✅ Administrator successfully configured/updated!`);
  console.log(`   User ID: ${admin.id}`);
  console.log(`   Email:   ${admin.email}`);
  console.log(`   Role:    ${admin.role}`);
  console.log(`\nYou can now sign in at http://localhost:3000/admin/login or http://localhost:3000/auth/login.\n`);
}

main()
  .catch((e) => {
    console.error('❌ Failed to provision admin:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
