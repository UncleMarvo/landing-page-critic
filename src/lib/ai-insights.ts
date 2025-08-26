// AI Insights Service - Handles multiple LLM providers and generates actionable suggestions
import OpenAI from 'openai';

// Types for AI insights
export interface AIInsight {
  id: string;
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  category: 'Performance' | 'Accessibility' | 'SEO' | 'Best Practices' | 'Web Vitals';
  actionable: boolean;
  estimatedImpact: string;
  priority: number;
  createdAt: Date;
  status: 'pending' | 'applied' | 'ignored';
  // New fields for enhanced insights
  historicalContext?: string;
  platformSpecific?: boolean;
  platforms?: string[];
  implementationSteps?: string[];
  expectedTimeline?: string;
  costBenefit?: string;
}

export interface InsightRequest {
  url: string;
  webVitals: any[];
  categories: any[];
  opportunities: any[];
  recommendations: any[];
  accessibility: any[];
  bestPractices: any[];
  performanceHistory: any[];
  platforms?: string[]; // Multi-platform data
  // New fields for historical context
  previousInsights?: AIInsight[];
  userActions?: Array<{
    insightId: string;
    action: 'applied' | 'ignored';
    date: Date;
    impact?: string;
  }>;
  siteHistory?: Array<{
    date: Date;
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
  }>;
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'gemini' | 'local';
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

// Default configuration
const DEFAULT_CONFIG: LLMConfig = {
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY || '',
  model: 'gpt-4o-mini',
  maxTokens: 3000, // Increased for more detailed insights
  temperature: 0.3,
};

// Cache for AI insights to avoid duplicate calls
const insightsCache = new Map<string, AIInsight[]>();

/**
 * Generate a cache key for the insights request
 */
function generateCacheKey(request: InsightRequest): string {
  const dataHash = JSON.stringify({
    url: request.url,
    webVitals: request.webVitals?.length || 0,
    categories: request.categories?.length || 0,
    opportunities: request.opportunities?.length || 0,
    recommendations: request.recommendations?.length || 0,
    accessibility: request.accessibility?.length || 0,
    bestPractices: request.bestPractices?.length || 0,
    performanceHistory: request.performanceHistory?.length || 0,
    platforms: request.platforms?.join(',') || '',
    previousInsights: request.previousInsights?.length || 0,
    userActions: request.userActions?.length || 0,
  });
  return `${request.url}-${Buffer.from(dataHash).toString('base64').slice(0, 16)}`;
}

/**
 * Format metrics data for AI analysis with historical context
 */
function formatMetricsForAI(request: InsightRequest): string {
  const { 
    url, 
    webVitals, 
    categories, 
    opportunities, 
    recommendations, 
    accessibility, 
    bestPractices, 
    performanceHistory, 
    platforms,
    previousInsights,
    userActions,
    siteHistory
  } = request;
  
  let formattedData = `Website Analysis for: ${url}\n\n`;
  
  // Data Sources (multi-platform)
  if (platforms && platforms.length > 0) {
    formattedData += `Data Sources: ${platforms.join(', ')}\n`;
    formattedData += `Multi-platform analysis available: ${platforms.length > 1 ? 'Yes' : 'No'}\n\n`;
  }
  
  // Historical Context
  if (siteHistory && siteHistory.length > 0) {
    formattedData += `Performance History (Last ${siteHistory.length} analyses):\n`;
    const recent = siteHistory.slice(-5); // Last 5 entries
    recent.forEach(entry => {
      formattedData += `- ${new Date(entry.date).toLocaleDateString()}: Performance ${entry.performance}%, Accessibility ${entry.accessibility}%, SEO ${entry.seo}%, Best Practices ${entry.bestPractices}%\n`;
    });
    
    // Calculate trends
    if (recent.length >= 2) {
      const first = recent[0];
      const last = recent[recent.length - 1];
      const performanceTrend = last.performance - first.performance;
      const accessibilityTrend = last.accessibility - first.accessibility;
      const seoTrend = last.seo - first.seo;
      
      formattedData += `Trends: Performance ${performanceTrend > 0 ? '+' : ''}${performanceTrend.toFixed(1)}%, Accessibility ${accessibilityTrend > 0 ? '+' : ''}${accessibilityTrend.toFixed(1)}%, SEO ${seoTrend > 0 ? '+' : ''}${seoTrend.toFixed(1)}%\n`;
    }
    formattedData += '\n';
  }
  
  // Previous Insights and User Actions
  if (previousInsights && previousInsights.length > 0) {
    formattedData += `Previous AI Insights (${previousInsights.length} total):\n`;
    const applied = previousInsights.filter(i => i.status === 'applied');
    const ignored = previousInsights.filter(i => i.status === 'ignored');
    const pending = previousInsights.filter(i => i.status === 'pending');
    
    formattedData += `- Applied: ${applied.length}, Ignored: ${ignored.length}, Pending: ${pending.length}\n`;
    
    if (applied.length > 0) {
      formattedData += `Recently Applied Insights:\n`;
      applied.slice(-3).forEach(insight => {
        formattedData += `- ${insight.title} (${insight.category}, Priority: ${insight.priority})\n`;
      });
    }
    formattedData += '\n';
  }
  
  // Current Metrics
  formattedData += `Current Analysis Results:\n\n`;
  
  // Web Vitals
  if (webVitals && webVitals.length > 0) {
    formattedData += `Web Vitals:\n`;
    webVitals.forEach(vital => {
      formattedData += `- ${vital.title}: ${vital.value}${vital.unit || 'ms'} (${vital.level || 'N/A'})\n`;
    });
    formattedData += '\n';
  }
  
  // Category Scores
  if (categories && categories.length > 0) {
    formattedData += `Category Scores:\n`;
    categories.forEach(category => {
      formattedData += `- ${category.title}: ${Math.round(category.score * 100)}%\n`;
    });
    formattedData += '\n';
  }
  
  // Opportunities
  if (opportunities && opportunities.length > 0) {
    formattedData += `Performance Opportunities:\n`;
    opportunities.slice(0, 5).forEach(opp => {
      formattedData += `- ${opp.title}: ${opp.description}\n`;
    });
    formattedData += '\n';
  }
  
  // Recommendations
  if (recommendations && recommendations.length > 0) {
    formattedData += `Recommendations:\n`;
    recommendations.slice(0, 5).forEach(rec => {
      formattedData += `- ${rec.title}: ${rec.description}\n`;
    });
    formattedData += '\n';
  }
  
  // Accessibility Issues
  if (accessibility && accessibility.length > 0) {
    formattedData += `Accessibility Issues:\n`;
    accessibility.slice(0, 5).forEach(acc => {
      formattedData += `- ${acc.title}: ${acc.description}\n`;
    });
    formattedData += '\n';
  }
  
  // Best Practices
  if (bestPractices && bestPractices.length > 0) {
    formattedData += `Best Practices:\n`;
    bestPractices.slice(0, 5).forEach(bp => {
      formattedData += `- ${bp.title}: ${bp.description}\n`;
    });
    formattedData += '\n';
  }
  
  return formattedData;
}

/**
 * Generate enhanced AI prompt for insights with historical context
 */
function generateAIPrompt(metricsData: string): string {
  return `You are an expert web performance analyst with deep knowledge of historical optimization patterns. Analyze the following website metrics and provide actionable insights with historical context.

${metricsData}

Please provide 5-8 specific, actionable insights with the following enhanced format for each:

1. **Title**: Clear, concise title
2. **Description**: Plain English explanation of the issue and how to fix it
3. **Severity**: High, Medium, or Low based on impact
4. **Category**: Performance, Accessibility, SEO, Best Practices, or Web Vitals
5. **Estimated Impact**: Brief description of expected improvement with specific metrics
6. **Priority**: Number 1-10 (10 being highest priority)
7. **Historical Context**: Brief note about how this type of issue typically performs over time
8. **Implementation Steps**: 2-3 specific steps to implement the fix
9. **Expected Timeline**: How long implementation typically takes (hours/days/weeks)
10. **Cost Benefit**: Brief cost-benefit analysis (low/medium/high effort vs impact)

Consider:
- Historical performance trends and patterns
- Previous user actions on similar insights
- Multi-platform data consistency
- Practical implementation feasibility
- Real-world impact based on similar optimizations
- Avoiding duplicate or conflicting recommendations

Return the response as a JSON array with this structure:
[
  {
    "title": "string",
    "description": "string", 
    "severity": "High|Medium|Low",
    "category": "Performance|Accessibility|SEO|Best Practices|Web Vitals",
    "estimatedImpact": "string",
    "priority": number,
    "historicalContext": "string",
    "implementationSteps": ["step1", "step2", "step3"],
    "expectedTimeline": "string",
    "costBenefit": "string"
  }
]`;
}

/**
 * Parse AI response into structured insights with enhanced fields
 */
function parseAIResponse(response: string): AIInsight[] {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return parsed.map((insight: any, index: number) => ({
      id: `insight-${Date.now()}-${index}`,
      title: insight.title || 'Untitled Insight',
      description: insight.description || 'No description provided',
      severity: ['High', 'Medium', 'Low'].includes(insight.severity) ? insight.severity : 'Medium',
      category: ['Performance', 'Accessibility', 'SEO', 'Best Practices', 'Web Vitals'].includes(insight.category) 
        ? insight.category : 'Best Practices',
      actionable: true,
      estimatedImpact: insight.estimatedImpact || 'Improvement expected',
      priority: typeof insight.priority === 'number' ? Math.min(Math.max(insight.priority, 1), 10) : 5,
      createdAt: new Date(),
      status: 'pending' as const,
      // Enhanced fields
      historicalContext: insight.historicalContext || null,
      platformSpecific: insight.platformSpecific || false,
      platforms: insight.platforms || [],
      implementationSteps: insight.implementationSteps || [],
      expectedTimeline: insight.expectedTimeline || 'Unknown',
      costBenefit: insight.costBenefit || 'Medium effort, medium impact',
    }));
  } catch (error) {
    console.error('Error parsing AI response:', error);
    // Return a fallback insight
    return [{
      id: `insight-${Date.now()}-fallback`,
      title: 'Analysis Error',
      description: 'Unable to parse AI response. Please try again or check your configuration.',
      severity: 'Medium',
      category: 'Best Practices',
      actionable: false,
      estimatedImpact: 'None',
      priority: 1,
      createdAt: new Date(),
      status: 'pending' as const,
      historicalContext: 'Error occurred during analysis',
      implementationSteps: [],
      expectedTimeline: 'Unknown',
      costBenefit: 'No impact due to error',
    }];
  }
}

