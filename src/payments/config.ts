import { Tier, TierConfig } from './types';

// Subscription tier configurations
export const TIER_CONFIGS: Record<Tier, TierConfig> = {
  free: {
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    stripePriceId: '', // No Stripe price ID for free tier
    features: [
      '5 analyses per month',
      'Basic performance metrics',
      'Web Vitals analysis',
      'Core accessibility checks',
      'Basic SEO insights',
      'Email support'
    ],
    limits: {
      monthlyAnalyses: 5,
      aiInsights: 3,
      exportReports: 1,
      prioritySupport: false,
      customReports: false,
      apiAccess: false,
      teamCollaboration: false
    }
  },
  pro: {
    name: 'Pro',
    price: 29,
    currency: 'USD',
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
    features: [
      'Unlimited analyses',
      'Advanced performance metrics',
      'AI-powered insights',
      'Priority support',
      'Custom reports',
      'Export to PDF/CSV',
      'Advanced analytics',
      'Team collaboration (up to 5 members)',
      'API access',
      'Historical data tracking'
    ],
    limits: {
      monthlyAnalyses: -1, // Unlimited
      aiInsights: -1, // Unlimited
      exportReports: -1, // Unlimited
      prioritySupport: true,
      customReports: true,
      apiAccess: true,
      teamCollaboration: true
    }
  }
};

// Get tier configuration
export function getTierConfig(tier: Tier): TierConfig {
  return TIER_CONFIGS[tier];
}

// Get tier display name
export function getTierDisplayName(tier: Tier): string {
  return TIER_CONFIGS[tier]?.name || 'Unknown';
}

// Format price for display
export function formatPrice(price: number, currency: string = 'USD'): string {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price / 100); // Convert cents to dollars
}

// Get tier features for display
export function getTierFeatures(tier: Tier): string[] {
  return TIER_CONFIGS[tier]?.features || [];
}

// Check if tier is paid
export function isPaidTier(tier: Tier): boolean {
  return tier !== 'free';
}

// Get next available tier
export function getNextTier(currentTier: Tier): Tier | null {
  const tierOrder: Tier[] = ['free', 'pro'];
  const currentIndex = tierOrder.indexOf(currentTier);
  
  if (currentIndex === -1 || currentIndex === tierOrder.length - 1) {
    return null;
  }
  
  return tierOrder[currentIndex + 1];
}

// Check if tier upgrade is available
export function canUpgradeTier(currentTier: Tier): boolean {
  return getNextTier(currentTier) !== null;
}

// Check if tier downgrade is available
export function canDowngradeTier(currentTier: Tier): boolean {
  const tierOrder: Tier[] = ['free', 'pro'];
  const currentIndex = tierOrder.indexOf(currentTier);
  return currentIndex > 0;
}

// Get previous tier
export function getPreviousTier(currentTier: Tier): Tier | null {
  const tierOrder: Tier[] = ['free', 'pro'];
  const currentIndex = tierOrder.indexOf(currentTier);
  
  if (currentIndex <= 0) {
    return null;
  }
  
  return tierOrder[currentIndex - 1];
}
