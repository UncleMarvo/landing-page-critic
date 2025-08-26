import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ConsolidatedData, PlatformData } from '../platforms/types';

// Export data interface
export interface ExportData {
  url: string;
  analyzedAt: string;
  platforms: string[];
  categories: {
    performance: number;
    accessibility: number;
    seo: number;
    'best-practices': number;
  };
  webVitals: {
    lcp?: number;
    fid?: number;
    cls?: number;
    tti?: number;
    si?: number;
    inp?: number;
  };
  opportunities: Array<{
    id: string;
    title: string;
    description?: string;
    value?: number;
    unit?: string;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    description?: string;
  }>;
  accessibility: Array<{
    id: string;
    title: string;
    description?: string;
    score?: number;
  }>;
  bestPractices: Array<{
    id: string;
    title: string;
    description?: string;
    score?: number;
  }>;
  aiInsights?: Array<{
    title: string;
    description: string;
    severity: string;
    category: string;
    priority: number;
    status: string;
  }>;
}

// Export options interface
export interface ExportOptions {
  format: 'csv' | 'pdf';
  includeAiInsights?: boolean;
  includeHistoricalData?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  title?: string;
}

// Generate CSV export
export function generateCSV(data: ExportData, options: ExportOptions): string {
  const csvRows: string[] = [];
  
  // Header
  csvRows.push('Landing Page Critic - Performance Analysis Report');
  csvRows.push(`URL: ${data.url}`);
  csvRows.push(`Analyzed: ${new Date(data.analyzedAt).toLocaleString()}`);
  csvRows.push(`Platforms: ${data.platforms.join(', ')}`);
  csvRows.push(''); // Empty row for spacing
  
  // Category Scores
  csvRows.push('Category Scores');
  csvRows.push('Category,Score');
  Object.entries(data.categories).forEach(([category, score]) => {
    csvRows.push(`${category.charAt(0).toUpperCase() + category.slice(1)},${score}`);
  });
  csvRows.push('');
  
  // Web Vitals
  csvRows.push('Web Vitals');
  csvRows.push('Metric,Value,Unit');
  Object.entries(data.webVitals).forEach(([metric, value]) => {
    if (value !== undefined) {
      const metricName = metric.toUpperCase();
      const unit = metric === 'cls' ? '' : 'ms';
      csvRows.push(`${metricName},${value},${unit}`);
    }
  });
  csvRows.push('');
  
  // Opportunities
  if (data.opportunities.length > 0) {
    csvRows.push('Performance Opportunities');
    csvRows.push('Title,Description,Potential Savings,Unit');
    data.opportunities.forEach(opp => {
      csvRows.push(`"${opp.title}","${opp.description || ''}",${opp.value || ''},${opp.unit || ''}`);
    });
    csvRows.push('');
  }
  
  // Recommendations
  if (data.recommendations.length > 0) {
    csvRows.push('Recommendations');
    csvRows.push('Title,Description');
    data.recommendations.forEach(rec => {
      csvRows.push(`"${rec.title}","${rec.description || ''}"`);
    });
    csvRows.push('');
  }
  
  // Accessibility Issues
  if (data.accessibility.length > 0) {
    csvRows.push('Accessibility Issues');
    csvRows.push('Title,Description,Score');
    data.accessibility.forEach(issue => {
      csvRows.push(`"${issue.title}","${issue.description || ''}",${issue.score || ''}`);
    });
    csvRows.push('');
  }
  
  // Best Practices Issues
  if (data.bestPractices.length > 0) {
    csvRows.push('Best Practices Issues');
    csvRows.push('Title,Description,Score');
    data.bestPractices.forEach(issue => {
      csvRows.push(`"${issue.title}","${issue.description || ''}",${issue.score || ''}`);
    });
    csvRows.push('');
  }
  
  // AI Insights (if included)
  if (options.includeAiInsights && data.aiInsights && data.aiInsights.length > 0) {
    csvRows.push('AI Insights');
    csvRows.push('Title,Description,Severity,Category,Priority,Status');
    data.aiInsights.forEach(insight => {
      csvRows.push(`"${insight.title}","${insight.description}",${insight.severity},${insight.category},${insight.priority},${insight.status}`);
    });
    csvRows.push('');
  }
  
  return csvRows.join('\n');
}

