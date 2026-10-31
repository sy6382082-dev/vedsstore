import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { createSession, sessionCookieOptions } from '@/lib/auth';
import { validateEmail, validatePassword, validatePhone } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
    const { allowed } = checkRateLimit(`register:${ip}`, 10, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 },
      );
    }

    const body = (await req.json()) as Record<string, string>;
    const { email, password, phone, firstName, lastName } = body;

    const emailErr = validateEmail(email);
    if (emailErr) return NextResponse.json({ error: emailErr }, { status: 400 });

    const passErr = validatePassword(password);
    if (passErr) return NextResponse.json({ error: passErr }, { status: 400 });

    if (phone) {
      const phoneErr = validatePhone(phone);
      if (phoneErr) return NextResponse.json({ error: phoneErr }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        phone: phone?.replace(/[\s\-()]/g, '') || null,
        passwordHash,
        emailVerified: true,
        profile: {
          create: {
            firstName: firstName?.trim() || null,
            lastName: lastName?.trim() || null,
          },
        },
      },
      select: { id: true, email: true },
    });

    const token = await createSession({ userId: user.id, email: user.email, role: 'CUSTOMER' });
    const opts = sessionCookieOptions();
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
      message: 'Account created successfully!',
    });
    response.cookies.set(opts.name, token, opts);
    return response;
  } catch (error) {
    const err = error as { code?: string; name?: string; message?: string };
    console.error('[POST /api/auth/register] Registration failure:', {
      name: err.name,
      code: err.code,
      message: err.message,
    });

    if (err.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email or phone number already exists.' },
        { status: 409 },
      );
    }

    if (err.code === 'P2021') {
      return NextResponse.json(
        { error: 'Database schema is not initialized. Please run database setup.' },
        { status: 503 },
      );
    }

    if (
      err.name === 'PrismaClientInitializationError' ||
      err.code === 'P1001' ||
      err.code === 'P1000' ||
      err.code === 'P1002'
    ) {
      return NextResponse.json(
        { error: 'Database service is currently unreachable. Please check connection settings.' },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
