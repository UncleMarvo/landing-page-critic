import { useDashboard } from "@/context/DashboardContext";
import ExportPanel from "@/components/export/ExportPanel";

export default function ExportReportCard() {
  const { url } = useDashboard();

  return <ExportPanel url={url || ''} />;
}
