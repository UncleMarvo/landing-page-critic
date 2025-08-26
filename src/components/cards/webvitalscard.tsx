"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useDashboard } from "@/context/DashboardContext";
import { Activity, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { PlatformStatus } from "@/components/ui/platform-status";

// Type definition for Web Vitals data
type WebVitalsPanelProps = {
  id: string;
  title: string;
  value?: number;
  unit?: string;
  level?: string;
};

// Define the full list of metrics we want to display
const defaultMetrics: WebVitalsPanelProps[] = [
  { id: "fcp", title: "First Contentful Paint" },
  { id: "lcp", title: "Largest Contentful Paint" },
  { id: "cls", title: "Cumulative Layout Shift" },
  { id: "tbt", title: "Total Blocking Time" },
  { id: "si", title: "Speed Index" },
  { id: "fid", title: "First Input Delay" },
  { id: "tti", title: "Time to Interactive" },
  { id: "inp", title: "Interaction to Next Paint" },
];

// Helper function to get status color and icon
const getStatusInfo = (level: string) => {
  switch (level) {
    case "good":
      return { color: "text-success", bgColor: "bg-success/10", icon: CheckCircle };
    case "needs-improvement":
      return { color: "text-warning", bgColor: "bg-warning/10", icon: AlertTriangle };
    case "poor":
      return { color: "text-error", bgColor: "bg-error/10", icon: AlertTriangle };
    default:
      return { color: "text-muted-foreground", bgColor: "bg-muted", icon: Activity };
  }
};

// Helper function to determine status based on metric value and target
const getMetricStatus = (metricId: string, value: number): string => {
  const targets: Record<string, { good: number; needsImprovement: number }> = {
    fcp: { good: 1800, needsImprovement: 3000 },
    lcp: { good: 2500, needsImprovement: 4000 },
    cls: { good: 0.1, needsImprovement: 0.25 },
    tbt: { good: 200, needsImprovement: 600 },
    si: { good: 3400, needsImprovement: 5800 },
    fid: { good: 100, needsImprovement: 300 },
    tti: { good: 3800, needsImprovement: 7300 },
    inp: { good: 200, needsImprovement: 500 },
  };

  const target = targets[metricId];
  if (!target) return "unknown";

  if (value <= target.good) return "good";
  if (value <= target.needsImprovement) return "needs-improvement";
  return "poor";
};

export default function WebVitalsCard() {
  // Get data from DashboardContext
  const {
    webVitalsData,
    platforms,
    isLoading,
    refreshData,
  } = useDashboard();
  
  // Handle loading state
  if (isLoading) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="h4 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Web Vitals</span>
            </CardTitle>
            <Button 
              onClick={refreshData}
              disabled={isLoading}
              size="sm"
              variant="outline"
              className="btn-secondary"
            >
              <div className="loading-spinner h-4 w-4 mr-2"></div>
              Refreshing...
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <div className="loading-spinner h-12 w-12 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading Web Vitals data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle empty data state
  if (!webVitalsData || webVitalsData.length === 0) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="h4 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Web Vitals</span>
            </CardTitle>
            <Button 
              onClick={refreshData}
              disabled={isLoading}
              size="sm"
              variant="outline"
              className="btn-secondary"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
              <div>
                <p className="text-foreground font-medium">Web Vitals data not available</p>
                <p className="text-muted-foreground text-sm">
                  Lighthouse analysis failed to collect Web Vitals metrics due to browser tracing conflicts. 
                  This is a known issue with the current Lighthouse setup.
                </p>
                <div className="mt-4 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Technical Details:</p>
                  <p>Error: TRACING_ALREADY_STARTED</p>
                  <p>Web Vitals require browser performance traces that could not be collected.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Use empty array if no data is available
  const data = webVitalsData || [];
  
  // Merge incoming data with defaults, keeping missing metrics
  const mergedData: WebVitalsPanelProps[] = defaultMetrics.map(metric => {
    const found = data.find((item: any) => item.id === metric.id);
    return found || { ...metric, value: undefined, unit: '', level: undefined };
  });

  // Prepare data for chart
  const chartData = mergedData
    .filter(item => item.value !== undefined)
    .map(item => ({
      name: item.title,
      value: item.value,
      level: getMetricStatus(item.id, item.value!),
      unit: item.unit || ''
    }));

  // Color mapping for chart bars
  const getBarColor = (level: string) => {
    switch (level) {
      case "good": return "hsl(var(--success))";
      case "needs-improvement": return "hsl(var(--warning))";
      case "poor": return "hsl(var(--error))";
      default: return "hsl(var(--muted-foreground))";
    }
  };

  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-2xl font-bold">Web Vitals</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={refreshData}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
        {platforms && platforms.length > 0 && (
          <div className="mt-2">
            <PlatformStatus platforms={platforms} compact />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Content - Details and Chart in same row */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Side - Detailed Metrics */}
          <div className="flex-1 space-y-4">
            <h4 className="h5 text-foreground">Detailed Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mergedData.map((metric) => {
                // Determine status based on metric value
                const status = metric.value !== undefined ? getMetricStatus(metric.id, metric.value) : 'unknown';
                const statusInfo = getStatusInfo(status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div 
                    key={metric.id}
                    className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-sm ${statusInfo.bgColor}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-sm font-medium text-foreground leading-tight">
                        {metric.title}
                      </h5>
                      <StatusIcon className={`h-4 w-4 ${statusInfo.color} flex-shrink-0`} />
                    </div>
                    
                    {metric.value !== undefined ? (
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-foreground">
                          {metric.value}
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            {metric.unit}
                          </span>
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                            {status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-lg text-muted-foreground">No data</p>
                        <p className="text-xs text-muted-foreground">Metric not available</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side - Chart */}
          {chartData.length > 0 && (
            <div className="flex-1 space-y-4">
              <h4 className="h5 text-foreground">Performance Overview</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: any, name: any, props: any) => [
                        `${value}${props.payload.unit || ''}`,
                        props.payload.name
                      ]}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.level)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        {chartData.length > 0 && (
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h5 className="text-sm font-medium text-foreground">Performance Summary</h5>
            </div>
            <p className="text-sm text-muted-foreground">
              {chartData.filter(item => item.level === 'good').length} of {chartData.length} metrics are performing well. 
              Focus on improving the metrics marked as "needs improvement" or "poor" for better user experience.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
