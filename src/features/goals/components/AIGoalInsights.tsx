import React, { useState, useRef, useEffect } from 'react';
import { AIActions } from '../../../ai/orchestrator/ai-actions';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Sparkles, Brain, Zap, Send, ArrowRight, MessageSquare, Clock, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../../../lib/utils';
import { useFitnessStore } from '../../../store/useFitnessStore';

interface AIGoalInsightsProps {
  goalId: string;
}

export const AIGoalInsights: React.FC<AIGoalInsightsProps> = ({ goalId }) => {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const goalChatMessages = useFitnessStore(state => state.goalChatMessages[goalId] || []);
  const addChatMessage = useFitnessStore(state => state.addChatMessage);

  const questions = [
    { id: 'slow', text: 'Почему прогресс встал?', icon: <Zap className="w-3 h-3" /> },
    { id: 'improve', text: 'Как быстрее достичь цели?', icon: <Sparkles className="w-3 h-3" /> },
    { id: 'nutrition', text: 'Что изменить в питании?', icon: <Brain className="w-3 h-3" /> },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [goalChatMessages, loading]);

  const handleAsk = async (question: string) => {
    if (!question.trim() || loading) return;
    setLoading(true);
    setInput('');
    try {
      await AIActions.getContextualGoalInsight(goalId, question);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(input);
  };

  return (
    <div className="space-y-6 pt-6 border-t border-white/5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
            <MessageSquare className="w-3 h-3" />
            Continuous Coaching Thread
          </h4>
          {goalChatMessages.length > 0 && (
            <button 
              onClick={() => useFitnessStore.getState().clearChatHistory(goalId)}
              className="text-[9px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-colors"
            >
              Очистить историю
            </button>
          )}
        </div>

        {/* Chat Thread */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto px-2 py-4 scrollbar-hide">
          <AnimatePresence initial={false}>
            {goalChatMessages.length === 0 && !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 opacity-20"
              >
                <div className="relative inline-block mb-4">
                  <Brain className="w-12 h-12 mx-auto" />
                  <Sparkles className="w-6 h-6 absolute -top-2 -right-2 animate-pulse" />
                </div>
                <p className="text-[10px] uppercase font-black tracking-widest leading-loose">
                  Я помню твои тренировки и прошлые советы.<br/>Спроси меня о прогрессе.
                </p>
              </motion.div>
            )}

            {goalChatMessages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex flex-col gap-1.5",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}
              >
                <div className={cn(
                  "max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm",
                  msg.role === 'user' 
                    ? "bg-primary text-black rounded-tr-none" 
                    : "bg-white/5 border border-white/5 rounded-tl-none"
                )}>
                  {msg.content}
                  
                  {msg.metadata?.nextSteps && (
                    <div className="mt-4 space-y-2 border-t border-white/5 pt-3">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Рекомендуемые действия:</p>
                      {msg.metadata.nextSteps.map((step: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-primary" />
                          {step}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 px-2 opacity-30 text-[8px] font-black uppercase tracking-widest">
                  {msg.role === 'user' ? 'Вы' : 'Коуч'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-start gap-1.5"
              >
                <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-2xl rounded-tl-none flex items-center gap-3">
                   <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1 h-1 rounded-full bg-primary animate-bounce" />
                   </div>
                   <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Анализирую...</span>
                </div>
              </motion.div>
            )}
            <div ref={scrollRef} />
          </AnimatePresence>
        </div>
        
        <div className="space-y-4 px-2">
          {/* Quick Questions */}
          <div className="flex flex-wrap gap-2">
            {questions.map((q) => (
              <button
                key={q.id}
                onClick={() => handleAsk(q.text)}
                disabled={loading}
                className={cn(
                  "px-4 py-2 rounded-xl border border-white/5 bg-white/5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 hover:border-primary/20 transition-all active:scale-95 disabled:opacity-50 group",
                )}
              >
                <span className="text-muted-foreground group-hover:text-primary transition-colors">{q.icon}</span>
                {q.text}
              </button>
            ))}
          </div>

          {/* Mini Input */}
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Спросить коуча о цели..."
              className="w-full bg-black/20 border border-white/5 rounded-2xl py-3 pl-5 pr-12 text-xs font-medium focus:outline-none focus:border-primary/30 transition-all placeholder:text-white/10 shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={cn(
                "absolute right-1.5 top-1.5 w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                input.trim() ? "bg-primary text-black shadow-lg shadow-primary/10 hover:scale-[1.05]" : "bg-white/5 text-muted-foreground opacity-30"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
