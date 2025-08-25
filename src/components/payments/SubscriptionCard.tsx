import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { usePayments } from '@/hooks/usePayments';
import { getTierConfig, getTierDisplayName, formatPrice } from '@/payments/config';
import { Tier, Subscription } from '@/payments/types';
import { Crown, CheckCircle, AlertCircle, CreditCard, Star, Zap, Shield } from 'lucide-react';

interface SubscriptionCardProps {
  className?: string;
}

export default function SubscriptionCard({ className }: SubscriptionCardProps) {
  const { user } = useAuth();
  const { loading, error, manageSubscription, clearError } = usePayments();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;
    
    setSubscriptionLoading(true);
    try {
      // Fetch subscription from API endpoint
      const response = await fetch('/api/subscription', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.subscription) {
        setSubscription(data.subscription);
      } else {
        // Fallback to free tier if no subscription found
        setSubscription({
          id: 'free',
          userId: user.id,
          tier: 'free',
          subscriptionStatus: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
      // Fallback to free tier if there's an error
      setSubscription({
        id: 'free',
        userId: user.id,
        tier: 'free',
        subscriptionStatus: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleUpgrade = async (newTier: Tier) => {
    if (!subscription?.stripeSubscriptionId) {
      // Create new subscription
      // This would redirect to Stripe Checkout
      console.log('Upgrading to:', newTier);
      return;
    }

    const result = await manageSubscription('upgrade', newTier);
    if (result.success) {
      await loadSubscription();
    }
  };

  const handleDowngrade = async (newTier: Tier) => {
    if (!subscription?.stripeSubscriptionId) return;

    const result = await manageSubscription('downgrade', newTier);
    if (result.success) {
      await loadSubscription();
    }
  };

  const handleCancel = async () => {
    if (!subscription?.stripeSubscriptionId) return;

    const result = await manageSubscription('cancel');
    if (result.success) {
      await loadSubscription();
    }
  };

  const handleReactivate = async () => {
    if (!subscription?.stripeSubscriptionId) return;

    const result = await manageSubscription('reactivate');
    if (result.success) {
      await loadSubscription();
    }
  };

  if (subscriptionLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-primary" />
            <span>Subscription Plans</span>
          </CardTitle>
          <CardDescription>Loading subscription details...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="loading-spinner h-8 w-8 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTier = subscription?.tier || 'free';

  const plans = [
    {
      tier: 'free' as Tier,
      icon: <CheckCircle className="h-6 w-6" />,
      title: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        '5 analyses per month',
        'Basic performance metrics',
        'Web Vitals analysis',
        'Email support'
      ],
      current: currentTier === 'free',
      popular: false,
      action: null
    },
    {
      tier: 'pro' as Tier,
      icon: <Zap className="h-6 w-6" />,
      title: 'Pro',
      price: '$29',
      period: '/month',
      description: 'For serious developers and teams',
      features: [
        'Unlimited analyses',
        'Advanced performance metrics',
        'AI-powered insights',
        'Priority support',
        'Custom reports',
        'Team collaboration (up to 5)'
      ],
      current: currentTier === 'pro',
      popular: true,
      action: currentTier === 'free' ? 'upgrade' : currentTier === 'enterprise' ? 'downgrade' : null
    },
    {
      tier: 'enterprise' as Tier,
      icon: <Shield className="h-6 w-6" />,
      title: 'Enterprise',
      price: '$99',
      period: '/month',
      description: 'For large organizations',
      features: [
        'Everything in Pro',
        'Unlimited team members',
        'Advanced analytics',
        'API access',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantees'
      ],
      current: currentTier === 'enterprise',
      popular: false,
      action: currentTier !== 'enterprise' ? 'upgrade' : null
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Crown className="h-5 w-5 text-primary" />
          <span>Subscription Plans</span>
        </CardTitle>
        <CardDescription>
          Choose the plan that fits your needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card 
              key={plan.tier}
              className={`relative transition-all duration-200 hover:shadow-md ${
                plan.current ? 'ring-2 ring-primary' : ''
              } ${plan.popular ? 'border-primary' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${
                      plan.tier === 'free' ? 'bg-success/10 text-success' :
                      plan.tier === 'pro' ? 'bg-primary/10 text-primary' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {plan.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{plan.title}</CardTitle>
                      <CardDescription className="text-sm">{plan.description}</CardDescription>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Features List */}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                {plan.action && (
                  <Button 
                    onClick={() => {
                      if (plan.action === 'upgrade') {
                        handleUpgrade(plan.tier);
                      } else if (plan.action === 'downgrade') {
                        handleDowngrade(plan.tier);
                      }
                    }}
                    className={`w-full ${
                      plan.popular ? 'btn-primary' : 'btn-secondary'
                    }`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner h-4 w-4 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : plan.action === 'upgrade' ? (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Upgrade to {plan.title}
                      </>
                    ) : (
                      <>
                        <Crown className="mr-2 h-4 w-4" />
                        Downgrade to {plan.title}
                      </>
                    )}
                  </Button>
                )}

                {/* Current Plan Indicator */}
                {plan.current && (
                  <div className="mt-3 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Current Plan
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <h4 className="text-sm font-medium text-foreground">Current Subscription</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className="ml-2 font-medium capitalize">
                  {subscription.subscriptionStatus}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Next Billing:</span>
                <span className="ml-2 font-medium">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            {/* Cancel/Reactivate Actions */}
            {currentTier !== 'free' && (
              <div className="flex space-x-2 mt-3">
                {subscription.cancelAtPeriodEnd ? (
                  <Button 
                    onClick={handleReactivate}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    Reactivate Subscription
                  </Button>
                ) : (
                  <Button 
                    onClick={handleCancel}
                    variant="destructive"
                    size="sm"
                    disabled={loading}
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-sm text-error">{error}</p>
            <Button 
              onClick={clearError}
              variant="ghost"
              size="sm"
              className="mt-2"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Stripe Not Configured Notice */}
        {!process.env.STRIPE_SECRET_KEY && (
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-sm text-warning">
              Stripe is not configured. Subscription management is disabled.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
