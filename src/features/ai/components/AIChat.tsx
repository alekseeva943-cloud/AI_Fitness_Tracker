import React, { useState, useRef, useEffect } from 'react';
import { useFitnessStore } from '../../../store/useFitnessStore';
import { AIActions } from '../../../ai/orchestrator/ai-actions';
import { AIHealthCheck, AIStatus } from '../../../ai/debug/ai-healthcheck';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Brain, Send, User, Sparkles, Trash2, Zap, AlertTriangle, TrendingUp, Activity, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../../../lib/utils';

export const AIChat: React.FC = () => {
  const { chatMessages, analysisRequest, clearChatHistory } = useFitnessStore();
  const [input, setInput] = useState('');
  const [health, setHealth] = useState<AIStatus | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const loading = analysisRequest.status === 'loading';
  const hasError = analysisRequest.status === 'error';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    const checkHealth = async () => {
      const status = await AIHealthCheck.check();
      setHealth(status);
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e?: React.FormEvent, customMsg?: string) => {
    e?.preventDefault();
    const msg = customMsg || input;
    if (!msg.trim() || loading) return;

    if (!customMsg) setInput('');
    
    try {
      await AIActions.askQuestion(msg);
    } catch (err) {
      console.error('Chat error', err);
    }
  };

  const suggestions = [
    "Как мне улучшить технику?",
    "Аудит моего питания за неделю",
    "Почему вес встал?",
  ];

  return (
    <GlassCard className="flex flex-col h-[650px] overflow-hidden border-white/5 relative group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
         <Brain className="w-64 h-64" />
      </div>

      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-2xl border border-primary/20">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-black italic uppercase tracking-tighter text-xl flex items-center gap-2">
              LIFESTYLE COACH
              {health && (
                <div className={cn(
                  "px-1.5 py-0.5 rounded text-[8px] font-bold tracking-widest flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                )}>
                  <div className={cn("w-1 h-1 rounded-full bg-emerald-400 animate-pulse")} />
                  ONLINE
                </div>
              )}
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">Elite Strategy Layer • AI Powered</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={clearChatHistory}
            className="p-2.5 hover:bg-red-500/10 rounded-xl transition-all text-muted-foreground hover:text-red-400 border border-transparent hover:border-red-500/20 group"
            title="Clear History"
          >
            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin relative z-10">
        {hasError && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 bg-red-500/5 border border-red-500/20 rounded-[2rem] flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 text-red-400">
               <AlertTriangle className="w-3 h-3" />
               <span className="text-[10px] font-black uppercase tracking-widest">Pipeline Analysis Error</span>
            </div>
            <p className="text-xs leading-relaxed text-red-300/80">
              {analysisRequest.error || "Неизвестная ошибка в слое ИИ"}
            </p>
          </motion.div>
        )}

        {chatMessages.length === 0 && !hasError && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
             <div className="relative">
                <Sparkles className="w-16 h-16 text-primary" />
                <Brain className="w-8 h-8 text-primary/50 absolute -top-2 -right-2 animate-bounce" />
             </div>
             <div className="space-y-2">
                <p className="text-lg font-display font-black uppercase tracking-widest italic leading-none">Система ожидает</p>
                <p className="text-xs max-w-[240px] mx-auto leading-relaxed">Задай вопрос о прогрессе, тренировках или плане питания. Я проанализирую твои данные мгновенно.</p>
             </div>
             
             <div className="flex flex-col gap-2 w-full max-w-[300px]">
                {suggestions.map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSend(undefined, s)}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:border-primary/30 transition-all text-left flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 text-primary group-hover:translate-x-1 transition-transform" />
                    {s}
                  </button>
                ))}
             </div>
          </div>
        )}

        {chatMessages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-4",
              msg.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-all shadow-lg",
              msg.role === 'user' ? "bg-white/5 border-white/10" : "bg-primary border-primary/40 text-black scale-105"
            )}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
            </div>
            
            <div className={cn(
              "max-w-[80%] space-y-3",
              msg.role === 'user' ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "p-5 rounded-[2rem] text-sm leading-relaxed shadow-xl",
                msg.role === 'user' 
                  ? "bg-white/5 border border-white/5 text-white rounded-tr-none" 
                  : "bg-white/10 border border-white/10 text-foreground rounded-tl-none font-medium"
              )}>
                {msg.content}
              </div>
              
              {/* Metadata / Suggestions from AI */}
              {msg.role === 'assistant' && msg.metadata && (
                <div className="grid grid-cols-1 gap-2 mt-4 ml-2">
                   {msg.metadata.recommendations?.slice(0, 1).map((rec: any, rIdx: number) => (
                     <div key={rIdx} className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                           <Zap className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest">{rec.text}</p>
                     </div>
                   ))}
                   {msg.metadata.verdict && (
                      <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest opacity-60">
                        VERDICT: {msg.metadata.verdict}
                      </div>
                   )}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex gap-4"
          >
             <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse border border-primary/40">
                <Brain className="w-5 h-5 text-black" />
             </div>
             <div className="p-5 rounded-[2rem] rounded-tl-none bg-white/5 border border-white/5 flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
             </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/5 bg-white/5 relative z-10">
        <form onSubmit={(e) => handleSend(e)} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Задайте вопрос коучу..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-7 pr-16 text-sm font-medium focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/10 shadow-inner"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={cn(
              "absolute right-2.5 top-2.5 w-12 h-12 rounded-xl flex items-center justify-center transition-all",
              input.trim() ? "bg-primary text-black shadow-lg shadow-primary/20 scale-100" : "bg-white/5 text-muted-foreground scale-95 opacity-50"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </GlassCard>
  );
};
