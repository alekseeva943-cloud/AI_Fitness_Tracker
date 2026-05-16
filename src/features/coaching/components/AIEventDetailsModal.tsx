import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Brain, Zap, Clock, Activity, Target, 
  Trash2, Calendar, CheckCircle2, AlertTriangle,
  RotateCcw, Save, Trash, ChevronRight, Edit3
} from 'lucide-react';
import { PlanEvent, ExercisePlan } from '../../../types';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GradientButton } from '../../../components/ui/GradientButton';
import { cn } from '../../../lib/utils';
import { useFitnessStore } from '../../../store/useFitnessStore';

interface AIEventDetailsModalProps {
  event: PlanEvent;
  onClose: () => void;
}

export const AIEventDetailsModal: React.FC<AIEventDetailsModalProps> = ({ event, onClose }) => {
  const setPlanEventStatus = useFitnessStore(state => state.setPlanEventStatus);
  const removePlanEvent = useFitnessStore(state => state.removePlanEvent);

  const handleStatusChange = (status: PlanEvent['status']) => {
    setPlanEventStatus(event.id, status);
    onClose();
  };

  const handleRemove = () => {
    removePlanEvent(event.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        <GlassCard className="h-full border-white/10 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-start justify-between">
            <div className="flex items-start gap-4">
               <div className={cn(
                 "w-12 h-12 rounded-2xl flex items-center justify-center border",
                 event.source === 'AI' ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/10 text-white"
               )}>
                 {event.type === 'WORKOUT' ? <Activity className="w-6 h-6" /> : 
                  event.type === 'NUTRITION' ? <Zap className="w-6 h-6" /> :
                  <Calendar className="w-6 h-6" />}
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-display font-bold">{event.title}</h2>
                    {event.source === 'AI' && (
                      <div className="px-2 py-0.5 rounded-full bg-primary text-black text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                        <Brain className="w-2 h-2" />
                        AI Planned
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground/60 text-[10px] font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(event.date).toLocaleDateString([], { weekday: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                    {event.duration && <span>• {event.duration} мин</span>}
                    <span className={cn(
                      "px-2 py-0.5 rounded-lg border",
                      event.status === 'COMPLETED' ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-white/5 border-white/5"
                    )}>{event.status}</span>
                  </div>
               </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all"><X className="w-5 h-5" /></button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
            
            {/* AI Rationale */}
            {event.source === 'AI' && (
              <div className="space-y-3">
                 <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-primary flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5" />
                    Почему коуч выбрал это:
                 </h4>
                 <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10 italic text-sm leading-relaxed text-primary/80">
                    "{event.aiRationale || 'Данная тренировка подобрана на основе твоего текущего восстановления и прогресса за последние 14 дней.'}"
                 </div>
              </div>
            )}

            {/* Content Detail */}
            {event.exercises && event.exercises.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40 px-2">План упражнений</h4>
                <div className="grid gap-2">
                  {event.exercises.map((ex, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black text-muted-foreground/40">
                             {i + 1}
                          </div>
                          <div>
                             <p className="text-sm font-bold">{ex.name}</p>
                             <p className="text-[10px] text-muted-foreground/60 uppercase font-black">{ex.sets} подходов × {ex.reps}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          {ex.weight && (
                            <div className="text-right">
                               <p className="text-[8px] uppercase font-black text-muted-foreground/40">Вес</p>
                               <p className="text-xs font-bold text-primary">{ex.weight}</p>
                            </div>
                          )}
                          {ex.rest && (
                            <div className="text-right">
                               <p className="text-[8px] uppercase font-black text-muted-foreground/40">Отдых</p>
                               <p className="text-xs font-bold">{ex.rest}с</p>
                            </div>
                          )}
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                 <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40 px-2">Описание</h4>
                 <p className="text-sm text-muted-foreground leading-relaxed px-2">
                    {event.description || 'Детальный план для этого события еще не сформирован. Коуч добавит подробности ближе к началу.'}
                 </p>
              </div>
            )}

            {/* Intensity / Metrics */}
            <div className="grid grid-cols-2 gap-4">
               <div className="p-5 rounded-3xl bg-secondary/30 border border-white/5">
                  <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/40 mb-1">Интенсивность</p>
                  <div className="flex items-center gap-2">
                     <span className={cn(
                       "text-sm font-black",
                       event.metadata?.intensity === 'HIGH' ? "text-orange-400" : "text-primary"
                     )}>{event.metadata?.intensity || 'MEDIUM'}</span>
                     <div className="flex gap-0.5">
                        {[1, 2, 3].map(i => (
                          <div key={i} className={cn(
                            "w-1 h-3 rounded-full",
                            (i === 1 && event.metadata?.intensity === 'LOW') ||
                            (i <= 2 && event.metadata?.intensity === 'MEDIUM') ||
                            (i <= 3 && event.metadata?.intensity === 'HIGH') ? "bg-primary" : "bg-white/10"
                          )} />
                        ))}
                     </div>
                  </div>
               </div>
               <div className="p-5 rounded-3xl bg-secondary/30 border border-white/5">
                  <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/40 mb-1">Фокус</p>
                  <p className="text-sm font-black text-white">{event.metadata?.targetMuscle || 'Все тело'}</p>
               </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/5 bg-white/[0.02] grid grid-cols-2 md:grid-cols-4 gap-3">
            <GradientButton 
              variant="outline" 
              className="h-12 text-[10px] font-black border-white/10"
              onClick={() => handleStatusChange(event.status === 'COMPLETED' ? 'PLANNED' : 'COMPLETED')}
            >
              {event.status === 'COMPLETED' ? (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  ОТМЕНИТЬ
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  ВЫПОЛНЕНО
                </>
              )}
            </GradientButton>
            
            <GradientButton variant="outline" className="h-12 text-[10px] font-black border-white/10">
               <Edit3 className="w-4 h-4 mr-2" />
               ИЗМЕНИТЬ
            </GradientButton>

            <GradientButton variant="outline" className="h-12 text-[10px] font-black border-white/10">
               <RotateCcw className="w-4 h-4 mr-2" />
               ПЕРЕНЕСТИ
            </GradientButton>

            <button 
              onClick={handleRemove}
              className="h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all"
            >
               <Trash2 className="w-4 h-4 mr-2" />
               УДАЛИТЬ
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
