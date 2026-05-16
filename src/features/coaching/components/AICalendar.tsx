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
  Clock, Target, Dumbbell, Utensils
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
            "grid border-b border-white/5 bg-white/[0.01] sticky top-0 z-10",
            view === 'month' ? "grid-cols-7" : "grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
        )}>
          {view === 'week' && <div className="border-r border-white/5" />}
          {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map((dayName, idx) => {
               const dayDate = days[idx];
               return (
                <div key={dayName} className="py-4 text-center space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{dayName}</p>
                    {view === 'week' && dayDate && (
                        <p className={cn(
                            "text-lg font-display font-medium",
                            isToday(dayDate) ? "text-primary italic" : "text-white/60"
                        )}>{format(dayDate, 'd')}</p>
                    )}
                </div>
               );
          })}
        </div>

        {/* Content Body */}
        {view === 'month' ? (
          <div className="flex-1 grid grid-cols-7 overflow-y-auto scrollbar-hide">
            {days.map((day, i) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isTodayDate = isToday(day);

              return (
                <div 
                  key={day.toISOString()} 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, day)}
                  className={cn(
                    "min-h-[140px] p-3 border-r border-b border-white/5 transition-all group relative",
                    !isCurrentMonth && "bg-black/40 opacity-20",
                    isCurrentMonth && "hover:bg-white/[0.02]"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                     <span className={cn(
                       "w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all border",
                       isTodayDate ? "bg-primary border-primary/20 text-black shadow-lg shadow-primary/20" : "bg-white/5 border-white/5 text-muted-foreground group-hover:text-white"
                     )}>
                       {format(day, 'd')}
                     </span>
                  </div>

                  <div className="space-y-2">
                    {dayEvents.map(event => (
                      <motion.div 
                        key={event.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, event)}
                        onClick={() => setSelectedEvent(event)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02, x: 2 }}
                        className={cn(
                          "group/event relative px-3 py-2 rounded-xl text-[9px] font-black border transition-all cursor-grab active:cursor-grabbing flex items-center gap-2",
                          event.status === 'COMPLETED' ? "bg-green-500/5 border-green-500/10 text-green-400 grayscale opacity-40" :
                          event.source === 'AI' 
                            ? "bg-primary/5 border-primary/20 text-primary uppercase shadow-[0_0_10px_rgba(223,255,0,0.05)] hover:bg-primary/10" 
                            : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                        )}
                      >
                        <div className={cn(
                          "w-1.5 h-3 rounded-full shrink-0",
                          event.status === 'COMPLETED' ? "bg-green-500" : (event.source === 'AI' ? "bg-primary" : "bg-white/20")
                        )} />
                        <span className="truncate">{event.title}</span>
                        {event.source === 'AI' && <Brain className="w-3 h-3 ml-auto opacity-40 shrink-0" />}
                        
                        {event.status === 'ACTIVE' && (
                          <div className="absolute -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Day Add Action */}
                  <button 
                    onClick={() => { setAddModalInitialDate(day); setAddModalOpen(true); }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-primary/20 hover:text-primary transition-all text-muted-foreground/40"
                  >
                     <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-hide relative bg-white/[0.01]">
            <div className="grid grid-cols-[80px_fr_fr_fr_fr_fr_fr_fr] w-[1400px] md:w-auto h-full">
               <div className="col-start-1 border-r border-white/5 flex flex-col pt-4">
                  {HOURS.map(hour => (
                    <div key={hour} className="h-24 px-4 text-right">
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">{hour}:00</span>
                    </div>
                  ))}
               </div>

               {days.map((day) => {
                 const dayEvents = getEventsForDay(day);
                 return (
                   <div 
                     key={day.toISOString()} 
                     className={cn(
                       "relative border-r border-white/5 group pt-4",
                       isToday(day) && "bg-primary/[0.02]"
                     )}
                     onDragOver={(e) => e.preventDefault()}
                     onDrop={(e) => handleDrop(e, day)}
                   >
                      {/* Hour slots background lines */}
                      <div className="absolute inset-0 z-0 pointer-events-none">
                         {HOURS.map(hour => (
                           <div key={hour} className="h-24 border-b border-white/[0.03]" />
                         ))}
                      </div>

                      {/* Current Hour indicator */}
                      {isToday(day) && (
                         <div 
                           className="absolute left-0 right-0 h-0.5 bg-primary/40 z-10 pointer-events-none" 
                           style={{ top: `${(getHours(new Date()) - 7 + getMinutes(new Date()) / 60) * 96 + 16}px` }} 
                         >
                            <div className="absolute -left-1.5 -top-1 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_#dfff00]" />
                         </div>
                      )}

                      {/* Timeline Events */}
                      <div className="relative z-10 h-full p-2">
                        {dayEvents.map(event => {
                          const eventDate = parseISO(event.date);
                          const hour = getHours(eventDate);
                          const minute = getMinutes(eventDate);
                          const startPos = (hour - 7 + minute / 60) * 96;
                          const height = 90; // Default height for 1h block

                          return (
                            <motion.div
                              key={event.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, event)}
                              onClick={() => setSelectedEvent(event)}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={cn(
                                "absolute left-2 right-2 rounded-2xl p-4 border transition-all cursor-grab active:cursor-grabbing group/wevent select-none",
                                event.status === 'COMPLETED' ? "bg-green-500/5 border-green-500/10 opacity-40 grayscale" :
                                event.source === 'AI' 
                                  ? "bg-primary/5 border-primary/20 shadow-xl shadow-primary/5 hover:bg-primary/10" 
                                  : "bg-white/5 border-white/10 hover:bg-white/10"
                              )}
                              style={{ top: `${startPos + 16}px`, height: `${height}px` }}
                            >
                               <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                     <div className="flex items-center gap-2">
                                        <p className={cn(
                                           "text-[10px] font-black uppercase tracking-tight truncate max-w-[120px]",
                                           event.source === 'AI' ? "text-primary" : "text-white"
                                        )}>{event.title}</p>
                                        {event.source === 'AI' && <Brain className="w-3 h-3 text-primary/40 shrink-0" />}
                                     </div>
                                     <p className="text-[8px] font-bold text-muted-foreground/60">{format(eventDate, 'HH:mm')} • {event.duration}m</p>
                                  </div>
                                  <div className={cn(
                                     "translate-x-2 opacity-0 group-hover/wevent:opacity-100 transition-all text-muted-foreground hover:text-white"
                                  )}>
                                     <MoreHorizontal className="w-4 h-4" />
                                  </div>
                               </div>

                               <div className="mt-3 flex items-center gap-3">
                                  <div className="flex -space-x-1 grayscale">
                                     <div className="w-4 h-4 rounded-full bg-white/10 border border-white/10" />
                                     <div className="w-4 h-4 rounded-full bg-white/20 border border-white/10" />
                                  </div>
                                  <div className="text-[7px] font-bold text-muted-foreground/40 uppercase">Session Active</div>
                               </div>
                            </motion.div>
                          );
                        })}

                        {/* Interactive drop slots */}
                        {HOURS.map(hour => (
                            <div 
                                key={hour} 
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDrop(e, day, hour)}
                                className="h-24 hover:bg-white/[0.01] transition-colors flex items-center justify-center group/slot"
                            >
                                <Plus 
                                    onClick={() => {
                                        const d = startOfDay(day);
                                        const date = setHours(d, hour);
                                        setAddModalInitialDate(date);
                                        setAddModalOpen(true);
                                    }}
                                    className="w-5 h-5 text-primary/40 opacity-0 group-hover/slot:opacity-100 cursor-pointer hover:scale-125 transition-all" 
                                />
                            </div>
                        ))}
                      </div>
                   </div>
                 );
               })}
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

