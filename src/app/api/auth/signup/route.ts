import { NextRequest, NextResponse } from 'next/server';
import { createUserWithVerification, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
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

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Create user with verification
    const { user, verificationToken } = await createUserWithVerification(email, password, name);

    // Generate JWT token
    const token = generateToken({ userId: user.id });

    // Create response
    const response = NextResponse.json({
      success: true,
      user,
      message: 'Account created successfully. Please check your email to verify your account.'
    });

    // Set HTTP-only cookie
    setAuthCookie(response, token);

    // TODO: Send verification email
    // For now, we'll just log the verification token
    console.log('Verification token:', verificationToken);
    console.log('Verification URL:', `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${verificationToken}`);

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Handle specific errors
    if (error.message === 'User with this email already exists') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || 'Signup failed',
        success: false 
      },
      { status: 500 }
    );
  }
}
