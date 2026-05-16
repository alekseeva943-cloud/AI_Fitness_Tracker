import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFitnessStore, useGoals, useActiveGoalId } from '../../store/useFitnessStore';
import { useShallow } from 'zustand/shallow';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientButton } from '../../components/ui/GradientButton';
import { Modal } from '../../components/ui/Modal';
import { SidePanel } from '../../components/ui/SidePanel';
import { GoalForm } from './components/GoalForm';
import { Plus, Target, Trash2, Calendar, TrendingUp, ChevronLeft, Edit2, Pause, Play, CheckCircle2, Clock, Sparkles, Star, Dumbbell, Activity, Zap, Info, Scale } from 'lucide-react';
import { GoalType, Goal } from '../../types';
import { cn, formatDate, formatWeight } from '../../lib/utils';
import { selectAnalyticsSummary } from '../analytics/selectors/fitnessSelectors';
import { DataNormalizer } from '../../lib/data-normalizer';
import { MetricChart } from '../dashboard/components/MetricChart';
import { WorkoutDetailModal } from '../entries/components/WorkoutDetailModal';
import { ModalFooter } from '../../components/ui/ModalFooter';
import { METRICS } from '../../constants/metrics';
import { AIRecommendationsSection } from '../ai/components/AIRecommendationsSection';
import { AIGoalInsights } from './components/AIGoalInsights';
import { GoalAchievementReport } from './components/GoalAchievementReport';

