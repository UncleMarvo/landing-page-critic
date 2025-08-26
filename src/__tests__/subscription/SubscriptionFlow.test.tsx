import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import { mockUser, mockProUser, mockApiResponses } from '@/__tests__/utils/test-utils'
import SubscriptionCard from '@/components/payments/SubscriptionCard'
import UsageTracker from '@/components/payments/UsageTracker'
import FeatureGate from '@/components/payments/FeatureGate'
import UpgradePrompt from '@/components/payments/UpgradePrompt'

// Mock the usage API
jest.mock('@/lib/api', () => ({
  fetchUsage: jest.fn(() => Promise.resolve(mockApiResponses.usage)),
}))

describe('Subscription Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Free User Experience', () => {
    it('should display upgrade prompts for restricted features', () => {
      render(
        <div>
          <FeatureGate feature="aiInsights" tier="free">
            <div>AI Insights Content</div>
          </FeatureGate>
        </div>
      )

      expect(screen.getByText('Pro Feature')).toBeInTheDocument()
      expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument()
      expect(screen.queryByText('AI Insights Content')).not.toBeInTheDocument()
    })

    it('should show usage limits in UsageTracker', async () => {
      render(<UsageTracker tier="free" />)

      await waitFor(() => {
        expect(screen.getByText('Usage This Month')).toBeInTheDocument()
        expect(screen.getByText('3 / 5')).toBeInTheDocument() // analyses used
        expect(screen.getByText('1 / 3')).toBeInTheDocument() // AI insights used
        expect(screen.getByText('0 / 1')).toBeInTheDocument() // export reports used
      })
    })

    it('should display upgrade banner for Free users', () => {
      render(
        <UpgradePrompt 
          variant="compact"
          title="Unlock Full Dashboard Access"
          description="Upgrade to Pro for unlimited analyses, AI insights, and advanced features"
        />
      )

      expect(screen.getByText('Unlock Full Dashboard Access')).toBeInTheDocument()
      expect(screen.getByText('Upgrade to Pro for unlimited analyses, AI insights, and advanced features')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Upgrade' })).toBeInTheDocument()
    })

    it('should show subscription card with upgrade options', () => {
      render(<SubscriptionCard />)

      expect(screen.getByText('Free')).toBeInTheDocument()
      expect(screen.getByText('Pro')).toBeInTheDocument()
      expect(screen.getByText('$29/month')).toBeInTheDocument()
    })
  })

  describe('Pro User Experience', () => {
    it('should allow access to restricted features', () => {
      render(
        <div>
          <FeatureGate feature="aiInsights" tier="pro">
            <div>AI Insights Content</div>
          </FeatureGate>
        </div>
      )

      expect(screen.getByText('AI Insights Content')).toBeInTheDocument()
      expect(screen.queryByText('Pro Feature')).not.toBeInTheDocument()
    })

    it('should show unlimited usage in UsageTracker', async () => {
      render(<UsageTracker tier="pro" />)

      await waitFor(() => {
        expect(screen.getByText('Unlimited Usage')).toBeInTheDocument()
        expect(screen.getByText('You have unlimited access to all features with your Pro plan.')).toBeInTheDocument()
      })
    })

    it('should display Pro subscription status', () => {
      render(<SubscriptionCard />)

      expect(screen.getByText('Pro')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
    })
  })

  describe('Feature Gating Logic', () => {
    it('should gate AI insights for Free users', () => {
      render(
        <FeatureGate feature="aiInsights" tier="free">
          <div>AI Insights</div>
        </FeatureGate>
      )

      expect(screen.queryByText('AI Insights')).not.toBeInTheDocument()
      expect(screen.getByText('Upgrade to Pro to access AI-powered insights and recommendations')).toBeInTheDocument()
    })

    it('should gate export reports for Free users', () => {
      render(
        <FeatureGate feature="exportReports" tier="free">
          <div>Export Reports</div>
        </FeatureGate>
      )

      expect(screen.queryByText('Export Reports')).not.toBeInTheDocument()
      expect(screen.getByText('Upgrade to Pro to export detailed reports in PDF and CSV formats')).toBeInTheDocument()
    })

    it('should gate performance metrics for Free users', () => {
      render(
        <FeatureGate feature="performanceMetrics" tier="free">
          <div>Performance Metrics</div>
        </FeatureGate>
      )

      expect(screen.queryByText('Performance Metrics')).not.toBeInTheDocument()
      expect(screen.getByText('Upgrade to Pro to access detailed performance metrics and historical trends')).toBeInTheDocument()
    })

    it('should allow basic features for Free users', () => {
      render(
        <div>
          <FeatureGate feature="basicAnalysis" tier="free">
            <div>Basic Analysis</div>
          </FeatureGate>
        </div>
      )

      expect(screen.getByText('Basic Analysis')).toBeInTheDocument()
    })
  })

  describe('Upgrade Prompt Variants', () => {
    it('should render default upgrade prompt with features list', () => {
      render(
        <UpgradePrompt
          title="Test Upgrade"
          description="Test description"
          features={['Feature 1', 'Feature 2']}
        />
      )

      expect(screen.getByText('Test Upgrade')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
      expect(screen.getByText('Feature 1')).toBeInTheDocument()
      expect(screen.getByText('Feature 2')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Upgrade to Pro/i })).toBeInTheDocument()
    })

    it('should render compact upgrade prompt', () => {
      render(
        <UpgradePrompt
          variant="compact"
          title="Compact Upgrade"
          description="Compact description"
        />
      )

      expect(screen.getByText('Compact Upgrade')).toBeInTheDocument()
      expect(screen.getByText('Compact description')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Upgrade' })).toBeInTheDocument()
    })

    it('should render inline upgrade prompt', () => {
      render(
        <UpgradePrompt
          variant="inline"
          title="Inline Upgrade"
        />
      )

      expect(screen.getByText('Pro feature')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Upgrade' })).toBeInTheDocument()
    })
  })

  describe('Usage Tracking', () => {
    it('should display correct usage percentages', async () => {
      render(<UsageTracker tier="free" />)

      await waitFor(() => {
        // 3 out of 5 analyses = 60%
        const analysisProgress = screen.getByText('60%')
        expect(analysisProgress).toBeInTheDocument()
      })
    })

    it('should show warning when approaching limits', async () => {
      const highUsageData = {
        ...mockApiResponses.usage,
        auditResults: 4, // 4 out of 5 = 80%
      }

      // Mock the fetch to return high usage
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(highUsageData),
        })
      )

      render(<UsageTracker tier="free" />)

      await waitFor(() => {
        expect(screen.getByText('4 / 5')).toBeInTheDocument()
        // Should show warning indicator
        expect(screen.getByText('80%')).toBeInTheDocument()
      })
    })

    it('should show limit reached message', async () => {
      const limitReachedData = {
        ...mockApiResponses.usage,
        auditResults: 5, // 5 out of 5 = 100%
      }

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(limitReachedData),
        })
      )

      render(<UsageTracker tier="free" />)

      await waitFor(() => {
        expect(screen.getByText('Limit reached')).toBeInTheDocument()
      })
    })
  })

  describe('Subscription Card Features', () => {
    it('should display Free plan features', () => {
      render(<SubscriptionCard />)

      expect(screen.getByText('5 analyses per month')).toBeInTheDocument()
      expect(screen.getByText('Basic performance metrics')).toBeInTheDocument()
      expect(screen.getByText('Web Vitals analysis')).toBeInTheDocument()
    })

    it('should display Pro plan features', () => {
      render(<SubscriptionCard />)

      expect(screen.getByText('Unlimited analyses')).toBeInTheDocument()
      expect(screen.getByText('AI-powered insights')).toBeInTheDocument()
      expect(screen.getByText('Export to PDF/CSV')).toBeInTheDocument()
      expect(screen.getByText('Advanced analytics')).toBeInTheDocument()
    })

    it('should show upgrade button for Free users', () => {
      render(<SubscriptionCard />)

      const upgradeButtons = screen.getAllByRole('button', { name: /Upgrade/i })
      expect(upgradeButtons.length).toBeGreaterThan(0)
    })
  })
})
