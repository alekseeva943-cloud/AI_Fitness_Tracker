import React from 'react';
import { Goal, WorkoutEntry, WeightEntry } from '../../../types';
import { formatDate, formatWeight, cn } from '../../../lib/utils';
import { GlassCard } from '../../../components/ui/GlassCard';
import { CheckCircle2, Calendar, Dumbbell, TrendingUp, Zap, Activity, Clock } from 'lucide-react';
import { differenceInDays, isAfter, isBefore } from 'date-fns';

interface GoalAchievementReportProps {
  goal: Goal;
  workouts: WorkoutEntry[];
  weightHistory: WeightEntry[];
  onArchive?: () => void;
}

export const GoalAchievementReport: React.FC<GoalAchievementReportProps> = ({ 
  goal, 
  workouts, 
  weightHistory,
  onArchive 
}) => {
  const startDate = new Date(goal.startDate);
  const completionDate = goal.completedAt ? new Date(goal.completedAt) : new Date();
  
  // Filter relevant data during the goal period
  const goalWorkouts = workouts.filter(w => {
    const d = new Date(w.date);
    return !isBefore(d, startDate) && !isAfter(d, completionDate);
  });
  
  const relevantWeights = weightHistory.filter(h => {
    const d = new Date(h.date);
    return !isBefore(d, startDate) && !isAfter(d, completionDate);
  });

  const durationInDays = Math.max(1, differenceInDays(completionDate, startDate));
  const plannedDuration = goal.deadline ? differenceInDays(new Date(goal.deadline), startDate) : null;
  const wasFaster = plannedDuration ? durationInDays < plannedDuration : null;
  
  const totalWeightChange = goal.type === 'WEIGHT_LOSS' 
    ? goal.startValue - goal.currentValue 
    : goal.currentValue - goal.startValue;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4 mb-8">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
          <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-br from-green-400 to-green-600 border-4 border-white/20 shadow-[0_0_40px_rgba(34,197,94,0.5)] mb-4 animate-bounce-slow">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 italic uppercase tracking-tighter">Ты сделал это!</h2>
          <p className="text-xl font-bold text-white/80">Цель официально достигнута.</p>
          <p className="text-muted-foreground max-w-sm mx-auto">Невероятный результат. Ты доказал себе, что дисциплина и упорство приносят плоды. Посмотри, какой путь ты прошел.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-6 space-y-4 border-white/5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            Временной отрезок
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="opacity-60">Старт:</span>
              <span className="font-bold">{formatDate(goal.startDate)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="opacity-60">Завершение:</span>
              <span className="font-bold">{formatDate(goal.completedAt || new Date().toISOString())}</span>
            </div>
            <div className="pt-2 border-t border-white/5 flex justify-between items-center">
              <span className="opacity-60">Длительность:</span>
              <span className="text-primary font-bold">{durationInDays} дней</span>
            </div>
            {plannedDuration && (
              <div className="flex justify-between items-center text-xs">
                <span className="opacity-40 italic">Планировалось:</span>
                <span className={cn(
                  "font-bold",
                  wasFaster ? "text-green-400" : "text-yellow-400"
                )}>
                  {wasFaster ? "Быстрее на " : "Медленнее на "} {Math.abs(plannedDuration - durationInDays)} дн.
                </span>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-4 border-white/5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Dumbbell className="w-4 h-4 text-primary" />
            Активность в пути
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="opacity-60">Тренировок:</span>
              <span className="font-bold">{goalWorkouts.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="opacity-60">Всего ккал:</span>
              <span className="font-bold">{goalWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="opacity-60">Средняя длит.:</span>
              <span className="font-bold">
                {goalWorkouts.length > 0 ? Math.round(goalWorkouts.reduce((sum, w) => sum + w.duration, 0) / goalWorkouts.length) : 0} мин
              </span>
            </div>
            <div className="pt-2 border-t border-white/5 flex justify-between items-center">
              <span className="opacity-60">Интенсивность:</span>
              <span className="text-primary font-bold">
                {(goalWorkouts.length / (durationInDays / 7)).toFixed(1)} тр. / нед
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 translate-x-1/4 -translate-y-1/4">
           <TrendingUp className="w-40 h-40 text-primary" />
        </div>
        <div className="space-y-6 relative z-10">
          <h3 className="text-xl font-bold font-display">Финальный результат</h3>
          <div className="grid grid-cols-3 gap-4">
             <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Старт</p>
                <p className="text-xl font-bold">{goal.startValue} {goal.unit}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Цель</p>
                <p className="text-xl font-bold">{goal.targetValue} {goal.unit}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-primary tracking-widest">Итог</p>
                <p className="text-xl font-bold text-primary">{goal.currentValue} {goal.unit}</p>
             </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-2xl border border-primary/20">
             <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-black">
                <TrendingUp className="w-6 h-6" />
             </div>
             <div>
                <p className="text-sm font-bold">
                   Вы {totalWeightChange > 0 ? "улучшили" : "изменили"} свой показатель на {Math.abs(totalWeightChange).toFixed(1)} {goal.unit}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase font-black uppercase tracking-widest">
                   Это на {(Math.abs(totalWeightChange) / Math.abs(goal.startValue - goal.targetValue) * 100).toFixed(0)}% от изначального плана
                </p>
             </div>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-3">
        <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
          <Clock className="w-3 h-3 text-primary" />
          История тренировок для этой цели
        </h4>
        <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          {goalWorkouts.map(w => (
            <div key={w.id} className="flex justify-between items-center p-3 bg-secondary/30 rounded-xl border border-white/5 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                   {w.category === 'STRENGTH' ? <Zap className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-bold">{w.type}</p>
                  <p className="opacity-40">{formatDate(w.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{w.duration} мин</p>
                {w.caloriesBurned && <p className="opacity-40">{w.caloriesBurned} ккал</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {onArchive && (
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 text-center">
            <p className="text-sm font-bold mb-1">Что дальше?</p>
            <p className="text-xs text-muted-foreground">Ты покорил эту вершину. Самое время зафиксировать успех, архивировать эту цель и поставить перед собой новый вызов!</p>
          </div>
          <button 
            onClick={onArchive}
            className="w-full h-14 bg-green-500 hover:bg-green-400 text-black border border-white/5 rounded-[1.5rem] text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"
          >
            Архивировать цель и зафиксировать победу
          </button>
        </div>
      )}
    </div>
  );
};
