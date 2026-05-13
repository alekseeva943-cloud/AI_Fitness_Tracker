import React, { useState } from 'react';
import { useFitnessStore, useWorkouts } from '../../store/useFitnessStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientButton } from '../../components/ui/GradientButton';
import { Modal } from '../../components/ui/Modal';
import { EntryForm } from '../entries/components/EntryForm';
import { Plus, Dumbbell, Trash2, Clock, Calendar, ExternalLink, Filter } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';

export const WorkoutsView: React.FC = () => {
  const workouts = useWorkouts();
  const addWorkout = useFitnessStore((state) => state.addWorkout);
  const removeWorkout = useFitnessStore((state) => state.removeWorkout);
  const workoutsFromStore = useFitnessStore(state => state.workouts);
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const filteredWorkouts = workouts.filter(w => {
    if (filter === 'all') return true;
    return w.type === filter;
  });

  const handleCreateWorkout = (data: any) => {
    addWorkout({
      id: crypto.randomUUID(),
      ...data,
      duration: Number(data.duration),
    });
    setModalOpen(false);
  };

  const getWorkoutIcon = (type: string) => {
    return <Dumbbell className="w-5 h-5" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-medium tracking-tight">Журнал тренировок</h1>
          <p className="text-muted-foreground">История ваших достижений и приложенных усилий</p>
        </div>
        <GradientButton onClick={() => setModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Новая тренировка
        </GradientButton>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['all', 'strength', 'cardio', 'yoga'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
              filter === type 
                ? "bg-primary text-black" 
                : "bg-white/5 text-muted-foreground hover:bg-white/10"
            )}
          >
            {type === 'all' ? 'Все' : type === 'strength' ? 'Силовые' : type === 'cardio' ? 'Кардио' : 'Йога'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredWorkouts.map((workout) => (
          <GlassCard key={workout.id} className="p-5 hover:bg-white/5 transition-all group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  {getWorkoutIcon(workout.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold capitalize">{workout.notes || 'Тренировка'}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(workout.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {workout.duration} мин
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Интенсивность</p>
                  <p className="text-sm font-medium">Высокая</p>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                    onClick={() => removeWorkout(workout.id)}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                   <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}

        {filteredWorkouts.length === 0 && (
          <div className="py-20 text-center glass rounded-[2.5rem] border-2 border-dashed border-white/5">
            <Dumbbell className="w-12 h-12 text-primary/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium text-lg text-center">Записей не найдено</p>
            <p className="text-muted-foreground text-sm text-center">Попробуйте изменить фильтр или добавьте новую тренировку</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Добавить тренировку"
      >
        <EntryForm onSubmit={handleCreateWorkout} type="workout" />
      </Modal>
    </div>
  );
};
