import React, { useState, useRef, useEffect } from 'react';
import { AIActions } from '../../../ai/orchestrator/ai-actions';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Sparkles, Brain, Zap, Send, ArrowRight, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../../lib/utils';

interface AIGoalInsightsProps {
  goalId: string;
}

export const AIGoalInsights: React.FC<AIGoalInsightsProps> = ({ goalId }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const questions = [
    { id: 'slow', text: 'Почему прогресс встал?', icon: <Zap className="w-3 h-3" /> },
    { id: 'improve', text: 'Как быстрее достичь цели?', icon: <Sparkles className="w-3 h-3" /> },
    { id: 'nutrition', text: 'Что изменить в питании?', icon: <Brain className="w-3 h-3" /> },
  ];

  const handleAsk = async (question: string) => {
    if (!question.trim() || loading) return;
    setLoading(true);
    setSelectedQuestion(question);
    try {
      const response = await AIActions.getContextualGoalInsight(goalId, question);
      setResult(response);
      setInput('');
      // Scroll to result
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
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
    <div className="space-y-6 pt-4 border-t border-white/5">
      <div className="space-y-4">
        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
          <MessageSquare className="w-3 h-3" />
          Консультация коуча
        </h4>
        
        <div className="flex flex-wrap gap-2">
          {questions.map((q) => (
            <button
              key={q.id}
              onClick={() => handleAsk(q.text)}
              disabled={loading}
              className={cn(
                "px-4 py-2 rounded-xl border border-white/5 bg-white/5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50",
                selectedQuestion === q.text && "border-primary/30 bg-primary/10 text-primary"
              )}
            >
              {q.icon}
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
              input.trim() ? "bg-primary text-black shadow-lg shadow-primary/10" : "bg-white/5 text-muted-foreground opacity-30"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div ref={scrollRef} />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="p-6 bg-white/5 border border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-3"
          >
             <Sparkles className="w-4 h-4 text-primary animate-spin" />
             <span className="text-[10px] uppercase font-black tracking-widest opacity-40">Коуч анализирует контекст...</span>
          </motion.div>
        ) : result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-6 bg-primary/5 border border-primary/20 rounded-[2rem] relative overflow-hidden group">
               <div className="absolute right-4 top-4 opacity-5 group-hover:scale-110 transition-transform">
                  <Brain className="w-12 h-12" />
               </div>
               
               <div className="flex items-center gap-2 text-primary/60 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Персональная рекомендация</span>
               </div>
               
               <p className="text-sm leading-relaxed text-foreground/90 font-medium italic">
                 "{result.summary}"
               </p>
               
               {result.explanation && (
                 <div className="mt-4 pt-4 border-t border-white/5 text-[11px] text-muted-foreground leading-relaxed flex gap-3">
                   <ArrowRight className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                   <p>{result.explanation}</p>
                 </div>
               )}

               {result.nextSteps && result.nextSteps.length > 0 && (
                 <div className="mt-4 space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Твои действия:</p>
                    <div className="flex flex-col gap-1.5">
                       {result.nextSteps.map((step: string, i: number) => (
                         <div key={i} className="text-[10px] font-bold flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                            <div className="w-1 h-1 rounded-full bg-primary" />
                            {step}
                         </div>
                       ))}
                    </div>
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
