# AI-Powered Insights Feature

This feature provides AI-driven analysis and actionable suggestions for website improvements using various LLM providers.

## Features

- **Multi-LLM Support**: OpenAI (GPT-4), Anthropic (Claude), Google (Gemini), and Local models
- **Smart Caching**: Avoids duplicate AI calls for the same dataset
- **Severity Levels**: High, Medium, Low priority insights
- **Status Tracking**: Track applied/ignored suggestions
- **Export Options**: Export insights to CSV
- **Responsive Design**: Works on all device sizes
- **Graceful Error Handling**: Handles missing or partial data

## Setup

### 1. Environment Variables

Add the following to your `.env` file:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/landing_page_critic"

# AI Service API Keys
# Choose one or more providers:

# OpenAI (GPT-4) - Currently implemented
OPENAI_API_KEY="sk-your-openai-api-key-here"

# Anthropic (Claude) - Not yet implemented
ANTHROPIC_API_KEY="sk-ant-your-anthropic-api-key-here"

# Google Gemini - Not yet implemented  
GEMINI_API_KEY="your-gemini-api-key-here"

# AI Configuration (Optional - defaults will be used if not set)
AI_MODEL="gpt-4o-mini"
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.3
```

### 2. Database Migration

The AI insights feature requires a new database table. Run the migration:

```bash
npx prisma migrate dev --name add_ai_insights_table
```

### 3. Dependencies

The following dependencies are already included in the project:
- `openai` - For OpenAI API integration
- `@prisma/client` - For database operations

## Usage

### 1. Generate Insights

1. Navigate to the dashboard
2. Enter a URL to analyze
3. Click "Generate Insights" in the AI-Powered Insights card
4. Wait for the AI to analyze your website metrics
5. Review the generated insights

### 2. Configure AI Settings

1. Click the "Config" button in the AI Insights card
2. Select your preferred LLM provider
3. Configure model settings (currently only OpenAI is fully implemented)
4. Save your configuration

### 3. Manage Insights

- **View Insights**: All insights are displayed with severity levels and categories
- **Mark as Applied**: Click "Applied" to track implemented suggestions
- **Ignore Insights**: Click "Ignore" to dismiss irrelevant suggestions
- **Export Data**: Click "Export CSV" to download insights for external analysis

## Insight Categories

The AI generates insights in the following categories:

- **Performance**: Speed and loading optimizations
- **Accessibility**: WCAG compliance and usability
- **SEO**: Search engine optimization
- **Best Practices**: Web development standards
- **Web Vitals**: Core Web Vitals metrics

## Severity Levels

- **High**: Critical issues that significantly impact user experience
- **Medium**: Important issues that should be addressed
- **Low**: Minor optimizations and suggestions

## API Endpoints

### POST /api/ai-insights
Generate new AI insights for a website.

**Request Body:**
```json
{
  "url": "https://example.com",
  "webVitals": [...],
  "categories": [...],
  "opportunities": [...],
  "recommendations": [...],
  "accessibility": [...],
  "bestPractices": [...],
  "performanceHistory": [...],
  "llmConfig": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "maxTokens": 2000,
    "temperature": 0.3
  }
}
```

### GET /api/ai-insights?url={url}
Retrieve stored insights for a specific URL.

### PUT /api/ai-insights
Update insight status (applied/ignored).

**Request Body:**
```json
{
  "insightId": "insight-id",
  "status": "applied"
}
```

## Caching

The system includes intelligent caching to avoid duplicate AI calls:
- Cache key is based on URL and data hash
- Cache stores last 10 analysis results
- Cache is cleared automatically when full

## Error Handling

The system gracefully handles:
- Missing API keys
- Network errors
- Invalid data
- Unsupported LLM providers
- Database connection issues

## Future Enhancements

- [ ] Anthropic Claude integration
- [ ] Google Gemini integration
- [ ] Local model support
- [ ] PDF export functionality
- [ ] Insight history and trends
- [ ] Custom prompt templates
- [ ] Batch analysis for multiple URLs

## Troubleshooting

### Common Issues

1. **"AI service not configured"**
   - Check that your API key is set in `.env`
   - Verify the API key is valid and has sufficient credits

2. **"Selected AI provider not yet implemented"**
   - Currently only OpenAI is fully implemented
   - Use OpenAI or wait for other providers

3. **"Failed to generate insights"**
   - Check network connectivity
   - Verify API rate limits
   - Ensure sufficient data is available for analysis

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=ai-insights
```

## Contributing

To add support for additional LLM providers:

1. Update the `generateInsightsWith[Provider]` function in `src/lib/ai-insights.ts`
2. Add the provider to the `getAvailableProviders` function
3. Update the validation logic
4. Test with the new provider

## License

This feature is part of the Landing Page Critic project.
