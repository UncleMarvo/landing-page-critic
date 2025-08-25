# Stripe Subscription Setup Guide

This guide covers the complete setup for Stripe subscription payments in the Landing Page Critic application.

## Environment Variables

Add the following variables to your `.env` file:

### Required Stripe Keys
```env
# Stripe API Keys (get these from your Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_PUBLIC_KEY=pk_test_... # Your Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook endpoint secret
```

### Payment Configuration
```env
# Payment Settings
CURRENCY=usd # Currency for all payments (usd, eur, gbp, etc.)
TRIAL_DAYS=7 # Free trial period in days (optional)

# Tier Pricing (in cents)
BASIC_TIER_PRICE=999 # $9.99/month
PRO_TIER_PRICE=1999 # $19.99/month

# Stripe Price IDs (create these in your Stripe Dashboard)
BASIC_TIER_STRIPE_PRICE_ID=price_... # Stripe Price ID for Basic tier
PRO_TIER_STRIPE_PRICE_ID=price_... # Stripe Price ID for Pro tier

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000 # Your app URL for webhooks
```

## Stripe Dashboard Setup

### 1. Create Products and Prices

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Products** → **Add Product**
3. Create two products:

#### Basic Tier Product
- **Name**: Basic Plan
- **Price**: $9.99/month
- **Billing**: Recurring
- **Billing period**: Monthly
- **Copy the Price ID** (starts with `price_`)

#### Pro Tier Product
- **Name**: Pro Plan
- **Price**: $19.99/month
- **Billing**: Recurring
- **Billing period**: Monthly
- **Copy the Price ID** (starts with `price_`)

### 2. Configure Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
4. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
5. Click **Add endpoint**
6. **Copy the webhook secret** (starts with `whsec_`)

### 3. Test Mode vs Live Mode

- **Test Mode**: Use test keys for development
- **Live Mode**: Use live keys for production

## Database Schema

The following tables have been added to support subscriptions:

### User Table Extensions
```sql
-- Added to existing User table
tier              String    @default("free")
stripeCustomerId  String?   @unique
stripeSubscriptionId String? @unique
subscriptionStatus String   @default("inactive")
currentPeriodEnd  DateTime?
cancelAtPeriodEnd Boolean   @default(false)
```

### Invoice Table
```sql
model Invoice {
  id                String   @id @default(cuid())
  stripeInvoiceId   String   @unique
  amount            Int
  currency          String   @default("usd")
  status            String
  invoicePdf        String?
  hostedInvoiceUrl  String?
  createdAt         DateTime @default(now())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Feature Access Control

### Tier Features

#### Free Tier
- 3 audits per month
- Basic performance metrics
- Limited AI insights

#### Basic Tier ($9.99/month)
- 25 audits per month
- Full performance metrics
- AI insights
- Export reports
- Priority support

#### Pro Tier ($19.99/month)
- Unlimited audits
- All Basic features
- Advanced analytics
- Custom reports
- API access
- Dedicated support

## API Endpoints

### Checkout
- `POST /api/stripe/checkout` - Create checkout session

### Subscription Management
- `POST /api/stripe/manage` - Upgrade, downgrade, cancel
- `GET /api/stripe/manage` - Get subscription info

### Webhooks
- `POST /api/stripe/webhook` - Handle Stripe events

## Testing

### Test Cards
Use these test card numbers in Stripe Checkout:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### Test Webhooks
1. Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks
2. Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

## Security Considerations

1. **Never store card information** - Stripe handles all payment data
2. **Verify webhook signatures** - All webhooks are validated
3. **Use HTTPS in production** - Required for webhooks
4. **Validate user permissions** - Server-side access control
5. **Handle failed payments** - Graceful degradation

## Troubleshooting

### Common Issues

1. **Webhook signature verification failed**
   - Check webhook secret in `.env`
   - Ensure webhook URL is correct

2. **Price ID not found**
   - Verify price IDs in Stripe Dashboard
   - Check environment variables

3. **Subscription not updating**
   - Check webhook events are configured
   - Verify database connections

4. **Payment fails**
   - Use test cards for development
   - Check Stripe Dashboard for error details

### Debug Mode

Enable debug logging by setting:
```env
DEBUG_STRIPE=true
```

## Production Deployment

1. **Switch to live keys** in production
2. **Update webhook URL** to production domain
3. **Set up monitoring** for webhook failures
4. **Configure error reporting** (Sentry, etc.)
5. **Test payment flows** thoroughly

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)

For application issues:
- Check the application logs
- Verify environment variables
- Test with Stripe test mode first
