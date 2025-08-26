import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/payments/stripe/createCheckoutSession';
import { getUserFromToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get authenticated user
    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tier } = body;

    console.log('Checkout request body:', body);
    console.log('Tier from request:', tier);

    if (!tier) {
      console.log('No tier provided in request');
      return NextResponse.json(
        { error: 'Tier is required' },
        { status: 400 }
      );
    }

    console.log('Creating checkout session for user:', user.id, 'tier:', tier);
    
    // Create checkout session
    const result = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      tier,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?canceled=true`,
    });

    console.log('Checkout session result:', result);

    if (!result.success) {
      console.log('Checkout session creation failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to create checkout session' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      sessionId: result.sessionId,
      url: result.url,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
