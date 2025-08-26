"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  canAccessFeature,
  getUpgradePrompt,
  getUpgradeTitle,
} from "@/lib/payments/accessControl";
import { Tier } from "@/payments/types";
import { Lock, Crown, Zap } from "lucide-react";
import { Badge } from '@/components/ui/badge';
interface FeatureGateProps {
  feature: string;
  tier: Tier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  className?: string;
}

export default function FeatureGate({
  feature,
  tier,
  children,
  fallback,
  showUpgradePrompt = true,
  className = "",
}: FeatureGateProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Use the user's tier from context, fallback to the prop
  // If still loading, use the prop tier to avoid flashing
  const userTier = (loading ? tier : (user?.tier || tier)) as Tier;



  // Check if user can access this feature
  const canAccess = canAccessFeature(userTier, feature as any);

  // If user can access the feature, render children
  if (canAccess) {
    return <div className={className}>{children}</div>;
  }

  // If fallback is provided, render it
  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  // If upgrade prompt is disabled, render nothing
  if (!showUpgradePrompt) {
    return null;
  }

  // Render upgrade prompt
  return (
    <Card className={`card-hover ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Crown className="h-5 w-5 text-primary" />
          <span>{getUpgradeTitle(feature)}</span>
          <Badge variant="secondary" className="ml-auto">
            <Crown className="h-3 w-3 mr-1" />
            Pro
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
            <Crown className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-foreground font-medium">Unlock Premium Features</p>
          <p className="text-muted-foreground text-sm">
            {getUpgradePrompt(feature)}
          </p>
        </div>

        <Button
          onClick={() => router.push("/upgrade")}
          className="w-full btn-primary"
        >
          <Zap className="mr-2 h-4 w-4" />
          Upgrade to Pro
        </Button>
      </CardContent>
    </Card>
  );
}

// Higher-order component for feature gating
export function withFeatureGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: string,
  tier: Tier,
  fallback?: React.ReactNode
) {
  return function FeatureGatedComponent(props: P) {
    return (
      <FeatureGate feature={feature} tier={tier} fallback={fallback}>
        <WrappedComponent {...props} />
      </FeatureGate>
    );
  };
}

// Hook for feature access checking
export function useFeatureAccess(feature: string, tier: Tier) {
  const canAccess = canAccessFeature(tier, feature as any);
  const upgradePrompt = getUpgradePrompt(feature);

  return {
    canAccess,
    upgradePrompt,
    isRestricted: !canAccess,
  };
}
