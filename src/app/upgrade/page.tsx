"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePayments } from '@/hooks/usePayments';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  CheckCircle, 
  Zap, 
  BarChart3, 
  Brain, 
  History, 
  FileText, 
  Shield,
  ArrowLeft,
  Star
} from 'lucide-react';
import Link from 'next/link';

export default function UpgradePage() {
  const { user } = useAuth();
  const { createCheckoutSession, loading } = usePayments();
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<'free' | 'pro'>('pro');

  // Get user's current tier (default to 'free' if not available)
  const userTier = (user?.tier as "free" | "pro") || "free";

  const handleUpgrade = async () => {
    if (selectedTier === 'pro') {
      await createCheckoutSession('pro');
    }
  };

  const plans = [
    {
      tier: 'free' as const,
      title: 'Free',
      description: 'Perfect for getting started',
      price: 'Free',
      period: 'forever',
      icon: <BarChart3 className="h-5 w-5" />,
      current: userTier === 'free',
      popular: false,
      features: [
        '5 analyses per month',
        'Basic performance metrics',
        'Web Vitals analysis',
        'Core accessibility checks',
        'Basic SEO insights',
        'Email support'
      ],
      limitations: [
        'Limited to 5 analyses per month',
        'No AI insights',
        'No historical data',
        'No export functionality',
        'No priority support'
      ]
    },
    {
      tier: 'pro' as const,
      title: 'Pro',
      description: 'For professionals and teams',
      price: '$29',
      period: '/month',
      icon: <Crown className="h-5 w-5" />,
      current: userTier === 'pro',
      popular: true,
      features: [
        'Unlimited analyses',
        'AI-powered insights and recommendations',
        'Multi-platform testing (Lighthouse, PageSpeed, WebPageTest)',
        'Extended historical data access',
        'Export reports (PDF/CSV)',
        'Scheduled email reports',
        'Priority support',
        'Advanced performance metrics',
        'Detailed recommendations with implementation steps'
      ],
      limitations: []
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Landing Page Critic</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full potential of Landing Page Critic with our Pro plan. 
            Get unlimited analyses, AI insights, and advanced features.
          </p>
        </div>

        {/* Current Plan Indicator */}
        {userTier === 'pro' && (
          <div className="mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">You're currently on the Pro plan!</span>
              </div>
              <p className="text-green-700">You have access to all premium features.</p>
            </div>
          </div>
        )}

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.tier}
              className={`relative transition-all duration-200 hover:shadow-lg cursor-pointer ${
                plan.current ? 'ring-2 ring-primary' : ''
              } ${plan.popular ? 'border-primary shadow-lg' : ''} ${
                selectedTier === plan.tier ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedTier(plan.tier)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {plan.current && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="secondary" className="px-3 py-1">
                    Current Plan
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-3 rounded-lg ${
                    plan.tier === 'free' ? 'bg-blue-100 text-blue-600' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {plan.icon}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{plan.title}</CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-lg">{plan.period}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Features */}
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    What's included:
                  </h4>
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Limitations for Free tier */}
                {plan.limitations.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Limitations:
                    </h4>
                    <div className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <div className="h-2 w-2 rounded-full bg-red-500"></div>
                          </div>
                          <span className="text-sm text-muted-foreground">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {plan.tier === 'free' ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={plan.current}
                  >
                    {plan.current ? 'Current Plan' : 'Stay on Free'}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleUpgrade}
                    disabled={loading || plan.current}
                    className="w-full btn-primary"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : plan.current ? (
                      'Current Plan'
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Upgrade to Pro
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-muted-foreground">Yes, you can cancel your Pro subscription at any time. You'll continue to have access until the end of your current billing period.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">We accept all major credit cards through our secure Stripe payment processing.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">Yes! You can try our Free plan with 5 analyses per month to see if Landing Page Critic is right for you.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground">We offer a 30-day money-back guarantee. If you're not satisfied, contact our support team for a full refund.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
