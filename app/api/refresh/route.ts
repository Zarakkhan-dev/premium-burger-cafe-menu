import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh-token')?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token' },
        { status: 401 }
      );
    }

    const tokens = await refreshAccessToken(refreshToken);
    
    if (!tokens) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      token: tokens.token,
    });

    // Update access token cookie
    response.cookies.set({
      name: 'auth-token',
      value: tokens.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
    });

    // Update refresh token cookie if new one generated
    if (tokens.refreshToken) {
      response.cookies.set({
        name: 'refresh-token',
        value: tokens.refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}