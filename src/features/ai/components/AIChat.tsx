import React, { useState, useRef, useEffect } from 'react';
import { useFitnessStore } from '../../../store/useFitnessStore';
import { AIActions } from '../../../ai/orchestrator/ai-actions';
import { AIHealthCheck, AIStatus } from '../../../ai/debug/ai-healthcheck';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Brain, Send, User, Sparkles, Trash2, Zap, AlertTriangle, TrendingUp, Activity, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../../../lib/utils';

const GeminiIcon = ({ className }: { className?: string }) => (
  <div className={cn("relative flex items-center justify-center", className)}>
    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse" />
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
      <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill="currentColor" className="text-white" />
      <circle cx="12" cy="12" r="3" fill="currentColor" className="text-primary" />
    </svg>
  </div>
);

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
  }, [chatMessages, loading]);

  useEffect(() => {
    const checkHealth = async () => {
      const status = await AIHealthCheck.check().catch(() => null);
      setHealth(status);
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
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
    "Проанализируй мой прогресс за неделю",
    "Почему вес не уходит?",
    "Составь план на завтра",
  ];

  const handleAction = (actionId: string) => {
    console.log('Executing AI action:', actionId);
  };

  return (
    <GlassCard className="flex flex-col h-[750px] overflow-hidden border-white/5 relative group bg-[#050A15]/80 backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
      {/* Background Decor */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none group-hover:scale-105 transition-transform duration-1000">
         <div className="w-full h-full border-[1px] border-white/10 rounded-full scale-[1.5] rotate-45" />
      </div>

      {/* Header */}
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.03] relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <GeminiIcon className="w-10 h-10" />
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-display font-black italic uppercase tracking-[0.1em] text-2xl text-white drop-shadow-sm">
                GENESIS <span className="text-primary italic">CORE</span>
              </h3>
              {health && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                   <span className="text-[9px] font-black tracking-[0.2em] text-emerald-400 uppercase">Online</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-black">Neural Strategy Layer</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={clearChatHistory}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-red-500/10 transition-all text-white/20 hover:text-red-400 border border-white/5 hover:border-red-500/20 group/trash"
          >
            <Trash2 className="w-4 h-4 group-hover/trash:rotate-12 transition-transform" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide relative z-10 scroll-smooth">
        {hasError && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-rose-500/5 border border-rose-500/10 rounded-[2.5rem] space-y-4 shadow-2xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 text-rose-400">
               <AlertTriangle className="w-5 h-5" />
               <span className="text-[11px] font-black uppercase tracking-[0.3em] italic">System Core Refusal</span>
            </div>
            <p className="text-[13px] leading-relaxed text-rose-100/40 font-medium">
               {analysisRequest.error?.includes('500') 
                 ? "Критическая ошибка доступа. Убедитесь, что API ключ (GEMINI_API_KEY) настроен в настройках приложения." 
                 : (analysisRequest.error || "Неизвестная ошибка в слое ИИ. Требуется инициализация.")}
            </p>
          </motion.div>
        )}

        {chatMessages.length === 0 && !hasError && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-12 py-10">
             <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full scale-150 group-hover:scale-200 transition-transform duration-1000" />
                <div className="w-32 h-32 rounded-[2.5rem] bg-white/[0.03] border border-white/10 flex items-center justify-center relative z-10 transform group-hover:rotate-[15deg] transition-all duration-700 shadow-2xl">
                   <GeminiIcon className="w-16 h-16" />
                </div>
             </div>
             
             <div className="space-y-4 relative z-10">
                <h4 className="text-3xl font-display font-black uppercase italic tracking-[0.2em] text-white/90">Ядро готово</h4>
                <p className="text-[13px] text-white/30 max-w-[340px] mx-auto leading-relaxed font-medium">
                   Ваш стратегический ассистент к вашим услугам. <br/>Задайте направление для анализа.
                </p>
             </div>
             
             <div className="flex flex-col gap-3 w-full max-w-[360px] relative z-10">
                {suggestions.map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSend(undefined, s)}
                    className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-white/40 hover:bg-primary/10 hover:border-primary/20 hover:text-white transition-all text-left flex items-center justify-between group active:scale-[0.98]"
                  >
                    <span>{s}</span>
                    <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
             </div>
          </div>
        )}

        {chatMessages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-6",
              msg.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all",
              msg.role === 'user' 
                ? "bg-white/5 border-white/10 text-white/30" 
                : "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            )}>
              {msg.role === 'user' ? <User className="w-7 h-7" /> : <GeminiIcon className="w-7 h-7" />}
            </div>
            
            <div className={cn(
              "max-w-[85%] space-y-5",
              msg.role === 'user' ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "p-7 rounded-[2rem] text-[15px] leading-relaxed relative",
                msg.role === 'user' 
                  ? "bg-white/[0.02] border border-white/5 text-white/70 rounded-tr-none shadow-sm" 
                  : "bg-white/[0.06] border border-white/10 text-white rounded-tl-none font-medium shadow-2xl backdrop-blur-md"
              )}>
                {msg.content}
              </div>
              
              {/* Metadata Actions */}
              {msg.role === 'assistant' && msg.metadata && (
                <div className="space-y-4 w-full ml-2">
                   {msg.metadata.recommendations?.slice(0, 2).map((rec: any, rIdx: number) => (
                     <motion.div 
                        key={rIdx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + (rIdx * 0.1) }}
                        className="p-6 bg-primary/5 border border-primary/10 rounded-[2rem] flex flex-col gap-5 overflow-hidden relative group/rec shadow-xl"
                     >
                        <div className="absolute -bottom-8 -right-8 p-2 opacity-5 group-hover/rec:scale-125 transition-transform duration-700">
                           <Zap className="w-32 h-32 text-primary" />
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                           <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20 shrink-0 shadow-inner">
                              <Activity className="w-6 h-6 text-primary" />
                           </div>
                           <div className="space-y-1">
                              <p className="text-[13px] font-black uppercase text-white/90 tracking-tight leading-none">{rec.text}</p>
                              {rec.reason && <p className="text-[10px] text-white/30 italic font-medium leading-relaxed">{rec.reason}</p>}
                           </div>
                        </div>
                        
                        {rec.action && (
                          <button 
                            onClick={() => handleAction(rec.action.id)}
                            className="w-full py-4 rounded-2xl bg-primary text-black text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all relative z-10 shadow-[0_10px_25px_rgba(var(--primary-rgb),0.3)]"
                          >
                             {rec.action.label}
                          </button>
                        )}
                     </motion.div>
                   ))}
                   
                   {msg.metadata.verdict && (
                      <div className="px-6 py-2.5 bg-white/5 border border-white/5 rounded-full w-fit text-[9px] font-black uppercase tracking-[0.3em] text-white/20 shadow-sm">
                        Verdict: <span className="text-primary italic ml-1">{msg.metadata.verdict}</span>
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
            className="flex gap-6"
          >
             <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 border border-primary/40 animate-pulse">
                <GeminiIcon className="w-8 h-8 text-black" />
             </div>
             <div className="px-8 py-5 rounded-[2rem] rounded-tl-none bg-white/[0.03] border border-white/5 flex gap-2.5 items-center backdrop-blur-sm shadow-xl">
                <span className="w-2 h-2 rounded-full bg-primary/80 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-primary/80 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" />
             </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-10 border-t border-white/5 bg-white/[0.02] relative z-20 backdrop-blur-xl">
        <form onSubmit={(e) => handleSend(e)} className="relative group/form">
          <div className="absolute -inset-2 bg-primary/5 blur-3xl opacity-0 group-focus-within/form:opacity-100 transition-opacity duration-1000" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Задайте стратегический вопрос..."
            className="w-full bg-black/60 border border-white/10 rounded-3xl py-7 pl-10 pr-24 text-[15px] font-medium focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-white/10 relative z-10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={cn(
              "absolute right-4 top-4 bottom-4 w-16 rounded-2xl flex items-center justify-center transition-all z-20",
              input.trim() ? "bg-primary text-black shadow-2xl shadow-primary/40 scale-100 hover:brightness-110 active:scale-95" : "bg-white/5 text-white/10 scale-95 opacity-50"
            )}
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </GlassCard>
  );
};
