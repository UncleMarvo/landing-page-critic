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
import { Button } from "@/components/ui/button";

type HistoryEntry = {
  analyzedAt: string;
  performance: number;
  accessibility: number;
  seo: number;
  bestPractices: number;
};

interface PerformanceMetricsCardProps {
  history: HistoryEntry[];
}

export default function PerformanceMetricsCard({
  history,
}: PerformanceMetricsCardProps) {
  const [timeline, setTimeline] = useState<HistoryEntry[]>([]);
  const [range, setRange] = useState<"7" | "30" | "all" | "custom">("7");
  const [customRange, setCustomRange] = useState<{
    start?: string;
    end?: string;
  }>({});

  async function fetchTimeline(
    range: "7" | "30" | "all" | "custom",
    custom?: { start?: string; end?: string }
  ) {
    let url = "/api/timeline";
    if (range === "7") {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      url += `?start=${start.toISOString()}`;
    } else if (range === "30") {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      url += `?start=${start.toISOString()}`;
    } else if (range === "custom" && custom?.start) {
      url += `?start=${custom.start}`;
      if (custom.end) url += `&end=${custom.end}`;
    }

    // console.log(`*** DEBUG - Fetching timeline with URL: ${url}`);
    const res = await fetch(url);
    const data = await res.json();
    setTimeline(data);
  }

  useEffect(() => {
    if (range === "custom") {
      fetchTimeline("custom", customRange);
    } else {
      fetchTimeline(range);
    }
  }, [range, customRange]);

  const activeData = timeline.length > 0 ? timeline : (history ?? []);
  const sortedData = useMemo(
    () =>
      [...activeData].sort(
        (a, b) =>
          new Date(a.analyzedAt).getTime() - new Date(b.analyzedAt).getTime()
      ),
    [activeData]
  );

  const chartData = sortedData.map((entry) => ({
    date: new Date(entry.analyzedAt).toLocaleDateString(),
    performance: entry.performance,
    accessibility: entry.accessibility,
    seo: entry.seo,
    bestPractices: entry.bestPractices,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
        <CardTitle className="text-2xl font-bold">
          Performance Metrics
        </CardTitle>

        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
          <div className="flex gap-2 mb-4">
            <button
              className="p-2 bg-gray-50 rounded shadow"
              onClick={() => setRange("7")}
            >
              Last 7 Days
            </button>
            <button
              className="p-2 bg-gray-50 rounded shadow"
              onClick={() => setRange("30")}
            >
              Last 30 Days
            </button>
            <button
              className="p-2 bg-gray-50 rounded shadow"
              onClick={() => setRange("all")}
            >
              All
            </button>          
            {/* Custom Date Pickers */}
            <input
              className="p-1 border border-gray-300 rounded shadow"
              type="date"
              onChange={(e) =>
                setCustomRange({ ...customRange, start: e.target.value })
              }
            />
            <input
              className="p-1 border border-gray-300 rounded shadow"
              type="date"
              onChange={(e) =>
                setCustomRange({ ...customRange, end: e.target.value })
              }
            />
            <button
              className="p-2 bg-gray-50 rounded shadow"
              onClick={() => setRange("custom")}
            >
              Apply
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!history || history.length === 0 ? (
          <div>No historical data available.</div>
        ) : (
          <>
            <h2 className="text-lg font-bold">Historical Data</h2>
            {/* Historical chart */}
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="performance" stroke="#4ade80" />
                <Line
                  type="monotone"
                  dataKey="accessibility"
                  stroke="#60a5fa"
                />
                <Line type="monotone" dataKey="seo" stroke="#fbbf24" />
                <Line
                  type="monotone"
                  dataKey="bestPractices"
                  stroke="#f87171"
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
