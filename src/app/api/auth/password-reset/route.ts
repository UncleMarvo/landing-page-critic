import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Create password reset token
    const resetToken = await createPasswordResetToken(email);

    // Always return success to prevent email enumeration
    // If user doesn't exist, we still return success but don't send email
    if (resetToken) {
      // TODO: Send password reset email
      // For now, we'll just log the reset token
      console.log('Password reset token:', resetToken);
      console.log('Password reset URL:', `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error: any) {
    console.error('Password reset error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process password reset request',
        success: false 
      },
      { status: 500 }
    );
  }
}
