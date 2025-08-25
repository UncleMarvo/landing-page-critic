import { NextRequest, NextResponse } from 'next/server';
import { manageSubscription, getSubscriptionInfo } from '@/payments/stripe/manageSubscription';
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
    const { action, tier, cancelAtPeriodEnd } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Use the unified manageSubscription function
    const result = await manageSubscription({
      userId: user.id,
      action,
      tier,
      cancelAtPeriodEnd,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Operation failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: result.subscription,
    });
  } catch (error: any) {
    console.error('Subscription management error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Use the unified getSubscriptionInfo function
    const result = await getSubscriptionInfo(user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Operation failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Subscription info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
