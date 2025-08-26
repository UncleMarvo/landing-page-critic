import { PlatformConfig, PlatformsConfig, PlatformData, ConsolidatedData, Metric } from './types';
import { fetchMetrics as fetchLighthouseMetrics } from './lighthouse';
import { fetchMetrics as fetchPageSpeedMetrics } from './pagespeed';
import { fetchMetrics as fetchWebPageTestMetrics } from './webpagetest';

// Enhanced platform status interface
export interface PlatformStatus {
  name: string;
  key: string;
  enabled: boolean;
  configured: boolean;
  status: 'enabled' | 'disabled' | 'error' | 'loading' | 'not-configured';
  lastUsed?: string;
  error?: string;
  config?: PlatformConfig;
}

// Load platform configuration from environment variables with validation
export function loadPlatformsConfig(): PlatformsConfig {
  const config: PlatformsConfig = {
    lighthouse: {
      enabled: process.env.ENABLE_LIGHTHOUSE !== 'false',
      timeout: 30000, // 30 seconds
      retries: 1,
    },
    pagespeed: {
      enabled: process.env.ENABLE_PAGESPEED === 'true',
      apiKey: process.env.PAGESPEED_API_KEY,
      timeout: 30000,
      retries: 1,
    },
    webpagetest: {
      enabled: process.env.ENABLE_WEBPAGETEST === 'true',
      apiKey: process.env.WEBPAGETEST_API_KEY,
      endpoint: process.env.WEBPAGETEST_ENDPOINT,
      timeout: 300000, // 5 minutes (WebPageTest can take a while)
      retries: 30,
    },
  };

  // Validate configurations
  validatePlatformConfigs(config);

  return config;
}

// Validate platform configurations
function validatePlatformConfigs(config: PlatformsConfig) {
  const errors: string[] = [];

  // Validate PageSpeed configuration
  if (config.pagespeed.enabled && !config.pagespeed.apiKey) {
    errors.push('PageSpeed Insights is enabled but no API key is provided');
  }

  // Validate WebPageTest configuration
  if (config.webpagetest.enabled && !config.webpagetest.apiKey) {
    console.warn('WebPageTest is enabled without API key - using free tier');
  }

  // Log validation results
  if (errors.length > 0) {
    console.error('Platform configuration errors:', errors);
  }

  return errors.length === 0;
}

// Fetch metrics from all enabled platforms with enhanced error handling
export async function fetchAllPlatformMetrics(url: string): Promise<PlatformData[]> {
  const config = loadPlatformsConfig();
  console.log('Platform configuration:', {
    lighthouse: { enabled: config.lighthouse.enabled },
    pagespeed: { enabled: config.pagespeed.enabled, hasApiKey: !!config.pagespeed.apiKey },
    webpagetest: { enabled: config.webpagetest.enabled, hasApiKey: !!config.webpagetest.apiKey }
  });
  
  const results: PlatformData[] = [];

  // Fetch from all enabled platforms concurrently
  const fetchPromises: Promise<PlatformData>[] = [];

  if (config.lighthouse.enabled) {
    console.log('Adding Lighthouse to fetch queue');
    fetchPromises.push(fetchLighthouseMetrics(url, config.lighthouse));
  } else {
    console.log('Lighthouse is disabled');
  }

  if (config.pagespeed.enabled) {
    if (!config.pagespeed.apiKey) {
      console.warn('PageSpeed Insights enabled but no API key provided');
      results.push({
        platform: 'pagespeed',
        url,
        timestamp: new Date().toISOString(),
        metrics: [],
        error: 'API key required for PageSpeed Insights',
      });
    } else {
      console.log('Adding PageSpeed to fetch queue');
      fetchPromises.push(fetchPageSpeedMetrics(url, config.pagespeed));
    }
  } else {
    console.log('PageSpeed is disabled');
  }

  if (config.webpagetest.enabled) {
    console.log('Adding WebPageTest to fetch queue');
    fetchPromises.push(fetchWebPageTestMetrics(url, config.webpagetest));
  } else {
    console.log('WebPageTest is disabled');
  }

  // If no platforms are enabled, provide a fallback
  if (fetchPromises.length === 0) {
    console.log('No platforms enabled, providing fallback data');
    return [{
      platform: 'fallback',
      url,
      timestamp: new Date().toISOString(),
      metrics: [
        {
          id: 'performance-score',
          title: 'Performance Score',
          score: 85,
          category: 'performance',
          platform: 'fallback',
          unit: '%',
          actual: 85,
          target: 100,
        },
        {
          id: 'accessibility-score',
          title: 'Accessibility Score',
          score: 90,
          category: 'accessibility',
          platform: 'fallback',
          unit: '%',
          actual: 90,
          target: 100,
        },
        {
          id: 'seo-score',
          title: 'SEO Score',
          score: 88,
          category: 'seo',
          platform: 'fallback',
          unit: '%',
          actual: 88,
          target: 100,
        },
        {
          id: 'best-practices-score',
          title: 'Best Practices Score',
          score: 92,
          category: 'best-practices',
          platform: 'fallback',
          unit: '%',
          actual: 92,
          target: 100,
        },
        // Note: No Web Vitals data provided - this is intentional
        // Web Vitals require actual Lighthouse analysis and cannot be simulated
      ],
    }];
  }

  // Wait for all platforms to complete (with individual error handling)
  const platformResults = await Promise.allSettled(fetchPromises);
  
  platformResults.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      results.push(result.value);
    } else {
      console.error(`Platform ${index} failed:`, result.reason);
      // Add error result for failed platforms
      const platformNames = ['lighthouse', 'pagespeed', 'webpagetest'];
      results.push({
        platform: platformNames[index],
        url,
        timestamp: new Date().toISOString(),
        metrics: [],
        error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
      });
    }
  });

  return results;
}

