import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [viewMetric, setViewMetric] = useState<'calories' | 'weight' | 'duration'>('calories');

  const categoryLabels: Record<string, string> = {
    'STRENGTH': 'Силовая',
    'CARDIO': 'Кардио',
    'ENDURANCE': 'Выносливость',
    'FLEXIBILITY': 'Йога и растяжка',
    'OTHER': 'Другое'
  };

  const activeCategories = Array.from(new Set(workouts.map(w => w.category || 'OTHER')));
  const filterOptions = ['all', ...activeCategories];

  const filteredWorkouts = workouts.filter(w => {
    if (filter === 'all') return true;
    return w.category === filter;
  });

  const handleCreateWorkout = (data: any) => {
    const workoutId = crypto.randomUUID();
    addWorkout({
      ...data,
      id: workoutId,
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

      <div className="flex flex-col gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {filterOptions.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap shadow-sm border",
                filter === cat 
                  ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(223,255,0,0.2)]" 
                  : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:border-white/10"
              )}
            >
              {cat === 'all' ? 'Все' : (categoryLabels[cat] || cat)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-secondary/20 rounded-2xl border border-white/5 w-fit">
          <button 
            onClick={() => setViewMetric('calories')}
            className={cn(
              "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              viewMetric === 'calories' ? "bg-primary text-black" : "text-muted-foreground hover:text-white"
            )}
          >
            Энергия
          </button>
          <button 
            onClick={() => setViewMetric('weight')}
            className={cn(
              "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              viewMetric === 'weight' ? "bg-primary text-black" : "text-muted-foreground hover:text-white"
            )}
          >
            Вес
          </button>
          <button 
            onClick={() => setViewMetric('duration')}
            className={cn(
              "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              viewMetric === 'duration' ? "bg-primary text-black" : "text-muted-foreground hover:text-white"
            )}
          >
            Время
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredWorkouts.map((workout, index) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              layout
            >
              <GlassCard 
                onClick={() => openWorkoutDetail(workout)}
                className="p-5 hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-border/50"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105 shadow-lg",
                            workout.category === 'STRENGTH' ? "bg-orange-500/20 text-orange-400" :
                            workout.category === 'CARDIO' ? "bg-blue-500/20 text-blue-400" :
                            workout.category === 'ENDURANCE' ? "bg-green-500/20 text-green-400" :
                            workout.category === 'FLEXIBILITY' ? "bg-purple-500/20 text-purple-400" :
                            "bg-primary/20 text-primary"
                          )}>
                            {workout.category === 'STRENGTH' ? <Zap className="w-6 h-6" /> :
                             workout.category === 'CARDIO' ? <Activity className="w-6 h-6" /> :
                             workout.category === 'FLEXIBILITY' ? <span className="text-xl">🧘</span> :
                             <Dumbbell className="w-6 h-6" />}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold capitalize">{workout.type}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                                <Calendar className="w-3 h-3 text-primary/60" />
                                {formatDate(workout.date)}
                              </span>
                              {workout.totalWeight ? (
                                <span className="flex items-center gap-1.5 text-primary font-black text-xs">
                                  <Zap className="w-3 h-3" />
                                  {Math.round(workout.totalWeight)} кг
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                                  <Clock className="w-3 h-3 text-primary/60" />
                                  {workout.duration} мин
                                </span>
                              )}
                              {workout.exercises && workout.exercises.length > 0 && (
                                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest opacity-60">
                                  <Dumbbell className="w-3 h-3" />
                                  {workout.exercises.length} упр.
                                </span>
                              )}
                            </div>
                          </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                    <div className="flex gap-6">
                      {viewMetric === 'calories' && (
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Энергия</p>
                          <p className="text-sm font-bold text-primary">{workout.caloriesBurned || 0} ккал</p>
                        </div>
                      )}
                      
                      {viewMetric === 'weight' && (
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Вес замера</p>
                          <p className="text-sm font-bold text-primary">{workout.weight || '-'} кг</p>
                        </div>
                      )}

                      {viewMetric === 'duration' && (
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Время</p>
                          <p className="text-sm font-bold text-primary">{workout.duration} мин</p>
                        </div>
                      )}

                      {/* Always show calories mini if not in main view */}
                      {viewMetric !== 'calories' && (
                        <div className="text-right hidden sm:block opacity-40">
                          <p className="text-[10px] uppercase font-bold tracking-widest">ккал</p>
                          <p className="text-xs font-medium">{workout.caloriesBurned || 0}</p>
                        </div>
                      )}
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
            </motion.div>
          ))}
        </AnimatePresence>

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
        <EntryForm 
           key="new-workout"
           onSubmit={handleCreateWorkout} 
           type="workout" 
        />
      </Modal>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        title="Редактировать тренировку"
      >
        <EntryForm 
           key={selectedWorkout?.id || 'edit'}
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
              {selectedWorkout.weight && (
                <div className="bg-primary/5 p-4 rounded-2xl space-y-1 border border-primary/20 col-span-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                    <Scale className="w-3 h-3" />
                    Вес на момент тренировки
                  </div>
                  <p className="text-xl font-black text-primary">{selectedWorkout.weight} кг</p>
                </div>
              )}
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
                  {selectedWorkout.exercises.map((ex, idx) => (
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
