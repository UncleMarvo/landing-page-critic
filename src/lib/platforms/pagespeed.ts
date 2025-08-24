import { Metric, PlatformData, PlatformConfig, FetchMetricsFunction } from './types';

export const fetchMetrics: FetchMetricsFunction = async (url: string, config: PlatformConfig): Promise<PlatformData> => {
  try {
    if (!config.apiKey) {
      throw new Error('PageSpeed Insights API key is required');
    }

    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`;
    const params = new URLSearchParams({
      url,
      key: config.apiKey,
      strategy: 'mobile', // Can be 'mobile' or 'desktop'
      category: 'performance,accessibility,best-practices,seo',
    });

    const response = await fetch(`${apiUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined,
    });

    if (!response.ok) {
      throw new Error(`PageSpeed API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const metrics: Metric[] = [];
    const timestamp = new Date().toISOString();

    // Extract Web Vitals
    const webVitals = data.lighthouseResult?.audits;
    if (webVitals) {
      const webVitalsMetrics = [
        { id: 'lcp', title: 'Largest Contentful Paint', auditKey: 'largest-contentful-paint' },
        { id: 'fid', title: 'First Input Delay', auditKey: 'max-potential-fid' },
        { id: 'cls', title: 'Cumulative Layout Shift', auditKey: 'cumulative-layout-shift' },
        { id: 'tti', title: 'Time to Interactive', auditKey: 'interactive' },
        { id: 'si', title: 'Speed Index', auditKey: 'speed-index' },
        { id: 'inp', title: 'Input Latency', auditKey: 'interaction-to-next-paint' },
      ];

      webVitalsMetrics.forEach(({ id, title, auditKey }) => {
        const audit = webVitals[auditKey];
        if (audit && audit.numericValue !== undefined) {
          metrics.push({
            id,
            title,
            value: audit.numericValue,
            category: 'web-vitals',
            platform: 'pagespeed',
            unit: 'ms',
            actual: audit.numericValue,
            target: getWebVitalTarget(id),
          });
        }
      });
    }

    // Extract category scores
    const categories = data.lighthouseResult?.categories;
    if (categories) {
      Object.entries(categories).forEach(([category, categoryData]: [string, any]) => {
        if (categoryData.score !== undefined) {
          metrics.push({
            id: `${category}-score`,
            title: `${category.charAt(0).toUpperCase() + category.slice(1)} Score`,
            score: Math.round(categoryData.score * 100),
            category: category as any,
            platform: 'pagespeed',
            unit: '%',
            actual: Math.round(categoryData.score * 100),
            target: 100,
          });
        }
      });
    }

    // Extract opportunities (performance issues)
    const audits = data.lighthouseResult?.audits;
    if (audits) {
      Object.values(audits)
        .filter((a: any) => a.details?.type === 'opportunity' && a.details?.overallSavingsMs > 0)
        .slice(0, 10)
        .forEach((audit: any) => {
          metrics.push({
            id: audit.id,
            title: audit.title,
            value: audit.details.overallSavingsMs,
            description: audit.description,
            category: 'performance',
            platform: 'pagespeed',
            unit: 'ms',
            severity: getSeverityFromSavings(audit.details.overallSavingsMs),
          });
        });
    }

    // Extract accessibility issues
    const accessibilityAudits = data.lighthouseResult?.categories?.accessibility?.auditRefs;
    if (accessibilityAudits && audits) {
      accessibilityAudits
        .map((ref: any) => audits[ref.id])
        .filter((a: any) => a && a.score !== 1)
        .slice(0, 10)
        .forEach((audit: any) => {
          metrics.push({
            id: audit.id,
            title: audit.title,
            description: audit.description,
            score: audit.score,
            category: 'accessibility',
            platform: 'pagespeed',
            severity: getSeverityFromScore(audit.score),
          });
        });
    }

    // Extract SEO issues
    const seoAudits = data.lighthouseResult?.categories?.seo?.auditRefs;
    if (seoAudits && audits) {
      seoAudits
        .map((ref: any) => audits[ref.id])
        .filter((a: any) => a && a.score !== 1)
        .slice(0, 10)
        .forEach((audit: any) => {
          metrics.push({
            id: audit.id,
            title: audit.title,
            description: audit.description,
            score: audit.score,
            category: 'seo',
            platform: 'pagespeed',
            severity: getSeverityFromScore(audit.score),
          });
        });
    }

    // Extract best practices issues
    const bestPracticesAudits = data.lighthouseResult?.categories?.['best-practices']?.auditRefs;
    if (bestPracticesAudits && audits) {
      bestPracticesAudits
        .map((ref: any) => audits[ref.id])
        .filter((a: any) => a && a.score !== 1)
        .slice(0, 10)
        .forEach((audit: any) => {
          metrics.push({
            id: audit.id,
            title: audit.title,
            description: audit.description,
            score: audit.score,
            category: 'best-practices',
            platform: 'pagespeed',
            severity: getSeverityFromScore(audit.score),
          });
        });
    }

    return {
      platform: 'pagespeed',
      url,
      timestamp,
      metrics,
      rawData: data,
    };

  } catch (error) {
    return {
      platform: 'pagespeed',
      url,
      timestamp: new Date().toISOString(),
      metrics: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Helper functions
function getWebVitalTarget(metricId: string): number {
  const targets: Record<string, number> = {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    tti: 3800,
    si: 3400,
    inp: 200,
  };
  return targets[metricId] || 0;
}

function getSeverityFromSavings(savingsMs: number): 'high' | 'medium' | 'low' {
  if (savingsMs > 1000) return 'high';
  if (savingsMs > 500) return 'medium';
  return 'low';
}

function getSeverityFromScore(score: number): 'high' | 'medium' | 'low' {
  if (score < 0.5) return 'high';
  if (score < 0.9) return 'medium';
  return 'low';
}
