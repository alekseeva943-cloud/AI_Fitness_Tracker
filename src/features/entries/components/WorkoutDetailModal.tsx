import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ModalFooter } from '../../../components/ui/ModalFooter';
import { cn, formatDate } from '../../../lib/utils';
import { Calendar, Clock, Flame, Zap, Activity, Dumbbell, FileText } from 'lucide-react';
import { WorkoutEntry } from '../../../types';

interface WorkoutDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: WorkoutEntry | null;
  onEdit?: (workout: WorkoutEntry) => void;
  onDelete?: (id: string) => void;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  isOpen,
  onClose,
  workout,
  onEdit,
  onDelete
}) => {
  if (!workout) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Детали активности">
      <div className="space-y-6 text-foreground min-h-[450px] flex flex-col">
        <div className="flex items-center gap-4 p-5 bg-secondary/30 rounded-3xl border border-white/5">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg",
            workout.category === 'STRENGTH' ? "bg-orange-500/20 text-orange-400" :
            workout.category === 'CARDIO' ? "bg-blue-500/20 text-blue-400" :
            "bg-primary/20 text-primary"
          )}>
            {workout.category === 'STRENGTH' ? <Zap className="w-8 h-8" /> :
             workout.category === 'CARDIO' ? <Activity className="w-8 h-8" /> :
             <Dumbbell className="w-8 h-8" />}
          </div>
          <div>
            <h4 className="text-2xl font-bold">{workout.type}</h4>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Calendar className="w-4 h-4" />
              {formatDate(workout.date)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/50 p-4 rounded-2xl space-y-1 border border-white/5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <Clock className="w-3 h-3" />
              Длительность
            </div>
            <p className="text-xl font-bold">{workout.duration} мин</p>
          </div>
          <div className="bg-secondary/50 p-4 rounded-2xl space-y-1 border border-white/5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <Flame className="w-3 h-3" />
              Калории
            </div>
            <p className="text-xl font-bold">{workout.caloriesBurned || 0} ккал</p>
          </div>
        </div>

        {workout.category === 'STRENGTH' && workout.exercises && workout.exercises.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between px-1">
              <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Упражнения</h5>
              {workout.totalWeight && (
                <span className="text-[10px] font-black text-primary uppercase">Всего: {workout.totalWeight} кг</span>
              )}
            </div>
            <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {workout.exercises.map((ex: any, idx: number) => (
                <div key={ex.id || idx} className="bg-secondary/20 p-4 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">{ex.name || `Упражнение ${idx + 1}`}</span>
                    {ex.totalWeight > 0 && (
                      <span className="text-xs font-black text-primary/60">{ex.totalWeight} кг</span>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[8px] uppercase font-bold text-muted-foreground">Подходы</p>
                      <p className="text-xs font-mono">{ex.sets}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] uppercase font-bold text-muted-foreground">Повторы</p>
                      <p className="text-xs font-mono">{ex.reps}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] uppercase font-bold text-muted-foreground">Вес (кг)</p>
                      <p className="text-xs font-mono text-primary font-bold">{ex.weight}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(workout.category === 'CARDIO' || workout.category === 'ENDURANCE') && (
          <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-secondary/30 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
               <Activity className="w-4 h-4 mb-2 text-blue-400" />
               <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Дистанция</p>
               <p className="text-lg font-bold">{workout.distance ? `${workout.distance} км` : '-'}</p>
            </div>
            <div className="bg-secondary/30 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
               <Activity className="w-4 h-4 mb-2 text-green-400" />
               <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Темп</p>
               <p className="text-lg font-bold">{workout.pace || '-'}</p>
            </div>
          </div>
        )}

        {workout.notes && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <FileText className="w-3 h-3" />
              Заметки
            </div>
            <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl text-sm leading-relaxed italic text-foreground/80">
              {workout.notes}
            </div>
          </div>
        )}
        
        <ModalFooter 
           onBack={onClose}
           onEdit={onEdit ? () => onEdit(workout) : undefined}
           onDelete={onDelete ? () => onDelete(workout.id) : undefined}
           onClose={onClose}
        />
      </div>
    </Modal>
  );
};
