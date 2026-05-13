import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings2, ChevronDown, ChevronUp, Save, Info, Sparkles, Scale, Activity, Plus, Trash2, Zap, Ruler, Heart, Clock } from 'lucide-react';
import { useFitnessStore } from '../../../store/useFitnessStore';
import { METRICS, MetricCategory } from '../../../constants/metrics';
import { cn } from '../../../lib/utils';
import { MetricBaseline } from '../../../types';

export const BaselineParameters: React.FC = () => {
  const { profile, updateBaseline, updateProfile } = useFitnessStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  const baselines = profile?.baselines || [];

  const handleUpdateMetric = (id: string, value: number) => {
    const existing = baselines.find(b => b.id === id);
    if (existing) {
      updateBaseline({ ...existing, value });
    } else {
      // If it's a standard metric not yet in baselines
      const metricDef = Object.values(METRICS).find(m => m.id === id);
      if (metricDef) {
        updateBaseline({
          id,
          name: metricDef.label,
          value,
          unit: metricDef.unit,
          date: new Date().toISOString()
        });
      }
    }
  };

  const handleAddCustomMetric = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = `custom_${crypto.randomUUID()}`;
    const name = formData.get('name') as string;
    const value = Number(formData.get('value'));
    const unit = formData.get('unit') as string;

    updateBaseline({
      id,
      name,
      value,
      unit,
      date: new Date().toISOString(),
      isCustom: true
    });
    setShowCustomModal(false);
  };

  const handleRemoveMetric = (id: string) => {
    if (profile) {
      const newBaselines = profile.baselines.filter(b => b.id !== id);
      updateProfile({ baselines: newBaselines });
    }
  };

  const categories: { id: MetricCategory | 'CUSTOM'; label: string; icon: React.ReactNode }[] = [
    { id: 'BODY', label: 'Тело', icon: <Scale className="w-3.5 h-3.5" /> },
    { id: 'STRENGTH', label: 'Сила', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'CARDIO', label: 'Кардио', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'CUSTOM', label: 'Свои метрики', icon: <Plus className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-white/5 rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-all group"
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(223,255,0,0.1)]">
            <Settings2 className="w-7 h-7" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-black uppercase tracking-[0.2em] leading-none text-white">Базовые показатели</h3>
            <p className="text-xs text-primary/80 mt-2 font-bold tracking-tight">Централизованный профиль твоей точки отсчета</p>
          </div>
        </div>
        <div className="p-2 rounded-full bg-white/5 group-hover:bg-primary/20 transition-colors">
          {isOpen ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-8 bg-secondary/20 rounded-[3rem] border border-white/5 space-y-10 mb-4 backdrop-blur-xl">
              <div className="flex items-start gap-4 p-5 bg-primary/5 rounded-3xl border border-primary/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                  <Sparkles className="w-16 h-16 text-primary" />
                </div>
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-primary/80 leading-relaxed font-semibold">
                  Эти данные — фундамент вашей аналитики. AI использует их для расчета прогресса, построения прогнозов и персонализации рекомендаций. Поддерживайте их в актуальном состоянии.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
                {categories.map((cat) => (
                  <div key={cat.id} className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                       <div className="flex items-center gap-3">
                        <span className="text-primary">{cat.icon}</span>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/80">{cat.label}</h4>
                      </div>
                      {cat.id === 'CUSTOM' && (
                        <button 
                          onClick={() => setShowCustomModal(true)}
                          className="p-2 bg-primary/10 hover:bg-primary text-primary hover:text-black rounded-xl transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {cat.id === 'CUSTOM' ? (
                        baselines.filter(b => b.isCustom).map(metric => (
                          <div key={metric.id} className="p-4 bg-background/30 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-background/50 transition-all">
                             <div>
                               <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{metric.unit}</p>
                               <p className="text-sm font-bold">{metric.name}</p>
                             </div>
                             <div className="flex items-center gap-3">
                               <input
                                  type="number"
                                  value={metric.value}
                                  onChange={(e) => handleUpdateMetric(metric.id, Number(e.target.value))}
                                  className="w-20 bg-background/40 border border-white/10 rounded-xl px-3 py-2 text-right font-bold outline-none focus:border-primary/40 transition-all text-sm"
                               />
                               <button 
                                 onClick={() => handleRemoveMetric(metric.id)}
                                 className="p-2 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             </div>
                          </div>
                        ))
                      ) : (
                        Object.values(METRICS)
                          .filter(m => m.category === cat.id)
                          .map(metric => {
                            const baseline = baselines.find(b => b.id === metric.id);
                            return (
                              <div key={metric.id} className="space-y-3 group">
                                <div className="flex justify-between items-center px-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg group-hover:scale-125 transition-transform">{metric.icon}</span>
                                    <label className="text-[10px] font-black text-foreground uppercase tracking-widest group-focus-within:text-primary transition-colors">{metric.label}</label>
                                  </div>
                                  <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{metric.unit}</span>
                                </div>
                                <div className="relative">
                                  <input
                                    type="number"
                                    step={metric.id === 'weight' ? '0.1' : '1'}
                                    value={baseline?.value || ''}
                                    onChange={(e) => handleUpdateMetric(metric.id, Number(e.target.value))}
                                    placeholder={metric.placeholder}
                                    className="w-full bg-background border border-white/10 rounded-2xl px-6 py-4 text-lg font-black outline-none focus:border-primary/50 focus:bg-background/80 transition-all shadow-2xl text-center placeholder:text-muted-foreground/20"
                                  />
                                </div>
                              </div>
                            );
                          })
                      )}
                      {cat.id === 'CUSTOM' && baselines.filter(b => b.isCustom).length === 0 && (
                        <p className="text-[10px] text-muted-foreground/40 text-center uppercase tracking-widest py-4 border border-dashed border-white/5 rounded-2xl">Нет своих метрик</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCustomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
              onClick={() => setShowCustomModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-secondary border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Plus className="w-32 h-32 text-primary" />
              </div>
              
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Plus className="text-primary w-6 h-6" />
                Своя метрика
              </h3>
              
              <form onSubmit={handleAddCustomMetric} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Название</label>
                  <input 
                    name="name" 
                    required 
                    placeholder="Напр: Объем бицепса, Время 100м..."
                    className="w-full bg-background/40 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-primary/50 transition-all font-medium"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Значение</label>
                    <input 
                      name="value" 
                      type="number" 
                      step="0.1" 
                      required 
                      placeholder="0.0"
                      className="w-full bg-background/40 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-primary/50 transition-all font-bold text-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Ед. изм.</label>
                    <input 
                      name="unit" 
                      required 
                      placeholder="см, сек, %..."
                      className="w-full bg-background/40 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-primary/50 transition-all font-bold text-center"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="flex-1 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-white/5 transition-all"
                  >
                    Отмена
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-primary text-black px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_5px_15px_rgba(223,255,0,0.2)]"
                  >
                    Добавить
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
