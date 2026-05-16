import React, { useState } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, 
  eachDayOfInterval, isToday, parseISO, startOfDay, getHours, 
  getMinutes, addWeeks, subWeeks, setHours, setMinutes
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Brain, Plus, Activity, Zap, CheckCircle2, MoreHorizontal,
  Clock, Target, Dumbbell, Utensils, RotateCcw, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFitnessStore } from '../../../store/useFitnessStore';
import { cn } from '../../../lib/utils';
import { PlanEvent } from '../../../types';
import { AIEventDetailsModal } from './AIEventDetailsModal';
import { AddEventModal } from './AddEventModal';
import { GradientButton } from '../../../components/ui/GradientButton';

export const AICalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedEvent, setSelectedEvent] = useState<PlanEvent | null>(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [addModalInitialDate, setAddModalInitialDate] = useState<Date | undefined>();
  const [draggedEvent, setDraggedEvent] = useState<PlanEvent | null>(null);

  const planEvents = useFitnessStore(state => state.planEvents);
  const updatePlanEvent = useFitnessStore(state => state.updatePlanEvent);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  const calendarStart = view === 'month' ? startOfWeek(monthStart, { weekStartsOn: 1 }) : weekStart;
  const calendarEnd = view === 'month' ? endOfWeek(monthEnd, { weekStartsOn: 1 }) : weekEnd;

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const nextRange = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else setCurrentDate(addWeeks(currentDate, 1));
  };
  
  const prevRange = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else setCurrentDate(subWeeks(currentDate, 1));
  };

  const getEventsForDay = (day: Date) => {
    return planEvents.filter(event => isSameDay(parseISO(event.date), day));
  };

  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  const getEventColor = (type: string, status: string) => {
    if (status === 'COMPLETED') return 'bg-white/5 border-white/10 text-muted-foreground/60';
    if (type === 'WORKOUT') return 'bg-orange-500/5 border-orange-500/10 text-orange-400';
    if (type === 'NUTRITION') return 'bg-blue-500/5 border-blue-500/10 text-blue-400';
    if (type === 'RECOVERY') return 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400';
    return 'bg-white/5 border-white/10 text-white/80';
  };

  const getEventDot = (type: string, status: string) => {
    if (status === 'COMPLETED') return 'bg-green-500/40';
    if (type === 'WORKOUT') return 'bg-orange-500';
    if (type === 'NUTRITION') return 'bg-blue-500';
    if (type === 'RECOVERY') return 'bg-emerald-500';
    return 'bg-primary';
  };

  const getEventIcon = (type: string) => {
    if (type === 'WORKOUT') return <Dumbbell className="w-3 h-3" />;
    if (type === 'NUTRITION') return <Utensils className="w-3 h-3" />;
    if (type === 'RECOVERY') return <RotateCcw className="w-3 h-3" />;
    if (type === 'REMINDER') return <Info className="w-3 h-3" />;
    return <CalendarIcon className="w-3 h-3" />;
  };

  const handleDragStart = (e: React.DragEvent, event: PlanEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date, hour?: number) => {
    e.preventDefault();
    if (!draggedEvent) return;

    let newDate = setHours(startOfDay(targetDate), getHours(parseISO(draggedEvent.date)));
    newDate = setMinutes(newDate, getMinutes(parseISO(draggedEvent.date)));

    if (hour !== undefined) {
        newDate = setHours(startOfDay(targetDate), hour);
    }

    updatePlanEvent(draggedEvent.id, { date: newDate.toISOString() });
    
    // AI Feedback simulation
    if (draggedEvent.source === 'AI') {
        alert('AI Анализ: Перенос воркаута на этот день может повлиять на восстановление. Я скорректировал интенсивность остальных сессий на неделе.');
    }
    
    setDraggedEvent(null);
  };

  const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7:00 to 21:00

  return (
    <>
      <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col h-[800px] shadow-2xl relative group">
        {/* Background Aura */}
        <div className="absolute top-0 left-0 w-full h-full bg-primary/2 opacity-[0.02] pointer-events-none" />

        {/* Calendar Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl z-20">
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                   <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-display font-medium capitalize tracking-tight">
                        {format(currentDate, view === 'month' ? 'LLLL yyyy' : 'd LLLL, yyyy', { locale: ru })}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Current Strategy Phase</span>
                        <div className="px-1.5 py-0.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-[8px] font-black uppercase">Adaptive Peak</div>
                    </div>
                </div>
             </div>

             <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-white/5 rounded-[1.25rem] border border-white/5 h-10">
                    <button 
                        onClick={() => setView('month')}
                        className={cn(
                            "px-5 h-8 rounded-[1rem] text-[9px] font-black uppercase tracking-widest transition-all",
                            view === 'month' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"
                        )}
                    >МЕСЯЦ</button>
                    <button 
                        onClick={() => setView('week')}
                        className={cn(
                            "px-5 h-8 rounded-[1rem] text-[9px] font-black uppercase tracking-widest transition-all",
                            view === 'week' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"
                        )}
                    >НЕДЕЛЯ</button>
                </div>
                <div className="flex items-center gap-1">
                   <button onClick={prevRange} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl transition-all text-muted-foreground border border-transparent hover:border-white/10"><ChevronLeft className="w-4 h-4" /></button>
                   <button onClick={nextRange} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl transition-all text-muted-foreground border border-transparent hover:border-white/10"><ChevronRight className="w-4 h-4" /></button>
                </div>
             </div>
          </div>

          <GradientButton 
            onClick={() => { setAddModalInitialDate(undefined); setAddModalOpen(true); }}
            className="flex items-center gap-3 px-6 h-12 text-[10px] font-black uppercase tracking-widest"
          >
             <Plus className="w-4 h-4" />
             Действие
          </GradientButton>
        </div>

        {/* Days Header */}
        <div className={cn(
            "grid border-b border-white/10 bg-white/[0.02] sticky top-0 z-10",
            view === 'month' ? "grid-cols-7" : "grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
        )}>
          {view === 'week' && <div className="border-r border-white/5" />}
          {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map((dayName, idx) => {
               const dayDate = days[idx];
               return (
                <div key={dayName} className="py-6 text-center space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">{dayName}</p>
                    {view === 'week' && dayDate && (
                        <p className={cn(
                            "text-xl font-display font-medium",
                            isToday(dayDate) ? "text-primary italic" : "text-white/60"
                        )}>{format(dayDate, 'd')}</p>
                    )}
                </div>
               );
          })}
        </div>

        {/* CONTENT BODY */}
        {view === 'month' ? (
          <div className="flex-1 grid grid-cols-7 overflow-y-auto scrollbar-hide divide-x divide-y divide-white/[0.03] border-t border-white/5">
            {days.map((day, i) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isTodayDate = isToday(day);
              const visibleEvents = dayEvents.slice(0, 4);
              const moreCount = dayEvents.length - 4;

              return (
                <div 
                  key={day.toISOString()} 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, day)}
                  className={cn(
                    "min-h-[140px] p-4 transition-colors group relative flex flex-col gap-2",
                    !isCurrentMonth && "bg-black/40 opacity-10 pointer-events-none",
                    isCurrentMonth && "hover:bg-white/[0.01]",
                    isTodayDate && "bg-primary/[0.01]"
                  )}
                >
                  <div className="flex items-center justify-between">
                     <span className={cn(
                       "text-[10px] font-black transition-all",
                       isTodayDate ? "text-primary flex items-center gap-1.5" : "text-muted-foreground/40"
                     )}>
                       {isTodayDate && <div className="w-1 h-1 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#dfff00]" />}
                       {format(day, 'd')}
                     </span>
                     <button 
                        onClick={() => { setAddModalInitialDate(day); setAddModalOpen(true); }}
                        className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all text-muted-foreground/40"
                      >
                         <Plus className="w-3 h-3" />
                      </button>
                  </div>

                  <div className="flex-1 space-y-1">
                    {visibleEvents.map(event => (
                      <div key={event.id} className="relative">
                        <motion.button 
                          draggable
                          onDragStart={(e) => handleDragStart(e, event)}
                          onClick={() => setSelectedEvent(event)}
                          onMouseEnter={() => setHoveredEventId(event.id)}
                          onMouseLeave={() => setHoveredEventId(null)}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ x: 2 }}
                          className={cn(
                            "w-full text-left px-2 py-1 rounded-md text-[9px] font-bold border transition-all flex items-center gap-2 truncate",
                            getEventColor(event.type, event.status)
                          )}
                        >
                          <div className={cn("w-1 h-1 rounded-full shrink-0", getEventDot(event.type, event.status))} />
                          <span className="truncate flex-1">{event.title}</span>
                        </motion.button>

                        <AnimatePresence>
                          {hoveredEventId === event.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 5 }}
                              className="absolute left-0 bottom-full mb-2 w-48 p-3 glass border border-white/10 rounded-xl z-[100] pointer-events-none shadow-2xl"
                            >
                               <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">
                                 {event.type} • {event.duration}m
                               </p>
                               <p className="text-[10px] font-bold text-white mb-1.5 leading-tight">{event.title}</p>
                               <p className="text-[9px] text-muted-foreground/80 italic line-clamp-2">
                                 {event.aiRationale || event.description || 'Genesis Performance Strategy'}
                               </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                    
                    {moreCount > 0 && (
                      <button className="w-full text-left px-2 py-1 text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest hover:text-primary transition-colors">
                        + {moreCount} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-hide relative bg-black/20">
            <div className="flex h-full min-w-[1200px]">
               {/* Time column */}
               <div className="w-20 border-r border-white/5 flex flex-col pt-4 bg-black/40 backdrop-blur-sm sticky left-0 z-30">
                  {HOURS.map(hour => (
                    <div key={hour} className="h-24 px-4 text-right flex items-start justify-end -mt-2">
                       <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">{hour}:00</span>
                    </div>
                  ))}
               </div>

               {/* Days grid */}
               <div className="flex-1 grid grid-cols-7 divide-x divide-white/[0.03]">
                  {days.map((day) => {
                    const dayEvents = getEventsForDay(day);
                    return (
                      <div 
                        key={day.toISOString()} 
                        className={cn(
                          "relative group min-h-full",
                          isToday(day) && "bg-primary/[0.01]"
                        )}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, day)}
                      >
                         {/* Magnetic grid lines */}
                         <div className="absolute inset-0 z-0 pointer-events-none divide-y divide-white/[0.02]">
                            {HOURS.map(hour => (
                              <div key={hour} className="h-24" />
                            ))}
                         </div>

                         {/* Interactive drop slots */}
                         <div className="absolute inset-0 z-10">
                            {HOURS.map(hour => (
                                <div 
                                    key={hour} 
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => handleDrop(e, day, hour)}
                                    className="h-24 hover:bg-primary/[0.02] transition-colors flex items-center justify-center group/slot"
                                >
                                    <button 
                                        onClick={() => {
                                            const d = startOfDay(day);
                                            const date = setHours(d, hour);
                                            setAddModalInitialDate(date);
                                            setAddModalOpen(true);
                                        }}
                                        className="w-8 h-8 rounded-full bg-white/5 text-primary opacity-0 group-hover/slot:opacity-100 hover:scale-110 transition-all flex items-center justify-center border border-white/10"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                         </div>

                         {/* Timeline Events */}
                         <div className="relative z-20 h-full">
                           {dayEvents.map(event => {
                             const eventDate = parseISO(event.date);
                             const hour = getHours(eventDate);
                             const minute = getMinutes(eventDate);
                             const startPos = (hour - 7 + minute / 60) * 96;
                             const height = Math.max(48, (event.duration / 60) * 96);

                             return (
                               <motion.div
                                 key={event.id}
                                 draggable
                                 onDragStart={(e) => handleDragStart(e, event)}
                                 onClick={() => setSelectedEvent(event)}
                                 initial={{ opacity: 0, x: -10 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 whileHover={{ scale: 1.02, x: 4, zIndex: 50 }}
                                 className={cn(
                                   "absolute left-1 right-1 rounded-lg p-3 border transition-all cursor-grab active:cursor-grabbing group/wevent select-none shadow-xl",
                                   getEventColor(event.type, event.status),
                                   event.status === 'COMPLETED' && "opacity-50"
                                 )}
                                 style={{ top: `${startPos}px`, height: `${height}px` }}
                               >
                                  <div className="flex items-start justify-between gap-2 overflow-hidden">
                                     <div className="space-y-0.5 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                           <div className={cn("w-1 h-1 rounded-full shrink-0", getEventDot(event.type, event.status))} />
                                           <p className="text-[9px] font-black uppercase tracking-tight truncate">{event.title}</p>
                                        </div>
                                        <p className="text-[8px] font-bold opacity-40">{format(eventDate, 'HH:mm')} • {event.duration}m</p>
                                     </div>
                                     <div className="shrink-0 scale-75 opacity-40 group-hover/wevent:opacity-100 transition-opacity">
                                        {getEventIcon(event.type)}
                                     </div>
                                  </div>
                               </motion.div>
                             );
                           })}
                         </div>

                         {/* Today indicator */}
                         {isToday(day) && (
                            <div 
                              className="absolute left-0 right-0 h-[1.5px] bg-primary z-40 pointer-events-none" 
                              style={{ top: `${(getHours(new Date()) - 7 + getMinutes(new Date()) / 60) * 96}px` }} 
                            >
                               <div className="absolute -left-[5px] -top-1 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_12px_#dfff00]" />
                            </div>
                         )}
                      </div>
                    );
                  })}
               </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="p-4 border-t border-white/5 bg-black/40 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-8">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> AI Strategy</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white/40" /> User Planned</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> Completed</div>
           </div>
           <p className="italic">AI Coach is monitoring distribution of load</p>
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <AIEventDetailsModal 
            key="details"
            event={selectedEvent} 
            onClose={() => setSelectedEvent(null)} 
          />
        )}
        {isAddModalOpen && (
          <AddEventModal 
            key="add"
            onClose={() => setAddModalOpen(false)} 
            initialDate={addModalInitialDate}
          />
        )}
      </AnimatePresence>
    </>
  );
};

