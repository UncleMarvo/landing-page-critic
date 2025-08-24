import { NextRequest, NextResponse } from "next/server";
import { generateAIInsights, validateLLMConfig, type LLMConfig, type InsightRequest } from "@/lib/ai-insights";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      url, 
      webVitals, 
      categories, 
      opportunities, 
      recommendations, 
      accessibility, 
      bestPractices, 
      performanceHistory
    } = body;

    // Validate required fields
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Use default LLM configuration from environment variables
    const llmConfig: LLMConfig = {
      provider: 'openai' as const,
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4o-mini',
      maxTokens: 2000,
      temperature: 0.3,
    };

    // Prepare the insight request
    const insightRequest: InsightRequest = {
      url,
      webVitals: webVitals || [],
      categories: categories || [],
      opportunities: opportunities || [],
      recommendations: recommendations || [],
      accessibility: accessibility || [],
      bestPractices: bestPractices || [],
      performanceHistory: performanceHistory || [],
      platforms: body.platforms || [], // Pass platform information
    };

    // Generate AI insights
    const insights = await generateAIInsights(insightRequest, llmConfig);

    // Store insights in database for tracking
    try {
      await prisma.aIInsight.createMany({
        data: insights.map(insight => ({
          url,
          title: insight.title,
          description: insight.description,
          severity: insight.severity,
          category: insight.category,
          actionable: insight.actionable,
          estimatedImpact: insight.estimatedImpact,
          priority: insight.priority,
          status: insight.status,
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
      url
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
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
    }

    // Get stored insights for the URL
    const storedInsights = await prisma.aIInsight.findMany({
      where: { url },
      orderBy: { createdAt: 'desc' },
      take: 20, // Limit to recent insights
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
    const body = await req.json();
    const { insightId, status } = body;

    if (!insightId || !status) {
      return NextResponse.json({ error: "Insight ID and status are required" }, { status: 400 });
    }

    if (!['pending', 'applied', 'ignored'].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Update insight status
    const updatedInsight = await prisma.aIInsight.update({
      where: { id: insightId },
      data: { 
        status,
        updatedAt: new Date()
      },
    });

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
