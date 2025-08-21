"use client";
import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { useResults } from "@/context/ResultsContext";
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
  LineChart,
  Line,
  Legend,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const classifyVital = (
    id: string,
    value: number
  ): "good" | "needs-improvement" | "poor" => {
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
        return "needs-improvement";
    }
  };

  const vitalColor = (level: string) => {
    if (level === "good") return "text-green-600";
    if (level === "needs-improvement") return "text-yellow-600";
    return "text-red-600";
  };

  useEffect(() => {
    if (!result) {
      return;
    }

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

      {/* Exportable Report */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Export Report</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => {
              const blob = new Blob([JSON.stringify(result.lhr, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "lighthouse-report.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download JSON
          </Button>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Category Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Table */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-2">Category</th>
                    <th className="text-left px-4 py-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} className="border-b last:border-0">
                      <td className="px-4 py-2">{cat.title}</td>
                      <td className="px-4 py-2">{cat.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Chart */}
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categories}>
                  <XAxis dataKey="title" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score">
                    {categories.map((entry, index) => {
                      let color = "#ef4444"; // red
                      if (entry.score >= 90)
                        color = "#16a34a"; // green
                      else if (entry.score >= 50) color = "#eab308"; // yellow

                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-600"></span>
                  <span>Good</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span>Needs Improvement</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span>Poor</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Web Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2">Metric</th>
                    <th className="p-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {webVitals.map((v) => (
                    <tr key={v.id} className="border-b last:border-0">
                      <td className="p-2">{v.title}</td>
                      <td className={`p-2 ${vitalColor(v.level)}`}>
                        {Math.round(v.value)} {v.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={webVitals}>
                  <XAxis dataKey="legend" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {webVitals.map((entry, index) => {
                      let color = "#ef4444"; // default red (poor)
                      switch (entry.id.toLowerCase()) {
                        case "fcp": // FCP
                          if (entry.value <= 1800)
                            color = "#16a34a"; // green
                          else if (entry.value <= 3000) color = "#eab308"; // yellow
                          break;
                        case "lcp": // LCP
                          if (entry.value <= 2500) color = "#16a34a";
                          else if (entry.value <= 4000) color = "#eab308";
                          break;
                        case "tbt": // TBT
                          if (entry.value <= 200) color = "#16a34a";
                          else if (entry.value <= 600) color = "#eab308";
                          break;
                        case "cls": // CLS
                          if (entry.value <= 0.1) color = "#16a34a";
                          else if (entry.value <= 0.25) color = "#eab308";
                          break;
                        case "si": // speed index
                          if (entry.value <= 3400) color = "#16a34a";
                          else if (entry.value <= 5800) color = "#eab308";
                          break;
                        default:
                          break;
                      }

                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-600"></span>
                  <span>Good</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span>Needs Improvement</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span>Poor</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Issues Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Accessibility Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Issue</th>
                <th className="text-left p-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {accessibility.map((a: any) => (
                <tr key={a.id} className="border-t">
                  <td className="p-2 font-medium">{a.title}</td>
                  <td className="p-2 text-muted-foreground">{a.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Detailed Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Detailed Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2">
            {recommendations.map((a: any) => (
              <li key={a.id}>
                <span className="font-semibold">{a.title}: </span>
                <span className="text-muted-foreground">{a.description}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Opportunities Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Top Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="pb-2">Opportunity</th>
                <th className="pb-2">Estimated Savings (ms)</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opp) => (
                <tr key={opp.id}>
                  <td>{opp.title}</td>
                  <td>{Math.round(opp.savingsMs)} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            History
          </CardTitle>
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
