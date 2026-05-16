import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFitnessStore } from '../../store/useFitnessStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientButton } from '../../components/ui/GradientButton';
import { 
  Brain, Sparkles, Calendar, Target, Activity, 
  MessageSquare, ChevronLeft, ChevronRight, CheckCircle2, 
  Zap, Clock, Trash2, Plus, ArrowRight, Star, User, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../../lib/utils';
import { AICalendar } from './components/AICalendar';
import { AIWeekGenerator } from './components/AIWeekGenerator';

import { AIWeeklyReview } from './components/AIWeeklyReview';

import { AICoachingChat } from './components/AICoachingChat';
import { ExecutionScoreEngine } from './components/ExecutionScoreEngine';
import { ProfileMetricEditModal } from './components/ProfileMetricEditModal';

export const CoachingView: React.FC = () => {
  const navigate = useNavigate();
  const profile = useFitnessStore(state => state.profile);
  const planEvents = useFitnessStore(state => state.planEvents);
  const goals = useFitnessStore(state => state.goals);
  const analyses = useFitnessStore(state => state.analyses);
  const togglePlanEvent = useFitnessStore(state => state.togglePlanEvent);
  const removePlanEvent = useFitnessStore(state => state.removePlanEvent);
  
  const [activeTab, setActiveTab] = useState<'plan' | 'review' | 'chat' | 'history'>('plan');
  const [loading, setLoading] = useState(false);
  const [editingMetric, setEditingMetric] = useState<'sleep' | 'stress' | 'readiness' | null>(null);
  
  const latestAnalysis = analyses[0];

  return (
    <div className="min-h-screen pb-20 space-y-8 animate-in fade-in duration-700 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-primary transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Вернуться в Дашборд
          </button>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 relative">
                <Brain className="w-7 h-7" />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary border-4 border-background animate-pulse" />
             </div>
             <div>
                <h1 className="text-4xl font-display font-medium tracking-tight italic">AI Coaching Workspace</h1>
                <p className="text-muted-foreground text-sm uppercase font-black tracking-widest mt-1 opacity-60">Персональный стратег и движок достижений</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/5 rounded-2xl">
          {[
            { id: 'plan', label: 'Тактический план', icon: <Calendar className="w-3.5 h-3.5" /> },
            { id: 'review', label: 'Еженедельный обзор', icon: <Star className="w-3.5 h-3.5" /> },
            { id: 'chat', label: 'Сессия с коучем', icon: <MessageSquare className="w-3.5 h-3.5" /> },
            { id: 'history', label: 'Память коуча', icon: <Clock className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                activeTab === tab.id ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          
          <AnimatePresence mode="wait">
            {activeTab === 'plan' && (
              <motion.div 
                key="plan"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* Tactical Plan Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <GlassCard className="p-8 border-primary/20 bg-primary/5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-1/4 -translate-y-1/4">
                         <Star className="w-24 h-24 text-primary" />
                      </div>
                      <div className="relative z-10 space-y-4">
                         <div className="flex items-center gap-2">
                           <div className="p-2 rounded-xl bg-primary text-black">
                             <Target className="w-4 h-4" />
                           </div>
                           <h3 className="text-[10px] uppercase font-black tracking-widest text-primary">Активная стратегия</h3>
                         </div>
                         <h4 className="text-2xl font-bold font-display">
                           {goals.find(g => g.status === 'ACTIVE')?.title || 'Стабилизация веса'}
                         </h4>
                         <p className="text-xs text-muted-foreground leading-relaxed">
                            {latestAnalysis?.summary || 'Твой коуч анализирует текущие показатели для формирования тактики на неделю.'}
                         </p>
                      </div>
                   </GlassCard>

                   <ExecutionScoreEngine events={planEvents} />
                </div>

                <div className="grid grid-cols-1 gap-8">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                         <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40">Календарь прогресса</h3>
                      </div>
                      <AICalendar />
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                         <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40">Стратегическая адаптация</h3>
                      </div>
                      <AIWeekGenerator />
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'review' && (
              <AIWeeklyReview />
            )}

            {activeTab === 'chat' && (
              <AICoachingChat />
            )}

            {activeTab === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-8"
              >
                 {/* Behavioral Patterns Section */}
                 <div className="space-y-4">
                    <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-primary px-2">Поведенческие паттерны и инсайты</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {useFitnessStore.getState().aiMemory.patterns.map((pattern: any) => (
                         <GlassCard key={pattern.id} className="p-6 border-white/5 hover:border-primary/20 transition-all flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                               {pattern.icon === 'Clock' ? <Clock className="w-4 h-4 text-primary" /> : 
                                pattern.icon === 'AlertTriangle' ? <AlertTriangle className="w-4 h-4 text-orange-400" /> :
                                <Brain className="w-4 h-4 text-cyan-400" />}
                            </div>
                            <div className="space-y-1">
                               <p className="text-xs font-black uppercase tracking-widest">{pattern.title}</p>
                               <p className="text-[11px] text-muted-foreground leading-relaxed">{pattern.description}</p>
                            </div>
                         </GlassCard>
                       ))}
                       {useFitnessStore.getState().aiMemory.patterns.length === 0 && (
                          <div className="col-span-full py-12 text-center opacity-40">
                             <p className="text-xs uppercase font-black tracking-widest">Паттерны еще не обнаружены</p>
                          </div>
                       )}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40 px-2">Слой памяти: Лог стратегий</h3>
                    <div className="grid gap-4">
                       {analyses.map((analysis, i) => (
                         <GlassCard key={analysis.id} className="p-6 border-white/5 hover:border-white/10 transition-all">
                            <div className="flex items-start justify-between mb-4">
                               <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-xl bg-white/5 text-muted-foreground">
                                     <Clock className="w-4 h-4" />
                                  </div>
                                  <div>
                                     <p className="text-xs font-black uppercase tracking-widest">{formatDate(analysis.date)}</p>
                                     <p className="text-[10px] text-muted-foreground/60">{analysis.trend}</p>
                                  </div>
                               </div>
                            </div>
                            <p className="text-sm font-medium leading-relaxed italic text-primary/80 mb-4">
                               "{analysis.summary}"
                            </p>
                            <div className="flex flex-wrap gap-2">
                               {analysis.recommendations.map((rec, j) => (
                                 <span key={j} className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                   {rec.type}
                                 </span>
                               ))}
                            </div>
                         </GlassCard>
                       ))}
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Sidebar Context Layer */}
        <div className="lg:col-span-4 space-y-8">
           <GlassCard className="p-8 space-y-6 border-white/5 sticky top-8">
              <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40">Контекст Коуча</h3>
              
              <div className="space-y-4">
                 <div 
                   onClick={() => setEditingMetric('sleep')}
                   className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all group"
                 >
                    <div className="space-y-0.5">
                       <p className="text-[8px] uppercase font-black tracking-widest text-muted-foreground/60">Качество сна</p>
                       <p className="text-sm font-black text-primary">{profile?.sleepAverage || 7.5}ч в ср.</p>
                    </div>
                    <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                       <Clock className="w-4 h-4" />
                    </div>
                 </div>

                 <div 
                   onClick={() => setEditingMetric('stress')}
                   className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all group"
                 >
                    <div className="space-y-0.5">
                       <p className="text-[8px] uppercase font-black tracking-widest text-muted-foreground/60">Уровень стресса</p>
                       <p className="text-sm font-black text-orange-400">{profile?.stressLevel || 4}/10</p>
                    </div>
                    <div className="p-2 rounded-xl bg-orange-400/10 text-orange-400 group-hover:scale-110 transition-transform">
                       <Zap className="w-4 h-4" />
                    </div>
                 </div>

                 <div 
                   onClick={() => setEditingMetric('readiness')}
                   className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all group"
                 >
                    <div className="space-y-0.5">
                       <p className="text-[8px] uppercase font-black tracking-widest text-muted-foreground/60">Дисциплина</p>
                       <p className="text-sm font-black text-green-400">Высокая</p>
                    </div>
                    <div className="p-2 rounded-xl bg-green-400/10 text-green-400 group-hover:scale-110 transition-transform">
                       <CheckCircle2 className="w-4 h-4" />
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                 <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Живые инсайты</h4>
                 <div className="space-y-3">
                    <div className="flex gap-3">
                       <div className="w-1 h-auto rounded-full bg-primary/40 shrink-0" />
                       <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">
                          Твой пульс восстанавливается быстрее. Это прямой признак роста кардио-выносливости.
                       </p>
                    </div>
                    <div className="flex gap-3">
                       <div className="w-1 h-auto rounded-full bg-orange-500/40 shrink-0" />
                       <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">
                          Сон был прерывистым последние 2 дня. Сегодня лучше снизить интенсивность на 15%.
                       </p>
                    </div>
                 </div>
              </div>

              <GradientButton 
                onClick={() => setActiveTab('plan')}
                className="w-full py-4 text-[10px] font-black uppercase tracking-widest group"
              >
                 <Sparkles className="w-4 h-4 mr-2" />
                 СГЕНЕРИРОВАТЬ ТАКТИКУ
                 <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </GradientButton>
           </GlassCard>
        </div>
      </div>

      <AnimatePresence>
         {editingMetric && (
            <ProfileMetricEditModal 
               metric={editingMetric} 
               onClose={() => setEditingMetric(null)} 
            />
         )}
      </AnimatePresence>
    </div>
  );
};
