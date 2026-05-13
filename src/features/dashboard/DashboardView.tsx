import React, { useEffect, useState } from "react";
import { RU } from "../../constants";
import { DashboardGrid } from "./components/DashboardGrid";
import { GlassCard } from "../../components/ui/GlassCard";
import { GradientButton } from "../../components/ui/GradientButton";
import { ChevronRight, Sparkles, TrendingUp, TrendingDown, Minus, Plus, Target, Dumbbell, Scale, Clock, Flame, Calendar, FileText, Trash2 } from "lucide-react";
import { useFitnessStore, useGoals, useWorkouts, useWeightHistory } from "../../store/useFitnessStore";
import { selectAnalyticsSummary } from "../analytics/selectors/fitnessSelectors";
import { formatDate } from "../../lib/utils";
import { Modal } from "../../components/ui/Modal";
import { GoalForm } from "../goals/components/GoalForm";
import { EntryForm } from "../entries/components/EntryForm";
import { AIRecommendationsSection } from "../ai/components/AIRecommendationsSection";
import { WeightChart } from "./components/WeightChart";
import { DemoModeBanner } from "../../components/DemoModeBanner";
import { WorkoutEntry } from "../../types";

export const DashboardView: React.FC = () => {
  const goals = useGoals();
  const workouts = useWorkouts();
  const weightHistory = useWeightHistory();
  const initialize = useFitnessStore((state) => state.initialize);
  const addGoal = useFitnessStore((state) => state.addGoal);
  const addWorkout = useFitnessStore((state) => state.addWorkout);
  const addWeightEntry = useFitnessStore((state) => state.addWeightEntry);
  const removeWorkout = useFitnessStore((state) => state.removeWorkout);
  const resetData = useFitnessStore((state) => state.resetData);

  const stateForSummary = useFitnessStore();
  const summary = selectAnalyticsSummary(stateForSummary);
  const activeGoal = goals[0];

  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isEntryModalOpen, setEntryModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutEntry | null>(null);
  const [entryType, setEntryType] = useState<'workout' | 'weight'>('workout');

  const [isWeightHistoryModalOpen, setWeightHistoryModalOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleGoalSubmit = (data: any) => {
    addGoal({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      currentValue: summary?.weight.currentWeight || 0,
      startValue: summary?.weight.currentWeight || 0,
      status: 'ACTIVE',
      unit: 'кг',
      startDate: new Date().toISOString(),
      ...data,
      targetValue: Number(data.targetValue),
    });
    setGoalModalOpen(false);
  };

  const handleEntrySubmit = (data: any) => {
    if (entryType === 'workout') {
      const workoutId = crypto.randomUUID();
      addWorkout({
        id: workoutId,
        ...data,
        duration: Number(data.duration),
        caloriesBurned: Number(data.caloriesBurned),
        weight: data.weight ? Number(data.weight) : undefined,
      });

      // If weight was also provided during workout
      if (data.weight) {
        addWeightEntry({
          id: crypto.randomUUID(),
          date: data.date || new Date().toISOString(),
          value: Number(data.weight),
          unit: 'кг',
        });
      }
    } else {
      addWeightEntry({
        id: crypto.randomUUID(),
        unit: 'кг',
        ...data,
        value: Number(data.value),
      });
    }
    setEntryModalOpen(false);
  };

  const openWorkoutDetail = (workout: WorkoutEntry) => {
    setSelectedWorkout(workout);
    setDetailModalOpen(true);
  };

  const handleDeleteWorkout = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту тренировку?')) {
      removeWorkout(id);
      setDetailModalOpen(false);
    }
  };

  const handleResetData = () => {
    if (window.confirm('ВНИМАНИЕ! Это действие удалит ВСЕ ваши данные, включая цели и историю. Это невозможно отменить. Вы уверены?')) {
      resetData();
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'IMPROVING') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'DECLINING') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-yellow-400" />;
  };

  return (
    <>
      <div className="space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-display font-medium mb-2 tracking-tight">{RU.NAV.DASHBOARD}</h1>
            <p className="text-muted-foreground">
              {summary ? `Ваш прогресс: ${summary.goal.status === 'AHEAD_OF_SCHEDULE' ? 'Опережаете график' : 'На верном пути'}` : 'Начните добавлять данные для анализа'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <GradientButton 
              variant="secondary"
              onClick={() => { setEntryType('workout'); setEntryModalOpen(true); }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6"
            >
              <Plus className="w-4 h-4" />
              {RU.ENTRIES.ADD_WORKOUT}
            </GradientButton>
            <GradientButton 
              onClick={() => { setEntryType('weight'); setEntryModalOpen(true); }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6"
            >
              <Scale className="w-4 h-4" />
              {RU.ENTRIES.ADD_WEIGHT}
            </GradientButton>
            <button 
              onClick={handleResetData}
              className="p-3 bg-secondary/50 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 rounded-2xl transition-all"
              title="Сбросить прогресс"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </header>

        <DemoModeBanner />

        <DashboardGrid summary={summary} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <GlassCard className="min-h-[400px] flex flex-col p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {RU.DASHBOARD.WEIGHT_TREND}
                </h2>
                <div className="flex items-center gap-4">
                  {summary && (
                    <div className="flex gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      <span className="text-primary border-b border-primary/20 pb-1 flex items-center gap-2">
                        {getTrendIcon(summary.weight.isPlateau ? 'STAGNATING' : (summary.weight.weeklyChange < 0 ? 'IMPROVING' : 'DECLINING'))}
                        ИИ Анализ: {summary.weight.isPlateau ? 'Плато' : (summary.weight.weeklyChange < 0 ? 'Снижение' : 'Стабильно')}
                      </span>
                    </div>
                  )}
                  <button 
                    onClick={() => setWeightHistoryModalOpen(true)}
                    className="text-[10px] uppercase font-bold tracking-widest text-primary hover:text-primary/80 transition-colors bg-primary/10 px-2 py-1 rounded-md"
                  >
                    История
                  </button>
                </div>
              </div>
              <div className="flex-1 mt-4">
                {weightHistory.length > 1 ? (
                  <WeightChart data={weightHistory} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-4">
                    <Scale className="w-12 h-12 text-muted-foreground" />
                    <p className="text-muted-foreground">Добавьте хотя бы два замера веса для анализа динамики</p>
                  </div>
                )}
              </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <GlassCard className="p-6 bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Текущий вес</p>
                    <p className="text-2xl font-bold">{summary?.weight.currentWeight ?? '--'} кг</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {summary?.weight.totalChange !== undefined 
                    ? `Всего ${summary.weight.totalChange < 0 ? 'сброшено' : 'набрано'} ${Math.abs(summary.weight.totalChange).toFixed(1)} кг с начала отслеживания.`
                    : 'Начните регулярно взвешиваться для точного анализа.'}
                </p>
              </GlassCard>

              <GlassCard className="p-6 bg-secondary/30">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Последние замеры</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {weightHistory.slice(0, 3).map((w) => (
                    <div key={w.id} className="flex justify-between items-center text-sm py-1 border-b border-white/5 last:border-0">
                      <span className="text-muted-foreground">{formatDate(w.date)}</span>
                      <span className="font-bold">{w.value} кг</span>
                    </div>
                  ))}
                  {weightHistory.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Данных о весе пока нет</p>
                  )}
                  {weightHistory.length > 3 && (
                    <button 
                      onClick={() => setWeightHistoryModalOpen(true)}
                      className="text-[10px] text-primary hover:underline w-full text-center mt-2"
                    >
                      Смотреть всё
                    </button>
                  )}
                </div>
              </GlassCard>
            </div>

            <AIRecommendationsSection />
          </div>

          <div className="space-y-8">
            <GlassCard className="p-6 border-l-4 border-l-primary relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Sparkles className="w-24 h-24 text-primary" />
              </div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {RU.DASHBOARD.FORECAST}
                </h3>
                <button 
                  onClick={() => setGoalModalOpen(true)}
                  className="p-1 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                >
                  <Target className="w-4 h-4" />
                </button>
              </div>

              {summary?.goal.estimatedCompletionDate ? (
                <div className="relative z-10">
                  <div className="bg-secondary/50 rounded-2xl p-4 mb-4 backdrop-blur-sm">
                    <p className="text-2xl font-bold mb-1">
                      {formatDate(summary.goal.estimatedCompletionDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">Прогноз достижения: <span className="text-foreground font-medium">{activeGoal?.title}</span></p>
                  </div>
                  <div className="w-full bg-secondary h-2.5 rounded-full mb-3 overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(223,255,0,0.3)]" 
                      style={{ width: `${summary.goal.completionPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Завершено</span>
                    <span className="text-primary font-bold">{summary.goal.completionPercentage}%</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 relative z-10">
                  <p className="text-sm text-muted-foreground italic mb-4">Активная цель не установлена или данных недостаточно</p>
                  <GradientButton variant="outline" size="sm" onClick={() => setGoalModalOpen(true)} className="w-full">
                    Установить цель
                  </GradientButton>
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">{RU.ENTRIES.TITLE}</h3>
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                  Последние {workouts.slice(0, 3).length}
                </span>
              </div>
              <div className="space-y-3">
                {workouts.slice(0, 4).map(workout => (
                  <div 
                    key={workout.id} 
                    onClick={() => openWorkoutDetail(workout)}
                    className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-all cursor-pointer group active:scale-[0.98] border border-transparent hover:border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Dumbbell className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{workout.type}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{formatDate(workout.date)}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                ))}
                {workouts.length === 0 && (
                  <div className="text-center py-8 opacity-40">
                    <Dumbbell className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs">Журнал активностей пуст</p>
                  </div>
                )}
              </div>
              <GradientButton variant="outline" className="w-full mt-6" onClick={() => { setEntryType('workout'); setEntryModalOpen(true); }}>
                Все активности
              </GradientButton>
            </GlassCard>
          </div>
        </div>
      </div>

      <Modal isOpen={isGoalModalOpen} onClose={() => setGoalModalOpen(false)} title="Установить цель">
        <GoalForm onSubmit={handleGoalSubmit} />
      </Modal>

      <Modal isOpen={isEntryModalOpen} onClose={() => setEntryModalOpen(false)} title={entryType === 'workout' ? 'Добавить тренировку' : 'Новый замер веса'}>
        <EntryForm type={entryType} onSubmit={handleEntrySubmit} />
      </Modal>

      <Modal isOpen={isWeightHistoryModalOpen} onClose={() => setWeightHistoryModalOpen(false)} title="История взвешиваний">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
          {weightHistory.length > 0 ? (
            weightHistory.map((entry) => (
              <div key={entry.id} className="flex justify-between items-center p-4 bg-secondary/30 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{entry.value} {entry.unit}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{formatDate(entry.date)}</p>
                  </div>
                </div>
                {/* Optional: Add delete button for weight too if needed */}
              </div>
            ))
          ) : (
            <div className="text-center py-12 opacity-40">
              <Scale className="w-12 h-12 mx-auto mb-3" />
              <p>История замеров пуста</p>
            </div>
          )}
        </div>
        <GradientButton 
          className="w-full mt-6" 
          onClick={() => { setWeightHistoryModalOpen(false); setEntryType('weight'); setEntryModalOpen(true); }}
        >
          Добавить замер
        </GradientButton>
      </Modal>

      <Modal isOpen={isDetailModalOpen} onClose={() => setDetailModalOpen(false)} title="Детали активности">
        {selectedWorkout && (
          <div className="space-y-6 p-2">
            <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                <Dumbbell className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold">{selectedWorkout.type}</h4>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedWorkout.date)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/50 p-4 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Длительность
                </div>
                <p className="text-lg font-medium">{selectedWorkout.duration} мин</p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <Flame className="w-3 h-3" />
                  Калории
                </div>
                <p className="text-lg font-medium">{selectedWorkout.caloriesBurned} ккал</p>
              </div>
            </div>

            {selectedWorkout.weight && (
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                  <Scale className="w-3 h-3" />
                  Вес при замере
                </div>
                <p className="text-lg font-medium">{selectedWorkout.weight} кг</p>
              </div>
            )}

            {selectedWorkout.notes && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <FileText className="w-3 h-3" />
                  Заметки
                </div>
                <div className="bg-secondary/30 p-4 rounded-xl text-sm italic">
                  {selectedWorkout.notes}
                </div>
              </div>
            )}

            <button 
              onClick={() => handleDeleteWorkout(selectedWorkout.id)}
              className="w-full flex items-center justify-center gap-2 p-4 text-red-400 hover:bg-red-500/10 rounded-2xl transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Удалить запись
            </button>
          </div>
        )}
      </Modal>
    </>
  );
};
