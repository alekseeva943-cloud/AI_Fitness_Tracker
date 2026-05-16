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
type TabType = 'GUIDANCE' | 'CHAT';

export const AIEventDetailsModal: React.FC<AIEventDetailsModalProps> = ({ event, onClose }) => {
  const updatePlanEvent = useFitnessStore(state => state.updatePlanEvent);
  const setPlanEventStatus = useFitnessStore(state => state.setPlanEventStatus);
  const removePlanEvent = useFitnessStore(state => state.removePlanEvent);
  const profile = useFitnessStore(state => state.profile);
  
  const [expandedExercise, setExpandedExercise] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<TabType>('GUIDANCE');
  const [isEditing, setIsEditing] = useState(false);
  
  // Exercise-specific chat states
  const [chatInputs, setChatInputs] = useState<Record<number, string>>({});
  const [chatThreads, setChatThreads] = useState<Record<number, { role: 'user' | 'ai', content: string, action?: string }[]>>({});
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
        weight: newWeight || newExList[idx].weight,
        technique: undefined // Reset technique for new exercise if needed
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

    try {
        await new Promise(r => setTimeout(r, 800));
        setChatStatuses(prev => ({ ...prev, [idx]: 'generating' }));
        await new Promise(r => setTimeout(r, 1000));

        let aiResponse = "";
        let aiAction = "";
        const lowerInput = userMsg.toLowerCase();
        const currentExName = event.exercises?.[idx].name || '';

        // Intent Classification
        if (lowerInput.includes('замен') || lowerInput.includes('чем')) {
            if (lowerInput.includes('гантел') || lowerInput.includes('свободн')) {
                aiResponse = `Принято. Жим штанги может быть травмоопасным при дискомфорте. Меняю на жим гантелей. Новый целевой вес: 26 кг на каждую руку. Это обеспечит лучшую амплитуду и безопасность лопаток.`;
                aiAction = "REPLACEMENT_APPLIED";
                handleExerciseReplace(idx, 'Жим гантелей', '26 КГ');
            } else {
                aiResponse = `Для ${currentExName} я подготовил три альтернативы: \n1. Жим гантелей (лучшая амплитуда)\n2. Жим в Смите (максимальный контроль)\n3. Жим в хаммере (безопасно для плеч).\nЧто выбираем?`;
            }
        } else if (lowerInput.includes('тяжело') || lowerInput.includes('не могу') || lowerInput.includes('вес')) {
            aiResponse = `Вижу, что ${currentExName} сегодня идет на пределе. Давай снизим рабочий вес на 10-15% (до ${parseInt(event.exercises?.[idx].weight || '0') * 0.85} кг) и сфокусируемся на негативной фазе (3 секунды вниз). Это даст стимул без риска травмы.`;
        } else if (lowerInput.includes('болит') || lowerInput.includes('боль') || lowerInput.includes('травма')) {
            const injuryContext = profile?.injuries?.join(', ') || 'колени/спина';
            aiResponse = `Внимание: при любой резкой боли в ${lowerInput.includes('плеч') ? 'плече' : 'рабочей зоне'} мы немедленно прекращаем упражнение. Учитывая твою историю (${injuryContext}), я рекомендую сейчас либо заменить упражнение на изоляцию, либо закончить подход прямо сейчас. Безопасность — приоритет.`;
        } else if (lowerInput.includes('как делать') || lowerInput.includes('техника')) {
            aiResponse = `По ${currentExName}: Главное — не блокируй суставы в верхней точке. Держи мышцу под напряжением. На опускании делай глубокий вдох, на выживании — мощный выдох. Лопатки плотно прижаты к скамье всё время.`;
        } else {
            aiResponse = `Для ${currentExName}: фокусируйся на растяжении в нижней точке и не блокируй локти наверху. Это сохранит напряжение в целевой мышце. Помни про темп 3-1-1.`;
        }

        setChatThreads(prev => ({
            ...prev,
            [idx]: [...(prev[idx] || []), { role: 'ai', content: aiResponse, action: aiAction }]
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
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 30 }}
        className="relative w-full max-w-4xl h-[92vh] flex flex-col bg-transparent"
      >
        <GlassCard className="border-white/10 overflow-hidden flex flex-col h-full shadow-[0_40px_120px_rgba(0,0,0,1)] rounded-[3rem]">
          {/* Header */}
          <div className="p-12 pb-8 flex items-start justify-between bg-white/[0.02] shrink-0 border-b border-white/5">
             <div className="flex items-center gap-8">
                <div className="w-20 h-20 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_40px_rgba(223,255,0,0.1)]">
                   {event.type === 'WORKOUT' ? <Dumbbell className="w-10 h-10" /> : 
                    event.type === 'NUTRITION' ? <Utensils className="w-10 h-10" /> : <Calendar className="w-10 h-10" />}
                </div>
                <div>
                   <div className="flex items-center gap-3 mb-2">
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Strategic Session</span>
                     <div className="w-1 h-1 rounded-full bg-white/20" />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">{event.type}</span>
                   </div>
                   <h2 className="text-4xl font-display font-bold tracking-tight uppercase text-white leading-none">{event.title}</h2>
                   <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2.5 text-white/40">
                         <Clock className="w-4 h-4" />
                         <span className="text-[11px] font-black uppercase tracking-widest leading-none">
                             {format(new Date(event.date), 'EEEE, HH:mm', { locale: ru })}
                         </span>
                      </div>
                      <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest leading-none">
                         {event.duration} MIN DURATION
                      </div>
                   </div>
                </div>
             </div>
             <button onClick={onClose} className="p-4 hover:bg-white/5 rounded-[1.5rem] transition-all text-white/20 hover:text-white"><X className="w-8 h-8" /></button>
          </div>

          <div className="flex-1 overflow-hidden flex min-h-0">
             {/* Left Rail: Exercises */}
             <div className="w-[380px] border-r border-white/5 overflow-y-auto scrollbar-hide py-10 px-8 space-y-4 bg-white/[0.01]">
                <div className="flex items-center justify-between mb-8 px-2">
                   <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20">Protocol Steps</h3>
                   <span className="text-[10px] font-black text-primary uppercase">{event.exercises?.length || 0} ITEMS</span>
                </div>
                
                {event.exercises?.map((ex, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { setExpandedExercise(idx); setActiveTab('GUIDANCE'); }}
                    className={cn(
                      "w-full text-left p-6 rounded-[2rem] border transition-all duration-300 group relative overflow-hidden",
                      expandedExercise === idx ? "bg-primary border-primary shadow-[0_20px_40px_rgba(223,255,0,0.15)]" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0 left-0 w-1 h-full transition-all",
                      expandedExercise === idx ? "bg-black/20" : "bg-transparent group-hover:bg-primary/20"
                    )} />
                    <h4 className={cn(
                      "text-sm font-bold uppercase tracking-tight mb-2 transition-colors",
                      expandedExercise === idx ? "text-black" : "text-white group-hover:text-primary"
                    )}>{ex.name}</h4>
                    <div className="flex items-center gap-4">
                       <span className={cn(
                         "text-[10px] font-black uppercase tracking-widest",
                         expandedExercise === idx ? "text-black/40" : "text-white/20"
                       )}>{ex.sets} × {ex.reps}</span>
                       <span className={cn(
                         "text-[10px] font-black uppercase tracking-widest",
                         expandedExercise === idx ? "text-black/60" : "text-primary"
                       )}>{ex.weight || 'BW'}</span>
                    </div>
                  </button>
                ))}
             </div>

             {/* Right Content: Coaching Details */}
             <div className="flex-1 overflow-y-auto scrollbar-hide p-12 bg-black/20">
                {expandedExercise !== null && event.exercises?.[expandedExercise] ? (
                  <div className="max-w-2xl mx-auto space-y-12">
                     <div className="flex items-center justify-between">
                        <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
                           <button 
                              onClick={() => setActiveTab('GUIDANCE')}
                              className={cn(
                                "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === 'GUIDANCE' ? "bg-white text-black" : "text-white/30 hover:text-white"
                              )}
                           >Execution</button>
                           <button 
                              onClick={() => setActiveTab('CHAT')}
                              className={cn(
                                "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                activeTab === 'CHAT' ? "bg-primary text-black" : "text-white/30 hover:text-white"
                              )}
                           >
                              <MessageCircle className="w-3 h-3" />
                              Counsel
                           </button>
                        </div>
                     </div>

                     <AnimatePresence mode="wait">
                       {activeTab === 'GUIDANCE' ? (
                         <motion.div 
                           key="guidance"
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -20 }}
                           className="space-y-12"
                         >
                            {/* Detailed Technique System */}
                            <div className="grid grid-cols-1 gap-12">
                               {/* Preparation */}
                               <section className="space-y-6">
                                  <div className="flex items-center gap-4">
                                     <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest">01 preparation</div>
                                     <div className="h-px flex-1 bg-white/5" />
                                  </div>
                                  <div className="space-y-4">
                                     <p className="text-sm font-medium text-white/90 leading-relaxed italic">
                                        "{event.exercises[expandedExercise].name === 'Приседания со штангой' ? 'Установи гриф на стойках на уровне плеч. Подсядь под него, сводя лопатки и создавая "полку" из трапеций. Плотно упрись всей стопой в пол.' : 'Займи исходное положение, проверь устойчивость опорных точек. Сфокусируй взгляд перед собой.'}"
                                     </p>
                                  </div>
                               </section>

                               {/* Execution */}
                               <section className="space-y-6">
                                  <div className="flex items-center gap-4">
                                     <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">02 execution</div>
                                     <div className="h-px flex-1 bg-white/5" />
                                  </div>
                                  <ul className="space-y-5">
                                     {(event.exercises[expandedExercise].technique?.steps || [
                                       'Глубокий вдох для стабилизации кора перед началом движения.',
                                       'Контролируемое опускание в течение 3 секунд.',
                                       'Мощное выжимание на выдохе без потери темпа.',
                                       'Пиковая концентрация в верхней точке (1 секунда).'
                                     ]).map((step, i) => (
                                       <li key={i} className="flex gap-6 group">
                                          <span className="text-[10px] font-black text-primary/40 mt-1">{String(i+1).padStart(2, '0')}</span>
                                          <p className="text-sm text-white/70 font-medium leading-relaxed group-hover:text-white transition-colors">{step}</p>
                                       </li>
                                     ))}
                                  </ul>
                               </section>

                               {/* Mistakes & Safety */}
                               <div className="grid grid-cols-2 gap-8">
                                  <section className="space-y-4 p-8 rounded-[2.5rem] bg-red-400/5 border border-red-400/10">
                                     <div className="flex items-center gap-3 mb-2">
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-red-400/60">Common Mistakes</p>
                                     </div>
                                     <ul className="space-y-2">
                                        <li className="text-[11px] font-medium text-red-200/60">• Отрыв пяток / лопаток</li>
                                        <li className="text-[11px] font-medium text-red-200/60">• Сведение коленей внутрь</li>
                                        <li className="text-[11px] font-medium text-red-200/60">• Чрезмерный прогиб спины</li>
                                     </ul>
                                  </section>
                                  <section className="space-y-4 p-8 rounded-[2.5rem] bg-emerald-400/5 border border-emerald-400/10">
                                     <div className="flex items-center gap-3 mb-2">
                                        <Zap className="w-5 h-5 text-emerald-500" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/60">Coaching Note</p>
                                     </div>
                                     <p className="text-[11px] font-medium text-emerald-200/80 leading-relaxed italic">
                                        "Сегодня сфокусируйся на глубине. Лучше сделать меньше повторений, но с идеальной амплитудой. Контроль — это сила."
                                     </p>
                                  </section>
                               </div>
                            </div>
                         </motion.div>
                       ) : (
                         <motion.div 
                           key="chat"
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: 20 }}
                           className="flex flex-col h-[500px]"
                         >
                            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pb-8">
                               <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 text-[11px] text-white/40 italic leading-relaxed">
                                  Это инкапсулированный поток обсуждения для <b>{event.exercises[expandedExercise].name}</b>. Я помню контекст всей тренировки и твое состояние.
                               </div>

                               {(chatThreads[expandedExercise] || []).map((msg, mi) => (
                                 <div key={mi} className={cn(
                                   "flex flex-col",
                                   msg.role === 'user' ? "items-end" : "items-start"
                                 )}>
                                    <div className={cn(
                                       "p-6 rounded-[2rem] text-sm font-medium max-w-[85%] leading-relaxed shadow-xl",
                                       msg.role === 'user' ? "bg-white text-black rounded-tr-none" : "bg-primary text-black rounded-tl-none"
                                    )}>
                                       {msg.content}
                                       {msg.action === 'REPLACEMENT_APPLIED' && (
                                         <div className="mt-4 pt-4 border-t border-black/10 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase">Modification Applied</span>
                                         </div>
                                       )}
                                    </div>
                                    <span className="text-[9px] font-black text-white/20 uppercase mt-2 px-2">
                                       {msg.role === 'user' ? 'You' : 'Genesis Coach'}
                                    </span>
                                 </div>
                               ))}

                               {chatStatuses[expandedExercise] === 'thinking' || chatStatuses[expandedExercise] === 'generating' && (
                                  <div className="flex gap-2 p-6 bg-white/5 rounded-[2rem] w-fit">
                                     <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                                     </div>
                                  </div>
                               )}
                            </div>

                            <div className="pt-6 border-t border-white/5 bg-black/20 px-4 -mx-4">
                               <form onSubmit={(e) => handleAskCoach(expandedExercise!, e)} className="relative mb-6">
                                  <input 
                                    value={chatInputs[expandedExercise!] || ''}
                                    onChange={e => setChatInputs(prev => ({ ...prev, [expandedExercise!]: e.target.value }))}
                                    placeholder="Need replacement / weight check / technique question?..."
                                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-5 text-sm focus:outline-none focus:border-primary focus:bg-white/10 transition-all text-white placeholder:text-white/20"
                                  />
                                  <button 
                                     type="submit"
                                     className="absolute right-3 top-3 bottom-3 px-6 rounded-xl bg-primary text-black font-black uppercase text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                                  >
                                     Engage
                                  </button>
                               </form>
                               
                               <div className="flex flex-wrap gap-3 pb-4">
                                  <button 
                                      onClick={() => setChatInputs(prev => ({ ...prev, [expandedExercise!]: 'Чем заменить на гантели?' }))}
                                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-white/40 hover:text-primary hover:border-primary transition-all uppercase"
                                  >Заменить на гантели</button>
                                  <button 
                                      onClick={() => setChatInputs(prev => ({ ...prev, [expandedExercise!]: 'Тяжело идет, что делать?' }))}
                                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-white/40 hover:text-primary hover:border-primary transition-all uppercase"
                                  >Тяжелый вес</button>
                                  <button 
                                      onClick={() => setChatInputs(prev => ({ ...prev, [expandedExercise!]: 'Напомни технику?' }))}
                                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-white/40 hover:text-primary hover:border-primary transition-all uppercase"
                                  >Освежить технику</button>
                               </div>
                            </div>
                         </motion.div>
                       )}
                     </AnimatePresence>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                     <Brain className="w-16 h-16 text-white" />
                     <div className="space-y-2">
                        <h4 className="text-xl font-bold text-white uppercase tracking-tight">Select Protocol Phase</h4>
                        <p className="text-sm font-medium text-white/60">Choose an exercise from the left rail to begin coaching.</p>
                     </div>
                  </div>
                )}
             </div>
          </div>

          {/* Footer Actions */}
          <div className="p-12 border-t border-white/5 bg-black/60 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-8">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-1">Status Control</span>
                   <div className="flex gap-2">
                      {(['PLANNED', 'COMPLETED', 'SKIPPED'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(s)}
                          className={cn(
                            "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                            event.status === s ? "bg-white text-black" : "bg-white/5 text-white/30 hover:text-white"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-6">
               <GradientButton 
                 onClick={() => { handleStatusChange('COMPLETED'); onClose(); }}
                 className="px-12 py-4 text-[11px] font-black uppercase tracking-[0.4em] rounded-[1.5rem] shadow-2xl shadow-primary/20"
               >
                  Finalize Session
               </GradientButton>
               
               <div className="h-10 w-px bg-white/5" />

               <div className="flex gap-4">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-5 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-primary/40 hover:bg-primary/20 transition-all group"
                  >
                     <Edit3 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </button>

                  <button 
                    onClick={handleRemove} 
                    className="p-5 rounded-[1.5rem] bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-500/40 hover:text-red-500 hover:border-red-500/40 hover:bg-red-500/20 transition-all group"
                  >
                     <Trash2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
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
