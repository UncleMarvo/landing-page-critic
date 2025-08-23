import { NextRequest, NextResponse } from "next/server";
import {
  fetchLighthouseResults,
  extractCategories,
  extractWebVitals,
  extractOpportunities,
  extractRecommendations,
  extractAccessibility,
  extractBestPractices,
  extractSEO,
  extractPerformanceDetails,
} from "@/lib/lighthouse";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "Missing URL" }, { status: 400 });

    const lhr = await fetchLighthouseResults(url);

    if (!lhr) {
      return new Response(
        JSON.stringify({ error: "No Lighthouse results available" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const categories = await extractCategories(lhr);
    const webVitals = await extractWebVitals(lhr);
    const opportunities = await extractOpportunities(lhr.audits);
    const recommendations = await extractRecommendations(lhr.audits);
    const accessibility = await extractAccessibility(lhr);
    const bestPractices = await extractBestPractices(lhr);
    const seo = await extractSEO(lhr);
    const performanceDetails = await extractPerformanceDetails(lhr);

    const performanceScore = Math.round((lhr.categories?.performance?.score || 0) * 100);
    const accessibilityScore = Math.round((lhr.categories?.accessibility?.score || 0) * 100);
    const seoScore = Math.round((lhr.categories?.seo?.score || 0) * 100);
    const bestPracticesScore = Math.round((lhr.categories?.["best-practices"]?.score || 0) * 100);
    const lcp = lhr.audits["largest-contentful-paint"]?.numericValue ?? null;
    const cls = lhr.audits["cumulative-layout-shift"]?.numericValue ?? null;
    const inp = lhr.audits["interaction-to-next-paint"]?.numericValue ?? null;

    // ----- Store in DB -----

    // 1️⃣ Insert flat metrics
    const history = await prisma.history.create({
      data: {
        url,
        performance: performanceScore,
        accessibility: accessibilityScore,
        seo: seoScore, 
        bestPractices: bestPracticesScore,
        cls: cls !== undefined ? Number(cls.toFixed(3)) : null,
        inp: inp ? Math.round(inp) : null,
        lcp: lcp ? Math.round(lcp) : null,
      },
    });

    // 2️⃣ Insert full JSON linked to history entry
    await prisma.historyDetails.create({
      data: {
        historyId: history.id,
        lhr,
      },
    });

    return NextResponse.json({ 
      url,
      analyzedAt: new Date(),
      categories,
      webVitals,
      opportunities,
      recommendations,
      accessibility,
      bestPractices, 
      seo, 
      performanceDetails 
    });

  } catch (error: any) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
