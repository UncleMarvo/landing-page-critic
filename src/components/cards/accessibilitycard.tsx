"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/context/DashboardContext";
import { Button } from "@/components/ui/button";

type AccessibilityAudit = {
  id: string;
  title: string;
  score: number; // 0–1
  description?: string;
};

export default function AccessibilityCard() {
  // Get data from DashboardContext
  const { accessibilityData, isLoading, refreshData } = useDashboard();
  
  // Use data from context or empty array if no data
  const data = accessibilityData || [];
  // Handle loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Accessibility Issues</CardTitle>
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
              <p className="text-gray-600 text-sm">Loading accessibility data...</p>
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
            <CardTitle className="text-2xl font-bold">Accessibility Issues</CardTitle>
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
              <p className="text-gray-500">No accessibility data available</p>
              <p className="text-gray-400 text-sm">Enter a URL to analyze and view accessibility issues</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pass vs fail counts
  const passCount = data.filter((d) => d.score === 1).length;
  const failCount = data.length - passCount;

  const chartData = [
    { name: "Pass", value: passCount },
    { name: "Fail", value: failCount },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Accessibility Issues</CardTitle>
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
              <th>Audit</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {data.map((audit) => (
              <tr key={audit.id} className="border-b">
                <td className="p-2 font-medium">{audit.title}</td>
                <td className="p-2 text-muted-foreground">{audit.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
