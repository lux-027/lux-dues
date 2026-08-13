import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// "/login" is kept only as a redirect shim to "/?auth=login" for old links.
const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/register-admin',
  '/api/auth/google',
  '/api/auth/phone',
  '/api/stats',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/?auth=login', request.url));
  }

  const payload = verifyToken(token);

  if (!payload) {
    const response = NextResponse.redirect(new URL('/?auth=login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }

  // Protect /admin routes - only SUPER_ADMIN and BLOCK_ADMIN allowed
  if (pathname.startsWith('/admin')) {
    if (payload.role !== 'SUPER_ADMIN' && payload.role !== 'BLOCK_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // /admin/admins is restricted to SUPER_ADMIN only (Block Admin assignment)
  if (pathname.startsWith('/admin/admins') && payload.role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/admin/buildings', request.url));
  }

  // Add user info to headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role);
  if (payload.buildingId) {
    requestHeaders.set('x-user-building-id', payload.buildingId);
  }
  if (payload.unitId) {
    requestHeaders.set('x-user-unit-id', payload.unitId);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    // Skip Next.js internals and any public/static asset files (images, fonts, etc.)
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|map)$).*)',
  ],
};
