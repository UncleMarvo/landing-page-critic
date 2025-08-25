import { NextRequest, NextResponse } from 'next/server';
import { handleStripeWebhook } from '@/payments/stripe/webhookHandler';

export async function POST(request: NextRequest) {
  return handleStripeWebhook(request);
}
