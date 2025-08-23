"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RecommendationsPanelProps = {
  id: string;
  title: string;
  description?: string;
};

interface RecommendationsCardProps {
  data: RecommendationsPanelProps[];
}

export default function RecommendationsCard({
  data,
}: RecommendationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Detailed Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-stretch">
        {/* Table */}
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th>Title</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a: any) => (
              <tr key={a.id} className="border-b">
                <td className="p-2 font-medium">{a.title}</td>
                <td className="p-2 text-muted-foreground">{a.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
