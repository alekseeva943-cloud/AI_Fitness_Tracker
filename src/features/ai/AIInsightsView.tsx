import React from 'react';
import { useFitnessStore } from '../../store/useFitnessStore';
import { AIAnalyst } from '../analytics/components/AIAnalyst';
import { Sparkles, Brain, ShieldCheck, TrendingUp } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

import { AIChat } from './components/AIChat';

export const AIInsightsView: React.FC = () => {
  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full w-fit">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Advanced Analysis Active</span>
          </div>
          <h1 className="text-5xl font-display font-medium tracking-tight">AI Консультант</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Ваш персональный цифровой коуч, который знает о вашем прогрессе всё. 
            Мы анализируем сотни параметров, чтобы найти кратчайший путь к вашей цели.
          </p>
        </div>
        
        <div className="hidden lg:flex gap-4">
           <div className="p-4 bg-white/5 rounded-3xl border border-white/5 text-center px-8">
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Точность</p>
              <p className="text-2xl font-display font-medium">94.8%</p>
           </div>
           <div className="p-4 bg-white/5 rounded-3xl border border-white/5 text-center px-8">
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Параметров</p>
              <p className="text-2xl font-display font-medium">120+</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3 space-y-12">
          <AIAnalyst />
        </div>
        <div className="lg:col-span-2">
          <AIChat />
        </div>
      </div>

      {/* Methodology Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-white/5">
           <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                 <Brain className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-widest">Аналитическая модель</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                 Использует глубокое обучение для выявления нелинейных зависимостей между питанием, сном и интенсивностью тренировок.
              </p>
           </div>
           <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                 <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-widest">Прогнозирование</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                 Алгоритмы предсказывают возможные плато за 10-14 дней до их наступления, позволяя вовремя скорректировать программу.
              </p>
           </div>
           <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                 <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-widest">Персонализация</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                 Каждая рекомендация учитывает ваши индивидуальные особенности: тип телосложения, стаж тренировок и историю травм.
              </p>
           </div>
        </div>
      </div>
  );
};
