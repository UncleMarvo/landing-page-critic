"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

// Comprehensive history entry type
type HistoryEntry = {
  id: string;
  url: string;
  analyzedAt: string;
  categories: {
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
  };
  webVitals: {
    lcp?: number;
    cls?: number;
    inp?: number;
    fcp?: number;
    ttfb?: number;
  };
  performanceMetrics: {
    speedIndex?: number;
    totalBlockingTime?: number;
    largestContentfulPaint?: number;
    cumulativeLayoutShift?: number;
    firstInputDelay?: number;
  };
  opportunities: any[];
  recommendations: any[];
  accessibility: any[];
  bestPractices: any[];
  seo: any[];
  performanceDetails: any[];
  platforms: string[];
  aiInsights: any[];
};

interface CombinedDashboardProps {
  analyzeData?: any;
  history?: HistoryEntry[];
  url?: string;
}

export default function CombinedDashboard({
  analyzeData,
  history = [],
  url,
}: CombinedDashboardProps) {
  const { user } = useAuth();
  
  // Timeline state
  const [timeline, setTimeline] = useState<HistoryEntry[]>([]);
  const [range, setRange] = useState<"7" | "30" | "all" | "custom">("7");
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [endDate, setEndDate] = useState<Date>(() => new Date());
  const [loading, setLoading] = useState(false);

  // Fetch comprehensive timeline
  async function fetchTimeline(
    range: "7" | "30" | "all" | "custom",
    start?: Date,
    end?: Date
  ) {
    if (!url || !user) return; // no URL or user, cannot fetch timeline
    
    setLoading(true);
    let apiUrl = `/api/timeline?url=${encodeURIComponent(url)}`;

    if (range === "7") {
      const s = new Date();
      s.setDate(s.getDate() - 7);
      apiUrl += `&start=${s.toISOString()}`;
    } else if (range === "30") {
      const s = new Date();
      s.setDate(s.getDate() - 30);
      apiUrl += `&start=${s.toISOString()}`;
    } else if (range === "custom" && start) {
      apiUrl += `&start=${start.toISOString()}`;
      if (end) apiUrl += `&end=${end.toISOString()}`;
    }

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`Timeline fetch failed: ${res.status}`);
      const data = await res.json();
      setTimeline(data);
    } catch (err) {
      console.error("Error fetching timeline data:", err);
      setTimeline([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (range === "custom") fetchTimeline("custom", startDate, endDate);
    else fetchTimeline(range);
  }, [range, startDate, endDate, url, user]);

  const activeHistory = timeline.length > 0 ? timeline : history;
  const sortedData = useMemo(
    () =>
      [...activeHistory].sort(
        (a, b) =>
          new Date(a.analyzedAt).getTime() - new Date(b.analyzedAt).getTime()
      ),
    [activeHistory]
  );

  // Prepare chart data for different metrics
  const categoryChartData = sortedData.map((entry) => ({
    date: new Date(entry.analyzedAt).toLocaleDateString(),
    performance: entry.categories.performance,
    accessibility: entry.categories.accessibility,
    seo: entry.categories.seo,
    bestPractices: entry.categories.bestPractices,
  }));

  const webVitalsChartData = sortedData.map((entry) => ({
    date: new Date(entry.analyzedAt).toLocaleDateString(),
    lcp: entry.webVitals.lcp,
    cls: entry.webVitals.cls,
    inp: entry.webVitals.inp,
    fcp: entry.webVitals.fcp,
    ttfb: entry.webVitals.ttfb,
  }));

  const performanceMetricsChartData = sortedData.map((entry) => ({
    date: new Date(entry.analyzedAt).toLocaleDateString(),
    speedIndex: entry.performanceMetrics.speedIndex,
    totalBlockingTime: entry.performanceMetrics.totalBlockingTime,
    largestContentfulPaint: entry.performanceMetrics.largestContentfulPaint,
    cumulativeLayoutShift: entry.performanceMetrics.cumulativeLayoutShift,
    firstInputDelay: entry.performanceMetrics.firstInputDelay,
  }));

  // Summary statistics
  const latestEntry = sortedData[sortedData.length - 1];
  const totalAnalyses = sortedData.length;
  const averagePerformance = sortedData.length > 0 
    ? Math.round(sortedData.reduce((sum, entry) => sum + entry.categories.performance, 0) / sortedData.length)
    : 0;

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="h4 flex items-center space-x-2">
          <span>Historical Performance Overview</span>
          {loading && <div className="loading-spinner h-4 w-4 border-primary"></div>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        {latestEntry && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalAnalyses}</div>
              <div className="text-sm text-muted-foreground">Total Analyses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{averagePerformance}</div>
              <div className="text-sm text-muted-foreground">Avg Performance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{latestEntry.categories.accessibility}</div>
              <div className="text-sm text-muted-foreground">Latest Accessibility</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-info">{latestEntry.categories.seo}</div>
              <div className="text-sm text-muted-foreground">Latest SEO</div>
            </div>
          </div>
        )}

        {/* Date Range Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={() => setRange("7")}
              variant={range === "7" ? "default" : "outline"}
              size="sm"
            >
              Last 7 Days
            </Button>
            <Button 
              onClick={() => setRange("30")}
              variant={range === "30" ? "default" : "outline"}
              size="sm"
            >
              Last 30 Days
            </Button>
            <Button 
              onClick={() => setRange("all")}
              variant={range === "all" ? "default" : "outline"}
              size="sm"
            >
              All Time
            </Button>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => date && setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="border p-1 rounded text-sm"
              placeholderText="Start Date"
            />
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => date && setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="border p-1 rounded text-sm"
              placeholderText="End Date"
            />
            <Button 
              onClick={() => setRange("custom")}
              variant={range === "custom" ? "default" : "outline"}
              size="sm"
            >
              Apply
            </Button>
          </div>
        </div>

        {sortedData.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-muted-foreground">No historical data available</p>
              <p className="text-sm text-muted-foreground">
                {url ? "No performance data found for this URL" : "Enter a URL to analyze and view historical data"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Category Scores Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Category Scores Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={categoryChartData}>
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="performance" stroke="#4ade80" name="Performance" />
                  <Line type="monotone" dataKey="accessibility" stroke="#60a5fa" name="Accessibility" />
                  <Line type="monotone" dataKey="seo" stroke="#fbbf24" name="SEO" />
                  <Line type="monotone" dataKey="bestPractices" stroke="#f87171" name="Best Practices" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Web Vitals Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Web Vitals Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={webVitalsChartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="lcp" stroke="#ef4444" name="LCP (ms)" />
                  <Line type="monotone" dataKey="cls" stroke="#8b5cf6" name="CLS" />
                  <Line type="monotone" dataKey="inp" stroke="#06b6d4" name="INP (ms)" />
                  <Line type="monotone" dataKey="fcp" stroke="#f59e0b" name="FCP (ms)" />
                  <Line type="monotone" dataKey="ttfb" stroke="#10b981" name="TTFB (ms)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Metrics Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Performance Metrics Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={performanceMetricsChartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="speedIndex" stroke="#3b82f6" name="Speed Index" />
                  <Line type="monotone" dataKey="totalBlockingTime" stroke="#ef4444" name="Total Blocking Time" />
                  <Line type="monotone" dataKey="largestContentfulPaint" stroke="#8b5cf6" name="LCP" />
                  <Line type="monotone" dataKey="cumulativeLayoutShift" stroke="#f59e0b" name="CLS" />
                  <Line type="monotone" dataKey="firstInputDelay" stroke="#10b981" name="FID" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
