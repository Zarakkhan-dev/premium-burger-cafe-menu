import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard', '/api/categories', '/api/products', '/api/auth/profile'];
const publicRoutes = ['/', '/login', '/api/auth/login', '/api/auth/logout', '/api/auth/me']; // Add /api/auth/me

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if it's an API route
  const isApiRoute = path.startsWith('/api/');
  
  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );

  // For public API routes, always allow
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected API routes, verify token
  if (isApiRoute && isProtectedRoute) {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // You can verify the token here if needed
    return NextResponse.next();
  }

  // Get the auth token from cookies for pages
  const token = request.cookies.get('auth-token')?.value;

  // Redirect to login if trying to access protected page without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', path);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if trying to access login while already authenticated
  if (path === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};