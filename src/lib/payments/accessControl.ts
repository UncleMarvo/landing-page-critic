import { Tier, FeatureAccess } from './types';
import { getTierConfig } from './config';

// Server-side access control functions
export function getFeatureAccess(tier: Tier, feature?: string): { hasAccess: boolean; limit?: number; used?: number; remaining?: number } {
  const tierConfig = getTierConfig(tier);
  
  if (!tierConfig) {
    return { hasAccess: false };
  }

  // If a specific feature is requested, return access info for that feature
  if (feature) {
    switch (feature) {
      case 'aiInsights':
        return { 
          hasAccess: tier !== 'free',
          limit: tierConfig.limits.aiInsights || 0
        };
      case 'exportReports':
        return { 
          hasAccess: tier !== 'free',
          limit: tierConfig.limits.exportReports || 0
        };
      case 'scheduledReports':
        return { 
          hasAccess: tier === 'pro',
          limit: tierConfig.limits.scheduledReports || 0
        };
      case 'advancedMetrics':
        return { hasAccess: tier === 'pro' };
      case 'historicalData':
        return { hasAccess: tier === 'pro' };
      case 'performanceMetrics':
        return { hasAccess: tier === 'pro' };
      case 'detailedRecommendations':
        return { hasAccess: tier === 'pro' };
      case 'multipleSiteTracking':
        return { hasAccess: tier === 'pro' };
      case 'prioritySupport':
        return { hasAccess: tierConfig.limits.prioritySupport || false };
      case 'apiAccess':
        return { hasAccess: tierConfig.limits.apiAccess || false };
      case 'teamCollaboration':
        return { hasAccess: tierConfig.limits.teamCollaboration || false };
      case 'customReports':
        return { hasAccess: tierConfig.limits.customReports || false };
      default:
        return { hasAccess: false };
    }
  }

  // Return full feature access object (for backward compatibility)
  return {
    canAccessAIInsights: tier !== 'free',
    canExportReports: tier !== 'free',
    canAccessScheduledReports: tier === 'pro',
    canAccessAdvancedMetrics: tier === 'pro',
    canAccessPrioritySupport: tierConfig.limits.prioritySupport || false,
    canAccessAPI: tierConfig.limits.apiAccess || false,
    canAccessTeamCollaboration: tierConfig.limits.teamCollaboration || false,
    monthlyAnalysesLimit: tierConfig.limits.monthlyAnalyses || 0,
    aiInsightsLimit: tierConfig.limits.aiInsights || 0,
    exportReportsLimit: tierConfig.limits.exportReports || 0,
    scheduledReportsLimit: tierConfig.limits.scheduledReports || 0,
  } as any;
}

// Check if user can access a specific feature
export function canAccessFeature(tier: Tier, feature: string): boolean {
  const access = getFeatureAccess(tier, feature);
  return access.hasAccess;
}

