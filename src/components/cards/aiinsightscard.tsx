"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/context/AuthContext";
import FeatureGate from "@/components/payments/FeatureGate";
import { AIInsightsUpgradePrompt } from "@/components/payments/UpgradePrompt";
import {
  Brain,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Eye,
  Target,
  TrendingUp,
  Star,
  Calendar,
  DollarSign,
  History,
  ChevronDown,
  ChevronUp,
  Play,
  CheckSquare,
  Square,
  Crown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Enhanced types for AI insights
interface AIInsight {
  id: string;
  title: string;
  description: string;
  severity: "High" | "Medium" | "Low";
  category:
    | "Performance"
    | "Accessibility"
    | "SEO"
    | "Best Practices"
    | "Web Vitals";
  actionable: boolean;
  estimatedImpact: string;
  priority: number;
  status: "pending" | "applied" | "ignored";
  createdAt: string;
  // Enhanced fields
  historicalContext?: string;
  platformSpecific?: boolean;
  platforms?: string[];
  implementationSteps?: string[];
  expectedTimeline?: string;
  costBenefit?: string;
}

export default function AIInsightsCard() {
  // Get data from DashboardContext
  const {
    currentUrl,
    webVitalsData,
    categoriesData,
    opportunitiesData,
    recommendationsData,
    accessibilityData,
    bestPracticesData,
    performanceHistory,
    platforms,
    isLoading,
  } = useDashboard();

  // Get user from AuthContext
  const { user } = useAuth();

  // Local state
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());
  const [showHistoricalContext, setShowHistoricalContext] = useState(false);

  // Load existing insights when URL changes
  useEffect(() => {
    if (currentUrl) {
      loadExistingInsights();
    }
  }, [currentUrl]);

  // Load existing insights from database
  const loadExistingInsights = async () => {
    try {
      const response = await fetch(
        `/api/ai-insights?url=${encodeURIComponent(currentUrl)}`
      );
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
      }
    } catch (error) {
      console.error("Error loading existing insights:", error);
    }
  };

  // Generate new AI insights
  const generateInsights = async () => {
    if (!currentUrl) {
      setError("No URL available for analysis");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Prepare data for AI analysis
      const requestData = {
        url: currentUrl,
        webVitals: webVitalsData || [],
        categories: categoriesData || [],
        opportunities: opportunitiesData || [],
        recommendations: recommendationsData || [],
        accessibility: accessibilityData || [],
        bestPractices: bestPracticesData || [],
        performanceHistory: performanceHistory || [],
        platforms: platforms || [],
      };

      const response = await fetch("/api/ai-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate insights");
      }

      const data = await response.json();
      setInsights(data.insights || []);
    } catch (error: any) {
      console.error("Error generating insights:", error);
      setError(error.message || "Failed to generate AI insights");
    } finally {
      setIsGenerating(false);
    }
  };

  // Update insight status
  const updateInsightStatus = async (
    insightId: string,
    status: "applied" | "ignored"
  ) => {
    setUpdatingStatus(insightId);
    try {
      const response = await fetch("/api/ai-insights", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ insightId, status }),
      });

      if (response.ok) {
        // Reload insights from database to get updated data
        await loadExistingInsights();

        // Show success message
        const statusText =
          status === "applied" ? "marked as applied" : "marked as ignored";
        console.log(`Insight ${statusText} successfully`);
      } else {
        console.error("Failed to update insight status");
      }
    } catch (error) {
      console.error("Error updating insight status:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Toggle insight expansion
  const toggleInsightExpansion = (insightId: string) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(insightId)) {
      newExpanded.delete(insightId);
    } else {
      newExpanded.add(insightId);
    }
    setExpandedInsights(newExpanded);
  };

  // Export insights to CSV
  const exportToCSV = () => {
    if (insights.length === 0) return;

    const csvContent = [
      [
        "Title",
        "Description",
        "Severity",
        "Category",
        "Priority",
        "Status",
        "Estimated Impact",
        "Expected Timeline",
        "Cost Benefit",
        "Historical Context",
        "Implementation Steps",
        "Created At",
      ],
      ...insights.map((insight) => [
        insight.title,
        insight.description.replace(/"/g, '""'), // Escape quotes
        insight.severity,
        insight.category,
        insight.priority.toString(),
        insight.status,
        insight.estimatedImpact,
        insight.expectedTimeline || 'Unknown',
        insight.costBenefit || 'Medium effort, medium impact',
        insight.historicalContext || 'None',
        (insight.implementationSteps || []).join('; '),
        new Date(insight.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-insights-${currentUrl.replace(/[^a-zA-Z0-9]/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "text-red-600 bg-red-50 border-red-200";
      case "Medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Performance":
        return <Zap className="w-4 h-4" />;
      case "Accessibility":
        return <Eye className="w-4 h-4" />;
      case "SEO":
        return <Target className="w-4 h-4" />;
      case "Best Practices":
        return <CheckCircle className="w-4 h-4" />;
      case "Web Vitals":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "applied":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "ignored":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get priority stars
  const getPriorityStars = (priority: number) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${
            i <= priority ? "text-yellow-500 fill-current" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  // Filter insights by severity
  const highPriorityInsights = insights.filter((i) => i.severity === "High");
  const mediumPriorityInsights = insights.filter(
    (i) => i.severity === "Medium"
  );
  const lowPriorityInsights = insights.filter((i) => i.severity === "Low");

  return (
    <FeatureGate
      feature="aiInsights"
      tier={user?.tier as 'free' | 'pro'}
      fallback={<AIInsightsUpgradePrompt />}
    >
      <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-2xl font-bold">
              AI-Powered Insights
            </CardTitle>
            <div className="flex items-center space-x-1 ml-2">
              <History className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">Pro</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {insights.length > 0 && (
              <Button
                onClick={exportToCSV}
                size="sm"
                variant="outline"
                className="flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </Button>
            )}
            <Button
              onClick={generateInsights}
              disabled={isGenerating || !currentUrl || isLoading}
              size="sm"
              className="flex items-center space-x-1"
            >
              <Brain className="w-4 h-4" />
              <span>
                {isGenerating ? "Generating..." : "Generate Insights"}
              </span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Generating AI insights with historical context...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isGenerating && insights.length === 0 && !error && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No AI insights available</p>
              <p className="text-gray-400 text-sm">
                {currentUrl
                  ? 'Click "Generate Insights" to get AI-powered recommendations with historical context'
                  : "Enter a URL to analyze and generate insights"}
              </p>
            </div>
          </div>
        )}

        {/* Insights Display */}
        {!isGenerating && insights.length > 0 && (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-5 gap-4 text-sm">
              <div className="text-center p-2 bg-red-50 rounded">
                <div className="text-red-600 font-semibold">
                  {highPriorityInsights.length}
                </div>
                <div className="text-red-500">High Priority</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <div className="text-yellow-600 font-semibold">
                  {mediumPriorityInsights.length}
                </div>
                <div className="text-yellow-500">Medium Priority</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-green-600 font-semibold">
                  {lowPriorityInsights.length}
                </div>
                <div className="text-green-500">Low Priority</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="text-blue-600 font-semibold">
                  {insights.filter((i) => i.status === "applied").length}
                </div>
                <div className="text-blue-500">Applied</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded">
                <div className="text-purple-600 font-semibold">
                  {insights.filter((i) => i.platformSpecific).length}
                </div>
                <div className="text-purple-500">Platform Specific</div>
              </div>
            </div>

            {/* Historical Context Toggle */}
            {insights.some(i => i.historicalContext) && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistoricalContext(!showHistoricalContext)}
                  className="flex items-center space-x-1"
                >
                  {showHistoricalContext ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <span>Historical Context</span>
                </Button>
              </div>
            )}

            {/* Insights List */}
            <div className="space-y-3">
              {insights
                .sort((a, b) => {
                  // Sort by priority (high to low), then by severity
                  const priorityOrder = { High: 3, Medium: 2, Low: 1 };
                  const aPriority = priorityOrder[a.severity] || 1;
                  const bPriority = priorityOrder[b.severity] || 1;

                  if (aPriority !== bPriority) return bPriority - aPriority;
                  return b.priority - a.priority;
                })
                .map((insight) => (
                  <div
                    key={insight.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2 flex-1">
                        {getCategoryIcon(insight.category)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">
                            {insight.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                            <span
                              className={`px-2 py-1 rounded-full border ${getSeverityColor(insight.severity)}`}
                            >
                              {insight.severity}
                            </span>
                            <span
                              className={`flex items-center space-x-1 ${insight.status === "applied" ? "text-green-600" : insight.status === "ignored" ? "text-red-600" : "text-yellow-600"}`}
                            >
                              {getStatusIcon(insight.status)}
                              <span className="capitalize font-medium">
                                {insight.status}
                              </span>
                            </span>
                            {insight.platformSpecific && (
                              <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded-full border border-purple-200">
                                Platform Specific
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Priority Stars */}
                      <div className="flex items-center space-x-1 ml-2">
                        {getPriorityStars(insight.priority)}
                      </div>

                      {/* Action Buttons */}
                      {insight.status === "pending" && (
                        <div className="flex space-x-1 ml-2">
                          <Button
                            onClick={() =>
                              updateInsightStatus(insight.id, "applied")
                            }
                            disabled={updatingStatus === insight.id}
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                          >
                            {updatingStatus === insight.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-1"></div>
                            ) : (
                              <CheckSquare className="w-3 h-3 mr-1" />
                            )}
                            Applied
                          </Button>
                          <Button
                            onClick={() =>
                              updateInsightStatus(insight.id, "ignored")
                            }
                            disabled={updatingStatus === insight.id}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            {updatingStatus === insight.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                            ) : (
                              <Square className="w-3 h-3 mr-1" />
                            )}
                            Ignore
                          </Button>
                        </div>
                      )}
                      {insight.status !== "pending" && (
                        <div className="text-xs text-gray-500 ml-2">
                          {insight.status === "applied"
                            ? "✅ Implemented"
                            : "❌ Dismissed"}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {insight.description}
                    </p>

                    {/* Enhanced Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-3 h-3 text-blue-600" />
                          <span className="font-medium">Expected Impact:</span>
                          <span className="text-gray-600">{insight.estimatedImpact}</span>
                        </div>
                        {insight.expectedTimeline && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-3 h-3 text-green-600" />
                            <span className="font-medium">Timeline:</span>
                            <span className="text-gray-600">{insight.expectedTimeline}</span>
                          </div>
                        )}
                        {insight.costBenefit && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-3 h-3 text-purple-600" />
                            <span className="font-medium">Cost/Benefit:</span>
                            <span className="text-gray-600">{insight.costBenefit}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expandable Details */}
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleInsightExpansion(insight.id)}
                        className="flex items-center space-x-1 text-xs"
                      >
                        {expandedInsights.has(insight.id) ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                        <span>Show Details</span>
                      </Button>

                      {expandedInsights.has(insight.id) && (
                        <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                          {/* Historical Context */}
                          {insight.historicalContext && showHistoricalContext && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <History className="w-3 h-3 text-blue-600" />
                                <span className="text-xs font-medium text-blue-800">Historical Context</span>
                              </div>
                              <p className="text-xs text-blue-700">{insight.historicalContext}</p>
                            </div>
                          )}

                          {/* Implementation Steps */}
                          {insight.implementationSteps && insight.implementationSteps.length > 0 && (
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <Play className="w-3 h-3 text-green-600" />
                                <span className="text-xs font-medium">Implementation Steps</span>
                              </div>
                              <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600">
                                {insight.implementationSteps.map((step, index) => (
                                  <li key={index}>{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {/* Platform Information */}
                          {insight.platforms && insight.platforms.length > 0 && (
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <Target className="w-3 h-3 text-purple-600" />
                                <span className="text-xs font-medium">Platforms</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {insight.platforms.map((platform, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                                  >
                                    {platform}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </FeatureGate>
  );
}
