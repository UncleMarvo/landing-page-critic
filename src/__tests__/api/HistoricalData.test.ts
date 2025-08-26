import { mockApiResponses, createMockFetchResponse } from '@/__tests__/utils/test-utils'

// Mock the timeline API endpoint
describe('Historical Data Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('/api/timeline', () => {
    it('should fetch historical data for a URL', async () => {
      const mockTimelineData = {
        history: [
          {
            id: '1',
            url: 'https://example.com',
            createdAt: '2024-01-15T10:00:00Z',
            categories: {
              performance: 85,
              accessibility: 92,
              seo: 88,
              'best-practices': 95,
            },
            webVitals: {
              lcp: 2.5,
              fid: 50,
              cls: 0.1,
            },
            performanceMetrics: {
              firstContentfulPaint: 1200,
              largestContentfulPaint: 2500,
              firstInputDelay: 50,
              cumulativeLayoutShift: 0.1,
            },
          },
        ],
      }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockTimelineData)
      )

      const response = await fetch('/api/timeline?url=https://example.com')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.history).toHaveLength(1)
      expect(data.history[0].url).toBe('https://example.com')
      expect(data.history[0].categories.performance).toBe(85)
    })

    it('should handle date range filtering', async () => {
      const mockTimelineData = {
        history: [
          {
            id: '1',
            url: 'https://example.com',
            createdAt: '2024-01-15T10:00:00Z',
            categories: { performance: 85 },
            webVitals: { lcp: 2.5 },
            performanceMetrics: { firstContentfulPaint: 1200 },
          },
        ],
      }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockTimelineData)
      )

      const startDate = '2024-01-01T00:00:00Z'
      const endDate = '2024-01-31T23:59:59Z'
      
      const response = await fetch(
        `/api/timeline?url=https://example.com&start=${startDate}&end=${endDate}`
      )
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.history).toHaveLength(1)
    })

    it('should handle empty history gracefully', async () => {
      const mockEmptyData = { history: [] }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockEmptyData)
      )

      const response = await fetch('/api/timeline?url=https://new-site.com')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.history).toHaveLength(0)
    })

    it('should handle API errors', async () => {
      global.fetch = jest.fn(() =>
        createMockFetchResponse({ error: 'Internal server error' }, 500)
      )

      const response = await fetch('/api/timeline?url=https://example.com')
      
      expect(response.ok).toBe(false)
      expect(response.status).toBe(500)
    })
  })

  describe('/api/analyze with historical context', () => {
    it('should include historical data in analysis', async () => {
      const mockAnalysisData = {
        url: 'https://example.com',
        categories: {
          performance: 85,
          accessibility: 92,
          seo: 88,
          'best-practices': 95,
        },
        webVitals: {
          lcp: 2.5,
          fid: 50,
          cls: 0.1,
        },
        performanceMetrics: {
          firstContentfulPaint: 1200,
          largestContentfulPaint: 2500,
          firstInputDelay: 50,
          cumulativeLayoutShift: 0.1,
        },
        platforms: ['lighthouse'],
        historicalContext: {
          previousAnalyses: 3,
          averagePerformance: 82,
          trend: 'improving',
        },
      }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockAnalysisData)
      )

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com' }),
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.url).toBe('https://example.com')
      expect(data.historicalContext).toBeDefined()
      expect(data.historicalContext.previousAnalyses).toBe(3)
      expect(data.platforms).toContain('lighthouse')
    })

    it('should handle multi-platform data', async () => {
      const mockMultiPlatformData = {
        url: 'https://example.com',
        categories: { performance: 85 },
        webVitals: { lcp: 2.5 },
        performanceMetrics: { firstContentfulPaint: 1200 },
        platforms: ['lighthouse', 'pagespeed', 'webpagetest'],
        platformData: {
          lighthouse: { performance: 85 },
          pagespeed: { performance: 87 },
          webpagetest: { performance: 83 },
        },
      }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockMultiPlatformData)
      )

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com' }),
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.platforms).toHaveLength(3)
      expect(data.platformData).toBeDefined()
      expect(data.platformData.lighthouse).toBeDefined()
      expect(data.platformData.pagespeed).toBeDefined()
      expect(data.platformData.webpagetest).toBeDefined()
    })
  })

  describe('Performance Metrics Panel', () => {
    it('should display historical trends correctly', async () => {
      const mockHistoricalData = {
        history: [
          {
            id: '1',
            createdAt: '2024-01-01T10:00:00Z',
            performanceMetrics: { firstContentfulPaint: 1200 },
          },
          {
            id: '2',
            createdAt: '2024-01-15T10:00:00Z',
            performanceMetrics: { firstContentfulPaint: 1100 },
          },
          {
            id: '3',
            createdAt: '2024-01-30T10:00:00Z',
            performanceMetrics: { firstContentfulPaint: 1000 },
          },
        ],
      }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockHistoricalData)
      )

      const response = await fetch('/api/timeline?url=https://example.com')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.history).toHaveLength(3)
      
      // Verify trend (improving performance)
      const fcpValues = data.history.map((h: any) => h.performanceMetrics.firstContentfulPaint)
      expect(fcpValues).toEqual([1200, 1100, 1000]) // Decreasing values = improving performance
    })

    it('should handle missing performance metrics gracefully', async () => {
      const mockIncompleteData = {
        history: [
          {
            id: '1',
            createdAt: '2024-01-15T10:00:00Z',
            categories: { performance: 85 },
            webVitals: { lcp: 2.5 },
            // Missing performanceMetrics
          },
        ],
      }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockIncompleteData)
      )

      const response = await fetch('/api/timeline?url=https://example.com')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.history[0].performanceMetrics).toBeUndefined()
    })
  })

  describe('Multi-Platform Data Integration', () => {
    it('should consolidate data from multiple platforms', async () => {
      const mockConsolidatedData = {
        url: 'https://example.com',
        consolidatedData: {
          categories: {
            performance: 85,
            accessibility: 92,
            seo: 88,
            'best-practices': 95,
          },
          webVitals: {
            lcp: 2.5,
            fid: 50,
            cls: 0.1,
          },
          performanceMetrics: {
            firstContentfulPaint: 1200,
            largestContentfulPaint: 2500,
            firstInputDelay: 50,
            cumulativeLayoutShift: 0.1,
          },
        },
        platformResults: {
          lighthouse: { status: 'success', data: { performance: 85 } },
          pagespeed: { status: 'success', data: { performance: 87 } },
          webpagetest: { status: 'error', error: 'API key missing' },
        },
        platforms: ['lighthouse', 'pagespeed'],
      }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockConsolidatedData)
      )

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com' }),
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.consolidatedData).toBeDefined()
      expect(data.platformResults).toBeDefined()
      expect(data.platformResults.lighthouse.status).toBe('success')
      expect(data.platformResults.webpagetest.status).toBe('error')
      expect(data.platforms).toHaveLength(2)
    })

    it('should handle platform-specific errors gracefully', async () => {
      const mockErrorData = {
        url: 'https://example.com',
        consolidatedData: {
          categories: { performance: 85 },
          webVitals: { lcp: 2.5 },
          performanceMetrics: { firstContentfulPaint: 1200 },
        },
        platformResults: {
          lighthouse: { status: 'success', data: { performance: 85 } },
          pagespeed: { status: 'error', error: 'Rate limit exceeded' },
          webpagetest: { status: 'error', error: 'Invalid API key' },
        },
        platforms: ['lighthouse'],
        warnings: [
          'PageSpeed Insights API rate limit exceeded',
          'WebPageTest API key is invalid',
        ],
      }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockErrorData)
      )

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com' }),
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.platformResults.lighthouse.status).toBe('success')
      expect(data.platformResults.pagespeed.status).toBe('error')
      expect(data.warnings).toHaveLength(2)
      expect(data.platforms).toHaveLength(1) // Only successful platforms
    })
  })

  describe('Data Validation', () => {
    it('should validate required fields in historical data', async () => {
      const mockInvalidData = {
        history: [
          {
            id: '1',
            // Missing required fields
          },
        ],
      }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockInvalidData)
      )

      const response = await fetch('/api/timeline?url=https://example.com')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.history[0].url).toBeUndefined()
      expect(data.history[0].categories).toBeUndefined()
    })

    it('should handle malformed JSON responses', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.reject(new Error('Invalid JSON')),
        })
      )

      const response = await fetch('/api/timeline?url=https://example.com')
      
      expect(response.ok).toBe(false)
      expect(response.status).toBe(500)
    })
  })
})
