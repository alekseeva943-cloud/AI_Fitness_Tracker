import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AIActions } from '../../../ai/orchestrator/ai-actions';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Sparkles, Brain, Zap, Send, ArrowRight, MessageSquare, Clock, User, CheckCircle2, Calendar, Target, Plus, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../../lib/utils';
import { useFitnessStore } from '../../../store/useFitnessStore';
import { PlanEvent } from '../../../types';

interface AIGoalInsightsProps {
  goalId: string;
}

const EMPTY_MESSAGES: any[] = [];

export const AIGoalInsights: React.FC<AIGoalInsightsProps> = ({ goalId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const goalChatMessages = useFitnessStore(state => state.goalChatMessages[goalId] ?? EMPTY_MESSAGES);
  const addChatMessage = useFitnessStore(state => state.addChatMessage);
  const analyses = useFitnessStore(state => state.analyses);
  const addPlanEvent = useFitnessStore(state => state.addPlanEvent);
  
  const latestAnalysis = analyses.find(a => a.goalId === goalId) || (analyses.length > 0 ? analyses[0] : null);

  const questions = [
    { id: 'slow', text: 'Почему прогресс встал?', icon: <Zap className="w-3 h-3" /> },
    { id: 'improve', text: 'Как быстрее достичь цели?', icon: <Sparkles className="w-3 h-3" /> },
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

  const handleAddEvent = (event: Partial<PlanEvent>) => {
    addPlanEvent({
      id: Math.random().toString(36).substring(2, 11),
      title: event.title || 'AI Task',
      type: event.type || 'WORKOUT',
      source: 'AI',
      status: 'PLANNED',
      date: event.date || new Date().toISOString(),
      duration: event.duration,
      description: event.description,
      isCompleted: false,
      isAI: true,
      createdAt: new Date().toISOString()
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(input);
  };

  return (
    <div className="space-y-8 pt-8 border-t border-white/5 pb-4">
      {/* 1. COACH INSIGHT & TACTICAL PLAN */}
      {latestAnalysis && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main Insight */}
          <GlassCard className="p-6 border-primary/20 bg-primary/5 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
               <Brain className="w-20 h-20" />
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-primary/80">Coach Insight</h4>
            </div>

            <p className="text-sm font-bold leading-relaxed mb-4 text-primary-foreground/90 italic">
              "{latestAnalysis.summary}"
            </p>

            {latestAnalysis.mainRisk && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 w-fit">
                <Zap className="w-3 h-3 text-red-500" />
                <span className="text-[9px] font-black uppercase text-red-400">Risk: {latestAnalysis.mainRisk}</span>
              </div>
            )}
          </GlassCard>

          {/* Tactical Plan */}
          {(latestAnalysis.tacticalPlan || latestAnalysis.nextSteps) && (
            <div className="space-y-3">
              <h5 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40 px-2">Tactical Execution Plan</h5>
              <div className="grid gap-2">
                {(latestAnalysis.tacticalPlan || []).map((step, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 4 }}
                    className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3 transition-colors hover:bg-white/10"
                  >
                    <div className="mt-0.5 p-1 rounded-full bg-primary/20 text-primary">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight">{step.title}</p>
                      <p className="text-[10px] text-muted-foreground/60 leading-relaxed">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
                {!latestAnalysis.tacticalPlan && latestAnalysis.nextSteps?.map((step, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                    <span className="text-xs font-bold">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Events (Calendar Actions) */}
          {latestAnalysis.suggestedEvents && latestAnalysis.suggestedEvents.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40 px-2">Recommended System Actions</h5>
              <div className="grid gap-2">
                {latestAnalysis.suggestedEvents.map((event, i) => (
                  <GlassCard key={i} className="p-4 border-dashed border-white/10 flex items-center justify-between group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-xl border",
                        event.type === 'WORKOUT' ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
                        event.type === 'NUTRITION' ? "bg-green-500/10 border-green-500/20 text-green-400" :
                        "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      )}>
                        {event.type === 'WORKOUT' ? <Target className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-tight">{event.title}</p>
                        <p className="text-[9px] text-muted-foreground/50">{event.type} • {event.duration} min</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddEvent(event)}
                      className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-black transition-all active:scale-90"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Open Session Action */}
          <button 
            onClick={() => navigate('/coaching')}
            className="w-full py-4 px-6 rounded-[2rem] border border-primary/30 bg-primary/5 flex items-center justify-between group hover:bg-primary/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Brain className="w-5 h-5 text-primary" />
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-ping" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Open Deep Coaching Session</p>
                <p className="text-[9px] text-muted-foreground/60 uppercase font-black tracking-[0.1em]">Full history • Personalized plan • Memory layer</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      )}

      {/* 2. CONTINUE CONVERSATION (CHAT) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
            <MessageSquare className="w-3 h-3" />
            Continue Conversation
          </h4>
          {goalChatMessages.length > 0 && (
            <button 
              onClick={() => useFitnessStore.getState().clearChatHistory(goalId)}
              className="text-[9px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-colors"
            >
              Clear Thread
            </button>
          )}
        </div>

        {/* Chat Thread */}
        <div className="space-y-4 max-h-[300px] overflow-y-auto px-2 py-4 scrollbar-hide border-y border-white/5 bg-black/5 rounded-3xl">
          <AnimatePresence initial={false}>
            {goalChatMessages.length === 0 && !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 opacity-20"
              >
                <p className="text-[10px] uppercase font-black tracking-widest leading-loose">
                  Я помню твои тренировки и прошлые советы.<br/>Спроси меня о прогрессе или плане.
                </p>
              </motion.div>
            )}

            {goalChatMessages.map((msg) => (
              <div key={msg.id} className={cn("flex flex-col gap-1.5", msg.role === 'user' ? "items-end" : "items-start")}>
                <div className={cn(
                  "max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed",
                  msg.role === 'user' ? "bg-primary text-black rounded-tr-none" : "bg-white/5 border border-white/5 rounded-tl-none"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-1 p-4 bg-white/5 rounded-2xl w-fit">
                <div className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1 h-1 rounded-full bg-primary animate-bounce" />
              </div>
            )}
            <div ref={scrollRef} />
          </AnimatePresence>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {questions.map((q) => (
              <button
                key={q.id}
                onClick={() => handleAsk(q.text)}
                disabled={loading}
                className="px-4 py-2 rounded-xl border border-white/5 bg-white/5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 hover:border-primary/20 transition-all active:scale-95 disabled:opacity-50 group"
              >
                <span className="text-muted-foreground group-hover:text-primary transition-colors">{q.icon}</span>
                {q.text}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Спросить коуча..."
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-6 pr-14 text-xs font-medium focus:outline-none focus:border-primary/30 transition-all placeholder:text-white/10"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={cn(
                "absolute right-2 top-2 bottom-2 aspect-square rounded-xl flex items-center justify-center transition-all",
                input.trim() ? "bg-primary text-black" : "bg-white/5 text-muted-foreground opacity-30"
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