/**
 * Generate insights using OpenAI
 */
async function generateInsightsWithOpenAI(request: InsightRequest, config: LLMConfig): Promise<AIInsight[]> {
  if (!config.apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  
  const openai = new OpenAI({
    apiKey: config.apiKey,
  });
  
  const metricsData = formatMetricsForAI(request);
  const prompt = generateAIPrompt(metricsData);
  
  const completion = await openai.chat.completions.create({
    model: config.model,
    messages: [
      {
        role: 'system',
        content: 'You are an expert web performance analyst. Provide clear, actionable insights in JSON format.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: config.maxTokens,
    temperature: config.temperature,
  });
  
  const response = completion.choices[0]?.message?.content || '';
  return parseAIResponse(response);
}

/**
 * Generate insights using Anthropic (Claude)
 */
async function generateInsightsWithAnthropic(request: InsightRequest, config: LLMConfig): Promise<AIInsight[]> {
  if (!config.apiKey) {
    throw new Error('Anthropic API key not configured');
  }
  
  // Note: This would require the Anthropic SDK
  // For now, we'll throw an error and suggest using OpenAI
  throw new Error('Anthropic integration not yet implemented. Please use OpenAI or configure Anthropic SDK.');
}

/**
 * Generate insights using Google Gemini
 */
async function generateInsightsWithGemini(request: InsightRequest, config: LLMConfig): Promise<AIInsight[]> {
  if (!config.apiKey) {
    throw new Error('Gemini API key not configured');
  }
  
  // Note: This would require the Google AI SDK
  // For now, we'll throw an error and suggest using OpenAI
  throw new Error('Gemini integration not yet implemented. Please use OpenAI or configure Google AI SDK.');
}

/**
 * Main function to generate AI insights
 */
export async function generateAIInsights(
  request: InsightRequest, 
  config: LLMConfig = DEFAULT_CONFIG
): Promise<AIInsight[]> {
  try {
    // Check cache first
    const cacheKey = generateCacheKey(request);
    if (insightsCache.has(cacheKey)) {
      console.log('Returning cached insights for:', request.url);
      return insightsCache.get(cacheKey)!;
    }
    
    // Validate request data
    if (!request.url) {
      throw new Error('URL is required for insights generation');
    }
    
    // Generate insights based on provider
    let insights: AIInsight[];
    
    switch (config.provider) {
      case 'openai':
        insights = await generateInsightsWithOpenAI(request, config);
        break;
      case 'anthropic':
        insights = await generateInsightsWithAnthropic(request, config);
        break;
      case 'gemini':
        insights = await generateInsightsWithGemini(request, config);
        break;
      case 'local':
        throw new Error('Local model integration not yet implemented');
      default:
        throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
    
    // Cache the results
    insightsCache.set(cacheKey, insights);
    
    // Clear old cache entries (keep only last 10)
    if (insightsCache.size > 10) {
      const keys = Array.from(insightsCache.keys());
      keys.slice(0, keys.length - 10).forEach(key => insightsCache.delete(key));
    }
    
    return insights;
    
  } catch (error) {
    console.error('Error generating AI insights:', error);
    throw error;
  }
}

/**
 * Get available LLM providers
 */
export function getAvailableProviders(): Array<{ provider: string; name: string; configured: boolean }> {
  return [
    {
      provider: 'openai',
      name: 'OpenAI (GPT-4)',
      configured: !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY)
    },
    {
      provider: 'anthropic',
      name: 'Anthropic (Claude)',
      configured: !!process.env.ANTHROPIC_API_KEY
    },
    {
      provider: 'gemini',
      name: 'Google (Gemini)',
      configured: !!process.env.GEMINI_API_KEY
    },
    {
      provider: 'local',
      name: 'Local Model',
      configured: false // Not implemented yet
    }
  ];
}

/**
 * Validate LLM configuration
 */
export function validateLLMConfig(config: LLMConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.provider) {
    errors.push('LLM provider is required');
  }
  
  // Only require API key if we're actually trying to use the service
  // This allows the UI to show configuration options even without API keys
  if (config.apiKey === undefined || config.apiKey === null) {
    // Don't add error - this is expected when no API key is configured yet
  } else if (!config.apiKey) {
    errors.push('API key is required');
  }
  
  if (!['openai', 'anthropic', 'gemini', 'local'].includes(config.provider)) {
    errors.push('Invalid LLM provider');
  }
  
  if (config.maxTokens < 100 || config.maxTokens > 4000) {
    errors.push('Max tokens must be between 100 and 4000');
  }
  
  if (config.temperature < 0 || config.temperature > 2) {
    errors.push('Temperature must be between 0 and 2');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
