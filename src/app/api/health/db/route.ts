import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL;

  const isPostgres =
    dbUrl?.startsWith('postgres://') || dbUrl?.startsWith('postgresql://');
  const isSqlite =
    dbUrl?.startsWith('file:') || (!dbUrl && process.env.NODE_ENV !== 'production');

  const diagnostics = {
    configured: Boolean(dbUrl),
    databaseType: isPostgres ? 'postgresql' : isSqlite ? 'sqlite' : 'unknown',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  if (!dbUrl) {
    return NextResponse.json(
      {
        status: 'error',
        message:
          'DATABASE_URL environment variable is missing. Please add it to your Vercel Project Settings.',
        diagnostics,
      },
      { status: 503 }
    );
  }

  try {
    const [userCount, productCount] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
    ]);

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      diagnostics,
      counts: {
        users: userCount,
        products: productCount,
      },
    });
  } catch (error) {
    const err = error as { code?: string; name?: string; message?: string };
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: {
          name: err.name,
          code: err.code,
          message: err.message,
        },
        diagnostics,
      },
      { status: 503 }
    );
  }
}

