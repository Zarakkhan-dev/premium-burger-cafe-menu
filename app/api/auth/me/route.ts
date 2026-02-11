import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { verifyToken } from '@/lib/auth';
import { User } from '@/lib/models/user.model';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get token from cookies - don't require it
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      // Return null user, not an error
      return NextResponse.json({ user: null });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      // Token expired or invalid - return null user
      return NextResponse.json({ user: null });
    }

    // Check if token was successfully decoded
    if (!decoded) {
      return NextResponse.json({ user: null });
    }

    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    // Always return null user, never throw
    return NextResponse.json({ user: null });
  }
}