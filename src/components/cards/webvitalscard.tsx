"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type WebVitalsPanelProps = {
  id: string;
  title: string;
  value?: number;
};

interface WebVitalsCardProps {
  data: WebVitalsPanelProps[];
}

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

export default function WebVitalsCard({ data }: WebVitalsCardProps) {
  // Merge incoming data with defaults, keeping missing metrics
  const mergedData = defaultMetrics.map((metric) => {
    const found = data.find((d) => d.id.toLowerCase() === metric.id);
    return { ...metric, value: found?.value };
  });

  const metricUnit = (id: string) => (id === "cls" ? "" : "ms");

  const classifyVital = (
    id: string,
    value?: number
  ): "good" | "needs-improvement" | "poor" | undefined => {
    if (value === undefined) return undefined;

    switch (id.toLowerCase()) {
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
      case "fid":
      case "tti":
      case "inp":
        if (value <= 100) return "good";
        if (value <= 300) return "needs-improvement";
        return "poor";
      default:
        return "needs-improvement";
    }
  };

  const vitalColor = (level?: string) => {
    if (level === "good") return "text-green-600";
    if (level === "needs-improvement") return "text-yellow-600";
    if (level === "poor") return "text-red-600";
    return "text-gray-400";
  };

  const processedData = mergedData.map((v) => ({
    ...v,
    unit: metricUnit(v.id),
    level: classifyVital(v.id, v.value),
    displayValue: v.value !== undefined ? Math.round(v.value) : "--",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Web Vitals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              {processedData.map((v) => (
                <div
                  key={v.id}
                  className="category-card p-4 bg-gray-50 rounded-lg shadow"
                >
                  <h3 className="text-md font-semibold">{v.title}</h3>
                  <p className={`text-2xl font-bold ${vitalColor(v.level)}`}>
                    {v.displayValue} {v.unit} {v.level ? `(${v.level})` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedData.filter((v) => v.value !== undefined)}>
                <XAxis dataKey="title" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {processedData.map((entry, index) => {
                    if (entry.value === undefined) return null;

                    let color = "#ef4444"; // default red
                    switch (entry.id.toLowerCase()) {
                      case "fcp":
                        if (entry.value <= 1800) color = "#16a34a";
                        else if (entry.value <= 3000) color = "#eab308";
                        break;
                      case "lcp":
                        if (entry.value <= 2500) color = "#16a34a";
                        else if (entry.value <= 4000) color = "#eab308";
                        break;
                      case "tbt":
                        if (entry.value <= 200) color = "#16a34a";
                        else if (entry.value <= 600) color = "#eab308";
                        break;
                      case "cls":
                        if (entry.value <= 0.1) color = "#16a34a";
                        else if (entry.value <= 0.25) color = "#eab308";
                        break;
                      case "si":
                        if (entry.value <= 3400) color = "#16a34a";
                        else if (entry.value <= 5800) color = "#eab308";
                        break;
                      case "fid":
                      case "tti":
                      case "inp":
                        if (entry.value <= 100) color = "#16a34a";
                        else if (entry.value <= 300) color = "#eab308";
                        break;
                    }

                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

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
  );
}
