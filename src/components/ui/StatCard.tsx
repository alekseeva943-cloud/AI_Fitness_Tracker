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
    <GlassCard className={cn("p-7 flex flex-col gap-1 group", className)}>
      <div className="flex justify-between items-start text-muted-foreground/60 mb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        {icon && (
          <div className="text-muted-foreground group-hover:text-primary transition-colors duration-500">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-display font-semibold tracking-tighter">{value}</span>
        {unit && <span className="text-sm text-muted-foreground font-medium lowercase">{unit}</span>}
      </div>

      {trend && (
        <div className={cn(
          "text-[10px] font-bold mt-4 flex items-center gap-1 px-2 py-1 rounded-lg w-fit",
          trend.isPositive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
        )}>
          {trend.isPositive ? "+" : ""}{trend.value}
        </div>
      )}
    </GlassCard>
  );
};
