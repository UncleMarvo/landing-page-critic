import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

type Opportunity = {
  id: string;
  title: string;
  savingsMs: number;
};

interface OpportunitiesCardProps {
  data: Opportunity[];
}

export default function OpportunitiesCard({ data }: OpportunitiesCardProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Opportunities</CardTitle>
        </CardHeader>
        <CardContent>No data available yet.</CardContent>
      </Card>
    );
  }

  const topData = data.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Opportunities</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-stretch">
        {/* Table */}
        <table className="w-2/3 self-start">
          <thead>
            <tr className="text-left border-b">
              <th>Metric</th>
              <th>Estimated Savings (ms)</th>
            </tr>
          </thead>
          <tbody>
            {topData.map((op) => (
              <tr key={op.id} className="border-b">
                <td>{op.title}</td>
                <td>{Math.round(op.savingsMs)} ms</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bar Chart */}
        <div className="w-1/3 flex-grow h-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={topData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <XAxis type="number" tickFormatter={(val) => `${Math.round(val)}ms`} />
              <YAxis type="category" dataKey="title" width={150} />
              <Tooltip formatter={(val: number) => `${Math.round(val)} ms`} />
              <Bar dataKey="savingsMs">
                {topData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#4ade80" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
