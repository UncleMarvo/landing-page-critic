import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import { mockUser, mockProUser, mockDashboardData } from '@/__tests__/utils/test-utils'
import AIInsightsCard from '@/components/cards/aiinsightscard'
import FeatureGate from '@/components/payments/FeatureGate'
import { canAccessFeature } from '@/lib/payments/accessControl'

describe('AI Insights System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock the auth API call to return the appropriate user
    global.fetch = jest.fn((url) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
      }
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Not found' })
      })
    })
  })

  describe('Access Control Logic', () => {
    it('should allow Pro users to access AI insights', () => {
      const canAccess = canAccessFeature('pro', 'aiInsights')
      expect(canAccess).toBe(true)
    })

    it('should deny Free users access to AI insights', () => {
      const canAccess = canAccessFeature('free', 'aiInsights')
      expect(canAccess).toBe(false)
    })
  })

  describe('FeatureGate Component', () => {
    it('should render children for Pro users', () => {
      render(
        <FeatureGate feature="aiInsights" tier="pro">
          <div data-testid="pro-content">Pro Content</div>
        </FeatureGate>,
        { user: mockProUser }
      )

      expect(screen.getByTestId('pro-content')).toBeInTheDocument()
    })

    it('should render fallback for Free users', () => {
      render(
        <FeatureGate 
          feature="aiInsights" 
          tier="free"
          fallback={<div data-testid="upgrade-prompt">Upgrade Prompt</div>}
        >
          <div data-testid="pro-content">Pro Content</div>
        </FeatureGate>,
        { user: mockUser }
      )

      expect(screen.getByTestId('upgrade-prompt')).toBeInTheDocument()
      expect(screen.queryByTestId('pro-content')).not.toBeInTheDocument()
    })
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
      ]

      // Mock the auth API call to return Pro user
      global.fetch = jest.fn((url) => {
        if (url === '/api/auth/me') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockProUser)
          })
        }
        if (url.includes('/api/ai-insights')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ insights: mockInsights }),
          })
        }
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Not found' })
        })
      })

      render(<AIInsightsCard />, { 
        user: mockProUser,
        dashboardData: {
          ...mockDashboardData,
          currentUrl: 'https://example.com'
        }
      })

      await waitFor(() => {
        expect(screen.getByText('AI-Powered Insights')).toBeInTheDocument()
        expect(screen.getByText('Optimize Core Web Vitals')).toBeInTheDocument()
      })
    })

    it('should show upgrade prompt for Free users', () => {
      render(<AIInsightsCard />, { user: mockUser })

      // Free users should see the upgrade prompt, not the actual component
      expect(screen.getByText('AI-Powered Insights')).toBeInTheDocument()
      expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument()
      expect(screen.getByText('Get intelligent recommendations with historical context and actionable steps')).toBeInTheDocument()
      expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument()
    })

    it('should handle empty insights', async () => {
      // Mock the auth API call to return Pro user
      global.fetch = jest.fn((url) => {
        if (url === '/api/auth/me') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockProUser)
          })
        }
        if (url.includes('/api/ai-insights')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ insights: [] }),
          })
        }
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Not found' })
        })
      })

      render(<AIInsightsCard />, { 
        user: mockProUser,
        dashboardData: {
          ...mockDashboardData,
          currentUrl: 'https://example.com'
        }
      })

      await waitFor(() => {
        expect(screen.getByText('No AI insights available')).toBeInTheDocument()
        expect(screen.getByText('Enter a URL to analyze and generate insights')).toBeInTheDocument()
      })
    })

    it('should handle API errors gracefully', async () => {
      // Mock the auth API call to return Pro user
      global.fetch = jest.fn((url) => {
        if (url === '/api/auth/me') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockProUser)
          })
        }
        if (url.includes('/api/ai-insights')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: 'Failed to load insights' }),
          })
        }
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Not found' })
        })
      })

      render(<AIInsightsCard />, { 
        user: mockProUser,
        dashboardData: {
          ...mockDashboardData,
          currentUrl: 'https://example.com'
        }
      })

      await waitFor(() => {
        expect(screen.getByText('Failed to load insights')).toBeInTheDocument()
      })
    })
  })
})
