import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, Loader2, CheckCircle2, Calendar, Target, Zap, Activity, Clock, Plus, ChevronRight } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GradientButton } from '../../../components/ui/GradientButton';
import { useFitnessStore } from '../../../store/useFitnessStore';
import { cn } from '../../../lib/utils';

export const AIWeekGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(0);
  const [generatedWeek, setGeneratedWeek] = useState<any[]>([]);
  const addPlanEvent = useFitnessStore(state => state.addPlanEvent);
  
  const steps = [
    { title: 'Анализ биометрии', icon: <Target className="w-4 h-4" /> },
    { title: 'Изучение прогресса', icon: <Activity className="w-4 h-4" /> },
    { title: 'Поиск паттернов', icon: <Brain className="w-4 h-4" /> },
    { title: 'Таргетирование цели', icon: <Zap className="w-4 h-4" /> },
    { title: 'Формирование тактики', icon: <Calendar className="w-4 h-4" /> }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStep(0);
    setGeneratedWeek([]);
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setStep(i + 1);
    }
    
    const today = new Date();
    const getNextDate = (days: number) => new Date(today.getTime() + days * 86400000).toISOString();
    
    const mockEvents = [
      { 
        id: crypto.randomUUID(), 
        title: 'Силовая: Грудь / Трицепс', 
        type: 'WORKOUT' as const, 
        duration: 60, 
        date: getNextDate(1),
        aiRationale: 'Твой уровень энергии высок по понедельникам. Последние 2 недели объем на грудные был ниже нормы.',
        metadata: { intensity: 'HIGH', targetMuscle: 'Грудь' },
        exercises: [
          { name: 'Жим штанги лежа', sets: 4, reps: '8-10', weight: '85кг', rest: '90s' },
          { name: 'Жим гантелей под углом', sets: 3, reps: '12', weight: '30кг', rest: '60s' }
        ]
      },
      { 
        id: crypto.randomUUID(), 
        title: 'Загрузка: Профицит 300ккал', 
        type: 'NUTRITION' as const, 
        date: getNextDate(1),
        nutrition: { calories: 3100, protein: 180, carbs: 400, fats: 80, recommendedFoods: ['Овсянка', 'Грудка', 'Паста'] }
      },
      { 
        id: crypto.randomUUID(), 
        title: 'Активное восстановление', 
        type: 'WORKOUT' as const, 
        duration: 30, 
        date: getNextDate(2),
        description: 'Легкое кардио (пульс 110-120) для улучшения кровотока.',
        metadata: { intensity: 'LOW', targetMuscle: 'Все тело' }
      },
      { 
        id: crypto.randomUUID(), 
        title: 'Силовая: Спина / Бицепс', 
        type: 'WORKOUT' as const, 
        duration: 75, 
        date: getNextDate(3),
        metadata: { intensity: 'HIGH', targetMuscle: 'Спина' },
        exercises: [
          { name: 'Подтягивания с весом', sets: 4, reps: '8', weight: '15кг', rest: '120s' },
          { name: 'Тяга штанги в наклоне', sets: 4, reps: '10', weight: '70кг', rest: '90s' }
        ]
      },
      { 
        id: crypto.randomUUID(), 
        title: 'Мобильность и МФР', 
        type: 'RECOVERY' as const, 
        duration: 40, 
        date: getNextDate(4),
        description: 'Работа над гибкостью плечевого пояса и ТБС.'
      },
      { 
        id: crypto.randomUUID(), 
        title: 'Силовая: Ноги (Акцент Квадрицепс)', 
        type: 'WORKOUT' as const, 
        duration: 90, 
        date: getNextDate(5),
        metadata: { intensity: 'HIGH', targetMuscle: 'Ноги' },
        exercises: [
          { name: 'Приседания со штангой', sets: 5, reps: '6-8', weight: '110кг', rest: '180s' },
          { name: 'Жим ногами', sets: 4, reps: '12', weight: '240кг', rest: '90s' }
        ]
      },
      { 
        id: crypto.randomUUID(), 
        title: 'Контрольный замер и Дефицит', 
        type: 'NUTRITION' as const, 
        date: getNextDate(6),
        nutrition: { calories: 2400, protein: 200, carbs: 200, fats: 70, recommendedFoods: ['Белая рыба', 'Овощи', 'Творог'] }
      }
    ];
    
    await new Promise(r => setTimeout(r, 400));
    setGeneratedWeek(mockEvents);
    setIsGenerating(false);
  };

  const applyPlan = () => {
    generatedWeek.forEach(event => {
      addPlanEvent({
        ...event,
        source: 'AI',
        status: 'PLANNED',
        isCompleted: false,
        createdAt: new Date().toISOString()
      });
    });
    setGeneratedWeek([]);
    alert('AI Стратегия успешно интегрирована в твой календарь. Я адаптировал нагрузку под твои текущие показатели готовности.');
  };

  const addSingleEvent = (event: any) => {
    addPlanEvent({
        ...event,
        source: 'AI',
        status: 'PLANNED',
        isCompleted: false,
        createdAt: new Date().toISOString()
    });
    setGeneratedWeek(prev => prev.filter(e => e.id !== event.id));
  };

  return (
    <div className="space-y-6 text-left">
      {!isGenerating && generatedWeek.length === 0 && (
        <GlassCard className="p-10 text-center border-dashed border-primary/20 bg-primary/5 group hover:border-primary/40 transition-all">
          <div className="w-20 h-20 rounded-3xl bg-primary text-black flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/20 group-hover:scale-110 transition-transform">
            <Brain className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-display font-bold mb-2">Тактическая генерация</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">
            ИИ проанализирует твой прогресс за последние 2 недели и составит оптимальный план действий.
          </p>
          <GradientButton onClick={handleGenerate} className="px-10 h-14 text-sm font-black uppercase tracking-widest">
            СГЕНЕРИРОВАТЬ AI-НЕДЕЛЮ
          </GradientButton>
        </GlassCard>
      )}

      {isGenerating && (
        <GlassCard className="p-10 space-y-8 bg-black/40 border-primary/20 overflow-hidden relative">
          <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <Brain className="w-6 h-6 text-primary absolute inset-0 m-auto animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-display uppercase tracking-widest text-primary">Стратегирование...</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-1 italic">
                Оптимизация для: {useFitnessStore.getState().goals.find(g => g.status === 'ACTIVE')?.title || 'Максимальной формы'}
              </p>
            </div>
          </div>

          <div className="space-y-3 max-w-xs mx-auto">
            {steps.map((s, i) => (
              <div key={i} className={cn(
                "flex items-center gap-4 p-3 rounded-xl border transition-all duration-500",
                step > i ? "bg-primary/20 border-primary/40 text-primary" : 
                step === i ? "bg-white/5 border-white/10 text-white animate-pulse" : 
                "bg-transparent border-transparent text-muted-foreground/20"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center border",
                  step > i ? "border-primary/20 bg-primary/10" : "border-white/5 bg-white/5"
                )}>
                  {step > i ? <CheckCircle2 className="w-4 h-4" /> : s.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest truncate">{s.title}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <AnimatePresence>
        {generatedWeek.length > 0 && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between px-2">
               <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-primary">ЧЕРТЕЖ НОВОЙ СТРАТЕГИИ</h3>
               <button onClick={() => setGeneratedWeek([])} className="text-[10px] text-muted-foreground hover:text-white uppercase font-bold">Сбросить</button>
            </div>
            
            <div className="grid gap-3">
              {generatedWeek.map((event, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={event.id}
                  className="p-5 rounded-[2rem] bg-primary/5 border border-primary/20 flex items-center justify-between group hover:bg-primary/10 transition-all cursor-default"
                >
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-primary border border-primary/20",
                      event.type === 'WORKOUT' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                    )}>
                      {event.type === 'WORKOUT' ? <Activity className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-lg font-bold font-display">{event.title}</p>
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(event.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span>• {event.duration || 'Daily'} мин</span>
                      </div>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => { e.stopPropagation(); addSingleEvent(event); }}
                        className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center hover:bg-primary hover:text-black transition-all"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <GradientButton onClick={applyPlan} className="w-full h-14 text-sm font-black uppercase tracking-widest group">
              ПРИМЕНИТЬ СТРАТЕГИЮ К КАЛЕНДАРЮ
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </GradientButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
