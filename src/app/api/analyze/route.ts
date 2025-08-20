import { NextRequest, NextResponse } from "next/server";
import {
  fetchLighthouseResults,
  extractWebVitals,
  extractOpportunities,
  extractRecommendations,
  extractAccessibility,
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

    const categories = lhr.categories;
    const webVitals = await extractWebVitals(lhr);
    const opportunities = await extractOpportunities(lhr.audits);
    const recommendations = await extractRecommendations(lhr.audits);
    const accessibility = await extractAccessibility(lhr);

    const performanceScore = Math.round((categories.performance?.score || 0) * 100);
    const accessibilityScore = Math.round((categories.accessibility?.score || 0) * 100);
    const seoScore = Math.round((categories.seo?.score || 0) * 100);
    const bestPracticesScore = Math.round((categories["best-practices"]?.score || 0) * 100);

    // ----- Store in DB -----

    // 1️⃣ Insert flat metrics
    const history = await prisma.history.create({
      data: {
        url,
        performance: performanceScore,
        accessibility: accessibilityScore,
        seo: seoScore, 
        bestPractices: bestPracticesScore,
      },
    });

    // 2️⃣ Insert full JSON linked to history entry
    await prisma.historyDetails.create({
      data: {
        historyId: history.id,
        lhr,
      },
    });

    return NextResponse.json({ url, lhr });

  } catch (error: any) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
