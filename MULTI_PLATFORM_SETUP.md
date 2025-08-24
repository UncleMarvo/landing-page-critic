# Multi-Platform Performance Testing Setup

This guide explains how to configure and use the multi-platform performance testing system that integrates Lighthouse, PageSpeed Insights, and WebPageTest.

## Overview

The system now supports multiple performance testing platforms:
- **Lighthouse** (local service)
- **PageSpeed Insights** (Google's API)
- **WebPageTest** (real browser testing)

All platforms are toggled via environment variables and run concurrently for comprehensive analysis.

## Environment Variables

Add these to your `.env` file:

```bash
# Platform Toggles
ENABLE_LIGHTHOUSE=true
ENABLE_PAGESPEED=false
ENABLE_WEBPAGETEST=false

# API Keys (only needed for enabled platforms)
PAGESPEED_API_KEY=your_google_api_key_here
WEBPAGETEST_API_KEY=your_webpagetest_api_key_here

# Optional Configuration
WEBPAGETEST_ENDPOINT=https://www.webpagetest.org
```

## Platform Configuration

### Lighthouse (Recommended - Default)
- **Status**: Enabled by default
- **API Key**: Not required (uses local service)
- **Pros**: Fast, comprehensive, no API limits
- **Cons**: Simulated environment

```bash
ENABLE_LIGHTHOUSE=true
```

### PageSpeed Insights
- **Status**: Disabled by default
- **API Key**: Required (Google Cloud Console)
- **Pros**: Google's official metrics, real-world data
- **Cons**: API quotas, slower than Lighthouse

```bash
ENABLE_PAGESPEED=true
PAGESPEED_API_KEY=your_api_key_here
```

**Getting PageSpeed API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable PageSpeed Insights API
4. Create credentials (API Key)
5. Add to `.env` file

### WebPageTest
- **Status**: Disabled by default
- **API Key**: Optional (free tier available)
- **Pros**: Real browser testing, detailed waterfall
- **Cons**: Slowest (can take 2-5 minutes)

```bash
ENABLE_WEBPAGETEST=true
WEBPAGETEST_API_KEY=your_api_key_here  # Optional
```

**Getting WebPageTest API Key:**
1. Go to [WebPageTest](https://www.webpagetest.org/)
2. Sign up for an account
3. Get your API key from account settings
4. Add to `.env` file (optional for free tier)

## How It Works

### 1. Concurrent Execution
When you analyze a URL, all enabled platforms run simultaneously:
```typescript
// All platforms fetch data concurrently
const platformData = await fetchAllPlatformMetrics(url);
```

### 2. Data Consolidation
Results are combined using weighted averages:
- **Lighthouse**: 50% weight
- **PageSpeed**: 30% weight  
- **WebPageTest**: 20% weight

### 3. Platform Priority
For Web Vitals, platforms are prioritized:
1. Lighthouse (highest priority)
2. PageSpeed Insights
3. WebPageTest (fallback)

### 4. Legacy Compatibility
All existing dashboard components continue to work without changes.

## Recommended Configurations

### Development (Fast)
```bash
ENABLE_LIGHTHOUSE=true
ENABLE_PAGESPEED=false
ENABLE_WEBPAGETEST=false
```

### Production (Comprehensive)
```bash
ENABLE_LIGHTHOUSE=true
ENABLE_PAGESPEED=true
ENABLE_WEBPAGETEST=true
PAGESPEED_API_KEY=your_key_here
WEBPAGETEST_API_KEY=your_key_here
```

### Budget-Friendly
```bash
ENABLE_LIGHTHOUSE=true
ENABLE_PAGESPEED=false
ENABLE_WEBPAGETEST=true
# No API keys needed
```

## Performance Considerations

### Response Times
- **Lighthouse only**: ~5-10 seconds
- **Lighthouse + PageSpeed**: ~15-20 seconds
- **All platforms**: ~2-5 minutes (due to WebPageTest)

### API Costs
- **Lighthouse**: Free (local)
- **PageSpeed**: Free tier (1000 requests/day)
- **WebPageTest**: Free tier (200 tests/day)

## Error Handling

The system gracefully handles platform failures:
- Failed platforms are logged but don't break the analysis
- Results from successful platforms are still returned
- Error messages indicate which platforms failed

## Adding New Platforms

To add a new platform:

1. Create a new file in `src/lib/platforms/` (e.g., `newplatform.ts`)
2. Implement the `FetchMetricsFunction` interface
3. Add configuration to `loadPlatformsConfig()` in `manager.ts`
4. Add the platform to the consolidation logic

Example:
```typescript
// src/lib/platforms/newplatform.ts
export const fetchMetrics: FetchMetricsFunction = async (url: string, config: PlatformConfig) => {
  // Implementation here
  return {
    platform: 'newplatform',
    url,
    timestamp: new Date().toISOString(),
    metrics: [],
  };
};
```

## Troubleshooting

### PageSpeed API Errors
- Verify API key is correct
- Check Google Cloud Console quotas
- Ensure PageSpeed Insights API is enabled

### WebPageTest Timeouts
- Increase timeout in configuration
- Check WebPageTest server status
- Consider using a different test location

### No Data Available
- Check that at least one platform is enabled
- Verify API keys for enabled platforms
- Check network connectivity

## Database Storage

The system stores:
- **Consolidated metrics** in the `history` table
- **Raw platform data** in the `historyDetails` table
- **Platform metadata** for tracking data sources

This allows for historical analysis and platform comparison over time.
