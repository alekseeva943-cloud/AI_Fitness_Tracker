import React, { useState, useRef, useEffect } from 'react';
import { useFitnessStore } from '../../../store/useFitnessStore';
import { AIActions } from '../../../ai/orchestrator/ai-actions';
import { AIHealthCheck, AIStatus } from '../../../ai/debug/ai-healthcheck';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Brain, Send, User, Sparkles, Trash2, Zap, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
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

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const msg = input;
    setInput('');
    
    try {
      await AIActions.askQuestion(msg);
    } catch (err) {
      console.error('Chat error', err);
    }
  };

  return (
    <GlassCard className="flex flex-col h-[600px] overflow-hidden border-white/5">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-black italic uppercase tracking-tighter text-lg flex items-center gap-2">
              STRIVE AI
              {health && (
                <div className={cn(
                  "px-1.5 py-0.5 rounded text-[8px] font-bold tracking-widest flex items-center gap-1",
                  health.online ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                )}>
                  <div className={cn("w-1 h-1 rounded-full", health.online ? "bg-emerald-400 animate-pulse" : "bg-red-400")} />
                  {health.online ? 'ONLINE' : 'OFFLINE'}
                </div>
              )}
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Elite Performance Layer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {health && (
            <div className="text-[8px] font-mono text-muted-foreground opacity-50">
              {health.latency}ms / {health.provider.toUpperCase()}
            </div>
          )}
          <button 
            onClick={clearChatHistory}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-red-400"
            title="Clear History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {hasError && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 text-red-400">
               <AlertTriangle className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-widest">Pipeline Error</span>
            </div>
            <p className="text-[10px] leading-relaxed text-red-300/80 font-mono">
              {analysisRequest.error || "Неизвестная ошибка в слое ИИ"}
            </p>
            <button 
              onClick={() => handleSend()}
              className="mt-2 text-[8px] uppercase font-bold tracking-widest text-white/50 hover:text-white transition-colors underline underline-offset-4"
            >
              Попробовать снова
            </button>
          </motion.div>
        )}

        {chatMessages.length === 0 && !hasError && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
             <Sparkles className="w-12 h-12 text-primary" />
             <div className="space-y-1">
                <p className="text-sm font-black uppercase tracking-widest">Система ожидает запроса</p>
                <p className="text-xs max-w-[200px] mx-auto leading-relaxed">Задайте вопрос о вашем прогрессе, тренировках или плане питания.</p>
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
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              msg.role === 'user' ? "bg-white/10" : "bg-primary text-black"
            )}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
            </div>
            
            <div className={cn(
              "max-w-[80%] space-y-2",
              msg.role === 'user' ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "p-4 rounded-3xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-white/5 border border-white/5 text-white" 
                  : "bg-white/10 border border-white/10 text-foreground"
              )}>
                {msg.content}
              </div>
              
              {/* Metadata / Suggestions from AI */}
              {msg.role === 'assistant' && msg.metadata?.recommendations && (
                <div className="grid grid-cols-1 gap-2 mt-3">
                   {msg.metadata.recommendations.slice(0, 1).map((rec: any, rIdx: number) => (
                     <div key={rIdx} className="p-3 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-3">
                        <Zap className="w-3 h-3 text-primary" />
                        <p className="text-[10px] font-bold italic">{rec.text}</p>
                     </div>
                   ))}
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
             <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-pulse">
                <Brain className="w-4 h-4 text-black" />
             </div>
             <div className="p-4 rounded-3xl bg-white/5 animate-pulse w-32" />
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/5 bg-white/5">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Спросите AI..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:opacity-30"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={cn(
              "absolute right-2 top-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              input.trim() ? "bg-primary text-black shadow-lg shadow-primary/20" : "bg-white/5 text-muted-foreground"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </GlassCard>
  );
};
