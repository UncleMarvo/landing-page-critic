import { PaymentConfig, TierConfig } from './types';

// Load payment configuration from environment variables
export function getPaymentConfig(): PaymentConfig {
  const currency = process.env.STRIPE_CURRENCY || 'usd';
  const trialDays = process.env.STRIPE_TRIAL_DAYS ? parseInt(process.env.STRIPE_TRIAL_DAYS) : undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  // Tier configurations
  const tiers: Record<string, TierConfig> = {
    free: {
      name: 'Free',
      price: 0,
      currency,
      interval: 'month',
      stripePriceId: '', // No Stripe price ID for free tier
      features: [
        'Basic performance analysis',
        'Limited monthly analyses',
        'Core Web Vitals metrics',
        'Basic accessibility checks'
      ],
      limits: {
        monthlyAnalyses: parseInt(process.env.FREE_TIER_MONTHLY_ANALYSES || '5'),
        aiInsights: parseInt(process.env.FREE_TIER_AI_INSIGHTS || '3'),
        exportReports: parseInt(process.env.FREE_TIER_EXPORT_REPORTS || '1'),
        priority: false
      }
    },
    basic: {
      name: 'Basic',
      price: parseInt(process.env.BASIC_TIER_PRICE || '999'), // $9.99 in cents
      currency,
      interval: 'month',
      stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || '',
      features: [
        'Everything in Free',
        'Unlimited monthly analyses',
        'AI-powered insights',
        'Export reports',
        'Advanced metrics',
        'Email support'
      ],
      limits: {
        monthlyAnalyses: parseInt(process.env.BASIC_TIER_MONTHLY_ANALYSES || '100'),
        aiInsights: parseInt(process.env.BASIC_TIER_AI_INSIGHTS || '50'),
        exportReports: parseInt(process.env.BASIC_TIER_EXPORT_REPORTS || '10'),
        priority: false
      }
    },
    pro: {
      name: 'Pro',
      price: parseInt(process.env.PRO_TIER_PRICE || '2999'), // $29.99 in cents
      currency,
      interval: 'month',
      stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
      features: [
        'Everything in Basic',
        'Unlimited everything',
        'Priority support',
        'Advanced analytics',
        'Custom reports',
        'API access',
        'Team collaboration'
      ],
      limits: {
        monthlyAnalyses: parseInt(process.env.PRO_TIER_MONTHLY_ANALYSES || '999999'),
        aiInsights: parseInt(process.env.PRO_TIER_AI_INSIGHTS || '999999'),
        exportReports: parseInt(process.env.PRO_TIER_EXPORT_REPORTS || '999999'),
        priority: true
      }
    }
  };

  return {
    currency,
    tiers,
    trialDays,
    webhookSecret
  };
}

// Helper function to get tier configuration
export function getTierConfig(tier: string): TierConfig | null {
  const config = getPaymentConfig();
  return config.tiers[tier] || null;
}

// Helper function to format price for display
export function formatPrice(price: number, currency: string = 'usd'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  });
  
  return formatter.format(price / 100); // Convert cents to dollars
}

// Helper function to get tier display name
export function getTierDisplayName(tier: string): string {
  const tierConfig = getTierConfig(tier);
  return tierConfig?.name || 'Unknown';
}

// Helper function to check if tier is paid
export function isPaidTier(tier: string): boolean {
  return tier !== 'free';
}

// Helper function to get next tier
export function getNextTier(currentTier: string): string | null {
  const tierOrder = ['free', 'basic', 'pro'];
  const currentIndex = tierOrder.indexOf(currentTier);
  
  if (currentIndex === -1 || currentIndex === tierOrder.length - 1) {
    return null;
  }
  
  return tierOrder[currentIndex + 1];
}

// Helper function to get previous tier
export function getPreviousTier(currentTier: string): string | null {
  const tierOrder = ['free', 'basic', 'pro'];
  const currentIndex = tierOrder.indexOf(currentTier);
  
  if (currentIndex <= 0) {
    return null;
  }
  
  return tierOrder[currentIndex - 1];
}
