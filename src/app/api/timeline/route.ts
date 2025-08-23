// src/app/api/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  let where: any = {};
  if (start || end) {
    where.analyzedAt = {};
    if (start) where.analyzedAt.gte = new Date(start);
    if (end) where.analyzedAt.lte = new Date(end);
  }

  const history = await prisma.history.findMany({
    where,
    orderBy: { analyzedAt: "asc" },
    select: {
      analyzedAt: true,
      performance: true,
      accessibility: true,
      seo: true,
      bestPractices: true,
      lcp: true,
      cls: true,
      inp: true,
    },
  });

  return NextResponse.json(history);
}
