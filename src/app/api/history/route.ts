import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/*
export async function GET() {
  const results = await prisma.auditResult.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  return Response.json(results);
}
*/

export async function GET() {
  try {
    const results = await prisma.history.findMany({
      orderBy: { analyzedAt: "desc" },
      take: 5,
      include: {
        details: false, // 👈 include full Lighthouse JSON snapshot if needed
      },
    });

    console.log("*** DEBUG - results: ", JSON.stringify(results, null, 2));

    return NextResponse.json(results);
  } catch (err) {
    console.error("Error fetching history:", err);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}