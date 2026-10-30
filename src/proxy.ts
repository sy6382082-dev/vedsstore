import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

const PROTECTED = ['/account'];
const ADMIN_ONLY = ['/admin'];
const AUTH_ONLY = ['/auth/login', '/auth/register', '/auth/forgot-password'];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminLoginPage = pathname === '/admin/login';
  const isAdminRoute = ADMIN_ONLY.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isAuthPage = AUTH_ONLY.some((p) => pathname.startsWith(p));

  const token = req.cookies.get('brother_session')?.value;
  const session = token ? await verifySession(token) : null;

  if (isAdminRoute && !isAdminLoginPage) {
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.search = '';
      return NextResponse.redirect(url);
    }
    if (session.role !== 'ADMIN') {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  if (isProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/account', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*', '/auth/:path*'],
};
