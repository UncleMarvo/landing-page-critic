import { prisma } from '@/lib/prisma';
import { Subscription, Tier } from './types';

// Get user subscription from database (using User model fields)
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        tier: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionStatus: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return null;
    }

    // Convert User model fields to Subscription interface
    return {
      id: user.id,
      userId: user.id,
      tier: user.tier as Tier,
      stripeSubscriptionId: user.stripeSubscriptionId || undefined,
      stripeCustomerId: user.stripeCustomerId || undefined,
      subscriptionStatus: user.subscriptionStatus as any,
      currentPeriodStart: user.createdAt, // Use createdAt as period start
      currentPeriodEnd: user.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: user.cancelAtPeriodEnd,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

// Create or update subscription (using User model fields)
export async function upsertSubscription(
  userId: string,
  tier: Tier,
  stripeSubscriptionId?: string,
  stripeCustomerId?: string
): Promise<Subscription | null> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        tier,
        stripeSubscriptionId,
        stripeCustomerId,
        subscriptionStatus: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        cancelAtPeriodEnd: false,
        updatedAt: new Date()
      },
      select: {
        id: true,
        tier: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionStatus: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    // Convert User model fields to Subscription interface
    return {
      id: user.id,
      userId: user.id,
      tier: user.tier as Tier,
      stripeSubscriptionId: user.stripeSubscriptionId || undefined,
      stripeCustomerId: user.stripeCustomerId || undefined,
      subscriptionStatus: user.subscriptionStatus as any,
      currentPeriodStart: user.createdAt,
      currentPeriodEnd: user.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: user.cancelAtPeriodEnd,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  } catch (error) {
    console.error('Error upserting subscription:', error);
    return null;
  }
}

// Cancel subscription (using User model fields)
export async function cancelSubscription(userId: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        cancelAtPeriodEnd: true,
        updatedAt: new Date()
      }
    });
    return true;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return false;
  }
}

// Reactivate subscription (using User model fields)
export async function reactivateSubscription(userId: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        cancelAtPeriodEnd: false,
        updatedAt: new Date()
      }
    });
    return true;
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return false;
  }
}

// Update subscription status (using User model fields)
export async function updateSubscriptionStatus(
  userId: string,
  status: string
): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: status,
        updatedAt: new Date()
      }
    });
    return true;
  } catch (error) {
    console.error('Error updating subscription status:', error);
    return false;
  }
}

// Check if user has active subscription (using User model fields)
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true
      }
    });
    return user?.subscriptionStatus === 'active';
  } catch (error) {
    console.error('Error checking active subscription:', error);
    return false;
  }
}

// Get subscription tier for user (using User model fields)
export async function getUserTier(userId: string): Promise<Tier> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        tier: true
      }
    });
    return (user?.tier as Tier) || 'free';
  } catch (error) {
    console.error('Error getting user tier:', error);
    return 'free';
  }
}
