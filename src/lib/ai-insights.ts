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
  platforms?: string[]; // New field for multi-platform data
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
  maxTokens: 2000,
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
  });
  return `${request.url}-${Buffer.from(dataHash).toString('base64').slice(0, 16)}`;
}

/**
 * Format metrics data for AI analysis
 */
function formatMetricsForAI(request: InsightRequest): string {
  const { url, webVitals, categories, opportunities, recommendations, accessibility, bestPractices, performanceHistory, platforms } = request;
  
  let formattedData = `Website Analysis for: ${url}\n\n`;
  
  // Data Sources (if available)
  if (platforms && platforms.length > 0) {
    formattedData += `Data Sources: ${platforms.join(', ')}\n\n`;
  }
  
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
  
  // Performance History
  if (performanceHistory && performanceHistory.length > 0) {
    formattedData += `Performance History (Last ${performanceHistory.length} entries):\n`;
    const recent = performanceHistory.slice(-3);
    recent.forEach(entry => {
      formattedData += `- ${new Date(entry.analyzedAt).toLocaleDateString()}: Performance ${entry.performance}%, Accessibility ${entry.accessibility}%, SEO ${entry.seo}%\n`;
    });
    formattedData += '\n';
  }
  
  return formattedData;
}

/**
 * Generate AI prompt for insights
 */
function generateAIPrompt(metricsData: string): string {
  return `You are an expert web performance analyst. Analyze the following website metrics and provide actionable insights.

${metricsData}

Please provide 5-8 specific, actionable insights with the following format for each:

1. **Title**: Clear, concise title
2. **Description**: Plain English explanation of the issue and how to fix it (avoid technical jargon)
3. **Severity**: High, Medium, or Low based on impact
4. **Category**: Performance, Accessibility, SEO, Best Practices, or Web Vitals
5. **Estimated Impact**: Brief description of expected improvement
6. **Priority**: Number 1-10 (10 being highest priority)

Focus on:
- Practical, implementable suggestions
- Clear, non-technical language
- Specific actions website owners can take
- Prioritizing issues that will have the biggest impact
- Avoiding buzzwords and marketing speak

Return the response as a JSON array with this structure:
[
  {
    "title": "string",
    "description": "string", 
    "severity": "High|Medium|Low",
    "category": "Performance|Accessibility|SEO|Best Practices|Web Vitals",
    "estimatedImpact": "string",
    "priority": number
  }
]`;
}

/**
 * Parse AI response into structured insights
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
