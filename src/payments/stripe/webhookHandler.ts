import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient, constructWebhookEvent } from './stripeClient';
import { getPaymentConfig } from '../config';
import { 
  updateUserSubscription, 
  getUserByStripeCustomerId, 
  getUserByStripeSubscriptionId,
  createInvoice 
} from '../subscriptionService';
import { Stripe } from 'stripe';

export async function handleStripeWebhook(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const config = getPaymentConfig();
    const event = constructWebhookEvent(body, signature, config.webhookSecret);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    const user = await getUserByStripeCustomerId(customerId);
    
    if (!user) {
      console.error(`User not found for customer ID: ${customerId}`);
      return;
    }

    // Get tier from metadata or default to 'basic'
    const tier = subscription.metadata?.tier || 'basic';
    
    await updateUserSubscription(user.id, {
      tier: tier as any,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status as any,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    console.log(`Subscription created for user ${user.id}: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const user = await getUserByStripeSubscriptionId(subscription.id);
    
    if (!user) {
      console.error(`User not found for subscription ID: ${subscription.id}`);
      return;
    }

    // Get tier from metadata or keep existing
    const tier = subscription.metadata?.tier || user.tier;
    
    await updateUserSubscription(user.id, {
      tier: tier as any,
      subscriptionStatus: subscription.status as any,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    console.log(`Subscription updated for user ${user.id}: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const user = await getUserByStripeSubscriptionId(subscription.id);
    
    if (!user) {
      console.error(`User not found for subscription ID: ${subscription.id}`);
      return;
    }

    // Reset to free tier
    await updateUserSubscription(user.id, {
      tier: 'free',
      subscriptionStatus: 'canceled',
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    });

    console.log(`Subscription deleted for user ${user.id}: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;
    const user = await getUserByStripeCustomerId(customerId);
    
    if (!user) {
      console.error(`User not found for customer ID: ${customerId}`);
      return;
    }

    // Create invoice record in database
    await createInvoice({
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      invoicePdf: invoice.invoice_pdf,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      userId: user.id,
    });

    // If this is a subscription invoice, update subscription status
    if (invoice.subscription) {
      const subscription = await getUserByStripeSubscriptionId(invoice.subscription as string);
      if (subscription) {
        await updateUserSubscription(subscription.id, {
          subscriptionStatus: 'active',
        });
      }
    }

    console.log(`Invoice payment succeeded for user ${user.id}: ${invoice.id}`);
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;
    const user = await getUserByStripeCustomerId(customerId);
    
    if (!user) {
      console.error(`User not found for customer ID: ${customerId}`);
      return;
    }

    // Update subscription status to past_due
    if (invoice.subscription) {
      const subscription = await getUserByStripeSubscriptionId(invoice.subscription as string);
      if (subscription) {
        await updateUserSubscription(subscription.id, {
          subscriptionStatus: 'past_due',
        });
      }
    }

    console.log(`Invoice payment failed for user ${user.id}: ${invoice.id}`);
    
    // TODO: Send notification to user about failed payment
    // This could be an email notification or in-app notification
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  try {
    const user = await getUserByStripeSubscriptionId(subscription.id);
    
    if (!user) {
      console.error(`User not found for subscription ID: ${subscription.id}`);
      return;
    }

    console.log(`Trial will end for user ${user.id}: ${subscription.id}`);
    
    // TODO: Send notification to user about trial ending
    // This could be an email notification or in-app notification
  } catch (error) {
    console.error('Error handling trial will end:', error);
  }
}

// Helper function to get webhook endpoint URL
export function getWebhookEndpoint() {
  // This should match your Stripe webhook endpoint configuration
  return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stripe/webhook`;
}

// Helper function to verify webhook is from Stripe
export function verifyWebhookOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const userAgent = request.headers.get('user-agent');
  
  // Stripe webhooks don't have an origin header, but we can check user-agent
  if (userAgent && userAgent.includes('Stripe')) {
    return true;
  }
  
  // Additional verification can be added here
  return false;
}
