import { Tier, FeatureAccess } from './types';
import { getTierConfig } from './config';

// Server-side access control functions
export function getFeatureAccess(tier: Tier): FeatureAccess {
  const tierConfig = getTierConfig(tier);
  
  if (!tierConfig) {
    // Default to most restrictive access
    return {
      canAccessAIInsights: false,
      canExportReports: false,
      canAccessAdvancedMetrics: false,
      canAccessPrioritySupport: false,
      canAccessAPI: false,
      canAccessTeamCollaboration: false,
      monthlyAnalysesLimit: 0,
      aiInsightsLimit: 0,
      exportReportsLimit: 0,
    };
  }

  return {
    canAccessAIInsights: tier !== 'free',
    canExportReports: tier !== 'free',
    canAccessAdvancedMetrics: tier === 'pro',
    canAccessPrioritySupport: tierConfig.limits.prioritySupport,
    canAccessAPI: tierConfig.limits.apiAccess,
    canAccessTeamCollaboration: tierConfig.limits.teamCollaboration,
    monthlyAnalysesLimit: tierConfig.limits.monthlyAnalyses || 0,
    aiInsightsLimit: tierConfig.limits.aiInsights || 0,
    exportReportsLimit: tierConfig.limits.exportReports || 0,
  };
}

// Check if user can access a specific feature
export function canAccessFeature(tier: Tier, feature: keyof FeatureAccess): boolean {
  const access = getFeatureAccess(tier);
  return access[feature] as boolean;
}

// Check if user can perform an action based on tier
export function canPerformAction(tier: Tier, action: string): boolean {
  switch (action) {
    case 'audit':
      return true; // All users can do basic audits
    case 'aiInsight':
      return tier !== 'free';
    case 'exportReport':
      return tier !== 'free';
    case 'advancedMetrics':
      return tier === 'pro';
    case 'prioritySupport':
      return tier === 'pro';
    case 'apiAccess':
      return tier === 'pro';
    case 'teamCollaboration':
      return tier === 'pro';
    case 'customReports':
      return tier === 'pro';
    default:
      return false;
  }
}

// Get tier features for display
export function getTierFeatures(tier: Tier): string[] {
  const tierConfig = getTierConfig(tier);
  return tierConfig?.features || [];
}

// Check if tier upgrade is available
export function canUpgradeTier(currentTier: Tier): boolean {
  const tierOrder = ['free', 'pro'];
  const currentIndex = tierOrder.indexOf(currentTier);
  return currentIndex < tierOrder.length - 1;
}

// Check if tier downgrade is available
export function canDowngradeTier(currentTier: Tier): boolean {
  const tierOrder = ['free', 'pro'];
  const currentIndex = tierOrder.indexOf(currentTier);
  return currentIndex > 0;
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

// Get previous tier
export function getPreviousTier(currentTier: Tier): Tier | null {
  const tierOrder: Tier[] = ['free', 'pro'];
  const currentIndex = tierOrder.indexOf(currentTier);
  
  if (currentIndex <= 0) {
    return null;
  }
  
  return tierOrder[currentIndex - 1];
}

// Check if user has exceeded their limits
export function hasExceededLimit(
  tier: Tier,
  currentUsage: number,
  limitType: 'monthlyAnalyses' | 'aiInsights' | 'exportReports'
): boolean {
  const tierConfig = getTierConfig(tier);
  if (!tierConfig) {
    return true; // No config means no access
  }

  const limit = tierConfig.limits[limitType] || 0;
  
  // -1 means unlimited
  if (limit === -1) {
    return false;
  }
  
  return currentUsage >= limit;
}

// Get remaining usage for a limit type
export function getRemainingUsage(
  tier: Tier,
  currentUsage: number,
  limitType: 'monthlyAnalyses' | 'aiInsights' | 'exportReports'
): number {
  const tierConfig = getTierConfig(tier);
  if (!tierConfig) {
    return 0;
  }

  const limit = tierConfig.limits[limitType] || 0;
  
  // -1 means unlimited
  if (limit === -1) {
    return -1; // Unlimited
  }
  
  return Math.max(0, limit - currentUsage);
}

// Check if tier has unlimited access for a specific feature
export function hasUnlimitedAccess(
  tier: Tier,
  feature: 'monthlyAnalyses' | 'aiInsights' | 'exportReports'
): boolean {
  const tierConfig = getTierConfig(tier);
  if (!tierConfig) {
    return false;
  }

  return tierConfig.limits[feature] === -1;
}

// Get usage percentage for a limit type
export function getUsagePercentage(
  tier: Tier,
  currentUsage: number,
  limitType: 'monthlyAnalyses' | 'aiInsights' | 'exportReports'
): number {
  const tierConfig = getTierConfig(tier);
  if (!tierConfig) {
    return 100;
  }

  const limit = tierConfig.limits[limitType] || 0;
  
  // -1 means unlimited
  if (limit === -1) {
    return 0; // 0% usage for unlimited
  }
  
  if (limit === 0) {
    return 100;
  }
  
  return Math.min(100, (currentUsage / limit) * 100);
}

// Check if subscription is active
export function isSubscriptionActive(status: string): boolean {
  const activeStatuses = ['active', 'trialing'];
  return activeStatuses.includes(status);
}

// Check if subscription is past due
export function isSubscriptionPastDue(status: string): boolean {
  return status === 'past_due';
}

// Check if subscription is canceled
export function isSubscriptionCanceled(status: string): boolean {
  return status === 'canceled';
}

// Get subscription status display text
export function getSubscriptionStatusText(status: string): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'trialing':
      return 'Trial';
    case 'past_due':
      return 'Past Due';
    case 'canceled':
      return 'Canceled';
    case 'incomplete':
      return 'Incomplete';
    case 'incomplete_expired':
      return 'Expired';
    case 'unpaid':
      return 'Unpaid';
    case 'inactive':
    default:
      return 'Inactive';
  }
}

// Get subscription status color for UI
export function getSubscriptionStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'green';
    case 'trialing':
      return 'blue';
    case 'past_due':
      return 'yellow';
    case 'canceled':
      return 'red';
    case 'unpaid':
      return 'red';
    case 'incomplete':
      return 'yellow';
    case 'incomplete_expired':
      return 'red';
    default:
      return 'gray';
  }
}

// Validate tier name
export function isValidTier(tier: string): tier is Tier {
  return ['free', 'pro'].includes(tier);
}

// Get tier display name
export function getTierDisplayName(tier: Tier): string {
  const tierConfig = getTierConfig(tier);
  return tierConfig?.name || 'Unknown';
}

// Check if tier is paid
export function isPaidTier(tier: Tier): boolean {
  return tier !== 'free';
}

// Get upgrade prompt message for restricted features
export function getUpgradePrompt(feature: string): string {
  const prompts: Record<string, string> = {
    aiInsights: 'Upgrade to Pro to access AI-powered insights and recommendations',
    exportReports: 'Upgrade to Pro to export detailed reports in PDF and CSV formats',
    advancedMetrics: 'Upgrade to Pro to access advanced performance metrics and analytics',
    prioritySupport: 'Upgrade to Pro to get priority support and faster response times',
    apiAccess: 'Upgrade to Pro to access our API for automated testing and integrations',
    teamCollaboration: 'Upgrade to Pro to collaborate with your team members',
    unlimitedAnalyses: 'Upgrade to Pro for unlimited monthly analyses',
  };
  
  return prompts[feature] || 'Upgrade to Pro to access this feature';
}