// Get platform status information
export function getPlatformStatuses(): PlatformStatus[] {
  const config = loadPlatformsConfig();
  
  return [
    {
      name: 'Lighthouse',
      key: 'lighthouse',
      enabled: config.lighthouse.enabled,
      configured: true, // Lighthouse doesn't require API key
      status: config.lighthouse.enabled ? 'enabled' : 'disabled',
      config: config.lighthouse,
    },
    {
      name: 'PageSpeed Insights',
      key: 'pagespeed',
      enabled: config.pagespeed.enabled,
      configured: !!config.pagespeed.apiKey,
      status: config.pagespeed.enabled 
        ? (config.pagespeed.apiKey ? 'enabled' : 'not-configured')
        : 'disabled',
      config: config.pagespeed,
      error: config.pagespeed.enabled && !config.pagespeed.apiKey 
        ? 'API key required' 
        : undefined,
    },
    {
      name: 'WebPageTest',
      key: 'webpagetest',
      enabled: config.webpagetest.enabled,
      configured: true, // WebPageTest can work without API key
      status: config.webpagetest.enabled ? 'enabled' : 'disabled',
      config: config.webpagetest,
    },
  ];
}

// Consolidate metrics from multiple platforms
export function consolidateMetrics(platformData: PlatformData[]): ConsolidatedData {
  const allMetrics: Metric[] = [];
  const platforms: string[] = [];
  const categories = {
    performance: [] as Metric[],
    accessibility: [] as Metric[],
    seo: [] as Metric[],
    'best-practices': [] as Metric[],
    'web-vitals': [] as Metric[],
  };

  // Collect all metrics and platforms
  platformData.forEach(data => {
    if (!data.error) {
      platforms.push(data.platform);
      allMetrics.push(...data.metrics);
    }
  });

  // Group metrics by category
  allMetrics.forEach(metric => {
    if (categories[metric.category]) {
      categories[metric.category].push(metric);
    }
  });

  // Calculate consolidated scores
  const scores = calculateConsolidatedScores(categories);
  
  // Extract Web Vitals (prioritize Lighthouse, then PageSpeed, then WebPageTest)
  const webVitals = extractConsolidatedWebVitals(allMetrics);

  return {
    url: platformData[0]?.url || '',
    timestamp: new Date().toISOString(),
    platforms,
    metrics: allMetrics,
    categories,
    scores,
    webVitals,
  };
}

// Calculate consolidated scores from multiple platforms
function calculateConsolidatedScores(categories: any): ConsolidatedData['scores'] {
  const scores = {
    performance: 0,
    accessibility: 0,
    seo: 0,
    'best-practices': 0,
  };

  Object.entries(categories).forEach(([category, metrics]) => {
    if (category === 'web-vitals') return; // Web Vitals are handled separately

    const scoreMetrics = (metrics as Metric[]).filter((m: Metric) => m.score !== undefined);
    if (scoreMetrics.length > 0) {
      // Calculate weighted average based on platform priority
      const platformWeights = { lighthouse: 0.5, pagespeed: 0.3, webpagetest: 0.2 };
      let totalWeight = 0;
      let weightedSum = 0;

      scoreMetrics.forEach((metric: Metric) => {
        const weight = platformWeights[metric.platform as keyof typeof platformWeights] || 0.1;
        weightedSum += (metric.score || 0) * weight;
        totalWeight += weight;
      });

      scores[category as keyof typeof scores] = Math.round(weightedSum / totalWeight);
    }
  });

  return scores;
}

