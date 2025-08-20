import { NextRequest, NextResponse } from "next/server";
import { fetchLighthouseResults } from "@/lib/lighthouse";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const lhr = await fetchLighthouseResults(url);

    return NextResponse.json({ url, lhr });
  } catch (error: any) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
