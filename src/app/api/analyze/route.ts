import { NextRequest, NextResponse } from "next/server";
import { fetchAllPlatformMetrics, consolidateMetrics, convertToLegacyFormat } from "@/lib/platforms/manager";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
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

    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "Missing URL" }, { status: 400 });

    console.log('Analyzing URL:', url);

    // Fetch metrics from all enabled platforms
    const platformData = await fetchAllPlatformMetrics(url);
    console.log('Platform data received:', platformData.map(p => ({ 
      platform: p.platform, 
      error: p.error, 
      metricsCount: p.metrics.length,
      isFallback: p.platform === 'fallback'
    })));
    
    // Check if we have any successful results or fallback data
    const successfulPlatforms = platformData.filter(data => !data.error || data.platform === 'fallback');
    console.log('Successful platforms:', successfulPlatforms.map(p => p.platform));
    
    if (successfulPlatforms.length === 0) {
      console.log('No successful platforms found');
      return NextResponse.json(
        { error: "No performance data available from any platform" },
        { status: 400 }
      );
    }

    // Consolidate metrics from all platforms
    const consolidatedData = consolidateMetrics(platformData);
    console.log('Consolidated data created with platforms:', consolidatedData.platforms);
    
    // Convert to legacy format for existing components
    const legacyData = convertToLegacyFormat(consolidatedData);

    // ----- Store comprehensive data in DB -----

    // 1️⃣ Insert main history record with all metrics
    const history = await prisma.history.create({
      data: {
        url,
        userId: user.id,
        
        // Category Scores
        performance: consolidatedData.scores.performance,
        accessibility: consolidatedData.scores.accessibility,
        seo: consolidatedData.scores.seo, 
        bestPractices: consolidatedData.scores['best-practices'],
        
        // Web Vitals
        lcp: consolidatedData.webVitals.lcp ? Math.round(consolidatedData.webVitals.lcp) : null,
        cls: consolidatedData.webVitals.cls !== undefined ? Number(consolidatedData.webVitals.cls.toFixed(3)) : null,
        inp: consolidatedData.webVitals.inp ? Math.round(consolidatedData.webVitals.inp) : null,
        fcp: consolidatedData.webVitals.fcp ? Math.round(consolidatedData.webVitals.fcp) : null,
        ttfb: consolidatedData.webVitals.ttfb ? Math.round(consolidatedData.webVitals.ttfb) : null,
        
        // Performance Metrics (only if fields exist in schema)
        ...(consolidatedData.performanceMetrics?.speedIndex && { speedIndex: consolidatedData.performanceMetrics.speedIndex }),
        ...(consolidatedData.performanceMetrics?.totalBlockingTime && { totalBlockingTime: consolidatedData.performanceMetrics.totalBlockingTime }),
        ...(consolidatedData.performanceMetrics?.largestContentfulPaint && { largestContentfulPaint: consolidatedData.performanceMetrics.largestContentfulPaint }),
        ...(consolidatedData.performanceMetrics?.cumulativeLayoutShift && { cumulativeLayoutShift: consolidatedData.performanceMetrics.cumulativeLayoutShift }),
        ...(consolidatedData.performanceMetrics?.firstInputDelay && { firstInputDelay: consolidatedData.performanceMetrics.firstInputDelay }),
      },
    });

    // 2️⃣ Insert comprehensive analysis data (only if AnalysisData table exists)
    try {
      await prisma.analysisData.create({
        data: {
          historyId: history.id,
          opportunities: legacyData.opportunities || [],
          recommendations: legacyData.recommendations || [],
          accessibility: legacyData.accessibility || [],
          bestPractices: legacyData.bestPractices || [],
          seo: legacyData.seo || [],
          performanceDetails: legacyData.performanceDetails || [],
          platforms: consolidatedData.platforms || [],
          consolidatedData: JSON.parse(JSON.stringify(consolidatedData)),
        },
      });
    } catch (error) {
      console.log('AnalysisData table may not exist yet, skipping comprehensive data storage:', error);
      // Continue without storing comprehensive data
    }

    // 3️⃣ Insert full JSON linked to history entry (store consolidated data)
    await prisma.historyDetails.create({
      data: {
        historyId: history.id,
        lhr: {
          consolidatedData: JSON.parse(JSON.stringify(consolidatedData)),
          platformData: JSON.parse(JSON.stringify(platformData)),
          platforms: consolidatedData.platforms,
        },
      },
    });

    const response = { 
      url,
      analyzedAt: new Date(),
      platforms: consolidatedData.platforms,
      categories: legacyData.categories,
      webVitals: legacyData.webVitals,
      opportunities: legacyData.opportunities,
      recommendations: legacyData.recommendations,
      accessibility: legacyData.accessibility,
      bestPractices: legacyData.bestPractices,
    };

    // Add fallback indicator if using fallback data
    if (platformData.some(p => p.platform === 'fallback')) {
      response.fallback = true;
      response.message = 'Using fallback data due to platform issues';
    }

    // Check if Web Vitals data is missing and add warning
    if (!response.webVitals || response.webVitals.length === 0) {
      response.webVitalsWarning = true;
      response.webVitalsMessage = 'Web Vitals data could not be collected due to Lighthouse tracing conflicts';
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
