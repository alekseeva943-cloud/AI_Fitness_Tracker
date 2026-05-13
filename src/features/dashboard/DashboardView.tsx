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
import { Modal } from "../../components/ui/Modal";
import { GoalForm } from "../goals/components/GoalForm";
import { EntryForm } from "../entries/components/EntryForm";
import { AIRecommendationsSection } from "../ai/components/AIRecommendationsSection";
import { MetricChart } from "./components/MetricChart";
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
                    <div>
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        {activeGoal.title || RU.DASHBOARD.WEIGHT_TREND}
                      </h2>
                      <div className="flex gap-2 text-xs font-bold uppercase tracking-widest text-primary/60 mt-1">
                        <span>Старт: {formatWeight(activeGoal.startValue)}</span>
                        <span>•</span>
                        <span>Цель: {formatWeight(activeGoal.targetValue)}</span>
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
                          <div className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 border rounded-full hidden md:flex",
                            summary.weight.isPlateau 
                              ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" 
                              : isImproving 
                                ? "bg-green-500/10 border-green-500/20 text-green-400" 
                                : "bg-red-500/10 border-red-500/20 text-red-400"
                          )}>
                            {summary.weight.isPlateau 
                              ? <Minus className="w-4 h-4" /> 
                              : isImproving 
                                ? <TrendingUp className="w-4 h-4" /> 
                                : <TrendingDown className="w-4 h-4" />}
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                              {summary.weight.isPlateau ? 'Плато' : (isImproving ? (isWeightLoss ? 'Снижение' : 'Подъем') : 'Регресс')}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex-1 mt-4 h-[350px]">
                    {(() => {
                      let chartData: { date: string, value: number }[] = [];
                      if (chartMetric === 'weight') {
                        chartData = weightHistory.map(w => ({ date: w.date, value: w.value }));
                      } else {
                        chartData = workouts
                          .filter(w => w[chartMetric as keyof typeof w])
                          .map(w => ({ date: w.date, value: Number(w[chartMetric as keyof typeof w] || 0) }));
                      }

                      return chartData.length > 0 || (chartMetric === 'weight' && activeGoal) ? (
                        <MetricChart 
                          data={chartData} 
                          goal={chartMetric === 'weight' ? activeGoal : null} 
                          forecastedDate={chartMetric === 'weight' ? summary?.goal.estimatedCompletionDate : null}
                          workouts={workouts}
                          unit={METRICS[chartMetric]?.unit}
                          color={chartMetric === 'weight' ? THEME.colors.primary : chartMetric === 'caloriesBurned' ? THEME.colors.accent : THEME.colors.duration}
                        />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-40 space-y-4">
                          <Activity className="w-12 h-12 text-muted-foreground" />
                          <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest italic">Нет данных для этого показателя</p>
                        </div>
                      );
                    })()}
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
                              "rounded-2xl p-4 backdrop-blur-sm border transition-all group-hover:border-primary/30",
                              summary.goal.status === 'WRONG_DIRECTION' 
                                ? "bg-red-500/5 border-red-500/20" 
                                : "bg-secondary/50 border-white/5"
                            )}>
                              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">
                                {summary.goal.status === 'WRONG_DIRECTION' ? 'Прогноз (восстановление)' : 'Прогноз достижения'}
                              </p>
                              <p className={cn(
                                "text-2xl font-bold",
                                summary.goal.status === 'WRONG_DIRECTION' ? "text-red-400" : "text-primary"
                              )}>
                                {formatDate(summary.goal.estimatedCompletionDate)}
                              </p>
                            </div>
                            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full transition-all duration-1000 ease-out",
                                  summary.goal.status === 'WRONG_DIRECTION' 
                                    ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]" 
                                    : "bg-primary shadow-[0_0_15px_rgba(223,255,0,0.4)]"
                                )}
                                style={{ width: `${summary.goal.completionPercentage}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center px-1">
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                Осталось: {formatWeight(summary.goal.remainingValue)}
                              </p>
                              {summary.goal.status === 'WRONG_DIRECTION' && (
                                <span className="text-[10px] text-red-400/80 font-bold uppercase tracking-widest flex items-center gap-1">
                                  <TrendingDown className="w-3 h-3" /> Текущий спад
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

      <Modal isOpen={isDetailModalOpen} onClose={() => setDetailModalOpen(false)} title="Детали активности">
        {selectedWorkout && (
          <div className="space-y-6 text-foreground min-h-[450px] flex flex-col">
            <div className="flex items-center gap-4 p-5 bg-secondary/30 rounded-3xl border border-white/5">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg",
                selectedWorkout.category === 'STRENGTH' ? "bg-orange-500/20 text-orange-400" :
                selectedWorkout.category === 'CARDIO' ? "bg-blue-500/20 text-blue-400" :
                "bg-primary/20 text-primary"
              )}>
                {selectedWorkout.category === 'STRENGTH' ? <Zap className="w-8 h-8" /> :
                 selectedWorkout.category === 'CARDIO' ? <Activity className="w-8 h-8" /> :
                 <Dumbbell className="w-8 h-8" />}
              </div>
              <div>
                <h4 className="text-2xl font-bold">{selectedWorkout.type}</h4>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedWorkout.date)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/50 p-4 rounded-2xl space-y-1 border border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Длительность
                </div>
                <p className="text-xl font-bold">{selectedWorkout.duration} мин</p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-2xl space-y-1 border border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <Flame className="w-3 h-3" />
                  Калории
                </div>
                <p className="text-xl font-bold">{selectedWorkout.caloriesBurned || 0} ккал</p>
              </div>
            </div>

            {selectedWorkout.category === 'STRENGTH' && selectedWorkout.exercises && selectedWorkout.exercises.length > 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between px-1">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Упражнения</h5>
                  {selectedWorkout.totalWeight && (
                    <span className="text-[10px] font-black text-primary uppercase">Всего: {selectedWorkout.totalWeight} кг</span>
                  )}
                </div>
                <div className="grid gap-3">
                  {selectedWorkout.exercises.map((ex: any, idx: number) => (
                    <div key={ex.id} className="bg-secondary/20 p-4 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold">{ex.name || `Упражнение ${idx + 1}`}</span>
                        <span className="text-xs font-black text-primary/60">{ex.totalWeight} кг</span>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase font-bold text-muted-foreground/60">Сеты</span>
                          <span className="text-xs font-bold">{ex.sets}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase font-bold text-muted-foreground/60">Повт.</span>
                          <span className="text-xs font-bold">{ex.reps}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase font-bold text-muted-foreground/60">Вес</span>
                          <span className="text-xs font-bold text-primary">{ex.weight} кг</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedWorkout.category === 'STRENGTH' && (!selectedWorkout.exercises || selectedWorkout.exercises.length === 0) && (
              <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-secondary/30 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Сеты</p>
                  <p className="text-lg font-bold">{selectedWorkout.sets || '-'}</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Повт.</p>
                  <p className="text-lg font-bold">{selectedWorkout.reps || '-'}</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Вес</p>
                  <p className="text-lg font-bold text-primary">{selectedWorkout.workingWeight || '-'}</p>
                </div>
                {selectedWorkout.totalWeight && (
                  <div className="col-span-3 bg-primary/10 p-4 rounded-2xl border border-primary/20 flex justify-between items-center">
                    <p className="text-xs uppercase font-bold text-primary tracking-widest">Тренировочный объем</p>
                    <p className="text-xl font-bold text-primary">{selectedWorkout.totalWeight} кг</p>
                  </div>
                )}
              </div>
            )}

            {(selectedWorkout.category === 'CARDIO' || selectedWorkout.category === 'ENDURANCE') && (
              <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-secondary/30 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                   <Ruler className="w-4 h-4 mb-2 text-blue-400" />
                   <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Дистанция</p>
                   <p className="text-lg font-bold">{selectedWorkout.distance ? `${selectedWorkout.distance} км` : '-'}</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                   <Activity className="w-4 h-4 mb-2 text-green-400" />
                   <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Темп</p>
                   <p className="text-lg font-bold">{selectedWorkout.pace || '-'}</p>
                </div>
              </div>
            )}

            {selectedWorkout.notes && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <FileText className="w-3 h-3" />
                  Заметки
                </div>
                <div className="bg-secondary/30 p-6 rounded-3xl text-sm italic leading-relaxed border border-white/5">
                  {selectedWorkout.notes}
                </div>
              </div>
            )}

            <ModalFooter 
               onBack={() => setDetailModalOpen(false)}
               onEdit={() => {
                  setDetailModalOpen(false);
                  setEntryType('workout');
                  setEditEntryModalOpen(true);
               }}
               onDelete={() => handleDeleteWorkout(selectedWorkout.id)}
               onClose={() => setDetailModalOpen(false)}
            />
          </div>
        )}
      </Modal>
    </>
  );
};
