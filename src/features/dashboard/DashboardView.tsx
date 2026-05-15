import React, { useEffect, useState } from "react";
import { RU } from "../../constants";
import { DashboardGrid } from "./components/DashboardGrid";
import { GlassCard } from "../../components/ui/GlassCard";
import { GradientButton } from "../../components/ui/GradientButton";
import { TrendingUp, TrendingDown, Minus, Plus, Target, Dumbbell, Scale, Clock, Flame, Calendar, FileText, Trash2, ChevronLeft, ChevronRight, Activity, Heart, Ruler, Zap, Sparkles } from "lucide-react";
import { useFitnessStore, useGoals, useActiveGoalId, useWorkouts, useWeightHistory } from "../../store/useFitnessStore";
import { METRICS } from "../../constants/metrics";
import { THEME } from "../../constants/theme";
import { useNavigate } from "react-router-dom";
import { selectAnalyticsSummary } from "../analytics/selectors/fitnessSelectors";
import { cn, formatDate, formatWeight, formatPercent } from "../../lib/utils";
import { DataNormalizer } from "../../lib/data-normalizer";
import { Modal } from "../../components/ui/Modal";
import { GoalForm } from "../goals/components/GoalForm";
import { EntryForm } from "../entries/components/EntryForm";
import { AIRecommendationsSection } from "../ai/components/AIRecommendationsSection";
import { MetricChart } from "./components/MetricChart";
import { WorkoutDetailModal } from "../entries/components/WorkoutDetailModal";
import { DemoModeBanner } from "../../components/DemoModeBanner";
import { BaselineParameters } from "../profile/components/BaselineParameters";
import { ModalFooter } from "../../components/ui/ModalFooter";

