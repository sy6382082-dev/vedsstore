/**
 * scripts/prisma-prepare.js
 *
 * Automated Prisma schema selector & client generator.
 * Seamlessly manages dual-database architecture:
 *   - Local Development: SQLite (keeps prisma/dev.db intact)
 *   - Production (Vercel / Cloud): PostgreSQL
 *
 * Detects DATABASE_URL from process.env, Vercel environment variables, or local .env
 * and prepares prisma/schema.prisma before running `prisma generate`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Resolve DATABASE_URL
let databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  '';

// If not in process.env, attempt to parse from local .env
if (!databaseUrl) {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      for (const line of envContent.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        const [key, ...rest] = trimmed.split('=');
        if (key.trim() === 'DATABASE_URL') {
          databaseUrl = rest.join('=').trim().replace(/^["']|["']$/g, '');
          break;
        }
      }
    } catch {
      // Ignore reading error
    }
  }
}

// 2. Check for manual CLI flags
const isForcedPg = process.argv.includes('--force-pg') || process.argv.includes('--pg');
const isForcedSqlite = process.argv.includes('--force-sqlite') || process.argv.includes('--sqlite');

// 3. Determine database provider
const isPostgres =
  isForcedPg ||
  (!isForcedSqlite &&
    (databaseUrl.startsWith('postgresql://') ||
      databaseUrl.startsWith('postgres://') ||
      Boolean(process.env.POSTGRES_PRISMA_URL) ||
      Boolean(process.env.POSTGRES_URL)));

const targetSchema = isPostgres ? 'schema.postgresql.prisma' : 'schema.sqlite.prisma';
const providerName = isPostgres ? 'PostgreSQL' : 'SQLite';

console.log(`[Prisma-Prepare] Detected target database provider: ${providerName}`);

const targetSchemaPath = path.join(rootDir, 'prisma', targetSchema);
const activeSchemaPath = path.join(rootDir, 'prisma', 'schema.prisma');

if (!fs.existsSync(targetSchemaPath)) {
  console.error(`[Prisma-Prepare] Error: Target schema file not found: ${targetSchemaPath}`);
  process.exit(1);
}

// 4. Synchronize prisma/schema.prisma if different
const targetContent = fs.readFileSync(targetSchemaPath, 'utf8');
let currentContent = '';
if (fs.existsSync(activeSchemaPath)) {
  currentContent = fs.readFileSync(activeSchemaPath, 'utf8');
}

if (currentContent !== targetContent) {
  fs.writeFileSync(activeSchemaPath, targetContent, 'utf8');
  console.log(`[Prisma-Prepare] Updated prisma/schema.prisma with ${targetSchema}`);
} else {
  console.log(`[Prisma-Prepare] prisma/schema.prisma is already up to date (${targetSchema})`);
}

// 5. Run Prisma Client Generation
console.log(`[Prisma-Prepare] Generating Prisma Client for ${providerName}...`);
try {
  execSync('npx prisma generate', {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      // Provide dummy DATABASE_URL if missing during build-time generation so validation passes
      DATABASE_URL:
        process.env.DATABASE_URL ||
        (isPostgres
          ? 'postgresql://postgres:postgres@localhost:5432/db?schema=public'
          : 'file:./dev.db'),
    },
  });
  console.log(`[Prisma-Prepare] Successfully generated Prisma Client!`);
} catch (error) {
  console.error(`[Prisma-Prepare] Failed to generate Prisma Client:`, error.message);
  process.exit(1);
}

// 6. Automatically synchronize PostgreSQL schema if deployed with real database connection
const isRealPgConnection =
  isPostgres &&
  databaseUrl &&
  !databaseUrl.includes('localhost') &&
  !databaseUrl.includes('127.0.0.1') &&
  !databaseUrl.includes('dummy');

if (isRealPgConnection) {
  console.log(`[Prisma-Prepare] Synchronizing PostgreSQL database tables...`);
  try {
    execSync('npx prisma db push --schema=prisma/schema.postgresql.prisma --skip-generate --accept-data-loss', {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
    });
    console.log(`[Prisma-Prepare] PostgreSQL database tables successfully synchronized!`);
  } catch (err) {
    console.warn(`[Prisma-Prepare] Note: Database synchronization could not run during build (may require network access at runtime).`, err.message);
  }
}
