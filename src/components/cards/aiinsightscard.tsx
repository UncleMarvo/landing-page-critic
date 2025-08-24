"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/context/DashboardContext";
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
  TrendingUp
} from "lucide-react";

// Types for AI insights
interface AIInsight {
  id: string;
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  category: 'Performance' | 'Accessibility' | 'SEO' | 'Best Practices' | 'Web Vitals';
  actionable: boolean;
  estimatedImpact: string;
  priority: number;
  status: 'pending' | 'applied' | 'ignored';
  createdAt: string;
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
    isLoading 
  } = useDashboard();

  // Local state
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Load existing insights when URL changes
  useEffect(() => {
    if (currentUrl) {
      loadExistingInsights();
    }
  }, [currentUrl]);

  // Load existing insights from database
  const loadExistingInsights = async () => {
    try {
      const response = await fetch(`/api/ai-insights?url=${encodeURIComponent(currentUrl)}`);
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Error loading existing insights:', error);
    }
  };

  // Generate new AI insights
  const generateInsights = async () => {
    if (!currentUrl) {
      setError('No URL available for analysis');
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
      };

      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate insights');
      }

      const data = await response.json();
      setInsights(data.insights || []);
      
    } catch (error: any) {
      console.error('Error generating insights:', error);
      setError(error.message || 'Failed to generate AI insights');
    } finally {
      setIsGenerating(false);
    }
  };

  // Update insight status
  const updateInsightStatus = async (insightId: string, status: 'applied' | 'ignored') => {
    setUpdatingStatus(insightId);
    try {
      const response = await fetch('/api/ai-insights', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ insightId, status }),
      });

      if (response.ok) {
        // Reload insights from database to get updated data
        await loadExistingInsights();
        
        // Show success message
        const statusText = status === 'applied' ? 'marked as applied' : 'marked as ignored';
        console.log(`Insight ${statusText} successfully`);
      } else {
        console.error('Failed to update insight status');
      }
    } catch (error) {
      console.error('Error updating insight status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Export insights to CSV
  const exportToCSV = () => {
    if (insights.length === 0) return;

    const csvContent = [
      ['Title', 'Description', 'Severity', 'Category', 'Priority', 'Status', 'Estimated Impact', 'Created At'],
      ...insights.map(insight => [
        insight.title,
        insight.description.replace(/"/g, '""'), // Escape quotes
        insight.severity,
        insight.category,
        insight.priority.toString(),
        insight.status,
        insight.estimatedImpact,
        new Date(insight.createdAt).toLocaleDateString(),
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-insights-${currentUrl.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Performance': return <Zap className="w-4 h-4" />;
      case 'Accessibility': return <Eye className="w-4 h-4" />;
      case 'SEO': return <Target className="w-4 h-4" />;
      case 'Best Practices': return <CheckCircle className="w-4 h-4" />;
      case 'Web Vitals': return <TrendingUp className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'ignored': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  // Filter insights by severity
  const highPriorityInsights = insights.filter(i => i.severity === 'High');
  const mediumPriorityInsights = insights.filter(i => i.severity === 'Medium');
  const lowPriorityInsights = insights.filter(i => i.severity === 'Low');

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-2xl font-bold">AI-Powered Insights</CardTitle>
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
               <span>{isGenerating ? 'Generating...' : 'Generate Insights'}</span>
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
              <p className="text-gray-600 text-sm">Generating AI insights...</p>
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
                 {currentUrl ? 'Click "Generate Insights" to get AI-powered recommendations' : 'Enter a URL to analyze and generate insights'}
               </p>
             </div>
           </div>
         )}

        {/* Insights Display */}
        {!isGenerating && insights.length > 0 && (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center p-2 bg-red-50 rounded">
                <div className="text-red-600 font-semibold">{highPriorityInsights.length}</div>
                <div className="text-red-500">High Priority</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <div className="text-yellow-600 font-semibold">{mediumPriorityInsights.length}</div>
                <div className="text-yellow-500">Medium Priority</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-green-600 font-semibold">{lowPriorityInsights.length}</div>
                <div className="text-green-500">Low Priority</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="text-blue-600 font-semibold">{insights.filter(i => i.status === 'applied').length}</div>
                <div className="text-blue-500">Applied</div>
              </div>
            </div>

            {/* Insights List */}
            <div className="space-y-3">
              {insights
                .sort((a, b) => {
                  // Sort by priority (high to low), then by severity
                  const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                  const aPriority = priorityOrder[a.severity] || 1;
                  const bPriority = priorityOrder[b.severity] || 1;
                  
                  if (aPriority !== bPriority) return bPriority - aPriority;
                  return b.priority - a.priority;
                })
                .map((insight) => (
                  <div key={insight.id} className="border rounded-lg p-4 space-y-3">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(insight.category)}
                        <div>
                          <h4 className="font-semibold text-sm">{insight.title}</h4>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span className={`px-2 py-1 rounded-full border ${getSeverityColor(insight.severity)}`}>
                              {insight.severity}
                            </span>
                                                         <span className={`flex items-center space-x-1 ${insight.status === 'applied' ? 'text-green-600' : insight.status === 'ignored' ? 'text-red-600' : 'text-yellow-600'}`}>
                               {getStatusIcon(insight.status)}
                               <span className="capitalize font-medium">{insight.status}</span>
                             </span>
                            <span>Priority: {insight.priority}/10</span>
                          </div>
                        </div>
                      </div>
                      
                                             {/* Action Buttons */}
                       {insight.status === 'pending' && (
                         <div className="flex space-x-1">
                           <Button
                             onClick={() => updateInsightStatus(insight.id, 'applied')}
                             disabled={updatingStatus === insight.id}
                             size="sm"
                             variant="outline"
                             className="text-green-600 hover:text-green-700"
                           >
                             {updatingStatus === insight.id ? (
                               <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-1"></div>
                             ) : (
                               <CheckCircle className="w-3 h-3 mr-1" />
                             )}
                             Applied
                           </Button>
                           <Button
                             onClick={() => updateInsightStatus(insight.id, 'ignored')}
                             disabled={updatingStatus === insight.id}
                             size="sm"
                             variant="outline"
                             className="text-red-600 hover:text-red-700"
                           >
                             {updatingStatus === insight.id ? (
                               <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                             ) : (
                               <XCircle className="w-3 h-3 mr-1" />
                             )}
                             Ignore
                           </Button>
                         </div>
                       )}
                       {insight.status !== 'pending' && (
                         <div className="text-xs text-gray-500">
                           {insight.status === 'applied' ? '✅ Implemented' : '❌ Dismissed'}
                         </div>
                       )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-700 leading-relaxed">{insight.description}</p>

                    {/* Estimated Impact */}
                    <div className="text-xs text-gray-600">
                      <strong>Expected Impact:</strong> {insight.estimatedImpact}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
