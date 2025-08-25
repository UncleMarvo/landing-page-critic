# Environment Variables Template

Copy this configuration to your `.env` file and update the values as needed.

## Database Configuration
```env
DATABASE_URL="postgresql://username:password@localhost:5432/landing_page_critic"
```

## JWT Authentication
```env
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
```

## App Configuration
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Email Configuration (for email verification and password reset)
```env
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER="your-email@gmail.com"
# SMTP_PASS="your-app-password"
```

## OAuth Configuration (optional)
```env
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"
# GITHUB_CLIENT_ID="your-github-client-id"
# GITHUB_CLIENT_SECRET="your-github-client-secret"
```

## OpenAI (for AI insights)
```env
OPENAI_API_KEY="your-openai-api-key"
```

## PageSpeed Insights API
```env
PAGESPEED_API_KEY="your-pagespeed-api-key"
```

## WebPageTest API
```env
WEBPAGETEST_API_KEY="your-webpagetest-api-key"
```

## Stripe Configuration
```env
STRIPE_SECRET_KEY="sk_test_..." # Your Stripe secret key
STRIPE_PUBLIC_KEY="pk_test_..." # Your Stripe publishable key
STRIPE_WEBHOOK_SECRET="whsec_..." # Webhook endpoint secret
```

## Payment Configuration
```env
CURRENCY="usd" # Currency for all payments (usd, eur, gbp, etc.)
TRIAL_DAYS="7" # Free trial period in days (optional)
```

## Tier Pricing (in cents)
```env
PRO_TIER_PRICE="2900" # $29.00/month
```

## Stripe Price IDs (create these in your Stripe Dashboard)
```env
STRIPE_PRO_PRICE_ID="price_..." # Stripe Price ID for Pro tier
```

## Tier Limits Configuration
```env
FREE_TIER_MONTHLY_ANALYSES="5" # Number of analyses per month for free tier
FREE_TIER_AI_INSIGHTS="3" # Number of AI insights per month for free tier
FREE_TIER_EXPORT_REPORTS="1" # Number of export reports per month for free tier

PRO_TIER_MONTHLY_ANALYSES="-1" # -1 for unlimited analyses
PRO_TIER_AI_INSIGHTS="-1" # -1 for unlimited AI insights
PRO_TIER_EXPORT_REPORTS="-1" # -1 for unlimited export reports
```

## Feature Flags
```env
ENABLE_AI_INSIGHTS="true"
ENABLE_EXPORT_REPORTS="true"
ENABLE_ADVANCED_METRICS="true"
ENABLE_API_ACCESS="true"
ENABLE_TEAM_COLLABORATION="true"
```

## Development/Production
```env
NODE_ENV="development"
DEBUG_STRIPE="false" # Set to true for detailed Stripe logging
```

## Setup Instructions

1. **Copy this template** to a `.env` file in your project root
2. **Update the values** with your actual configuration
3. **Create Stripe products** in your Stripe Dashboard
4. **Set up webhooks** for subscription management
5. **Test the integration** with Stripe test mode first

## Stripe Dashboard Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create a Pro tier product with $29/month pricing
3. Copy the Price ID (starts with `price_`)
4. Set up webhook endpoint for subscription events
5. Copy the webhook secret (starts with `whsec_`)
