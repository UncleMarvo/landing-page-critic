import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tier } from '@/payments/types';

interface PaymentState {
  loading: boolean;
  error: string | null;
}

interface CheckoutResult {
  success: boolean;
  url?: string;
  error?: string;
}

interface SubscriptionActionResult {
  success: boolean;
  error?: string;
}

export function usePayments() {
  const { user } = useAuth();
  const [state, setState] = useState<PaymentState>({
    loading: false,
    error: null,
  });

  const createCheckoutSession = async (tier: Tier): Promise<CheckoutResult> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setState({ loading: true, error: null });

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }

      return { success: true, url: data.url };
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred';
      setState({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const manageSubscription = async (
    action: 'upgrade' | 'downgrade' | 'cancel' | 'reactivate',
    tier?: Tier,
    cancelAtPeriodEnd?: boolean
  ): Promise<SubscriptionActionResult> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setState({ loading: true, error: null });

    try {
      const body: any = { action };
      if (tier) body.tier = tier;
      if (cancelAtPeriodEnd !== undefined) body.cancelAtPeriodEnd = cancelAtPeriodEnd;

      const response = await fetch('/api/stripe/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Operation failed');
      }

      setState({ loading: false, error: null });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred';
      setState({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const getSubscriptionInfo = async (action: 'subscription' | 'invoices' | 'upcoming-invoice', limit?: number) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setState({ loading: true, error: null });

    try {
      const params = new URLSearchParams({ action });
      if (limit) params.append('limit', limit.toString());

      const response = await fetch(`/api/stripe/manage?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch subscription info');
      }

      setState({ loading: false, error: null });
      return { success: true, data };
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred';
      setState({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    ...state,
    createCheckoutSession,
    manageSubscription,
    getSubscriptionInfo,
    clearError,
  };
}