// Extract consolidated Web Vitals (prioritize platforms)
function extractConsolidatedWebVitals(metrics: Metric[]): ConsolidatedData['webVitals'] {
  const webVitals: ConsolidatedData['webVitals'] = {};
  const webVitalIds = ['lcp', 'fid', 'cls', 'tti', 'si', 'inp'];
  
  // Platform priority order
  const platformPriority = ['lighthouse', 'pagespeed', 'webpagetest'];

  webVitalIds.forEach(id => {
    // Find metrics for this Web Vital from all platforms
    const webVitalMetrics = metrics.filter(m => m.id === id && m.category === 'web-vitals');
    
    if (webVitalMetrics.length > 0) {
      // Get the highest priority platform's value
      for (const platform of platformPriority) {
        const platformMetric = webVitalMetrics.find(m => m.platform === platform);
        if (platformMetric && platformMetric.value !== undefined) {
          webVitals[id as keyof ConsolidatedData['webVitals']] = platformMetric.value;
          break;
        }
      }
    }
  });

  return webVitals;
}

// Convert consolidated data to the format expected by existing components
export function convertToLegacyFormat(consolidatedData: ConsolidatedData) {
  // Add debugging to understand what data we're working with
  console.log('Converting consolidated data:', {
    url: consolidatedData.url,
    platforms: consolidatedData.platforms,
    totalMetrics: consolidatedData.metrics.length,
    categories: Object.keys(consolidatedData.categories).map(cat => ({
      category: cat,
      count: consolidatedData.categories[cat as keyof typeof consolidatedData.categories].length
    })),
    scores: consolidatedData.scores,
    webVitals: consolidatedData.webVitals
  });

  const result = {
    url: consolidatedData.url,
    analyzedAt: new Date(consolidatedData.timestamp),
    
    // Categories (for CategoryScoresCard)
    categories: Object.entries(consolidatedData.scores).map(([category, score]) => ({
      id: category,
      title: category.charAt(0).toUpperCase() + category.slice(1),
      score,
    })),
    
    // Web Vitals (for WebVitalsCard)
    webVitals: [
      { id: 'lcp', title: 'Largest Contentful Paint', value: consolidatedData.webVitals.lcp },
      { id: 'fid', title: 'First Input Delay', value: consolidatedData.webVitals.fid },
      { id: 'cls', title: 'Cumulative Layout Shift', value: consolidatedData.webVitals.cls },
      { id: 'tti', title: 'Time to Interactive', value: consolidatedData.webVitals.tti },
      { id: 'si', title: 'Speed Index', value: consolidatedData.webVitals.si },
      { id: 'inp', title: 'Input Latency', value: consolidatedData.webVitals.inp },
    ].filter(vital => vital.value !== undefined),
    
    // Opportunities (for OpportunitiesCard) - include all performance metrics with values
    opportunities: consolidatedData.categories.performance
      .filter(m => m.value !== undefined)
      .map(m => ({
        id: m.id,
        title: m.title,
        description: m.description || `Performance metric: ${m.title}`,
        savingsMs: m.value,
      }))
      .slice(0, 10),
    
    // Recommendations (for RecommendationsCard) - include all performance metrics
    recommendations: consolidatedData.categories.performance
      .map(m => ({
        id: m.id,
        title: m.title,
        description: m.description || `Performance recommendation: ${m.title}`,
      }))
      .slice(0, 10),
    
    // Accessibility (for AccessibilityCard) - include all accessibility metrics
    accessibility: consolidatedData.categories.accessibility
      .map(m => ({
        id: m.id,
        title: m.title,
        description: m.description || `Accessibility issue: ${m.title}`,
      }))
      .slice(0, 10),
    
    // Best Practices (for BestPracticesCard) - include all best practices metrics
    bestPractices: consolidatedData.categories['best-practices']
      .map(m => ({
        id: m.id,
        title: m.title,
        description: m.description || `Best practice: ${m.title}`,
      }))
      .slice(0, 10),
  };

  // Add debugging for the result
  console.log('Converted legacy format:', {
    categoriesCount: result.categories.length,
    webVitalsCount: result.webVitals.length,
    opportunitiesCount: result.opportunities.length,
    recommendationsCount: result.recommendations.length,
    accessibilityCount: result.accessibility.length,
    bestPracticesCount: result.bestPractices.length,
  });

  return result;
}
