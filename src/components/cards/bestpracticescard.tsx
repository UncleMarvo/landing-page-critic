import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BestPractice = {
  id: string;
  title: string;
  score: number; // 0–1
  description?: string;
};

interface BestPracticesCardProps {
  data: BestPractice[];
}

export default function BestPracticesCard({ data }: BestPracticesCardProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Best Practices</CardTitle>
        </CardHeader>
        <CardContent>No data available yet.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Best Practices</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-stretch">
        {/* Table */}
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th>Metric</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {data.map((bp) => (
              <tr key={bp.id} className="border-b">
                <td>{bp.title}</td>
                <td>{bp.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
