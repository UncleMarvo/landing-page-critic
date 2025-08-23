"use client";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardStatus() {
  const { currentUrl, isLoading, webVitalsData, performanceHistory } = useDashboard();

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg text-blue-800">Dashboard Context Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Current URL:</span>
            <span className="font-mono text-blue-600">
              {currentUrl || "Not set"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Loading State:</span>
            <span className={isLoading ? "text-orange-600" : "text-green-600"}>
              {isLoading ? "Loading..." : "Ready"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Web Vitals:</span>
            <span className="text-blue-600">
              {webVitalsData ? `${webVitalsData.length} metrics` : "No data"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Performance History:</span>
            <span className="text-blue-600">
              {performanceHistory ? `${performanceHistory.length} entries` : "No data"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
