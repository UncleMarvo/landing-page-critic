import { PrismaClient } from '@prisma/client';
import { Tier, SubscriptionStatus, UserSubscription } from './types';
import { getTierConfig } from './config';

const prisma = new PrismaClient();

// Get user subscription information
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        tier: true,
        subscriptionStatus: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      }
    });

    if (!user) {
      return null;
    }

    return {
      tier: user.tier as Tier,
      status: user.subscriptionStatus as SubscriptionStatus,
      currentPeriodEnd: user.currentPeriodEnd || undefined,
      cancelAtPeriodEnd: user.cancelAtPeriodEnd,
      stripeCustomerId: user.stripeCustomerId || undefined,
      stripeSubscriptionId: user.stripeSubscriptionId || undefined,
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    throw new Error('Failed to get user subscription');
  }
}

// Update user subscription
export async function updateUserSubscription(
  userId: string,
  updates: {
    tier?: Tier;
    subscriptionStatus?: SubscriptionStatus;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }
): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: updates,
    });
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw new Error('Failed to update user subscription');
  }
}

// Create or update Stripe customer
export async function createOrUpdateStripeCustomer(
  userId: string,
  stripeCustomerId: string,
  email: string,
  name?: string
): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId,
        email,
        name: name || undefined,
      },
    });
  } catch (error) {
    console.error('Error creating/updating Stripe customer:', error);
    throw new Error('Failed to create/update Stripe customer');
  }
}

// Get user by Stripe customer ID
export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  try {
    return await prisma.user.findUnique({
      where: { stripeCustomerId },
    });
  } catch (error) {
    console.error('Error getting user by Stripe customer ID:', error);
    throw new Error('Failed to get user by Stripe customer ID');
  }
}

// Get user by Stripe subscription ID
export async function getUserByStripeSubscriptionId(stripeSubscriptionId: string) {
  try {
    return await prisma.user.findUnique({
      where: { stripeSubscriptionId },
    });
  } catch (error) {
    console.error('Error getting user by Stripe subscription ID:', error);
    throw new Error('Failed to get user by Stripe subscription ID');
  }
}

// Create invoice record
export async function createInvoice(
  userId: string,
  stripeInvoiceId: string,
  amount: number,
  currency: string,
  status: string,
  invoicePdf?: string,
  hostedInvoiceUrl?: string
): Promise<void> {
  try {
    await prisma.invoice.create({
      data: {
        stripeInvoiceId,
        amount,
        currency,
        status,
        invoicePdf,
        hostedInvoiceUrl,
        userId,
      },
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw new Error('Failed to create invoice');
  }
}

// Get user invoices
export async function getUserInvoices(userId: string, limit: number = 10) {
  try {
    return await prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch (error) {
    console.error('Error getting user invoices:', error);
    throw new Error('Failed to get user invoices');
  }
}

// Check if user has active subscription
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        currentPeriodEnd: true,
      }
    });

    if (!user) {
      return false;
    }

    const activeStatuses: SubscriptionStatus[] = ['active', 'trialing'];
    const isActiveStatus = activeStatuses.includes(user.subscriptionStatus as SubscriptionStatus);
    
    // Check if subscription hasn't expired
    const isNotExpired = !user.currentPeriodEnd || user.currentPeriodEnd > new Date();

    return isActiveStatus && isNotExpired;
  } catch (error) {
    console.error('Error checking active subscription:', error);
    return false;
  }
}

// Get user usage statistics
export async function getUserUsage(userId: string) {
  try {
    const [auditResults, aiInsights] = await Promise.all([
      prisma.auditResult.count({
        where: { userId },
      }),
      prisma.aiInsight.count({
        where: { userId },
      }),
    ]);

    return {
      auditResults,
      aiInsights,
    };
  } catch (error) {
    console.error('Error getting user usage:', error);
    throw new Error('Failed to get user usage');
  }
}

// Check if user can perform action based on tier limits
export async function canPerformAction(
  userId: string,
  action: 'audit' | 'aiInsight' | 'exportReport'
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true }
    });

    if (!user) {
      return false;
    }

    const tierConfig = getTierConfig(user.tier);
    if (!tierConfig) {
      return false;
    }

    // Get current usage
    const usage = await getUserUsage(userId);
    
    switch (action) {
      case 'audit':
        return usage.auditResults < (tierConfig.limits.monthlyAnalyses || 0);
      case 'aiInsight':
        return usage.aiInsights < (tierConfig.limits.aiInsights || 0);
      case 'exportReport':
        return usage.auditResults < (tierConfig.limits.exportReports || 0);
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking action permission:', error);
    return false;
  }
}

// Reset user to free tier
export async function resetToFreeTier(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        tier: 'free',
        subscriptionStatus: 'inactive',
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      },
    });
  } catch (error) {
    console.error('Error resetting user to free tier:', error);
    throw new Error('Failed to reset user to free tier');
  }
}
