import React from "react";
import { cn } from "../../lib/utils";
import { GlassCard } from "./GlassCard";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  trend,
  icon,
  className
}) => {
  return (
    <GlassCard className={cn("p-5 flex flex-col gap-1", className)}>
      <div className="flex justify-between items-start text-muted-foreground mb-2">
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        {unit && <span className="text-sm text-muted-foreground font-medium">{unit}</span>}
      </div>

      {trend && (
        <div className={cn(
          "text-xs font-medium mt-2 flex items-center gap-1",
          trend.isPositive ? "text-green-400" : "text-red-400"
        )}>
          {trend.isPositive ? "+" : ""}{trend.value} за прошлый период
        </div>
      )}
    </GlassCard>
  );
};
