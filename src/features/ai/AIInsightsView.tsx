import React from 'react';
import { useFitnessStore, useAnalyses, useAnalysisRequest } from '../../store/useFitnessStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientButton } from '../../components/ui/GradientButton';
import { selectAnalyticsSummary } from '../analytics/selectors/fitnessSelectors';
import { AIRequestManager } from '../../services/requests/aiRequests';
import { Sparkles, MessageSquare, History, Bookmark, TrendingUp, Dumbbell, Apple, Clock } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';

export const AIInsightsView: React.FC = () => {
  const state = useFitnessStore();
  const summary = selectAnalyticsSummary(state);
  const analyses = useAnalyses();
  const { status } = useAnalysisRequest();
  
  const loading = status === 'loading';

  const handleDeepAnalysis = async () => {
    if (!summary) return;
    try {
      await AIRequestManager.performDeepAnalysis(summary);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'EXERCISE': return <Dumbbell className="w-5 h-5" />;
      case 'NUTRITION': return <Apple className="w-5 h-5" />;
      case 'RECOVERY': return <Clock className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-medium tracking-tight">AI Консультант</h1>
          <p className="text-muted-foreground">Персональные рекомендации на основе ваших данных</p>
        </div>
        <GradientButton onClick={handleDeepAnalysis} disabled={loading || !summary} className="flex items-center gap-2">
          {loading ? (
            <Sparkles className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          {loading ? 'Анализирую...' : 'Запустить анализ'}
        </GradientButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {analyses.length > 0 ? (
            <div className="space-y-6">
              <GlassCard className="p-8 border-primary/20 bg-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                   <Sparkles className="w-32 h-32 text-primary" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-2 text-primary">
                    <History className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">Последний инсайт • {formatDate(analyses[0].id)}</span>
                  </div>
                  <p className="text-xl font-medium leading-relaxed italic">
                    "{analyses[0].summary}"
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {analyses[0].recommendations.map((rec, idx) => (
                      <div key={idx} className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                        <div className="flex items-center gap-2 text-primary">
                          {getIcon(rec.type)}
                          <span className="text-[10px] font-bold uppercase tracking-widest">{rec.priority} PRIORITY</span>
                        </div>
                        <p className="text-sm leading-relaxed">{rec.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2 px-2">
                  <Bookmark className="w-5 h-5" />
                   Ранее предложено
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analyses.slice(1, 5).map((analysis) => (
                    <GlassCard key={analysis.id} className="p-6 space-y-4 hover:border-primary/30 transition-all cursor-pointer">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                         {formatDate(analysis.id)}
                      </div>
                      <p className="text-sm line-clamp-3 italic opacity-80">
                         "{analysis.summary}"
                      </p>
                    </GlassCard>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <GlassCard className="py-20 text-center glass rounded-[2.5rem] border-2 border-dashed border-white/5">
              <Sparkles className="w-16 h-16 text-primary/20 mx-auto mb-6" />
              <h2 className="text-2xl font-display font-medium mb-2">Готов к анализу</h2>
              <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                Нажмите кнопку выше, чтобы ИИ проанализировал вашу активность и составил план действий.
              </p>
            </GlassCard>
          )}
        </div>

        <aside className="space-y-6">
          <GlassCard className="p-6 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Как это работает</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Наш ИИ анализирует ваш вес, объемы и тип тренировок, чтобы выявить паттерны. 
              Он может предсказать плато и предложить изменения в диете за 2 недели до того, как прогресс остановится.
            </p>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Текущий статус</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Данные</span>
                <span className="text-green-400">Актуальны</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Точность ИИ</span>
                <span className="text-primary">94%</span>
              </div>
            </div>
          </GlassCard>
        </aside>
      </div>
    </div>
  );
};
