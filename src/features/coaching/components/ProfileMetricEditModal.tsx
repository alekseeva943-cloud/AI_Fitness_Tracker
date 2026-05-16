import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Clock, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GradientButton } from '../../../components/ui/GradientButton';
import { useFitnessStore } from '../../../store/useFitnessStore';
import { cn } from '../../../lib/utils';

interface ProfileMetricEditModalProps {
  onClose: () => void;
  metric: 'sleep' | 'stress' | 'readiness';
}

export const ProfileMetricEditModal: React.FC<ProfileMetricEditModalProps> = ({ onClose, metric }) => {
  const profile = useFitnessStore(state => state.profile);
  const updateProfile = useFitnessStore(state => state.updateProfile);
  
  const [value, setValue] = useState(
    metric === 'sleep' ? profile?.sleepAverage || 7.5 :
    metric === 'stress' ? profile?.stressLevel || 4 : 85
  );

  const handleSave = () => {
    if (metric === 'sleep') updateProfile({ sleepAverage: value });
    if (metric === 'stress') updateProfile({ stressLevel: value });
    // readiness is usually derived but we can simulate updating it
    onClose();
  };

  const title = metric === 'sleep' ? 'Качество сна' : metric === 'stress' ? 'Уровень стресса' : 'Готовность';
  const unit = metric === 'sleep' ? 'ч' : '/10';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-sm"
      >
        <GlassCard className="border-white/10 p-8 space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold uppercase">{title}</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all"><X className="w-5 h-5" /></button>
           </div>

           <div className="flex flex-col items-center gap-6">
              <div className="text-6xl font-display font-black text-primary">
                 {value}{unit}
              </div>
              <input 
                type="range" 
                min={metric === 'sleep' ? 4 : 1} 
                max={metric === 'sleep' ? 12 : 10} 
                step={metric === 'sleep' ? 0.5 : 1}
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between w-full text-[10px] font-black uppercase text-muted-foreground/40 px-2">
                 <span>Min</span>
                 <span>Max</span>
              </div>
           </div>

           <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                 <Zap className="w-3 h-3" />
                 <span className="text-[10px] font-black uppercase">AI Insight</span>
              </div>
              <p className="text-[10px] text-primary/80 font-medium leading-relaxed italic">
                 {metric === 'sleep' ? 'Увеличение сна на 30 мин повысит твое восстановление на 12%.' : 'Текущий уровень стресса требует снижения интенсивности вечерней сессии.'}
              </p>
           </div>

           <GradientButton onClick={handleSave} className="w-full h-14 text-[10px] font-black uppercase">
              <Save className="w-4 h-4 mr-2" />
              СОХРАНИТЬ И АДАПТИРОВАТЬ
           </GradientButton>
        </GlassCard>
      </motion.div>
    </div>
  );
};
