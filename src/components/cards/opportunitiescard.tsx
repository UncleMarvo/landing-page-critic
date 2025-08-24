"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useDashboard } from "@/context/DashboardContext";
import { Button } from "@/components/ui/button";

type Opportunity = {
  id: string;
  title: string;
  savingsMs: number;
};

export default function OpportunitiesCard() {
  // Get data from DashboardContext
  const { opportunitiesData, isLoading, refreshData } = useDashboard();
  
  // Use data from context or empty array if no data
  const data = opportunitiesData || [];
  // Handle loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Opportunities</CardTitle>
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
              <p className="text-gray-600 text-sm">Loading opportunities data...</p>
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
            <CardTitle className="text-2xl font-bold">Opportunities</CardTitle>
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
              <p className="text-gray-500">No opportunities data available</p>
              <p className="text-gray-400 text-sm">Enter a URL to analyze and view opportunities</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topData = data.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Opportunities</CardTitle>
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
      <CardContent className="flex justify-between items-stretch">
        {/* Table */}
        <table className="w-2/3 self-start">
          <thead>
            <tr className="text-left border-b">
              <th>Metric</th>
              <th>Estimated Savings (ms)</th>
            </tr>
          </thead>
          <tbody>
            {topData.map((op) => (
              <tr key={op.id} className="border-b">
                <td>{op.title}</td>
                <td>{Math.round(op.savingsMs)} ms</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bar Chart */}
        <div className="w-1/3 flex-grow h-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={topData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <XAxis type="number" tickFormatter={(val) => `${Math.round(val)}ms`} />
              <YAxis type="category" dataKey="title" width={150} />
              <Tooltip formatter={(val: number) => `${Math.round(val)} ms`} />
              <Bar dataKey="savingsMs">
                {topData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#4ade80" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
