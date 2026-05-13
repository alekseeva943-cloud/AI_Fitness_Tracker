import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFitnessStore, useWorkouts } from '../../store/useFitnessStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientButton } from '../../components/ui/GradientButton';
import { Modal } from '../../components/ui/Modal';
import { EntryForm } from '../entries/components/EntryForm';
import { Plus, Dumbbell, Trash2, Clock, Calendar, ExternalLink, Filter, ChevronRight, Flame, FileText, Scale, ChevronLeft } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { WorkoutEntry } from '../../types';

export const WorkoutsView: React.FC = () => {
  const navigate = useNavigate();
  const workouts = useWorkouts();
  const addWorkout = useFitnessStore((state) => state.addWorkout);
  const addWeightEntry = useFitnessStore((state) => state.addWeightEntry);
  const removeWorkout = useFitnessStore((state) => state.removeWorkout);
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutEntry | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filteredWorkouts = workouts.filter(w => {
    if (filter === 'all') return true;
    return w.type.toLowerCase().includes(filter.toLowerCase());
  });

  const handleCreateWorkout = (data: any) => {
    const workoutId = crypto.randomUUID();
    addWorkout({
      id: workoutId,
      ...data,
      duration: Number(data.duration),
      caloriesBurned: Number(data.caloriesBurned),
      weight: data.weight ? Number(data.weight) : undefined,
    });

    if (data.weight) {
      addWeightEntry({
        id: crypto.randomUUID(),
        date: data.date || new Date().toISOString(),
        value: Number(data.weight),
        unit: 'кг',
      });
    }
    setModalOpen(false);
  };

  const openWorkoutDetail = (workout: WorkoutEntry) => {
    setSelectedWorkout(workout);
    setDetailModalOpen(true);
  };

  const getWorkoutIcon = (type: string) => {
    return <Dumbbell className="w-5 h-5" />;
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
            <h1 className="text-4xl font-display font-medium tracking-tight">Журнал тренировок</h1>
            <p className="text-muted-foreground">История ваших достижений и приложенных усилий</p>
          </div>
          <GradientButton onClick={() => setModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Новая тренировка
          </GradientButton>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['all', 'Силовая', 'Кардио', 'Йога'].map((type) => (
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
            {type === 'all' ? 'Все' : type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredWorkouts.map((workout) => (
          <GlassCard 
            key={workout.id} 
            onClick={() => openWorkoutDetail(workout)}
            className="p-5 hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-border/50"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  {getWorkoutIcon(workout.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold capitalize">{workout.type}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {formatDate(workout.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {workout.duration} мин
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Энергия</p>
                  <p className="text-sm font-medium text-primary">{workout.caloriesBurned || 0} ккал</p>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Удалить эту тренировку?')) removeWorkout(workout.id);
                    }}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                   <div className="p-2 text-muted-foreground group-hover:text-primary transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}

        {filteredWorkouts.length === 0 && (
          <div className="py-20 text-center glass rounded-[2.5rem] border-2 border-dashed border-white/5">
            <Dumbbell className="w-12 h-12 text-primary/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium text-lg">Записей не найдено</p>
            <p className="text-muted-foreground text-sm">Попробуйте изменить фильтр или добавьте новую тренировку</p>
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

      <Modal isOpen={isDetailModalOpen} onClose={() => setDetailModalOpen(false)} title="Детали активности">
        {selectedWorkout && (
          <div className="space-y-6 p-2 text-foreground">
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
              onClick={() => {
                if (confirm('Вы уверены, что хотите удалить эту тренировку?')) {
                  removeWorkout(selectedWorkout.id);
                  setDetailModalOpen(false);
                }
              }}
              className="w-full flex items-center justify-center gap-2 p-4 text-red-400 hover:bg-red-500/10 rounded-2xl transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Удалить запись
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
