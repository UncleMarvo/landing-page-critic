"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/context/AuthContext';
import { usePayments } from '@/hooks/usePayments';
import { 
  getRemainingUsage, 
  hasUnlimitedAccess, 
  getUsagePercentage
} from '@/lib/payments/accessControl';
import { getTierConfig } from '@/payments/config';
import { Tier } from '@/payments/types';
import { Activity, BarChart3, FileText, Brain, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UsageData {
  auditResults: number;
  aiInsights: number;
  exportReports: number;
  periodStart: Date;
  periodEnd: Date;
}

interface UsageTrackerProps {
  tier: Tier;
  className?: string;
}

export default function UsageTracker({ tier, className = "" }: UsageTrackerProps) {
  const { user } = useAuth();
  const { createCheckoutSession, loading } = usePayments();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUsage();
    }
  }, [user]);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/usage');
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoadingUsage(false);
    }
  };

  if (loadingUsage) {
    return (
      <Card className={`card-hover ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Usage This Month</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="loading-spinner h-8 w-8 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tierConfig = getTierConfig(tier);
  const currentUsage = usage || {
    auditResults: 0,
    aiInsights: 0,
    exportReports: 0,
    periodStart: new Date(),
    periodEnd: new Date()
  };

  const usageItems = [
    {
      key: 'auditResults',
      label: 'Analyses',
      icon: BarChart3,
      current: currentUsage.auditResults,
      limit: tierConfig.limits.monthlyAnalyses,
      color: 'bg-primary'
    },
    {
      key: 'aiInsights',
      label: 'AI Insights',
      icon: Brain,
      current: currentUsage.aiInsights,
      limit: tierConfig.limits.aiInsights,
      color: 'bg-success'
    },
    {
      key: 'exportReports',
      label: 'Export Reports',
      icon: FileText,
      current: currentUsage.exportReports,
      limit: tierConfig.limits.exportReports,
      color: 'bg-warning'
    }
  ];

  const hasUnlimited = hasUnlimitedAccess(tier, 'monthlyAnalyses') && 
                      hasUnlimitedAccess(tier, 'aiInsights') && 
                      hasUnlimitedAccess(tier, 'exportReports');

  return (
    <Card className={`card-hover ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-primary" />
          <span>Usage This Month</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasUnlimited ? (
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
              <Activity className="h-8 w-8 text-success" />
            </div>
            <p className="text-foreground font-medium">Unlimited Usage</p>
            <p className="text-muted-foreground text-sm">
              You have unlimited access to all features with your Pro plan.
            </p>
          </div>
        ) : (
          <>
            {/* Usage Sub-panels in a row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {usageItems.map((item) => {
                const Icon = item.icon;
                const isUnlimited = item.limit === -1;
                const remaining = isUnlimited ? -1 : getRemainingUsage(tier, item.current, item.key as any);
                const percentage = isUnlimited ? 0 : getUsagePercentage(tier, item.current, item.key as any);
                const isNearLimit = percentage >= 80 && !isUnlimited;
                const isAtLimit = percentage >= 100 && !isUnlimited;

                return (
                  <div key={item.key} className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isUnlimited ? (
                          <span className="text-xs text-success font-medium">Unlimited</span>
                        ) : (
                          <>
                            <span className="text-xs text-muted-foreground">
                              {item.current} / {item.limit}
                            </span>
                            {isNearLimit && (
                              <AlertTriangle className="h-3 w-3 text-warning" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {!isUnlimited && (
                      <div className="space-y-2">
                        <Progress 
                          value={percentage} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {isAtLimit ? 'Limit reached' : `${remaining} remaining`}
                          </span>
                          <span>{Math.round(percentage)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {tier === 'free' && (
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  Upgrade to Pro for unlimited usage and advanced features.
                </p>
                <Button 
                  onClick={() => createCheckoutSession('pro')}
                  disabled={loading}
                  size="sm"
                  className="w-full mt-2 btn-primary"
                >
                  {loading ? 'Processing...' : 'Upgrade to Pro'}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
