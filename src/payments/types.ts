// Payment and subscription related types

export type Tier = 'free' | 'pro' | 'enterprise';

export interface TierConfig {
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    analysesPerMonth: number;
    teamMembers?: number;
    prioritySupport?: boolean;
    customReports?: boolean;
  };
  stripePriceId?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: Tier;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentResult {
  success: boolean;
  message?: string;
  error?: string;
  redirectUrl?: string;
}

export interface SubscriptionManagementResult {
  success: boolean;
  message?: string;
  error?: string;
  subscription?: Subscription;
}
