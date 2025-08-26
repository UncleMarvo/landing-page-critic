import { NextRequest, NextResponse } from 'next/server';
import { getTierConfig } from '@/payments/config';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
    const stripeProPriceId = process.env.STRIPE_PRO_PRICE_ID;
    
    // Get tier configuration
    const proTierConfig = getTierConfig('pro');
    
    const debugInfo = {
      environment: {
        stripeSecretKey: !!stripeSecretKey,
        stripePublicKey: !!stripePublicKey,
        stripeProPriceId: !!stripeProPriceId,
        stripeProPriceIdValue: stripeProPriceId || 'NOT_SET',
      },
      tierConfig: {
        pro: {
          name: proTierConfig.name,
          price: proTierConfig.price,
          stripePriceId: proTierConfig.stripePriceId,
          hasStripePriceId: !!proTierConfig.stripePriceId,
        }
      },
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    };
    
    return NextResponse.json(debugInfo);
  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Debug endpoint error', details: error.message },
      { status: 500 }
    );
  }
}
