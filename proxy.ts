import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/admin/login' || path.startsWith('/api/auth/') || path === '/api/socket';

  // Check if it's an admin route
  const isAdminRoute = path.startsWith('/admin') || path.startsWith('/api/admin');

  // If it's not an admin route or it's a public path, let it pass
  if (!isAdminRoute || isPublicPath) {
    return NextResponse.next();
  }

  // We can't verify the JWT completely in Edge runtime without external crypto libraries,
  // but we can check if the user has an admin_token cookie.
  // Wait, the current login logic uses localStorage (not cookies) for the frontend!
  // To protect routes with Next.js middleware, we need the token in a cookie.
  // We should redirect them to login if they try to access /admin server-side without a cookie.
  // But since the current app uses localStorage exclusively, server-side middleware won't see the token!
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
