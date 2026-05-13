import React, { useState } from 'react';
import { useFitnessStore, useGoals } from '../../store/useFitnessStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientButton } from '../../components/ui/GradientButton';
import { Modal } from '../../components/ui/Modal';
import { GoalForm } from './components/GoalForm';
import { Plus, Target, Trash2, Calendar, TrendingUp } from 'lucide-react';
import { RU } from '../../constants';
import { formatDate, formatWeight } from '../../lib/utils';
import { selectAnalyticsSummary } from '../analytics/selectors/fitnessSelectors';

export const GoalsView: React.FC = () => {
  const goals = useGoals();
  const removeGoal = useFitnessStore((state) => state.removeGoal);
  const addGoal = useFitnessStore((state) => state.addGoal);
  const state = useFitnessStore();
  const summary = selectAnalyticsSummary(state);

  const [isModalOpen, setModalOpen] = useState(false);

  const handleCreateGoal = (data: any) => {
    addGoal({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      currentValue: summary?.weight.currentWeight || 0,
      startValue: summary?.weight.currentWeight || 0,
      status: 'ACTIVE',
      ...data,
      targetValue: Number(data.targetValue),
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const currentWeight = summary?.weight.currentWeight ?? goal.currentValue;
          const totalDiff = Math.abs(goal.targetValue - goal.startValue);
          const currentDiff = Math.abs(currentWeight - goal.startValue);
          const progress = totalDiff > 0 ? Math.min(100, (currentDiff / totalDiff) * 100) : 0;

          return (
            <GlassCard key={goal.id} className="p-6 space-y-6 flex flex-col group">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Target className="w-6 h-6" />
                </div>
                <button 
                  onClick={() => removeGoal(goal.id)}
                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{goal.type === 'WEIGHT_LOSS' ? 'Снижение веса' : 'Набор массы'}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Создано {formatDate(goal.createdAt)}</span>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Текущий / Цель</p>
                    <p className="text-lg font-display font-medium">
                      {formatWeight(currentWeight)} / <span className="text-primary">{formatWeight(goal.targetValue)}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Прогресс</p>
                    <p className="text-lg font-display font-medium text-primary">{Math.round(progress)}%</p>
                  </div>
                </div>

                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-brand-primary to-brand-secondary transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-green-400">
                <TrendingUp className="w-3 h-3" />
                <span>На верном пути</span>
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
    </div>
  );
};
