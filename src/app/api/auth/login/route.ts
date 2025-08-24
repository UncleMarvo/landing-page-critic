import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await authenticateUser(email, password);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id });

    // Create response
    const response = NextResponse.json({
      success: true,
      user,
      message: 'Login successful'
    });

    // Set HTTP-only cookie
    setAuthCookie(response, token);

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Login failed',
        success: false 
      },
      { status: 500 }
    );
  }
}
