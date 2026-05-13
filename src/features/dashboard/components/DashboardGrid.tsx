import React from "react";
import { GlassCard } from "../../../components/ui/GlassCard";
import { StatCard } from "../../../components/ui/StatCard";
import { RU } from "../../../constants";
import { Activity, Target, TrendingUp, Clock } from "lucide-react";
import { AnalyticsSummary } from "../../analytics/types";
import { useNavigate } from "react-router-dom";
import { formatPercent, formatWeight } from "../../../lib/utils";

interface DashboardGridProps {
  summary: AnalyticsSummary | null;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ summary }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        label={RU.DASHBOARD.ACTIVE_GOAL}
        value={formatPercent(summary?.goal.completionPercentage ?? 0)}
        unit=""
        icon={<Target className="w-4 h-4" />}
        onClick={() => navigate('/goals')}
        trend={summary ? { 
          value: formatWeight(Math.abs(summary.weight.totalChange)), 
          isPositive: summary.weight.totalChange < 0 
        } : undefined}
      />
      <StatCard 
        label="Средний темп"
        value={(summary?.workouts.avgWorkoutsPerWeek ?? 0).toFixed(1)}
        unit="тр/нед"
        icon={<Activity className="w-4 h-4" />}
        onClick={() => navigate('/workouts')}
        trend={summary ? { 
          value: `${summary.workouts.consistencyScore}%`, 
          isPositive: summary.workouts.consistencyScore > 70 
        } : undefined}
      />
      <StatCard 
        label={RU.ENTRIES.DURATION}
        value={summary?.workouts.avgDuration ?? 0}
        unit="мин"
        icon={<Clock className="w-4 h-4" />}
        onClick={() => navigate('/workouts')}
      />
      <StatCard 
        label="Прогноз веса"
        value={formatWeight(summary?.weight.forecastedWeight ?? 0).replace(' кг', '')}
        unit="кг"
        icon={<TrendingUp className="w-4 h-4" />}
        onClick={() => navigate('/analytics')}
      />
    </div>
  );
};
