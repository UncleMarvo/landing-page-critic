"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformStatus } from "@/components/ui/platform-status";
import { useDashboard } from "@/context/DashboardContext";
import { Globe } from "lucide-react";

export default function PlatformStatusCard() {
  const { platforms, isLoading } = useDashboard();

  // Don't show the card if no platforms are configured
  if (!platforms || platforms.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Globe className="w-6 h-6 text-blue-600" />
          <CardTitle className="text-xl font-bold">Testing Platforms</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <PlatformStatus platforms={platforms} showDetails />
      </CardContent>
    </Card>
  );
}
