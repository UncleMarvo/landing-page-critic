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
  BarChart3, 
  RefreshCw, 
  User, 
  LogOut, 
  Settings,
  ChevronDown,
  Globe
} from "lucide-react";

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
import SubscriptionCard from "@/components/payments/SubscriptionCard";

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
  
  const { user, logout } = useAuth();
  const { setResult } = useResults();
  
  // Local state for the history chart (separate from context history)
  const [history, setHistory] = useState<any[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [startDate, setStartDate] = useState(subDays(new Date(), 30)); // default 30 days back
  const [endDate, setEndDate] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Set the current URL when result changes
  useEffect(() => {
    if (result?.url) {
      setCurrentUrl(result.url);
    }
  }, [result?.url, setCurrentUrl]);

  // Check for pending URL analysis on dashboard load
  useEffect(() => {
    const checkPendingAnalysis = async () => {
      const pendingUrl = localStorage.getItem('pendingAnalysisUrl');
      
      if (pendingUrl && !result) {
        console.log('Found pending URL for analysis:', pendingUrl);
        
        try {
          // Clear the pending URL immediately to prevent duplicate analysis
          localStorage.removeItem('pendingAnalysisUrl');
          
          // Set the current URL
          setCurrentUrl(pendingUrl);
          
          // Perform the analysis
          const res = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: pendingUrl }),
          });
          
          if (res.ok) {
            const data = await res.json();
            setResult(data); // Save analysis globally
            console.log('Automatic analysis completed for:', pendingUrl);
            
            // Show fallback notification if using fallback data
            if (data.fallback) {
              console.log('Using fallback data:', data.message);
              // You could add a toast notification here if you have a notification system
            }
          } else {
            console.error('Failed to analyze pending URL:', pendingUrl);
          }
        } catch (error) {
          console.error('Error analyzing pending URL:', error);
        }
      }
    };

    // Only check for pending analysis if user is authenticated and no current result
    if (user && !result) {
      checkPendingAnalysis();
    }
  }, [user, result, setCurrentUrl, setResult]);

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

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-responsive">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">Dashboard</span>
              </div>
              {currentUrl && (
                <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span className="font-mono max-w-xs truncate">{currentUrl}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              <Button 
                onClick={refreshData}
                disabled={isLoading || !currentUrl}
                variant="outline"
                size="sm"
                className="btn-secondary"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? "Refreshing..." : "Refresh"}
              </Button>
              
              {/* Enhanced User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-foreground">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-card rounded-lg shadow-lg border py-2 z-50">
                    <div className="px-4 py-3 border-b">
                      <div className="font-medium text-foreground">{user?.name}</div>
                      <div className="text-sm text-muted-foreground">{user?.email}</div>
                    </div>
                    <div className="py-1">
                      <button className="flex items-center w-full px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
                        <User className="mr-3 h-4 w-4" />
                        Profile
                      </button>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
                        <Settings className="mr-3 h-4 w-4" />
                        Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-responsive py-8 space-y-8">
        {/* URL Input for switching between different URLs */}
        <UrlInput className="mb-6" />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <div className="loading-spinner h-12 w-12 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {!isLoading && (
          <div className="space-y-8">
            {/* Subscription Management */}
            <SubscriptionCard className="mb-6" />

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
          </div>
        )}

        {/* Context Data Status - Enhanced */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="h4 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Dashboard Context Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Current URL</p>
                <p className="font-mono text-sm text-foreground truncate">
                  {currentUrl || "Not set"}
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Web Vitals Data</p>
                <p className="text-sm font-medium text-foreground">
                  {webVitalsData ? `${webVitalsData.length} metrics` : "No data"}
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Performance History</p>
                <p className="text-sm font-medium text-foreground">
                  {performanceHistory ? `${performanceHistory.length} entries` : "No data"}
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Loading State</p>
                <p className="text-sm font-medium text-foreground">
                  {isLoading ? "Loading..." : "Ready"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
