import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFitnessStore, useGoals } from '../../store/useFitnessStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientButton } from '../../components/ui/GradientButton';
import { Modal } from '../../components/ui/Modal';
import { GoalForm } from './components/GoalForm';
import { Plus, Target, Trash2, Calendar, TrendingUp, ChevronLeft } from 'lucide-react';
import { RU } from '../../constants';
import { GoalType } from '../../types';
import { cn, formatDate, formatWeight } from '../../lib/utils';
import { selectAnalyticsSummary } from '../analytics/selectors/fitnessSelectors';

export const GoalsView: React.FC = () => {
  const navigate = useNavigate();
  const goals = useGoals();
  const removeGoal = useFitnessStore((state) => state.removeGoal);
  const addGoal = useFitnessStore((state) => state.addGoal);
  const state = useFitnessStore();
  const summary = selectAnalyticsSummary(state);

  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  const handleCreateGoal = (data: any) => {
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
    setModalOpen(false);
  };

  const openGoalDetail = (goal: any) => {
    setSelectedGoal(goal);
    setDetailOpen(true);
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
          const currentWeight = summary?.weight.currentWeight ?? goal.currentValue;
          
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
          const goalStatus = isPrimaryGoal ? summary?.goal.status : 'ON_TRACK';

          return (
            <GlassCard 
              key={goal.id} 
              onClick={() => openGoalDetail(goal)}
              className="p-6 space-y-6 flex flex-col group cursor-pointer hover:bg-white/5 active:scale-[0.99] transition-all"
            >
              <div className="flex justify-between items-start">
                <div className={cn(
                  "p-3 rounded-2xl transition-colors",
                  goalStatus === 'WRONG_DIRECTION' ? "bg-red-500/10 text-red-400" : "bg-primary/10 text-primary"
                )}>
                  <Target className="w-6 h-6" />
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Удалить эту цель?')) removeGoal(goal.id);
                  }}
                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
                      goalStatus === 'WRONG_DIRECTION' ? "text-red-400" : "text-primary"
                    )}>
                      {Math.round(progress)}%
                    </p>
                  </div>
                </div>

                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000 ease-out",
                      goalStatus === 'WRONG_DIRECTION' 
                        ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" 
                        : "bg-linear-to-r from-brand-primary to-brand-secondary shadow-[0_0_10px_rgba(223,255,0,0.3)]"
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                {goalStatus === 'WRONG_DIRECTION' ? (
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
        isOpen={isDetailOpen} 
        onClose={() => setDetailOpen(false)} 
        title="Детали цели"
      >
        {selectedGoal && (() => {
          const totalDiff = Math.abs(selectedGoal.targetValue - selectedGoal.startValue);
          const currentProgress = totalDiff > 0 ? Math.min(100, (Math.abs((summary?.weight.currentWeight ?? selectedGoal.currentValue) - selectedGoal.startValue) / totalDiff) * 100) : 0;
          
          return (
          <div className="space-y-8 p-1 text-foreground">
             <button 
                onClick={() => setDetailOpen(false)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group mb-2"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Назад
              </button>

            <div className="flex items-center gap-4 p-5 bg-primary/10 rounded-3xl border border-primary/20">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(223,255,0,0.2)]">
                <Target className="w-10 h-10" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold font-display">{selectedGoal.title || 'Моя цель'}</h3>
                <p className="text-sm text-muted-foreground">{selectedGoal.type === 'WEIGHT_LOSS' ? 'Снижение веса' : 'Набор массы'}</p>
              </div>
            </div>

            {selectedGoal.motivation && (
              <div className="space-y-4">
                 <h4 className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Мотивация</h4>
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
                <p className="text-2xl font-bold text-primary">{formatWeight(summary?.weight.currentWeight ?? selectedGoal.currentValue)}</p>
              </div>
              <div className="p-5 rounded-3xl bg-secondary/50 border border-white/5 space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Целевой</p>
                <p className="text-2xl font-bold">{formatWeight(selectedGoal.targetValue)}</p>
              </div>
              <div className="p-5 rounded-3xl bg-primary/5 border border-primary/20 space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-primary">Осталось</p>
                <p className="text-2xl font-bold">{formatWeight(Math.abs(selectedGoal.targetValue - (summary?.weight.currentWeight ?? selectedGoal.currentValue)))}</p>
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-end">
                  <h4 className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Прогресс выполнения</h4>
                  <p className="text-2xl font-bold text-primary">{Math.round(currentProgress)}%</p>
               </div>
               <div className="w-full h-4 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary shadow-[0_0_15px_rgba(223,255,0,0.5)] transition-all duration-1000"
                    style={{ width: `${currentProgress}%` }}
                  />
               </div>
            </div>

            {summary?.goal.estimatedCompletionDate && (
               <div className="p-6 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl border border-primary/20 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Прогноз достижения</p>
                    <p className="text-2xl font-bold">{formatDate(summary.goal.estimatedCompletionDate)}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-primary/20" />
               </div>
            )}

            <div className="pt-4 flex gap-4">
              <GradientButton 
                 variant="outline" 
                 className="flex-1"
                 onClick={() => {
                   if (window.confirm('Удалить эту цель?')) {
                     removeGoal(selectedGoal.id);
                     setDetailOpen(false);
                   }
                 }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Остановить
              </GradientButton>
              <GradientButton className="flex-1" onClick={() => setDetailOpen(false)}>
                Продолжить
              </GradientButton>
            </div>
          </div>
          )})()}
      </Modal>
    </div>
  );
};
