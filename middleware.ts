import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/database';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req: request, res });

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Handle audio file requests (preserve existing functionality)
  if (request.nextUrl.pathname.startsWith('/audio/')) {
    // Set proper headers for audio files and caching
    res.headers.set('Accept-Ranges', 'bytes');
    res.headers.set('Content-Type', 'audio/mpeg');
    res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.headers.set('Connection', 'keep-alive');
    
    return res;
  }

  // Protected routes - redirect to login if not authenticated
  const protectedRoutes = ['/', '/api/tracks', '/api/upload'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(route + '/')
  );

  if (isProtectedRoute && !session) {
    // Redirect to login page
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Auth routes - redirect to home if already authenticated
  const authRoutes = ['/auth/login', '/auth/signup'];
  const isAuthRoute = authRoutes.includes(request.nextUrl.pathname);

  if (isAuthRoute && session) {
    // Redirect to home page or the original destination
    const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
