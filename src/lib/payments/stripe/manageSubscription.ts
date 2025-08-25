import { getStripeClient, handleStripeError } from './stripeClient';
import { SubscriptionUpdateData, Tier } from '../types';
import { getTierConfig } from '../config';
import { updateUserSubscription, getUserByStripeSubscriptionId } from '../subscriptionService';

export async function upgradeSubscription(subscriptionId: string, newTier: Tier) {
  try {
    const stripe = getStripeClient();
    
    // Validate new tier
    const newTierConfig = getTierConfig(newTier);
    if (!newTierConfig || !newTierConfig.stripePriceId) {
      throw new Error(`Invalid tier or missing price ID: ${newTier}`);
    }

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Get the subscription item ID (there should be only one)
    const subscriptionItemId = subscription.items.data[0]?.id;
    if (!subscriptionItemId) {
      throw new Error('No subscription items found');
    }

    // Update the subscription with new price
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscriptionItemId,
        price: newTierConfig.stripePriceId,
      }],
      proration_behavior: 'create_prorations', // or 'none', 'always_invoice'
      metadata: {
        tier: newTier,
      },
    });

    // Update user in database
    const user = await getUserByStripeSubscriptionId(subscriptionId);
    if (user) {
      await updateUserSubscription(user.id, {
        tier: newTier,
        subscriptionStatus: updatedSubscription.status as any,
        currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
      });
    }

    return {
      success: true,
      subscription: updatedSubscription,
    };
  } catch (error: any) {
    return handleStripeError(error);
  }
}

export async function downgradeSubscription(subscriptionId: string, newTier: Tier) {
  try {
    const stripe = getStripeClient();
    
    // Validate new tier
    const newTierConfig = getTierConfig(newTier);
    if (!newTierConfig || !newTierConfig.stripePriceId) {
      throw new Error(`Invalid tier or missing price ID: ${newTier}`);
    }

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Get the subscription item ID
    const subscriptionItemId = subscription.items.data[0]?.id;
    if (!subscriptionItemId) {
      throw new Error('No subscription items found');
    }

    // Update the subscription with new price
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscriptionItemId,
        price: newTierConfig.stripePriceId,
      }],
      proration_behavior: 'create_prorations',
      metadata: {
        tier: newTier,
      },
    });

    // Update user in database
    const user = await getUserByStripeSubscriptionId(subscriptionId);
    if (user) {
      await updateUserSubscription(user.id, {
        tier: newTier,
        subscriptionStatus: updatedSubscription.status as any,
        currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
      });
    }

    return {
      success: true,
      subscription: updatedSubscription,
    };
  } catch (error: any) {
    return handleStripeError(error);
  }
}

export async function cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true) {
  try {
    const stripe = getStripeClient();

    let updatedSubscription;
    
    if (cancelAtPeriodEnd) {
      // Cancel at period end
      updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } else {
      // Cancel immediately
      updatedSubscription = await stripe.subscriptions.cancel(subscriptionId);
    }

    // Update user in database
    const user = await getUserByStripeSubscriptionId(subscriptionId);
    if (user) {
      await updateUserSubscription(user.id, {
        subscriptionStatus: updatedSubscription.status as any,
        cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
        currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
      });
    }

    return {
      success: true,
      subscription: updatedSubscription,
    };
  } catch (error: any) {
    return handleStripeError(error);
  }
}

export async function reactivateSubscription(subscriptionId: string) {
  try {
    const stripe = getStripeClient();

    // Reactivate subscription by removing cancel_at_period_end
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    // Update user in database
    const user = await getUserByStripeSubscriptionId(subscriptionId);
    if (user) {
      await updateUserSubscription(user.id, {
        subscriptionStatus: updatedSubscription.status as any,
        cancelAtPeriodEnd: false,
      });
    }

    return {
      success: true,
      subscription: updatedSubscription,
    };
  } catch (error: any) {
    return handleStripeError(error);
  }
}

export async function getSubscription(subscriptionId: string) {
  try {
    const stripe = getStripeClient();

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return {
      success: true,
      subscription,
    };
  } catch (error: any) {
    return handleStripeError(error);
  }
}

export async function listSubscriptionInvoices(customerId: string, limit: number = 10) {
  try {
    const stripe = getStripeClient();

    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
      status: 'paid',
    });

    return {
      success: true,
      invoices: invoices.data,
    };
  } catch (error: any) {
    return handleStripeError(error);
  }
}

export async function getUpcomingInvoice(customerId: string, subscriptionId?: string) {
  try {
    const stripe = getStripeClient();

    const params: any = {
      customer: customerId,
    };

    if (subscriptionId) {
      params.subscription = subscriptionId;
    }

    const invoice = await stripe.invoices.retrieveUpcoming(params);

    return {
      success: true,
      invoice,
    };
  } catch (error: any) {
    return handleStripeError(error);
  }
}

export async function updatePaymentMethod(subscriptionId: string, paymentMethodId: string) {
  try {
    const stripe = getStripeClient();

    // Get the subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: subscription.customer as string,
    });

    // Set as default payment method
    await stripe.customers.update(subscription.customer as string, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return {
      success: true,
    };
  } catch (error: any) {
    return handleStripeError(error);
  }
}
