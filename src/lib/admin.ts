import { NextResponse } from 'next/server';
import { getSession } from './auth';
import { prisma } from './db';

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export async function requireAdmin(): Promise<
  { user: AdminUser; error?: never } | { user?: never; error: NextResponse }
> {
  const session = await getSession();
  if (!session || !session.userId) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      ),
    };
  }

  // Real-time database verification to prevent privilege escalation or revoked admins
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return {
      error: NextResponse.json(
        { error: 'Forbidden: Administrative privileges required' },
        { status: 403 }
      ),
    };
  }

  return { user };
}

