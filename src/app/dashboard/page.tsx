"use client";
import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { useResults } from "@/context/ResultsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
{
  /* Card Components */
}
import BestPracticesCard from "@/components/cards/bestpracticescard";
import OpportunitiesCard from "@/components/cards/opportunitiescard";
import AccessibilityCard from "@/components/cards/accessibilitycard";
import PerformanceMetricsCard from "@/components/cards/performancemetricscard";
import CategoryScoresCard from "@/components/cards/categoryscorescard";
import RecommendationsCard from "@/components/cards/recommendationscard";
import ExportReportCard from "@/components/cards/exportreportcard";
import WebVitalsCard from "@/components/cards/webvitalscard";
import CombinedPerformanceCard from "@/components/cards/combinedperformancecard";

interface LighthouseCategory {
  id: string;
  title: string;
  score: number;
}

interface WebVital {
  id: string;
  title: string;
  legend: string;
  value: number;
  unit: string;
  level: "good" | "needs-improvement" | "poor";
}

export default function Dashboard() {
  const { result } = useResults();
  // history
  const [history, setHistory] = useState<any[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  // lighthouse results
  const [categories, setCategories] = useState<LighthouseCategory[]>([]);
  const [webVitals, setWebVitals] = useState<WebVital[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [accessibility, setAccessibility] = useState<any[]>([]);
  const [bestPractices, setBestPractices] = useState<any[]>([]);
  const [seo, setSeo] = useState<any[]>([]);
  const [performanceDetails, setPerformanceDetails] = useState<any[]>([]);
  // Date range state
  const [startDate, setStartDate] = useState(subDays(new Date(), 30)); // default 30 days back
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    if (!result) {
      return;
    }

    console.log(`*** DEBUG - result (WebVitals): ${JSON.stringify(result.webVitals, null, 2)}`);

    // ----- Lighthouse results -----
    setCategories(result.categories);
    setWebVitals(result.webVitals);
    setOpportunities(result.opportunities);
    setRecommendations(result.recommendations);
    setAccessibility(result.accessibility);
    setBestPractices(result.bestPractices);
    setSeo(result.seo);
    setPerformanceDetails(result.performanceDetails);

    // ----- DatabaseHistory -----
    const fetchHistory = async () => {
      const history = await fetch("/api/history");
      const historyData = await history.json();
      setHistory(historyData);
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    const filterHistory = async () => {
      const filteredHistory = history.filter((entry: any) => {
        const analyzed = new Date(entry.analyzedAt);
        return analyzed >= startDate && analyzed <= endDate;
      });
      setFilteredHistory(filteredHistory);
    };
    filterHistory();
  }, [startDate, endDate]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Lighthouse Dashboard</h1>

      {/* Export Report */}
      <ExportReportCard data={result} />

      {/* Category Scores */}
      <CategoryScoresCard data={categories} />

      {/* Combined Performance */}
      <CombinedPerformanceCard analyzeData={webVitals} history={filteredHistory} url={result.url} />

      {/* Performance Metrics */}
      <PerformanceMetricsCard history={filteredHistory} />

      {/* Web Vitals */}
      <WebVitalsCard data={webVitals} />

      {/* Recommendations */}
      <RecommendationsCard data={recommendations} />

      {/* Accessibility */}
      <AccessibilityCard data={accessibility} />

      {/* Opportunities */}
      <OpportunitiesCard data={opportunities} />

      {/* Best Practices */}
      <BestPracticesCard data={bestPractices} />

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">History</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Date Range Picker */}
          <div className="flex space-x-2 items-center mb-4">
            <span>From:</span>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => date && setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={new Date()}
              dateFormat="MMM d, yyyy"
              className="border px-2 py-1 rounded"
            />
            <span>To:</span>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => date && setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={new Date()}
              dateFormat="MMM d, yyyy"
              className="border px-2 py-1 rounded"
            />

            <div className="flex space-x-2">
              <button
                className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => {
                  setStartDate(subDays(new Date(), 7));
                  setEndDate(new Date());
                }}
              >
                Last 7 days
              </button>
              <button
                className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => {
                  setStartDate(subDays(new Date(), 30));
                  setEndDate(new Date());
                }}
              >
                Last 30 days
              </button>
              <button
                className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => {
                  setStartDate(new Date(0)); // epoch start
                  setEndDate(new Date());
                }}
              >
                All-time
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredHistory}>
              <XAxis
                dataKey="analyzedAt"
                tickFormatter={
                  (value: string) => format(new Date(value), "MMM d, HH:mm") // e.g. "Aug 20, 18:30"
                }
              />
              <YAxis />
              <Tooltip
                labelFormatter={
                  (value: string) => format(new Date(value), "MMM d, HH:mm") // tooltip label, e.g. "Aug 20, 2025, 6:30 PM"
                }
              />
              <Legend />
              <Line dataKey="performance" stroke="#4f46e5" />
              <Line dataKey="accessibility" stroke="#10b981" />
              <Line dataKey="seo" stroke="#f59e0b" />
              <Line dataKey="bestPractices" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
