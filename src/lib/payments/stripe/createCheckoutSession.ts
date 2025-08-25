import { getStripeClient, handleStripeError } from './stripeClient';
import { CheckoutSessionData, Tier } from '../types';
import { getTierConfig } from '../config';
import { createOrUpdateStripeCustomer } from '../subscriptionService';

export async function createCheckoutSession(data: CheckoutSessionData) {
  try {
    const stripe = getStripeClient();
    const { tier, successUrl, cancelUrl, customerEmail, customerId } = data;

    // Validate tier
    const tierConfig = getTierConfig(tier);
    if (!tierConfig) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    // Don't create checkout session for free tier
    if (tier === 'free') {
      throw new Error('Cannot create checkout session for free tier');
    }

    // Validate Stripe price ID
    if (!tierConfig.stripePriceId) {
      throw new Error(`No Stripe price ID configured for tier: ${tier}`);
    }

    // Prepare checkout session parameters
    const sessionParams: any = {
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
        tier,
        customerId,
      },
      subscription_data: {
        metadata: {
          tier,
          customerId,
        },
      },
    };

    // Add trial period if configured
    const trialDays = parseInt(process.env.STRIPE_TRIAL_DAYS || '0');
    if (trialDays > 0) {
      sessionParams.subscription_data.trial_period_days = trialDays;
    }

    // If customer exists, add customer ID
    if (customerId) {
      sessionParams.customer = customerId;
    } else if (customerEmail) {
      // Create or get customer
      let customer;
      
      // Try to find existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: customerEmail,
          metadata: {
            tier,
          },
        });
      }

      sessionParams.customer = customer.id;
    }

    // Add billing address collection if needed
    sessionParams.billing_address_collection = 'required';

    // Add tax collection if configured
    if (process.env.STRIPE_TAX_RATES) {
      sessionParams.tax_id_collection = {
        enabled: true,
      };
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    return {
      success: true,
      sessionId: session.id,
      url: session.url,
    };
  } catch (error: any) {
    return handleStripeError(error);
  }
}

export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  try {
    const stripe = getStripeClient();

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return {
      success: true,
      url: session.url,
    };
  } catch (error: any) {
    return handleStripeError(error);
  }
}

export async function createStripeCustomer(email: string, name?: string, metadata?: any) {
  try {
    const stripe = getStripeClient();

    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });

    return {
      success: true,
      customerId: customer.id,
      customer,
    };
  } catch (error: any) {
    return handleStripeError(error);
  }
}

export async function getStripeCustomer(customerId: string) {
  try {
    const stripe = getStripeClient();

    const customer = await stripe.customers.retrieve(customerId);

    return {
      success: true,
      customer,
    };
  } catch (error: any) {
    return handleStripeError(error);
  }
}

export async function updateStripeCustomer(customerId: string, updates: any) {
  try {
    const stripe = getStripeClient();

    const customer = await stripe.customers.update(customerId, updates);

    return {
      success: true,
      customer,
    };
  } catch (error: any) {
    return handleStripeError(error);
  }
}
