import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFitnessStore, useWorkouts } from '../../store/useFitnessStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientButton } from '../../components/ui/GradientButton';
import { Modal } from '../../components/ui/Modal';
import { EntryForm } from '../entries/components/EntryForm';
import { Plus, Dumbbell, Trash2, Clock, Calendar, Zap, Activity, Heart, Ruler, ChevronRight, ChevronLeft, FileText, Scale, Flame } from 'lucide-react';
import { formatDate, cn } from '../../lib/utils';
import { WorkoutEntry } from '../../types';
import { ModalFooter } from '../../components/ui/ModalFooter';

export const WorkoutsView: React.FC = () => {
  const navigate = useNavigate();
  const workouts = useWorkouts();
  const addWorkout = useFitnessStore((state) => state.addWorkout);
  const updateWorkout = useFitnessStore((state) => state.updateWorkout);
  const addWeightEntry = useFitnessStore((state) => state.addWeightEntry);
  const removeWorkout = useFitnessStore((state) => state.removeWorkout);
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
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
    });

    if (data.weight) {
      addWeightEntry({
        id: crypto.randomUUID(),
        date: data.date || new Date().toISOString(),
        value: data.weight,
        unit: 'кг',
      });
    }
    setModalOpen(false);
  };

  const handleUpdateWorkout = (data: any) => {
    updateWorkout(data.id, data);
    setSelectedWorkout(data);
    setEditModalOpen(false);
  };

  const openWorkoutDetail = (workout: WorkoutEntry) => {
    setSelectedWorkout(workout);
    setDetailModalOpen(true);
  };

  const handleDeleteWorkout = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту тренировку?')) {
      removeWorkout(id);
      setDetailModalOpen(false);
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
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105",
                        workout.category === 'STRENGTH' ? "bg-orange-500/10 text-orange-400" :
                        workout.category === 'CARDIO' ? "bg-blue-500/10 text-blue-400" :
                        workout.category === 'ENDURANCE' ? "bg-green-500/10 text-green-400" :
                        "bg-primary/10 text-primary"
                      )}>
                        {workout.category === 'STRENGTH' ? <Zap className="w-6 h-6" /> :
                         workout.category === 'CARDIO' ? <Activity className="w-6 h-6" /> :
                         <Dumbbell className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold capitalize">{workout.type}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-primary/60" />
                            {formatDate(workout.date)}
                          </span>
                          {workout.volume ? (
                            <span className="flex items-center gap-1.5 text-primary/80 font-bold">
                              <Zap className="w-3.5 h-3.5" />
                              {Math.round(workout.volume)} кг
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-primary/60" />
                              {workout.duration} мин
                            </span>
                          )}
                          {workout.distance && (
                            <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                              <Ruler className="w-3.5 h-3.5" />
                              {workout.distance} км
                            </span>
                          )}
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

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        title="Редактировать тренировку"
      >
        <EntryForm 
           onSubmit={handleUpdateWorkout} 
           type="workout" 
           initialData={selectedWorkout}
        />
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

            {selectedWorkout.category === 'STRENGTH' && (
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
                {selectedWorkout.volume && (
                  <div className="col-span-3 bg-primary/10 p-4 rounded-2xl border border-primary/20 flex justify-between items-center">
                    <p className="text-xs uppercase font-bold text-primary tracking-widest">Тренировочный объем</p>
                    <p className="text-xl font-bold text-primary">{selectedWorkout.volume} кг</p>
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
                  setEditModalOpen(true);
               }}
               onDelete={() => handleDeleteWorkout(selectedWorkout.id)}
               onClose={() => setDetailModalOpen(false)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
