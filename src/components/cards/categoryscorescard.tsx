"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Bar,
  BarChart,
  Cell,
} from "recharts";
import { useDashboard } from "@/context/DashboardContext";
import { Button } from "@/components/ui/button";

type CategoryScoresPanelProps = {
  id: string;
  title: string;
  score: number; // 0–1
  description?: string;
};

export default function CategoryScoresCard() {
  // Get data from DashboardContext
  const { categoriesData, isLoading, refreshData } = useDashboard();
  
  // Use data from context or empty array if no data
  const data = categoriesData || [];
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  // Handle loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Category Scores</CardTitle>
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
              <p className="text-gray-600 text-sm">Loading category scores...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle empty data state
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Category Scores</CardTitle>
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
              <p className="text-gray-500">No category scores available</p>
              <p className="text-gray-400 text-sm">Enter a URL to analyze and view category scores</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
        <CardTitle className="text-2xl font-bold">Category Scores</CardTitle>
        <Button
          onClick={refreshData}
          disabled={isLoading}
          size="sm"
          variant="outline"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                {data.map((data) => (
                  <div
                    key={data.id}
                    className="category-card p-4 bg-gray-50 rounded-lg shadow"
                  >
                    <h3 className="text-md font-semibold">{data.title}</h3>
                    <p className={`text-2xl font-bold ${getScoreColor(data.score)}`}>
                      {data.score ?? "--"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data}>
                  <XAxis dataKey="title" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score">
                    {data.map((entry, index) => {
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
              <div className="flex justify-center gap-6 mt-2 text-sm">
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
