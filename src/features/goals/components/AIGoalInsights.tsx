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
      <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
        <Sparkles className="w-3 h-3 text-primary" />
        Contextual AI Actions
      </h4>
      
      <div className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <button
            key={q.id}
            onClick={() => handleAsk(q.text)}
            disabled={loading}
            className={cn(
              "px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all",
              selectedQuestion === q.text && "border-primary/50 bg-primary/20"
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <GlassCard className="p-6 bg-primary/5 border-primary/20 relative overflow-hidden">
               <div className="flex items-center gap-2 text-primary mb-3">
                  <Brain className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">AI Анализ</span>
               </div>
               <p className="text-sm italic leading-relaxed text-foreground/90">
                 "{result.summary}"
               </p>
               {result.explanation && (
                 <p className="mt-4 text-xs text-muted-foreground leading-relaxed pl-4 border-l border-primary/30">
                   {result.explanation}
                 </p>
               )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
