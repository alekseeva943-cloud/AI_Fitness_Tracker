import React from "react";
import { GlassCard } from "../../../components/ui/GlassCard";
import { Sparkles, TrendingUp, Apple, Dumbbell, AlertTriangle, Zap, CheckCircle2, MessageSquare, Brain, Target, ArrowRight, Quote } from "lucide-react";
import { GradientButton } from "../../../components/ui/GradientButton";
import { useFitnessStore } from "../../../store/useFitnessStore";
import { selectAnalyticsSummary } from "../../analytics/selectors/fitnessSelectors";
import { AIActions } from "../../../ai/orchestrator/ai-actions";
import { cn, formatDate } from "../../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { AI_RECOMMENDATION_TYPE, AI_PRIORITY, AI_TREND } from "../../../constants/ai";

interface AIRecommendationsSectionProps {
  variant?: 'dashboard' | 'compact';
}

export const AIRecommendationsSection: React.FC<AIRecommendationsSectionProps> = ({ variant = 'dashboard' }) => {
  const state = useFitnessStore();
  const summary = selectAnalyticsSummary(state);
  const { analyses, analysisRequest, profile } = state;
  
  const loading = analysisRequest.status === 'loading';
  const error = analysisRequest.error;

  const isCompact = variant === 'compact';

  const getIcon = (type: string) => {
    switch (type) {
      case AI_RECOMMENDATION_TYPE.TRAINING: return <Dumbbell className="w-5 h-5" />;
      case AI_RECOMMENDATION_TYPE.NUTRITION: return <Apple className="w-5 h-5" />;
      case AI_RECOMMENDATION_TYPE.RECOVERY: return <Zap className="w-5 h-5" />;
      case AI_RECOMMENDATION_TYPE.CONSISTENCY: return <Sparkles className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  const handleDeepAnalysis = async () => {
    try {
      await AIActions.startDeepAnalysis();
    } catch (err) {
      console.error(err);
    }
  };

  const latestAnalysis = analyses[0];

  return (
    <div className={cn("space-y-6", isCompact && "space-y-4")}>
      {!isCompact && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-display font-bold flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI Коучинг
            </h3>
            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black">Elite Performance Layer • {profile?.displayName || 'Атлет'}</p>
          </div>
          <GradientButton 
            variant="primary" 
            size="sm" 
            onClick={handleDeepAnalysis}
            loading={loading}
            icon={<Sparkles className="w-4 h-4" />}
            className="shadow-xl"
          >
            Обновить анализ
          </GradientButton>
        </div>
      )}

      <AnimatePresence mode="wait">
        {error ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-red-500/5 border border-red-500/20 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6"
          >
            <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center shrink-0">
               <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <div className="space-y-2 text-center md:text-left">
              <p className="text-lg font-bold text-red-400">Ошибка анализа</p>
              <p className="text-sm opacity-70 leading-relaxed max-w-lg">{error}</p>
              <button 
                onClick={handleDeepAnalysis}
                className="text-primary text-xs font-bold uppercase tracking-widest hover:underline mt-2"
              >
                Попробовать снова
              </button>
            </div>
          </motion.div>
        ) : loading ? (
          <div className={cn("grid gap-6", isCompact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3")}>
            <GlassCard className={cn("p-8 h-48 animate-pulse bg-white/5 border-white/5", !isCompact && "lg:col-span-2")} />
            {!isCompact && <GlassCard className="p-8 h-48 animate-pulse bg-white/5 border-white/5" />}
          </div>
        ) : latestAnalysis ? (
          <div className={cn("grid gap-6 items-start", isCompact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12")}>
            
            {/* MAIN COACHING BLOCK */}
            <div className={cn("space-y-6", isCompact ? "" : "lg:col-span-8")}>
              <GlassCard className={cn(
                "bg-linear-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 relative overflow-hidden group",
                isCompact ? "p-6" : "p-8"
              )}>
                 {!isCompact && (
                   <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                      <Brain className="w-48 h-48" />
                   </div>
                 )}
                 
                 <div className={cn("space-y-4 relative z-10", isCompact && "space-y-3")}>
                    <div className="flex justify-between items-start">
                       <div className="space-y-1">
                          <div className={cn("flex items-center gap-2 text-primary", isCompact && "text-primary/70")}>
                             {latestAnalysis.trend === 'IMPROVING' ? <TrendingUp className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                             <span className="text-[10px] font-black uppercase tracking-widest">
                               {latestAnalysis.verdict ? "Заметка коуча" : (isCompact ? "Статус" : "Личный коуч")}
                             </span>
                          </div>
                          <h4 className={cn(
                            "font-display font-black leading-none tracking-tight",
                            isCompact ? "text-lg" : "text-xl"
                          )}>
                             {latestAnalysis.verdict || (latestAnalysis.trend === 'IMPROVING' ? "Прогресс в норме" : "Требуется корректировка")}
                          </h4>
                       </div>
                       {!isCompact && (
                         <div className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                            latestAnalysis.trend === 'IMPROVING' ? "bg-green-500/20 border-green-500/40 text-green-400" :
                            latestAnalysis.trend === 'DECLINING' ? "bg-red-500/20 border-red-500/40 text-red-400" :
                            "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
                         )}>
                            {latestAnalysis.trend === 'IMPROVING' ? 'Оптимально' : 
                             latestAnalysis.trend === 'DECLINING' ? 'Внимание' : 'Стабильно'}
                         </div>
                       )}
                    </div>
                    
                    <p className={cn(
                      "leading-relaxed text-foreground/90 font-medium",
                      isCompact ? "text-sm max-w-full" : "text-lg max-w-2xl"
                    )}>
                       {latestAnalysis.summary}
                    </p>

                    {latestAnalysis.motivation && !isCompact && (
                      <div className="pt-4 border-t border-white/5 italic text-primary/80 font-display text-lg">
                        "{latestAnalysis.motivation}"
                      </div>
                    )}
                 </div>
              </GlassCard>

              {/* INSIGHTS GRID */}
              <div className={cn("grid gap-4", isCompact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                 <GlassCard className="p-5 space-y-3 border-white/5 bg-white/5">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                       <Zap className="w-3 h-3 text-primary" />
                       Инсайты
                    </h5>
                    <ul className="space-y-2">
                       {(latestAnalysis.insights || []).slice(0, isCompact ? 2 : 4).map((insight, i) => (
                         <li key={i} className="text-xs font-medium flex items-start gap-3">
                            <ArrowRight className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                            {insight}
                         </li>
                       ))}
                    </ul>
                 </GlassCard>

                 <GlassCard className="p-5 space-y-3 border-white/5 bg-white/5">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                       <Target className="w-3 h-3 text-primary" />
                       Следующие шаги
                    </h5>
                    <ul className="space-y-2">
                       {(latestAnalysis.nextSteps || []).slice(0, isCompact ? 3 : 5).map((step, i) => (
                         <li key={i} className="text-xs font-medium flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            {step}
                         </li>
                       ))}
                    </ul>
                 </GlassCard>
              </div>
            </div>

            {/* SECONDARY ACTION CARDS */}
            {!isCompact && (
              <div className="lg:col-span-4 space-y-4 h-full">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Рекомендации</h5>
                <div className="flex flex-col gap-4">
                    {(latestAnalysis.recommendations || []).slice(0, 3).map((rec: any, idx: number) => (
                      <GlassCard 
                        key={rec.id || idx} 
                        delay={idx * 0.1}
                        className="p-5 border-white/5 hover:bg-white/5 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-3">
                           <div className={cn(
                             "p-2 rounded-xl bg-primary/10 text-primary",
                             rec.type === AI_RECOMMENDATION_TYPE.NUTRITION && "bg-orange-500/10 text-orange-400",
                             rec.type === AI_RECOMMENDATION_TYPE.RECOVERY && "bg-blue-500/10 text-blue-400"
                           )}>
                             {getIcon(rec.type)}
                           </div>
                           <div className={cn(
                             "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border",
                             rec.priority === AI_PRIORITY.HIGH ? "bg-red-500/10 text-red-400 border-red-500/20" :
                             rec.priority === AI_PRIORITY.MEDIUM ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                             "bg-green-500/10 text-green-400 border-green-500/20"
                           )}>
                             {rec.priority}
                           </div>
                        </div>
                        <p className="text-xs font-bold leading-tight mb-2">{rec.text}</p>
                        {rec.reason && (
                          <p className="text-[9px] text-muted-foreground italic leading-tight">
                            {rec.reason}
                          </p>
                        )}
                      </GlassCard>
                    ))}
                </div>

                {latestAnalysis.mainRisk && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 bg-red-500/5 border border-red-500/20 rounded-[2rem] space-y-2"
                  >
                      <div className="flex items-center gap-2 text-red-400">
                         <AlertTriangle className="w-3 h-3" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Критический риск</span>
                      </div>
                      <p className="text-xs font-bold leading-tight">{latestAnalysis.mainRisk}</p>
                  </motion.div>
                )}
              </div>
            )}

          </div>
        ) : (
          <div className="py-20 text-center glass rounded-[2.5rem] border-2 border-dashed border-white/5 space-y-4">
            <div className="relative inline-block">
               <Sparkles className="w-16 h-16 text-primary/10 mx-auto" />
               <Brain className="w-8 h-8 text-primary/20 absolute -top-2 -right-2" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold uppercase tracking-tight italic opacity-40">Система готова к работе</p>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">Нажмите кнопку выше, чтобы запустить глубокий анализ вашей прогрессии и получить рекомендации от AI-коуча.</p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
