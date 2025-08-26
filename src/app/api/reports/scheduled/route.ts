import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { getFeatureAccess, canPerformAction } from '@/lib/payments/accessControl';
import { createEmailService } from '@/lib/email/emailService';
import { prisma } from '@/lib/prisma';
import { subDays, startOfWeek, endOfWeek, format } from 'date-fns';

// POST /api/reports/scheduled - Configure scheduled reports
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has Pro tier for scheduled reports
    const hasAccess = getFeatureAccess(user.tier, 'scheduledReports');
    if (!hasAccess.hasAccess) {
      return NextResponse.json({ 
        error: 'Scheduled reports require Pro tier',
        upgradeRequired: true 
      }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const {
      enabled = false,
      frequency = 'weekly', // 'weekly' | 'monthly'
      emailAddress,
      urls = [] // Array of URLs to include in reports
    } = body;

    if (enabled && !emailAddress) {
      return NextResponse.json({ error: 'Email address is required when enabling scheduled reports' }, { status: 400 });
    }

    // Update user's scheduled report preferences
    await prisma.user.update({
      where: { id: user.id },
      data: {
        scheduledReportsEnabled: enabled,
        scheduledReportsFrequency: frequency,
        scheduledReportsEmail: emailAddress,
        scheduledReportsUrls: urls
      }
    });

    return NextResponse.json({ 
      success: true,
      message: enabled ? 'Scheduled reports enabled' : 'Scheduled reports disabled'
    });

  } catch (error) {
    console.error('Scheduled reports configuration error:', error);
    return NextResponse.json({ 
      error: 'Failed to configure scheduled reports',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/reports/scheduled - Get scheduled report configuration
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get scheduled report feature access
    const hasAccess = getFeatureAccess(user.tier, 'scheduledReports');

    return NextResponse.json({
      hasAccess: hasAccess.hasAccess,
      enabled: user.scheduledReportsEnabled || false,
      frequency: user.scheduledReportsFrequency || 'weekly',
      emailAddress: user.scheduledReportsEmail || '',
      urls: user.scheduledReportsUrls || [],
      upgradeRequired: !hasAccess.hasAccess
    });

  } catch (error) {
    console.error('Scheduled reports status error:', error);
    return NextResponse.json({ 
      error: 'Failed to get scheduled reports status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/reports/scheduled - Trigger manual report generation
export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has Pro tier
    const hasAccess = getFeatureAccess(user.tier, 'scheduledReports');
    if (!hasAccess.hasAccess) {
      return NextResponse.json({ 
        error: 'Scheduled reports require Pro tier',
        upgradeRequired: true 
      }, { status: 403 });
    }

    // Check usage limits
    const canGenerate = await canPerformAction(user.id, 'scheduledReports');
    if (!canGenerate.allowed) {
      return NextResponse.json({ 
        error: 'Scheduled report limit reached',
        limit: canGenerate.limit,
        used: canGenerate.used
      }, { status: 429 });
    }

    // Parse request body
    const body = await request.json();
    const { dateRange } = body;

    // Get user's configured URLs or all their analyzed URLs
    const urls = user.scheduledReportsUrls?.length > 0 
      ? user.scheduledReportsUrls 
      : await prisma.history.findMany({
          where: { userId: user.id },
          select: { url: true },
          distinct: ['url']
        }).then(results => results.map(r => r.url));

    if (urls.length === 0) {
      return NextResponse.json({ error: 'No URLs found for report generation' }, { status: 400 });
    }

    // Generate report data for the specified date range
    const startDate = dateRange?.start ? new Date(dateRange.start) : startOfWeek(subDays(new Date(), 7));
    const endDate = dateRange?.end ? new Date(dateRange.end) : endOfWeek(new Date());

    const reportData = await generateScheduledReportData(user.id, urls, startDate, endDate);

    // Send email report
    const emailService = createEmailService();
    if (emailService && user.scheduledReportsEmail) {
      const success = await emailService.sendScheduledReport(
        user.scheduledReportsEmail,
        {
          url: urls.join(', '),
          dateRange: {
            start: format(startDate, 'yyyy-MM-dd'),
            end: format(endDate, 'yyyy-MM-dd')
          },
          summary: reportData.summary
        }
      );

      if (success) {
        // Record usage
        await prisma.user.update({
          where: { id: user.id },
          data: {
            scheduledReportsUsed: {
              increment: 1
            }
          }
        });

        return NextResponse.json({ 
          success: true,
          message: 'Scheduled report sent successfully'
        });
      } else {
        return NextResponse.json({ error: 'Failed to send scheduled report email' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

  } catch (error) {
    console.error('Manual scheduled report error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate scheduled report',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to generate scheduled report data
async function generateScheduledReportData(userId: string, urls: string[], startDate: Date, endDate: Date) {
  // Get analysis data for the specified date range
  const analyses = await prisma.history.findMany({
    where: {
      userId,
      url: { in: urls },
      analyzedAt: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { analyzedAt: 'desc' }
  });

  // Calculate summary statistics
  const totalAnalyses = analyses.length;
  const averagePerformance = analyses.length > 0 
    ? analyses.reduce((sum, analysis) => sum + (analysis.performance || 0), 0) / analyses.length 
    : 0;

  // Get top issues from AI insights
  const topIssues = await prisma.aIInsight.findMany({
    where: {
      userId,
      url: { in: urls },
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: { title: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  return {
    summary: {
      totalAnalyses,
      averagePerformance: Math.round(averagePerformance),
      topIssues: topIssues.map(insight => insight.title)
    },
    analyses
  };
}
