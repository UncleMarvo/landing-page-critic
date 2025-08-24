import { Metric, PlatformData, PlatformConfig, FetchMetricsFunction } from './types';

export const fetchMetrics: FetchMetricsFunction = async (url: string, config: PlatformConfig): Promise<PlatformData> => {
  try {
    const apiKey = config.apiKey || 'A.1234567890abcdef'; // WebPageTest allows free tier without API key
    const endpoint = config.endpoint || 'https://www.webpagetest.org';
    
    // Step 1: Submit test
    const submitUrl = `${endpoint}/runtest.php`;
    const submitParams = new URLSearchParams({
      url,
      k: apiKey,
      f: 'json',
      runs: '1',
      location: 'Dulles:Chrome', // Default location
      mobile: '0', // Desktop test
    });

    const submitResponse = await fetch(`${submitUrl}?${submitParams}`, {
      method: 'GET',
      signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined,
    });

    if (!submitResponse.ok) {
      throw new Error(`WebPageTest submit error: ${submitResponse.status}`);
    }

    const submitData = await submitResponse.json();
    
    if (submitData.statusCode !== 200) {
      throw new Error(`WebPageTest error: ${submitData.statusText}`);
    }

    const testId = submitData.data.testId;
    const resultsUrl = submitData.data.jsonUrl;

    // Step 2: Poll for results (with retries)
    let attempts = 0;
    const maxAttempts = config.retries || 30; // 30 attempts = 5 minutes with 10s intervals
    let resultsData: any = null;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

      try {
        const resultsResponse = await fetch(resultsUrl, {
          signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined,
        });

        if (resultsResponse.ok) {
          resultsData = await resultsResponse.json();
          
          // Check if test is complete
          if (resultsData.statusCode === 200 && resultsData.data.runs && resultsData.data.runs['1']) {
            break;
          }
        }
      } catch (error) {
        console.warn(`WebPageTest poll attempt ${attempts + 1} failed:`, error);
      }

      attempts++;
    }

    if (!resultsData || !resultsData.data.runs || !resultsData.data.runs['1']) {
      throw new Error('WebPageTest results not available after maximum attempts');
    }

    const run = resultsData.data.runs['1'];
    const firstView = run.firstView;
    const metrics: Metric[] = [];
    const timestamp = new Date().toISOString();

    // Extract Web Vitals and performance metrics
    const webVitalsMetrics = [
      { id: 'lcp', title: 'Largest Contentful Paint', key: 'LargestContentfulPaint' },
      { id: 'fid', title: 'First Input Delay', key: 'FirstInputDelay' },
      { id: 'cls', title: 'Cumulative Layout Shift', key: 'CumulativeLayoutShift' },
      { id: 'tti', title: 'Time to Interactive', key: 'TimeToInteractive' },
      { id: 'si', title: 'Speed Index', key: 'SpeedIndex' },
      { id: 'inp', title: 'Input Latency', key: 'InputLatency' },
    ];

    webVitalsMetrics.forEach(({ id, title, key }) => {
      const value = firstView[key];
      if (value !== undefined && value !== null) {
        metrics.push({
          id,
          title,
          value,
          category: 'web-vitals',
          platform: 'webpagetest',
          unit: 'ms',
          actual: value,
          target: getWebVitalTarget(id),
        });
      }
    });

    // Extract additional performance metrics
    const performanceMetrics = [
      { id: 'first-byte', title: 'Time to First Byte', key: 'TTFB' },
      { id: 'first-paint', title: 'First Paint', key: 'firstPaint' },
      { id: 'first-contentful-paint', title: 'First Contentful Paint', key: 'firstContentfulPaint' },
      { id: 'dom-interactive', title: 'DOM Interactive', key: 'domInteractive' },
      { id: 'dom-content-loaded', title: 'DOM Content Loaded', key: 'domContentLoadedEventStart' },
      { id: 'load-event', title: 'Load Event', key: 'loadEventStart' },
    ];

    performanceMetrics.forEach(({ id, title, key }) => {
      const value = firstView[key];
      if (value !== undefined && value !== null) {
        metrics.push({
          id,
          title,
          value,
          category: 'performance',
          platform: 'webpagetest',
          unit: 'ms',
          actual: value,
        });
      }
    });

    // Extract resource metrics
    const resourceMetrics = [
      { id: 'total-requests', title: 'Total Requests', key: 'requestsFull' },
      { id: 'total-bytes', title: 'Total Bytes', key: 'bytesIn' },
      { id: 'image-requests', title: 'Image Requests', key: 'imageRequests' },
      { id: 'image-bytes', title: 'Image Bytes', key: 'imageBytes' },
      { id: 'script-requests', title: 'Script Requests', key: 'scriptRequests' },
      { id: 'script-bytes', title: 'Script Bytes', key: 'scriptBytes' },
      { id: 'css-requests', title: 'CSS Requests', key: 'cssRequests' },
      { id: 'css-bytes', title: 'CSS Bytes', key: 'cssBytes' },
    ];

    resourceMetrics.forEach(({ id, title, key }) => {
      const value = firstView[key];
      if (value !== undefined && value !== null) {
        metrics.push({
          id,
          title,
          value,
          category: 'performance',
          platform: 'webpagetest',
          unit: key.includes('Bytes') ? 'bytes' : 'count',
          actual: value,
        });
      }
    });

    // Extract opportunities from waterfall data
    if (firstView.details && firstView.details.waterfall) {
      const waterfall = firstView.details.waterfall;
      const slowResources = waterfall
        .filter((resource: any) => resource.time > 1000) // Resources taking more than 1 second
        .slice(0, 5)
        .map((resource: any) => ({
          id: `slow-resource-${resource.url}`,
          title: `Slow Resource: ${resource.url.split('/').pop() || resource.url}`,
          value: resource.time,
          description: `Resource took ${resource.time}ms to load`,
          category: 'performance' as const,
          platform: 'webpagetest',
          unit: 'ms',
          severity: resource.time > 3000 ? 'high' : resource.time > 2000 ? 'medium' : 'low',
        }));

      metrics.push(...slowResources);
    }

    // Calculate performance score based on Web Vitals
    const lcp = firstView.LargestContentfulPaint;
    const fid = firstView.FirstInputDelay;
    const cls = firstView.CumulativeLayoutShift;
    
    let performanceScore = 100;
    if (lcp > 4000) performanceScore -= 30;
    else if (lcp > 2500) performanceScore -= 15;
    
    if (fid > 300) performanceScore -= 30;
    else if (fid > 100) performanceScore -= 15;
    
    if (cls > 0.25) performanceScore -= 30;
    else if (cls > 0.1) performanceScore -= 15;

    metrics.push({
      id: 'performance-score',
      title: 'Performance Score',
      score: Math.max(0, performanceScore),
      category: 'performance',
      platform: 'webpagetest',
      unit: '%',
      actual: Math.max(0, performanceScore),
      target: 100,
    });

    return {
      platform: 'webpagetest',
      url,
      timestamp,
      metrics,
      rawData: resultsData,
    };

  } catch (error) {
    return {
      platform: 'webpagetest',
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
