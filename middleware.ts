import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/api/categories', '/api/products', '/api/auth/profile'];
// Public routes that should be accessible without authentication
const publicRoutes = ['/', '/login', '/api/auth/login', '/api/auth/logout'];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if it's an API route
  const isApiRoute = path.startsWith('/api/');
  
  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  // Check if it's a public route
  const isPublicRoute = publicRoutes.includes(path) || 
    publicRoutes.some(route => path.startsWith(`${route}/`));

  // For API routes, we'll handle authentication in the route handlers
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Get the auth token from cookies
  const token = request.cookies.get('auth-token')?.value;

  // Redirect to login if trying to access protected route without token
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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/auth/me).*)',
  ],
};