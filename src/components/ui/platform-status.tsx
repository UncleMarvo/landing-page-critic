"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Gauge,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Info,
} from "lucide-react";

// Platform configuration interface
interface PlatformConfig {
  name: string;
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

// Platform status interface
interface PlatformStatus {
  name: string;
  key: string;
  enabled: boolean;
  status: 'enabled' | 'disabled' | 'error' | 'loading';
  lastUsed?: string;
  error?: string;
}

// Platform configurations
const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    name: 'Lighthouse',
    key: 'lighthouse',
    icon: Zap,
    color: 'bg-blue-500',
    description: 'Google\'s automated website auditing tool'
  },
  {
    name: 'PageSpeed Insights',
    key: 'pagespeed',
    icon: Gauge,
    color: 'bg-green-500',
    description: 'Google\'s PageSpeed Insights API'
  },
  {
    name: 'WebPageTest',
    key: 'webpagetest',
    icon: Globe,
    color: 'bg-purple-500',
    description: 'Real browser testing from multiple locations'
  }
];

interface PlatformStatusProps {
  platforms?: string[];
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export function PlatformStatus({ 
  platforms = [], 
  className = "",
  showDetails = false,
  compact = false 
}: PlatformStatusProps) {
  const [platformStatuses, setPlatformStatuses] = useState<PlatformStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlatformStatuses();
  }, []);

  const loadPlatformStatuses = async () => {
    try {
      // In a real implementation, you might fetch this from an API
      // For now, we'll simulate the status based on environment variables
      const statuses: PlatformStatus[] = PLATFORM_CONFIGS.map(config => {
        const isEnabled = platforms.includes(config.key);
        return {
          name: config.name,
          key: config.key,
          enabled: isEnabled,
          status: isEnabled ? 'enabled' : 'disabled',
          lastUsed: isEnabled ? new Date().toISOString() : undefined
        };
      });

      setPlatformStatuses(statuses);
    } catch (error) {
      console.error('Error loading platform statuses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: PlatformStatus['status']) => {
    switch (status) {
      case 'enabled':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'disabled':
        return <XCircle className="w-4 h-4 text-gray-400" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'loading':
        return <Clock className="w-4 h-4 text-yellow-600 animate-spin" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: PlatformStatus['status']) => {
    switch (status) {
      case 'enabled':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'disabled':
        return 'bg-gray-50 text-gray-500 border-gray-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'loading':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-500">Loading platform status...</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {platformStatuses.map((platform) => {
          const config = PLATFORM_CONFIGS.find(c => c.key === platform.key);
          if (!config) return null;

          const Icon = config.icon;
          return (
            <Badge
              key={platform.key}
              variant="outline"
              className={`flex items-center space-x-1 ${getStatusColor(platform.status)}`}
              title={`${platform.name}: ${platform.status}`}
            >
              <Icon className="w-3 h-3" />
              <span className="text-xs">{platform.name}</span>
              {getStatusIcon(platform.status)}
            </Badge>
          );
        })}
      </div>
    );
  }

  if (showDetails) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Testing Platforms</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {platformStatuses.map((platform) => {
            const config = PLATFORM_CONFIGS.find(c => c.key === platform.key);
            if (!config) return null;

            const Icon = config.icon;
            return (
              <div
                key={platform.key}
                className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(platform.status)}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${config.color} bg-opacity-10`}>
                    <Icon className={`w-5 h-5 ${config.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{platform.name}</h4>
                    <p className="text-xs opacity-75">{config.description}</p>
                    {platform.lastUsed && (
                      <p className="text-xs opacity-60">
                        Last used: {new Date(platform.lastUsed).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(platform.status)}
                  <span className="text-xs font-medium capitalize">
                    {platform.status}
                  </span>
                </div>
              </div>
            );
          })}
          
          {platformStatuses.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No testing platforms configured</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default view - simple badges
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {platformStatuses.map((platform) => {
        const config = PLATFORM_CONFIGS.find(c => c.key === platform.key);
        if (!config) return null;

        const Icon = config.icon;
        return (
          <Badge
            key={platform.key}
            variant="outline"
            className={`flex items-center space-x-1 ${getStatusColor(platform.status)}`}
          >
            <Icon className="w-3 h-3" />
            <span className="text-xs">{platform.name}</span>
          </Badge>
        );
      })}
    </div>
  );
}

// Simple platform indicator for individual metrics
export function PlatformIndicator({ 
  platform, 
  className = "" 
}: { 
  platform: string; 
  className?: string;
}) {
  const config = PLATFORM_CONFIGS.find(c => c.key === platform);
  if (!config) return null;

  const Icon = config.icon;
  
  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center space-x-1 text-xs ${className}`}
      title={`Data from ${config.name}`}
    >
      <Icon className="w-3 h-3" />
      <span>{config.name}</span>
    </Badge>
  );
}
