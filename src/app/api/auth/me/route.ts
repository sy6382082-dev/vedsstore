import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ user: null });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({ user });
  } catch (error) {
    console.error('[GET /api/auth/me]', error);
    return NextResponse.json({ user: null });
  }
}

