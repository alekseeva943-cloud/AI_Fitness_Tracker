import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFitnessStore } from '../../store/useFitnessStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientButton } from '../../components/ui/GradientButton';
import { 
  Brain, Sparkles, Calendar, Target, Activity, 
  MessageSquare, ChevronLeft, ChevronRight, CheckCircle2, 
  Zap, Clock, Trash2, Plus, ArrowRight, Star, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../../lib/utils';
import { AIActions } from '../../ai/orchestrator/ai-actions';

export const CoachingView: React.FC = () => {
  const navigate = useNavigate();
  const profile = useFitnessStore(state => state.profile);
  const planEvents = useFitnessStore(state => state.planEvents);
  const goals = useFitnessStore(state => state.goals);
  const analyses = useFitnessStore(state => state.analyses);
  const togglePlanEvent = useFitnessStore(state => state.togglePlanEvent);
  const removePlanEvent = useFitnessStore(state => state.removePlanEvent);
  
  const [activeTab, setActiveTab] = useState<'plan' | 'chat' | 'history'>('plan');
  const [loading, setLoading] = useState(false);
  
  const latestAnalysis = analyses[0];

  return (
    <div className="min-h-screen pb-20 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-primary transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Вернуться в Dashboard
          </button>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 relative">
                <Brain className="w-7 h-7" />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary border-4 border-background animate-pulse" />
             </div>
             <div>
                <h1 className="text-4xl font-display font-medium tracking-tight">AI Coaching Workspace</h1>
                <p className="text-muted-foreground text-sm uppercase font-black tracking-widest mt-1 opacity-60">Personal Strategist & Execution Engine</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/5 rounded-2xl">
          {[
            { id: 'plan', label: 'Tactical Plan', icon: <Calendar className="w-3.5 h-3.5" /> },
            { id: 'chat', label: 'Coach Session', icon: <MessageSquare className="w-3.5 h-3.5" /> },
            { id: 'history', label: 'Memory Layer', icon: <Clock className="w-3.5 h-3.5" /> },
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
                           <h3 className="text-[10px] uppercase font-black tracking-widest text-primary">Current Execution Goal</h3>
                         </div>
                         <h4 className="text-2xl font-bold font-display">
                           {goals.find(g => g.status === 'ACTIVE')?.title || 'Стабилизация веса'}
                         </h4>
                         <p className="text-xs text-muted-foreground leading-relaxed">
                            {latestAnalysis?.summary || 'Твой коуч анализирует текущие показатели для формирования тактики на неделю.'}
                         </p>
                      </div>
                   </GlassCard>

                   <GlassCard className="p-8 border-white/5 bg-secondary/20 flex flex-col justify-between">
                      <div className="space-y-1">
                         <h3 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40">Execution Score</h3>
                         <div className="flex items-end gap-2">
                            <span className="text-5xl font-display font-black text-primary">
                               {Math.round((planEvents.filter(e => e.isCompleted).length / (planEvents.length || 1)) * 100)}%
                            </span>
                            <span className="text-muted-foreground font-black uppercase text-[10px] pb-2">Done</span>
                         </div>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-4">
                         <div 
                           className="h-full bg-primary transition-all duration-1000"
                           style={{ width: `${(planEvents.filter(e => e.isCompleted).length / (planEvents.length || 1)) * 100}%` }}
                         />
                      </div>
                   </GlassCard>
                </div>

                {/* AI Calendar Engine */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40">AI Generated Calendar</h3>
                    <div className="flex items-center gap-4">
                       <span className="text-[9px] font-black uppercase tracking-widest text-primary/40 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          Live Planner
                       </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {planEvents.length === 0 ? (
                      <div className="py-20 text-center glass rounded-[2.5rem] border-2 border-dashed border-white/5">
                        <Calendar className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest">План пуст</p>
                        <button className="mt-4 text-primary text-[10px] font-black uppercase tracking-widest hover:underline">
                           Сгенерировать AI-неделю
                        </button>
                      </div>
                    ) : (
                      planEvents.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((event, i) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          key={event.id}
                          className={cn(
                            "group p-5 rounded-[2rem] border transition-all duration-500 flex items-center justify-between",
                            event.isCompleted ? "bg-green-500/5 border-green-500/20 opacity-60" : "bg-secondary/30 border-white/5 hover:bg-white/5 hover:-translate-y-1"
                          )}
                        >
                          <div className="flex items-center gap-5">
                             <div className={cn(
                               "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500",
                               event.isCompleted ? "bg-green-500/20 border-green-500/40 text-green-400" : 
                               event.type === 'WORKOUT' ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
                               event.type === 'NUTRITION' ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" :
                               "bg-primary/20 border-primary/40 text-primary"
                             )}>
                               {event.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : 
                                event.type === 'WORKOUT' ? <Activity className="w-6 h-6" /> :
                                event.type === 'NUTRITION' ? <Zap className="w-6 h-6" /> :
                                <Calendar className="w-6 h-6" />}
                             </div>
                             <div>
                                <div className="flex items-center gap-2 mb-1">
                                   <p className="text-lg font-bold font-display">{event.title}</p>
                                   {event.source === 'AI' && (
                                     <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/20">AI Generated</span>
                                   )}
                                </div>
                                <div className="flex items-center gap-4 text-muted-foreground/60 text-[10px] font-black uppercase tracking-widest">
                                   <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(event.date).toLocaleDateString([], { weekday: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                                   {event.duration && <span>• {event.duration} min</span>}
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center gap-3">
                             <button 
                               onClick={() => togglePlanEvent(event.id)}
                               className={cn(
                                 "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                 event.isCompleted ? "bg-green-500 text-black" : "bg-white/5 text-muted-foreground hover:bg-primary/20 hover:text-primary border border-white/5"
                               )}
                             >
                               <CheckCircle2 className="w-5 h-5" />
                             </button>
                             <button 
                               onClick={() => removePlanEvent(event.id)}
                               className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 text-muted-foreground hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                             >
                               <Trash2 className="w-5 h-5" />
                             </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-[70vh] flex flex-col glass rounded-[3rem] border border-white/5 overflow-hidden"
              >
                 <div className="p-6 border-b border-white/5 bg-primary/5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/20">
                       <Brain className="w-5 h-5" />
                    </div>
                    <div>
                       <h3 className="text-sm font-black uppercase tracking-widest">Live Coaching Session</h3>
                       <p className="text-[10px] text-muted-foreground/60">Persistent context • Adaptive strategy • Real-time planning</p>
                    </div>
                 </div>

                 <div className="flex-1 p-8 overflow-y-auto space-y-6 scrollbar-hide">
                    {/* Placeholder for real chat content */}
                    <div className="max-w-2xl mx-auto space-y-8">
                       <div className="space-y-4">
                          <div className="flex items-start gap-4">
                             <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                                <Brain className="w-4 h-4" />
                             </div>
                             <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] rounded-tl-none">
                                <p className="text-sm leading-relaxed text-muted-foreground font-medium">
                                   Добро пожаловать в Coaching Workspace. Тут мы строим твою долгосрочную стратегию. 
                                   Я помню все твои метрики и готов помочь адаптировать план.
                                </p>
                             </div>
                          </div>
                          <div className="flex items-start gap-4 flex-row-reverse">
                             <div className="w-8 h-8 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center shrink-0">
                                <User className="w-4 h-4" />
                             </div>
                             <div className="bg-primary text-black p-6 rounded-[2rem] rounded-tr-none shadow-xl shadow-primary/10">
                                <p className="text-sm font-bold">Как мне повысить выносливость на следующей неделе?</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="p-6 border-t border-white/5 bg-black/40">
                    <div className="relative max-w-3xl mx-auto">
                       <input 
                         type="text" 
                         className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 px-8 text-xs font-bold focus:outline-none focus:border-primary/40 focus:bg-white/10 transition-all placeholder:text-muted-foreground/20 shadow-inner"
                         placeholder="Твое сообщение коучу..."
                       />
                       <button className="absolute right-2 top-2 bottom-2 aspect-square bg-primary text-black rounded-full flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all">
                          <ArrowRight className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-6"
              >
                 <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40">Insight History & Memory Layer</h3>
                 </div>
                 
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
                            <div className="flex items-center gap-1">
                               {Array.from({ length: 3 }).map((_, i) => (
                                 <div key={i} className="w-1 h-1 rounded-full bg-primary/40" />
                               ))}
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
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Sidebar Context Layer */}
        <div className="lg:col-span-4 space-y-8">
           <GlassCard className="p-8 space-y-6 border-white/5 sticky top-8">
              <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40">Coach Context</h3>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="space-y-0.5">
                       <p className="text-[8px] uppercase font-black tracking-widest text-muted-foreground/60">Sleep Quality</p>
                       <p className="text-sm font-black text-primary">{profile?.sleepAverage || 7.5}h Avg</p>
                    </div>
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                       <Clock className="w-4 h-4" />
                    </div>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="space-y-0.5">
                       <p className="text-[8px] uppercase font-black tracking-widest text-muted-foreground/60">Stress Level</p>
                       <p className="text-sm font-black text-orange-400">{profile?.stressLevel || 4}/10</p>
                    </div>
                    <div className="p-2 rounded-xl bg-orange-400/10 text-orange-400">
                       <Zap className="w-4 h-4" />
                    </div>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="space-y-0.5">
                       <p className="text-[8px] uppercase font-black tracking-widest text-muted-foreground/60">Compliance</p>
                       <p className="text-sm font-black text-green-400">High</p>
                    </div>
                    <div className="p-2 rounded-xl bg-green-400/10 text-green-400">
                       <CheckCircle2 className="w-4 h-4" />
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                 <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Live Insights</h4>
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

              <GradientButton className="w-full py-4 text-[10px] font-black uppercase tracking-widest group">
                 <Sparkles className="w-4 h-4 mr-2" />
                 Generate New Tactics
                 <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </GradientButton>
           </GlassCard>
        </div>
      </div>
    </div>
  );
};
