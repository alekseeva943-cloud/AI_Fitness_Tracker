import React from "react";
import { GlassCard } from "../../../components/ui/GlassCard";
import { Sparkles, TrendingUp, Apple, Dumbbell, AlertTriangle, Zap, CheckCircle2, MessageSquare, Brain } from "lucide-react";
import { GradientButton } from "../../../components/ui/GradientButton";
import { useFitnessStore } from "../../../store/useFitnessStore";
import { selectAnalyticsSummary } from "../../analytics/selectors/fitnessSelectors";
import { AIActions } from "../../../ai/orchestrator/ai-actions";
import { cn, formatDate } from "../../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { AI_RECOMMENDATION_TYPE, AI_PRIORITY, AI_TREND } from "../../../constants/ai";

export const AIRecommendationsSection: React.FC = () => {
  const state = useFitnessStore();
  const summary = selectAnalyticsSummary(state);
  const { analyses, analysisRequest } = state;
  
  const loading = analysisRequest.status === 'loading';
  const error = analysisRequest.error;

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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-2xl font-display font-medium flex items-center gap-2 italic uppercase tracking-tighter">
            <Brain className="w-6 h-6 text-primary" />
            AI Коучинг
          </h3>
          <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Умные рекомендации на основе ваших данных</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <GlassCard key={i} className="p-8 h-56 animate-pulse bg-white/5 border-white/5 flex flex-col justify-between">
                 <div className="flex justify-between items-center">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl" />
                    <div className="w-16 h-4 bg-white/10 rounded-full" />
                 </div>
                 <div className="space-y-2">
                    <div className="w-full h-4 bg-white/10 rounded" />
                    <div className="w-3/4 h-4 bg-white/10 rounded" />
                 </div>
              </GlassCard>
            ))}
          </div>
        ) : latestAnalysis ? (
          <div className="space-y-6">
            {/* Status Banner */}
            <GlassCard className="p-8 bg-linear-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 relative overflow-hidden group">
               <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                  <TrendingUp className="w-32 h-32" />
               </div>
               
               <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
                  <div className={cn(
                    "w-20 h-20 rounded-[2.5rem] flex items-center justify-center shrink-0 border-2",
                    latestAnalysis.trend === AI_TREND.IMPROVING ? "bg-green-500/10 border-green-500/20 text-green-400" :
                    latestAnalysis.trend === AI_TREND.DECLINING ? "bg-red-500/10 border-red-500/20 text-red-400" :
                    "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                  )}>
                     {latestAnalysis.trend === AI_TREND.IMPROVING ? <TrendingUp className="w-10 h-10" /> :
                      latestAnalysis.trend === AI_TREND.DECLINING ? <AlertTriangle className="w-10 h-10" /> :
                      <TrendingUp className="w-10 h-10 rotate-45" />}
                  </div>
                  
                  <div className="space-y-2 flex-1">
                     <div className="flex items-center gap-3">
                        <h4 className="text-2xl font-display font-black italic uppercase tracking-tighter">Главный инсайт</h4>
                        <span className="text-[10px] font-mono opacity-50">{formatDate(latestAnalysis.date)}</span>
                     </div>
                     <p className="text-lg leading-relaxed text-foreground/90 font-medium">"{latestAnalysis.summary}"</p>
                  </div>
                  
                  <div className="flex flex-col items-center md:items-end gap-2">
                     <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Тренд месяца</div>
                     <div className={cn(
                       "px-4 py-2 rounded-2xl text-xl font-display font-black italic border shadow-2xl",
                       latestAnalysis.trend === AI_TREND.IMPROVING ? "bg-green-500/20 border-green-500/40 text-green-400 shadow-green-500/10" :
                       latestAnalysis.trend === AI_TREND.DECLINING ? "bg-red-500/20 border-red-500/40 text-red-400 shadow-red-500/10" :
                       "bg-yellow-500/20 border-yellow-500/40 text-yellow-400 shadow-yellow-500/10"
                     )}>
                        {latestAnalysis.trend === AI_TREND.IMPROVING ? '+ ОПТИМАЛЬНО' : 
                         latestAnalysis.trend === AI_TREND.DECLINING ? '+ ВНИМАНИЕ' : '+ СТАБИЛЬНО'}
                     </div>
                  </div>
               </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(latestAnalysis.recommendations || []).slice(0, 4).map((rec: any, idx: number) => (
                <GlassCard 
                  key={rec.id} 
                  delay={idx * 0.1}
                  className="p-6 flex flex-col justify-between hover:bg-white/10 transition-all border-white/5 active:scale-[0.98] group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                      "p-3 rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110",
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
                  <div className="space-y-2">
                     <p className="text-sm font-bold leading-tight line-clamp-3">{rec.text}</p>
                     {rec.reason && (
                       <p className="text-[10px] text-muted-foreground italic border-l border-white/20 pl-2 leading-tight">
                         {rec.reason}
                       </p>
                     )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-20 text-center glass rounded-[2.5rem] border-2 border-dashed border-white/5 space-y-4">
            <div className="relative inline-block">
               <Sparkles className="w-16 h-16 text-primary/10 mx-auto" />
               <Brain className="w-8 h-8 text-primary/20 absolute -top-2 -right-2" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold uppercase tracking-tight italic opacity-40">Система готова к работе</p>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">Нажмите кнопку выше, чтобы запустить глубокий анализ вашей прогрессии и получить рекомендации.</p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
