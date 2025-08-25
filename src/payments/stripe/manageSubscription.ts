import Stripe from 'stripe';
import { Tier } from '../types';
import { getTierConfig } from '../config';
import { upsertSubscription, cancelSubscription, reactivateSubscription } from '../subscriptionService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

interface ManageSubscriptionParams {
  userId: string;
  action: 'upgrade' | 'downgrade' | 'cancel' | 'reactivate';
  tier?: Tier;
  cancelAtPeriodEnd?: boolean;
}

interface ManageSubscriptionResult {
  success: boolean;
  error?: string;
  subscription?: any;
}

export async function manageSubscription({
  userId,
  action,
  tier,
  cancelAtPeriodEnd = false,
}: ManageSubscriptionParams): Promise<ManageSubscriptionResult> {
  try {
    // Get customer by user ID
    const customers = await stripe.customers.list({
      limit: 100,
    });

    const customer = customers.data.find(c => c.metadata.userId === userId);
    
    if (!customer) {
      return {
        success: false,
        error: 'Customer not found'
      };
    }

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    const activeSubscription = subscriptions.data[0];

    switch (action) {
      case 'upgrade':
      case 'downgrade':
        if (!tier) {
          return {
            success: false,
            error: 'Tier is required for upgrade/downgrade'
          };
        }

        if (!activeSubscription) {
          return {
            success: false,
            error: 'No active subscription found'
          };
        }

        const tierConfig = getTierConfig(tier);
        if (!tierConfig.stripePriceId) {
          return {
            success: false,
            error: 'Invalid tier configuration'
          };
        }

        // Update subscription
        const updatedSubscription = await stripe.subscriptions.update(
          activeSubscription.id,
          {
            items: [
              {
                id: activeSubscription.items.data[0].id,
                price: tierConfig.stripePriceId,
              },
            ],
            metadata: {
              userId: userId,
              tier: tier,
            },
          }
        );

        // Update local database
        await upsertSubscription(
          userId,
          tier,
          updatedSubscription.id,
          customer.id
        );

        return {
          success: true,
          subscription: updatedSubscription,
        };

      case 'cancel':
        if (!activeSubscription) {
          return {
            success: false,
            error: 'No active subscription found'
          };
        }

        // Cancel at period end
        await stripe.subscriptions.update(activeSubscription.id, {
          cancel_at_period_end: true,
        });

        // Update local database
        await cancelSubscription(userId);

        return {
          success: true,
        };

      case 'reactivate':
        if (!activeSubscription) {
          return {
            success: false,
            error: 'No active subscription found'
          };
        }

        // Reactivate subscription
        await stripe.subscriptions.update(activeSubscription.id, {
          cancel_at_period_end: false,
        });

        // Update local database
        await reactivateSubscription(userId);

        return {
          success: true,
        };

      default:
        return {
          success: false,
          error: 'Invalid action'
        };
    }
  } catch (error: any) {
    console.error('Error managing subscription:', error);
    return {
      success: false,
      error: error.message || 'Failed to manage subscription',
    };
  }
}

// Get subscription information
export async function getSubscriptionInfo(userId: string) {
  try {
    // Get customer by user ID
    const customers = await stripe.customers.list({
      limit: 100,
    });

    const customer = customers.data.find(c => c.metadata.userId === userId);
    
    if (!customer) {
      return {
        success: false,
        error: 'Customer not found'
      };
    }

    // Get subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    // Get invoices
    const invoices = await stripe.invoices.list({
      customer: customer.id,
      limit: 10,
    });

    return {
      success: true,
      subscriptions: subscriptions.data,
      invoices: invoices.data,
    };
  } catch (error: any) {
    console.error('Error getting subscription info:', error);
    return {
      success: false,
      error: error.message || 'Failed to get subscription info',
    };
  }
}
