import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { getUserSubscription } from '@/payments/subscriptionService';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    console.log('Subscription API - Token found:', !!token);

    if (!token) {
      console.log('Subscription API - No token found');
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Get authenticated user from token
    const user = await getUserFromToken(token);
    console.log('Subscription API - User found:', !!user);
    
    if (!user) {
      console.log('Subscription API - Invalid token');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('Subscription API - Getting subscription for user:', user.id);

    // Get user subscription from database
    const subscription = await getUserSubscription(user.id);
    console.log('Subscription API - Subscription found:', !!subscription);

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error: any) {
    console.error('Error getting subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
