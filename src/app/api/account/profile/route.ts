import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        email: user.email,
        phone: user.phone,
        firstName: user.profile?.firstName ?? null,
        lastName: user.profile?.lastName ?? null,
        avatarUrl: user.profile?.avatarUrl ?? null,
      },
    });
  } catch (err) {
    console.error('[GET /api/account/profile]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as {
      firstName?: string;
      lastName?: string;
      phone?: string;
    };

    const { firstName, lastName, phone } = body;

    // Validate phone if provided
    if (phone && !/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Invalid Indian phone number' }, { status: 400 });
    }

    // Check phone uniqueness if changing
    if (phone) {
      const existing = await prisma.user.findFirst({
        where: { phone: phone.replace(/\s/g, ''), id: { not: session.userId } },
      });
      if (existing) {
        return NextResponse.json({ error: 'Phone number already in use' }, { status: 409 });
      }
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.userId },
        data: phone ? { phone: phone.replace(/\s/g, '') } : {},
      }),
      prisma.profile.upsert({
        where: { userId: session.userId },
        create: {
          userId: session.userId,
          firstName: firstName ?? null,
          lastName: lastName ?? null,
        },
        update: {
          firstName: firstName ?? undefined,
          lastName: lastName ?? undefined,
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    console.error('[PATCH /api/account/profile]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

