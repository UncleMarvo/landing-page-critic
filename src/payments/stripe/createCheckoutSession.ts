import Stripe from 'stripe';
import { Tier } from '../types';
import { getTierConfig } from '../config';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
console.log('Stripe secret key configured:', !!stripeSecretKey);

if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY is not configured');
  throw new Error('Stripe secret key is not configured');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

interface CreateCheckoutSessionParams {
  userId: string;
  userEmail: string;
  tier: Tier;
  successUrl: string;
  cancelUrl: string;
}

interface CheckoutSessionResult {
  success: boolean;
  sessionId?: string;
  url?: string;
  error?: string;
}

export async function createCheckoutSession({
  userId,
  userEmail,
  tier,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams): Promise<CheckoutSessionResult> {
  try {
    console.log('Creating checkout session with params:', { userId, userEmail, tier, successUrl, cancelUrl });
    
    // Get tier configuration
    const tierConfig = getTierConfig(tier);
    console.log('Tier config:', tierConfig);
    
    if (!tierConfig.stripePriceId) {
      console.error('No Stripe price ID found for tier:', tier);
      return {
        success: false,
        error: 'Invalid tier configuration - missing Stripe price ID'
      };
    }

    // Create or get customer
    let customer: Stripe.Customer;
    
    // Try to find existing customer by email
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId,
        },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: tierConfig.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        tier: tier,
      },
      subscription_data: {
        metadata: {
          userId: userId,
          tier: tier,
        },
      },
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url!,
    };
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return {
      success: false,
      error: error.message || 'Failed to create checkout session',
    };
  }
}
