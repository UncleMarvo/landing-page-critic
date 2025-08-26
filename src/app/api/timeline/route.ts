import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Get user from token for authentication
    const token = req.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const siteId = searchParams.get("siteId");

    // Build where clause
    let where: any = {
      userId: user.id // Only return data for authenticated user
    };

    if (url) {
      where.url = url;
    }

    if (siteId) {
      where.siteId = siteId;
    }

    if (start || end) {
      where.analyzedAt = {};
      if (start) where.analyzedAt.gte = new Date(start);
      if (end) where.analyzedAt.lte = new Date(end);
    }

    // Fetch historical data with fallback to existing schema
    const history = await prisma.history.findMany({
      where,
      orderBy: { analyzedAt: "asc" },
      include: {
        details: true
      }
    });

    // Transform data for frontend consumption with fallback handling
    const transformedHistory = history.map(entry => ({
      id: entry.id,
      url: entry.url,
      analyzedAt: entry.analyzedAt,
      
      // Category Scores (existing fields)
      categories: {
        performance: entry.performance || 0,
        accessibility: entry.accessibility || 0,
        seo: entry.seo || 0,
        bestPractices: entry.bestPractices || 0
      },
      
      // Web Vitals (existing fields)
      webVitals: {
        lcp: entry.lcp || null,
        cls: entry.cls || null,
        inp: entry.inp || null,
        fcp: entry.fcp || null,
        ttfb: entry.ttfb || null
      },
      
      // Performance Metrics (new fields - may not exist yet)
      performanceMetrics: {
        speedIndex: entry.speedIndex || null,
        totalBlockingTime: entry.totalBlockingTime || null,
        largestContentfulPaint: entry.largestContentfulPaint || null,
        cumulativeLayoutShift: entry.cumulativeLayoutShift || null,
        firstInputDelay: entry.firstInputDelay || null
      },
      
      // Analysis Data (fallback to empty arrays)
      opportunities: [],
      recommendations: [],
      accessibility: [],
      bestPractices: [],
      seo: [],
      performanceDetails: [],
      
      // Platform Information
      platforms: [],
      consolidatedData: null,
      
      // AI Insights (fallback to empty array)
      aiInsights: [],
      
      // Raw Lighthouse data
      lighthouseData: entry.details?.lhr || null
    }));

    return NextResponse.json(transformedHistory);
  } catch (error) {
    console.error('Timeline API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
