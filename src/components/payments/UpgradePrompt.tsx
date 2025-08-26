'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Tier } from '@/payments/types';

interface UpgradePromptProps {
  title?: string;
  description?: string;
  features?: string[];
  showFeatures?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'inline';
}

export default function UpgradePrompt({ 
  title = "Upgrade to Pro",
  description = "Unlock advanced features and unlimited usage",
  features = [
    "Unlimited monthly analyses",
    "AI-powered insights",
    "Historical data tracking",
    "Export to PDF/CSV",
    "Priority support",
    "Advanced analytics"
  ],
  showFeatures = true,
  className = "",
  variant = "default"
}: UpgradePromptProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push('/upgrade');
  };

  if (variant === 'compact') {
    return (
      <div className={`p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">{title}</h3>
              <p className="text-sm text-blue-700">{description}</p>
            </div>
          </div>
          <Button 
            onClick={handleUpgrade}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Upgrade
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center space-x-2 text-sm ${className}`}>
        <Crown className="h-4 w-4 text-amber-500" />
        <span className="text-muted-foreground">Pro feature</span>
        <Button 
          onClick={handleUpgrade}
          variant="link"
          size="sm"
          className="p-0 h-auto text-blue-600 hover:text-blue-700"
        >
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <Card className={`card-hover ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Crown className="h-5 w-5 text-primary" />
          <span>{title}</span>
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
            {description}
          </p>
        </div>

        {showFeatures && (
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        )}
        
        <Button 
          onClick={handleUpgrade}
          className="w-full btn-primary"
        >
          <Zap className="mr-2 h-4 w-4" />
          Upgrade to Pro
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// Specialized upgrade prompts for different features
export function AIInsightsUpgradePrompt({ className = "" }: { className?: string }) {
  return (
    <UpgradePrompt
      title="AI-Powered Insights"
      description="Get intelligent recommendations with historical context and actionable steps"
      showFeatures={false}
      className={className}
    />
  );
}

export function HistoricalDataUpgradePrompt({ className = "" }: { className?: string }) {
  return (
    <UpgradePrompt
      title="Historical Performance Data"
      description="Track your website's performance over time with detailed analytics"
      showFeatures={false}
      className={className}
    />
  );
}

export function ExportUpgradePrompt({ className = "" }: { className?: string }) {
  return (
    <UpgradePrompt
      title="Export Reports"
      description="Download comprehensive reports in PDF and CSV formats"
      showFeatures={false}
      className={className}
    />
  );
}
