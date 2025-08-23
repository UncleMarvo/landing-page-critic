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
import { BarChart, Bar, Cell } from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";

type HistoryEntry = {
  analyzedAt: string;
  performance: number;
  accessibility: number;
  seo: number;
  bestPractices: number;
};

type WebVitalsPanelProps = {
  id: string;
  title: string;
  legend: string;
  value: number;
  unit: string;
  level: "good" | "needs-improvement" | "poor" | "";
};

interface CombinedDashboardProps {
  analyzeData: WebVitalsPanelProps[]; // live data from /api/analyze
  history?: HistoryEntry[];
  url?: string; // for fetching timeline data
}

export default function CombinedDashboard({
  analyzeData,
  history = [],
  url,
}: CombinedDashboardProps) {
  // Timeline state
  const [timeline, setTimeline] = useState<HistoryEntry[]>([]);
  const [range, setRange] = useState<"7" | "30" | "all" | "custom">("7");
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [endDate, setEndDate] = useState<Date>(() => new Date());

  // Fetch timeline
  async function fetchTimeline(
    range: "7" | "30" | "all" | "custom",
    start?: Date,
    end?: Date
  ) {
    if (!url) return; // no URL, cannot fetch timeline
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
    }
  }

  useEffect(() => {
    if (range === "custom") fetchTimeline("custom", startDate, endDate);
    else fetchTimeline(range);
  }, [range, startDate, endDate, url]);

  const activeHistory = timeline.length > 0 ? timeline : history;
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

  const classifyVital = (
    id: string,
    value?: number
  ): "good" | "needs-improvement" | "poor" | "" => {
    if (value === undefined || value === null) return "";
    switch (id) {
      case "fcp":
        if (value <= 1800) return "good";
        if (value <= 3000) return "needs-improvement";
        return "poor";
      case "lcp":
        if (value <= 2500) return "good";
        if (value <= 4000) return "needs-improvement";
        return "poor";
      case "cls":
        if (value <= 0.1) return "good";
        if (value <= 0.25) return "needs-improvement";
        return "poor";
      case "tbt":
        if (value <= 200) return "good";
        if (value <= 600) return "needs-improvement";
        return "poor";
      case "si":
        if (value <= 3400) return "good";
        if (value <= 5800) return "needs-improvement";
        return "poor";
      default:
        return "";
    }
  };

  const vitalColor = (level: string) => {
    if (level === "good") return "text-green-600";
    if (level === "needs-improvement") return "text-yellow-600";
    if (level === "poor") return "text-red-600";
    return "text-gray-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Combined Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Web Vitals Panel */}
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">Web Vitals</h2>
            <div className="grid grid-cols-2 gap-4">
              {analyzeData.map((v) => (
                <div
                  key={v.id}
                  className="category-card p-4 bg-gray-50 rounded-lg shadow"
                >
                  <h3 className="text-md font-semibold">{v.title}</h3>
                  <p className={`text-2xl font-bold ${vitalColor(v.level)}`}>
                    {v.value !== undefined ? Math.round(v.value) : "--"}{" "}
                    {v.unit || ""} {v.level || ""}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analyzeData}>
                <XAxis dataKey="title" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {analyzeData.map((entry, index) => {
                    let color = "#ef4444"; // default red
                    const level = classifyVital(entry.id, entry.value);
                    if (level === "good") color = "#16a34a";
                    else if (level === "needs-improvement") color = "#eab308";
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4 mt-6">History</h2>
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
          <div>No historical data available.</div>
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
