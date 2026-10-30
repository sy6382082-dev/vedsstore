import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { createSession, sessionCookieOptions } from '@/lib/auth';
import { validateEmail } from '@/lib/validation';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email?: string; password?: string; adminOnly?: boolean };
    const { email, password } = body;

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const emailErr = validateEmail(email);
    if (emailErr) return NextResponse.json({ error: emailErr }, { status: 400 });
    if (!password) return NextResponse.json({ error: 'Password is required' }, { status: 400 });

    const rateLimitKey = `login:${email.toLowerCase().trim()}`;
    const { allowed, remaining } = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many failed login attempts. Please wait 15 minutes and try again.' },
        { status: 429 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { profile: { select: { firstName: true, lastName: true } } },
    });

    if (!user) {
      // Constant-time response — prevents email enumeration
      await new Promise((r) => setTimeout(r, 300));
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        {
          error:
            remaining > 0
              ? `Invalid email or password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
              : 'Too many failed attempts. Please wait 15 minutes.',
        },
        { status: 401 },
      );
    }

    resetRateLimit(rateLimitKey);

    if (body.adminOnly && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access is required.' }, { status: 403 });
    }

    const token = await createSession({ userId: user.id, email: user.email, role: user.role });
    const opts = sessionCookieOptions();
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.profile?.firstName ?? null,
        lastName: user.profile?.lastName ?? null,
      },
    });
    response.cookies.set(opts.name, token, opts);
    return response;
  } catch (error) {
    console.error('[POST /api/auth/login]', error);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
