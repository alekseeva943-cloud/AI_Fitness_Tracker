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
import { AIOrchestrator } from '../../../ai/orchestrator/ai-orchestrator';
import { AIActionType } from '../../../ai/orchestrator/types';
import { AddEventModal } from './AddEventModal';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface AIEventDetailsModalProps {
  event: PlanEvent;
  onClose: () => void;
}

type ChatStatus = 'idle' | 'thinking' | 'retrieving_context' | 'generating' | 'completed' | 'failed';
type TabType = 'TECHNIQUE' | 'COACH';

export const AIEventDetailsModal: React.FC<AIEventDetailsModalProps> = ({ event, onClose }) => {
  const updatePlanEvent = useFitnessStore(state => state.updatePlanEvent);
  const setPlanEventStatus = useFitnessStore(state => state.setPlanEventStatus);
  const removePlanEvent = useFitnessStore(state => state.removePlanEvent);
  const profile = useFitnessStore(state => state.profile);
  
  const [expandedExercise, setExpandedExercise] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<TabType>('TECHNIQUE');
  const [isEditing, setIsEditing] = useState(false);
  
  // Exercise-specific chat states
  const [chatInputs, setChatInputs] = useState<Record<number, string>>({});
  const [chatThreads, setChatThreads] = useState<Record<number, { role: 'user' | 'ai', content: string, action?: string }[]>>({});
  const [chatStatuses, setChatStatuses] = useState<Record<number, ChatStatus>>({});
  const chatScrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  React.useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatThreads, chatStatuses, activeTab]);

  const handleStatusChange = (status: PlanEvent['status']) => {
    setPlanEventStatus(event.id, status);
  };

  const handleRemove = () => {
    removePlanEvent(event.id);
    onClose();
  };

  const handleAskCoach = async (idx: number, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const input = chatInputs[idx] || '';
    if (!input.trim() || chatStatuses[idx] === 'thinking') return;

    const userMsg = input;
    const history = chatThreads[idx] || [];
    
    setChatThreads(prev => ({
        ...prev,
        [idx]: [...history, { role: 'user', content: userMsg }]
    }));
    setChatInputs(prev => ({ ...prev, [idx]: '' }));
    setChatStatuses(prev => ({ ...prev, [idx]: 'thinking' }));

    try {
        const state = useFitnessStore.getState();
        const analytics = {}; 

        const response = await AIOrchestrator.executeAction(state, analytics, {
            actionType: AIActionType.EXERCISE_COACH,
            userMessage: userMsg,
            contextOverride: {
                workout: event,
                exercise: event.exercises?.[idx],
                chatHistory: history
            }
        });

        if (response.success) {
            setChatThreads(prev => ({
                ...prev,
                [idx]: [...(prev[idx] || []), { 
                    role: 'ai', 
                    content: response.summary,
                    action: response.recommendations?.[0]?.action?.id 
                }]
            }));
        } else {
             throw new Error('AI Error');
        }
        setChatStatuses(prev => ({ ...prev, [idx]: 'completed' }));
    } catch (error) {
        setChatStatuses(prev => ({ ...prev, [idx]: 'failed' }));
        setChatThreads(prev => ({
            ...prev,
            [idx]: [...(prev[idx] || []), { role: 'ai', content: "Извини, произошла ошибка связи с коучем. Попробуй еще раз." }]
        }));
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
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 30 }}
        className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-transparent"
      >
        <GlassCard className="border-white/5 overflow-hidden flex flex-col h-full shadow-[0_40px_100px_rgba(0,0,0,0.8)] rounded-3xl bg-[#0B1020]">
          {/* Header */}
          <div className="px-10 py-6 flex items-center justify-between shrink-0 border-b border-white/5 bg-white/[0.01]">
             <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                   {event.type === 'WORKOUT' ? <Dumbbell className="w-6 h-6" /> : 
                    event.type === 'NUTRITION' ? <Utensils className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
                </div>
                <div>
                   <h2 className="text-xl font-bold tracking-tight text-white/95 mb-1 uppercase">{event.title}</h2>
                   <div className="flex items-center gap-4 text-white/40">
                      <div className="flex items-center gap-1.5">
                         <Clock className="w-3.5 h-3.5" />
                         <span className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
                             {format(new Date(event.date), 'EEEE, HH:mm', { locale: ru })}
                         </span>
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                         {event.duration} МИН
                      </div>
                   </div>
                </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/20 hover:text-white/60"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-hidden flex min-h-0">
             {/* Left Rail: Exercises */}
             <div className="w-[300px] border-r border-white/5 overflow-y-auto scrollbar-hide py-6 px-4 space-y-1.5 shrink-0 bg-[#11182A]">
                <div className="flex items-center justify-between mb-4 px-2">
                   <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Программа</h3>
                   <span className="text-[8px] font-bold text-primary/40 uppercase">{event.exercises?.length || 0} этапов</span>
                </div>
                
                {event.exercises?.map((ex, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { setExpandedExercise(idx); setActiveTab('TECHNIQUE'); }}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all duration-200 group relative",
                      expandedExercise === idx ? "bg-white/[0.04] border-white/10 shadow-sm" : "bg-transparent border-transparent hover:bg-white/[0.02]"
                    )}
                  >
                    <h4 className={cn(
                      "text-xs font-bold uppercase tracking-tight mb-1 transition-colors",
                      expandedExercise === idx ? "text-primary" : "text-white/40 group-hover:text-white/70"
                    )}>{ex.name}</h4>
                    <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-white/10">
                       <span>{ex.sets} × {ex.reps}</span>
                       <span>{ex.weight || 'СВ'}</span>
                    </div>
                  </button>
                ))}
             </div>

             {/* Right Content */}
             <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#050816]/30 flex flex-col">
                <div className="flex-1 p-8">
                   {expandedExercise !== null && event.exercises?.[expandedExercise] ? (
                     <div className="max-w-3xl mx-auto space-y-8">
                        <div className="flex items-center justify-between border-b border-white/5 pb-6">
                           <div className="space-y-1">
                              <h3 className="text-xl font-bold text-white/90 uppercase tracking-tight">{event.exercises[expandedExercise].name}</h3>
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Target: High Intensity</p>
                           </div>
                           <div className="flex gap-1 p-0.5 bg-black/20 rounded-lg border border-white/5">
                              <button 
                                 onClick={() => setActiveTab('TECHNIQUE')}
                                 className={cn(
                                   "px-5 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                                   activeTab === 'TECHNIQUE' ? "bg-white/10 text-white" : "text-white/20 hover:text-white/40"
                                 )}
                              >Техника</button>
                              <button 
                                 onClick={() => setActiveTab('COACH')}
                                 className={cn(
                                   "px-5 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                   activeTab === 'COACH' ? "bg-primary/20 text-primary" : "text-white/20 hover:text-white/40"
                                 )}
                              >
                                 Коуч
                              </button>
                           </div>
                        </div>

                        <AnimatePresence mode="wait">
                          {activeTab === 'TECHNIQUE' ? (
                            <motion.div 
                              key="tech"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="space-y-8 pb-12"
                            >
                               <section className="space-y-4">
                                  <div className="flex items-center gap-3">
                                     <span className="text-[9px] font-black uppercase tracking-widest text-primary/40 italic">01. Исходная позиция</span>
                                     <div className="h-px flex-1 bg-white/[0.03]" />
                                  </div>
                                  <p className="text-sm font-medium text-white/50 leading-relaxed max-w-2xl">
                                     {event.exercises[expandedExercise].name === 'Приседания со штангой' 
                                       ? 'Установи штангу на уровне ключиц. Сведи лопатки и создай жесткую платформу из мышц спины. Ноги на ширине плеч, носки слегка развернуты.' 
                                       : event.exercises[expandedExercise].name.includes('Жим')
                                       ? 'Ляг на скамью, обеспечь 3 точки опоры: лопатки, таз и стопы. Сохраняй естественный прогиб в пояснице, не отрывая таз.'
                                       : 'Прими устойчивое исходное положение. Проверь хват и симметрию расположения веса. Сфокусируй взгляд.'}
                                  </p>
                               </section>

                               <section className="space-y-4">
                                  <div className="flex items-center gap-3">
                                     <span className="text-[9px] font-black uppercase tracking-widest text-primary/40 italic">02. Механика работы</span>
                                     <div className="h-px flex-1 bg-white/[0.03]" />
                                  </div>
                                  <ul className="space-y-3">
                                     {(event.exercises[expandedExercise].technique?.steps || [
                                       'Контролируемое опускание в течение 3 секунд.',
                                       'Пиковая концентрация и растяжение в нижней точке.',
                                       'Мощное выжимание на выдохе, сохраняя темп.',
                                       'Не делай полной блокировки суставов в верхней точке.'
                                     ]).map((step, i) => (
                                       <li key={i} className="flex gap-4">
                                          <span className="text-[10px] font-black text-white/5 mt-1">{i + 1}</span>
                                          <p className="text-sm text-white/70 font-medium leading-relaxed">{step}</p>
                                       </li>
                                     ))}
                                  </ul>
                               </section>

                               <div className="grid grid-cols-2 gap-4">
                                  <div className="p-5 rounded-xl bg-red-400/5 border border-red-400/5 space-y-2">
                                     <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-3.5 h-3.5 text-red-500/40" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-red-400/40">Ошибки</span>
                                     </div>
                                     <ul className="text-[11px] font-medium text-white/20 space-y-1">
                                        <li>• Чрезмерный темп</li>
                                        <li>• Потеря контроля в негативной фазе</li>
                                        <li>• Нарушение дыхательного ритма</li>
                                     </ul>
                                  </div>
                                  <div className="p-5 rounded-xl bg-primary/5 border border-primary/5 space-y-2">
                                     <div className="flex items-center gap-2">
                                        <Zap className="w-3.5 h-3.5 text-primary/40" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/40">PRO-TIP</span>
                                     </div>
                                     <p className="text-[11px] font-medium text-white/40 italic leading-relaxed">
                                        "Сфокусируйся на растяжении мышцы в нижней фазе. Секундная пауза там увеличит гипертрофию."
                                     </p>
                                  </div>
                               </div>
                            </motion.div>
                          ) : (
                            <motion.div 
                              key="coach"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="flex flex-col h-[520px] bg-[#131D31]/40 rounded-2xl border border-white/5 overflow-hidden"
                            >
                               <div 
                                 ref={chatScrollRef}
                                 className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6 scroll-smooth"
                               >
                                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/40 font-medium leading-relaxed">
                                     Коуч на связи для <b>{event.exercises[expandedExercise].name}</b>. Спрашивай экспертное мнение по технике, весам или альтернативам.
                                  </div>

                                  {(chatThreads[expandedExercise] || []).map((msg, mi) => (
                                    <div key={mi} className={cn(
                                      "flex flex-col",
                                      msg.role === 'user' ? "items-end" : "items-start"
                                    )}>
                                       <div className={cn(
                                          "px-5 py-3.5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm",
                                          msg.role === 'user' 
                                            ? "bg-white/10 text-white/90 rounded-tr-sm" 
                                            : "bg-[#273546] text-[#bbf7d0] rounded-tl-sm border border-emerald-500/10"
                                       )}>
                                          {msg.content}
                                          {msg.action === 'REPLACEMENT_APPLIED' && (
                                            <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2 text-emerald-400">
                                               <CheckCircle2 className="w-3 h-3" />
                                               <span className="text-[8px] font-black uppercase">Изменения применены</span>
                                            </div>
                                          )}
                                       </div>
                                       <span className="text-[8px] font-black text-white/10 uppercase mt-1.5 px-1 tracking-wider">
                                          {msg.role === 'user' ? 'Вы' : 'Field Coach Genesis'}
                                       </span>
                                    </div>
                                  ))}

                                  {chatStatuses[expandedExercise] === 'thinking' && (
                                     <div className="flex gap-1.5 p-4 bg-white/[0.02] rounded-xl w-fit border border-white/5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse [animation-delay:200ms]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse [animation-delay:400ms]" />
                                     </div>
                                  )}
                               </div>

                               <div className="p-4 bg-black/20 border-t border-white/5 space-y-4">
                                  <div className="flex flex-wrap gap-2">
                                     <button 
                                         onClick={() => setChatInputs(prev => ({ ...prev, [expandedExercise!]: 'Чем заменить?' }))}
                                         className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-white/30 hover:bg-white/10 hover:text-white transition-all uppercase tracking-wide"
                                     >Заменить</button>
                                     <button 
                                         onClick={() => setChatInputs(prev => ({ ...prev, [expandedExercise!]: 'Слишком тяжело.' }))}
                                         className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-white/30 hover:bg-white/10 hover:text-white transition-all uppercase tracking-wide"
                                     >Снизить вес</button>
                                     <button 
                                         onClick={() => setChatInputs(prev => ({ ...prev, [expandedExercise!]: 'Болят суставы.' }))}
                                         className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-white/30 hover:bg-white/10 hover:text-red-400 transition-all uppercase tracking-wide"
                                     >Есть боль</button>
                                  </div>

                                  <form onSubmit={(e) => handleAskCoach(expandedExercise!, e)} className="relative">
                                     <input 
                                       value={chatInputs[expandedExercise!] || ''}
                                       onChange={e => setChatInputs(prev => ({ ...prev, [expandedExercise!]: e.target.value }))}
                                       placeholder="Спросить коуча..."
                                       className="w-full bg-black/40 border border-white/5 rounded-xl pl-4 pr-24 py-3 text-sm focus:outline-none focus:border-white/20 transition-all text-white placeholder:text-white/10"
                                     />
                                     <button 
                                        type="submit"
                                        className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-white/10 text-white font-black uppercase text-[9px] hover:bg-white/20 active:scale-95 transition-all tracking-widest border border-white/5"
                                     >
                                        Отправить
                                     </button>
                                   </form>
                               </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                     </div>
                   ) : (
                     <div className="h-[60vh] flex flex-col items-center justify-center text-center opacity-10">
                        <Brain className="w-16 h-16 text-white mb-4" />
                        <p className="text-[10px] font-black text-white uppercase tracking-[0.5em]">Phase Selection Required</p>
                     </div>
                   )}
                </div>
             </div>
          </div>

          {/* Footer Actions */}
          <div className="px-10 py-6 border-t border-white/5 bg-[#0B1020] flex items-center justify-between shrink-0">
             <div className="flex items-center gap-10">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-[0.1em] text-white/10 mb-2">Статус сессии</span>
                    <div className="flex gap-1">
                       {(['PLANNED', 'COMPLETED', 'SKIPPED'] as const).map(s => (
                         <button
                           key={s}
                           onClick={() => handleStatusChange(s)}
                           className={cn(
                             "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                             event.status === s ? "bg-white/10 text-white" : "text-white/20 hover:text-white/40"
                           )}
                         >
                           {s === 'PLANNED' ? 'План' : s === 'COMPLETED' ? 'Готово' : 'Пропуск'}
                         </button>
                       ))}
                    </div>
                </div>
             </div>

             <div className="flex items-center gap-6">
                <button 
                  onClick={() => { handleStatusChange('COMPLETED'); onClose(); }}
                  className="px-6 py-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                   Завершить тренировку
                </button>
               
                <div className="h-8 w-px bg-white/5" />

                <div className="flex gap-2">
                   <button 
                     onClick={() => setIsEditing(true)}
                     className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-white/20 hover:text-white/60 hover:bg-white/[0.06] transition-all"
                   >
                      <Edit3 className="w-4 h-4" />
                   </button>

                   <button 
                     onClick={handleRemove} 
                     className="p-3 rounded-xl bg-red-500/[0.03] border border-red-500/10 text-red-500/20 hover:text-red-500/60 hover:bg-red-500/[0.06] transition-all"
                   >
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
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
