"use client";
import { useState, useEffect } from "react";
import { subDays } from "date-fns";
import { useResults } from "@/context/ResultsContext";
import { DashboardProvider, useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  RefreshCw,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Globe,
  Crown,
  CreditCard,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import UpgradePrompt, { 
  HistoricalDataUpgradePrompt, 
  ExportUpgradePrompt 
} from "@/components/payments/UpgradePrompt";

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

import UsageTracker from "@/components/payments/UsageTracker";
import FeatureGate from "@/components/payments/FeatureGate";

/*
 * Dashboard Panel Categorization:
 * 
 * FREE TIER PANELS (Available to all users):
 * - UsageTracker: Shows usage limits and remaining analyses
 * - CategoryScoresCard: Basic performance scores (Performance, Accessibility, Best Practices, SEO)
 * - WebVitalsCard: Core Web Vitals metrics
 * - BestPracticesCard: Basic best practices analysis
 * - AccessibilityCard: Basic accessibility analysis
 * - OpportunitiesCard: Basic optimization opportunities
 * 
 * PRO TIER PANELS (Require Pro subscription):
 * - PerformanceMetricsCard: Detailed performance metrics with historical data
 * - AIInsightsCard: AI-powered insights and recommendations
 * - RecommendationsCard: Detailed recommendations with implementation steps
 * - ExportReportCard: PDF/CSV export functionality
 * 
 * Panel ordering is dynamically adjusted based on user tier:
 * - Free users: Free panels first, then Pro panels with upgrade prompts
 * - Pro users: All panels in original order for consistency
 */

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
    <ProtectedRoute>
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
    </ProtectedRoute>
  );
}

// Separate component for dashboard content that uses the context
function DashboardContent({
  result,
  categories,
  recommendations,
  accessibility,
  opportunities,
  bestPractices,
}: {
  result: any;
  categories: any[];
  recommendations: any[];
  accessibility: any[];
  opportunities: any[];
  bestPractices: any[];
}) {
  const { user, logout } = useAuth();
  const {
    isLoading,
    refreshData,
    webVitalsData,
    categoriesData,
    recommendationsData,
    accessibilityData,
    opportunitiesData,
    bestPracticesData,
  } = useDashboard();

  // Get user's tier (default to 'free' if not available)
  const userTier = (user?.tier as "free" | "pro") || "free";

  // Check for pending URL analysis on mount
  useEffect(() => {
    const pendingUrl = localStorage.getItem("pendingAnalysisUrl");
    if (pendingUrl) {
      console.log("Found pending URL for analysis:", pendingUrl);

      // Trigger automatic analysis
      const performAnalysis = async () => {
        try {
          const response = await fetch("/api/analyze", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: pendingUrl }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log("Automatic analysis completed for:", pendingUrl);

            // Check if fallback data was used
            if (data.fallback) {
              console.log("Note: Using fallback data due to platform issues");
            }

            // Refresh dashboard data
            refreshData();
          } else {
            console.error("Automatic analysis failed for:", pendingUrl);
          }
        } catch (error) {
          console.error("Error during automatic analysis:", error);
        } finally {
          // Clear the pending URL regardless of success/failure
          localStorage.removeItem("pendingAnalysisUrl");
        }
      };

      performAnalysis();
    }
  }, [refreshData]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and navigation */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Landing Page Critic</span>
              </div>
            </div>

            {/* Center - URL Input */}
            <div className="flex-1 max-w-2xl mx-8">
              <UrlInput />
            </div>

            {/* Right side - User menu and theme toggle */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />

              <Button
                onClick={refreshData}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="btn-secondary"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                {isLoading ? "Refreshing..." : "Refresh"}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {user?.name || user?.email}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Badge variant={user?.tier === 'pro' ? 'default' : 'secondary'} className="text-xs">
                          {user?.tier === 'pro' ? (
                            <>
                              <Crown className="h-3 w-3 mr-1" />
                              Pro
                            </>
                          ) : (
                            'Free'
                          )}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  {user?.tier === 'pro' && (
                    <DropdownMenuItem>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Reports</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Upgrade Banner for Free Users */}
        {userTier === 'free' && (
          <div className="mb-6">
            <UpgradePrompt 
              variant="compact"
              title="Unlock Full Dashboard Access"
              description="Upgrade to Pro for unlimited analyses, AI insights, and advanced features"
            />
          </div>
        )}

        {/* Dynamic Panel Layout - Order based on user tier */}
        <div className="space-y-6">
          {/* Usage Tracker - Always first */}
          <UsageTracker tier={userTier} />

          {/* Dynamic panel ordering based on user tier */}
          {userTier === 'free' ? (
            // Free user layout: Free panels first, then Pro panels with upgrade prompts
            // This improves UX by showing available content first, then upgrade opportunities
            <>
              {/* Free panels - Available to all users */}
              <CategoryScoresCard />
              <WebVitalsCard />
              <BestPracticesCard />
              <AccessibilityCard />
              <OpportunitiesCard />

              {/* Visual separator for Pro features */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted-foreground/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Pro Features
                  </span>
                </div>
              </div>

              {/* Pro panels with upgrade prompts - Show what's available with Pro */}
              <FeatureGate 
                feature="performanceMetrics" 
                tier={userTier}
                fallback={<HistoricalDataUpgradePrompt />}
              >
                <PerformanceMetricsCard />
              </FeatureGate>

              <FeatureGate feature="aiInsights" tier={userTier}>
                <AIInsightsCard />
              </FeatureGate>

              <FeatureGate 
                feature="detailedRecommendations" 
                tier={userTier}
                fallback={
                  <UpgradePrompt
                    title="Detailed Recommendations"
                    description="Get comprehensive recommendations with implementation steps and priority rankings"
                    showFeatures={false}
                  />
                }
              >
                <RecommendationsCard />
              </FeatureGate>

              <FeatureGate feature="exportReports" tier={userTier}>
                <ExportReportCard />
              </FeatureGate>
            </>
          ) : (
            // Pro user layout - Keep current order for consistency
            // Pro users see all panels in the original order for familiarity
            <>
              {/* Basic Panels - Available to all users */}
              <CategoryScoresCard />
              <WebVitalsCard />
              
              {/* Performance Metrics - Pro users have full access */}
              <PerformanceMetricsCard />

              {/* AI Insights - Pro only */}
              <AIInsightsCard />

              {/* Basic Analysis Panels - Available to all users */}
              <BestPracticesCard />
              <AccessibilityCard />

              {/* Detailed Recommendations - Pro only */}
              <RecommendationsCard />

              <OpportunitiesCard />

              {/* Export Reports - Pro only */}
              <ExportReportCard />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
