import { Metric, PlatformData, PlatformConfig, FetchMetricsFunction } from './types';
import { fetchLighthouseResults } from '../lighthouse';

export const fetchMetrics: FetchMetricsFunction = async (url: string, config: PlatformConfig): Promise<PlatformData> => {
  try {
    // Fetch raw Lighthouse data
    const lhr = await fetchLighthouseResults(url);
    
    if (!lhr) {
      throw new Error('No Lighthouse results available');
    }

    const metrics: Metric[] = [];
    const timestamp = new Date().toISOString();

    // Extract Web Vitals
    const webVitalsMetrics = [
      { id: 'lcp', title: 'Largest Contentful Paint', auditKey: 'largest-contentful-paint' },
      { id: 'fid', title: 'First Input Delay', auditKey: 'max-potential-fid' },
      { id: 'cls', title: 'Cumulative Layout Shift', auditKey: 'cumulative-layout-shift' },
      { id: 'tti', title: 'Time to Interactive', auditKey: 'interactive' },
      { id: 'si', title: 'Speed Index', auditKey: 'speed-index' },
      { id: 'inp', title: 'Input Latency', auditKey: 'interaction-to-next-paint' },
    ];

    webVitalsMetrics.forEach(({ id, title, auditKey }) => {
      const audit = lhr.audits[auditKey];
      if (audit && audit.numericValue !== undefined) {
        metrics.push({
          id,
          title,
          value: audit.numericValue,
          category: 'web-vitals',
          platform: 'lighthouse',
          unit: 'ms',
          actual: audit.numericValue,
          target: getWebVitalTarget(id),
        });
      }
    });

    // Extract category scores
    const categories = ['performance', 'accessibility', 'seo', 'best-practices'];
    categories.forEach(category => {
      const categoryData = lhr.categories[category];
      if (categoryData && categoryData.score !== undefined) {
        metrics.push({
          id: `${category}-score`,
          title: `${category.charAt(0).toUpperCase() + category.slice(1)} Score`,
          score: Math.round(categoryData.score * 100),
          category: category as any,
          platform: 'lighthouse',
          unit: '%',
          actual: Math.round(categoryData.score * 100),
          target: 100,
        });
      }
    });

    // Extract opportunities (performance issues)
    if (lhr.audits) {
      Object.values(lhr.audits)
        .filter((a: any) => a.details?.type === 'opportunity' && a.details?.overallSavingsMs > 0)
        .slice(0, 10)
        .forEach((audit: any) => {
          metrics.push({
            id: audit.id,
            title: audit.title,
            value: audit.details.overallSavingsMs,
            description: audit.description,
            category: 'performance',
            platform: 'lighthouse',
            unit: 'ms',
            severity: getSeverityFromSavings(audit.details.overallSavingsMs),
          });
        });
    }

    // Extract accessibility issues
    if (lhr.categories.accessibility?.auditRefs) {
      lhr.categories.accessibility.auditRefs
        .map((ref: any) => lhr.audits[ref.id])
        .filter((a: any) => a && a.score !== 1)
        .slice(0, 10)
        .forEach((audit: any) => {
          metrics.push({
            id: audit.id,
            title: audit.title,
            description: audit.description,
            score: audit.score,
            category: 'accessibility',
            platform: 'lighthouse',
            severity: getSeverityFromScore(audit.score),
          });
        });
    }

    // Extract SEO issues
    if (lhr.categories.seo?.auditRefs) {
      lhr.categories.seo.auditRefs
        .map((ref: any) => lhr.audits[ref.id])
        .filter((a: any) => a && a.score !== 1)
        .slice(0, 10)
        .forEach((audit: any) => {
          metrics.push({
            id: audit.id,
            title: audit.title,
            description: audit.description,
            score: audit.score,
            category: 'seo',
            platform: 'lighthouse',
            severity: getSeverityFromScore(audit.score),
          });
        });
    }

    // Extract best practices issues
    if (lhr.categories['best-practices']?.auditRefs) {
      lhr.categories['best-practices'].auditRefs
        .map((ref: any) => lhr.audits[ref.id])
        .filter((a: any) => a && a.score !== 1)
        .slice(0, 10)
        .forEach((audit: any) => {
          metrics.push({
            id: audit.id,
            title: audit.title,
            description: audit.description,
            score: audit.score,
            category: 'best-practices',
            platform: 'lighthouse',
            severity: getSeverityFromScore(audit.score),
          });
        });
    }

    return {
      platform: 'lighthouse',
      url,
      timestamp,
      metrics,
      rawData: lhr,
    };

  } catch (error) {
    return {
      platform: 'lighthouse',
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
