
import React from 'react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Coffee, Zap, Moon, Activity, Flame } from 'lucide-react';
import { useFitnessStore, useProfile } from '../../../store/useFitnessStore';

export const LifestyleSection: React.FC = () => {
  const profile = useProfile();
  const updateProfile = useFitnessStore(state => state.updateProfile);

  if (!profile) return null;

  return (
    <GlassCard className="p-8 space-y-8">
      <div className="flex items-center gap-3">
        <Moon className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold tracking-tight">Образ жизни и отдых</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
           <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] uppercase font-black text-muted-foreground tracking-widest">
                 Сон (часов в сутки)
                 <span className="text-primary font-bold">{profile.sleepAverage || 0}ч</span>
              </div>
              <input 
                type="range"
                min="4"
                max="12"
                step="0.5"
                value={profile.sleepAverage || 7}
                onChange={e => updateProfile({ sleepAverage: parseFloat(e.target.value) })}
                className="w-full accent-primary bg-white/5 h-2 rounded-lg appearance-none cursor-pointer"
              />
           </div>

           <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] uppercase font-black text-muted-foreground tracking-widest">
                 Уровень стресса
                 <span className={`font-bold ${
                   profile.stressLevel && profile.stressLevel > 7 ? 'text-red-500' : 'text-primary'
                 }`}>{profile.stressLevel || 1}/10</span>
              </div>
              <input 
                type="range"
                min="1"
                max="10"
                value={profile.stressLevel || 1}
                onChange={e => updateProfile({ stressLevel: parseInt(e.target.value) })}
                className="w-full accent-primary bg-white/5 h-2 rounded-lg appearance-none cursor-pointer"
              />
           </div>
        </div>

        <div className="space-y-4">
           <div className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Заметки о питании</div>
           <textarea 
             placeholder="Любите ли вы завтракать? Есть ли предпочтения в еде? Ограничения?"
             value={profile.nutritionNotes}
             onChange={e => updateProfile({ nutritionNotes: e.target.value })}
             className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-primary/50 focus:outline-hidden resize-none leading-relaxed"
           />
        </div>
      </div>

      <div className="pt-6 border-t border-white/5">
         <div className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-4">Восстановление</div>
         <textarea 
           placeholder="Как вы чувствуете себя после тренировок? Как быстро проходит усталость?"
           value={profile.recoveryNotes}
           onChange={e => updateProfile({ recoveryNotes: e.target.value })}
           className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-primary/50 focus:outline-hidden resize-none leading-relaxed"
         />
      </div>
    </GlassCard>
  );
};
