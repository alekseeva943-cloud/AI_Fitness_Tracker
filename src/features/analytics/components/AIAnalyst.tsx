import React, { useState } from 'react';
import { useFitnessStore } from '../../../store/useFitnessStore';
import { AIService } from '../../../services/aiService';
import { selectAnalyticsSummary } from '../selectors/fitnessSelectors';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GradientButton } from '../../../components/ui/GradientButton';
import { Sparkles, Brain, TrendingUp, AlertTriangle, Activity, Calendar, History, ChevronRight, Info, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AIAnalysis } from '../../../types';
import { cn, formatDate } from '../../../lib/utils';
import { AI_TREND, AI_PRIORITY, AI_RECOMMENDATION_TYPE } from '../../../constants/ai';

export const AIAnalyst: React.FC = () => {
  const state = useFitnessStore();
  const summary = selectAnalyticsSummary(state);
  const { analyses, addAIAnalysis, analysisRequest, setAnalysisRequestState } = state;
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalysis | null>(analyses[0] || null);

  const runAnalysis = async () => {
    if (!summary) return;
    
    setAnalysisRequestState({ status: 'loading', error: null });
    
    try {
      const result = await AIService.analyzeProgress(state, summary);
      addAIAnalysis(result);
      setSelectedAnalysis(result);
      setAnalysisRequestState({ status: 'success' });
    } catch (error) {
      setAnalysisRequestState({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Произошла ошибка при анализе' 
      });
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
                <GlassCard className="p-8 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <TrendingUp className="w-32 h-32" />
                   </div>
                   
                   <div className="relative z-10 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                          currentAnalysis.trend === AI_TREND.IMPROVING ? "bg-green-500/10 text-green-400 border-green-500/20" :
                          currentAnalysis.trend === AI_TREND.DECLINING ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        )}>
                          Тренд: {
                            currentAnalysis.trend === AI_TREND.IMPROVING ? 'Улучшение' :
                            currentAnalysis.trend === AI_TREND.DECLINING ? 'Регресс' : 'Стагнация'
                          }
                        </div>
                        <span className="text-[10px] font-mono opacity-50">{formatDate(currentAnalysis.date)}</span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-3xl font-display font-black italic uppercase tracking-tighter">Резюме коуча</h3>
                        <p className="text-lg text-foreground/90 leading-relaxed italic border-l-4 border-primary pl-4 py-1">
                          "{currentAnalysis.summary}"
                        </p>
                      </div>

                      {currentAnalysis.explanation && (
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                          <h4 className="text-[10px] uppercase font-black tracking-widest text-primary flex items-center gap-2">
                            <Info className="w-3 h-3" /> Обоснование
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{currentAnalysis.explanation}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentAnalysis.mainRisk && (
                          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-1">
                            <p className="text-[10px] uppercase font-black tracking-widest text-red-400 flex items-center gap-2">
                              <AlertTriangle className="w-3 h-3" /> Основной риск
                            </p>
                            <p className="text-sm font-medium">{currentAnalysis.mainRisk}</p>
                          </div>
                        )}
                        {currentAnalysis.forecast && (
                          <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-1">
                            <p className="text-[10px] uppercase font-black tracking-widest text-primary flex items-center gap-2">
                              <Zap className="w-3 h-3" /> Прогноз
                            </p>
                            <p className="text-sm font-medium">{currentAnalysis.forecast}</p>
                          </div>
                        )}
                      </div>
                   </div>
                </GlassCard>

                {/* Recommendations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentAnalysis.recommendations.map((rec, idx) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex justify-between items-start">
                        <div className={cn(
                          "p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform",
                          rec.type === AI_RECOMMENDATION_TYPE.NUTRITION && "bg-orange-500/10 text-orange-400",
                          rec.type === AI_RECOMMENDATION_TYPE.RECOVERY && "bg-blue-500/10 text-blue-400",
                          rec.type === AI_RECOMMENDATION_TYPE.CONSISTENCY && "bg-purple-500/10 text-purple-400"
                        )}>
                           <Activity className="w-5 h-5" />
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-black border",
                          rec.priority === AI_PRIORITY.HIGH ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          rec.priority === AI_PRIORITY.MEDIUM ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                          "bg-green-500/10 text-green-400 border-green-500/20"
                        )}>
                          {rec.priority}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-bold leading-tight line-clamp-3">{rec.text}</p>
                        {rec.reason && (
                          <p className="text-[10px] text-muted-foreground italic border-l border-white/20 pl-2">
                            {rec.reason}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
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
