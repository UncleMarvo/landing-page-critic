import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailWithToken, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    // Validate input
    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Verify email with token
    const user = await verifyEmailWithToken(token);

    // Generate new JWT token
    const newToken = generateToken({ userId: user.id });

    // Create response
    const response = NextResponse.json({
      success: true,
      user,
      message: 'Email verified successfully'
    });

    // Set HTTP-only cookie
    setAuthCookie(response, newToken);

    return response;
  } catch (error: any) {
    console.error('Email verification error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Email verification failed',
        success: false 
      },
      { status: 400 }
    );
  }
}
