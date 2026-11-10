import { NextResponse, type NextRequest } from 'next/server';

const AUTH_COOKIE = 'access_token';
const AUTH_PAGES = ['/login', '/register'];
const CUSTOMER_PAGES = ['/account', '/checkout', '/orders'];

interface TokenPayload {
  role?: 'admin' | 'customer';
  exp?: number;
}

/**
 * Reads (does NOT verify) the JWT payload for fast redirects.
 * Real security is enforced by NestJS on every API call.
 */
function readToken(token?: string): TokenPayload | null {
  if (!token) return null;
  try {
    const part = token.split('.')[1];
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded)) as TokenPayload;
    if (payload.exp && payload.exp * 1000 < Date.now()) return null; // expired
    return payload;
  } catch {
    return null;
  }
}

const matches = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(`${base}/`);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const payload = readToken(request.cookies.get(AUTH_COOKIE)?.value);
  const isLoggedIn = !!payload;

  const isAdminPage = matches(pathname, '/admin');
  const isCustomerPage = CUSTOMER_PAGES.some((base) => matches(pathname, base));

  // Not logged in -> send to login, then back here afterwards
  if ((isAdminPage || isCustomerPage) && !isLoggedIn) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  // Logged in but not admin -> home
  if (isAdminPage && payload?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Already logged in -> no need to see login/register
  if (AUTH_PAGES.includes(pathname) && isLoggedIn) {
    return NextResponse.redirect(
      new URL(payload?.role === 'admin' ? '/admin' : '/', request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/login',
    '/register',
  ],
};