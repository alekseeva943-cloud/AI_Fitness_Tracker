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

type ChatStatus = 'idle' | 'thinking' | 'retrieving_context' | 'generating' | 'completed' | 'failed';

export const AIEventDetailsModal: React.FC<AIEventDetailsModalProps> = ({ event, onClose }) => {
  const setPlanEventStatus = useFitnessStore(state => state.setPlanEventStatus);
  const removePlanEvent = useFitnessStore(state => state.removePlanEvent);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [chatStatus, setChatStatus] = useState<ChatStatus>('idle');

  const handleStatusChange = (status: PlanEvent['status']) => {
    setPlanEventStatus(event.id, status);
  };

  const handleRemove = () => {
    removePlanEvent(event.id);
    onClose();
  };

  const handleAskCoach = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatStatus !== 'idle') return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    
    console.log('[AI CHAT START] Query:', userMsg);
    setChatStatus('thinking');

    // AI Simulation logic with state transitions
    try {
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI TIMEOUT')), 12000)
        );

        const responsePromise = (async () => {
            await new Promise(r => setTimeout(r, 800));
            setChatStatus('retrieving_context');
            console.log('[AI CONTEXT READY]');
            
            await new Promise(r => setTimeout(r, 1200));
            setChatStatus('generating');
            
            await new Promise(r => setTimeout(r, 1500));
            
            const lowerInput = userMsg.toLowerCase();
            const hasHistory = chatMessages.length > 0;
            const userIsCorrecting = lowerInput.includes('не писал') || lowerInput.includes('не было') || lowerInput.includes('ошибка');

            if (userIsCorrecting) {
                console.log('[AI CORRECTION DETECTED]');
                return `Да, ты прав. Я допустил ошибку в ссылке на историю. Давай опираться только на текущие данные тренировки и твои реальные отзывы.\n\nПо этому воркауту: ${event.title} — что именно тебя сейчас беспокоит?`;
            }

            let aiResponse = "Я проанализировал твой текущий прогресс. Для этой сессии я бы советовал придерживаться плана, но если чувствуешь забитость, давай снизим нагрузку на 10%.";
            
            if (lowerInput.includes('замен') || lowerInput.includes('чем')) {
                aiResponse = "Если чувствуешь дискомфорт в суставах, я бы заменил жим штанги на жим гантелей нейтральным хватом. Это безопаснее для связок. Либо можем перейти в Смит для лучшей стабилизации.";
            } else if (lowerInput.includes('болят') || lowerInput.includes('болит')) {
                aiResponse = "Понял тебя. При боли в суставах мы немедленно меняем протокол. Я рекомендую сегодня полностью исключить осевую нагрузку и перейти на сведение в кроссовере с низким весом, чтобы поддержать пампинг без риска для локтя.";
            } else if (lowerInput.includes('вес') || lowerInput.includes('тяжело')) {
                aiResponse = "Если сегодня тяжело, это нормально. Твой recovery score может быть ниже обычного. Я бы советовал снизить рабочий вес на 10-15% и сфокусироваться на темпе 3-1-1 для максимального контроля.";
            }

            // Real grounding if it was in history
            const previouslySaidJoints = chatMessages.some(m => m.content.toLowerCase().includes('сустав') || m.content.toLowerCase().includes('болит'));
            if (previouslySaidJoints && !userIsCorrecting) {
                aiResponse = "Я помню, ты упоминал дискомфорт в суставах в нашей беседе. Поэтому сегодня я особенно настаиваю на плавном темпе и исключении рывков.";
            }

            console.log('[AI RESPONSE RECEIVED]');
            return aiResponse;
        })();

        const aiResponse = await Promise.race([responsePromise, timeoutPromise]) as string;
        setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
        setChatStatus('completed');
        console.log('[AI MESSAGE APPENDED]');
    } catch (error) {
        console.error('[AI RESPONSE FAILED]', error);
        setChatStatus('failed');
        setChatMessages(prev => [...prev, { 
            role: 'ai', 
            content: "Извини, не удалось связаться с Genesis Cloud. Попробуй уточнить вопрос или проверь соединение." 
        }]);
    } finally {
        setTimeout(() => setChatStatus('idle'), 2000);
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
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl h-[85vh] flex flex-col bg-transparent"
      >
        <GlassCard className="border-white/10 overflow-hidden flex flex-col h-full shadow-[0_0_80px_rgba(0,0,0,0.8)]">
          {/* Header */}
          <div className="p-8 pb-6 flex items-start justify-between bg-white/[0.02] shrink-0">
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
                            <Zap className="w-3 h-3 shadow-[0_0_8px_rgba(223,255,0,0.5)]" />
                            {event.source === 'AI' ? 'AI Optimized' : 'Precision Manual'}
                         </div>
                      </div>
                   </div>
                </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all text-muted-foreground"><X className="w-6 h-6" /></button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide px-8 py-6 space-y-10 min-h-0">
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

            {/* Recovery Depth Module */}
            {event.type === 'RECOVERY' && (
                <section className="space-y-6">
                    <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest mb-1">Coach Strategy</p>
                                <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
                                    После вчерашней нагрузки твой ЦНС требует калибровки. Сегодняшний протокол восстановления поможет избежать плато.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-[9px] font-black uppercase text-muted-foreground/40 mb-3">Что делать</p>
                                <ul className="space-y-2 text-[10px] text-white/70 font-medium">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Ходьба 20-30 мин</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Mobility flow</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Контрастный душ</li>
                                </ul>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-[9px] font-black uppercase text-muted-foreground/40 mb-3">Избегать</p>
                                <ul className="space-y-2 text-[10px] text-white/70 font-medium">
                                    <li className="flex items-center gap-2"><X className="w-3 h-3 text-red-400" /> Осевая нагрузка</li>
                                    <li className="flex items-center gap-2"><X className="w-3 h-3 text-red-400" /> HIIT / Спринты</li>
                                    <li className="flex items-center gap-2"><X className="w-3 h-3 text-red-400" /> Отказные подходы</li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <p className="text-[10px] font-black uppercase text-primary/60 mb-2">Ожидаемый эффект</p>
                            <p className="text-[10px] text-primary/80 italic font-medium leading-relaxed">
                                "Это поможет тебе лучше восстановиться к следующей силовой тренировке и снизит риск воспаления связок на 14%."
                            </p>
                        </div>
                    </div>
                </section>
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
                               <div className="flex items-center gap-3 mt-1 underline decoration-primary/20 decoration-2 underline-offset-4">
                                  <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-tight">
                                    {ex.sets} SETS × {ex.reps} • {ex.weight || 'BODYWEIGHT'}
                                  </span>
                                  <span className="text-[9px] font-black text-primary/40 uppercase">TEMPO: 3-1-1</span>
                               </div>
                            </div>
                         </div>
                         <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform group-hover:text-primary", expandedExercise === idx && "rotate-180")} />
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
                                <div className="space-y-6 text-left">
                                   <div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-3">Technique & Cues</p>
                                      <ul className="space-y-3">
                                         {(ex.technique?.steps || [
                                           'Контролируй темп опускания (3 сек).',
                                           'Максимальное сокращение в пиковой точке.',
                                           'Держи корпус стабильным.'
                                         ]).map((step, sidx) => (
                                           <li key={sidx} className="flex gap-3 text-[11px] text-white/60 leading-relaxed font-medium">
                                             <span className="text-primary/40 font-bold shrink-0">{sidx + 1}.</span> {step}
                                           </li>
                                         ))}
                                      </ul>
                                   </div>
                                   
                                   <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                      <p className="text-[8px] font-black uppercase text-blue-400/60 mb-2">Дыхание / Breathwork</p>
                                      <p className="text-[10px] text-blue-200/80 font-medium">Вдох на опускании (эксцентрика), мощный выдох на усилии (концентрика).</p>
                                   </div>
                                </div>

                                <div className="space-y-6 text-left">
                                   <div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-orange-400/60 mb-3">Coach Insight & Mistakes</p>
                                      <div className="p-4 rounded-xl bg-orange-400/5 border border-orange-400/10 mb-4">
                                         <p className="text-[11px] text-orange-200/80 italic leading-relaxed font-medium">
                                           "{ex.technique?.coachTip || 'Сосредоточься на связи мозг-мышцы. Не используй инерцию для срыва веса.'}"
                                         </p>
                                      </div>
                                      <div className="space-y-2">
                                         <p className="text-[8px] font-black uppercase text-red-400/60">Частые ошибки</p>
                                         <ul className="text-[10px] space-y-1.5 text-muted-foreground font-medium">
                                            <li className="flex items-center gap-2"><AlertTriangle className="w-3 h-3 text-red-500/50" /> Неполная амплитуда движения</li>
                                            <li className="flex items-center gap-2"><AlertTriangle className="w-3 h-3 text-red-500/50" /> Отрыв лопаток или корпуса</li>
                                         </ul>
                                      </div>
                                   </div>

                                   <div className="space-y-3">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Strategic Why</p>
                                      <p className="text-[10px] text-muted-foreground/80 leading-relaxed italic">
                                         "Это базовое движение выбрано для создания максимального механического напряжения в начале сессии, пока твои гликогеновые депо полны."
                                      </p>
                                   </div>

                                   <div className="space-y-3">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Genesis Replacements</p>
                                      <div className="flex flex-wrap gap-2">
                                         {['Smith Machine', 'Dumbbells', 'Machine Press'].map(tag => (
                                           <span key={tag} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-muted-foreground hover:text-primary hover:border-primary/20 transition-all cursor-default">{tag}</span>
                                         ))}
                                      </div>
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
                  <div className="flex gap-1.5 items-center">
                     <AnimatePresence mode="wait">
                       {chatStatus !== 'idle' && (
                         <motion.span 
                           initial={{ opacity: 0, x: 5 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -5 }}
                           className="text-[8px] font-black uppercase text-primary/60 tracking-widest"
                         >
                            {chatStatus === 'thinking' && "Коуч анализирует..."}
                            {chatStatus === 'retrieving_context' && "Синхронизация истории..."}
                            {chatStatus === 'generating' && "Формирую ответ..."}
                         </motion.span>
                       )}
                     </AnimatePresence>
                     <div className={cn("w-1.5 h-1.5 rounded-full", chatStatus !== 'idle' ? "bg-primary animate-pulse" : "bg-white/10")} />
                  </div>
               </div>

               <div className="space-y-4 mb-6">
                  {chatMessages.length === 0 && (
                    <div className="py-10 text-center space-y-4">
                       <p className="text-[11px] text-muted-foreground italic leading-relaxed">Нужна замена или хочешь обсудить нагрузку? <br/> Моя память по твоим тренировкам активна.</p>
                       <div className="flex flex-wrap justify-center gap-2 px-10">
                          {['Чем заменить жим?', 'Почему такой вес?', 'Болит плечо', 'Как ощущения?'].map(hint => (
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
                        "flex gap-4 p-5 rounded-2xl border animate-in slide-in-from-bottom-2 duration-500",
                        msg.role === 'user' ? "bg-white/5 border-white/10 ml-12 text-right flex-row-reverse" : "bg-primary/5 border-primary/10 mr-12 text-left"
                    )}>
                       <div className={cn(
                           "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
                           msg.role === 'user' ? "bg-white/10 border-white/20" : "bg-primary/10 border-primary/20 text-primary"
                       )}>
                          {msg.role === 'user' ? <Activity className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                       </div>
                       <p className="text-[11px] leading-relaxed text-white/80 font-medium whitespace-pre-line">{msg.content}</p>
                    </div>
                  ))}

                  {chatStatus !== 'idle' && chatStatus !== 'completed' && chatStatus !== 'failed' && (
                    <div className="flex gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/10 mr-12 mr-12">
                       <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                          <Brain className="w-4 h-4 animate-pulse text-primary shadow-[0_0_10px_rgba(223,255,0,0.4)]" />
                       </div>
                       <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                       </div>
                    </div>
                  )}
               </div>

               <form onSubmit={handleAskCoach} className="relative group">
                  <input 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    disabled={chatStatus !== 'idle'}
                    placeholder={chatStatus !== 'idle' ? "Genesis обдумывает ответ..." : "Напиши коучу..."}
                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-5 text-xs focus:outline-none focus:border-primary/40 transition-all group-hover:border-white/20 pr-16 disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={chatStatus !== 'idle' || !chatInput.trim()}
                    className="absolute right-2.5 top-2.5 bottom-2.5 px-5 rounded-xl bg-primary text-black hover:bg-primary/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed group-active:scale-95"
                  >
                     <ChevronRight className="w-5 h-5 font-black" />
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
                  className="w-14 h-14 p-0 flex items-center justify-center border-white/10 hover:border-primary/40 group/edit"
                  title="Изменить тренировку"
                >
                   <Edit3 className="w-5 h-5 group-hover/edit:text-primary transition-colors" />
                </GradientButton>

                <button 
                  onClick={handleRemove} 
                  className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-black transition-all"
                  title="Удалить"
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
