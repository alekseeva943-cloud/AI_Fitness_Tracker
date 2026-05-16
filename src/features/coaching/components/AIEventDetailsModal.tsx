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
          <div className="p-10 pb-6 flex items-start justify-between bg-white/[0.01] shrink-0 border-b border-white/5">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                   {event.type === 'WORKOUT' ? <Dumbbell className="w-8 h-8" /> : 
                    event.type === 'NUTRITION' ? <Utensils className="w-8 h-8" /> : <Calendar className="w-8 h-8" />}
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Оптимизировано ИИ</span>
                     <div className="w-1 h-1 rounded-full bg-white/10" />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                        {event.type === 'WORKOUT' ? 'Силовая тренировка' : event.type === 'NUTRITION' ? 'Питание' : 'Восстановление'}
                     </span>
                   </div>
                   <h2 className="text-3xl font-display font-bold tracking-tight text-white leading-none">{event.title}</h2>
                   <div className="flex items-center gap-6 mt-3 text-white/40">
                      <div className="flex items-center gap-2">
                         <Clock className="w-4 h-4" />
                         <span className="text-[11px] font-bold uppercase tracking-widest leading-none">
                             {format(new Date(event.date), 'EEEE, HH:mm', { locale: ru })}
                         </span>
                      </div>
                      <div className="text-[11px] font-bold uppercase tracking-widest leading-none">
                         {event.duration} МИНУТ
                      </div>
                   </div>
                </div>
             </div>
             <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-xl transition-all text-white/20 hover:text-white"><X className="w-6 h-6" /></button>
          </div>

          <div className="flex-1 overflow-hidden flex min-h-0 bg-black/40">
             {/* Left Rail: Exercises */}
             <div className="w-[340px] border-r border-white/5 overflow-y-auto scrollbar-hide py-8 px-6 space-y-3 shrink-0">
                <div className="flex items-center justify-between mb-4 px-2">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Протокол занятия</h3>
                   <span className="text-[9px] font-black text-primary uppercase">{event.exercises?.length || 0} пунктов</span>
                </div>
                
                {event.exercises?.map((ex, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { setExpandedExercise(idx); setActiveTab('TECHNIQUE'); }}
                    className={cn(
                      "w-full text-left p-5 rounded-2xl border transition-all duration-200 group relative",
                      expandedExercise === idx ? "bg-white/[0.05] border-primary/40 shadow-lg" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                    )}
                  >
                    <h4 className={cn(
                      "text-xs font-bold uppercase tracking-tight mb-2 transition-colors",
                      expandedExercise === idx ? "text-primary" : "text-white/80 group-hover:text-white"
                    )}>{ex.name}</h4>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/20">
                       <span>{ex.sets} × {ex.reps}</span>
                       <span className={cn(expandedExercise === idx ? "text-primary/60" : "")}>{ex.weight || 'СВ'}</span>
                    </div>
                  </button>
                ))}
             </div>

             {/* Right Content */}
             <div className="flex-1 overflow-y-auto p-12 bg-white/[0.01]">
                {expandedExercise !== null && event.exercises?.[expandedExercise] ? (
                  <div className="max-w-2xl mx-auto space-y-10">
                     <div className="flex items-center justify-between border-b border-white/5 pb-8">
                        <div className="space-y-1">
                           <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{event.exercises[expandedExercise].name}</h3>
                           <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/20">Целевая интенсивность: Высокая</p>
                        </div>
                        <div className="flex gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
                           <button 
                              onClick={() => setActiveTab('TECHNIQUE')}
                              className={cn(
                                "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === 'TECHNIQUE' ? "bg-white text-black" : "text-white/20 hover:text-white"
                              )}
                           >Техника</button>
                           <button 
                              onClick={() => setActiveTab('COACH')}
                              className={cn(
                                "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                activeTab === 'COACH' ? "bg-primary text-black" : "text-white/20 hover:text-white"
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
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           className="space-y-10"
                         >
                            <section className="space-y-6">
                               <div className="flex items-center gap-4">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">01. Подготовка</span>
                                  <div className="h-px flex-1 bg-white/5" />
                               </div>
                               <p className="text-sm font-medium text-white/60 leading-relaxed">
                                  {event.exercises[expandedExercise].name === 'Приседания со штангой' 
                                    ? 'Установи штангу на уровне ключиц. Сведи лопатки и создай жесткую платформу из мышц спины. Ноги на ширине плеч, носки слегка развернуты.' 
                                    : event.exercises[expandedExercise].name.includes('Жим')
                                    ? 'Ляг на скамью, обеспечь 3 точки опоры: лопатки, таз и стопы. Сохраняй естественный прогиб в пояснице, не отрывая таз.'
                                    : 'Прими устойчивое исходное положение. Проверь хват и симметрию расположения веса. Сфокусируй взгляд.'}
                               </p>
                            </section>

                            <section className="space-y-6">
                               <div className="flex items-center gap-4">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">02. Выполнение</span>
                                  <div className="h-px flex-1 bg-white/5" />
                               </div>
                               <ul className="space-y-4">
                                  {(event.exercises[expandedExercise].technique?.steps || [
                                    'Контролируемое опускание в течение 3 секунд.',
                                    'Пиковая концентрация и растяжение в нижней точке.',
                                    'Мощное выжимание на выдохе, сохраняя темп.',
                                    'Не делай полной блокировки суставов в верхней точке.'
                                  ]).map((step, i) => (
                                    <li key={i} className="flex gap-4 group">
                                       <span className="text-[10px] font-black text-white/10 mt-1">{i + 1}</span>
                                       <p className="text-sm text-white/80 font-medium leading-relaxed">{step}</p>
                                    </li>
                                  ))}
                               </ul>
                            </section>

                            <div className="grid grid-cols-2 gap-6">
                               <div className="p-6 rounded-2xl bg-red-400/5 border border-red-400/10 space-y-3">
                                  <div className="flex items-center gap-2">
                                     <AlertTriangle className="w-4 h-4 text-red-500" />
                                     <span className="text-[10px] font-black uppercase tracking-widest text-red-400/60">Ошибки</span>
                                  </div>
                                  <ul className="text-[11px] font-medium text-red-200/40 space-y-1.5">
                                     <li>• Слишком большой темп</li>
                                     <li>• Отрыв пяток от пола</li>
                                     <li>• Задержка дыхания</li>
                                  </ul>
                               </div>
                               <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                                  <div className="flex items-center gap-2">
                                     <Zap className="w-4 h-4 text-primary" />
                                     <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Совет</span>
                                  </div>
                                  <p className="text-[11px] font-medium text-primary/80 italic leading-relaxed">
                                     "Фокусируйся на связи мозг-мышцы. Представь, как целевая мышца сокращается под нагрузкой."
                                  </p>
                               </div>
                            </div>
                         </motion.div>
                       ) : (
                         <motion.div 
                           key="coach"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           className="flex flex-col h-[500px]"
                         >
                            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pb-6 pr-4">
                               <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-white/40 italic leading-relaxed">
                                  Я анализирую твою тренировку в контексте <b>{event.exercises[expandedExercise].name}</b>. Спрашивай про замену, вес или ощущения.
                               </div>

                               {(chatThreads[expandedExercise] || []).map((msg, mi) => (
                                 <div key={mi} className={cn(
                                   "flex flex-col",
                                   msg.role === 'user' ? "items-end" : "items-start"
                                 )}>
                                    <div className={cn(
                                       "p-5 rounded-2xl text-sm font-medium max-w-[90%] leading-relaxed shadow-lg",
                                       msg.role === 'user' ? "bg-white text-black" : "bg-primary text-black"
                                    )}>
                                       {msg.content}
                                       {msg.action === 'REPLACEMENT_APPLIED' && (
                                         <div className="mt-3 pt-3 border-t border-black/10 flex items-center gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span className="text-[9px] font-black uppercase">Изменения применены</span>
                                         </div>
                                       )}
                                    </div>
                                    <span className="text-[9px] font-black text-white/10 uppercase mt-2 px-1">
                                       {msg.role === 'user' ? 'Вы' : 'Интеллект Genesis'}
                                    </span>
                                 </div>
                               ))}

                               {chatStatuses[expandedExercise] === 'thinking' || chatStatuses[expandedExercise] === 'generating' && (
                                  <div className="flex gap-1.5 p-5 bg-white/5 rounded-2xl w-fit">
                                     <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                                     <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                                     <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                                  </div>
                               )}
                            </div>

                            <div className="pt-6 border-t border-white/5">
                               <form onSubmit={(e) => handleAskCoach(expandedExercise!, e)} className="relative mb-4">
                                  <input 
                                    value={chatInputs[expandedExercise!] || ''}
                                    onChange={e => setChatInputs(prev => ({ ...prev, [expandedExercise!]: e.target.value }))}
                                    placeholder="Задать вопрос коучу..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-primary transition-all text-white placeholder:text-white/20"
                                  />
                                  <button 
                                     type="submit"
                                     className="absolute right-2 top-2 bottom-2 px-6 rounded-lg bg-primary text-black font-black uppercase text-[10px] hover:opacity-90 active:scale-95 transition-all"
                                  >
                                     Engage
                                  </button>
                                </form>
                               
                               <div className="flex flex-wrap gap-2">
                                  <button 
                                      onClick={() => setChatInputs(prev => ({ ...prev, [expandedExercise!]: 'Чем заменить?' }))}
                                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-white/20 hover:text-primary transition-all uppercase"
                                  >Как заменить?</button>
                                  <button 
                                      onClick={() => setChatInputs(prev => ({ ...prev, [expandedExercise!]: 'Слишком тяжело.' }))}
                                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-white/20 hover:text-primary transition-all uppercase"
                                  >Снизить вес</button>
                                  <button 
                                      onClick={() => setChatInputs(prev => ({ ...prev, [expandedExercise!]: 'Болят суставы.' }))}
                                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-white/20 hover:text-red-400 transition-all uppercase"
                                  >Болят суставы</button>
                               </div>
                            </div>
                         </motion.div>
                       )}
                     </AnimatePresence>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                     <Brain className="w-12 h-12 text-white mb-4" />
                     <p className="text-sm font-bold text-white uppercase tracking-tight">Выберите этап протокола</p>
                  </div>
                )}
             </div>
          </div>

          {/* Footer Actions */}
          <div className="p-10 border-t border-white/5 bg-black/60 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-10">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Текущий статус</span>
                   <div className="flex gap-1.5">
                      {(['PLANNED', 'COMPLETED', 'SKIPPED'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(s)}
                          className={cn(
                            "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                            event.status === s ? "bg-white text-black" : "bg-white/5 text-white/30 hover:text-white"
                          )}
                        >
                          {s === 'PLANNED' ? 'Запланировано' : s === 'COMPLETED' ? 'Выполнено' : 'Пропущено'}
                        </button>
                      ))}
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-6">
               <GradientButton 
                 onClick={() => { handleStatusChange('COMPLETED'); onClose(); }}
                 className="px-10 py-4 text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl shadow-xl shadow-primary/10"
               >
                  Завершить тренировку
               </GradientButton>
               
               <div className="h-10 w-px bg-white/5" />

               <div className="flex gap-3">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 text-white/20 hover:text-white hover:bg-white/10 transition-all"
                  >
                     <Edit3 className="w-5 h-5" />
                  </button>

                  <button 
                    onClick={handleRemove} 
                    className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                  >
                     <Trash2 className="w-5 h-5" />
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