export const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const goals = useGoals();
  const activeGoalId = useActiveGoalId();
  const workouts = useWorkouts();
  const weightHistory = useWeightHistory();
  const initialize = useFitnessStore((state) => state.initialize);
  const addGoal = useFitnessStore((state) => state.addGoal);
  const updateGoal = useFitnessStore((state) => state.updateGoal);
  const setActiveGoal = useFitnessStore((state) => state.setActiveGoal);
  const addWorkout = useFitnessStore((state) => state.addWorkout);
  const updateWorkout = useFitnessStore((state) => state.updateWorkout);
  const addWeightEntry = useFitnessStore((state) => state.addWeightEntry);
  const updateWeightEntry = useFitnessStore((state) => state.updateWeightEntry);
  const removeWorkout = useFitnessStore((state) => state.removeWorkout);
  const removeWeightEntry = useFitnessStore((state) => state.removeWeightEntry);
  const resetData = useFitnessStore((state) => state.resetData);

  const stateForSummary = useFitnessStore();
  const summary = selectAnalyticsSummary(stateForSummary);
  const activeGoal = goals.find(g => g.id === activeGoalId);

  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isEntryModalOpen, setEntryModalOpen] = useState(false);
  const [isEditEntryModalOpen, setEditEntryModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [entryType, setEntryType] = useState<'workout' | 'weight'>('workout');
  const [chartMetric, setChartMetric] = useState<string>('weight');

  const [isWeightHistoryModalOpen, setWeightHistoryModalOpen] = useState(false);
  const [isWeightDetailModalOpen, setWeightDetailModalOpen] = useState(false);
  const [isWeightEditModalOpen, setWeightEditModalOpen] = useState(false);
  const [selectedWeightEntry, setSelectedWeightEntry] = useState<any>(null);
  const [isInsightModalOpen, setInsightModalOpen] = useState(false);
  const [isGoalHistoryModalOpen, setGoalHistoryModalOpen] = useState(false);
  const [insightType, setInsightType] = useState<'progress' | 'regression' | 'plateau' | 'ahead'>('progress');

  const openInsight = (type: any) => {
    setInsightType(type);
    setInsightModalOpen(true);
  };

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleGoalSubmit = (data: any) => {
    if (data.id) {
      updateGoal(data.id, data);
    } else {
      const goalId = crypto.randomUUID();
      addGoal({
        ...data,
        id: goalId,
        createdAt: new Date().toISOString(),
        currentValue: data.startValue || summary?.weight?.currentWeight || 0,
        startValue: data.startValue || summary?.weight?.currentWeight || 0,
        status: 'ACTIVE',
        startDate: new Date().toISOString(),
      });

      // Update profile baselines if measurements were provided
      if (data.baselineMeasurements) {
        Object.entries(data.baselineMeasurements).forEach(([id, value]) => {
          if (value) {
            useFitnessStore.getState().updateBaseline({
              id,
              name: METRICS[id]?.label || id,
              value: Number(value),
              unit: METRICS[id]?.unit || '',
              date: new Date().toISOString()
            });
          }
        });
      }
    }
    setGoalModalOpen(false);
  };

  const handleEntrySubmit = (data: any) => {
    if (entryType === 'workout') {
      const workoutId = crypto.randomUUID();
      addWorkout({
        ...data,
        id: workoutId,
      });

      // If weight was also provided during workout
      if (data.weight) {
        addWeightEntry({
          id: crypto.randomUUID(),
          date: data.date || new Date().toISOString(),
          value: data.weight,
          unit: 'кг',
        });
      }
    } else {
      addWeightEntry({
        id: crypto.randomUUID(),
        unit: 'кг',
        ...data,
      });

      // Update baselines for any provided body measurements
      Object.entries(data).forEach(([key, value]) => {
        const metric = METRICS[key];
        if (metric && metric.category === 'BODY' && key !== 'weight' && value) {
          useFitnessStore.getState().updateBaseline({
            id: key,
            name: metric.label,
            value: Number(value),
            unit: metric.unit,
            date: data.date || new Date().toISOString()
          });
        }
      });
    }
    setEntryModalOpen(false);
  };

  const handleEditEntrySubmit = (data: any) => {
    if (entryType === 'workout') {
      updateWorkout(data.id, data);
    } else {
      updateWeightEntry(data.id, data);
    }
    setEditEntryModalOpen(false);
    setWeightEditModalOpen(false);
    
    // Update local state for details if open
    if (entryType === 'workout') setSelectedWorkout(data);
    else setSelectedWeightEntry(data);
  };

  const openWorkoutDetail = (workout: any) => {
    setSelectedWorkout(workout);
    setDetailModalOpen(true);
  };

  const handleDeleteWorkout = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту тренировку?')) {
      removeWorkout(id);
      setDetailModalOpen(false);
    }
  };

  const handleDeleteWeightEntry = (id: string) => {
    if (window.confirm('Удалить эту запись о весе?')) {
      removeWeightEntry(id);
      setWeightDetailModalOpen(false);
    }
  };

  const handleResetData = () => {
    if (window.confirm('ВНИМАНИЕ! Это действие удалит ВСЕ ваши данные, включая цели и историю. Это невозможно отменить. Вы уверены?')) {
      resetData();
    }
  };

  return (
    <>
      <div className="space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-display font-medium mb-2 tracking-tight">{RU.NAV.DASHBOARD}</h1>
            <p className="text-muted-foreground">
              {activeGoal ? (
                summary?.goal.status === 'WRONG_DIRECTION' 
                  ? 'Текущая динамика противоречит вашей цели' 
                  : summary?.goal.status === 'AHEAD_OF_SCHEDULE' 
                    ? 'Вы опережаете поставленный график' 
                    : 'Ваш прогресс соответствует намеченному плану'
              ) : 'Выберите основную цель для аналитики'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <GradientButton 
              variant="secondary"
              onClick={() => { setEntryType('workout'); setEntryModalOpen(true); }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6"
              title="Добавить новую тренировку в журнал"
            >
              <Plus className="w-4 h-4" />
              {RU.ENTRIES.ADD_WORKOUT}
            </GradientButton>
            <GradientButton 
              onClick={() => { setEntryType('weight'); setEntryModalOpen(true); }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6"
              title="Зафиксировать текущий вес"
            >
              <Scale className="w-4 h-4" />
              {RU.ENTRIES.ADD_WEIGHT}
            </GradientButton>
            <button 
              onClick={handleResetData}
              className="p-3 bg-secondary/50 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 rounded-2xl transition-all"
              title="Полный сброс всех данных"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </header>

        <DemoModeBanner />

        {activeGoal ? (
          <>
            <DashboardGrid summary={summary} activeGoal={activeGoal} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <GlassCard className="min-h-[400px] flex flex-col p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div 
                      className="cursor-pointer group/title" 
                      onClick={() => setGoalHistoryModalOpen(true)}
                    >
                      <h2 className="text-xl font-semibold flex items-center gap-2 group-hover/title:text-primary transition-colors">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        {activeGoal.title || RU.DASHBOARD.WEIGHT_TREND}
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover/title:opacity-100 transition-all -ml-1" />
                      </h2>
                      <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40 mt-3 pt-3 border-t border-white/5">
                        <div className="flex flex-col gap-0.5">
                           <span className="opacity-40 text-[8px]">Старт</span>
                           <span className="text-foreground text-sm font-bold">
                              {summary?.weight.startingWeight || activeGoal.startValue || 0} {activeGoal.unit}
                           </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                           <span className="text-primary text-[8px]">Текущий</span>
                           <span className="text-primary text-sm font-bold">
                              {(() => {
                                // weightHistory is sorted newest-first, so index 0 is newest
                                const latest = [...weightHistory].find(h => h.value > 0);
                                return latest?.value || activeGoal.currentValue || activeGoal.startValue || 0;
                              })()} {activeGoal.unit}
                           </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                           <span className="opacity-40 text-[8px]">Цель</span>
                           <span className="text-foreground text-sm font-bold">{activeGoal.targetValue} {activeGoal.unit}</span>
                        </div>
                      </div>
                      {activeGoal.baselineMeasurements && Object.keys(activeGoal.baselineMeasurements).length > 0 && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                          {Object.entries(activeGoal.baselineMeasurements).map(([id, val]) => (
                            <div key={id} className="flex items-center gap-1.5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                              <span className="text-[10px]">{METRICS[id]?.icon}</span>
                              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                {METRICS[id]?.label}: <span className="text-foreground">{val} {METRICS[id]?.unit}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 p-1 bg-secondary/30 rounded-xl border border-white/5 mr-2">
                        <button 
                          onClick={() => setChartMetric('weight')}
                          className={cn(
                            "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                            chartMetric === 'weight' ? "bg-primary text-black" : "text-muted-foreground hover:text-white"
                          )}
                        >
                          Вес
                        </button>
                        {activeGoal && activeGoal.metricId !== 'weight' && activeGoal.metricId !== 'caloriesBurned' && activeGoal.metricId !== 'duration' && (
                          <button 
                             onClick={() => setChartMetric(activeGoal.metricId)}
                             className={cn(
                               "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border border-primary/20",
                               chartMetric === activeGoal.metricId ? "bg-primary text-black border-transparent" : "text-primary hover:bg-primary/10"
                             )}
                          >
                             {METRICS[activeGoal.metricId]?.label || 'Цель'}
                          </button>
                        )}
                        <button 
                          onClick={() => setChartMetric('caloriesBurned')}
                          className={cn(
                            "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                            chartMetric === 'caloriesBurned' ? "bg-primary text-black" : "text-muted-foreground hover:text-white"
                          )}
                        >
                          Ккал
                        </button>
                        <button 
                          onClick={() => setChartMetric('duration')}
                          className={cn(
                            "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                            chartMetric === 'duration' ? "bg-primary text-black" : "text-muted-foreground hover:text-white"
                          )}
                        >
                          Время
                        </button>
                      </div>

                      {summary && (() => {
                        const isWeightLoss = activeGoal.type === 'WEIGHT_LOSS';
                        const isImproving = isWeightLoss 
                          ? summary.weight.weeklyChange < 0 
                          : summary.weight.weeklyChange > 0;

                        return (
                          <div className="flex items-center gap-2">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const type = summary.weight.isPlateau 
                                        ? 'plateau' 
                                        : isImproving ? (summary.goal.status === 'AHEAD_OF_SCHEDULE' ? 'ahead' : 'progress') : 'regression';
                                    openInsight(type);
                                }}
                                className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 border rounded-full hover:scale-105 active:scale-95 transition-all cursor-help shadow-lg",
                                summary.weight.isPlateau 
                                  ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400 shadow-yellow-500/5" 
                                  : isImproving 
                                    ? "bg-green-500/10 border-green-500/20 text-green-400 shadow-green-500/5" 
                                    : "bg-red-500/10 border-red-500/20 text-red-400 shadow-red-500/5"
                            )}>
                                {summary.weight.isPlateau 
                                  ? <Minus className="w-4 h-4" /> 
                                  : isImproving 
                                    ? <TrendingUp className="w-4 h-4" /> 
                                    : <TrendingDown className="w-4 h-4" />}
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                  {summary.weight.isPlateau ? 'Плато' : (isImproving ? (isWeightLoss ? 'Снижение' : 'Подъем') : 'Регресс')}
                                </span>
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex-1 mt-4 min-h-[400px]">
                    <div
                      className="w-full h-[400px] bg-secondary/20 rounded-[32px] border border-white/5 overflow-hidden"
                    >
                      <MetricChart 
                        data={weightHistory} 
                        workouts={workouts}
                        goal={activeGoal && chartMetric === activeGoal.metricId ? activeGoal : null} 
                        metricId={chartMetric}
                        forecastedDate={activeGoal && chartMetric === activeGoal.metricId ? summary?.goal.estimatedCompletionDate : null}
                        unit={METRICS[chartMetric]?.unit}
                        onPointClick={(type, id, original) => {
                          if (type === 'workout') {
                            openWorkoutDetail(original);
                          } else {
                            setSelectedWeightEntry(original);
                            setWeightDetailModalOpen(true);
                          }
                        }}
                      />
                    </div>
                  </div>
                </GlassCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <GlassCard className="p-6 bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all cursor-pointer group" onClick={() => setWeightHistoryModalOpen(true)}>
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                            <Scale className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Текущий вес</p>
                            <p className="text-3xl font-bold">{formatWeight(summary?.weight.currentWeight ?? 0)}</p>
                          </div>
                        </div>
                        {summary?.weight.weeklyChange !== undefined && (
                          <div className={cn(
                            "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg",
                            summary.goal.status === 'WRONG_DIRECTION' ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
                          )}>
                            {summary.weight.weeklyChange < 0 ? "−" : "+"}{Math.abs(summary.weight.weeklyChange).toFixed(1)}/нед
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-2">
                           <Calendar className="w-3 h-3" />
                           Последние замеры
                        </p>
                        <div className="space-y-2">
                          {weightHistory.slice(0, 3).map((w) => (
                            <div 
                              key={w.id} 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedWeightEntry(w);
                                setWeightDetailModalOpen(true);
                              }}
                              className="flex justify-between items-center text-xs py-2 border-b border-white/5 last:border-0 group-hover:border-primary/10 hover:bg-white/5 px-1 rounded transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{formatDate(w.date)}</span>
                                {w.notes && <FileText className="w-3 h-3 text-primary/40" />}
                              </div>
                              <span className="font-bold">{w.value} кг</span>
                            </div>
                          ))}
                          {weightHistory.length === 0 && (
                            <p className="text-xs text-muted-foreground italic">Данных пока нет</p>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </div>

                  <div className="space-y-6">
                    <GlassCard 
                      className="p-6 h-full flex flex-col justify-between border-l-4 border-l-primary relative overflow-hidden cursor-pointer hover:bg-primary/5 transition-all group"
                      onClick={() => navigate(activeGoal ? `/goals?id=${activeGoal.id}` : '/goals')}
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                        <Sparkles className="w-24 h-24 text-primary" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                              <Target className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground group-hover:text-primary/60 transition-colors">Прогресс цели</p>
                              <p className="text-3xl font-bold">{formatPercent(summary?.goal.completionPercentage ?? 0)}</p>
                            </div>
                          </div>
                          <div className="p-2 hover:bg-white/5 rounded-xl text-muted-foreground group-hover:text-primary transition-colors">
                            <Target className="w-5 h-5" />
                          </div>
                        </div>

            {summary?.goal.estimatedCompletionDate ? (
                          <div className="space-y-4">
                            <div className={cn(
                              "rounded-3xl p-5 backdrop-blur-xl border-2 transition-all group-hover:border-primary/20 bg-black/20",
                              summary.goal.status === 'WRONG_DIRECTION' 
                                ? "border-red-500/20" 
                                : "border-white/5"
                            )}>
                              <div className="flex justify-between items-start mb-2">
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                                  {summary.goal.status === 'WRONG_DIRECTION' ? 'Прогноз (стабилизация)' : 'Дата завершения'}
                                </p>
                                {summary.goal.status === 'AHEAD_OF_SCHEDULE' && (
                                    <span className="text-[8px] bg-primary text-black px-1.5 py-0.5 rounded font-black">FAST</span>
                                )}
                              </div>
                              <p className={cn(
                                "text-3xl font-display font-medium",
                                summary.goal.status === 'WRONG_DIRECTION' ? "text-red-400/80" : "text-white"
                              )}>
                                {formatDate(summary.goal.estimatedCompletionDate)}
                              </p>
                              {summary.goal.status !== 'WRONG_DIRECTION' && (
                                  <p className="text-[9px] text-primary font-bold mt-1 tracking-wider">
                                     ОСТАЛОСЬ ~{Math.abs(Math.round(summary.goal.remainingValue / (summary.weight.weeklyChange || 1)))} НЕДЕЛЬ
                                  </p>
                              )}
                            </div>
                            <div className="w-full bg-secondary/50 h-3 rounded-full overflow-hidden border border-white/5">
                              <div 
                                className={cn(
                                  "h-full transition-all duration-1000 ease-out",
                                  summary.goal.status === 'WRONG_DIRECTION' 
                                    ? "bg-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]" 
                                    : "bg-primary shadow-[0_0_20px_rgba(223,255,0,0.3)]"
                                )}
                                style={{ width: `${Math.min(100, Math.max(2, summary.goal.completionPercentage))}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center px-1">
                              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                                Осталось: {formatWeight(summary.goal.remainingValue)}
                              </p>
                              {summary.goal.status === 'WRONG_DIRECTION' && (
                                <span className="text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-1 animate-pulse">
                                  <TrendingDown className="w-3 h-3" /> ОТКЛОНЕНИЕ
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground italic mb-6 leading-relaxed">
                              {summary?.goal.status === 'WRONG_DIRECTION' 
                                ? "Текущая динамика направлена в обратную сторону. Для прогноза необходимо стабилизировать прогресс."
                                : "Добавьте больше данных (минимум 3-5 замеров) для активации аналитического прогноза."}
                            </p>
                            <GradientButton variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setGoalModalOpen(true); }} className="w-full">
                               Изменить цель
                            </GradientButton>
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  </div>
                </div>

                <AIRecommendationsSection />
                <BaselineParameters />
              </div>

              <div className="space-y-8">
                <GlassCard className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">{RU.ENTRIES.TITLE}</h3>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                      Последние {workouts.slice(0, 4).length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {workouts.slice(0, 5).map(workout => (
                      <div 
                        key={workout.id} 
                        onClick={() => openWorkoutDetail(workout)}
                        className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-all cursor-pointer group active:scale-[0.98] border border-transparent hover:border-border/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                            workout.category === 'STRENGTH' ? "bg-orange-500/10 text-orange-400" :
                            workout.category === 'CARDIO' ? "bg-blue-500/10 text-blue-400" :
                            workout.category === 'ENDURANCE' ? "bg-green-500/10 text-green-400" :
                            "bg-secondary/50 text-primary"
                          )}>
                            {workout.category === 'STRENGTH' ? <Zap className="w-5 h-5" /> :
                             workout.category === 'CARDIO' ? <Activity className="w-5 h-5" /> :
                             <Dumbbell className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{workout.type}</p>
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest">
                                <Calendar className="w-3 h-3 text-primary/60" />
                                {formatDate(workout.date)}
                              </span>
                              {workout.totalWeight && <span className="text-[9px] px-1.5 py-0.5 bg-primary/10 rounded text-primary font-bold">{Math.round(workout.totalWeight)}кг</span>}
                              {workout.distance && <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 rounded text-blue-400 font-bold">{workout.distance}км</span>}
                            </div>
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
                  <GradientButton variant="outline" className="w-full mt-6" onClick={() => navigate('/workouts')}>
                    Все активности
                  </GradientButton>
                </GlassCard>

                <GlassCard className="p-6 bg-gradient-to-br from-primary/5 to-transparent border border-primary/10">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-primary" />
                    ИИ Помощник
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {summary ? (
                      summary.goal.status === 'WRONG_DIRECTION'
                        ? "Динамика противоречит цели. Обратите внимание на баланс питания и интенсивность тренировок."
                        : summary.goal.status === 'AHEAD_OF_SCHEDULE' 
                          ? "Опережаете график! Ваш прогресс идет быстрее, чем планировалось изначально."
                          : summary.weight.isPlateau 
                            ? "Замечено замедление прогресса. Попробуйте изменить тип нагрузки или пересмотреть калорийность рациона для преодоления плато."
                            : summary.weight.weeklyChange < 0 
                              ? (activeGoal.type === 'WEIGHT_LOSS' ? "Отличная динамика! Вы теряете вес в здоровом темпе." : "Вес снижается, что противоречит цели набора массы.")
                              : (activeGoal.type === 'MUSCLE_GAIN' ? "Хороший рост! Вы уверенно прибавляете в весе." : "Вес немного вырос. Если ваша цель — похудение, проверьте дневник питания.")
                    ) : "Добавьте больше данных, чтобы ИИ смог составить рекомендации для вас."}
                  </p>
                  <div className={cn(
                    "flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest",
                    summary?.goal.status === 'WRONG_DIRECTION' ? "text-red-400" : "text-primary"
                  )}>
                    <Target className="w-3 h-3" />
                    {summary?.goal.status === 'WRONG_DIRECTION' 
                      ? "Требуется корректировка" 
                      : summary?.goal.status === 'AHEAD_OF_SCHEDULE' 
                        ? "Опережение графика" 
                        : "План соблюдается"}
                  </div>
                </GlassCard>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative bg-secondary/50 border border-white/5 p-10 rounded-[40px] backdrop-blur-xl">
                 <Target className="w-20 h-20 text-primary animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">Выберите цель для аналитики</h2>
              <p className="text-muted-foreground leading-relaxed">
                Чтобы мы могли анализировать ваш прогресс, прогнозировать результаты и давать рекомендации, выберите или создайте основную цель.
              </p>
            </div>
            <div className="flex flex-col w-full gap-3">
              <GradientButton className="w-full flex items-center justify-center gap-2" onClick={() => navigate('/goals')}>
                {goals.length > 0 ? 'Перейти к списку целей' : 'Создать первую цель'}
                <ChevronRight className="w-4 h-4" />
              </GradientButton>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isGoalHistoryModalOpen} onClose={() => setGoalHistoryModalOpen(false)} title={`История: ${activeGoal?.title}`}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin text-foreground">
          {(() => {
            if (!activeGoal) return null;
            
            // Merge measurements and relevant workouts
            const measurements = weightHistory.map(w => ({
              id: w.id,
              date: w.date,
              value: w.value,
              unit: w.unit,
              type: 'MEASUREMENT',
              notes: w.notes,
              original: w
            }));

            const relevantWorkouts = workouts
              .filter(w => {
                 if (activeGoal.metricId === 'weight') return true; // Show all if goal is weight? Or only weight entries?
                 // Actually user said "all workouts on which it's based"
                 if (activeGoal.metricId === 'caloriesBurned' || activeGoal.metricId === 'duration') return true;
                 
                 // For specific exercise goals
                 if (w.category === 'STRENGTH' && w.exercises) {
                    return w.exercises.some((ex: any) => ex.weight && ex.name?.toLowerCase().includes(METRICS[activeGoal.metricId]?.label?.toLowerCase() || ''));
                 }
                 return w[activeGoal.metricId as keyof typeof w];
              })
              .map(w => {
                let val = Number(w[activeGoal.metricId as keyof typeof w] || 0);
                if (val === 0 && w.category === 'STRENGTH' && w.exercises) {
                  const ex = w.exercises.find((e: any) => e.name?.toLowerCase().includes(METRICS[activeGoal.metricId]?.label?.toLowerCase() || ''));
                  if (ex) val = ex.weight;
                }
                
                return {
                  id: w.id,
                  date: w.date,
                  value: val,
                  unit: METRICS[activeGoal.metricId]?.unit || '',
                  type: 'WORKOUT',
                  workoutType: w.type,
                  workoutCategory: w.category,
                  notes: w.notes,
                  original: w
                };
              });

            const allPoints = [...measurements, ...relevantWorkouts].sort((a, b) => 
               new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            if (allPoints.length === 0) {
              return (
                <div className="text-center py-12 opacity-40">
                  <Activity className="w-12 h-12 mx-auto mb-3" />
                  <p>Данных пока нет</p>
                </div>
              );
            }

            return allPoints.map((point) => (
              <div 
                key={`${point.type}-${point.id}`}
                onClick={() => {
                  setGoalHistoryModalOpen(false);
                  if (point.type === 'WORKOUT') {
                    openWorkoutDetail(point.original);
                  } else {
                    setSelectedWeightEntry(point.original);
                    setWeightDetailModalOpen(true);
                  }
                }}
                className={cn(
                  "flex flex-col p-4 bg-secondary/30 rounded-2xl border border-white/5 hover:bg-white/5 cursor-pointer transition-all",
                  point.type === 'WORKOUT' ? "border-l-4 border-l-primary/40" : "border-l-4 border-l-blue-400/40"
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      point.type === 'WORKOUT' ? "bg-primary/20 text-primary" : "bg-blue-500/20 text-blue-400"
                    )}>
                      {point.type === 'WORKOUT' ? <Dumbbell className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-lg">
                        {point.value} {point.unit}
                        <span className="ml-2 text-[10px] font-black uppercase text-muted-foreground tracking-tighter">
                          {point.type === 'WORKOUT' ? (point as any).workoutType : 'Замер'}
                        </span>
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{formatDate(point.date)}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
                {point.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-2 pl-12 border-l border-white/5 italic">
                    {point.notes}
                  </p>
                )}
              </div>
            ));
          })()}
        </div>
        <GradientButton 
          className="w-full mt-6" 
          onClick={() => { setGoalHistoryModalOpen(false); setEntryModalOpen(true); }}
        >
          Добавить запись
        </GradientButton>
      </Modal>

      <Modal isOpen={isInsightModalOpen} onClose={() => setInsightModalOpen(false)} title="Анализ динамики">
        <div className="space-y-6 text-foreground">
          <div className={cn(
            "p-6 rounded-3xl border flex items-center gap-5",
            insightType === 'regression' ? "bg-red-500/10 border-red-500/20 text-red-400" :
            insightType === 'ahead' ? "bg-primary/20 border-primary/30 text-primary" :
            insightType === 'plateau' ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
            "bg-green-500/10 border-green-500/20 text-green-400"
          )}>
            <div className="w-16 h-16 rounded-2xl bg-black/20 flex items-center justify-center">
              {insightType === 'regression' ? <TrendingDown className="w-8 h-8" /> :
               insightType === 'plateau' ? <Minus className="w-8 h-8" /> :
               <TrendingUp className="w-8 h-8" />}
            </div>
            <div>
              <h4 className="text-xl font-bold uppercase tracking-tight">
                {insightType === 'regression' ? 'Обнаружен регресс' :
                 insightType === 'plateau' ? 'Состояние плато' :
                 insightType === 'ahead' ? 'Опережение графика' : 'Уверенный прогресс'}
              </h4>
              <p className="text-xs opacity-70 font-medium mt-1">
                {insightType === 'regression' ? 'Текущий тренд отдаляет вас от цели' :
                 insightType === 'plateau' ? 'Вес стабилизировался, динамика отсутствует' :
                 'Вы движетесь в правильном направлении'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/30 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Темп в неделю</p>
              <p className={cn(
                "text-2xl font-bold",
                summary?.weight.weeklyChange && (
                    (activeGoal?.type === 'WEIGHT_LOSS' && summary.weight.weeklyChange > 0) ||
                    (activeGoal?.type === 'MUSCLE_GAIN' && summary.weight.weeklyChange < 0)
                ) ? "text-red-400" : "text-primary"
              )}>
                {summary?.weight.weeklyChange && summary.weight.weeklyChange > 0 ? '+' : ''}
                {summary?.weight.weeklyChange?.toFixed(1) || '0.0'} кг
              </p>
            </div>
            <div className="bg-secondary/30 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">До цели осталось</p>
              <p className="text-2xl font-bold">{summary?.goal.remainingValue.toFixed(1)} кг</p>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-primary" />
                Что это значит для вас?
            </h5>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-sm leading-relaxed">
              {insightType === 'regression' && (
                <p>Ваши последние замеры показывают набор веса, в то время как ваша цель — похудение. Это может быть связано с избытком калорий, задержкой воды после тренировок или стрессом. **Рекомендация:** Проверьте дневник питания и убедитесь, что вы находитесь в дефиците.</p>
              )}
              {insightType === 'plateau' && (
                <p>Вес не меняется более 7 дней. Это естественная адаптация организма. **Рекомендация:** Попробуйте "читмил" для разгона метаболизма или, наоборот, повысьте интенсивность кардио на 15-20%.</p>
              )}
              {insightType === 'ahead' && (
                <p>Вы теряете вес быстрее запланированного (более 1 кг в неделю). Это отличный результат, но следите за самочувствием, чтобы не терять мышечную массу. **Рекомендация:** Убедитесь, что вы потребляете достаточное количество белка.</p>
              )}
              {insightType === 'progress' && (
                <p>Ваша динамика идеальна. Вы движетесь точно по графику. Продолжайте в том же духе, вы достигнете цели ориентировочно через {summary?.goal.remainingValue && summary?.weight.weeklyChange ? Math.abs(Math.round(summary.goal.remainingValue / summary.weight.weeklyChange)) : '??'} недель.</p>
              )}
            </div>
          </div>

          <GradientButton onClick={() => setInsightModalOpen(false)} className="w-full">
            Понятно
          </GradientButton>
        </div>
      </Modal>

      <Modal 
        isOpen={isGoalModalOpen} 
        onClose={() => setGoalModalOpen(false)} 
        title={activeGoal ? "Редактировать цель" : "Установить цель"}
      >
        <GoalForm key={activeGoal?.id || 'new-goal'} initialData={activeGoal} onSubmit={handleGoalSubmit} onCancel={() => setGoalModalOpen(false)} />
      </Modal>

      <Modal isOpen={isEntryModalOpen} onClose={() => setEntryModalOpen(false)} title={entryType === 'workout' ? 'Добавить тренировку' : 'Новый замер веса'}>
        <EntryForm 
           key={`new-${entryType}`}
           type={entryType} 
           onSubmit={handleEntrySubmit} 
        />
      </Modal>

      <Modal isOpen={isEditEntryModalOpen} onClose={() => setEditEntryModalOpen(false)} title={entryType === 'workout' ? 'Редактировать тренировку' : 'Редактировать замер'}>
        <EntryForm 
           key={entryType === 'workout' ? selectedWorkout?.id : selectedWeightEntry?.id}
           type={entryType} 
           initialData={entryType === 'workout' ? selectedWorkout : selectedWeightEntry} 
           onSubmit={handleEditEntrySubmit} 
        />
      </Modal>

      <Modal isOpen={isWeightHistoryModalOpen} onClose={() => setWeightHistoryModalOpen(false)} title="История взвешиваний">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin text-foreground">
          {weightHistory.length > 0 ? (
            weightHistory.map((entry) => (
              <div 
                key={entry.id} 
                onClick={() => {
                  setSelectedWeightEntry(entry);
                  setWeightDetailModalOpen(true);
                }}
                className="flex flex-col p-4 bg-secondary/30 rounded-2xl border border-white/5 hover:bg-white/5 cursor-pointer transition-all"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{entry.value} {entry.unit}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{formatDate(entry.date)}</p>
                    </div>
                  </div>
                  {entry.notes && (
                    <div className="p-2 bg-primary/20 rounded-lg text-primary">
                      <FileText className="w-4 h-4" />
                    </div>
                  )}
                </div>
                {entry.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-2 pl-12 border-l border-primary/20 italic">
                    {entry.notes}
                  </p>
                )}
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

      <Modal isOpen={isWeightDetailModalOpen} onClose={() => setWeightDetailModalOpen(false)} title="Детали замера">
        {selectedWeightEntry && (
          <div className="space-y-6 text-foreground min-h-[300px] flex flex-col">
            <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-2xl border border-white/10">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                <Scale className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold">{selectedWeightEntry.value} {selectedWeightEntry.unit}</h4>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedWeightEntry.date)}
                </div>
              </div>
            </div>

            {selectedWeightEntry.notes && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <FileText className="w-3 h-3" />
                  Контекст замера
                </div>
                <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl text-sm leading-relaxed italic">
                  {selectedWeightEntry.notes}
                </div>
              </div>
            )}
            
            <ModalFooter 
               onBack={() => setWeightDetailModalOpen(false)}
               onEdit={() => {
                  setWeightDetailModalOpen(false);
                  setEntryType('weight');
                  setEditEntryModalOpen(true);
               }}
               onDelete={() => handleDeleteWeightEntry(selectedWeightEntry.id)}
               onClose={() => setWeightDetailModalOpen(false)}
            />
          </div>
        )}
      </Modal>

      <WorkoutDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        workout={selectedWorkout}
        onEdit={(w) => {
          setDetailModalOpen(false);
          setEntryType('workout');
          setEditEntryModalOpen(true);
        }}
        onDelete={(id) => handleDeleteWorkout(id)}
      />
    </>
  );
};
