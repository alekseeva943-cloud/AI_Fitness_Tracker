import React from "react";
import { GlassCard } from "../../../components/ui/GlassCard";
import { Sparkles, TrendingUp, Apple, Dumbbell, AlertTriangle, Zap, CheckCircle2, MessageSquare, Brain, Target, ArrowRight, Quote, Plus, Activity } from "lucide-react";
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

  const handleRecommendationAction = (rec: any) => {
    if (!rec.action) return;
    
    // In a real app, this would route to specific features
    // For now, we'll simulate the interaction or provide visual feedback
    console.log(`Executing AI Action: ${rec.action.id}`, rec.action.label);
    
    // Example logic based on action ID
    switch (rec.action.id) {
      case 'CREATE_WORKOUT':
        // logic to open workout creation
        break;
      case 'NUTRITION_LOG':
        // logic to navigate to nutrition
        break;
    }
  };

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
                "bg-linear-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 relative overflow-hidden group transition-all duration-500",
                isCompact ? "p-5 rounded-[2rem]" : "p-8 rounded-[2.5rem]"
              )}>
                 {!isCompact && (
                   <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                      <Brain className="w-48 h-48" />
                   </div>
                 )}
                 
                 <div className={cn("space-y-3 relative z-10")}>
                    <div className="flex justify-between items-start">
                       <div className="space-y-0.5">
                          <div className={cn("flex items-center gap-1.5 text-primary", isCompact && "text-primary/70")}>
                             {latestAnalysis.trend === 'IMPROVING' ? <TrendingUp className="w-3.5 h-3.5 shadow-[0_0_10px_rgba(223,255,0,0.2)]" /> : <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                             <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                               {isCompact ? "Заметка тренера" : "Личный коуч"}
                             </span>
                          </div>
                          <h4 className={cn(
                            "font-display font-black tracking-tight",
                            isCompact ? "text-lg text-foreground/90 uppercase italic" : "text-xl italic uppercase tracking-tighter"
                          )}>
                             {latestAnalysis.verdict || (latestAnalysis.trend === 'IMPROVING' ? "Прогресс в норме" : "Нужна корректировка")}
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
                      "leading-relaxed text-foreground/80 font-medium",
                      isCompact ? "text-sm max-w-[500px]" : "text-lg max-w-2xl"
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

              {/* TACTICAL ACTIONS - Inline for compact */}
              {isCompact && latestAnalysis.nextSteps && latestAnalysis.nextSteps.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                   {latestAnalysis.nextSteps.slice(0, 3).map((step: any, i: number) => (
                     <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3 group/step">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover/step:bg-primary/20 transition-colors">
                           <ArrowRight className="w-3 h-3 text-primary" />
                        </div>
                        <p className="text-[10px] font-bold leading-tight">{step}</p>
                     </div>
                   ))}
                </div>
              )}

              {/* INSIGHTS GRID - Only Full Dashboard */}
              {!isCompact && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassCard className="p-5 space-y-3 border-white/5 bg-white/5">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Zap className="w-3 h-3 text-primary" />
                        Ключевой инсайт
                      </h5>
                      <ul className="space-y-2">
                        {(latestAnalysis.insights || []).slice(0, 1).map((insight: any, i: number) => (
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
                        {(latestAnalysis.nextSteps || []).slice(0, 3).map((step: any, i: number) => (
                          <li key={i} className="text-xs font-medium flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              {step}
                          </li>
                        ))}
                      </ul>
                  </GlassCard>
                </div>
              )}
            </div>

            {/* SECONDARY ACTION CARDS */}
            {!isCompact && (
              <div className="lg:col-span-4 space-y-6 h-full">
                <div className="flex items-center justify-between px-2">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Приоритетные задачи</h5>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                    {(latestAnalysis.recommendations || []).slice(0, 4).map((rec: any, idx: number) => (
                      <motion.div
                        key={rec.id || idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <GlassCard 
                          className={cn(
                            "p-5 border-white/5 transition-all duration-300 group relative overflow-hidden active:scale-[0.98] select-none",
                            rec.priority === AI_PRIORITY.HIGH ? "hover:border-red-500/30 hover:bg-red-500/5" :
                            rec.priority === AI_PRIORITY.MEDIUM ? "hover:border-primary/30 hover:bg-primary/5" :
                            "hover:border-blue-500/30 hover:bg-blue-500/5"
                          )}
                        >
                          {/* Priority Indicator Line */}
                          <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-1",
                            rec.priority === AI_PRIORITY.HIGH ? "bg-red-500/50" :
                            rec.priority === AI_PRIORITY.MEDIUM ? "bg-primary/50" :
                            "bg-blue-500/50"
                          )} />

                          <div className="flex items-center justify-between mb-3">
                             <div className={cn(
                               "p-2 rounded-xl border transition-colors",
                               rec.type === AI_RECOMMENDATION_TYPE.NUTRITION ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                               rec.type === AI_RECOMMENDATION_TYPE.RECOVERY ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                               "bg-primary/10 text-primary border-primary/20"
                             )}>
                               {getIcon(rec.type)}
                             </div>
                             
                             <div className={cn(
                               "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border",
                               rec.priority === AI_PRIORITY.HIGH ? "bg-red-500/10 text-red-400 border-red-500/20" :
                               rec.priority === AI_PRIORITY.MEDIUM ? "bg-primary/10 text-primary border-primary/20" :
                               "bg-blue-500/10 text-blue-400 border-blue-500/20"
                             )}>
                               {rec.priority === AI_PRIORITY.HIGH ? '🔥 Critical' :
                                rec.priority === AI_PRIORITY.MEDIUM ? '⚡ Suggested' : '💡 Optimizing'}
                             </div>
                          </div>

                          <p className="text-xs font-black uppercase tracking-tight leading-tight mb-2 group-hover:text-primary transition-colors">{rec.text}</p>
                          
                          {rec.reason && (
                            <p className="text-[10px] text-muted-foreground/80 font-medium leading-relaxed mb-4">
                              {rec.reason}
                            </p>
                          )}

                          {rec.action && (
                            <button
                              onClick={() => handleRecommendationAction(rec)}
                              className={cn(
                                "w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all border",
                                rec.priority === AI_PRIORITY.HIGH ? "bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/20 hover:scale-[1.02]" :
                                "bg-white/5 text-foreground hover:bg-white/10 border-white/10 hover:border-white/20"
                              )}
                            >
                              {rec.action.label}
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </GlassCard>
                      </motion.div>
                    ))}
                </div>

                {latestAnalysis.mainRisk && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-red-500/5 border border-red-500/20 rounded-[2.5rem] relative overflow-hidden group hover:bg-red-500/10 transition-colors"
                  >
                      <div className="absolute -right-2 -bottom-2 opacity-5 scale-150 rotate-12 transition-transform group-hover:scale-[1.7]">
                        <AlertTriangle className="w-16 h-16 text-red-500" />
                      </div>
                      <div className="flex items-center gap-2 text-red-400 mb-3 relative z-10">
                         <AlertTriangle className="w-3.5 h-3.5" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Критический риск</span>
                      </div>
                      <p className="text-sm font-bold leading-tight text-red-200/90 relative z-10">{latestAnalysis.mainRisk}</p>
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
