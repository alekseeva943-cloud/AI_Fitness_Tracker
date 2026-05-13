import React from "react";
import { cn } from "../../lib/utils";
import { GlassCard } from "./GlassCard";

interface StatCardProps {
  label: string;
  subLabel?: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  title?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  subLabel,
  value,
  unit,
  trend,
  icon,
  className,
  onClick,
  title
}) => {
  return (
    <GlassCard 
      onClick={onClick}
      title={title}
      className={cn(
        "p-6 flex flex-col gap-1 group relative overflow-hidden",
        className
      )}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
      
      <div className="flex justify-between items-start text-muted-foreground/40 mb-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] group-hover:text-muted-foreground transition-colors">{label}</span>
          {subLabel && <span className="text-[9px] font-medium text-muted-foreground/60 line-clamp-1">{subLabel}</span>}
        </div>
        {icon && (
          <div className="text-muted-foreground/40 group-hover:text-primary transition-all duration-500 group-hover:scale-110">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-display font-medium tracking-tight group-hover:scale-[1.02] origin-left transition-transform duration-500">{value}</span>
        {unit && <span className="text-xs text-muted-foreground/60 font-bold uppercase tracking-widest">{unit}</span>}
      </div>

      {trend && (
        <div className={cn(
          "text-[10px] font-bold mt-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full w-fit backdrop-blur-sm border transition-all duration-500",
          trend.isPositive ? "bg-primary/10 text-primary border-primary/10" : "bg-red-500/10 text-red-400 border-red-500/10"
        )}>
          {trend.isPositive ? "+" : ""}{trend.value}
        </div>
      )}
    </GlassCard>
  );
};
