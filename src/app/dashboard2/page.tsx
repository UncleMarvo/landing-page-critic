"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="space-y-6 p-6">
      {/* 1. Overview Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Placeholder for key metrics summary (latest category scores, key vitals) */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded shadow">Performance: --%</div>
            <div className="p-4 bg-gray-50 rounded shadow">Accessibility: --%</div>
            <div className="p-4 bg-gray-50 rounded shadow">SEO: --%</div>
            <div className="p-4 bg-gray-50 rounded shadow">Best Practices: --%</div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Web Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Placeholder for LCP, INP, CLS display */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded shadow">LCP: -- ms</div>
            <div className="p-4 bg-gray-50 rounded shadow">INP: -- ms</div>
            <div className="p-4 bg-gray-50 rounded shadow">CLS: --</div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Placeholder for opportunities table */}
          <div className="text-gray-500">Opportunities list goes here...</div>
        </CardContent>
      </Card>

      {/* 4. Accessibility Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Accessibility Issues</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Placeholder for accessibility issues table */}
          <div className="text-gray-500">Accessibility details go here...</div>
        </CardContent>
      </Card>

      {/* 5. Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Placeholder for best practices table */}
          <div className="text-gray-500">Best Practices details go here...</div>
        </CardContent>
      </Card>

      {/* 6. Historical Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Historical Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Placeholder for historical performance chart (category scores + vitals if merged) */}
          <div className="h-64 bg-gray-50 rounded shadow flex items-center justify-center">
            Historical data chart placeholder
          </div>
        </CardContent>
      </Card>
    </div>
  );
}