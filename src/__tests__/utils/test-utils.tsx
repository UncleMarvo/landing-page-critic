import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/context/AuthContext'
import { DashboardProvider } from '@/context/DashboardContext'
import { ResultsProvider } from '@/context/ResultsContext'

// Mock data for testing
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  tier: 'free' as const,
  subscriptionStatus: 'inactive' as const,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockProUser = {
  ...mockUser,
  tier: 'pro' as const,
  subscriptionStatus: 'active' as const,
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
}

export const mockDashboardData = {
  currentUrl: 'https://example.com',
  webVitalsData: {
    lcp: 2.5,
    fid: 50,
    cls: 0.1,
    fcp: 1.2,
    ttfb: 300,
    si: 1.8,
    inp: 45,
  },
  categoriesData: {
    performance: 85,
    accessibility: 92,
    seo: 88,
    'best-practices': 95,
  },
  recommendationsData: [
    {
      id: 'rec-1',
      title: 'Optimize images',
      description: 'Compress and optimize images for better performance',
      severity: 'High',
      category: 'Performance',
      actionable: true,
      estimatedImpact: 'High',
      priority: 5,
      status: 'pending',
    },
  ],
  accessibilityData: [],
  opportunitiesData: [],
  bestPracticesData: [],
  performanceHistory: [],
  platforms: ['lighthouse'],
  isLoading: false,
}

export const mockResultsData = {
  categories: [
    { id: 'performance', title: 'Performance', score: 85 },
    { id: 'accessibility', title: 'Accessibility', score: 92 },
    { id: 'seo', title: 'SEO', score: 88 },
    { id: 'best-practices', title: 'Best Practices', score: 95 },
  ],
  webVitals: [
    { id: 'lcp', title: 'Largest Contentful Paint', legend: 'Good', value: 2.5, unit: 's' },
    { id: 'fid', title: 'First Input Delay', legend: 'Good', value: 50, unit: 'ms' },
    { id: 'cls', title: 'Cumulative Layout Shift', legend: 'Good', value: 0.1, unit: '' },
  ],
  opportunities: [],
  recommendations: [],
  accessibility: [],
  bestPractices: [],
  seo: [],
  performanceDetails: [],
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: typeof mockUser
  dashboardData?: typeof mockDashboardData
  resultsData?: typeof mockResultsData
}

const AllTheProviders = ({ 
  children, 
  user = mockUser, 
  dashboardData = mockDashboardData,
  resultsData = mockResultsData 
}: { 
  children: React.ReactNode
  user?: typeof mockUser
  dashboardData?: typeof mockDashboardData
  resultsData?: typeof mockResultsData
}) => {
  return (
    <AuthProvider>
      <ResultsProvider initialResults={resultsData}>
        <DashboardProvider initialData={dashboardData}>
          {children}
        </DashboardProvider>
      </ResultsProvider>
    </AuthProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { user, dashboardData, resultsData, ...renderOptions } = options
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders 
        user={user} 
        dashboardData={dashboardData}
        resultsData={resultsData}
      >
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Mock API responses
export const mockApiResponses = {
  usage: {
    auditResults: 3,
    aiInsights: 1,
    exportReports: 0,
    periodStart: new Date('2024-01-01'),
    periodEnd: new Date('2024-01-31'),
  },
  subscription: {
    tier: 'free',
    status: 'inactive',
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  },
  export: {
    hasAccess: false,
    limit: 1,
    used: 0,
    remaining: 1,
    canExport: true,
    upgradeRequired: false,
  },
  aiInsights: [
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
  ],
}

// Helper functions
export const createMockFetchResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    blob: () => Promise.resolve(new Blob([JSON.stringify(data)])),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  })
}

export const mockFetch = (responses: Record<string, any>) => {
  return jest.fn((url: string) => {
    const response = responses[url] || responses['*'] || { error: 'Not found' }
    return createMockFetchResponse(response)
  })
}
