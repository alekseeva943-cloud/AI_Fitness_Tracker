import React from "react";
import { StatCard } from "../../../components/ui/StatCard";
import { RU } from "../../../constants";
import { Activity, Target, TrendingUp, Clock } from "lucide-react";
import { AnalyticsSummary } from "../../analytics/types";
import { useNavigate } from "react-router-dom";
import { formatPercent, formatWeight, formatDate } from "../../../lib/utils";
import { Goal } from "../../../types";

import { METRICS } from "../../../constants/metrics";

interface DashboardGridProps {
  summary: AnalyticsSummary | null;
  activeGoal?: Goal | null;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ summary, activeGoal }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        label="Прогресс цели"
        subLabel={activeGoal?.title || "Выберите цель"}
        value={formatPercent(summary?.goal.completionPercentage ?? 0)}
        unit="%"
        icon={<Target className="w-4 h-4" />}
        onClick={() => navigate(activeGoal ? `/goals?id=${activeGoal.id}` : '/goals')}
        title="Прогресс достижения вашей текущей основной цели"
        trend={summary ? { 
          value: formatWeight(Math.abs(summary.weight.totalChange)), 
          isPositive: summary.goal.isImproving 
        } : undefined}
      />
      <StatCard 
        label="Интенсивность"
        subLabel={summary?.workouts.lastWorkoutDate ? `Последняя: ${formatDate(summary.workouts.lastWorkoutDate)}` : "Нет тренировок"}
        value={(summary?.workouts.avgWorkoutsPerWeek ?? 0).toFixed(1)}
        unit="тр/нед"
        icon={<Activity className="w-4 h-4" />}
        onClick={() => navigate('/workouts')}
        title="Среднее количество тренировок в неделю. Показывает регулярность и интенсивность вашего графика."
        trend={summary ? { 
          value: `${summary.workouts.consistencyScore}%`, 
          isPositive: summary.workouts.consistencyScore > 70 
        } : undefined}
      />
      <StatCard 
        label={summary?.workouts.totalDistance && summary.workouts.totalDistance > 0 ? METRICS.distance.label : "Средняя тренировка"}
        value={summary?.workouts.totalDistance && summary.workouts.totalDistance > 0 
          ? summary.workouts.totalDistance.toFixed(1) 
          : summary?.workouts.avgDuration ?? 0}
        unit={summary?.workouts.totalDistance && summary.workouts.totalDistance > 0 
          ? METRICS.distance.unit 
          : METRICS.duration.unit}
        icon={summary?.workouts.totalDistance && summary.workouts.totalDistance > 0 ? <Activity className="w-4 h-4 text-blue-400" /> : <Clock className="w-4 h-4" />}
        onClick={() => navigate('/workouts')}
        title="Средняя продолжительность одной тренировки"
      />
      <StatCard 
        label="Прогноз цели"
        subLabel={summary?.goal.estimatedCompletionDate ? `К ${formatDate(summary.goal.estimatedCompletionDate)}` : "Ожидаемая дата"}
        value={summary?.goal.estimatedCompletionDate ? formatDate(summary.goal.estimatedCompletionDate).split(' ')[0] : '-'}
        unit={summary?.goal.estimatedCompletionDate ? formatDate(summary.goal.estimatedCompletionDate).split(' ').slice(1).join(' ') : ''}
        icon={<TrendingUp className="w-4 h-4" />}
        onClick={() => navigate(activeGoal ? `/goals?id=${activeGoal.id}` : '/goals')}
        title="Прогноз даты достижения вашей основной цели на основе текущей динамики"
        trend={activeGoal ? { 
          value: formatWeight(activeGoal.targetValue), 
          isPositive: true 
        } : undefined}
      />
    </div>
  );
};
