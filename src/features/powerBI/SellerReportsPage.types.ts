import type { ReportTile } from "@/lib/bi-reports/biReports";

export type SellerReportsPageProps = {
  subtitle?: string;
};

export type SellerReportTile = Omit<ReportTile, "href"> & {
  slug: string;
};
