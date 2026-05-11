import React, { useState } from "react";
import { GlassCard } from "../../../components/ui/GlassCard";
import { Sparkles, MessageSquare, TrendingUp, Apple, Dumbbell, Loader2 } from "lucide-react";
import { GradientButton } from "../../../components/ui/GradientButton";
import { useFitnessStore, useAnalysisRequest } from "../../../store/useFitnessStore";
import { selectAnalyticsSummary } from "../../analytics/selectors/fitnessSelectors";
import { AIRequestManager } from "../../../services/requests/aiRequests";

export const AIRecommendationsSection: React.FC = () => {
  const [localResult, setLocalResult] = useState<any>(null);
  const state = useFitnessStore();
  const summary = selectAnalyticsSummary(state);
  const { status, error } = useAnalysisRequest();
  
  const loading = status === 'loading';

  const getIcon = (type: string) => {
    switch (type) {
      case 'EXERCISE': return <Dumbbell className="w-4 h-4" />;
      case 'DIET': return <Apple className="w-4 h-4" />;
      case 'MOTIVATION': return <Sparkles className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const handleDeepAnalysis = async () => {
    if (!summary) return;
    try {
      const analysis = await AIRequestManager.performDeepAnalysis(summary);
      if (analysis) setLocalResult(analysis);
    } catch (err) {
      console.error(err);
    }
  };

  // Use the latest analysis from store if available
  const latestAnalysis = state.analyses[0];
  const displayResult = localResult || latestAnalysis;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-medium flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Рекомендации ИИ
        </h3>
        <GradientButton 
          variant="outline" 
          size="sm" 
          onClick={handleDeepAnalysis}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
          Глубокий анализ
        </GradientButton>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          [1, 2].map(i => (
            <div key={i} className="glass rounded-[2rem] p-8 h-40 animate-pulse bg-white/5" />
          ))
        ) : displayResult?.recommendations ? (
          displayResult.recommendations.map((rec: any, idx: number) => (
            <GlassCard 
              key={idx} 
              delay={idx * 0.1}
              className="p-6 border-l-4 border-l-primary/30 hover:border-l-primary transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-primary">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    {getIcon(rec.type)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{rec.type === 'EXERCISE' ? 'Тренировки' : 'Питание'}</span>
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter",
                  rec.priority === 'HIGH' ? "bg-red-500/20 text-red-500" : "bg-primary/20 text-primary"
                )}>
                  {rec.priority === 'HIGH' ? 'Важно' : 'Совет'}
                </div>
              </div>
              <p className="text-sm font-medium leading-relaxed text-foreground/90">{rec.text}</p>
            </GlassCard>
          ))
        ) : (
          <div className="md:col-span-2 py-16 text-center glass rounded-[2.5rem] border-2 border-dashed border-white/5">
            <Sparkles className="w-10 h-10 text-primary/20 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm font-medium">Нажмите "Глубокий анализ" для получения персональных советов</p>
          </div>
        )}
      </div>

      {displayResult?.summary && (
        <GlassCard className="p-6 bg-primary/5 border-primary/20">
          <p className="text-sm italic leading-relaxed text-foreground/80">
            "{displayResult.summary}"
          </p>
        </GlassCard>
      )}
    </div>
  );
};
