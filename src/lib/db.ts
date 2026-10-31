import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Resolves and normalizes the active database connection string.
 * Supports Vercel Postgres / Neon connection pooling (`POSTGRES_PRISMA_URL`)
 * as well as standard `DATABASE_URL` or local SQLite (`file:./dev.db`).
 */
function getDatabaseUrl(): string | undefined {
  let url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    undefined;

  // For cloud PostgreSQL databases (Neon, Supabase, Vercel Postgres),
  // ensure sslmode=require is configured unless targeting localhost.
  if (url && (url.startsWith('postgres://') || url.startsWith('postgresql://'))) {
    if (!url.includes('sslmode=') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}sslmode=require`;
    }
  }

  return url;
}

function createPrismaClient(): PrismaClient {
  const url = getDatabaseUrl();

  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
    ...(url
      ? {
          datasources: {
            db: { url },
          },
        }
      : {}),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// In serverless environments (like Vercel), preserve the client instance on globalThis
// to prevent exhausting database connection pools across warm function invocations.
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}
