import { mockApiResponses, createMockFetchResponse } from '@/__tests__/utils/test-utils'

describe('Multi-Platform Data Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Platform Configuration', () => {
    it('should load platform configuration from environment variables', async () => {
      const mockConfig = {
        lighthouse: { enabled: true, apiKey: null },
        pagespeed: { enabled: true, apiKey: 'test-key' },
        webpagetest: { enabled: false, apiKey: null },
      }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockConfig)
      )

      const response = await fetch('/api/platforms/config')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.lighthouse.enabled).toBe(true)
      expect(data.pagespeed.enabled).toBe(true)
      expect(data.webpagetest.enabled).toBe(false)
    })

    it('should validate platform API keys', async () => {
      const mockValidation = {
        lighthouse: { valid: true, message: 'Lighthouse is ready' },
        pagespeed: { valid: false, message: 'Invalid API key' },
        webpagetest: { valid: false, message: 'API key not configured' },
      }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockValidation)
      )

      const response = await fetch('/api/platforms/validate')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.lighthouse.valid).toBe(true)
      expect(data.pagespeed.valid).toBe(false)
      expect(data.webpagetest.valid).toBe(false)
    })
  })

  describe('Data Consolidation', () => {
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
            fcp: 1.2,
            ttfb: 300,
            si: 1.8,
            inp: 45,
          },
          performanceMetrics: {
            firstContentfulPaint: 1200,
            largestContentfulPaint: 2500,
            firstInputDelay: 50,
            cumulativeLayoutShift: 0.1,
            speedIndex: 1800,
            totalBlockingTime: 150,
            maxPotentialFID: 45,
          },
        },
        platformResults: {
          lighthouse: {
            status: 'success',
            data: {
              categories: { performance: 85, accessibility: 92, seo: 88, 'best-practices': 95 },
              webVitals: { lcp: 2.5, fid: 50, cls: 0.1 },
              performanceMetrics: { firstContentfulPaint: 1200, largestContentfulPaint: 2500 },
            },
            timestamp: '2024-01-15T10:00:00Z',
          },
          pagespeed: {
            status: 'success',
            data: {
              categories: { performance: 87, accessibility: 90, seo: 85, 'best-practices': 93 },
              webVitals: { lcp: 2.3, fid: 45, cls: 0.08 },
              performanceMetrics: { firstContentfulPaint: 1100, largestContentfulPaint: 2300 },
            },
            timestamp: '2024-01-15T10:00:00Z',
          },
        },
        platforms: ['lighthouse', 'pagespeed'],
        warnings: [],
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
      expect(data.platformResults.pagespeed.status).toBe('success')
      expect(data.platforms).toHaveLength(2)
    })

    it('should handle platform-specific errors gracefully', async () => {
      const mockErrorData = {
        url: 'https://example.com',
        consolidatedData: {
          categories: { performance: 85, accessibility: 92, seo: 88, 'best-practices': 95 },
          webVitals: { lcp: 2.5, fid: 50, cls: 0.1 },
          performanceMetrics: { firstContentfulPaint: 1200, largestContentfulPaint: 2500 },
        },
        platformResults: {
          lighthouse: {
            status: 'success',
            data: {
              categories: { performance: 85, accessibility: 92, seo: 88, 'best-practices': 95 },
              webVitals: { lcp: 2.5, fid: 50, cls: 0.1 },
              performanceMetrics: { firstContentfulPaint: 1200, largestContentfulPaint: 2500 },
            },
            timestamp: '2024-01-15T10:00:00Z',
          },
          pagespeed: {
            status: 'error',
            error: 'Rate limit exceeded',
            timestamp: '2024-01-15T10:00:00Z',
          },
          webpagetest: {
            status: 'error',
            error: 'Invalid API key',
            timestamp: '2024-01-15T10:00:00Z',
          },
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
      expect(data.platformResults.webpagetest.status).toBe('error')
      expect(data.warnings).toHaveLength(2)
      expect(data.platforms).toHaveLength(1) // Only successful platforms
    })

    it('should average metrics from multiple platforms', async () => {
      const mockAveragedData = {
        url: 'https://example.com',
        consolidatedData: {
          categories: {
            performance: 86, // Average of 85 (Lighthouse) and 87 (PageSpeed)
            accessibility: 91, // Average of 92 (Lighthouse) and 90 (PageSpeed)
            seo: 86.5, // Average of 88 (Lighthouse) and 85 (PageSpeed)
            'best-practices': 94, // Average of 95 (Lighthouse) and 93 (PageSpeed)
          },
          webVitals: {
            lcp: 2.4, // Average of 2.5 (Lighthouse) and 2.3 (PageSpeed)
            fid: 47.5, // Average of 50 (Lighthouse) and 45 (PageSpeed)
            cls: 0.09, // Average of 0.1 (Lighthouse) and 0.08 (PageSpeed)
          },
          performanceMetrics: {
            firstContentfulPaint: 1150, // Average of 1200 and 1100
            largestContentfulPaint: 2400, // Average of 2500 and 2300
          },
        },
        platformResults: {
          lighthouse: {
            status: 'success',
            data: {
              categories: { performance: 85, accessibility: 92, seo: 88, 'best-practices': 95 },
              webVitals: { lcp: 2.5, fid: 50, cls: 0.1 },
              performanceMetrics: { firstContentfulPaint: 1200, largestContentfulPaint: 2500 },
            },
          },
          pagespeed: {
            status: 'success',
            data: {
              categories: { performance: 87, accessibility: 90, seo: 85, 'best-practices': 93 },
              webVitals: { lcp: 2.3, fid: 45, cls: 0.08 },
              performanceMetrics: { firstContentfulPaint: 1100, largestContentfulPaint: 2300 },
            },
          },
        },
        platforms: ['lighthouse', 'pagespeed'],
      }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockAveragedData)
      )

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com' }),
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.consolidatedData.categories.performance).toBe(86)
      expect(data.consolidatedData.categories.accessibility).toBe(91)
      expect(data.consolidatedData.webVitals.lcp).toBe(2.4)
      expect(data.consolidatedData.performanceMetrics.firstContentfulPaint).toBe(1150)
    })
  })

  describe('Platform Status Display', () => {
    it('should display platform status correctly', async () => {
      const mockPlatformStatus = {
        platforms: [
          {
            name: 'Lighthouse',
            status: 'success',
            enabled: true,
            lastCheck: '2024-01-15T10:00:00Z',
            message: 'Ready for analysis',
          },
          {
            name: 'PageSpeed Insights',
            status: 'error',
            enabled: true,
            lastCheck: '2024-01-15T10:00:00Z',
            message: 'Rate limit exceeded',
          },
          {
            name: 'WebPageTest',
            status: 'disabled',
            enabled: false,
            lastCheck: null,
            message: 'Not configured',
          },
        ],
      }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockPlatformStatus)
      )

      const response = await fetch('/api/platforms/status')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.platforms).toHaveLength(3)
      expect(data.platforms[0].status).toBe('success')
      expect(data.platforms[1].status).toBe('error')
      expect(data.platforms[2].status).toBe('disabled')
    })

    it('should show platform-specific data in UI', async () => {
      const mockPlatformData = {
        url: 'https://example.com',
        platformData: {
          lighthouse: {
            performance: 85,
            accessibility: 92,
            seo: 88,
            'best-practices': 95,
            lcp: 2.5,
            fid: 50,
            cls: 0.1,
          },
          pagespeed: {
            performance: 87,
            accessibility: 90,
            seo: 85,
            'best-practices': 93,
            lcp: 2.3,
            fid: 45,
            cls: 0.08,
          },
        },
        platforms: ['lighthouse', 'pagespeed'],
      }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockPlatformData)
      )

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com' }),
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.platformData.lighthouse.performance).toBe(85)
      expect(data.platformData.pagespeed.performance).toBe(87)
      expect(data.platforms).toContain('lighthouse')
      expect(data.platforms).toContain('pagespeed')
    })
  })

  describe('Environment-Driven Configuration', () => {
    it('should respect environment variable toggles', async () => {
      const mockConfig = {
        lighthouse: { enabled: true, apiKey: null },
        pagespeed: { enabled: false, apiKey: null }, // Disabled via env
        webpagetest: { enabled: false, apiKey: null }, // Disabled via env
      }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockConfig)
      )

      const response = await fetch('/api/platforms/config')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.lighthouse.enabled).toBe(true)
      expect(data.pagespeed.enabled).toBe(false)
      expect(data.webpagetest.enabled).toBe(false)
    })

    it('should handle missing API keys gracefully', async () => {
      const mockConfig = {
        lighthouse: { enabled: true, apiKey: null },
        pagespeed: { enabled: true, apiKey: null }, // Missing API key
        webpagetest: { enabled: true, apiKey: null }, // Missing API key
      }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockConfig)
      )

      const response = await fetch('/api/platforms/config')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.lighthouse.enabled).toBe(true)
      expect(data.pagespeed.enabled).toBe(true)
      expect(data.webpagetest.enabled).toBe(true)
    })
  })

  describe('Data Validation and Error Handling', () => {
    it('should validate platform data structure', async () => {
      const mockInvalidData = {
        url: 'https://example.com',
        platformResults: {
          lighthouse: {
            status: 'success',
            data: {
              // Missing required fields
              performance: 85,
              // Missing categories, webVitals, etc.
            },
          },
        },
        platforms: ['lighthouse'],
        warnings: ['Lighthouse data is incomplete'],
      }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockInvalidData)
      )

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com' }),
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.warnings).toContain('Lighthouse data is incomplete')
      expect(data.platformResults.lighthouse.data.categories).toBeUndefined()
    })

    it('should handle network timeouts', async () => {
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network timeout'))
      )

      try {
        await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: 'https://example.com' }),
        })
        // Should not reach here
        expect(true).toBe(false)
      } catch (error) {
        expect(error.message).toBe('Network timeout')
      }
    })

    it('should handle malformed platform responses', async () => {
      const mockMalformedData = {
        url: 'https://example.com',
        platformResults: {
          lighthouse: {
            status: 'success',
            data: 'Invalid data format', // Should be object, not string
          },
        },
        platforms: ['lighthouse'],
        warnings: ['Lighthouse returned invalid data format'],
      }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockMalformedData)
      )

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com' }),
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.warnings).toContain('Lighthouse returned invalid data format')
    })
  })

  describe('Performance Optimization', () => {
    it('should handle concurrent platform requests efficiently', async () => {
      const mockConcurrentData = {
        url: 'https://example.com',
        consolidatedData: {
          categories: { performance: 85, accessibility: 92, seo: 88, 'best-practices': 95 },
          webVitals: { lcp: 2.5, fid: 50, cls: 0.1 },
          performanceMetrics: { firstContentfulPaint: 1200, largestContentfulPaint: 2500 },
        },
        platformResults: {
          lighthouse: { status: 'success', data: { performance: 85 }, duration: 5000 },
          pagespeed: { status: 'success', data: { performance: 87 }, duration: 3000 },
          webpagetest: { status: 'success', data: { performance: 83 }, duration: 15000 },
        },
        platforms: ['lighthouse', 'pagespeed', 'webpagetest'],
        totalDuration: 15000, // Longest platform duration
      }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockConcurrentData)
      )

      const startTime = Date.now()
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com' }),
      })
      const endTime = Date.now()
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.platformResults).toHaveProperty('lighthouse')
      expect(data.platformResults).toHaveProperty('pagespeed')
      expect(data.platformResults).toHaveProperty('webpagetest')
      expect(data.totalDuration).toBe(15000)
    })

    it('should cache platform results appropriately', async () => {
      const mockCachedData = {
        url: 'https://example.com',
        consolidatedData: {
          categories: { performance: 85, accessibility: 92, seo: 88, 'best-practices': 95 },
          webVitals: { lcp: 2.5, fid: 50, cls: 0.1 },
          performanceMetrics: { firstContentfulPaint: 1200, largestContentfulPaint: 2500 },
        },
        platformResults: {
          lighthouse: { status: 'success', data: { performance: 85 }, cached: true },
          pagespeed: { status: 'success', data: { performance: 87 }, cached: false },
        },
        platforms: ['lighthouse', 'pagespeed'],
        cacheInfo: {
          lighthouse: { cached: true, age: 300 }, // 5 minutes old
          pagespeed: { cached: false, age: 0 },
        },
      }

      global.fetch = jest.fn(() =>
        createMockFetchResponse(mockCachedData)
      )

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com' }),
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.platformResults.lighthouse.cached).toBe(true)
      expect(data.platformResults.pagespeed.cached).toBe(false)
      expect(data.cacheInfo.lighthouse.age).toBe(300)
    })
  })
})
