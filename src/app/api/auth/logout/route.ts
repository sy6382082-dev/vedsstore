import { NextResponse } from 'next/server';
import { sessionCookieOptions } from '@/lib/auth';

export async function POST() {
  const opts = sessionCookieOptions(0); // maxAge=0 deletes the cookie
  const response = NextResponse.json({ success: true });
  response.cookies.set(opts.name, '', opts);
  return response;
}

