import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies using Next.js App Router method
    const token = request.cookies.get('auth-token')?.value;
    
    console.log('Auth/me API - Token found:', !!token);

    if (!token) {
      console.log('Auth/me API - No token found');
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Get user from token
    const user = await getUserFromToken(token);
    console.log('Auth/me API - User found:', !!user);

    if (!user) {
      console.log('Auth/me API - Invalid token');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('Auth/me API - Returning user:', user.id);
    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Get user error:', error);
    
    return NextResponse.json(
      { error: 'Failed to get user information' },
      { status: 500 }
    );
  }
}
