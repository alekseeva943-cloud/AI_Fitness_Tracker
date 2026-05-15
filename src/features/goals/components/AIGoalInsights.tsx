import React, { useState } from 'react';
import { AIActions } from '../../../ai/orchestrator/ai-actions';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Sparkles, Brain, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../../lib/utils';

interface AIGoalInsightsProps {
  goalId: string;
}

export const AIGoalInsights: React.FC<AIGoalInsightsProps> = ({ goalId }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  const questions = [
    { id: 'slow', text: 'Почему прогресс замедлился?', icon: <Zap className="w-3 h-3" /> },
    { id: 'improve', text: 'Как улучшить результаты?', icon: <Sparkles className="w-3 h-3" /> },
    { id: 'forecast', text: 'Почему прогноз ухудшился?', icon: <Brain className="w-3 h-3" /> },
  ];

  const handleAsk = async (question: string) => {
    setLoading(true);
    setSelectedQuestion(question);
    try {
      const response = await AIActions.getContextualGoalInsight(goalId, question);
      setResult(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-[9px] uppercase font-black tracking-[0.2em] text-muted-foreground/40 flex items-center gap-1.5">
        <Sparkles className="w-2.5 h-2.5 text-primary/60" />
        Быстрые вопросы
      </h4>
      
      <div className="flex flex-wrap gap-1.5">
        {questions.map((q) => (
          <button
            key={q.id}
            onClick={() => handleAsk(q.text)}
            disabled={loading}
            className={cn(
              "px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50",
              selectedQuestion === q.text && "border-primary/30 bg-primary/10 text-primary"
            )}
          >
            {q.icon}
            {q.text}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="p-6 bg-white/5 border border-dashed border-white/10 rounded-3xl flex items-center justify-center gap-3"
          >
             <Sparkles className="w-4 h-4 text-primary animate-spin" />
             <span className="text-xs italic opacity-50">Анализирую взаимосвязь данных...</span>
          </motion.div>
        ) : result && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl relative overflow-hidden">
               <div className="flex items-center gap-2 text-primary/60 mb-2">
                  <Brain className="w-3 h-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Анализ коуча</span>
               </div>
               <p className="text-xs leading-relaxed text-foreground/90 font-medium italic">
                 "{result.summary}"
               </p>
               {result.explanation && (
                 <p className="mt-3 text-[10px] text-muted-foreground leading-relaxed pl-3 border-l border-primary/20">
                   {result.explanation}
                 </p>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
