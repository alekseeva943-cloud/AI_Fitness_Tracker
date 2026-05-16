import React from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GradientButton } from '../../../components/ui/GradientButton';
import { 
  Star, Activity, AlertTriangle, Target, 
  ChevronRight, Calendar, Sparkles, CheckCircle2,
  TrendingUp, ArrowUpRight, Zap
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useFitnessStore } from '../../../store/useFitnessStore';

export const AIWeeklyReview: React.FC = () => {
  const planEvents = useFitnessStore(state => state.planEvents);
  const addPlanEvent = useFitnessStore(state => state.addPlanEvent);
  
  const completedEvents = planEvents.filter(e => e.status === 'COMPLETED').length;
  const totalEvents = planEvents.length || 1;
  const adherence = Math.round((completedEvents / totalEvents) * 100);

  const handleAction = (type: string) => {
    if (type === 'ADD_WORKOUT') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(18, 0, 0, 0);

      addPlanEvent({
        id: crypto.randomUUID(),
        title: 'Дополнительная силовая (Акцент на спину)',
        type: 'WORKOUT',
        source: 'AI',
        date: tomorrow.toISOString(),
        description: 'AI рекомендует добавить объем для коррекции осанки и баланса.',
        isCompleted: false,
        isAI: true,
        status: 'PLANNED',
        exercises: [
          { name: 'Подтягивания широким хватом', sets: 4, reps: '8-12' },
          { name: 'Тяга штанги в наклоне', sets: 4, reps: '10' },
          { name: 'Горизонтальная тяга в блоке', sets: 3, reps: '15' }
        ],
        aiRationale: 'На прошлой неделе объем тяговых движений был на 20% ниже жимовых. Баланс необходим для здоровья плеч.',
        metadata: { category: 'STRENGTH', targetMuscle: 'BACK' },
        createdAt: new Date().toISOString()
      });
      alert('Тактическое действие выполнено: Тренировка добавлена в план!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <GlassCard className="p-0 border-primary/20 bg-primary/5 overflow-hidden shadow-2xl shadow-primary/5">
        <div className="bg-primary/10 p-8 border-b border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-primary text-black flex items-center justify-center shadow-[0_0_40px_rgba(223,255,0,0.4)]">
                 <Star className="w-8 h-8" />
              </div>
              <div>
                 <h2 className="text-3xl font-display font-black italic tracking-tight">Еженедельный отчет</h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mt-1">От твоего AI Стратега</p>
              </div>
           </div>
           <div className="text-right flex flex-col items-end">
              <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest mb-2 border border-primary/20">
                 Week 24 • Analysis Complete
              </div>
              <p className="text-sm font-bold opacity-60">12 мая — 18 мая, 2024</p>
           </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          {/* Greeting */}
          <div className="space-y-4 max-w-2xl">
             <p className="text-2xl font-medium leading-tight text-white/90">
                Привет, Александр. Мы завершили вторую неделю цикла «Максимальная мощь». 
                <span className="text-primary italic ml-2">Твои показатели говорят о том, что тело начало адаптироваться к нагрузкам.</span>
             </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem]">
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-4">Дисциплина плана</p>
                <div className="flex items-end gap-2">
                   <span className="text-4xl font-black font-display text-primary">{adherence}%</span>
                   <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 font-medium">+12% к прошлой неделе</p>
             </div>
             <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem]">
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-4">Силовой прогресс</p>
                <div className="flex items-end gap-2">
                   <span className="text-4xl font-black font-display text-white">+4.2%</span>
                   <ArrowUpRight className="w-5 h-5 text-primary mb-2" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 font-medium">Рост во всех базовых движениях</p>
             </div>
             <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem]">
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-4">Среднее время сна</p>
                <div className="flex items-end gap-2">
                   <span className="text-4xl font-black font-display text-orange-400">6.8ч</span>
                   <AlertTriangle className="w-5 h-5 text-orange-400 mb-2" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 font-medium">Ниже нормы на 15%</p>
             </div>
          </div>

          {/* Detailed Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                   </div>
                   <h4 className="text-xs font-black uppercase tracking-widest">Прорывы недели</h4>
                </div>
                <ul className="space-y-4">
                   {[
                     'Жим штанги: установлен новый рекорд (95кг на 5 повторений).',
                     'Стабильность: выполнены все 3 запланированные силовые сессии.',
                     'Восстановление: ЧСС покоя утром снизился до 58 уд/мин.'
                   ].map((text, i) => (
                     <li key={i} className="flex gap-3 text-sm text-muted-foreground border-l-2 border-white/5 pl-4 py-1">
                        <span className="text-primary font-black">0{i+1}</span>
                        {text}
                     </li>
                   ))}
                </ul>
             </div>

             <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                   </div>
                   <h4 className="text-xs font-black uppercase tracking-widest">Точки риска</h4>
                </div>
                <ul className="space-y-4">
                   {[
                     'Сон: дефицит восстановления может привести к плато на след. неделе.',
                     'Дисбаланс: объем тренировок спины отстал от грудных мышц на 20%.',
                     'Питание: в среду замечен резкий скачок калорийности.'
                   ].map((text, i) => (
                     <li key={i} className="flex gap-3 text-sm text-muted-foreground border-l-2 border-white/5 pl-4 py-1">
                        <span className="text-orange-400 font-black">0{i+1}</span>
                        {text}
                     </li>
                   ))}
                </ul>
             </div>
          </div>

          {/* AI Tactical Recommendations */}
          <div className="pt-12 border-t border-white/5 space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                   <Zap className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest">Тактические действия (Executable)</h4>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassCard className="p-6 border-primary/30 bg-primary/5 hover:border-primary/50 transition-all group flex flex-col justify-between">
                   <div className="space-y-2 mb-6">
                      <p className="text-xs font-bold text-primary italic">Рекомендация по балансу</p>
                      <h5 className="font-bold">Добавить сессию на спину</h5>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                         Для компенсации затянувшихся плеч и выравнивания объема тяг. AI составил план упражнений.
                      </p>
                   </div>
                   <GradientButton 
                     onClick={() => handleAction('ADD_WORKOUT')}
                     className="w-full h-11 text-[9px] font-black uppercase tracking-widest"
                   >
                      Добавить в план на завтра
                      <ChevronRight className="w-4 h-4 ml-auto" />
                   </GradientButton>
                </GlassCard>

                <GlassCard className="p-6 border-white/10 bg-white/5 hover:border-white/20 transition-all flex flex-col justify-between opacity-60">
                   <div className="space-y-2 mb-6">
                      <p className="text-xs font-bold text-muted-foreground italic">Рекомендация по режиму</p>
                      <h5 className="font-bold">Сдвинуть отбой на 23:00</h5>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                         Автоматическая установка напоминаний в Google Calendar для подготовки ко сну.
                      </p>
                   </div>
                   <GradientButton variant="outline" className="w-full h-11 text-[9px] font-black uppercase tracking-widest disabled:opacity-50" disabled>
                      Синхронизировать режим
                   </GradientButton>
                </GlassCard>
             </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-8 bg-black/20 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-3 grayscale opacity-40">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-[9px] font-black uppercase tracking-widest italic">AI Engine: Genesis-X9 • Coaching Layer 4.0</p>
           </div>
           <p className="text-[10px] text-muted-foreground font-medium">Сгенерировано 16 мая, 2024 в 10:15</p>
        </div>
      </GlassCard>
    </motion.div>
  );
};