// Check if user can perform an action based on tier and usage
export async function canPerformAction(userId: string, action: string): Promise<{ allowed: boolean; limit: number; used: number; remaining: number }> {
  // Get user from database to check current usage
  const { prisma } = await import('@/lib/prisma');
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tier: true,
      analysesUsed: true,
      aiInsightsUsed: true,
      exportReportsUsed: true,
      scheduledReportsUsed: true
    }
  });

  if (!user) {
    return { allowed: false, limit: 0, used: 0, remaining: 0 };
  }

  const tierConfig = getTierConfig(user.tier as Tier);
  if (!tierConfig) {
    return { allowed: false, limit: 0, used: 0, remaining: 0 };
  }

  switch (action) {
    case 'audit':
      const auditLimit = tierConfig.limits.monthlyAnalyses || 0;
      const auditUsed = user.analysesUsed || 0;
      const auditRemaining = auditLimit === -1 ? -1 : Math.max(0, auditLimit - auditUsed);
      return {
        allowed: auditLimit === -1 || auditUsed < auditLimit,
        limit: auditLimit,
        used: auditUsed,
        remaining: auditRemaining
      };

    case 'aiInsights':
      const aiLimit = tierConfig.limits.aiInsights || 0;
      const aiUsed = user.aiInsightsUsed || 0;
      const aiRemaining = aiLimit === -1 ? -1 : Math.max(0, aiLimit - aiUsed);
      return {
        allowed: aiLimit === -1 || aiUsed < aiLimit,
        limit: aiLimit,
        used: aiUsed,
        remaining: aiRemaining
      };

    case 'exportReports':
      const exportLimit = tierConfig.limits.exportReports || 0;
      const exportUsed = user.exportReportsUsed || 0;
      const exportRemaining = exportLimit === -1 ? -1 : Math.max(0, exportLimit - exportUsed);
      return {
        allowed: exportLimit === -1 || exportUsed < exportLimit,
        limit: exportLimit,
        used: exportUsed,
        remaining: exportRemaining
      };

    case 'scheduledReports':
      const scheduledLimit = tierConfig.limits.scheduledReports || 0;
      const scheduledUsed = user.scheduledReportsUsed || 0;
      const scheduledRemaining = scheduledLimit === -1 ? -1 : Math.max(0, scheduledLimit - scheduledUsed);
      return {
        allowed: scheduledLimit === -1 || scheduledUsed < scheduledLimit,
        limit: scheduledLimit,
        used: scheduledUsed,
        remaining: scheduledRemaining
      };

    case 'advancedMetrics':
      return { allowed: user.tier === 'pro', limit: -1, used: 0, remaining: -1 };

    case 'prioritySupport':
      return { allowed: tierConfig.limits.prioritySupport || false, limit: -1, used: 0, remaining: -1 };

    case 'apiAccess':
      return { allowed: tierConfig.limits.apiAccess || false, limit: -1, used: 0, remaining: -1 };

    case 'teamCollaboration':
      return { allowed: tierConfig.limits.teamCollaboration || false, limit: -1, used: 0, remaining: -1 };

    case 'customReports':
      return { allowed: tierConfig.limits.customReports || false, limit: -1, used: 0, remaining: -1 };

    default:
      return { allowed: false, limit: 0, used: 0, remaining: 0 };
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
    scheduledReports: 'Upgrade to Pro to set up automated email reports',
    advancedMetrics: 'Upgrade to Pro to access advanced performance metrics and analytics',
    historicalData: 'Upgrade to Pro to view historical performance data and trends',
    performanceMetrics: 'Upgrade to Pro to access detailed performance metrics and historical trends',
    detailedRecommendations: 'Upgrade to Pro to get comprehensive recommendations with implementation steps',
    multipleSiteTracking: 'Upgrade to Pro to track multiple websites and compare performance',
    prioritySupport: 'Upgrade to Pro to get priority support and faster response times',
    apiAccess: 'Upgrade to Pro to access our API for automated testing and integrations',
    teamCollaboration: 'Upgrade to Pro to collaborate with your team members',
    customReports: 'Upgrade to Pro to create custom reports and dashboards',
    unlimitedAnalyses: 'Upgrade to Pro for unlimited monthly analyses',
  };
  
  return prompts[feature] || 'Upgrade to Pro to access this feature';
}

// Get title for restricted features
export function getUpgradeTitle(feature: string): string {
  const prompts: Record<string, string> = {
    aiInsights: 'AI-Powered Insights and Recommendations',
    exportReports: 'Export Detailed Reports',
    scheduledReports: 'Scheduled Reports',
    advancedMetrics: 'Advanced Performance Metrics',
    historicalData: 'Historical Performance and Trends',
    performanceMetrics: 'Detailed Performance Metrics',
    detailedRecommendations: 'Detailed Recommendations',
    multipleSiteTracking: 'Track Multiple Sites',
    prioritySupport: 'Priority Support',
    apiAccess: 'API Access',
    teamCollaboration: 'Team Collaboration',
    customReports: 'Custom Reports',
    unlimitedAnalyses: 'Unlimited Monthly Analyses',
  };
  
  return prompts[feature] || 'Upgrade to Pro to access this feature';
}
