import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFitnessStore, useGoals } from '../../store/useFitnessStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientButton } from '../../components/ui/GradientButton';
import { Modal } from '../../components/ui/Modal';
import { GoalForm } from './components/GoalForm';
import { Plus, Target, Trash2, Calendar, TrendingUp, ChevronLeft, Edit2, Pause, Play, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { GoalType, Goal } from '../../types';
import { cn, formatDate, formatWeight } from '../../lib/utils';
import { selectAnalyticsSummary } from '../analytics/selectors/fitnessSelectors';
import { WeightChart } from '../dashboard/components/WeightChart';
import { ModalFooter } from '../../components/ui/ModalFooter';

export const GoalsView: React.FC = () => {
  const navigate = useNavigate();
  const goals = useGoals();
  const weightHistory = useFitnessStore((state) => state.weightHistory);
  const removeGoal = useFitnessStore((state) => state.removeGoal);
  const addGoal = useFitnessStore((state) => state.addGoal);
  const updateGoal = useFitnessStore((state) => state.updateGoal);
  const state = useFitnessStore();
  const summary = selectAnalyticsSummary(state);

  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

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
      setEditModalOpen(false);
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

  const getStatusBadge = (status: Goal['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-full border border-primary/20"><Play className="w-2 h-2 fill-primary" /> Активна</span>;
      case 'PAUSED':
        return <span className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-yellow-500/20"><Pause className="w-2 h-2 fill-yellow-500" /> На паузе</span>;
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
            <p className="text-muted-foreground">Управляйте своими стремлениями и отслеживайте прогресс</p>
          </div>
          <GradientButton onClick={() => setModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Добавить цель
          </GradientButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal, index) => {
          const currentWeight = summary?.weight?.currentWeight ?? goal.currentValue;
          
          // Semantic progress calculation
          let progress = 0;
          const isWeightLoss = goal.type === GoalType.WEIGHT_LOSS;
          const totalNeeded = isWeightLoss ? goal.startValue - goal.targetValue : goal.targetValue - goal.startValue;
          const actualChange = isWeightLoss ? goal.startValue - currentWeight : currentWeight - goal.startValue;

          if (totalNeeded > 0) {
            progress = Math.max(0, Math.min(100, (actualChange / totalNeeded) * 100));
          }

          // Use summary status only for the primary (first) goal
          const isPrimaryGoal = index === 0;
          const goalTrendStatus = isPrimaryGoal ? summary?.goal.status : 'ON_TRACK';

          return (
            <GlassCard 
              key={goal.id} 
              onClick={() => openGoalDetail(goal)}
              className={cn(
                "p-6 space-y-6 flex flex-col group cursor-pointer hover:bg-white/5 active:scale-[0.99] transition-all relative overflow-hidden",
                goal.status === 'PAUSED' && "opacity-60 grayscale-[0.5]"
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-3 rounded-2xl transition-colors",
                    goalTrendStatus === 'WRONG_DIRECTION' ? "bg-red-500/10 text-red-400" : "bg-primary/10 text-primary"
                  )}>
                    <Target className="w-6 h-6" />
                  </div>
                  {getStatusBadge(goal.status)}
                </div>
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Создание новой цели"
      >
        <GoalForm onSubmit={handleCreateGoal} />
      </Modal>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        title="Редактирование цели"
      >
        <GoalForm 
          initialData={selectedGoal} 
          onSubmit={handleUpdateGoal} 
          onCancel={() => setEditModalOpen(false)} 
        />
      </Modal>

      <Modal 
        isOpen={isDetailOpen} 
        onClose={() => setDetailOpen(false)} 
        title="Детали цели"
      >
        {selectedGoal && (() => {
          const currentWeight = summary?.weight?.currentWeight ?? selectedGoal.currentValue;
          const totalDiff = Math.abs(selectedGoal.targetValue - selectedGoal.startValue);
          const currentProgress = totalDiff > 0 ? Math.min(100, (Math.abs(currentWeight - selectedGoal.startValue) / totalDiff) * 100) : 0;
          
          return (
          <div className="space-y-8 text-foreground min-h-[400px] flex flex-col">
            <div className="flex items-center gap-4 p-5 bg-primary/10 rounded-3xl border border-primary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                 <Target className="w-20 h-20 text-primary" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(223,255,0,0.2)] z-10">
                <Target className="w-10 h-10" />
              </div>
              <div className="flex-1 z-10">
                <div className="flex items-center gap-2 mb-0.5">
                   <h3 className="text-2xl font-bold font-display">{selectedGoal.title || 'Моя цель'}</h3>
                   {getStatusBadge(selectedGoal.status)}
                </div>
                <p className="text-sm text-muted-foreground">{selectedGoal.type === 'WEIGHT_LOSS' ? 'Снижение веса' : 'Набор массы'}</p>
              </div>
            </div>

            {selectedGoal.motivation && (
              <div className="space-y-4">
                 <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-primary" />
                    Мотивация
                 </h4>
                 <div className="p-6 bg-secondary/30 rounded-3xl border border-white/5 italic text-lg leading-relaxed text-primary/90">
                    "{selectedGoal.motivation}"
                 </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-secondary/50 border border-white/5 space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Стартовый</p>
                <p className="text-2xl font-bold">{formatWeight(selectedGoal.startValue)}</p>
              </div>
              <div className="p-5 rounded-3xl bg-secondary/50 border border-white/5 space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Текущий</p>
                <p className="text-2xl font-bold text-primary">{formatWeight(currentWeight)}</p>
              </div>
              <div className="p-5 rounded-3xl bg-secondary/50 border border-white/5 space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Целевой</p>
                <p className="text-2xl font-bold">{formatWeight(selectedGoal.targetValue)}</p>
              </div>
              <div className="p-5 rounded-3xl bg-primary/5 border border-primary/20 space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-primary">Осталось</p>
                <p className="text-2xl font-bold">{formatWeight(Math.abs(selectedGoal.targetValue - currentWeight))}</p>
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-end">
                  <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/60">Визуальный прогресс</h4>
                  <p className="text-2xl font-bold text-primary">{Math.round(currentProgress)}%</p>
               </div>
               <div className="h-[300px] w-full bg-secondary/20 rounded-3xl p-4 border border-white/5">
                 <WeightChart 
                   data={weightHistory} 
                   goal={selectedGoal} 
                   forecastedDate={summary?.goal.estimatedCompletionDate} 
                 />
               </div>
               <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary shadow-[0_0_15px_rgba(223,255,0,0.5)] transition-all duration-1000"
                    style={{ width: `${currentProgress}%` }}
                  />
               </div>
               <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest">
                 Путь от {selectedGoal.startValue} кг до {selectedGoal.targetValue} кг
               </p>
            </div>

            {summary?.goal.estimatedCompletionDate && selectedGoal.status === 'ACTIVE' && (
               <div className="p-6 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl border border-primary/20 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Прогноз достижения</p>
                    <p className="text-2xl font-bold">{formatDate(summary.goal.estimatedCompletionDate)}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-primary/20" />
               </div>
            )}

            <ModalFooter 
              onBack={() => setDetailOpen(false)}
              onEdit={() => {
                setDetailOpen(false);
                setEditModalOpen(true);
              }}
              onDelete={selectedGoal.status === 'PAUSED' || selectedGoal.status === 'COMPLETED' ? () => {
                if (window.confirm('Вы уверены, что хотите окончательно удалить эту цель?')) {
                  removeGoal(selectedGoal.id);
                  setDetailOpen(false);
                }
              } : undefined}
              primaryAction={{
                label: selectedGoal.status === 'ACTIVE' ? 'Приостановить' : 'Возобновить',
                icon: selectedGoal.status === 'ACTIVE' ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />,
                onClick: () => toggleGoalStatus(selectedGoal)
              }}
            />
          </div>
          )})()}
      </Modal>
    </div>
  );
};
