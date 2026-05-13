import React, { useEffect, useState } from "react";
import { RU } from "../../constants";
import { DashboardGrid } from "./components/DashboardGrid";
import { GlassCard } from "../../components/ui/GlassCard";
import { GradientButton } from "../../components/ui/GradientButton";
import { ChevronRight, Sparkles, TrendingUp, TrendingDown, Minus, Plus, Target, Dumbbell, Scale } from "lucide-react";
import { useFitnessStore, useGoals, useWorkouts, useWeightHistory } from "../../store/useFitnessStore";
import { selectAnalyticsSummary } from "../analytics/selectors/fitnessSelectors";
import { formatDate } from "../../lib/utils";
import { Modal } from "../../components/ui/Modal";
import { GoalForm } from "../goals/components/GoalForm";
import { EntryForm } from "../entries/components/EntryForm";
import { AIRecommendationsSection } from "../ai/components/AIRecommendationsSection";
import { WeightChart } from "./components/WeightChart";

export const DashboardView: React.FC = () => {
  const goals = useGoals();
  const workouts = useWorkouts();
  const weightHistory = useWeightHistory();
  const initialize = useFitnessStore((state) => state.initialize);
  const addGoal = useFitnessStore((state) => state.addGoal);
  const addWorkout = useFitnessStore((state) => state.addWorkout);
  const addWeightEntry = useFitnessStore((state) => state.addWeightEntry);

  const stateForSummary = useFitnessStore(); // Need full state for summary selector for now or refactor selector
  const summary = selectAnalyticsSummary(stateForSummary);
  const activeGoal = goals[0];

  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isEntryModalOpen, setEntryModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<'workout' | 'weight'>('workout');

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
      addWorkout({
        id: crypto.randomUUID(),
        ...data,
        duration: Number(data.duration),
        caloriesBurned: Number(data.caloriesBurned),
      });
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

  const getTrendIcon = (trend: string) => {
    if (trend === 'IMPROVING') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'DECLINING') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-yellow-400" />;
  };

  return (
    <>
      <div className="space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-display font-medium mb-2">{RU.NAV.DASHBOARD}</h1>
            <p className="text-muted-foreground">
              {summary ? `Ваш прогресс: ${summary.goal.status === 'AHEAD_OF_SCHEDULE' ? 'Опережаете график' : 'На верном пути'}` : 'Начните добавлять данные для анализа'}
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <GradientButton 
              variant="secondary"
              onClick={() => { setEntryType('workout'); setEntryModalOpen(true); }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {RU.ENTRIES.ADD_WORKOUT}
            </GradientButton>
            <GradientButton 
              onClick={() => { setEntryType('weight'); setEntryModalOpen(true); }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2"
            >
              <Scale className="w-4 h-4" />
              {RU.ENTRIES.ADD_WEIGHT}
            </GradientButton>
          </div>
        </header>

        <DashboardGrid summary={summary} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <GlassCard className="min-h-[400px] flex flex-col justify-between p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{RU.DASHBOARD.WEIGHT_TREND}</h2>
                {summary && (
                  <div className="flex gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    <span className="text-primary border-b border-primary pb-1 flex items-center gap-1">
                      {getTrendIcon(summary.weight.isPlateau ? 'STAGNATING' : (summary.weight.weeklyChange < 0 ? 'IMPROVING' : 'DECLINING'))}
                      ИИ Анализ: {summary.weight.isPlateau ? 'Плато' : (summary.weight.weeklyChange < 0 ? 'Снижение' : 'Стабильно')}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 border-t border-border mt-4 pt-6">
                {weightHistory.length > 1 ? (
                  <WeightChart data={weightHistory} />
                ) : (
                  <div className="h-full flex items-center justify-center opacity-50">
                    <p className="text-muted-foreground">Недостаточно данных для графика</p>
                  </div>
                )}
              </div>
            </GlassCard>

            <AIRecommendationsSection />
          </div>

          <div className="space-y-8">
            <GlassCard className="p-6 border-l-4 border-l-primary">
              <div className="flex justify-between items-start mb-4">
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
                <>
                  <div className="bg-secondary/50 rounded-2xl p-4 mb-4">
                    <p className="text-2xl font-bold mb-1">
                      {formatDate(summary.goal.estimatedCompletionDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">Прогноз достижения цели: {activeGoal?.title}</p>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full mb-2 overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-500" 
                      style={{ width: `${summary.goal.completionPercentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Завершено на {summary.goal.completionPercentage}%
                  </p>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground italic mb-4">Активная цель не установлена или данных недостаточно</p>
                  <GradientButton variant="outline" size="sm" onClick={() => setGoalModalOpen(true)}>
                    Добавить цель
                  </GradientButton>
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">{RU.ENTRIES.TITLE}</h3>
              <div className="space-y-3">
                {workouts.slice(0, 3).map(workout => (
                  <div key={workout.id} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
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
                  <p className="text-center text-sm text-muted-foreground py-4">Журнал пуст</p>
                )}
              </div>
              <GradientButton variant="outline" className="w-full mt-6" onClick={() => { setEntryType('workout'); setEntryModalOpen(true); }}>
                {RU.ENTRIES.ADD_WORKOUT}
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
    </>
  );
};
