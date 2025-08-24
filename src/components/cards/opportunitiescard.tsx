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
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th>Opportunity</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {topData.map((op) => (
              <tr key={op.id} className="border-b">
                <td className="p-2 font-medium">{op.title}</td>
                <td className="p-2 text-muted-foreground">{op.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
