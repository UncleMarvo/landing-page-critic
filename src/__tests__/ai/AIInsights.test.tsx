import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import { mockUser, mockProUser, mockApiResponses } from '@/__tests__/utils/test-utils'
import AIInsightsCard from '@/components/cards/aiinsightscard'
import FeatureGate from '@/components/payments/FeatureGate'

describe('AI Insights System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('AI Insights Card', () => {
    it('should display AI insights for Pro users', async () => {
      const mockInsights = [
        {
          id: 'insight-1',
          title: 'Optimize Core Web Vitals',
          description: 'Improve LCP, FID, and CLS scores for better user experience',
          severity: 'High',
          category: 'Performance',
          actionable: true,
          estimatedImpact: 'High',
          priority: 5,
          status: 'pending',
          historicalContext: 'Previous analysis showed similar issues',
          platformSpecific: true,
          platforms: ['lighthouse'],
          implementationSteps: ['Optimize images', 'Minimize CSS', 'Reduce JavaScript'],
          expectedTimeline: '2-4 weeks',
          costBenefit: 'High impact, medium effort',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'insight-2',
          title: 'Improve Accessibility',
          description: 'Add proper ARIA labels and improve keyboard navigation',
          severity: 'Medium',
          category: 'Accessibility',
          actionable: true,
          estimatedImpact: 'Medium',
          priority: 3,
          status: 'pending',
          historicalContext: 'Accessibility scores have been consistent',
          platformSpecific: false,
          platforms: [],
          implementationSteps: ['Add ARIA labels', 'Test keyboard navigation'],
          expectedTimeline: '1-2 weeks',
          costBenefit: 'Medium impact, low effort',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockInsights),
        })
      )

      render(<AIInsightsCard />, { user: mockProUser })

      await waitFor(() => {
        expect(screen.getByText('AI-Powered Insights')).toBeInTheDocument()
        expect(screen.getByText('Optimize Core Web Vitals')).toBeInTheDocument()
        expect(screen.getByText('Improve Accessibility')).toBeInTheDocument()
      })
    })

    it('should show upgrade prompt for Free users', () => {
      render(
        <FeatureGate feature="aiInsights" tier="free">
          <AIInsightsCard />
        </FeatureGate>
      )

      expect(screen.getByText('Pro Feature')).toBeInTheDocument()
      expect(screen.getByText('Upgrade to Pro to access AI-powered insights and recommendations')).toBeInTheDocument()
      expect(screen.queryByText('AI-Powered Insights')).not.toBeInTheDocument()
    })

    it('should display priority indicators correctly', async () => {
      const mockInsights = [
        {
          id: 'insight-1',
          title: 'High Priority Issue',
          description: 'Critical performance issue',
          severity: 'High',
          category: 'Performance',
          actionable: true,
          estimatedImpact: 'High',
          priority: 5,
          status: 'pending',
          historicalContext: 'Critical issue',
          platformSpecific: true,
          platforms: ['lighthouse'],
          implementationSteps: ['Fix immediately'],
          expectedTimeline: '1 week',
          costBenefit: 'Critical impact',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockInsights),
        })
      )

      render(<AIInsightsCard />, { user: mockProUser })

      await waitFor(() => {
        expect(screen.getByText('High Priority Issue')).toBeInTheDocument()
        // Should show 5 stars for priority 5
        const stars = screen.getAllByTestId('priority-star')
        expect(stars).toHaveLength(5)
      })
    })

    it('should display platform-specific badges', async () => {
      const mockInsights = [
        {
          id: 'insight-1',
          title: 'Platform Specific Issue',
          description: 'Issue specific to Lighthouse',
          severity: 'Medium',
          category: 'Performance',
          actionable: true,
          estimatedImpact: 'Medium',
          priority: 3,
          status: 'pending',
          historicalContext: 'Platform specific',
          platformSpecific: true,
          platforms: ['lighthouse', 'pagespeed'],
          implementationSteps: ['Platform specific fix'],
          expectedTimeline: '1 week',
          costBenefit: 'Medium impact',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockInsights),
        })
      )

      render(<AIInsightsCard />, { user: mockProUser })

      await waitFor(() => {
        expect(screen.getByText('Platform Specific Issue')).toBeInTheDocument()
        expect(screen.getByText('Platform Specific')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument() // 2 platforms
      })
    })

    it('should handle applied/ignored actions', async () => {
      const mockInsights = [
        {
          id: 'insight-1',
          title: 'Test Insight',
          description: 'Test description',
          severity: 'Medium',
          category: 'Performance',
          actionable: true,
          estimatedImpact: 'Medium',
          priority: 3,
          status: 'pending',
          historicalContext: 'Test context',
          platformSpecific: false,
          platforms: [],
          implementationSteps: ['Step 1', 'Step 2'],
          expectedTimeline: '1 week',
          costBenefit: 'Medium impact',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockInsights),
        })
      )

      render(<AIInsightsCard />, { user: mockProUser })

      await waitFor(() => {
        expect(screen.getByText('Test Insight')).toBeInTheDocument()
      })

      // Test applied action
      const appliedButton = screen.getByTestId('applied-button')
      fireEvent.click(appliedButton)

      await waitFor(() => {
        expect(screen.getByText('Applied')).toBeInTheDocument()
      })

      // Test ignored action
      const ignoredButton = screen.getByTestId('ignored-button')
      fireEvent.click(ignoredButton)

      await waitFor(() => {
        expect(screen.getByText('Ignored')).toBeInTheDocument()
      })
    })

    it('should display implementation steps', async () => {
      const mockInsights = [
        {
          id: 'insight-1',
          title: 'Implementation Test',
          description: 'Test implementation steps',
          severity: 'Medium',
          category: 'Performance',
          actionable: true,
          estimatedImpact: 'Medium',
          priority: 3,
          status: 'pending',
          historicalContext: 'Test context',
          platformSpecific: false,
          platforms: [],
          implementationSteps: [
            'Step 1: Optimize images',
            'Step 2: Minimize CSS',
            'Step 3: Reduce JavaScript',
          ],
          expectedTimeline: '2-4 weeks',
          costBenefit: 'High impact, medium effort',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockInsights),
        })
      )

      render(<AIInsightsCard />, { user: mockProUser })

      await waitFor(() => {
        expect(screen.getByText('Implementation Test')).toBeInTheDocument()
        expect(screen.getByText('Step 1: Optimize images')).toBeInTheDocument()
        expect(screen.getByText('Step 2: Minimize CSS')).toBeInTheDocument()
        expect(screen.getByText('Step 3: Reduce JavaScript')).toBeInTheDocument()
      })
    })

    it('should display expected timeline and cost/benefit', async () => {
      const mockInsights = [
        {
          id: 'insight-1',
          title: 'Timeline Test',
          description: 'Test timeline and cost/benefit',
          severity: 'Medium',
          category: 'Performance',
          actionable: true,
          estimatedImpact: 'Medium',
          priority: 3,
          status: 'pending',
          historicalContext: 'Test context',
          platformSpecific: false,
          platforms: [],
          implementationSteps: ['Test step'],
          expectedTimeline: '2-4 weeks',
          costBenefit: 'High impact, medium effort',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockInsights),
        })
      )

      render(<AIInsightsCard />, { user: mockProUser })

      await waitFor(() => {
        expect(screen.getByText('Timeline Test')).toBeInTheDocument()
        expect(screen.getByText('Expected Timeline: 2-4 weeks')).toBeInTheDocument()
        expect(screen.getByText('Cost/Benefit: High impact, medium effort')).toBeInTheDocument()
      })
    })

    it('should display historical context', async () => {
      const mockInsights = [
        {
          id: 'insight-1',
          title: 'Historical Test',
          description: 'Test historical context',
          severity: 'Medium',
          category: 'Performance',
          actionable: true,
          estimatedImpact: 'Medium',
          priority: 3,
          status: 'pending',
          historicalContext: 'This issue has been identified in previous analyses. Performance scores have been declining over the past 3 months.',
          platformSpecific: false,
          platforms: [],
          implementationSteps: ['Test step'],
          expectedTimeline: '1 week',
          costBenefit: 'Medium impact',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockInsights),
        })
      )

      render(<AIInsightsCard />, { user: mockProUser })

      await waitFor(() => {
        expect(screen.getByText('Historical Test')).toBeInTheDocument()
        expect(screen.getByText('Historical Context')).toBeInTheDocument()
        expect(screen.getByText(/This issue has been identified in previous analyses/)).toBeInTheDocument()
      })
    })

    it('should handle loading state', () => {
      global.fetch = jest.fn(() =>
        new Promise(() => {}) // Never resolves
      )

      render(<AIInsightsCard />, { user: mockProUser })

      expect(screen.getByText('Loading insights...')).toBeInTheDocument()
    })

    it('should handle error state', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Failed to load insights' }),
        })
      )

      render(<AIInsightsCard />, { user: mockProUser })

      await waitFor(() => {
        expect(screen.getByText('Failed to load AI insights')).toBeInTheDocument()
        expect(screen.getByText('Please try again later.')).toBeInTheDocument()
      })
    })

    it('should handle empty insights', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      )

      render(<AIInsightsCard />, { user: mockProUser })

      await waitFor(() => {
        expect(screen.getByText('No AI insights available')).toBeInTheDocument()
        expect(screen.getByText('Run an analysis to generate AI-powered recommendations.')).toBeInTheDocument()
      })
    })

    it('should filter insights by severity', async () => {
      const mockInsights = [
        {
          id: 'insight-1',
          title: 'High Severity Issue',
          description: 'Critical issue',
          severity: 'High',
          category: 'Performance',
          actionable: true,
          estimatedImpact: 'High',
          priority: 5,
          status: 'pending',
          historicalContext: 'Critical',
          platformSpecific: false,
          platforms: [],
          implementationSteps: ['Fix'],
          expectedTimeline: '1 week',
          costBenefit: 'Critical',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'insight-2',
          title: 'Low Severity Issue',
          description: 'Minor issue',
          severity: 'Low',
          category: 'Performance',
          actionable: true,
          estimatedImpact: 'Low',
          priority: 1,
          status: 'pending',
          historicalContext: 'Minor',
          platformSpecific: false,
          platforms: [],
          implementationSteps: ['Optional fix'],
          expectedTimeline: '1 week',
          costBenefit: 'Low impact',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockInsights),
        })
      )

      render(<AIInsightsCard />, { user: mockProUser })

      await waitFor(() => {
        expect(screen.getByText('High Severity Issue')).toBeInTheDocument()
        expect(screen.getByText('Low Severity Issue')).toBeInTheDocument()
      })

      // Test filtering by severity
      const highSeverityFilter = screen.getByTestId('filter-high')
      fireEvent.click(highSeverityFilter)

      await waitFor(() => {
        expect(screen.getByText('High Severity Issue')).toBeInTheDocument()
        expect(screen.queryByText('Low Severity Issue')).not.toBeInTheDocument()
      })
    })

    it('should export insights to CSV', async () => {
      const mockInsights = [
        {
          id: 'insight-1',
          title: 'Export Test',
          description: 'Test export functionality',
          severity: 'Medium',
          category: 'Performance',
          actionable: true,
          estimatedImpact: 'Medium',
          priority: 3,
          status: 'pending',
          historicalContext: 'Test',
          platformSpecific: false,
          platforms: [],
          implementationSteps: ['Test'],
          expectedTimeline: '1 week',
          costBenefit: 'Medium',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockInsights),
        })
      )

      // Mock URL.createObjectURL and URL.revokeObjectURL
      const mockCreateObjectURL = jest.fn(() => 'mock-url')
      const mockRevokeObjectURL = jest.fn()
      global.URL.createObjectURL = mockCreateObjectURL
      global.URL.revokeObjectURL = mockRevokeObjectURL

      render(<AIInsightsCard />, { user: mockProUser })

      await waitFor(() => {
        expect(screen.getByText('Export Test')).toBeInTheDocument()
      })

      const exportButton = screen.getByTestId('export-csv-button')
      fireEvent.click(exportButton)

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled()
        expect(mockRevokeObjectURL).toHaveBeenCalled()
      })
    })
  })

  describe('AI Insights API Integration', () => {
    it('should call AI insights API with correct parameters', async () => {
      const mockInsights = [
        {
          id: 'insight-1',
          title: 'API Test',
          description: 'Test API integration',
          severity: 'Medium',
          category: 'Performance',
          actionable: true,
          estimatedImpact: 'Medium',
          priority: 3,
          status: 'pending',
          historicalContext: 'Test',
          platformSpecific: false,
          platforms: [],
          implementationSteps: ['Test'],
          expectedTimeline: '1 week',
          costBenefit: 'Medium',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockInsights),
        })
      )

      render(<AIInsightsCard />, { user: mockProUser })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/ai-insights', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      })
    })

    it('should handle AI insights generation', async () => {
      const mockGeneratedInsight = {
        id: 'generated-1',
        title: 'Generated Insight',
        description: 'AI generated insight',
        severity: 'High',
        category: 'Performance',
        actionable: true,
        estimatedImpact: 'High',
        priority: 5,
        status: 'pending',
        historicalContext: 'Generated context',
        platformSpecific: true,
        platforms: ['lighthouse'],
        implementationSteps: ['Generated step'],
        expectedTimeline: '1 week',
        costBenefit: 'High impact',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      global.fetch = jest.fn()
        .mockImplementationOnce(() => // First call for existing insights
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          })
        )
        .mockImplementationOnce(() => // Second call for generating new insights
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockGeneratedInsight),
          })
        )

      render(<AIInsightsCard />, { user: mockProUser })

      await waitFor(() => {
        expect(screen.getByText('No AI insights available')).toBeInTheDocument()
      })

      const generateButton = screen.getByTestId('generate-insights-button')
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('Generated Insight')).toBeInTheDocument()
      })
    })
  })
})
