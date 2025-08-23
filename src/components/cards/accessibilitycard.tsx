import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AccessibilityAudit = {
  id: string;
  title: string;
  score: number; // 0–1
  description?: string;
};

interface AccessibilityCardProps {
  data: AccessibilityAudit[];
}

export default function AccessibilityCard({ data }: AccessibilityCardProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Accessibility Issues</CardTitle>
        </CardHeader>
        <CardContent>No data available yet.</CardContent>
      </Card>
    );
  }

  // Pass vs fail counts
  const passCount = data.filter((d) => d.score === 1).length;
  const failCount = data.length - passCount;

  const chartData = [
    { name: "Pass", value: passCount },
    { name: "Fail", value: failCount },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Accessibility Issues</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-stretch">
        {/* Table */}
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th>Audit</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {data.map((audit) => (
              <tr key={audit.id} className="border-b">
                <td className="p-2 font-medium">{audit.title}</td>
                <td className="p-2 text-muted-foreground">{audit.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
