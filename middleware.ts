import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle audio file requests
  if (request.nextUrl.pathname.startsWith('/audio/')) {
    const response = NextResponse.next();
    
    // Set proper headers for audio files and caching
    response.headers.set('Accept-Ranges', 'bytes');
    response.headers.set('Content-Type', 'audio/mpeg');
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Connection', 'keep-alive');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/audio/:path*'],
};
