import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Brain, Zap, Clock, Activity, Target, 
  Trash2, Calendar, CheckCircle2, AlertTriangle,
  RotateCcw, Save, Trash, ChevronRight, Edit3,
  ChevronDown, ChevronUp, Utensils, Info, Lightbulb,
  Dumbbell
} from 'lucide-react';
import { PlanEvent, ExercisePlan } from '../../../types';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GradientButton } from '../../../components/ui/GradientButton';
import { cn } from '../../../lib/utils';
import { useFitnessStore } from '../../../store/useFitnessStore';
import { AddEventModal } from './AddEventModal';

interface AIEventDetailsModalProps {
  event: PlanEvent;
  onClose: () => void;
}

export const AIEventDetailsModal: React.FC<AIEventDetailsModalProps> = ({ event, onClose }) => {
  const setPlanEventStatus = useFitnessStore(state => state.setPlanEventStatus);
  const removePlanEvent = useFitnessStore(state => state.removePlanEvent);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        <GlassCard className="flex-1 border-white/10 flex flex-col overflow-hidden">
          {/* Header - Sticky */}
          <div className="p-6 border-b border-white/5 bg-black/40 backdrop-blur-xl shrink-0 z-20">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                 <div className={cn(
                   "w-12 h-12 rounded-2xl flex items-center justify-center border",
                   event.status === 'COMPLETED' ? "bg-green-500/20 border-green-500/40 text-green-400" :
                   event.source === 'AI' ? "bg-primary/10 border-primary/20 text-primary shadow-[0_0_20px_rgba(223,255,0,0.2)]" : 
                   "bg-white/5 border-white/10 text-white"
                 )}>
                   {event.type === 'WORKOUT' ? <Dumbbell className="w-6 h-6" /> : 
                    event.type === 'NUTRITION' ? <Utensils className="w-6 h-6" /> :
                    event.type === 'RECOVERY' ? <Clock className="w-6 h-6" /> :
                    <Calendar className="w-6 h-6" />}
                 </div>
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-display font-bold uppercase tracking-tight">{event.title}</h2>
                      {event.source === 'AI' && (
                        <div className="px-2 py-0.5 rounded-full bg-primary text-black text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                          <Brain className="w-2 h-2" />
                          AI Directed
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground/60 text-[10px] font-black uppercase tracking-widest">
                      <span className="flex items-center gap-1.5 text-primary/80"><Clock className="w-3 h-3" /> {new Date(event.date).toLocaleDateString([], { weekday: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                      {event.duration && <span>• {event.duration} мин</span>}
                      <span className={cn(
                        "px-2 py-0.5 rounded-lg border",
                        event.status === 'COMPLETED' ? "bg-green-500/10 border-green-500/20 text-green-400" : 
                        event.status === 'SKIPPED' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                        "bg-white/5 border-white/5"
                      )}>{event.status}</span>
                    </div>
                 </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
          </div>

          {/* Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide bg-black/20">
            
            {/* AI Coach Insight */}
            {event.source === 'AI' && (
              <GlassCard className="p-6 border-primary/20 bg-primary/5 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-110 transition-transform">
                    <Brain className="w-24 h-24" />
                 </div>
                 <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-primary text-black flex items-center justify-center">
                          <Brain className="w-4 h-4" />
                       </div>
                       <h4 className="text-[10px] uppercase font-black tracking-widest text-primary/80">Инсайт стратега Genesis-X9</h4>
                    </div>
                    <p className="text-sm italic leading-relaxed text-primary/90 font-medium">
                       "{event.aiRationale || 'Твое тело сейчас находится в фазе суперкомпенсации. Этот воркаут максимизирует мышечный отклик.'}"
                    </p>
                 </div>
              </GlassCard>
            )}

            {/* Workout Module */}
            {event.type === 'WORKOUT' && event.exercises && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <h4 className="text-[12px] uppercase font-black tracking-widest text-muted-foreground/60">Execution Map</h4>
                   <span className="text-[10px] font-bold text-primary italic">{event.exercises.length} движений</span>
                </div>
                
                <div className="space-y-3">
                  {event.exercises.map((ex, i) => (
                    <motion.div 
                      key={i} 
                      className={cn(
                        "rounded-3xl border transition-all overflow-hidden",
                        expandedExercise === i ? "bg-white/10 border-primary/30" : "bg-white/5 border-white/5 hover:border-white/10"
                      )}
                    >
                       <div 
                         onClick={() => setExpandedExercise(expandedExercise === i ? null : i)}
                         className="p-5 flex items-center justify-between cursor-pointer"
                       >
                          <div className="flex items-center gap-5">
                             <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-black text-muted-foreground group-hover:text-primary transition-colors">
                                {i + 1}
                             </div>
                             <div>
                                <p className="text-sm font-bold uppercase tracking-tight">{ex.name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                   <span className="text-[10px] text-muted-foreground font-black uppercase">{ex.sets} SETS × {ex.reps}</span>
                                   {ex.tempo && <span className="text-[8px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-black">TEMPO: {ex.tempo}</span>}
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-6">
                             {ex.weight && (
                                <div className="text-right">
                                   <p className="text-[8px] uppercase font-black text-muted-foreground/40 mb-0.5">LOAD</p>
                                   <p className="text-xs font-black text-primary">{ex.weight}</p>
                                </div>
                             )}
                             {expandedExercise === i ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                          </div>
                       </div>

                       <AnimatePresence>
                          {expandedExercise === i && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-5 pb-6 pt-2 border-t border-white/5"
                            >
                               <div className="grid gap-6">
                                  {ex.technique && (
                                    <div className="space-y-4">
                                       <div>
                                          <p className="text-[8px] font-black uppercase text-primary mb-2 flex items-center gap-2">
                                             <Info className="w-3 h-3" /> Техника выполнения
                                          </p>
                                          <div className="space-y-2">
                                             {ex.technique.steps.map((step, si) => (
                                               <div key={si} className="flex gap-3 text-[11px] leading-relaxed text-muted-foreground">
                                                  <span className="text-primary/40 font-bold">{si + 1}.</span>
                                                  <span>{step}</span>
                                               </div>
                                             ))}
                                          </div>
                                       </div>
                                       <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 flex gap-3">
                                          <Lightbulb className="w-4 h-4 text-primary shrink-0" />
                                          <p className="text-[10px] font-bold text-primary leading-snug">
                                             Совет коуча: "{ex.technique.coachTip}"
                                          </p>
                                       </div>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-2 gap-3">
                                     <div className="p-3 bg-white/5 rounded-2xl">
                                        <p className="text-[8px] font-black text-muted-foreground/40 uppercase mb-1">Rest Interval</p>
                                        <p className="text-xs font-bold">{ex.rest || '60c'}</p>
                                     </div>
                                     <div className="p-3 bg-white/5 rounded-2xl">
                                        <p className="text-[8px] font-black text-muted-foreground/40 uppercase mb-1">Target Intensity</p>
                                        <p className="text-xs font-bold text-orange-400">RPE 8.5</p>
                                     </div>
                                  </div>
                               </div>
                            </motion.div>
                          )}
                       </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Nutrition Module */}
            {event.type === 'NUTRITION' && event.nutrition && (
              <div className="space-y-8">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col items-center">
                       <span className="text-[8px] font-black text-muted-foreground/40 uppercase mb-3">Калории</span>
                       <span className="text-2xl font-black font-display text-primary">{event.nutrition.calories}</span>
                       <span className="text-[8px] font-bold text-muted-foreground mt-1">ккал</span>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col items-center">
                       <span className="text-[8px] font-black text-muted-foreground/40 uppercase mb-3">Белки</span>
                       <span className="text-2xl font-black font-display text-white">{event.nutrition.protein}г</span>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col items-center">
                       <span className="text-[8px] font-black text-muted-foreground/40 uppercase mb-3">Жиры</span>
                       <span className="text-2xl font-black font-display text-white">{event.nutrition.fats}г</span>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col items-center">
                       <span className="text-[8px] font-black text-muted-foreground/40 uppercase mb-3">Углеводы</span>
                       <span className="text-2xl font-black font-display text-white">{event.nutrition.carbs}г</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <Utensils className="w-4 h-4 text-primary" />
                       <h4 className="text-[10px] uppercase font-black tracking-widest">Стратегия питания</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="p-6 rounded-3xl bg-secondary/30 border border-white/5">
                          <p className="text-[9px] font-black uppercase text-muted-foreground/40 mb-4">Рекомендуемые продукты</p>
                          <div className="flex flex-wrap gap-2">
                             {event.nutrition.recommendedFoods.map((food, fi) => (
                               <span key={fi} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold">
                                  {food}
                               </span>
                             ))}
                          </div>
                       </div>
                       <div className="p-6 rounded-3xl bg-secondary/30 border border-white/5 flex flex-col justify-between">
                          <div>
                            <p className="text-[9px] font-black uppercase text-muted-foreground/40 mb-2">Тайминг</p>
                            <p className="text-xs font-bold text-primary">{event.nutrition.timing || 'За 90 минут до тренировки'}</p>
                          </div>
                          <div className="mt-4 pt-4 border-t border-white/5">
                             <p className="text-[9px] font-black uppercase text-muted-foreground/40 mb-2">Цель</p>
                             <p className="text-xs font-medium text-muted-foreground italic">"Загрузка гликогена для повышения интенсивности в жиме штанги."</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* General Description for other types */}
            {event.type !== 'WORKOUT' && event.type !== 'NUTRITION' && (
              <div className="space-y-3">
                 <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40 px-2">Детали события</h4>
                 <p className="text-sm text-muted-foreground leading-relaxed bg-white/5 p-6 rounded-3xl border border-white/5">
                    {event.description || 'Детальный план для этого события еще не сформирован. Коуч добавит подробности ближе к началу.'}
                 </p>
              </div>
            )}

            {/* Intensity / Metrics */}
            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 rounded-[2rem] bg-secondary/30 border border-white/5 group hover:bg-white/5 transition-colors">
                  <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/40 mb-3">System Load</p>
                  <div className="flex items-center gap-3">
                     <span className={cn(
                       "text-lg font-black",
                       event.metadata?.intensity === 'HIGH' ? "text-orange-400" : "text-primary"
                     )}>{event.metadata?.intensity || 'MEDIUM'}</span>
                     <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={cn(
                            "w-1.5 h-4 rounded-full",
                            (i === 1 && event.metadata?.intensity === 'LOW') ||
                            (i <= 3 && (event.metadata?.intensity === 'MEDIUM' || !event.metadata?.intensity)) ||
                            (i <= 5 && event.metadata?.intensity === 'HIGH') ? "bg-primary shadow-[0_0_8px_rgba(223,255,0,0.5)]" : "bg-white/10"
                          )} />
                        ))}
                     </div>
                  </div>
               </div>
               <div className="p-6 rounded-[2rem] bg-secondary/30 border border-white/5 group hover:bg-white/5 transition-colors">
                  <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/40 mb-3">Biological Target</p>
                  <div className="flex items-center gap-3">
                     <Target className="w-5 h-5 text-primary" />
                     <p className="text-lg font-black text-white">{event.metadata?.targetMuscle || 'General'}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Footer Actions - Sticky */}
          <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-xl shrink-0 z-20 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-3 min-w-max md:min-w-0">
               <GradientButton 
                 variant="outline" 
                 className="flex-1 h-14 text-[10px] font-black border-white/10 hover:border-primary/40 px-8"
                 onClick={() => handleStatusChange(event.status === 'COMPLETED' ? 'PLANNED' : 'COMPLETED')}
               >
                 {event.status === 'COMPLETED' ? (
                   <>
                     <RotateCcw className="w-4 h-4 mr-3" />
                     ОТМЕНИТЬ
                   </>
                 ) : (
                   <>
                     <CheckCircle2 className="w-4 h-4 mr-3" />
                     ВЫПОЛНЕНО
                   </>
                 )}
               </GradientButton>
               
               <GradientButton 
                 variant="outline" 
                 className="flex-1 h-14 text-[10px] font-black border-white/10 hover:border-primary/40 px-8"
                 onClick={() => setIsEditing(true)}
               >
                  <Edit3 className="w-4 h-4 mr-3" />
                  ИЗМЕНИТЬ
               </GradientButton>

               <GradientButton 
                 variant="outline" 
                 className="flex-1 h-14 text-[10px] font-black border-white/10 hover:border-primary/40 px-8"
                 onClick={() => setIsEditing(true)}
               >
                  <Calendar className="w-4 h-4 mr-3" />
                  ПЕРЕНЕСТИ
               </GradientButton>

               <button 
                 onClick={handleRemove}
                 className="h-14 aspect-square md:aspect-auto md:px-8 rounded-[1.25rem] bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all"
               >
                  <Trash2 className="w-4 h-4 md:mr-3" />
                  <span className="hidden md:inline">УДАЛИТЬ</span>
               </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <AnimatePresence>
         {isEditing && (
            <AddEventModal 
               eventToEdit={event} 
               onClose={() => setIsEditing(false)} 
            />
         )}
      </AnimatePresence>
    </div>
  );
};
