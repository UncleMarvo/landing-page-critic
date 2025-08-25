import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/payments/stripe/createCheckoutSession';
import { getUserFromToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tier } = body;

    if (!tier) {
      return NextResponse.json(
        { error: 'Tier is required' },
        { status: 400 }
      );
    }

    // Create checkout session
    const result = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      tier,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?canceled=true`,
    });

    if (!result.success) {
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
