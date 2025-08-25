// Tier definitions
export type Tier = 'free' | 'pro';

// Subscription status
export type SubscriptionStatus = 
  | 'active' 
  | 'canceled' 
  | 'past_due' 
  | 'incomplete' 
  | 'incomplete_expired' 
  | 'trialing' 
  | 'unpaid';

// Subscription interface
export interface Subscription {
  id: string;
  userId: string;
  tier: Tier;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Payment result interface
export interface PaymentResult {
  success: boolean;
  error?: string;
  sessionId?: string;
  url?: string;
}

// Subscription management result
export interface SubscriptionManagementResult {
  success: boolean;
  error?: string;
  subscription?: Subscription;
}

// Stripe invoice interface
export interface StripeInvoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  created: number;
}

// Tier configuration interface
export interface TierConfig {
  name: string;
  price: number; // in cents
  currency: string;
  interval: 'month' | 'year';
  stripePriceId: string;
  features: string[];
  limits: {
    monthlyAnalyses: number; // -1 for unlimited
    aiInsights: number; // -1 for unlimited
    exportReports: number; // -1 for unlimited
    prioritySupport: boolean;
    customReports: boolean;
    apiAccess: boolean;
    teamCollaboration: boolean;
  };
}

// Payment configuration interface
export interface PaymentConfig {
  currency: string;
  tiers: Record<string, TierConfig>;
  trialDays?: number;
  webhookSecret: string;
}

// Checkout session data
export interface CheckoutSessionData {
  tier: Tier;
  successUrl: string;
  cancelUrl: string;
  customerEmail: string;
  customerId: string;
}

// Subscription update data
export interface SubscriptionUpdateData {
  tier: Tier;
  action: 'upgrade' | 'downgrade' | 'cancel';
}

// Feature access interface
export interface FeatureAccess {
  canAccessAIInsights: boolean;
  canExportReports: boolean;
  canAccessAdvancedMetrics: boolean;
  canAccessPrioritySupport: boolean;
  canAccessAPI: boolean;
  canAccessTeamCollaboration: boolean;
  monthlyAnalysesLimit: number;
  aiInsightsLimit: number;
  exportReportsLimit: number;
}

// User subscription info
export interface UserSubscription {
  tier: Tier;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
}

// Usage tracking interface
export interface UserUsage {
  auditResults: number;
  aiInsights: number;
  exportReports: number;
  periodStart: Date;
  periodEnd: Date;
}
