import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { getFeatureAccess, canPerformAction } from '@/lib/payments/accessControl';
import { generateCSV, generatePDF, convertToExportData, ExportOptions } from '@/lib/export/exportService';
import { createEmailService } from '@/lib/email/emailService';
import { prisma } from '@/lib/prisma';

// POST /api/export - Generate and export dashboard data
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has Pro tier for export functionality
    const hasAccess = getFeatureAccess(user.tier, 'exportReports');
    if (!hasAccess.hasAccess) {
      return NextResponse.json({ 
        error: 'Export functionality requires Pro tier',
        upgradeRequired: true 
      }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const {
      url,
      format = 'pdf',
      includeAiInsights = false,
      includeHistoricalData = false,
      dateRange,
      sendEmail = false,
      emailAddress
    } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Check usage limits
    const canExport = await canPerformAction(user.id, 'exportReports');
    if (!canExport.allowed) {
      return NextResponse.json({ 
        error: 'Export limit reached',
        limit: canExport.limit,
        used: canExport.used
      }, { status: 429 });
    }

    // Fetch the latest analysis data for the URL
    const historyEntry = await prisma.history.findFirst({
      where: {
        url: url,
        userId: user.id
      },
      orderBy: {
        analyzedAt: 'desc'
      },
      include: {
        details: true
      }
    });

    if (!historyEntry) {
      return NextResponse.json({ error: 'No analysis data found for this URL' }, { status: 404 });
    }

    // Fetch AI insights if requested
    let aiInsights = null;
    if (includeAiInsights) {
      aiInsights = await prisma.aIInsight.findMany({
        where: {
          url: url,
          userId: user.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50
      });
    }

    // Convert data to export format
    const exportData = convertToExportData(
      {
        url: historyEntry.url,
        timestamp: historyEntry.analyzedAt.toISOString(),
        platforms: ['lighthouse'], // Default for now
        metrics: [],
        categories: {
          performance: [],
          accessibility: [],
          seo: [],
          'best-practices': [],
          'web-vitals': []
        },
        scores: {
          performance: historyEntry.performance || 0,
          accessibility: historyEntry.accessibility || 0,
          seo: historyEntry.seo || 0,
          'best-practices': historyEntry.bestPractices || 0
        },
        webVitals: {
          lcp: historyEntry.lcp || undefined,
          fid: historyEntry.fid || undefined,
          cls: historyEntry.cls || undefined,
          tti: historyEntry.tti || undefined,
          si: historyEntry.speedIndex || undefined,
          inp: historyEntry.firstInputDelay || undefined
        }
      },
      aiInsights
    );

    // Generate export based on format
    let exportBuffer: Buffer;
    let fileName: string;
    let contentType: string;

    const exportOptions: ExportOptions = {
      format,
      includeAiInsights,
      includeHistoricalData,
      dateRange,
      title: `Performance Analysis - ${url}`
    };

    if (format === 'csv') {
      const csvContent = generateCSV(exportData, exportOptions);
      exportBuffer = Buffer.from(csvContent, 'utf-8');
      fileName = `performance-analysis-${url.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
      contentType = 'text/csv';
    } else {
      const pdfDoc = generatePDF(exportData, exportOptions);
      exportBuffer = Buffer.from(pdfDoc.output('arraybuffer'));
      fileName = `performance-analysis-${url.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      contentType = 'application/pdf';
    }

    // Send email if requested
    if (sendEmail && emailAddress) {
      const emailService = createEmailService();
      if (emailService) {
        await emailService.sendExportReport(
          emailAddress,
          exportData,
          format,
          exportBuffer,
          fileName
        );
      }
    }

    // Record usage
    await prisma.user.update({
      where: { id: user.id },
      data: {
        exportReportsUsed: {
          increment: 1
        }
      }
    });

    // Return the file for download
    return new NextResponse(exportBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': exportBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate export',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/export - Get export status and limits
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get export feature access
    const hasAccess = getFeatureAccess(user.tier, 'exportReports');
    const canExport = await canPerformAction(user.id, 'exportReports');

    return NextResponse.json({
      hasAccess: hasAccess.hasAccess,
      limit: canExport.limit,
      used: canExport.used,
      remaining: canExport.remaining,
      canExport: canExport.allowed,
      upgradeRequired: !hasAccess.hasAccess
    });

  } catch (error) {
    console.error('Export status error:', error);
    return NextResponse.json({ 
      error: 'Failed to get export status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
