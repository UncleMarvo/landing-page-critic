"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// Import existing types from the card components
type WebVitalsPanelProps = {
  id: string;
  title: string;
  value?: number;
};

type HistoryEntry = {
  analyzedAt: string;
  performance: number;
  accessibility: number;
  seo: number;
  bestPractices: number;
};

type CategoryScoresPanelProps = {
  id: string;
  title: string;
  score: number;
  description?: string;
};

type RecommendationsPanelProps = {
  id: string;
  title: string;
  description?: string;
};

type AccessibilityPanelProps = {
  id: string;
  title: string;
  description?: string;
};

type OpportunitiesPanelProps = {
  id: string;
  title: string;
  description?: string;
};

type BestPracticesPanelProps = {
  id: string;
  title: string;
  description?: string;
};

// Define the context state interface
interface DashboardState {
  currentUrl: string;
  setCurrentUrl: (url: string) => void;

  webVitalsData: WebVitalsPanelProps[] | null;
  setWebVitalsData: (data: WebVitalsPanelProps[]) => void;

  performanceHistory: HistoryEntry[] | null;
  setPerformanceHistory: (history: HistoryEntry[]) => void;

  categoriesData: CategoryScoresPanelProps[] | null;
  setCategoriesData: (data: CategoryScoresPanelProps[]) => void;

  recommendationsData: RecommendationsPanelProps[] | null;
  setRecommendationsData: (data: RecommendationsPanelProps[]) => void;

  accessibilityData: AccessibilityPanelProps[] | null;
  setAccessibilityData: (data: AccessibilityPanelProps[]) => void;

  opportunitiesData: OpportunitiesPanelProps[] | null;
  setOpportunitiesData: (data: OpportunitiesPanelProps[]) => void;

  bestPracticesData: BestPracticesPanelProps[] | null;
  setBestPracticesData: (data: BestPracticesPanelProps[]) => void;

  platforms: string[] | null;
  setPlatforms: (platforms: string[]) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Helper function to refresh data without changing URL
  refreshData: () => Promise<void>;
}

// Create the context with default values
const DashboardContext = createContext<DashboardState>({
  currentUrl: "",
  setCurrentUrl: () => {},
  webVitalsData: null,
  setWebVitalsData: () => {},
  performanceHistory: null,
  setPerformanceHistory: () => {},
  categoriesData: null,
  setCategoriesData: () => {},
  recommendationsData: null,
  setRecommendationsData: () => {},
  accessibilityData: null,
  setAccessibilityData: () => {},
  opportunitiesData: null,
  setOpportunitiesData: () => {},
  bestPracticesData: null,
  setBestPracticesData: () => {},
  platforms: null,
  setPlatforms: () => {},
  isLoading: false,
  setIsLoading: () => {},
  refreshData: async () => {},
});

// Provider component that manages the dashboard state
export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State management for dashboard data
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [webVitalsData, setWebVitalsData] = useState<WebVitalsPanelProps[] | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<HistoryEntry[] | null>(null);
  const [categoriesData, setCategoriesData] = useState<CategoryScoresPanelProps[] | null>(null);
  const [recommendationsData, setRecommendationsData] = useState<RecommendationsPanelProps[] | null>(null);
  const [accessibilityData, setAccessibilityData] = useState<AccessibilityPanelProps[] | null>(null);
  const [opportunitiesData, setOpportunitiesData] = useState<OpportunitiesPanelProps[] | null>(null);
  const [bestPracticesData, setBestPracticesData] = useState<BestPracticesPanelProps[] | null>(null);
  const [platforms, setPlatforms] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Function to fetch Lighthouse analysis data
  const fetchAnalysisData = useCallback(async (url: string) => {
    if (!url) return;

    try {
      setIsLoading(true);
      
      // Fetch Lighthouse analysis data
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract all data from the response
      if (data.webVitals) {
        setWebVitalsData(data.webVitals);
      }
      if (data.categories) {
        setCategoriesData(data.categories);
      }
      if (data.recommendations) {
        setRecommendationsData(data.recommendations);
      }
      if (data.accessibility) {
        setAccessibilityData(data.accessibility);
      }
      if (data.opportunities) {
        setOpportunitiesData(data.opportunities);
      }
      if (data.bestPractices) {
        setBestPracticesData(data.bestPractices);
      }
      if (data.platforms) {
        setPlatforms(data.platforms);
      }
    } catch (error) {
      console.error("Error fetching analysis data:", error);
      // Keep existing data on error - don't clear the context state
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to fetch historical performance data
  const fetchHistoryData = useCallback(async (url: string) => {
    if (!url) return;

    try {
      // Fetch timeline data for the current URL
      const response = await fetch(`/api/timeline?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error(`Timeline fetch failed: ${response.status}`);
      }

      const data = await response.json();
      setPerformanceHistory(data);
    } catch (error) {
      console.error("Error fetching history data:", error);
      // Keep existing data on error - don't clear the context state
    }
  }, []);

  // Function to refresh data without changing the URL
  const refreshData = useCallback(async () => {
    if (currentUrl) {
      await Promise.all([
        fetchAnalysisData(currentUrl),
        fetchHistoryData(currentUrl)
      ]);
    }
  }, [currentUrl, fetchAnalysisData, fetchHistoryData]);

  // Effect to fetch data when currentUrl changes
  useEffect(() => {
    if (currentUrl) {
      // Fetch both analysis and history data when URL changes
      Promise.all([
        fetchAnalysisData(currentUrl),
        fetchHistoryData(currentUrl)
      ]);
    }
  }, [currentUrl, fetchAnalysisData, fetchHistoryData]);

  // Context value with all state and functions
  const contextValue: DashboardState = {
    currentUrl,
    setCurrentUrl,
    webVitalsData,
    setWebVitalsData,
    performanceHistory,
    setPerformanceHistory,
    categoriesData,
    setCategoriesData,
    recommendationsData,
    setRecommendationsData,
    accessibilityData,
    setAccessibilityData,
    opportunitiesData,
    setOpportunitiesData,
    bestPracticesData,
    setBestPracticesData,
    platforms,
    setPlatforms,
    isLoading,
    setIsLoading,
    refreshData,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

// Custom hook to use the dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  
  return context;
};

// Export the context for direct access if needed
export { DashboardContext };
