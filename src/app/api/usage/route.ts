import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current billing period (monthly)
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get usage statistics for the current period
    const [auditResults, aiInsights, exportReports] = await Promise.all([
      // Count audit results
      prisma.auditResult.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: periodStart,
            lte: periodEnd,
          },
        },
      }),
      // Count AI insights
      prisma.aIInsight.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: periodStart,
            lte: periodEnd,
          },
        },
      }),
      // For now, we'll count export reports as 0 since we don't have a separate table
      // In a real implementation, you might want to track exports separately
      Promise.resolve(0),
    ]);

    const usage = {
      auditResults,
      aiInsights,
      exportReports,
      periodStart,
      periodEnd,
    };

    return NextResponse.json(usage);
  } catch (error) {
    console.error('Error fetching usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}