// Generate PDF export
export function generatePDF(data: ExportData, options: ExportOptions): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 20;
  
  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * (fontSize * 0.4); // Return height used
  };
  
  // Helper function to add section header
  const addSectionHeader = (title: string, y: number) => {
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(title, margin, y);
    doc.setFont(undefined, 'normal');
    return y + 10;
  };
  
  // Title
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('Landing Page Critic', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;
  
  doc.setFontSize(16);
  doc.text('Performance Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;
  
  // Basic Information
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  yPosition = addWrappedText(`URL: ${data.url}`, margin, yPosition, pageWidth - 2 * margin);
  yPosition += 5;
  yPosition = addWrappedText(`Analyzed: ${new Date(data.analyzedAt).toLocaleString()}`, margin, yPosition, pageWidth - 2 * margin);
  yPosition += 5;
  yPosition = addWrappedText(`Platforms: ${data.platforms.join(', ')}`, margin, yPosition, pageWidth - 2 * margin);
  yPosition += 15;
  
  // Category Scores
  yPosition = addSectionHeader('Category Scores', yPosition);
  const categoryData = Object.entries(data.categories).map(([category, score]) => [
    category.charAt(0).toUpperCase() + category.slice(1),
    `${score}/100`
  ]);
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Category', 'Score']],
    body: categoryData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: margin, right: margin }
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 10;
  
  // Web Vitals
  yPosition = addSectionHeader('Web Vitals', yPosition);
  const webVitalsData = Object.entries(data.webVitals)
    .filter(([_, value]) => value !== undefined)
    .map(([metric, value]) => [
      metric.toUpperCase(),
      `${value}${metric === 'cls' ? '' : 'ms'}`
    ]);
  
  if (webVitalsData.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: webVitalsData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Opportunities
  if (data.opportunities.length > 0) {
    yPosition = addSectionHeader('Performance Opportunities', yPosition);
    const opportunitiesData = data.opportunities.map(opp => [
      opp.title,
      opp.description || '',
      opp.value ? `${opp.value}${opp.unit || ''}` : ''
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Opportunity', 'Description', 'Potential Savings']],
      body: opportunitiesData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin },
      columnStyles: {
        1: { cellWidth: 60 },
        2: { cellWidth: 30 }
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Recommendations
  if (data.recommendations.length > 0) {
    yPosition = addSectionHeader('Recommendations', yPosition);
    const recommendationsData = data.recommendations.map(rec => [
      rec.title,
      rec.description || ''
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Recommendation', 'Description']],
      body: recommendationsData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin },
      columnStyles: {
        1: { cellWidth: 80 }
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Accessibility Issues
  if (data.accessibility.length > 0) {
    yPosition = addSectionHeader('Accessibility Issues', yPosition);
    const accessibilityData = data.accessibility.map(issue => [
      issue.title,
      issue.description || '',
      issue.score ? `${Math.round(issue.score * 100)}%` : ''
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Issue', 'Description', 'Score']],
      body: accessibilityData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin },
      columnStyles: {
        1: { cellWidth: 60 },
        2: { cellWidth: 20 }
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Best Practices Issues
  if (data.bestPractices.length > 0) {
    yPosition = addSectionHeader('Best Practices Issues', yPosition);
    const bestPracticesData = data.bestPractices.map(issue => [
      issue.title,
      issue.description || '',
      issue.score ? `${Math.round(issue.score * 100)}%` : ''
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Issue', 'Description', 'Score']],
      body: bestPracticesData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin },
      columnStyles: {
        1: { cellWidth: 60 },
        2: { cellWidth: 20 }
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // AI Insights (if included)
  if (options.includeAiInsights && data.aiInsights && data.aiInsights.length > 0) {
    yPosition = addSectionHeader('AI Insights', yPosition);
    const aiInsightsData = data.aiInsights.map(insight => [
      insight.title,
      insight.severity,
      insight.category,
      insight.priority.toString(),
      insight.status
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Insight', 'Severity', 'Category', 'Priority', 'Status']],
      body: aiInsightsData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 20 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 }
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Footer
  const footerY = doc.internal.pageSize.height - 20;
  doc.setFontSize(10);
  doc.text('Generated by Landing Page Critic', pageWidth / 2, footerY, { align: 'center' });
  
  return doc;
}

// Convert consolidated data to export format
export function convertToExportData(consolidatedData: ConsolidatedData, aiInsights?: any[]): ExportData {
  return {
    url: consolidatedData.url,
    analyzedAt: consolidatedData.timestamp,
    platforms: consolidatedData.platforms,
    categories: consolidatedData.scores,
    webVitals: consolidatedData.webVitals,
    opportunities: consolidatedData.categories.performance
      .filter(m => m.value !== undefined)
      .map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        value: m.value,
        unit: m.unit
      })),
    recommendations: consolidatedData.categories.performance
      .map(m => ({
        id: m.id,
        title: m.title,
        description: m.description
      })),
    accessibility: consolidatedData.categories.accessibility
      .map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        score: m.score
      })),
    bestPractices: consolidatedData.categories['best-practices']
      .map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        score: m.score
      })),
    aiInsights: aiInsights?.map(insight => ({
      title: insight.title,
      description: insight.description,
      severity: insight.severity,
      category: insight.category,
      priority: insight.priority,
      status: insight.status
    }))
  };
}
