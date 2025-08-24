"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/context/DashboardContext";
import { Button } from "@/components/ui/button";

type RecommendationsPanelProps = {
  id: string;
  title: string;
  description?: string;
};

export default function RecommendationsCard() {
  // Get data from DashboardContext
  const { recommendationsData, isLoading, refreshData } = useDashboard();
  
  // Use data from context or empty array if no data
  const data = recommendationsData || [];
  // Handle loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Detailed Recommendations</CardTitle>
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
              <p className="text-gray-600 text-sm">Loading recommendations...</p>
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
            <CardTitle className="text-2xl font-bold">Detailed Recommendations</CardTitle>
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
              <p className="text-gray-500">No recommendations available</p>
              <p className="text-gray-400 text-sm">Enter a URL to analyze and view recommendations</p>
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
          <CardTitle className="text-2xl font-bold">Detailed Recommendations</CardTitle>
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
              <th>Title</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a: any) => (
              <tr key={a.id} className="border-b">
                <td className="p-2 font-medium">{a.title}</td>
                <td className="p-2 text-muted-foreground">{a.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
