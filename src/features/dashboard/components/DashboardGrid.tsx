import React from "react";
import { GlassCard } from "../../../components/ui/GlassCard";
import { StatCard } from "../../../components/ui/StatCard";
import { RU } from "../../../constants";
import { Activity, Target, TrendingUp, Clock } from "lucide-react";

export const DashboardGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        label={RU.DASHBOARD.ACTIVE_GOAL}
        value="Сбросить 5кг"
        unit="кг"
        icon={<Target className="w-4 h-4" />}
        trend={{ value: "12%", isPositive: true }}
      />
      <StatCard 
        label="Средний темп"
        value="4.2"
        unit="тр/нед"
        icon={<Activity className="w-4 h-4" />}
        trend={{ value: "+12%", isPositive: true }}
      />
      <StatCard 
        label={RU.ENTRIES.DURATION}
        value="345"
        unit="мин"
        icon={<Clock className="w-4 h-4" />}
      />
      <StatCard 
        label="Прогноз"
        value="15"
        unit="Окт"
        icon={<TrendingUp className="w-4 h-4" />}
      />
    </div>
  );
};
