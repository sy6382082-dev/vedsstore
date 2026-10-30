import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/password';
import { validatePassword } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as {
      currentPassword: string;
      newPassword: string;
    };
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both passwords are required' }, { status: 400 });
    }

    const pwError = validatePassword(newPassword);
    if (pwError) {
      return NextResponse.json({ error: pwError }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isCorrect = await verifyPassword(currentPassword, user.passwordHash);
    if (!isCorrect) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('[POST /api/account/settings/password]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

