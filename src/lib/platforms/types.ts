// Standardized metric interface for all platforms
export interface Metric {
  id: string;
  title: string;
  value?: number;
  score?: number;
  description?: string;
  category: 'performance' | 'accessibility' | 'seo' | 'best-practices' | 'web-vitals';
  platform: string; // Source platform (lighthouse, pagespeed, webpagetest)
  severity?: 'high' | 'medium' | 'low';
  unit?: string; // ms, %, etc.
  target?: number; // Target value for this metric
  actual?: number; // Actual measured value
}

// Platform-specific data that gets normalized
export interface PlatformData {
  platform: string;
  url: string;
  timestamp: string;
  metrics: Metric[];
  rawData?: any; // Platform-specific raw data
  error?: string;
}

// Consolidated data structure
export interface ConsolidatedData {
  url: string;
  timestamp: string;
  platforms: string[];
  metrics: Metric[];
  categories: {
    performance: Metric[];
    accessibility: Metric[];
    seo: Metric[];
    'best-practices': Metric[];
    'web-vitals': Metric[];
  };
  scores: {
    performance: number;
    accessibility: number;
    seo: number;
    'best-practices': number;
  };
  webVitals: {
    lcp?: number;
    fid?: number;
    cls?: number;
    tti?: number;
    si?: number;
    inp?: number;
  };
}

// Platform configuration
export interface PlatformConfig {
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  timeout?: number;
  retries?: number;
}

// All platforms configuration
export interface PlatformsConfig {
  lighthouse: PlatformConfig;
  pagespeed: PlatformConfig;
  webpagetest: PlatformConfig;
}

// Standardized function signature for all platforms
export type FetchMetricsFunction = (url: string, config: PlatformConfig) => Promise<PlatformData>;
