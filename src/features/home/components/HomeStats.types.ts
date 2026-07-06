export type WcEndpointSummary = {
  newCount: number;
  repeatCount: number;
  turnover: number;
};

export type MetricCardProps = {
  title: string;
  value: string;
  delta?: string | null;
  deltaDirection?: "up" | "down" | "neutral";
  icon: string;
  href?: string;
};
