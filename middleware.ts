import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if the path starts with /admin but is not /admin-hidden-login
  if (path.startsWith('/admin') && path !== '/admin-hidden-login') {
    const session = request.cookies.get('admin_session')?.value;

    if (!session) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      await decrypt(session);
      return NextResponse.next();
    } catch (error) {
      console.error('Session verification failed:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Optionally, configure which paths the middleware runs on
export const config = {
  matcher: ['/admin/:path*'],
};
