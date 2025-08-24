# Multi-Platform Integration Test Guide

## Prerequisites

1. **Environment Setup**
   - Add the following to your `.env` file:
   ```bash
   # Enable platforms (start with Lighthouse only)
   ENABLE_LIGHTHOUSE=true
   ENABLE_PAGESPEED=false
   ENABLE_WEBPAGETEST=false
   
   # Optional API keys (only needed if you enable the platforms)
   PAGESPEED_API_KEY=your_key_here
   WEBPAGETEST_API_KEY=your_key_here
   ```

2. **Lighthouse Service**
   - Ensure your Lighthouse service is running on port 3001
   - If not, start it with: `cd lighthouse-service && npm start`

## Test Scenarios

### Test 1: Lighthouse Only (Default)
**Configuration:**
```bash
ENABLE_LIGHTHOUSE=true
ENABLE_PAGESPEED=false
ENABLE_WEBPAGETEST=false
```

**Steps:**
1. Enter a website URL in the dashboard
2. Click "Analyze"
3. Verify:
   - Analysis completes in ~5-10 seconds
   - All dashboard panels show data
   - AI Insights work correctly
   - Console shows "lighthouse" in platforms array

**Expected Results:**
- Fast response time
- All existing functionality works
- No API key requirements

### Test 2: Multiple Platforms (Optional)
**Configuration:**
```bash
ENABLE_LIGHTHOUSE=true
ENABLE_PAGESPEED=true
ENABLE_WEBPAGETEST=true
PAGESPEED_API_KEY=your_actual_key
WEBPAGETEST_API_KEY=your_actual_key
```

**Steps:**
1. Enter a website URL in the dashboard
2. Click "Analyze"
3. Monitor the process:
   - Lighthouse completes first (~5-10 seconds)
   - PageSpeed completes next (~15-20 seconds)
   - WebPageTest completes last (~2-5 minutes)

**Expected Results:**
- Longer analysis time but more comprehensive data
- Multiple platforms listed in results
- Consolidated scores from all platforms

### Test 3: Error Handling
**Configuration:**
```bash
ENABLE_LIGHTHOUSE=true
ENABLE_PAGESPEED=true
ENABLE_WEBPAGETEST=true
# Missing or invalid API keys
```

**Steps:**
1. Enter a website URL
2. Click "Analyze"
3. Check console for error messages

**Expected Results:**
- Lighthouse succeeds
- PageSpeed/WebPageTest fail gracefully
- Analysis completes with available data
- Error messages logged but don't break the system

## Verification Points

### 1. API Response Structure
Check that the `/api/analyze` response includes:
```json
{
  "url": "https://example.com",
  "analyzedAt": "2024-01-01T00:00:00.000Z",
  "platforms": ["lighthouse"],
  "categories": [...],
  "webVitals": [...],
  "opportunities": [...],
  "recommendations": [...],
  "accessibility": [...],
  "bestPractices": [...]
}
```

### 2. Database Storage
Verify that the database stores:
- **History table**: Consolidated scores and Web Vitals
- **HistoryDetails table**: Raw platform data and metadata

### 3. Dashboard Components
All existing components should work:
- ✅ CategoryScoresCard
- ✅ WebVitalsCard
- ✅ OpportunitiesCard
- ✅ RecommendationsCard
- ✅ AccessibilityCard
- ✅ BestPracticesCard
- ✅ AIInsightsCard

### 4. AI Insights Integration
- AI Insights should receive platform information
- Generated insights should reference data sources
- No breaking changes to existing AI functionality

## Performance Benchmarks

### Response Times
- **Lighthouse only**: 5-10 seconds
- **Lighthouse + PageSpeed**: 15-20 seconds
- **All platforms**: 2-5 minutes

### Data Quality
- **Lighthouse**: Comprehensive, simulated environment
- **PageSpeed**: Google's official metrics, real-world data
- **WebPageTest**: Real browser testing, detailed waterfall

## Troubleshooting

### Common Issues

1. **"No performance data available"**
   - Check that at least one platform is enabled
   - Verify Lighthouse service is running
   - Check network connectivity

2. **PageSpeed API errors**
   - Verify API key is correct
   - Check Google Cloud Console quotas
   - Ensure PageSpeed Insights API is enabled

3. **WebPageTest timeouts**
   - Increase timeout in configuration
   - Check WebPageTest server status
   - Consider using a different test location

4. **TypeScript errors**
   - Run `npx tsc --noEmit` to check for type errors
   - Ensure all imports are correct
   - Check that all interfaces are properly defined

### Debug Information

Check the browser console and server logs for:
- Platform configuration loading
- API call results
- Error messages
- Performance timing

## Next Steps

Once basic functionality is verified:

1. **Add more platforms** by creating new modules in `src/lib/platforms/`
2. **Customize platform weights** in the consolidation logic
3. **Add platform-specific visualizations** to show data sources
4. **Implement caching** for platform results
5. **Add platform comparison features** to the dashboard

## Configuration Examples

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
PAGESPEED_API_KEY=your_key
WEBPAGETEST_API_KEY=your_key
```

### Budget-Friendly
```bash
ENABLE_LIGHTHOUSE=true
ENABLE_PAGESPEED=false
ENABLE_WEBPAGETEST=true
# No API keys needed
```
