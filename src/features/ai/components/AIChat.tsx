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

  const handleAction = (actionId: string) => {
    console.log('Executing AI action:', actionId);
    // Here logic for applying recommended changes would go
  };

  return (
    <GlassCard className="flex flex-col h-[700px] overflow-hidden border-white/5 relative group bg-[#0A0F1E]">
      {/* Background Decor */}
      <div className="absolute -top-20 -right-20 p-4 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
         <Brain className="w-96 h-96 text-primary" />
      </div>

      {/* Header */}
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02] relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 relative z-10">
              <Brain className="w-7 h-7 text-primary" />
            </div>
            <div className="absolute inset-0 bg-primary/20 blur-xl scale-150 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-display font-black italic uppercase tracking-tighter text-2xl text-white">
                GENESIS AI
              </h3>
              {health && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                   <span className="text-[8px] font-black tracking-[0.2em] text-emerald-400 uppercase">Active</span>
                </div>
              )}
            </div>
            <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-black">Strategic Performance Layer</p>
          </div>
        </div>
        
        <button 
          onClick={clearChatHistory}
          className="p-3 rounded-xl bg-white/5 hover:bg-red-500/10 transition-all text-white/20 hover:text-red-400 border border-white/5 hover:border-red-500/20 group"
        >
          <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide relative z-10">
        {hasError && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-red-400/5 border border-red-400/10 rounded-3xl space-y-3"
          >
            <div className="flex items-center gap-2 text-red-400">
               <AlertTriangle className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest italic">Core Pipeline Logic Error</span>
            </div>
            <p className="text-xs leading-relaxed text-red-200/40 font-medium">
               {analysisRequest.error || "Неизвестная ошибка в слое ИИ. Требуется перезагрузка ядра."}
            </p>
          </motion.div>
        )}

        {chatMessages.length === 0 && !hasError && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
             <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 group-hover:scale-200 transition-transform duration-1000" />
                <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center relative z-10 transform group-hover:rotate-12 transition-transform">
                   <Sparkles className="w-10 h-10 text-primary" />
                </div>
             </div>
             <div className="space-y-3 relative z-10">
                <h4 className="text-xl font-display font-black uppercase italic tracking-widest text-white/90">Ассистент готов</h4>
                <p className="text-xs text-white/30 max-w-[280px] mx-auto leading-relaxed font-medium">
                   Задай любой вопрос по тренировкам, биомеханике или прогрессу. Анализ будет мгновенным.
                </p>
             </div>
             
             <div className="grid grid-cols-1 gap-2 w-full max-w-[320px] relative z-10">
                {suggestions.map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSend(undefined, s)}
                    className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] text-white/40 hover:bg-primary/10 hover:border-primary/20 hover:text-white transition-all text-left flex items-center justify-between group"
                  >
                    <span>{s}</span>
                    <ArrowRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
             </div>
          </div>
        )}

        {chatMessages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-5",
              msg.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all",
              msg.role === 'user' 
                ? "bg-white/5 border-white/10 text-white/40" 
                : "bg-primary border-primary/40 text-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
            )}>
              {msg.role === 'user' ? <User className="w-6 h-6" /> : <Brain className="w-6 h-6" />}
            </div>
            
            <div className={cn(
              "max-w-[85%] space-y-4",
              msg.role === 'user' ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "p-6 rounded-3xl text-[13px] leading-relaxed relative",
                msg.role === 'user' 
                  ? "bg-white/[0.03] border border-white/5 text-white/80 rounded-tr-none" 
                  : "bg-white/[0.07] border border-white/10 text-white rounded-tl-none font-medium shadow-xl"
              )}>
                {msg.content}
              </div>
              
              {/* Metadata Actions */}
              {msg.role === 'assistant' && msg.metadata && (
                <div className="space-y-3 w-full ml-2">
                   {msg.metadata.recommendations?.map((rec: any, rIdx: number) => (
                     <motion.div 
                        key={rIdx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-5 bg-primary/5 border border-primary/10 rounded-2xl flex flex-col gap-4 overflow-hidden relative group/rec"
                     >
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/rec:scale-150 transition-transform duration-500">
                           <Zap className="w-20 h-20 text-primary" />
                        </div>
                        <div className="flex items-center gap-3 relative z-10">
                           <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20 shrink-0">
                              <Activity className="w-5 h-5 text-primary" />
                           </div>
                           <div className="space-y-0.5">
                              <p className="text-[11px] font-black uppercase text-white/90 tracking-tight leading-none">{rec.text}</p>
                              {rec.reason && <p className="text-[9px] text-white/40 italic font-medium">{rec.reason}</p>}
                           </div>
                        </div>
                        
                        {rec.action && (
                          <button 
                            onClick={() => handleAction(rec.action.id)}
                            className="w-full py-2.5 rounded-xl bg-primary text-black text-[9px] font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all relative z-10 shadow-lg shadow-primary/20"
                          >
                             {rec.action.label}
                          </button>
                        )}
                     </motion.div>
                   ))}
                   
                   {msg.metadata.verdict && (
                      <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-full w-fit text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
                        Verdict: <span className="text-primary italic">{msg.metadata.verdict}</span>
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
            className="flex gap-5"
          >
             <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 border border-primary/40 animate-pulse">
                <Brain className="w-6 h-6 text-black" />
             </div>
             <div className="px-6 py-4 rounded-3xl rounded-tl-none bg-white/[0.03] border border-white/5 flex gap-2 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" />
             </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-8 border-t border-white/5 bg-white/[0.02] relative z-20 backdrop-blur-md">
        <form onSubmit={(e) => handleSend(e)} className="relative group/form">
          <div className="absolute inset-0 bg-primary/10 blur-2xl opacity-0 group-focus-within/form:opacity-100 transition-opacity duration-1000" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Спроси о чем угодно..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 pl-8 pr-20 text-[13px] font-medium focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/10 relative z-10 text-white shadow-2xl shadow-black/50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={cn(
              "absolute right-3 top-3 bottom-3 w-14 rounded-xl flex items-center justify-center transition-all z-20",
              input.trim() ? "bg-primary text-black shadow-xl shadow-primary/40 scale-100 hover:brightness-110" : "bg-white/5 text-white/10 scale-95 opacity-50"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </GlassCard>
  );
};
