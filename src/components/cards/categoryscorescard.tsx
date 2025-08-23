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

type CategoryScoresPanelProps = {
  id: string;
  title: string;
  score: number; // 0–1
  description?: string;
};

interface CategoryScoresCardProps {
  data: CategoryScoresPanelProps[];
}

export default function CategoryScoresCard({ data }: CategoryScoresCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
        <CardTitle className="text-2xl font-bold">Category Scores</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {!data || data.length === 0 ? (
          <div>No data available.</div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}
