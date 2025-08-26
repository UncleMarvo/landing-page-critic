import nodemailer from 'nodemailer';
import { ExportData } from '../export/exportService';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email template interface
interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Email service class
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(config: EmailConfig) {
    this.transporter = nodemailer.createTransporter(config);
  }

  // Send export report email
  async sendExportReport(
    to: string,
    exportData: ExportData,
    format: 'csv' | 'pdf',
    attachmentBuffer?: Buffer,
    attachmentName?: string
  ): Promise<boolean> {
    try {
      const template = this.generateExportReportTemplate(exportData, format);
      
      const mailOptions = {
        from: process.env.SMTP_USER || 'noreply@landingpagecritic.com',
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
        attachments: attachmentBuffer && attachmentName ? [
          {
            filename: attachmentName,
            content: attachmentBuffer
          }
        ] : undefined
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending export report email:', error);
      return false;
    }
  }

  // Send scheduled report email
  async sendScheduledReport(
    to: string,
    reportData: {
      url: string;
      dateRange: { start: string; end: string };
      summary: {
        totalAnalyses: number;
        averagePerformance: number;
        topIssues: string[];
      };
    },
    attachmentBuffer?: Buffer,
    attachmentName?: string
  ): Promise<boolean> {
    try {
      const template = this.generateScheduledReportTemplate(reportData);
      
      const mailOptions = {
        from: process.env.SMTP_USER || 'noreply@landingpagecritic.com',
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
        attachments: attachmentBuffer && attachmentName ? [
          {
            filename: attachmentName,
            content: attachmentBuffer
          }
        ] : undefined
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending scheduled report email:', error);
      return false;
    }
  }

  // Send welcome email for Pro users
  async sendProWelcomeEmail(to: string, userName: string): Promise<boolean> {
    try {
      const template = this.generateProWelcomeTemplate(userName);
      
      const mailOptions = {
        from: process.env.SMTP_USER || 'noreply@landingpagecritic.com',
        to,
        subject: template.subject,
        html: template.html,
        text: template.text
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending Pro welcome email:', error);
      return false;
    }
  }

  // Generate export report email template
  private generateExportReportTemplate(exportData: ExportData, format: 'csv' | 'pdf'): EmailTemplate {
    const subject = `Performance Analysis Report - ${exportData.url}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .summary { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .metric { display: inline-block; margin: 10px; padding: 10px; background: white; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .metric-value { font-size: 24px; font-weight: bold; color: #667eea; }
          .metric-label { font-size: 12px; color: #666; }
          .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Landing Page Critic</h1>
          <p>Performance Analysis Report</p>
        </div>
        
        <div class="content">
          <h2>Your ${format.toUpperCase()} Report is Ready</h2>
          <p>We've analyzed <strong>${exportData.url}</strong> and generated a comprehensive performance report.</p>
          
          <div class="summary">
            <h3>Analysis Summary</h3>
            <p><strong>URL:</strong> ${exportData.url}</p>
            <p><strong>Analyzed:</strong> ${new Date(exportData.analyzedAt).toLocaleString()}</p>
            <p><strong>Testing Platforms:</strong> ${exportData.platforms.join(', ')}</p>
            
            <div style="margin-top: 20px;">
              <div class="metric">
                <div class="metric-value">${exportData.categories.performance}</div>
                <div class="metric-label">Performance</div>
              </div>
              <div class="metric">
                <div class="metric-value">${exportData.categories.accessibility}</div>
                <div class="metric-label">Accessibility</div>
              </div>
              <div class="metric">
                <div class="metric-value">${exportData.categories.seo}</div>
                <div class="metric-label">SEO</div>
              </div>
              <div class="metric">
                <div class="metric-value">${exportData.categories['best-practices']}</div>
                <div class="metric-label">Best Practices</div>
              </div>
            </div>
          </div>
          
          <p>Your ${format.toUpperCase()} report is attached to this email. It includes:</p>
          <ul>
            <li>Detailed performance metrics and scores</li>
            <li>Web Vitals analysis</li>
            <li>Performance opportunities and recommendations</li>
            <li>Accessibility and best practices issues</li>
            ${exportData.aiInsights && exportData.aiInsights.length > 0 ? '<li>AI-powered insights and recommendations</li>' : ''}
          </ul>
          
          <p>Thank you for using Landing Page Critic!</p>
        </div>
        
        <div class="footer">
          <p>Generated by Landing Page Critic</p>
          <p>This email was sent to you because you requested a performance analysis report.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Landing Page Critic - Performance Analysis Report

Your ${format.toUpperCase()} Report is Ready

We've analyzed ${exportData.url} and generated a comprehensive performance report.

Analysis Summary:
- URL: ${exportData.url}
- Analyzed: ${new Date(exportData.analyzedAt).toLocaleString()}
- Testing Platforms: ${exportData.platforms.join(', ')}

Category Scores:
- Performance: ${exportData.categories.performance}/100
- Accessibility: ${exportData.categories.accessibility}/100
- SEO: ${exportData.categories.seo}/100
- Best Practices: ${exportData.categories['best-practices']}/100

Your ${format.toUpperCase()} report is attached to this email. It includes detailed performance metrics, Web Vitals analysis, opportunities, recommendations, and more.

Thank you for using Landing Page Critic!

Generated by Landing Page Critic
This email was sent to you because you requested a performance analysis report.
    `;

    return { subject, html, text };
  }

  // Generate scheduled report email template
  private generateScheduledReportTemplate(reportData: {
    url: string;
    dateRange: { start: string; end: string };
    summary: {
      totalAnalyses: number;
      averagePerformance: number;
      topIssues: string[];
    };
  }): EmailTemplate {
    const subject = `Weekly Performance Report - ${reportData.url}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .summary { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .metric { display: inline-block; margin: 10px; padding: 10px; background: white; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .metric-value { font-size: 24px; font-weight: bold; color: #667eea; }
          .metric-label { font-size: 12px; color: #666; }
          .issues { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Landing Page Critic</h1>
          <p>Weekly Performance Report</p>
        </div>
        
        <div class="content">
          <h2>Your Weekly Performance Summary</h2>
          <p>Here's your automated weekly performance report for <strong>${reportData.url}</strong>.</p>
          
          <div class="summary">
            <h3>Weekly Summary (${new Date(reportData.dateRange.start).toLocaleDateString()} - ${new Date(reportData.dateRange.end).toLocaleDateString()})</h3>
            
            <div style="margin-top: 20px;">
              <div class="metric">
                <div class="metric-value">${reportData.summary.totalAnalyses}</div>
                <div class="metric-label">Total Analyses</div>
              </div>
              <div class="metric">
                <div class="metric-value">${reportData.summary.averagePerformance}</div>
                <div class="metric-label">Avg Performance</div>
              </div>
            </div>
          </div>
          
          ${reportData.summary.topIssues.length > 0 ? `
          <div class="issues">
            <h3>Top Issues to Address</h3>
            <ul>
              ${reportData.summary.topIssues.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
          
          <p>Keep monitoring your site's performance and address any issues to maintain optimal user experience.</p>
          
          <p>Thank you for using Landing Page Critic!</p>
        </div>
        
        <div class="footer">
          <p>Generated by Landing Page Critic</p>
          <p>This is an automated weekly report. You can manage your email preferences in your account settings.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Landing Page Critic - Weekly Performance Report

Your Weekly Performance Summary

Here's your automated weekly performance report for ${reportData.url}.

Weekly Summary (${new Date(reportData.dateRange.start).toLocaleDateString()} - ${new Date(reportData.dateRange.end).toLocaleDateString()}):
- Total Analyses: ${reportData.summary.totalAnalyses}
- Average Performance: ${reportData.summary.averagePerformance}/100

${reportData.summary.topIssues.length > 0 ? `
Top Issues to Address:
${reportData.summary.topIssues.map(issue => `- ${issue}`).join('\n')}
` : ''}

Keep monitoring your site's performance and address any issues to maintain optimal user experience.

Thank you for using Landing Page Critic!

Generated by Landing Page Critic
This is an automated weekly report. You can manage your email preferences in your account settings.
    `;

    return { subject, html, text };
  }

  // Generate Pro welcome email template
  private generateProWelcomeTemplate(userName: string): EmailTemplate {
    const subject = 'Welcome to Landing Page Critic Pro!';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .feature { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; }
          .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to Pro!</h1>
          <p>Unlock the full potential of Landing Page Critic</p>
        </div>
        
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>Welcome to Landing Page Critic Pro! You now have access to our most powerful features.</p>
          
          <h3>Your Pro Features:</h3>
          <div class="feature">
            <strong>📊 Unlimited Analyses</strong><br>
            Analyze as many URLs as you need without limits.
          </div>
          <div class="feature">
            <strong>🤖 AI-Powered Insights</strong><br>
            Get intelligent recommendations and historical context.
          </div>
          <div class="feature">
            <strong>📄 Export Reports</strong><br>
            Download detailed PDF and CSV reports.
          </div>
          <div class="feature">
            <strong>📧 Email Reports</strong><br>
            Receive automated weekly performance summaries.
          </div>
          <div class="feature">
            <strong>🔗 API Access</strong><br>
            Integrate with your existing tools and workflows.
          </div>
          
          <p>Start exploring your new features and take your website performance to the next level!</p>
          
          <p>Best regards,<br>The Landing Page Critic Team</p>
        </div>
        
        <div class="footer">
          <p>Landing Page Critic Pro</p>
          <p>Thank you for choosing us!</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Welcome to Landing Page Critic Pro!

Hi ${userName},

Welcome to Landing Page Critic Pro! You now have access to our most powerful features.

Your Pro Features:
- 📊 Unlimited Analyses: Analyze as many URLs as you need without limits
- 🤖 AI-Powered Insights: Get intelligent recommendations and historical context
- 📄 Export Reports: Download detailed PDF and CSV reports
- 📧 Email Reports: Receive automated weekly performance summaries
- 🔗 API Access: Integrate with your existing tools and workflows

Start exploring your new features and take your website performance to the next level!

Best regards,
The Landing Page Critic Team

Landing Page Critic Pro
Thank you for choosing us!
    `;

    return { subject, html, text };
  }
}

// Create email service instance
export function createEmailService(): EmailService | null {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    console.warn('SMTP configuration not found. Email service disabled.');
    return null;
  }

  return new EmailService({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: parseInt(smtpPort) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
}
