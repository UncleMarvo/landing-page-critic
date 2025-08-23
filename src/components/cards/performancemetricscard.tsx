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
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/context/DashboardContext";

// Type definition for history entries
type HistoryEntry = {
  analyzedAt: string;
  performance: number;
  accessibility: number;
  seo: number;
  bestPractices: number;
};

export default function PerformanceMetricsCard() {
  // Get data from DashboardContext
  const { performanceHistory, currentUrl, isLoading, refreshData } = useDashboard();
  
  // Timeline state for custom date ranges
  const [timeline, setTimeline] = useState<HistoryEntry[]>([]);
  const [range, setRange] = useState<"7" | "30" | "all" | "custom">("7");
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [endDate, setEndDate] = useState<Date>(() => new Date());

  // Fetch timeline for custom date ranges
  async function fetchTimeline(
    range: "7" | "30" | "all" | "custom",
    start?: Date,
    end?: Date
  ) {
    if (!currentUrl) return; // no URL, cannot fetch timeline
    let apiUrl = `/api/timeline?url=${encodeURIComponent(currentUrl)}`;

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
    }
  }

  useEffect(() => {
    if (range === "custom") fetchTimeline("custom", startDate, endDate);
    else fetchTimeline(range);
  }, [range, startDate, endDate, currentUrl]);

  // Use timeline data for custom ranges, otherwise use context history data
  const activeHistory = timeline.length > 0 ? timeline : (performanceHistory || []);
  const sortedData = useMemo(
    () =>
      [...activeHistory].sort(
        (a, b) =>
          new Date(a.analyzedAt).getTime() - new Date(b.analyzedAt).getTime()
      ),
    [activeHistory]
  );

  const chartData = sortedData.map((entry) => ({
    date: new Date(entry.analyzedAt).toLocaleDateString(),
    performance: entry.performance,
    accessibility: entry.accessibility,
    seo: entry.seo,
    bestPractices: entry.bestPractices,
  }));

  // Handle loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Performance Metrics</CardTitle>
            <Button 
              onClick={refreshData}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading performance data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Performance Metrics</CardTitle>
          <Button 
            onClick={refreshData}
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0 mt-4 mb-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setRange("7")}>Last 7 Days</Button>
            <Button onClick={() => setRange("30")}>Last 30 Days</Button>
            <Button onClick={() => setRange("all")}>All</Button>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => date && setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="border p-1 rounded"
            />
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => date && setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="border p-1 rounded"
            />
            <Button onClick={() => setRange("custom")}>Apply</Button>
          </div>
        </div>

        {sortedData.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-gray-500">No historical data available</p>
              <p className="text-gray-400 text-sm">
                {currentUrl ? "No performance data found for this URL" : "Enter a URL to analyze and view performance metrics"}
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="performance" stroke="#4ade80" />
              <Line type="monotone" dataKey="accessibility" stroke="#60a5fa" />
              <Line type="monotone" dataKey="seo" stroke="#fbbf24" />
              <Line type="monotone" dataKey="bestPractices" stroke="#f87171" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
