import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, CheckCircle2, AlertTriangle, Target, 
  TrendingUp, TrendingDown, Info, Activity
} from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { PlanEvent } from '../../../types';
import { cn } from '../../../lib/utils';

interface ExecutionScoreEngineProps {
  events: PlanEvent[];
}

export const ExecutionScoreEngine: React.FC<ExecutionScoreEngineProps> = ({ events }) => {
  const completed = events.filter(e => e.status === 'COMPLETED').length;
  const skipped = events.filter(e => e.status === 'SKIPPED').length;
  const total = events.length || 1;
  
  const rawScore = (completed / total) * 100;
  // Penalty for skipped, bonus for high intensity completion
  const penalty = skipped * 5;
  const highIntensityCompleted = events.filter(e => e.status === 'COMPLETED' && e.metadata?.intensity === 'HIGH').length;
  const bonus = highIntensityCompleted * 2;
  
  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore - penalty + bonus)));

  const getStatusColor = (score: number) => {
    if (score >= 90) return 'text-primary';
    if (score >= 75) return 'text-green-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const insights = [
    {
      condition: finalScore >= 90,
      title: 'Элитная дисциплина',
      description: 'Ты идешь впереди плана. Тело адаптируется к нагрузкам с максимальной скоростью.',
      icon: <Zap className="w-4 h-4" />,
      color: 'primary'
    },
    {
      condition: skipped > 0,
      title: 'Пропущенные сессии',
      description: `У тебя ${skipped} пропусков. Это снижает метаболический отклик на ${skipped * 3}%.`,
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'orange'
    },
    {
      condition: highIntensityCompleted > 2,
      title: 'Высокая интенсивность',
      description: 'Ты успешно закрываешь тяжелые воркауты. Рекордная гипертрофия на этой неделе.',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'primary'
    },
    {
      condition: finalScore < 60,
      title: 'Риск деградации',
      description: 'Текущий темп не достаточен для достижения цели в срок. Нужно пересмотреть график.',
      icon: <Activity className="w-4 h-4" />,
      color: 'red'
    }
  ].filter(i => i.condition);

  return (
    <GlassCard className="p-8 border-white/5 bg-secondary/20 h-full flex flex-col justify-between group overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
         <Activity className="w-32 h-32" />
      </div>
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
           <div className="space-y-1">
              <h3 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40">Execution Score</h3>
              <div className="flex items-end gap-3">
                 <span className={cn("text-6xl font-display font-black transition-all", getStatusColor(finalScore))}>
                    {finalScore}
                 </span>
                 <div className="pb-2 space-y-1">
                    <p className="text-muted-foreground font-black uppercase text-[10px]">Адаптивность</p>
                    <div className="flex gap-0.5">
                       {[1, 2, 3, 4, 5].map(i => (
                         <div key={i} className={cn(
                            "w-1 h-3 rounded-full",
                            i <= (finalScore / 20) ? "bg-primary" : "bg-white/10"
                         )} />
                       ))}
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="text-right">
              <p className="text-[8px] font-black uppercase text-muted-foreground/40 mb-1">Weekly Target</p>
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-primary text-xs font-black italic">
                 95%+
              </div>
           </div>
        </div>

        <div className="space-y-3">
           <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">Факторы влияния</p>
           <div className="space-y-2">
              {insights.map((insight, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-3 items-start p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all"
                >
                   <div className={cn(
                     "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
                     insight.color === 'primary' ? "bg-primary/10 border-primary/20 text-primary" :
                     insight.color === 'orange' ? "bg-orange-400/10 border-orange-400/20 text-orange-400" :
                     "bg-red-400/10 border-red-400/20 text-red-400"
                   )}>
                      {insight.icon}
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-tight">{insight.title}</p>
                      <p className="text-[10px] text-muted-foreground leading-snug">{insight.description}</p>
                   </div>
                </motion.div>
              ))}
              {insights.length === 0 && (
                <div className="py-4 text-center text-[10px] text-muted-foreground italic font-medium">
                  Жду больше данных о выполнении...
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-8 relative z-10">
         <div 
           className={cn("h-full transition-all duration-1000", finalScore >= 70 ? "bg-primary" : "bg-orange-400")}
           style={{ width: `${finalScore}%` }}
         />
      </div>
    </GlassCard>
  );
};
