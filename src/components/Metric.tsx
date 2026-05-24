import { ReactNode } from "react";

interface MetricProps {
  label: string;
  value: string | number | ReactNode;
  unit?: string;
  color?: "primary" | "success" | "warning" | "destructive" | "info" | "default";
}

export function Metric({ label, value, unit, color = "default" }: MetricProps) {
  const colorMap = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
    info: "text-info",
    default: "text-foreground",
  };

  return (
    <div className="surface p-4 rounded-lg flex flex-col gap-1" data-testid={`metric-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold tracking-tight ${colorMap[color]}`}>{value}</span>
        {unit && <span className="text-sm font-mono text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}
