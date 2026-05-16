import React from 'react';
import { useFitnessStore } from '../../store/useFitnessStore';
import { AIAnalyst } from '../analytics/components/AIAnalyst';
import { Sparkles, Brain, ShieldCheck, TrendingUp } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

import { AIChat } from './components/AIChat';

export const AIInsightsView: React.FC = () => {
  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-primary/5 border border-primary/20 text-primary rounded-2xl w-fit">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Neural Link Active</span>
          </div>
          <h1 className="text-6xl font-display font-medium tracking-tighter leading-none">
            GENESIS <span className="text-primary italic">INTELLIGENCE</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl font-medium leading-relaxed">
            Ваш персональный цифровой коуч, агрегирующий данные о тренировках, 
            биометрии и восстановлении для построения оптимальной стратегии.
          </p>
        </div>
        
        <div className="flex gap-4">
           <div className="p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 text-center px-10 backdrop-blur-sm">
              <p className="text-[9px] uppercase font-black tracking-[0.3em] text-white/20 mb-2">System Accuracy</p>
              <p className="text-3xl font-display font-medium text-white italic">98.4%</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
        <div className="lg:col-span-3 space-y-16">
          <AIAnalyst />
        </div>
        <div className="lg:col-span-2">
          <AIChat />
        </div>
      </div>
    </div>
  );
};
