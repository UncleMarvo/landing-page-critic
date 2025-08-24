"use client";
import { useState, useEffect } from "react";
import { subDays } from "date-fns";
import { useResults } from "@/context/ResultsContext";
import { DashboardProvider, useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* Card Components */
import BestPracticesCard from "@/components/cards/bestpracticescard";
import OpportunitiesCard from "@/components/cards/opportunitiescard";
import AccessibilityCard from "@/components/cards/accessibilitycard";
import PerformanceMetricsCard from "@/components/cards/performancemetricscard";
import CategoryScoresCard from "@/components/cards/categoryscorescard";
import RecommendationsCard from "@/components/cards/recommendationscard";
import ExportReportCard from "@/components/cards/exportreportcard";
import WebVitalsCard from "@/components/cards/webvitalscard";
import AIInsightsCard from "@/components/cards/aiinsightscard";
import UrlInput from "@/components/ui/url-input";

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
  // lighthouse results - these will be used for cards that don't use context yet
  const [categories, setCategories] = useState<LighthouseCategory[]>([]);
  const [webVitals, setWebVitals] = useState<WebVital[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [accessibility, setAccessibility] = useState<any[]>([]);
  const [bestPractices, setBestPractices] = useState<any[]>([]);
  const [seo, setSeo] = useState<any[]>([]);
  const [performanceDetails, setPerformanceDetails] = useState<any[]>([]);

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
  }, [result]);

  return (
    <DashboardProvider>
      <DashboardContent 
        result={result}
        categories={categories}
        recommendations={recommendations}
        accessibility={accessibility}
        opportunities={opportunities}
        bestPractices={bestPractices}
      />
    </DashboardProvider>
  );
}

// Separate component for dashboard content that uses the context
function DashboardContent({ 
  result, 
  categories, 
  recommendations, 
  accessibility, 
  opportunities, 
  bestPractices 
}: {
  result: any;
  categories: any[];
  recommendations: any[];
  accessibility: any[];
  opportunities: any[];
  bestPractices: any[];
}) {
  // Get all context data and functions
  const { 
    setCurrentUrl, 
    currentUrl, 
    isLoading, 
    refreshData,
    performanceHistory,
    webVitalsData
  } = useDashboard();
  
  // Local state for the history chart (separate from context history)
  const [history, setHistory] = useState<any[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [startDate, setStartDate] = useState(subDays(new Date(), 30)); // default 30 days back
  const [endDate, setEndDate] = useState(new Date());

  // Set the current URL when result changes
  useEffect(() => {
    if (result?.url) {
      setCurrentUrl(result.url);
    }
  }, [result?.url, setCurrentUrl]);

  // Fetch general history data for the history chart (separate from context)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const historyResponse = await fetch("/api/history");
        const historyData = await historyResponse.json();
        setHistory(historyData);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };
    fetchHistory();
  }, []);

  // Filter history based on date range
  useEffect(() => {
    const filterHistory = async () => {
      const filteredHistory = history.filter((entry: any) => {
        const analyzed = new Date(entry.analyzedAt);
        return analyzed >= startDate && analyzed <= endDate;
      });
      setFilteredHistory(filteredHistory);
    };
    filterHistory();
  }, [startDate, endDate, history]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lighthouse Dashboard</h1>
        <div className="flex items-center space-x-4">
          {currentUrl && (
            <span className="text-sm text-gray-600">
              Analyzing: <span className="font-mono">{currentUrl}</span>
            </span>
          )}
          <Button 
            onClick={refreshData}
            disabled={isLoading || !currentUrl}
            className="px-4 py-2"
          >
            {isLoading ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>
      </div>

      {/* URL Input for switching between different URLs */}
      <UrlInput className="mb-6" />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {!isLoading && (
        <>
          {/* Export Report */}
          <ExportReportCard data={result} />

          {/* AI-Powered Insights */}
          <AIInsightsCard />

          {/* Category Scores */}
          <CategoryScoresCard />

          {/* Web Vitals - Now uses context data */}
          <WebVitalsCard />

          {/* Performance Metrics - Now uses context data */}
          <PerformanceMetricsCard />

          {/* Recommendations */}
          <RecommendationsCard />

          {/* Accessibility */}
          <AccessibilityCard />

          {/* Opportunities */}
          <OpportunitiesCard />

          {/* Best Practices */}
          <BestPracticesCard />
        </>
      )}

      {/* Context Data Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Dashboard Context Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Current URL</p>
              <p className="font-mono text-sm">{currentUrl || "Not set"}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Web Vitals Data</p>
              <p className="text-sm">{webVitalsData ? `${webVitalsData.length} metrics` : "No data"}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Performance History</p>
              <p className="text-sm">{performanceHistory ? `${performanceHistory.length} entries` : "No data"}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Loading State</p>
              <p className="text-sm">{isLoading ? "Loading..." : "Ready"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
