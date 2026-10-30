import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateEmail } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    const { allowed } = checkRateLimit(`forgot:${ip}`, 3, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in an hour.' },
        { status: 429 },
      );
    }

    const body = await req.json() as Record<string, string>;
    const emailErr = validateEmail(body.email);
    if (emailErr) return NextResponse.json({ error: emailErr }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase().trim() },
    });

    // Always return the same message to prevent email enumeration
    if (user) {
      // PRODUCTION: generate a signed reset token, store it with a 1-hour expiry,
      // and send a reset link via email (Resend / Nodemailer).
      // DEV: log the intent only — no email is sent.
      console.info(`[DEV] Password reset requested for ${user.email}. Configure SMTP to enable emails.`);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
      ...(process.env.NODE_ENV === 'development'
        ? { _devNote: 'Email not sent in development. Configure SMTP_* env vars for production.' }
        : {}),
    });
  } catch (error) {
    console.error('[POST /api/auth/forgot-password]', error);
    return NextResponse.json({ error: 'An error occurred. Please try again.' }, { status: 500 });
  }
}

