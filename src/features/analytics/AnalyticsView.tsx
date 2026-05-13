import React from 'react';
import { useFitnessStore, useWeightHistory, useWorkouts } from '../../store/useFitnessStore';
import { selectAnalyticsSummary } from './selectors/fitnessSelectors';
import { GlassCard } from '../../components/ui/GlassCard';
import { StatCard } from '../../components/ui/StatCard';
import { WeightChart } from '../dashboard/components/WeightChart';
import { TrendingUp, Activity, Target, Zap, Clock, Calendar, BarChart3 } from 'lucide-react';
import { RU } from '../../constants';
import { cn } from '../../lib/utils';

export const AnalyticsView: React.FC = () => {
  const state = useFitnessStore();
  const summary = selectAnalyticsSummary(state);
  const weightHistory = useWeightHistory();
  const workouts = useWorkouts();

  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Activity className="w-12 h-12 text-primary/20 mx-auto animate-pulse" />
          <p className="text-muted-foreground">Добавьте данные о весе и тренировках, чтобы увидеть глубокую аналитику</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-1">
        <h1 className="text-4xl font-display font-medium tracking-tight">Глубокая аналитика</h1>
        <p className="text-muted-foreground">Детальный разбор вашей формы и динамики прогресса</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Текущий вес"
          value={summary.weight.currentWeight.toString()}
          unit="кг"
          icon={<Target className="w-4 h-4" />}
          trend={{ value: summary.weight.totalChange.toString(), isPositive: summary.weight.totalChange < 0 }}
        />
        <StatCard
          label="Всего тренировок"
          value={summary.workouts.totalWorkouts.toString()}
          icon={<Activity className="w-4 h-4" />}
        />
        <StatCard
          label="Часов в зале"
          value={Math.round(summary.workouts.totalDuration / 60).toString()}
          icon={<Clock className="w-4 h-4" />}
        />
        <StatCard
          label="Прогресс цели"
          value={Math.round(summary.goal.completionPercentage).toString()}
          unit="%"
          icon={<Zap className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-8 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Динамика веса
            </h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest">Прогноз активен</span>
            </div>
          </div>
          <div className="flex-1">
            <WeightChart data={weightHistory} />
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-8 space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Статистика за месяц
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Активность</p>
                <p className="text-xl font-display font-medium">85% <span className="text-xs text-green-400 font-sans ml-1">+12%</span></p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Интенсивность</p>
                <p className="text-xl font-display font-medium">Высокая</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Средняя тренировка</p>
                <p className="text-xl font-display font-medium">52 мин</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-8 bg-primary/5 border-primary/20">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Инсайт дня
            </h3>
            <p className="text-sm leading-relaxed text-foreground/80">
              Ваша скорость снижения веса составляет <span className="text-primary font-bold">{Math.abs(summary.weight.weeklyChange)} кг/нед</span>. 
              При сохранении текущей интенсивности тренировок и режима питания, вы достигнете цели 
              к <span className="text-primary font-bold">{summary.goal.estimatedCompletionDate ? new Date(summary.goal.estimatedCompletionDate).toLocaleDateString('ru-RU') : 'концу месяца'}</span>.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
