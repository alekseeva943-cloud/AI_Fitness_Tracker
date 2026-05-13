import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings2, ChevronDown, ChevronUp, Save, Info, Sparkles, Scale, Activity } from 'lucide-react';
import { useFitnessStore } from '../../../store/useFitnessStore';
import { METRICS, MetricCategory } from '../../../constants/metrics';
import { cn } from '../../../lib/utils';

export const BaselineParameters: React.FC = () => {
  const { profile, updateProfile } = useFitnessStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localBaselines, setLocalBaselines] = useState<Record<string, number>>(profile?.baselines || {});

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate slight delay for premium feel
    await new Promise(r => setTimeout(r, 600));
    updateProfile({ baselines: localBaselines });
    setIsSaving(false);
  };

  const categories: { id: MetricCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'BODY', label: 'Тело', icon: <Scale className="w-3 h-3" /> },
    { id: 'STRENGTH', label: 'Сила', icon: <Activity className="w-3 h-3" /> },
    { id: 'CARDIO', label: 'Кардио', icon: <Activity className="w-3 h-3" /> },
  ];

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Settings2 className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] leading-none">Базовые показатели</h3>
            <p className="text-[10px] text-muted-foreground/60 mt-2">Твоя точка отсчета для AI аналитики</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-8 bg-secondary/20 rounded-[2.5rem] border border-white/5 space-y-8 mb-4">
              <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-primary/80 leading-relaxed font-medium">
                  Эти данные используются как Baseline для построения прогнозов и AI-рекомендаций. 
                  Укажите свои показатели на момент начала использования приложения.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {categories.map((cat) => (
                  <div key={cat.id} className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-primary">{cat.icon}</span>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{cat.label}</h4>
                    </div>
                    
                    <div className="space-y-3">
                      {Object.values(METRICS)
                        .filter(m => m.category === cat.id)
                        .map(metric => (
                          <div key={metric.id} className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <div className="flex justify-between items-center px-1">
                              <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{metric.label}</label>
                              <span className="text-[8px] font-black text-primary/30 uppercase">{metric.unit}</span>
                            </div>
                            <input
                              type="number"
                              step={metric.id === 'weight' ? '0.1' : '1'}
                              value={localBaselines[metric.id] || ''}
                              onChange={(e) => setLocalBaselines({ ...localBaselines, [metric.id]: Number(e.target.value) })}
                              placeholder={metric.placeholder}
                              className="w-full bg-background/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary/40 focus:bg-background/60 transition-all"
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={cn(
                    "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3",
                    isSaving 
                      ? "bg-primary/20 text-primary cursor-default" 
                      : "bg-primary text-black hover:scale-[1.05] active:scale-95 shadow-[0_10px_30px_rgba(223,255,0,0.2)]"
                  )}
                >
                  {isSaving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                      Обновляем базу...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Сохранить Baseline
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
