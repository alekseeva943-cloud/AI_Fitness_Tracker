import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFitnessStore, useWeightHistory, useWorkouts, useGoals } from '../../store/useFitnessStore';
import { selectAnalyticsSummary } from './selectors/fitnessSelectors';
import { GlassCard } from '../../components/ui/GlassCard';
import { StatCard } from '../../components/ui/StatCard';
import { WeightChart } from '../dashboard/components/WeightChart';
import { Modal } from '../../components/ui/Modal';
import { TrendingUp, Activity, Target, Zap, Clock, Calendar, BarChart3, Info, ChevronRight, Scale, Flame, ArrowRight, Dumbbell, Sparkles, ChevronLeft, FileText } from 'lucide-react';
import { RU } from '../../constants';
import { cn, formatWeight, formatVelocity, formatPercent, formatDate } from '../../lib/utils';

export const AnalyticsView: React.FC = () => {
  const navigate = useNavigate();
  const state = useFitnessStore();
  const summary = selectAnalyticsSummary(state);
  const weightHistory = useWeightHistory();
  const workouts = useWorkouts();
  const goals = useGoals();
  const activeGoal = goals[0];

  const [activeModal, setActiveModal] = useState<'weight' | 'workouts' | 'goal' | null>(null);

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
      <div className="space-y-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Назад
        </button>
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-medium tracking-tight">Глубокая аналитика</h1>
          <p className="text-muted-foreground">Детальный разбор вашей формы и динамики прогресса</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Текущий вес"
          value={summary.weight.currentWeight.toFixed(1)}
          unit="кг"
          icon={<Target className="w-4 h-4" />}
          trend={{ value: formatWeight(Math.abs(summary.weight.totalChange)), isPositive: summary.weight.totalChange < 0 }}
          onClick={() => setActiveModal('weight')}
        />
        <StatCard
          label="Всего тренировок"
          value={summary.workouts.totalWorkouts.toString()}
          icon={<Activity className="w-4 h-4" />}
          onClick={() => setActiveModal('workouts')}
        />
        <StatCard
          label="Часов в зале"
          value={Math.round(summary.workouts.totalDuration / 60).toString()}
          icon={<Clock className="w-4 h-4" />}
          onClick={() => setActiveModal('workouts')}
        />
        <StatCard
          label="Прогресс цели"
          value={formatPercent(summary.goal.completionPercentage).replace('%', '')}
          unit="%"
          icon={<Zap className="w-4 h-4" />}
          onClick={() => setActiveModal('goal')}
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
            <div className="space-y-1">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Статистика за месяц
              </h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Основано на последних 30 днях</p>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 hover:bg-white/10 transition-colors cursor-pointer group" onClick={() => setActiveModal('workouts')}>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Активность</p>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xl font-display font-medium">{summary.workouts.consistencyScore}% <span className={cn("text-xs font-sans ml-1", summary.workouts.consistencyScore > 70 ? "text-green-400" : "text-yellow-400")}>
                  {summary.workouts.consistencyScore > 70 ? "Отлично" : "Норма"}
                </span></p>
                <p className="text-[10px] text-muted-foreground leading-tight">Комбинация частоты, объема и регулярности ваших тренировок.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Интенсивность</p>
                <p className="text-xl font-display font-medium">
                  {summary.workouts.avgDuration > 60 ? 'Высокая' : summary.workouts.avgDuration > 30 ? 'Средняя' : 'Низкая'}
                </p>
                <p className="text-[10px] text-muted-foreground">Среднее время под нагрузкой: {summary.workouts.avgDuration.toFixed(0)} мин</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 hover:bg-white/10 transition-colors cursor-pointer group" onClick={() => setActiveModal('workouts')}>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Темп прогресса</p>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xl font-display font-medium">{summary.workouts.avgWorkoutsPerWeek.toFixed(1)} <span className="text-xs">тр/нед</span></p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-8 bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer group" onClick={() => setActiveModal('weight')}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Инсайт дня
              </h3>
              <Info className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
            </div>
            <p className="text-sm leading-relaxed text-foreground/80">
              Ваша скорость изменения веса составляет <span className="text-primary font-bold">{formatVelocity(summary.weight.weeklyChange)}</span>. 
              При текущем темпе цель <span className="italic">"{activeGoal?.title || 'Прогресс'}"</span> будет достигнута 
              к <span className="text-primary font-bold">{summary.goal.estimatedCompletionDate ? formatDate(summary.goal.estimatedCompletionDate) : 'концу месяца'}</span>.
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Drill-down Modals */}
      <Modal 
        isOpen={activeModal === 'weight'} 
        onClose={() => setActiveModal(null)}
        title="Анализ массы тела"
      >
        <div className="space-y-6 text-foreground">
          <button 
            onClick={() => setActiveModal(null)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group mb-2"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Назад
          </button>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-secondary/50 space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Старт</p>
              <p className="text-xl font-display">{formatWeight(activeGoal?.startValue ?? (weightHistory[weightHistory.length-1]?.value ?? 0))}</p>
            </div>
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-widest text-primary">Текущий</p>
              <p className="text-xl font-display text-primary">{formatWeight(summary.weight.currentWeight)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Как это считается?
            </h4>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                Мы берем среднее значение за последние 7 дней и сравниваем его с предыдущим периодом. 
                Это позволяет отсечь ежедневные колебания воды и гликогена.
              </p>
              <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span>Средний темп:</span>
                <span className="font-bold text-foreground">{formatVelocity(summary.weight.weeklyChange)}</span>
              </div>
              <p className="text-xs italic bg-secondary/30 p-3 rounded-lg">
                * Прогноз строится на основе линейной регрессии изменений за последние 14 дней.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'workouts'} 
        onClose={() => setActiveModal(null)}
        title="История и анализ активности"
      >
        <div className="space-y-6 text-foreground">
          <button 
            onClick={() => setActiveModal(null)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group mb-2"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Назад
          </button>
          <div className="grid grid-cols-3 gap-2">
             <div className="text-center p-3 rounded-xl bg-secondary/50">
               <p className="text-[10px] uppercase font-bold text-muted-foreground">Всего</p>
               <p className="text-lg font-bold">{summary.workouts.totalWorkouts}</p>
             </div>
             <div className="text-center p-3 rounded-xl bg-secondary/50">
               <p className="text-[10px] uppercase font-bold text-muted-foreground">Ккал</p>
               <p className="text-lg font-bold">~{summary.workouts.totalWorkouts * 350}</p>
             </div>
             <div className="text-center p-3 rounded-xl bg-secondary/50">
               <p className="text-[10px] uppercase font-bold text-muted-foreground">Показатель</p>
               <p className="text-lg font-bold">{summary.workouts.consistencyScore}%</p>
             </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-primary" />
              Как считается активность?
            </h4>
            <div className="grid grid-cols-2 gap-4 text-[10px]">
              <div className="space-y-1">
                <p className="text-muted-foreground uppercase font-bold">Общий объем</p>
                <p className="font-medium text-foreground">{(summary.workouts.totalDuration / 60).toFixed(1)} часов тренировок</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground uppercase font-bold">Регулярность</p>
                <p className="font-medium text-foreground">{summary.workouts.avgWorkoutsPerWeek.toFixed(1)} тр. в неделю</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground uppercase font-bold">Интенсивность</p>
                <p className="font-medium text-foreground">{summary.workouts.avgDuration.toFixed(0)} мин / тренировка</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground uppercase font-bold">Consistency Score</p>
                <p className="font-medium text-foreground">Базируется на отклонении от графика</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-1">Последние 10 записей</p>
            {workouts.slice(0, 10).map(workout => (
              <div key={workout.id} className="flex justify-between items-center p-3 border border-white/5 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{workout.type}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(workout.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold">{workout.duration} мин</p>
                  <p className="text-[10px] text-muted-foreground">~{workout.caloriesBurned} ккал</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'goal'} 
        onClose={() => setActiveModal(null)}
        title="Прогресс цели"
      >
        <div className="space-y-8 text-foreground">
          <button 
            onClick={() => setActiveModal(null)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group mb-2"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Назад
          </button>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary/20">
                  {formatPercent(summary.goal.completionPercentage)} выполнено
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-primary">
                  {formatWeight(Math.abs(summary.goal.remainingValue))} до цели
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/10">
              <div style={{ width: `${summary.goal.completionPercentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-1000"></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 bg-secondary/50 rounded-[2rem] border border-white/5">
             <div className="text-center">
               <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Старт</p>
               <p className="text-xl font-display">{formatWeight(activeGoal?.startValue ?? 0)}</p>
             </div>
             <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
             <div className="text-center">
               <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Цель</p>
               <p className="text-xl font-display text-primary">{formatWeight(activeGoal?.targetValue ?? 0)}</p>
             </div>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
             <p className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
               <Zap className="w-4 h-4" />
               Вердикт системы
             </p>
             <p className="text-sm text-foreground/80 leading-relaxed">
               {summary.goal.status === 'AHEAD_OF_SCHEDULE' 
                 ? "Вы идете с опережением графика. Текущая интенсивность оптимальна." 
                 : "Результаты стабильны. Для ускорения прогресса рекомендуется увеличить количество тренировок на 1 в неделю."}
             </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
