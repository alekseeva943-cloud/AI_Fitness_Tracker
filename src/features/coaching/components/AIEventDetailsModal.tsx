import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Brain, Zap, Clock, Activity, Target, 
  Trash2, Calendar, CheckCircle2, AlertTriangle,
  RotateCcw, Save, Trash, ChevronRight, Edit3,
  ChevronDown, ChevronUp, Utensils, Info, Lightbulb,
  Dumbbell, Sparkles
} from 'lucide-react';
import { PlanEvent, ExercisePlan } from '../../../types';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GradientButton } from '../../../components/ui/GradientButton';
import { cn } from '../../../lib/utils';
import { useFitnessStore } from '../../../store/useFitnessStore';
import { AddEventModal } from './AddEventModal';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface AIEventDetailsModalProps {
  event: PlanEvent;
  onClose: () => void;
}

export const AIEventDetailsModal: React.FC<AIEventDetailsModalProps> = ({ event, onClose }) => {
  const setPlanEventStatus = useFitnessStore(state => state.setPlanEventStatus);
  const removePlanEvent = useFitnessStore(state => state.removePlanEvent);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleStatusChange = (status: PlanEvent['status']) => {
    setPlanEventStatus(event.id, status);
  };

  const handleRemove = () => {
    removePlanEvent(event.id);
    onClose();
  };

  const handleAskCoach = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    // AI Simulation logic for Coach personality
    setTimeout(() => {
        let aiResponse = "Анализирую твой запрос... Для этой сессии я рекомендую придерживаться плана, но если чувствуешь дискомфорт, мы можем снизить нагрузку.";
        
        const lowerInput = userMsg.toLowerCase();
        if (lowerInput.includes('замен') || lowerInput.includes('чем')) {
            aiResponse = "Для этого упражнения отличной заменой будут гантели или тренажер Смита. Это позволит лучше контролировать траекторию при твоем текущем уровне усталости.";
        } else if (lowerInput.includes('болят') || lowerInput.includes('болит')) {
            aiResponse = "Понял тебя. При боли в суставах мы немедленно меняем протокол. Я рекомендую исключить осевую нагрузку сегодня. Давай заменим жим штанги на сведение в кроссовере.";
        } else if (lowerInput.includes('вес') || lowerInput.includes('тяжело')) {
            aiResponse = "Твой сон за последние 2 дня был ниже 7 часов. Это напрямую влияет на силовой потенциал. Давай снизим рабочий вес на 10% и сфокусируемся на темпе 3-0-1.";
        }

        setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
        setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl h-[85vh] flex flex-col bg-transparent"
      >
        <GlassCard className="border-white/10 overflow-hidden flex flex-col h-full shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="p-8 pb-6 flex items-start justify-between bg-white/[0.02]">
             <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      {event.type === 'WORKOUT' ? <Dumbbell className="w-7 h-7" /> : 
                       event.type === 'NUTRITION' ? <Utensils className="w-7 h-7" /> : <Calendar className="w-7 h-7" />}
                   </div>
                   <div>
                      <h2 className="text-2xl font-display font-medium tracking-tight uppercase">{event.title}</h2>
                      <div className="flex items-center gap-3 mt-1.5">
                         <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">
                            {format(new Date(event.date), 'EEEE, HH:mm', { locale: ru })}
                         </div>
                         <div className="flex items-center gap-1.5 text-primary text-[9px] font-black uppercase tracking-widest">
                            <Zap className="w-3 h-3" />
                            {event.source === 'AI' ? 'AI Optimized' : 'Precision Manual'}
                         </div>
                      </div>
                   </div>
                </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all text-muted-foreground"><X className="w-6 h-6" /></button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide p-8 space-y-10">
            {/* AI Coach Insights Banner - if AI event */}
            {event.aiRationale && (
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-5">
                        <Brain className="w-12 h-12" />
                    </div>
                    <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-[11px] text-primary/80 leading-relaxed font-medium italic">"{event.aiRationale}"</p>
                </div>
            )}

            {/* Exercises Accordion */}
            {event.type === 'WORKOUT' && event.exercises && (
              <section className="space-y-4">
                <div className="flex items-center justify-between px-2 mb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Execution Map</h3>
                    <span className="text-[9px] font-black text-primary/60 italic uppercase tracking-widest">{event.exercises.length} Movements</span>
                </div>
                <div className="space-y-3">
                  {event.exercises.map((ex, idx) => (
                    <motion.div 
                      key={idx}
                      className={cn(
                        "rounded-2xl border transition-all overflow-hidden",
                        expandedExercise === idx ? "bg-white/[0.04] border-white/20 shadow-2xl" : "bg-white/[0.02] border-white/5"
                      )}
                    >
                      <button 
                        onClick={() => setExpandedExercise(expandedExercise === idx ? null : idx)}
                        className="w-full p-5 flex items-center justify-between group"
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-muted-foreground/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                               {idx + 1}
                            </div>
                            <div className="text-left">
                               <p className="text-sm font-bold text-white/90 uppercase tracking-tight">{ex.name}</p>
                               <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-tight">
                                 {ex.sets} SETS × {ex.reps} • {ex.weight || 'BODYWEIGHT'}
                               </p>
                            </div>
                         </div>
                         <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform", expandedExercise === idx && "rotate-180")} />
                      </button>

                      <AnimatePresence>
                        {expandedExercise === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-5 pb-5 pt-2 border-t border-white/5"
                          >
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4 text-left">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Technique Guide</p>
                                   <ul className="space-y-2">
                                      {(ex.technique?.steps || [
                                        'Контролируй темп опускания (3 сек).',
                                        'Максимальное сокращение в пиковой точке.',
                                        'Держи корпус стабильным.'
                                      ]).map((step, sidx) => (
                                        <li key={sidx} className="flex gap-3 text-[11px] text-white/60 leading-relaxed">
                                          <span className="text-primary/40 font-bold">{sidx + 1}.</span> {step}
                                        </li>
                                      ))}
                                   </ul>
                                </div>
                                <div className="space-y-4 text-left">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-orange-400/60">Coach Insight</p>
                                   <div className="p-4 rounded-xl bg-orange-400/5 border border-orange-400/10">
                                      <p className="text-[11px] text-orange-200/80 italic leading-relaxed">
                                        "{ex.technique?.coachTip || 'Сосредоточься на связи мозг-мышцы. Не используй инерцию.'}"
                                      </p>
                                   </div>
                                   <div className="flex gap-2">
                                      {['Hypertrophy', 'Shoulders', 'Stability'].map(tag => (
                                        <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] font-black uppercase text-muted-foreground/40">{tag}</span>
                                      ))}
                                   </div>
                                </div>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* AI Coaching Thread */}
            <section className="space-y-6 pt-6 border-t border-white/5">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Brain className="w-4 h-4 text-primary" />
                     <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">AI Coach Assistant</h3>
                  </div>
                  <div className="flex gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                     <span className="text-[8px] font-black uppercase text-primary/60">Active Thinking</span>
                  </div>
               </div>

               <div className="space-y-4 mb-6">
                  {chatMessages.length === 0 && (
                    <div className="py-10 text-center space-y-4">
                       <p className="text-[11px] text-muted-foreground italic leading-relaxed">Есть вопросы по технике или весам? <br/> Спроси меня в контексте этой тренировки.</p>
                       <div className="flex flex-wrap justify-center gap-2">
                          {['Чем заменить жим?', 'Почему такой вес?', 'Болит плечо'].map(hint => (
                            <button 
                              key={hint}
                              onClick={() => { setChatInput(hint); }}
                              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-white/50 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
                            >
                               {hint}
                            </button>
                          ))}
                       </div>
                    </div>
                  )}

                  {chatMessages.map((msg, i) => (
                    <div key={i} className={cn(
                        "flex gap-4 p-4 rounded-2xl border animate-in slide-in-from-bottom-2",
                        msg.role === 'user' ? "bg-white/5 border-white/10 ml-12 text-right flex-row-reverse" : "bg-primary/5 border-primary/10 mr-12 text-left"
                    )}>
                       <div className={cn(
                           "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
                           msg.role === 'user' ? "bg-white/10 border-white/20" : "bg-primary/10 border-primary/20 text-primary"
                       )}>
                          {msg.role === 'user' ? <Activity className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                       </div>
                       <p className="text-[11px] leading-relaxed text-white/80">{msg.content}</p>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 mr-12">
                       <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                          <Brain className="w-4 h-4 animate-pulse" />
                       </div>
                       <div className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1 h-1 rounded-full bg-primary animate-bounce" />
                       </div>
                    </div>
                  )}
               </div>

               <form onSubmit={handleAskCoach} className="relative group">
                  <input 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Напиши Genesis..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xs focus:outline-none focus:border-primary/40 transition-all group-hover:border-white/20 pr-16"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-primary text-black hover:bg-primary/80 transition-all disabled:opacity-50"
                  >
                     <ChevronRight className="w-5 h-5" />
                  </button>
               </form>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="p-8 border-t border-white/5 bg-black/60 flex items-center gap-3 shrink-0">
             <GradientButton 
               onClick={() => { handleStatusChange('COMPLETED'); onClose(); }}
               className="flex-[2] h-14 text-[10px] font-black uppercase tracking-[0.2em]"
             >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                СЕССИЯ ЗАВЕРШЕНА
             </GradientButton>
             
             <div className="flex gap-2">
                <GradientButton 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                  className="w-14 h-14 p-0 flex items-center justify-center border-white/10 hover:border-primary/40"
                >
                   <Edit3 className="w-5 h-5" />
                </GradientButton>
                <GradientButton 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                  className="w-14 h-14 p-0 flex items-center justify-center border-white/10 hover:border-primary/40"
                >
                   <Calendar className="w-5 h-5" />
                </GradientButton>
                <button 
                  onClick={handleRemove} 
                  className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-black transition-all"
                >
                   <Trash2 className="w-5 h-5" />
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
