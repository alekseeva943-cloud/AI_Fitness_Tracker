import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Brain, Zap, Clock, Activity, Target, 
  Trash2, Calendar, CheckCircle2, AlertTriangle,
  RotateCcw, Save, Trash, ChevronRight, Edit3,
  ChevronDown, ChevronUp, Utensils, Info, Lightbulb,
  Dumbbell, Sparkles, MessageCircle, RefreshCw
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

type ChatStatus = 'idle' | 'thinking' | 'retrieving_context' | 'generating' | 'completed' | 'failed';
type TabType = 'TECHNIQUE' | 'MISTAKES' | 'WHY';

export const AIEventDetailsModal: React.FC<AIEventDetailsModalProps> = ({ event, onClose }) => {
  const updatePlanEvent = useFitnessStore(state => state.updatePlanEvent);
  const setPlanEventStatus = useFitnessStore(state => state.setPlanEventStatus);
  const removePlanEvent = useFitnessStore(state => state.removePlanEvent);
  const profile = useFitnessStore(state => state.profile);
  
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('TECHNIQUE');
  const [isEditing, setIsEditing] = useState(false);
  
  // Exercise-specific chat states
  const [chatInputs, setChatInputs] = useState<Record<number, string>>({});
  const [chatThreads, setChatThreads] = useState<Record<number, { role: 'user' | 'ai', content: string }[]>>({});
  const [chatStatuses, setChatStatuses] = useState<Record<number, ChatStatus>>({});

  const handleStatusChange = (status: PlanEvent['status']) => {
    setPlanEventStatus(event.id, status);
  };

  const handleRemove = () => {
    removePlanEvent(event.id);
    onClose();
  };

  const handleExerciseReplace = (idx: number, newExercise: string, newWeight?: string) => {
    if (!event.exercises) return;
    const newExList = [...event.exercises];
    newExList[idx] = { 
        ...newExList[idx], 
        name: newExercise,
        weight: newWeight || newExList[idx].weight
    };
    updatePlanEvent(event.id, { exercises: newExList });
  };

  const handleAskCoach = async (idx: number, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const input = chatInputs[idx] || '';
    if (!input.trim() || chatStatuses[idx] === 'thinking') return;

    const userMsg = input;
    setChatThreads(prev => ({
        ...prev,
        [idx]: [...(prev[idx] || []), { role: 'user', content: userMsg }]
    }));
    setChatInputs(prev => ({ ...prev, [idx]: '' }));
    setChatStatuses(prev => ({ ...prev, [idx]: 'thinking' }));

    // AI Simulation logic for exercise-specific chat
    try {
        await new Promise(r => setTimeout(r, 1000));
        setChatStatuses(prev => ({ ...prev, [idx]: 'generating' }));
        await new Promise(r => setTimeout(r, 1200));

        let aiResponse = "";
        const lowerInput = userMsg.toLowerCase();
        const currentExName = event.exercises?.[idx].name || '';

        if (lowerInput.includes('замен') || lowerInput.includes('чем')) {
            aiResponse = `Для ${currentExName} я могу предложить: жим гантелей, жим в Смите или жим в тренажере. Что тебе ближе по ощущениям?`;
            
            // Check follow up simulate
            if (lowerInput.includes('гантел') || lowerInput.includes('свободн')) {
                aiResponse = "Договорились. Меняю на жим гантелей. Твой рабочий вес составит 28 кг для 8-10 повторений.";
                handleExerciseReplace(idx, 'Жим гантелей', '28 КГ');
            }
        } else if (lowerInput.includes('тяжело') || lowerInput.includes('вес')) {
            aiResponse = `Если сегодня ${currentExName} идет туго, давай снизим вес на 10%. Это позволит сохранить технику и не перегрузить ЦНС.`;
        } else if (profile?.injuries && profile.injuries.length > 0 && (lowerInput.includes('боль') || lowerInput.includes('травм'))) {
            aiResponse = `Вижу в твоем профиле упоминание: ${profile.injuries.join(', ')}. При дискомфорте в этих зонах мы немедленно снижаем интенсивность. Давай заменим упражнение на более щадящий вариант.`;
        } else {
            aiResponse = `По направлению ${currentExName}: фокусируйся на растяжении в нижней точке и не блокируй локти наверху. Это сохранит напряжение в целевой мышце.`;
        }

        setChatThreads(prev => ({
            ...prev,
            [idx]: [...(prev[idx] || []), { role: 'ai', content: aiResponse }]
        }));
        setChatStatuses(prev => ({ ...prev, [idx]: 'completed' }));
    } catch (error) {
        setChatStatuses(prev => ({ ...prev, [idx]: 'failed' }));
    } finally {
        setTimeout(() => setChatStatuses(prev => ({ ...prev, [idx]: 'idle' })), 1000);
    }
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
        className="relative w-full max-w-2xl h-[90vh] flex flex-col bg-transparent"
      >
        <GlassCard className="border-white/10 overflow-hidden flex flex-col h-full shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
          {/* Header */}
          <div className="p-10 pb-6 flex items-start justify-between bg-white/[0.01] shrink-0 border-b border-white/5">
             <div className="space-y-4">
                <div className="flex items-center gap-5">
                   <div className="w-16 h-16 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                      {event.type === 'WORKOUT' ? <Dumbbell className="w-8 h-8" /> : 
                       event.type === 'NUTRITION' ? <Utensils className="w-8 h-8" /> : <Calendar className="w-8 h-8" />}
                   </div>
                   <div>
                      <h2 className="text-2xl font-display font-bold tracking-tight uppercase text-white">{event.title}</h2>
                      <div className="flex items-center gap-4 mt-2">
                         <div className="flex items-center gap-2 text-muted-foreground/60">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {format(new Date(event.date), 'EEEE, HH:mm', { locale: ru })}
                            </span>
                         </div>
                         <div className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-black uppercase tracking-tighter">
                            {event.duration} MIN SESSION
                         </div>
                      </div>
                   </div>
                </div>
             </div>
             <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all text-muted-foreground/40 hover:text-white"><X className="w-6 h-6" /></button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide px-10 py-8 space-y-12 min-h-0">
            {/* Session Summary */}
            <section className="space-y-3">
               <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Session Concept</h3>
               </div>
               <p className="text-sm font-medium text-white/80 leading-relaxed max-w-lg">
                  {event.aiRationale || "Фокусируемся на базовых движениях с контролируемым темпом. Твоя задача сегодня — максимально прочувствовать связь мозг-мышцы."}
               </p>
               <div className="flex gap-4 mt-6">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                     <Target className="w-3.5 h-3.5 text-primary" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Hypertrophy</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                     <Activity className="w-3.5 h-3.5 text-emerald-400" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-white/60">72% Intensity</span>
                  </div>
               </div>
            </section>

            {/* Exercise List */}
            {event.exercises && (
               <section className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Exercises</h3>
                     <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest">{event.exercises.length} Total</span>
                  </div>

                  <div className="space-y-4">
                     {event.exercises.map((ex, idx) => (
                        <div 
                          key={idx}
                          className={cn(
                            "rounded-[2rem] border transition-all duration-500 overflow-hidden",
                            expandedExercise === idx ? "bg-white/[0.04] border-white/20 shadow-2xl" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                          )}
                        >
                           <button 
                             onClick={() => setExpandedExercise(expandedExercise === idx ? null : idx)}
                             className="w-full p-6 flex items-center justify-between group text-left"
                           >
                              <div className="flex-1">
                                 <h4 className="text-base font-bold text-white uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">{ex.name}</h4>
                                 <div className="flex flex-wrap gap-6 text-muted-foreground/60">
                                    <div className="flex flex-col">
                                       <span className="text-[8px] font-black uppercase tracking-widest mb-1">Sets</span>
                                       <span className="text-xs font-bold text-white/90">{ex.sets}</span>
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-[8px] font-black uppercase tracking-widest mb-1">Reps</span>
                                       <span className="text-xs font-bold text-white/90">{ex.reps}</span>
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-[8px] font-black uppercase tracking-widest mb-1">Weight</span>
                                       <span className="text-xs font-bold text-primary font-mono">{ex.weight || 'BW'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-[8px] font-black uppercase tracking-widest mb-1">Rest</span>
                                       <span className="text-xs font-bold text-white/90">90s</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                 <ChevronDown className={cn("w-6 h-6 transition-transform duration-500", expandedExercise === idx && "rotate-180")} />
                              </div>
                           </button>

                           <AnimatePresence>
                              {expandedExercise === idx && (
                                 <motion.div
                                   initial={{ height: 0, opacity: 0 }}
                                   animate={{ height: 'auto', opacity: 1 }}
                                   exit={{ height: 0, opacity: 0 }}
                                   className="border-t border-white/5"
                                 >
                                    <div className="p-8 space-y-10">
                                       {/* Tabs */}
                                       <div className="flex gap-1 p-1 bg-black/40 rounded-2xl w-fit border border-white/5">
                                          {(['TECHNIQUE', 'MISTAKES', 'WHY'] as TabType[]).map(tab => (
                                             <button
                                               key={tab}
                                               onClick={() => setActiveTab(tab)}
                                               className={cn(
                                                 "px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                 activeTab === tab ? "bg-primary text-black" : "text-muted-foreground/40 hover:text-white"
                                               )}
                                             >
                                                {tab === 'TECHNIQUE' ? 'Техника' : tab === 'MISTAKES' ? 'Ошибки' : 'Зачем'}
                                             </button>
                                          ))}
                                       </div>

                                       <div className="min-h-[120px]">
                                          {activeTab === 'TECHNIQUE' && (
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-2">
                                                <div className="space-y-4">
                                                   <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Execution Steps</p>
                                                   <ul className="space-y-3">
                                                      {(ex.technique?.steps || ['Плавно опускай вес', 'Фокусируйся на мышце', 'Выдох на усилии']).map((step, i) => (
                                                         <li key={i} className="flex gap-4 text-xs text-white/70 font-medium leading-relaxed">
                                                            <span className="text-primary font-bold">{i + 1}.</span> {step}
                                                         </li>
                                                      ))}
                                                   </ul>
                                                </div>
                                                <div className="space-y-6">
                                                   <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                                                      <p className="text-[9px] font-black uppercase text-primary/60 mb-2">Coach Cue</p>
                                                      <p className="text-xs text-primary/90 font-medium italic">"{ex.technique?.coachTip || 'Держи локти под углом 45 градусов к корпусу.'}"</p>
                                                   </div>
                                                   <div className="flex gap-8">
                                                      <div>
                                                         <p className="text-[8px] font-black text-muted-foreground/40 uppercase mb-1">Tempo</p>
                                                         <p className="text-xs font-mono text-white/80">3-1-1</p>
                                                      </div>
                                                      <div>
                                                         <p className="text-[8px] font-black text-muted-foreground/40 uppercase mb-1">Breathing</p>
                                                         <p className="text-xs text-white/80">Exhale on concentric</p>
                                                      </div>
                                                   </div>
                                                </div>
                                             </div>
                                          )}

                                          {activeTab === 'MISTAKES' && (
                                             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-red-400/60">Danger Zone</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                   <div className="p-5 rounded-2xl bg-red-400/5 border border-red-400/10 flex gap-4">
                                                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                                      <div className="space-y-1">
                                                         <p className="text-xs font-bold text-red-200">Чрезмерный прогиб</p>
                                                         <p className="text-[11px] text-red-200/40">Снимает нагрузку с грудных и перегружает поясницу.</p>
                                                      </div>
                                                   </div>
                                                   <div className="p-5 rounded-2xl bg-red-400/5 border border-red-400/10 flex gap-4">
                                                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                                      <div className="space-y-1">
                                                         <p className="text-xs font-bold text-red-200">Отрыв лопаток</p>
                                                         <p className="text-[11px] text-red-200/40">Увеличивает нагрузку на переднюю дельту.</p>
                                                      </div>
                                                   </div>
                                                </div>
                                             </div>
                                          )}

                                          {activeTab === 'WHY' && (
                                             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Tactical Reasoning</p>
                                                <p className="text-sm font-medium text-white/60 leading-relaxed max-w-lg italic">
                                                   "Это упражнение является основным для развития силового потенциала и создания необходимого объема нагрузки на текущем этапе подготовки."
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                   {['Heavy Load', 'Mechanical Tension', 'Basics'].map(tag => (
                                                      <span key={tag} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-muted-foreground/60 uppercase">{tag}</span>
                                                   ))}
                                                </div>
                                             </div>
                                          )}
                                       </div>

                                       {/* Exercise Chat */}
                                       <div className="pt-10 border-t border-white/5 space-y-6">
                                          <div className="flex items-center gap-3">
                                             <MessageCircle className="w-4 h-4 text-primary" />
                                             <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">Вопрос по упражнению</p>
                                          </div>

                                          <div className="space-y-4">
                                             {(chatThreads[idx] || []).map((msg, mi) => (
                                                <div key={mi} className={cn(
                                                   "p-4 rounded-2xl text-xs font-medium max-w-[80%] leading-relaxed",
                                                   msg.role === 'user' ? "bg-white/5 border border-white/10 ml-auto text-right text-white/90" : "bg-primary/5 border border-primary/10 text-primary/90"
                                                )}>
                                                   {msg.content}
                                                </div>
                                             ))}

                                             {chatStatuses[idx] === 'thinking' || chatStatuses[idx] === 'generating' && (
                                                <div className="flex gap-2 p-4 bg-primary/5 rounded-2xl w-fit animate-pulse">
                                                   <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                                                   <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                                                   <span className="w-1 h-1 rounded-full bg-primary animate-bounce" />
                                                </div>
                                             )}

                                             <form onSubmit={(e) => handleAskCoach(idx, e)} className="relative group/chat">
                                                <input 
                                                  value={chatInputs[idx] || ''}
                                                  onChange={e => setChatInputs(prev => ({ ...prev, [idx]: e.target.value }))}
                                                  placeholder="Спроси тренера... (замена, вес, техника)"
                                                  className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 text-[11px] focus:outline-none focus:border-primary/40 focus:bg-black/60 transition-all"
                                                />
                                                <button 
                                                   type="submit"
                                                   className="absolute right-2 top-2 bottom-2 px-3 rounded-lg bg-primary text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                                                >
                                                   <ChevronRight className="w-4 h-4 font-black" />
                                                </button>
                                             </form>
                                             
                                             <div className="flex gap-2">
                                                <button 
                                                    onClick={() => { setChatInputs(prev => ({ ...prev, [idx]: 'Чем заменить?' }));  }}
                                                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[8px] font-black text-muted-foreground/40 hover:text-primary transition-all uppercase"
                                                >Заменить</button>
                                                <button 
                                                    onClick={() => { setChatInputs(prev => ({ ...prev, [idx]: 'Оцени вес' })); }}
                                                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[8px] font-black text-muted-foreground/40 hover:text-primary transition-all uppercase"
                                                >Анализ веса</button>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     ))}
                  </div>
               </section>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-10 border-t border-white/5 bg-black/40 flex items-center gap-4 shrink-0">
             <GradientButton 
               onClick={() => { handleStatusChange('COMPLETED'); onClose(); }}
               className="flex-1 h-16 text-[10px] font-black uppercase tracking-[0.3em] rounded-[1.25rem] shadow-xl shadow-primary/10"
             >
                <CheckCircle2 className="w-5 h-5 mr-3" />
                Done Session
             </GradientButton>
             
             <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-16 h-16 rounded-[1.25rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-primary/40 hover:bg-primary/10 transition-all group"
                  title="Edit Plan"
                >
                   <Edit3 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>

                <button 
                  onClick={handleRemove} 
                  className="w-16 h-16 rounded-[1.25rem] bg-red-400/5 border border-red-400/10 flex items-center justify-center text-red-400/40 hover:text-red-400 hover:border-red-400/40 hover:bg-red-400/10 transition-all group"
                  title="Reschedule"
                >
                   <Trash2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
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
