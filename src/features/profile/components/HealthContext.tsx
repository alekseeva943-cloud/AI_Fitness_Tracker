
import React, { useState } from 'react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Heart, Activity, Plus, X, ShieldAlert } from 'lucide-react';
import { useFitnessStore, useProfile } from '../../../store/useFitnessStore';

export const HealthContext: React.FC = () => {
  const profile = useProfile();
  const updateProfile = useFitnessStore(state => state.updateProfile);
  const [newInjury, setNewInjury] = useState('');

  if (!profile) return null;

  const addInjury = () => {
    if (!newInjury.trim()) return;
    const current = profile.injuries || [];
    updateProfile({ injuries: [...current, newInjury.trim()] });
    setNewInjury('');
  };

  const removeInjury = (index: number) => {
    const current = profile.injuries || [];
    updateProfile({ injuries: current.filter((_, i) => i !== index) });
  };

  return (
    <GlassCard className="p-8 space-y-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 translate-x-1/4 -translate-y-1/4 pointer-events-none">
         <ShieldAlert className="w-40 h-40 text-red-500" />
      </div>

      <div className="flex items-center gap-3">
        <Heart className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-bold tracking-tight">Здоровье и медицина</h3>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="space-y-4">
           <div className="text-[10px] uppercase font-black text-muted-foreground tracking-widest flex justify-between ml-1">
              Травмы и ограничения
              <span className="text-red-500/60 lowercase italic font-normal">видны вашему ИИ-тренеру</span>
           </div>
           
           <div className="flex flex-wrap gap-2">
              {(profile.injuries || []).map((injury, i) => (
                <div key={i} className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-2 rounded-xl text-xs font-bold animate-in zoom-in-50">
                   {injury}
                   <button onClick={() => removeInjury(i)} className="hover:text-white transition-colors">
                      <X className="w-3.5 h-3.5" />
                   </button>
                </div>
              ))}
              <div className="flex gap-2 w-full mt-2">
                 <input 
                   type="text"
                   placeholder="Напр., травма колена, слабые связки..."
                   value={newInjury}
                   onChange={e => setNewInjury(e.target.value)}
                   onKeyPress={e => e.key === 'Enter' && addInjury()}
                   className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-red-500/50 focus:outline-hidden placeholder:text-muted-foreground/30"
                 />
                 <button 
                   onClick={addInjury}
                   className="px-4 bg-red-500 text-white rounded-xl hover:bg-red-400 transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                 >
                    <Plus className="w-5 h-5" />
                 </button>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
           <div className="space-y-3">
              <div className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Хронические заболевания</div>
              <textarea 
                value={profile.chronicConditions?.join(', ') || ''}
                placeholder="Укажите, если есть особенности (напр. гипертония)"
                onChange={e => updateProfile({ chronicConditions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm h-24 focus:border-red-500/50 focus:outline-hidden resize-none leading-relaxed"
              />
           </div>
           <div className="space-y-3">
              <div className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Другие нюансы</div>
              <textarea 
                value={profile.limitations?.join(', ') || ''}
                placeholder="Что еще важно знать тренеру?"
                onChange={e => updateProfile({ limitations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm h-24 focus:border-red-500/50 focus:outline-hidden resize-none leading-relaxed"
              />
           </div>
        </div>
      </div>
    </GlassCard>
  );
};
