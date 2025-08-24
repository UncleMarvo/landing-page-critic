# Quick Setup Guide for AI Insights

## Setup Instructions

1. **Get an OpenAI API Key**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Sign up or log in
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Add to your .env file**
   ```bash
   # Add this line to your .env file
   OPENAI_API_KEY="sk-your-actual-api-key-here"
   ```

3. **Restart your development server**
   ```bash
   npm run dev
   ```

## Testing the Feature

1. **Enter a website URL** in the dashboard
2. **Wait for Lighthouse analysis** to complete
3. **Click "Generate Insights"** in the AI-Powered Insights card
4. **Review the AI-generated suggestions**

## Troubleshooting

### "AI service not configured" error
- Verify your API key is correctly set in .env file
- Ensure the API key has sufficient credits
- Check your internet connection
- Restart your development server after adding the API key

### No insights generated
- Make sure you have website data available (run Lighthouse analysis first)
- Check that the URL is accessible
- Verify your API key has remaining credits

## Cost Information

- OpenAI GPT-4o-mini costs approximately $0.00015 per 1K input tokens
- A typical website analysis uses about 500-1000 tokens
- Estimated cost per analysis: $0.01-0.02 USD

## Next Steps

Once you have the basic setup working, you can:
- Customize the AI model settings
- Export insights to CSV
- Track applied/ignored suggestions
- Configure additional LLM providers (when available)
