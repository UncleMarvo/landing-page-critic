import Stripe from 'stripe';

// Validate required environment variables
function validateStripeConfig() {
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLIC_KEY',
    'STRIPE_BASIC_PRICE_ID',
    'STRIPE_PRO_PRICE_ID',
    'STRIPE_WEBHOOK_SECRET'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required Stripe environment variables: ${missingVars.join(', ')}`);
  }
}

// Initialize Stripe client
let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    validateStripeConfig();
    
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia', // Use latest stable API version
      typescript: true,
    });
  }
  
  return stripeClient;
}

// Get Stripe public key for client-side usage
export function getStripePublicKey(): string {
  if (!process.env.STRIPE_PUBLIC_KEY) {
    throw new Error('STRIPE_PUBLIC_KEY environment variable is required');
  }
  
  return process.env.STRIPE_PUBLIC_KEY;
}

// Helper function to handle Stripe errors
export function handleStripeError(error: any): { success: false; error: string } {
  console.error('Stripe error:', error);
  
  if (error.type === 'StripeCardError') {
    return { success: false, error: error.message };
  } else if (error.type === 'StripeRateLimitError') {
    return { success: false, error: 'Too many requests made to the API too quickly.' };
  } else if (error.type === 'StripeInvalidRequestError') {
    return { success: false, error: 'Invalid parameters were supplied to Stripe\'s API.' };
  } else if (error.type === 'StripeAPIError') {
    return { success: false, error: 'An error occurred internally with Stripe\'s API.' };
  } else if (error.type === 'StripeConnectionError') {
    return { success: false, error: 'Some kind of error occurred during the HTTPS communication.' };
  } else if (error.type === 'StripeAuthenticationError') {
    return { success: false, error: 'You probably used an incorrect API key.' };
  } else {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

// Helper function to validate Stripe webhook signature
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    return Stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    throw new Error('Webhook signature verification failed');
  }
}

// Helper function to format Stripe amount for display
export function formatStripeAmount(amount: number, currency: string = 'usd'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  });
  
  return formatter.format(amount / 100);
}

// Helper function to convert amount to Stripe format (cents)
export function toStripeAmount(amount: number): number {
  return Math.round(amount * 100);
}

// Helper function to convert Stripe amount from cents
export function fromStripeAmount(amount: number): number {
  return amount / 100;
}
