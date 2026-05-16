import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, User, Send, Sparkles, Activity, 
  Target, Dumbbell, Zap, Plus, ArrowRight,
  RefreshCw, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useFitnessStore } from '../../../store/useFitnessStore';
import { AIOrchestrator } from '../../../ai/orchestrator/ai-orchestrator';
import { AIActionType } from '../../../ai/orchestrator/types';
import { cn } from '../../../lib/utils';
import { ChatMessage } from '../../../store/slices/aiSlice';

export const AICoachingChat: React.FC = () => {
  const { chatMessages, addChatMessage, addPlanEvent } = useFitnessStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    addChatMessage(userMessage);
    setInput('');
    setIsTyping(true);

    try {
      const state = useFitnessStore.getState();
      const analytics = {}; // Placeholder, orchestrator handles it but we should ideally pass real ones
      
      const response = await AIOrchestrator.executeAction(state as any, analytics, {
        actionType: AIActionType.COACH_CHAT,
        userMessage: input
      });

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.summary,
        timestamp: new Date().toISOString(),
        metadata: {
          recommendations: response.recommendations,
          motivation: response.motivation
        }
      };

      addChatMessage(assistantMessage);
    } catch (error) {
      console.error('Chat AI Error:', error);
      addChatMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Извини, возникла техническая заминка. Давай попробуем еще раз или обсудим другой вопрос.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleApplyAction = (rec: any) => {
    if (rec.type === 'ADD_WORKOUT' || rec.text.toLowerCase().includes('тренировк')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(18, 0);

        addPlanEvent({
            id: crypto.randomUUID(),
            title: 'Тактическая тренировка',
            type: 'WORKOUT',
            source: 'AI',
            date: tomorrow.toISOString(),
            description: rec.text,
            isCompleted: false,
            isAI: true,
            status: 'PLANNED',
            aiRationale: 'На основе нашего обсуждения в чате.',
            createdAt: new Date().toISOString()
        });
        alert('Действие выполнено: Тренировка добавлена в план!');
    }
  };

  return (
    <div className="flex flex-col h-[75vh] glass rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl relative">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Chat Header */}
      <div className="p-6 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary text-black flex items-center justify-center shadow-[0_0_20px_rgba(223,255,0,0.3)] border border-primary/20">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                Genesis-X9 Coach
                <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tighter">Live Strategic Interaction Layer</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-[8px] font-black uppercase text-muted-foreground/40">Контекст</span>
                <span className="text-[10px] font-bold text-primary italic">Active Analytics Mode</span>
            </div>
            <button className="p-2 rounded-xl bg-white/5 text-muted-foreground hover:bg-white/10 transition-all">
                <RefreshCw className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 z-10 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {chatMessages.length === 0 && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="max-w-xl mx-auto text-center py-12 space-y-6"
            >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
                    <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <div>
                    <h4 className="text-xl font-display font-medium mb-2 uppercase tracking-tight italic">Как я могу усилить твой прогресс?</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                        Я имею доступ ко всей твоей истории тренировок, сну и динамике веса. Спрашивай о чем угодно — от техники до адаптации плана.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-2 pt-4">
                    {[
                        "Почему мой пульс вырос на прошлой тренировке?",
                        "Адаптируй тренировки под мой вчерашний плохой сон",
                        "Проанализируй мой питьевой режим за неделю"
                    ].map((suggestion, i) => (
                        <button 
                            key={i}
                            onClick={() => setInput(suggestion)}
                            className="text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-primary/10 border border-primary/20 py-3 px-4 rounded-2xl transition-all text-left"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </motion.div>
          )}

          {chatMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-start gap-4 max-w-4xl",
                msg.role === 'user' ? "flex-row-reverse ml-auto" : "flex-row"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                msg.role === 'user' 
                    ? "bg-secondary border-white/10 text-muted-foreground" 
                    : "bg-primary text-black border-primary/20 shadow-[0_0_15px_rgba(223,255,0,0.2)]"
              )}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
              </div>
              
              <div className="space-y-3 flex-1 overflow-hidden">
                <div className={cn(
                  "p-6 text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-primary text-black font-bold rounded-[2rem] rounded-tr-none shadow-xl shadow-primary/5" 
                    : "bg-white/5 border border-white/5 text-muted-foreground font-medium rounded-[2rem] rounded-tl-none backdrop-blur-xl"
                )}>
                  {msg.content}
                </div>

                {msg.metadata?.recommendations?.length > 0 && (
                  <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
                    {msg.metadata.recommendations.map((rec: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => handleApplyAction(rec)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/20 transition-all"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        {rec.action?.label || 'Выполнить'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div 
               initial={{ opacity: 0, x: -10 }} 
               animate={{ opacity: 1, x: 0 }} 
               className="flex items-start gap-4"
            >
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 text-primary flex items-center justify-center animate-pulse">
                    <Brain className="w-5 h-5" />
                </div>
                <div className="bg-white/5 border border-white/5 px-6 py-4 rounded-[2rem] rounded-tl-none flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-6 md:p-8 bg-black/60 backdrop-blur-2xl border-t border-white/5 z-10">
        <div className="max-w-3xl mx-auto relative group">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Задай вопрос своему ИИ-коучу..."
            className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] py-6 pl-8 pr-20 text-xs font-bold focus:outline-none focus:border-primary/40 focus:bg-white/10 transition-all placeholder:text-muted-foreground/20 shadow-inner"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className={cn(
                "absolute right-2.5 top-2.5 bottom-2.5 aspect-square bg-primary text-black rounded-full flex items-center justify-center shadow-lg transition-all",
                input.trim() ? "opacity-100 scale-100 shadow-primary/30" : "opacity-30 scale-90 pointer-events-none"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 opacity-30">
            <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest">
                <CheckCircle2 className="w-3 h-3" /> Encrypted Context
            </div>
            <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest">
                <Target className="w-3 h-3" /> Adaptive Response
            </div>
            <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest">
                <Dumbbell className="w-3 h-3" /> Fitness Only
            </div>
        </div>
      </div>
    </div>
  );
};
