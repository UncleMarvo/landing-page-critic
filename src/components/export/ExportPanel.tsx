'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, FileText, FileSpreadsheet, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import FeatureGate from '@/components/payments/FeatureGate';
import { ExportUpgradePrompt } from '@/components/payments/UpgradePrompt';

interface ExportStatus {
  hasAccess: boolean;
  limit: number;
  used: number;
  remaining: number;
  canExport: boolean;
  upgradeRequired: boolean;
}

interface ExportPanelProps {
  url: string;
  className?: string;
}

export default function ExportPanel({ url, className }: ExportPanelProps) {
  const { user } = useAuth();
  const [exportStatus, setExportStatus] = useState<ExportStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [includeAiInsights, setIncludeAiInsights] = useState(true);
  const [includeHistoricalData, setIncludeHistoricalData] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch export status on component mount
  useEffect(() => {
    fetchExportStatus();
  }, []);

  const fetchExportStatus = async () => {
    try {
      const response = await fetch('/api/export');
      if (response.ok) {
        const status = await response.json();
        setExportStatus(status);
      }
    } catch (error) {
      console.error('Failed to fetch export status:', error);
    }
  };

  const handleExport = async () => {
    if (!url) {
      setError('No URL available for export');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          format,
          includeAiInsights,
          includeHistoricalData,
          sendEmail,
          emailAddress: sendEmail ? emailAddress : undefined,
        }),
      });

      if (response.ok) {
        // Handle file download
        const blob = await response.blob();
        const fileName = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 
          `performance-analysis-${format === 'pdf' ? '.pdf' : '.csv'}`;
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setSuccess(`Export completed successfully! ${sendEmail ? 'Email sent.' : ''}`);
        
        // Refresh export status
        await fetchExportStatus();
      } else {
        const errorData = await response.json();
        if (errorData.upgradeRequired) {
          setError('Export functionality requires Pro tier. Please upgrade to continue.');
        } else {
          setError(errorData.error || 'Failed to generate export');
        }
      }
    } catch (error) {
      setError('Failed to generate export. Please try again.');
      console.error('Export error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!exportStatus) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Reports
            <Badge variant="secondary" className="ml-auto">
              <Crown className="h-3 w-3 mr-1" />
              Pro
            </Badge>
          </CardTitle>
          <CardDescription>
            Export your performance analysis data in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <FeatureGate 
      feature="exportReports" 
      tier={user?.tier as 'free' | 'pro'}
      fallback={<ExportUpgradePrompt className={className} />}
    >
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Reports
            <Badge variant="secondary" className="ml-auto">
              <Crown className="h-3 w-3 mr-1" />
              Pro
            </Badge>
          </CardTitle>
          <CardDescription>
            Export your performance analysis data in various formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Usage Status */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Exports this month</span>
              <span className="font-medium">{exportStatus.used} / {exportStatus.limit}</span>
            </div>
            <Progress value={(exportStatus.used / exportStatus.limit) * 100} className="h-2" />
            <p className="text-xs text-gray-500">
              {exportStatus.remaining} exports remaining
            </p>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Export Format</Label>
            <div className="flex gap-2">
              <Button
                variant={format === 'pdf' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormat('pdf')}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant={format === 'csv' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormat('csv')}
                className="flex-1"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeAiInsights"
                checked={includeAiInsights}
                onCheckedChange={(checked) => setIncludeAiInsights(checked as boolean)}
              />
              <Label htmlFor="includeAiInsights" className="text-sm">
                Include AI Insights
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeHistoricalData"
                checked={includeHistoricalData}
                onCheckedChange={(checked) => setIncludeHistoricalData(checked as boolean)}
              />
              <Label htmlFor="includeHistoricalData" className="text-sm">
                Include Historical Data
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendEmail"
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(checked as boolean)}
              />
              <Label htmlFor="sendEmail" className="text-sm">
                Send via Email
              </Label>
            </div>

            {sendEmail && (
              <div className="space-y-2">
                <Label htmlFor="emailAddress" className="text-sm">
                  Email Address
                </Label>
                <Input
                  id="emailAddress"
                  type="email"
                  placeholder="Enter email address"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="text-sm"
                />
              </div>
            )}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isLoading || !exportStatus.canExport || (sendEmail && !emailAddress)}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Export...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>

          {!exportStatus.canExport && exportStatus.used > 0 && (
            <p className="text-xs text-amber-600 text-center">
              Export limit reached for this month
            </p>
          )}
        </CardContent>
      </Card>
    </FeatureGate>
  );
}
