// Payment and subscription types

export type Tier = 'free' | 'basic' | 'pro';

export type SubscriptionStatus = 
  | 'active' 
  | 'canceled' 
  | 'past_due' 
  | 'incomplete' 
  | 'incomplete_expired' 
  | 'trialing' 
  | 'unpaid' 
  | 'inactive';

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  created: number;
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: SubscriptionStatus;
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        unit_amount: number;
        currency: string;
        recurring: {
          interval: string;
        };
      };
    }>;
  };
}

export interface StripeInvoice {
  id: string;
  customer: string;
  amount_paid: number;
  currency: string;
  status: string;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  created: number;
}

export interface TierConfig {
  name: string;
  price: number; // in cents
  currency: string;
  interval: 'month' | 'year';
  stripePriceId: string;
  features: string[];
  limits: {
    monthlyAnalyses?: number;
    aiInsights?: number;
    exportReports?: number;
    scheduledReports?: number;
    prioritySupport?: boolean;
    customReports?: boolean;
    apiAccess?: boolean;
    teamCollaboration?: boolean;
  };
}

export interface PaymentConfig {
  currency: string;
  tiers: Record<Tier, TierConfig>;
  trialDays?: number;
  webhookSecret: string;
}

export interface CheckoutSessionData {
  tier: Tier;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  customerId?: string;
}

export interface SubscriptionUpdateData {
  tier: Tier;
  action: 'upgrade' | 'downgrade' | 'cancel';
}

export interface FeatureAccess {
  canAccessAIInsights: boolean;
  canExportReports: boolean;
  canAccessScheduledReports: boolean;
  canAccessAdvancedMetrics: boolean;
  canAccessPrioritySupport: boolean;
  canAccessAPI: boolean;
  canAccessTeamCollaboration: boolean;
  monthlyAnalysesLimit: number;
  aiInsightsLimit: number;
  exportReportsLimit: number;
  scheduledReportsLimit: number;
}

export interface UserSubscription {
  tier: Tier;
  status: SubscriptionStatus;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}