export const GoalsView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const allGoals = useGoals();
  const goals = React.useMemo(() => allGoals.filter(g => g.status !== 'ARCHIVED'), [allGoals]);
  const activeGoalId = useActiveGoalId();
  const weightHistory = useFitnessStore((state) => state.weightHistory);
  const workouts = useFitnessStore((state) => state.workouts);
  const removeGoal = useFitnessStore((state) => state.removeGoal);
  const addGoal = useFitnessStore((state) => state.addGoal);
  const updateGoal = useFitnessStore((state) => state.updateGoal);
  const setActiveGoal = useFitnessStore((state) => state.setActiveGoal);
  const profile = useFitnessStore((state) => state.profile);
  const analyses = useFitnessStore(state => state.analyses);
  const summary = React.useMemo(() => {
    return selectAnalyticsSummary({
      profile,
      activeGoalId,
      goals: allGoals,
      workouts,
      weightHistory,
      analyses
    } as any);
  }, [profile, activeGoalId, allGoals, workouts, weightHistory, analyses]);

  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [isEditPanelOpen, setEditPanelOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [isWorkoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [detailMetric, setDetailMetric] = useState<'calories' | 'weight' | 'duration'>('weight');

  const handleCloseDetail = () => {
    setDetailOpen(false);
    // Clear search param to prevent re-opening on next state change
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('id');
      return next;
    });
  };

  useEffect(() => {
    const goalId = searchParams.get('id');
    if (goalId && goals.length > 0) {
      const idToFind = goalId === 'active' ? activeGoalId : goalId;
      const goal = goals.find(g => g.id === idToFind);
      if (goal) {
        setSelectedGoal(goal);
        setDetailOpen(true);
      }
    }
  }, [searchParams, goals, activeGoalId]);

  const handleCreateGoal = (data: any) => {
    addGoal({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      currentValue: summary?.weight?.currentWeight || 0,
      startValue: summary?.weight?.currentWeight || 0,
      status: 'ACTIVE',
      unit: 'кг',
      startDate: new Date().toISOString(),
      ...data,
      targetValue: Number(data.targetValue),
    });
    setModalOpen(false);
  };

  const handleUpdateGoal = (data: any) => {
    if (selectedGoal) {
      updateGoal(selectedGoal.id, data);
      setEditPanelOpen(false);
      // Update selected goal for the detail view if it's open
      setSelectedGoal({ ...selectedGoal, ...data });
    }
  };

  const toggleGoalStatus = (goal: Goal) => {
    const newStatus = goal.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    updateGoal(goal.id, { status: newStatus });
    setSelectedGoal({ ...goal, status: newStatus });
  };

  const openGoalDetail = (goal: Goal) => {
    setSelectedGoal(goal);
    setDetailOpen(true);
  };

  const getStatusBadge = (goal: Goal) => {
    const isActive = goal.id === activeGoalId;
    
    if (isActive) {
      return <span className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest rounded-full border border-primary/40 shadow-[0_0_10px_rgba(223,255,0,0.2)]"><Star className="w-2 h-2 fill-primary" /> Основная</span>;
    }

    switch (goal.status) {
      case 'ACTIVE':
        return <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-blue-500/20"><Play className="w-2 h-2 fill-blue-400" /> Активна</span>;
      case 'SECONDARY':
        return <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-blue-500/20"><Play className="w-2 h-2 fill-blue-400" /> Второстепенная</span>;
      case 'PAUSED':
        return <span className="flex items-center gap-1.5 px-2 py-0.5 bg-muted/20 text-muted-foreground text-[8px] font-black uppercase tracking-widest rounded-full border border-white/10"><Pause className="w-2 h-2 fill-muted-foreground" /> На паузе</span>;
      case 'COMPLETED':
        return <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-green-500/20"><CheckCircle2 className="w-2 h-2" /> Завершена</span>;
      default:
        return null;
    }
  };

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-medium tracking-tight">Мои цели</h1>
            <div className="flex items-center gap-4 text-sm">
               <p className="text-muted-foreground tracking-tight">Управляйте своими стремлениями и отслеживайте прогресс</p>
               <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-1.5">
                     <Scale className="w-3 h-3 text-primary" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Вес:</span>
                  </div>
                  <input 
                     type="number"
                     step="0.1"
                     value={profile?.weight || ''}
                     onChange={(e) => useFitnessStore.getState().updateProfile({ weight: parseFloat(e.target.value) })}
                     className="w-12 bg-transparent text-primary font-bold text-xs border-none focus:outline-hidden"
                  />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">кг</span>
               </div>
            </div>
          </div>
          <GradientButton onClick={() => setModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Добавить цель
          </GradientButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const currentWeight = summary?.weight?.currentWeight ?? goal.currentValue;
          const isActive = goal.id === activeGoalId;
          
          // Semantic progress calculation
          let progress = 0;
          const isWeightLoss = goal.type === GoalType.WEIGHT_LOSS;
          const totalNeeded = isWeightLoss ? goal.startValue - goal.targetValue : goal.targetValue - goal.startValue;
          const actualChange = isWeightLoss ? goal.startValue - currentWeight : currentWeight - goal.startValue;

          if (totalNeeded > 0) {
            progress = Math.max(0, Math.min(100, (actualChange / totalNeeded) * 100));
          }

          // Use summary status only for the primary goal
          // Correct moving direction logic: 
          // If losing weight: goal is improving if current weight <= start weight AND current weight >= target weight (moving down)
          // If gaining weight: goal is improving if current weight >= start weight AND current weight <= target weight (moving up)
          // WRONG_DIRECTION means we are moving AWAY from the target from the STARTING point.
          
          let goalTrendStatus: 'ON_TRACK' | 'WRONG_DIRECTION' = 'ON_TRACK';
          if (isWeightLoss) {
            if (currentWeight > goal.startValue + 0.1) goalTrendStatus = 'WRONG_DIRECTION';
          } else {
            if (currentWeight < goal.startValue - 0.1) goalTrendStatus = 'WRONG_DIRECTION';
          }

          // But for active goal, we can use the summary if it's more sophisticated
          if (isActive && summary) {
            goalTrendStatus = summary.goal.status === 'WRONG_DIRECTION' ? 'WRONG_DIRECTION' : 'ON_TRACK';
          }

          return (
            <GlassCard 
              key={goal.id} 
              onClick={() => openGoalDetail(goal)}
              className={cn(
                "p-6 space-y-6 flex flex-col group cursor-pointer hover:bg-white/5 active:scale-[0.99] transition-all relative overflow-hidden",
                isActive ? "ring-2 ring-primary/40 bg-primary/5 shadow-[0_0_30px_rgba(223,255,0,0.1)]" : "opacity-90 hover:opacity-100",
                (goal.status === 'PAUSED' || goal.status === 'CANCELLED') && "opacity-40 grayscale-[0.8]",
                goal.status === 'COMPLETED' && "border-green-500/20 bg-green-500/5"
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-3 rounded-2xl transition-all duration-500",
                    isActive ? "bg-primary shadow-[0_0_15px_rgba(223,255,0,0.4)] text-black scale-110" : 
                    goalTrendStatus === 'WRONG_DIRECTION' ? "bg-red-500/10 text-red-400" : "bg-primary/10 text-primary"
                  )}>
                    <Target className="w-6 h-6" />
                  </div>
                  {getStatusBadge(goal)}
                </div>
                {isActive && <Sparkles className="w-5 h-5 text-primary animate-pulse" />}
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{goal.title || (isWeightLoss ? 'Снижение веса' : 'Набор массы')}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Создано {formatDate(goal.createdAt)}</span>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                {goal.motivation && (
                  <p className="text-sm text-muted-foreground line-clamp-1 italic px-3 py-2 bg-primary/5 rounded-xl border border-primary/10">
                    "{goal.motivation}"
                  </p>
                )}
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Текущий / Цель</p>
                    <p className="text-lg font-display font-medium">
                      {formatWeight(currentWeight)} / <span className="text-primary">{formatWeight(goal.targetValue)}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Прогресс</p>
                    <p className={cn(
                      "text-lg font-display font-medium",
                      goalTrendStatus === 'WRONG_DIRECTION' ? "text-red-400" : "text-primary"
                    )}>
                      {Math.round(progress)}%
                    </p>
                  </div>
                </div>

                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000 ease-out",
                      goalTrendStatus === 'WRONG_DIRECTION' 
                        ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" 
                        : "bg-linear-to-r from-brand-primary to-brand-secondary shadow-[0_0_10px_rgba(223,255,0,0.3)]"
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                {goal.status === 'PAUSED' ? (
                   <div className="flex items-center gap-2 text-xs text-yellow-500">
                    <Clock className="w-3 h-3" />
                    <span>Отслеживание приостановлено</span>
                  </div>
                ) : goalTrendStatus === 'WRONG_DIRECTION' ? (
                  <div className="flex items-center gap-2 text-xs text-red-400">
                    <TrendingUp className="w-3 h-3 rotate-180" />
                    <span className="font-bold">Движение в обратную сторону</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>На верном пути</span>
                  </div>
                )}
                <div className="text-[10px] uppercase font-bold tracking-widest text-primary group-hover:underline">
                  Детали
                </div>
              </div>
            </GlassCard>
          );
        })}

        {goals.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 py-20 text-center glass rounded-[2.5rem] border-2 border-dashed border-white/5">
            <Target className="w-12 h-12 text-primary/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium text-lg">У вас пока нет активных целей</p>
            <p className="text-muted-foreground text-sm mb-6">Создайте свою первую цель, чтобы начать отслеживать прогресс</p>
            <GradientButton onClick={() => setModalOpen(true)}>Начать сейчас</GradientButton>
          </div>
        )}
      </div>

      <SidePanel 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Новая цель"
      >
        <GoalForm onSubmit={handleCreateGoal} onCancel={() => setModalOpen(false)} />
      </SidePanel>

      <SidePanel 
        isOpen={isEditPanelOpen} 
        onClose={() => setEditPanelOpen(false)} 
        title="Редактирование цели"
      >
        <GoalForm 
          initialData={selectedGoal} 
          onSubmit={handleUpdateGoal} 
          onCancel={() => setEditPanelOpen(false)} 
        />
      </SidePanel>

      <Modal 
        isOpen={isDetailOpen} 
        onClose={handleCloseDetail} 
        title="Детали цели"
        maxWidth="2xl"
      >
        {selectedGoal && (() => {
          const summary = selectAnalyticsSummary(useFitnessStore.getState());
          const baselineMetricId = selectedGoal.metricId || 'weight';
          
          // Latest value for 'Current' display
          const latestValue = DataNormalizer.getLatestMetricValue(useFitnessStore.getState(), baselineMetricId);
          const isAchieved = selectedGoal.status === 'COMPLETED';

          if (isAchieved) {
            return (
              <GoalAchievementReport 
                goal={selectedGoal}
                workouts={workouts}
                weightHistory={weightHistory}
                onArchive={() => {
                  updateGoal(selectedGoal.id, { status: 'ARCHIVED' });
                  handleCloseDetail();
                }}
              />
            );
          }

          const totalDiff = Math.abs(selectedGoal.targetValue - selectedGoal.startValue);
          const currentDiff = Math.abs(latestValue - selectedGoal.startValue);
          const currentProgress = totalDiff > 0 ? Math.min(100, (currentDiff / totalDiff) * 100) : 0;

          const categoryLabels: Record<string, string> = {
            'STRENGTH': 'Силовая',
            'CARDIO': 'Кардио',
            'ENDURANCE': 'Выносливость',
            'FLEXIBILITY': 'Йога и растяжка',
            'OTHER': 'Другое'
          };

          const filteredWorkouts = workouts.filter(w => {
            if (!selectedGoal.workoutTypeFilter) return true;
            return w.category === selectedGoal.workoutTypeFilter;
          }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          return (
            <div className="space-y-8 py-4 max-h-[75vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/10">
              {/* Header Card - Simplified */}
              <div className={cn(
                "p-6 rounded-[2rem] border flex items-center gap-4 group relative overflow-hidden transition-all duration-500",
                selectedGoal.id === activeGoalId ? "bg-primary/10 border-primary/30 shadow-lg" : "bg-secondary/30 border-white/5"
              )}>
                <div className={cn(
                  "p-3 rounded-xl flex items-center justify-center transition-all duration-500",
                  selectedGoal.id === activeGoalId ? "bg-primary text-black" : "bg-primary/20 text-primary"
                )}>
                  <Target className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                     <h3 className="text-xl font-bold font-display">{selectedGoal.title || 'Моя цель'}</h3>
                     {getStatusBadge(selectedGoal)}
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{METRICS[baselineMetricId]?.label || 'Параметр'}</p>
                </div>
              </div>

              {/* Quick Progress Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Старт', value: selectedGoal.startValue },
                  { label: 'Текущий', value: latestValue, highlight: true },
                  { label: 'Цель', value: selectedGoal.targetValue },
                  { label: 'Прогресс', value: `${Math.round(currentProgress)}%`, highlight: true }
                ].map((stat, i) => (
                  <div key={i} className={cn(
                    "p-3 rounded-2xl border border-white/5",
                    stat.highlight ? "bg-primary/5" : "bg-secondary/20"
                  )}>
                    <p className="text-[8px] uppercase font-black tracking-[0.2em] text-muted-foreground/70 mb-1">{stat.label}</p>
                    <p className={cn("text-sm font-black", stat.highlight && "text-primary")}>{stat.value} {!stat.value.toString().includes('%') && selectedGoal.unit}</p>
                  </div>
                ))}
              </div>

              {/* Unified AI Coaching Workspace Block */}
              <AIGoalInsights goalId={selectedGoal.id} />

              {/* Data Layers (Collapsible or just secondary) */}
              <div className="space-y-6 pt-6 border-t border-white/5 opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40">Visual History & Data</h4>
                </div>

                <div className="h-[200px] w-full bg-secondary/10 rounded-3xl p-4 border border-white/5">
                  <MetricChart 
                    data={weightHistory} 
                    workouts={workouts}
                    goal={selectedGoal} 
                    metricId={baselineMetricId}
                    forecastedDate={summary?.goal.estimatedCompletionDate} 
                    unit={METRICS[baselineMetricId]?.unit}
                    onPointClick={(type, id, original) => {
                      if (type === 'workout') {
                        setSelectedWorkout(original);
                        setWorkoutModalOpen(true);
                      }
                    }}
                  />
                </div>
              </div>

              {/* AI Recommendations Section */}
              {selectedGoal.id === activeGoalId && (
                <AIRecommendationsSection variant="compact" />
              )}

              {/* Workouts Section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
                  <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                     <Dumbbell className="w-3 h-3 text-primary" />
                     {selectedGoal.workoutTypeFilter ? `Тренировки: ${categoryLabels[selectedGoal.workoutTypeFilter]}` : 'Все тренировки'}
                  </h4>
                  
                  <div className="flex items-center gap-2 p-1 bg-secondary/30 rounded-xl border border-white/5">
                    <button 
                      onClick={() => setDetailMetric('weight')}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                        detailMetric === 'weight' ? "bg-primary text-black" : "text-muted-foreground hover:text-white"
                      )}
                    >
                      Вес
                    </button>
                    <button 
                      onClick={() => setDetailMetric('calories')}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                        detailMetric === 'calories' ? "bg-primary text-black" : "text-muted-foreground hover:text-white"
                      )}
                    >
                      Ккал
                    </button>
                    <button 
                      onClick={() => setDetailMetric('duration')}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                        detailMetric === 'duration' ? "bg-primary text-black" : "text-muted-foreground hover:text-white"
                      )}
                    >
                      Время
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredWorkouts.slice(0, 5).map(workout => (
                    <div 
                      key={workout.id} 
                      onClick={() => {
                        setSelectedWorkout(workout);
                        setWorkoutModalOpen(true);
                      }}
                      className="flex justify-between items-center p-4 bg-secondary/30 rounded-2xl border border-white/5 group hover:bg-white/5 transition-all text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                         <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                          workout.category === 'STRENGTH' ? "bg-orange-500/10 text-orange-400" :
                          workout.category === 'CARDIO' ? "bg-blue-500/10 text-blue-400" :
                          "bg-primary/20 text-primary"
                        )}>
                          {workout.category === 'STRENGTH' ? <Zap className="w-5 h-5" /> :
                           workout.category === 'CARDIO' ? <Activity className="w-5 h-5" /> :
                           <Dumbbell className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{workout.type}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{formatDate(workout.date)}</p>
                            {workout.duration && <span className="text-[8px] text-primary/60 font-bold">• {workout.duration} МИН</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {detailMetric === 'weight' && (
                          <>
                            <p className="text-sm font-bold text-primary">{workout.weight || '-'}</p>
                            <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">КГ</p>
                          </>
                        )}
                        {detailMetric === 'calories' && (
                          <>
                            <p className="text-sm font-bold text-primary">{workout.caloriesBurned || 0}</p>
                            <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">ККАЛ</p>
                          </>
                        )}
                        {detailMetric === 'duration' && (
                          <>
                            <p className="text-sm font-bold text-primary">{workout.duration || 0}</p>
                            <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">МИН</p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredWorkouts.length === 0 && (
                    <div className="py-8 text-center bg-secondary/10 rounded-2xl border border-dashed border-white/5 opacity-50">
                      <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Нет тренировок в этой категории</p>
                    </div>
                  )}
                </div>
              </div>

              <ModalFooter 
                onBack={handleCloseDetail}
                onEdit={() => {
                  setDetailOpen(false);
                  setEditPanelOpen(true);
                }}
                onDelete={selectedGoal.status === 'PAUSED' || selectedGoal.status === 'COMPLETED' || (selectedGoal.id !== activeGoalId) ? () => {
                  if (window.confirm('Вы уверены, что хотите окончательно удалить эту цель?')) {
                    removeGoal(selectedGoal.id);
                    handleCloseDetail();
                  }
                } : undefined}
                primaryAction={selectedGoal.status === 'COMPLETED' ? {
                  label: 'Возобновить',
                  icon: <Play className="w-4 h-4" />,
                  onClick: () => updateGoal(selectedGoal.id, { status: 'ACTIVE' })
                } : {
                  label: selectedGoal.status === 'PAUSED' ? 'Возобновить' : 'На паузу',
                  icon: selectedGoal.status === 'PAUSED' ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />,
                  onClick: () => toggleGoalStatus(selectedGoal)
                }}
              />
              {selectedGoal.status !== 'COMPLETED' && (
                <button 
                  onClick={() => {
                    updateGoal(selectedGoal.id, { 
                      status: 'COMPLETED',
                      completedAt: new Date().toISOString(),
                      currentValue: latestValue
                    });
                    handleCloseDetail();
                  }}
                  className="w-full py-3 text-[10px] uppercase font-bold tracking-widest text-green-400 hover:text-green-300 transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Отметить как достигнутую
                </button>
              )}
            </div>
          );
        })()}
      </Modal>

      <WorkoutDetailModal 
        isOpen={isWorkoutModalOpen}
        onClose={() => setWorkoutModalOpen(false)}
        workout={selectedWorkout}
      />
    </div>
  );
};
