import React, { useState } from 'react';
import { useFitnessStore } from '../../../store/useFitnessStore';
import { AIActions } from '../../../ai/orchestrator/ai-actions';
import { selectAnalyticsSummary } from '../selectors/fitnessSelectors';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GradientButton } from '../../../components/ui/GradientButton';
import { Sparkles, Brain, TrendingUp, AlertTriangle, Activity, Calendar, History, ChevronRight, Info, Zap, ShieldCheck, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AIAnalysis } from '../../../types';
import { cn, formatDate } from '../../../lib/utils';
import { AI_TREND, AI_PRIORITY, AI_RECOMMENDATION_TYPE } from '../../../constants/ai';

export const AIAnalyst: React.FC = () => {
  const state = useFitnessStore();
  const summary = selectAnalyticsSummary(state);
  const { analyses, analysisRequest } = state;
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalysis | null>(analyses[0] || null);

  const runAnalysis = async () => {
    try {
      const result = await AIActions.startDeepAnalysis();
      setSelectedAnalysis(result);
    } catch (error) {
      console.error('Analysis failed', error);
    }
  };

  const currentAnalysis = selectedAnalysis || analyses[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-display font-medium flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            AI Коуч-Аналитик
          </h2>
          <p className="text-muted-foreground text-sm">Персонализированный разбор вашей формы и стратегии</p>
        </div>
        
        <GradientButton 
          onClick={runAnalysis} 
          loading={analysisRequest.status === 'loading'}
          icon={<Sparkles className="w-4 h-4" />}
          className="md:w-auto w-full"
        >
          Запустить полный анализ
        </GradientButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Analysis View */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {analysisRequest.status === 'loading' ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <GlassCard className="p-12 flex flex-col items-center justify-center space-y-4 min-h-[400px]">
                  <div className="relative">
                    <Brain className="w-16 h-16 text-primary animate-pulse" />
                    <Sparkles className="w-6 h-6 text-primary absolute -top-2 -right-2 animate-bounce" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold uppercase tracking-widest italic">Анализируем данные...</h3>
                    <p className="text-muted-foreground text-xs uppercase tracking-tight">Обработка тренировок, трендов и параметров профиля</p>
                  </div>
                  <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      animate={{ x: [-256, 256] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </GlassCard>
              </motion.div>
            ) : currentAnalysis ? (
              <motion.div
                key={currentAnalysis.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Summary & Trend Card */}
                <GlassCard className="p-10 relative overflow-hidden bg-[#0F172A] border-white/5">
                   {/* Abstract background graphics */}
                   <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32" />
                   <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full -ml-24 -mb-24" />
                   
                   <div className="relative z-10 space-y-8">
                      <div className="flex items-center justify-between">
                        <div className={cn(
                          "px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-sm",
                          currentAnalysis.trend === AI_TREND.IMPROVING ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          currentAnalysis.trend === AI_TREND.DECLINING ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                          "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        )}>
                          Status: {
                            currentAnalysis.trend === AI_TREND.IMPROVING ? 'OPTIMIZING' :
                            currentAnalysis.trend === AI_TREND.DECLINING ? 'REGRESSING' : 'STABILIZING'
                          }
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                              <Calendar className="w-3 h-3 text-white/30" />
                              <span className="text-[10px] font-mono text-white/40">{formatDate(currentAnalysis.date)}</span>
                           </div>
                        </div>
                      </div>
 
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                           <div className="h-0.5 w-12 bg-primary/50" />
                           <h3 className="text-sm font-black uppercase tracking-[0.4em] text-primary italic">Intelligence Summary</h3>
                        </div>
                        <p className="text-3xl font-display font-medium text-white leading-tight tracking-tight">
                          {currentAnalysis.summary.startsWith('"') ? currentAnalysis.summary : `"${currentAnalysis.summary}"`}
                        </p>
                      </div>
 
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {currentAnalysis.mainRisk && (
                          <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-3xl space-y-2 group hover:bg-rose-500/10 transition-colors">
                            <div className="flex items-center gap-2">
                               <AlertTriangle className="w-4 h-4 text-rose-400" />
                               <p className="text-[10px] uppercase font-black tracking-widest text-rose-400/60">Risk Assessment</p>
                            </div>
                            <p className="text-sm font-bold text-rose-100/90 leading-relaxed">{currentAnalysis.mainRisk}</p>
                          </div>
                        )}
                        {currentAnalysis.verdict && (
                          <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl space-y-2 group hover:bg-primary/10 transition-colors">
                            <div className="flex items-center gap-2">
                               <Zap className="w-4 h-4 text-primary" />
                               <p className="text-[10px] uppercase font-black tracking-widest text-primary/60">Final Verdict</p>
                            </div>
                            <p className="text-sm font-bold text-white leading-relaxed">{currentAnalysis.verdict}</p>
                          </div>
                        )}
                      </div>

                      {/* Deep Dive Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400/60 flex items-center gap-2">
                             <ShieldCheck className="w-3 h-3" /> Сильные стороны
                          </h4>
                          <div className="space-y-2">
                             {(currentAnalysis.insights || []).slice(0, 3).map((insight: string, i: number) => (
                               <div key={i} className="flex gap-3 text-xs text-white/50 leading-relaxed group/item">
                                  <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0 group-hover/item:scale-150 transition-transform" />
                                  {insight}
                               </div>
                             ))}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400/60 flex items-center gap-2">
                             <Target className="w-3 h-3" /> Точки роста
                          </h4>
                          <div className="space-y-2">
                             {(currentAnalysis.warnings || []).slice(0, 3).map((warning: string, i: number) => (
                               <div key={i} className="flex gap-3 text-xs text-white/50 leading-relaxed group/item">
                                  <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0 group-hover/item:scale-150 transition-transform" />
                                  {warning}
                               </div>
                             ))}
                          </div>
                        </div>
                      </div>
                   </div>
                </GlassCard>
 
                {/* Tactical Actions Section */}
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-primary" />
                      <h3 className="text-xs font-black uppercase tracking-[0.3em]">Tactical Recommendations</h3>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {currentAnalysis.recommendations.map((rec, idx) => (
                       <motion.div
                         key={rec.id || idx}
                         initial={{ opacity: 0, scale: 0.98 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: idx * 0.1 }}
                         className="relative p-6 bg-white/[0.03] border border-white/5 rounded-[2.5rem] space-y-5 hover:bg-white/[0.05] transition-all overflow-hidden group"
                       >
                         {/* Background Icon */}
                         <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
                            {rec.type === AI_RECOMMENDATION_TYPE.NUTRITION ? <Activity className="w-24 h-24" /> : <TrendingUp className="w-24 h-24" />}
                         </div>

                         <div className="flex justify-between items-center relative z-10">
                           <div className={cn(
                             "w-10 h-10 rounded-2xl flex items-center justify-center border",
                             rec.type === AI_RECOMMENDATION_TYPE.NUTRITION ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                             rec.type === AI_RECOMMENDATION_TYPE.RECOVERY ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                             "bg-primary/10 text-primary border-primary/20"
                           )}>
                              <Activity className="w-5 h-5" />
                           </div>
                           <div className={cn(
                             "px-2.5 py-1 rounded-full text-[8px] font-black tracking-widest border uppercase",
                             rec.priority === AI_PRIORITY.HIGH ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                             rec.priority === AI_PRIORITY.MEDIUM ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                             "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                           )}>
                             {rec.priority}
                           </div>
                         </div>
                         <div className="space-y-3 relative z-10">
                            <div className="space-y-1">
                               <p className="text-sm font-bold text-white leading-snug group-hover:text-primary transition-colors">{rec.text}</p>
                               {rec.reason && (
                                 <p className="text-[10px] text-white/30 italic leading-relaxed">
                                   {rec.reason}
                                 </p>
                               )}
                            </div>
                            
                            {rec.action && (
                               <button className="w-full py-2.5 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2">
                                  {rec.action.label}
                                  <ChevronRight className="w-3 h-3" />
                               </button>
                            )}
                         </div>
                       </motion.div>
                     ))}
                   </div>
                </div>
              </motion.div>
            ) : (
              <GlassCard className="p-12 flex flex-col items-center justify-center space-y-4 min-h-[400px] border-dashed border-white/10">
                <Brain className="w-12 h-12 text-muted-foreground/30" />
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold uppercase tracking-widest opacity-50">Аналитика не запущена</h3>
                  <p className="text-muted-foreground text-xs px-12">Запустите AI-экспертизу, чтобы получить глубокий разбор вашей спортивной формы.</p>
                </div>
              </GlassCard>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar: History & Quick Stats */}
        <div className="space-y-6">
          <GlassCard className="p-6 space-y-4">
             <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
               <History className="w-4 h-4 text-primary" />
               История анализов
             </h3>
             <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                {analyses.length > 0 ? analyses.map((analysis) => (
                  <button
                    key={analysis.id}
                    onClick={() => setSelectedAnalysis(analysis)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl border transition-all group",
                      selectedAnalysis?.id === analysis.id 
                        ? "bg-primary/10 border-primary/30" 
                        : "bg-white/5 border-white/5 hover:bg-white/10"
                    )}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[10px] font-mono opacity-50">{formatDate(analysis.date)}</p>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        analysis.trend === AI_TREND.IMPROVING ? "bg-green-500" :
                        analysis.trend === AI_TREND.DECLINING ? "bg-red-500" : "bg-yellow-500"
                      )} />
                    </div>
                    <p className="text-xs font-bold truncate line-clamp-1 group-hover:text-primary transition-colors">
                      {analysis.summary}
                    </p>
                  </button>
                )) : (
                  <p className="text-[10px] text-muted-foreground italic text-center py-8">Пусто</p>
                )}
             </div>
          </GlassCard>

          {currentAnalysis && (
            <div className="p-6 bg-primary rounded-3xl space-y-6 shadow-2xl shadow-primary/20 animate-in zoom-in duration-500">
               <div className="space-y-1">
                  <h4 className="text-black font-black uppercase tracking-widest text-xs">AI Готовность</h4>
                  <p className="text-black/60 text-[10px] leading-tight font-bold italic">Прогноз восстановления на сегодня</p>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="text-4xl font-display font-black italic text-black">84%</div>
                  <div className="flex-1 space-y-1">
                     <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                        <div className="h-full bg-black w-[84%]" />
                     </div>
                     <p className="text-black/80 font-black uppercase tracking-widest text-[8px]">Высокая интенсивность разрешена</p>
                  </div>
               </div>
               
               <p className="text-black/80 text-[10px] leading-relaxed font-bold border-t border-black/10 pt-4">
                 Система рекомендует сегодня уделить внимание {
                   currentAnalysis.recommendations.find(r => r.type === AI_RECOMMENDATION_TYPE.TRAINING)?.text.split(' ')[0] || 'технике'
                 }, так как циклы восстановления совпадают с графиком.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
