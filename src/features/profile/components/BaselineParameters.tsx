
import React from 'react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Scale, Ruler, Zap, Activity, Plus, Trash2 } from 'lucide-react';
import { useFitnessStore, useProfile } from '../../../store/useFitnessStore';
import { MetricBaseline } from '../../../types';
import { METRICS } from '../../../constants/metrics';
import { formatWeight, formatDate } from '../../../lib/utils';

export const BaselineParameters: React.FC = () => {
  const profile = useProfile();
  const updateBaseline = useFitnessStore(state => state.updateBaseline);
  const removeBaseline = (id: string) => {
    if (!profile) return;
    const newBaselines = profile.baselines.filter(b => b.id !== id);
    useFitnessStore.getState().updateProfile({ baselines: newBaselines });
  };
  
  if (!profile) return null;

  const handleAddMetric = () => {
    const newBaseline: MetricBaseline = {
      id: crypto.randomUUID(),
      name: 'Новый показатель',
      value: 0,
      unit: 'ед.',
      date: new Date().toISOString()
    };
    updateBaseline(newBaseline);
  };

  return (
    <GlassCard className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Scale className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold tracking-tight">Базовые фитнес-показатели</h3>
        </div>
        <button
          onClick={handleAddMetric}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-xl hover:bg-primary/80 transition-all text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(223,255,0,0.3)]"
        >
          <Plus className="w-4 h-4" />
          Добавить
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(profile.baselines || []).map((baseline) => (
          <div key={baseline.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4 hover:border-primary/30 transition-all group relative overflow-hidden">
             <div className="flex justify-between items-center relative z-10">
                <input 
                   type="text"
                   value={baseline.name}
                   onChange={e => updateBaseline({ ...baseline, name: e.target.value })}
                   className="text-[10px] uppercase font-black tracking-widest text-muted-foreground bg-transparent border-b border-transparent focus:border-white/20 focus:outline-hidden w-2/3"
                />
                <button 
                  onClick={() => removeBaseline(baseline.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                >
                   <Trash2 className="w-4 h-4" />
                </button>
             </div>
             <div className="flex items-end gap-3 relative z-10">
                <input 
                   type="number"
                   value={baseline.value}
                   onChange={e => updateBaseline({ ...baseline, value: parseFloat(e.target.value) })}
                   className="text-3xl font-display font-black bg-transparent w-24 border-b-2 border-white/10 focus:border-primary focus:outline-hidden transition-all text-white"
                />
                <input 
                   type="text"
                   value={baseline.unit}
                   placeholder="кг"
                   onChange={e => updateBaseline({ ...baseline, unit: e.target.value })}
                   className="text-sm font-bold text-muted-foreground bg-transparent border-b border-white/10 focus:border-white/40 focus:outline-hidden w-16 pb-1"
                />
             </div>
             <div className="flex justify-between items-center text-[9px] text-muted-foreground/60 italic relative z-10 pt-2">
                <span>Зафиксировано:</span>
                <span>{formatDate(baseline.date)}</span>
             </div>
             
             {/* Subtle background decoration */}
             <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 translate-x-1/4 -translate-y-1/4 pointer-events-none">
                <Activity className="w-20 h-20" />
             </div>
          </div>
        ))}
      </div>

      {(!profile.baselines || profile.baselines.length === 0) && (
         <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-[2rem] text-muted-foreground space-y-4">
            <Activity className="w-12 h-12 mx-auto opacity-10" />
            <div className="space-y-1">
               <p className="text-sm font-bold text-white/50">Показатели не добавлены</p>
               <p className="text-xs max-w-[200px] mx-auto">Добавьте вес, жим лежа или другие базовые цифры для анализа.</p>
            </div>
         </div>
      )}
    </GlassCard>
  );
};
