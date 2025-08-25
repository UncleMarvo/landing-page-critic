import { Tier, TierConfig } from './types';

// Subscription tier configurations
export const TIER_CONFIGS: Record<Tier, TierConfig> = {
  free: {
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      '5 analyses per month',
      'Basic performance metrics',
      'Web Vitals analysis',
      'Email support'
    ],
    limits: {
      analysesPerMonth: 5,
      prioritySupport: false,
      customReports: false
    }
  },
  pro: {
    name: 'Pro',
    price: 29,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited analyses',
      'Advanced performance metrics',
      'AI-powered insights',
      'Priority support',
      'Custom reports',
      'Team collaboration (up to 5 members)'
    ],
    limits: {
      analysesPerMonth: -1, // Unlimited
      teamMembers: 5,
      prioritySupport: true,
      customReports: true
    },
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Advanced analytics',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantees'
    ],
    limits: {
      analysesPerMonth: -1, // Unlimited
      teamMembers: -1, // Unlimited
      prioritySupport: true,
      customReports: true
    },
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID
  }
};

// Get tier configuration
export function getTierConfig(tier: Tier): TierConfig {
  return TIER_CONFIGS[tier];
}

// Get display name for tier
export function getTierDisplayName(tier: Tier): string {
  return TIER_CONFIGS[tier].name;
}

// Format price for display
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
}

// Get tier features
export function getTierFeatures(tier: Tier): string[] {
  return TIER_CONFIGS[tier].features;
}

// Check if tier has unlimited analyses
export function hasUnlimitedAnalyses(tier: Tier): boolean {
  return TIER_CONFIGS[tier].limits.analysesPerMonth === -1;
}

// Get analyses limit for tier
export function getAnalysesLimit(tier: Tier): number {
  return TIER_CONFIGS[tier].limits.analysesPerMonth;
}

// Check if tier has priority support
export function hasPrioritySupport(tier: Tier): boolean {
  return TIER_CONFIGS[tier].limits.prioritySupport || false;
}

// Check if tier has custom reports
export function hasCustomReports(tier: Tier): boolean {
  return TIER_CONFIGS[tier].limits.customReports || false;
}

// Get team member limit for tier
export function getTeamMemberLimit(tier: Tier): number {
  return TIER_CONFIGS[tier].limits.teamMembers || 0;
}

// Check if tier has unlimited team members
export function hasUnlimitedTeamMembers(tier: Tier): boolean {
  return TIER_CONFIGS[tier].limits.teamMembers === -1;
}
