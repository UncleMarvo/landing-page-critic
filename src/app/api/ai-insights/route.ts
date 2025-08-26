import { NextRequest, NextResponse } from "next/server";
import { generateAIInsights, validateLLMConfig, type LLMConfig, type InsightRequest } from "@/lib/ai-insights";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const token = req.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      url, 
      webVitals, 
      categories, 
      opportunities, 
      recommendations, 
      accessibility, 
      bestPractices, 
      performanceHistory,
      platforms
    } = body;

    // Validate required fields
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Fetch historical context for enhanced insights
    const historicalContext = await getHistoricalContext(url, user.id);

    // Use default LLM configuration from environment variables
    const llmConfig: LLMConfig = {
      provider: 'openai' as const,
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4o-mini',
      maxTokens: 3000,
      temperature: 0.3,
    };

    // Prepare the enhanced insight request
    const insightRequest: InsightRequest = {
      url,
      webVitals: webVitals || [],
      categories: categories || [],
      opportunities: opportunities || [],
      recommendations: recommendations || [],
      accessibility: accessibility || [],
      bestPractices: bestPractices || [],
      performanceHistory: performanceHistory || [],
      platforms: platforms || [],
      // Enhanced historical context
      previousInsights: historicalContext.previousInsights,
      userActions: historicalContext.userActions,
      siteHistory: historicalContext.siteHistory,
    };

    // Generate AI insights with historical context
    const insights = await generateAIInsights(insightRequest, llmConfig);

    // Store insights in database with enhanced tracking
    try {
      await prisma.aIInsight.createMany({
        data: insights.map(insight => ({
          url,
          userId: user.id,
          title: insight.title,
          description: insight.description,
          severity: insight.severity,
          category: insight.category,
          actionable: insight.actionable,
          estimatedImpact: insight.estimatedImpact,
          priority: insight.priority,
          status: insight.status,
          // Store enhanced fields as JSON
          historicalContext: insight.historicalContext,
          platformSpecific: insight.platformSpecific,
          platforms: insight.platforms,
          implementationSteps: insight.implementationSteps,
          expectedTimeline: insight.expectedTimeline,
          costBenefit: insight.costBenefit,
        })),
        skipDuplicates: true, // Skip if already exists
      });
    } catch (dbError) {
      console.error('Error storing insights in database:', dbError);
      // Continue even if database storage fails
    }

    return NextResponse.json({ 
      success: true,
      insights,
      generatedAt: new Date().toISOString(),
      url,
      historicalContext: {
        previousInsightsCount: historicalContext.previousInsights.length,
        userActionsCount: historicalContext.userActions.length,
        siteHistoryCount: historicalContext.siteHistory.length,
      }
    });

  } catch (error: any) {
    console.error("AI Insights API error:", error);
    
    // Handle specific AI service errors
    if (error.message.includes('API key not configured')) {
      return NextResponse.json({ 
        error: "AI service not configured. Please check your API keys in environment variables.",
        details: error.message 
      }, { status: 400 });
    }
    
    if (error.message.includes('not yet implemented')) {
      return NextResponse.json({ 
        error: "Selected AI provider not yet implemented. Please use OpenAI.",
        details: error.message 
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate AI insights" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const token = req.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
    }

    // Get stored insights for the URL with user filtering
    const storedInsights = await prisma.aIInsight.findMany({
      where: { 
        url,
        userId: user.id // Only return user's insights
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Increased limit for better historical context
    });

    return NextResponse.json({ 
      insights: storedInsights,
      url,
      count: storedInsights.length
    });

  } catch (error: any) {
    console.error("AI Insights GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve AI insights" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Get authenticated user
    const token = req.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { insightId, status, impact } = body;

    if (!insightId || !status) {
      return NextResponse.json({ error: "Insight ID and status are required" }, { status: 400 });
    }

    if (!['pending', 'applied', 'ignored'].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Update insight status and track user action
    const updatedInsight = await prisma.aIInsight.update({
      where: { 
        id: insightId,
        userId: user.id // Ensure user owns the insight
      },
      data: { 
        status,
        updatedAt: new Date()
      },
    });

    // Store user action for historical context
    try {
      await prisma.userAction.create({
        data: {
          userId: user.id,
          insightId: insightId,
          action: status,
          impact: impact || null,
          url: updatedInsight.url,
        }
      });
    } catch (actionError) {
      console.error('Error storing user action:', actionError);
      // Continue even if action tracking fails
    }

    return NextResponse.json({ 
      success: true,
      insight: updatedInsight
    });

  } catch (error: any) {
    console.error("AI Insights PUT error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update insight status" },
      { status: 500 }
    );
  }
}

/**
 * Get historical context for enhanced AI insights
 */
async function getHistoricalContext(url: string, userId: string) {
  try {
    // Get previous insights for this URL
    const previousInsights = await prisma.aIInsight.findMany({
      where: { 
        url,
        userId,
        createdAt: { lt: new Date() } // Exclude current session
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Get user actions on insights
    const userActions = await prisma.userAction.findMany({
      where: { 
        userId,
        url,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Get site performance history
    const siteHistory = await prisma.history.findMany({
      where: { 
        url,
        userId,
      },
      select: {
        analyzedAt: true,
        performance: true,
        accessibility: true,
        seo: true,
        bestPractices: true,
      },
      orderBy: { analyzedAt: 'asc' },
      take: 20,
    });

    return {
      previousInsights: previousInsights.map(insight => ({
        id: insight.id,
        title: insight.title,
        description: insight.description,
        severity: insight.severity as 'High' | 'Medium' | 'Low',
        category: insight.category as 'Performance' | 'Accessibility' | 'SEO' | 'Best Practices' | 'Web Vitals',
        actionable: insight.actionable,
        estimatedImpact: insight.estimatedImpact,
        priority: insight.priority,
        status: insight.status as 'pending' | 'applied' | 'ignored',
        createdAt: insight.createdAt,
      })),
      userActions: userActions.map(action => ({
        insightId: action.insightId,
        action: action.action as 'applied' | 'ignored',
        date: action.createdAt,
        impact: action.impact,
      })),
      siteHistory: siteHistory.map(entry => ({
        date: entry.analyzedAt,
        performance: entry.performance,
        accessibility: entry.accessibility,
        seo: entry.seo,
        bestPractices: entry.bestPractices,
      })),
    };
  } catch (error) {
    console.error('Error fetching historical context:', error);
    return {
      previousInsights: [],
      userActions: [],
      siteHistory: [],
    };
  }
}
