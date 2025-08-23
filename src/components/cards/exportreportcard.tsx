import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ExportReportCard({ data }: any) {
  // Check if data exists and has the lhr property
  const isDisabled = !data;

  const handleDownload = () => {
    console.log(`*** DEBUG - ExportReportCard data: ${JSON.stringify(data, null, 2)}`);

    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lighthouse-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Export Report</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleDownload} disabled={isDisabled}>
          Download JSON
        </Button>
      </CardContent>
    </Card>
  );
}
