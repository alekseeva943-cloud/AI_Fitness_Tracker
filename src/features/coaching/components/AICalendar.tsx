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
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [addModalInitialDate, setAddModalInitialDate] = useState<Date | undefined>();
  const [draggedEvent, setDraggedEvent] = useState<PlanEvent | null>(null);

  const planEvents = useFitnessStore(state => state.planEvents);
  const updatePlanEvent = useFitnessStore(state => state.updatePlanEvent);

  const selectedEvent = planEvents.find(e => e.id === selectedEventId) || null;

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
    if (status === 'COMPLETED') return 'bg-white/5 border-white/10 text-muted-foreground/40';
    if (type === 'WORKOUT') return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
    if (type === 'NUTRITION') return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    if (type === 'RECOVERY') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    return 'bg-white/10 border-white/20 text-white';
  };

  const getEventDot = (type: string, status: string) => {
    if (status === 'COMPLETED') return 'bg-white/20';
    if (type === 'WORKOUT') return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]';
    if (type === 'NUTRITION') return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]';
    if (type === 'RECOVERY') return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
    return 'bg-primary';
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
    setDraggedEvent(null);
  };

  const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7:00 to 21:00

  return (
    <>
      <div className="flex flex-col h-full bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        {/* Calendar Header */}
        <div className="p-8 pb-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
              <button 
                onClick={() => setView('month')}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  view === 'month' ? "bg-primary text-black" : "text-muted-foreground hover:text-white"
                )}
              >
                Month
              </button>
              <button 
                onClick={() => setView('week')}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  view === 'week' ? "bg-primary text-black" : "text-muted-foreground hover:text-white"
                )}
              >
                Week
              </button>
            </div>
            <div className="flex items-center gap-4">
               <button onClick={prevRange} className="p-3 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
               <h2 className="text-lg font-display font-bold uppercase tracking-tight w-48 text-center text-white/90">
                 {format(currentDate, view === 'month' ? 'LLLL yyyy' : 'd LLLL, yyyy', { locale: ru })}
               </h2>
               <button onClick={nextRange} className="p-3 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"><ChevronRight className="w-5 h-5 text-muted-foreground" /></button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <GradientButton onClick={() => setAddModalOpen(true)} className="px-6 py-3 rounded-2xl h-auto text-[10px] font-black uppercase tracking-widest">
              <Plus className="w-4 h-4 mr-2" />
              Schedule
            </GradientButton>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-8 pt-0">
          <div className="grid grid-cols-7 border-b border-white/5 mb-6">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="py-4 text-center">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/20">{day}</span>
              </div>
            ))}
          </div>

          {view === 'month' ? (
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((day, idx) => {
                  const dayEvents = getEventsForDay(day);
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  
                  return (
                    <div 
                      key={idx}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, day)}
                      className={cn(
                        "min-h-[140px] p-4 rounded-[1.5rem] border transition-all relative group",
                        isCurrentMonth ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10" : "bg-transparent border-transparent opacity-10 pointer-events-none grayscale",
                        isToday(day) && "bg-primary/[0.03] border-primary/20 shadow-[0_0_20px_rgba(223,255,0,0.05)]"
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={cn(
                          "text-[11px] font-black tracking-widest leading-none",
                          isToday(day) ? "text-primary italic" : "text-muted-foreground/30"
                        )}>
                          {format(day, 'd')}
                        </span>
                        {isToday(day) && (
                           <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_#dfff00]" />
                        )}
                        <button 
                            onClick={() => { setAddModalInitialDate(day); setAddModalOpen(true); }}
                            className="p-1 rounded-lg hover:bg-primary/20 text-muted-foreground/0 group-hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="space-y-1 relative">
                        {dayEvents.map(event => (
                          <div key={event.id} className="relative">
                            <motion.button 
                              draggable
                              onDragStart={(e) => handleDragStart(e, event)}
                              onClick={() => setSelectedEventId(event.id)}
                              onMouseEnter={() => setHoveredEventId(event.id)}
                              onMouseLeave={() => setHoveredEventId(null)}
                              whileHover={{ x: 1 }}
                              className={cn(
                                "w-full text-left px-3 py-1.5 rounded-xl text-[9px] font-bold border transition-all flex items-center gap-2 truncate",
                                getEventColor(event.type, event.status),
                                hoveredEventId === event.id && "ring-2 ring-primary/40 border-primary/40 z-50 scale-[1.02]"
                              )}
                            >
                              <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", getEventDot(event.type, event.status))} />
                              <span className="truncate uppercase tracking-tight">{event.title}</span>
                            </motion.button>

                            <AnimatePresence>
                              {hoveredEventId === event.id && !selectedEventId && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: -5 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[280px] p-6 glass border border-white/20 rounded-[2rem] z-[100] pointer-events-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-3xl overflow-hidden"
                                >
                                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
                                   <div className="flex items-center justify-between mb-4">
                                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                                       {event.type}
                                     </span>
                                     <span className="text-[10px] font-black text-muted-foreground/30">{event.duration} MIN</span>
                                   </div>

                                   <h4 className="text-sm font-bold text-white mb-3 leading-tight tracking-tight uppercase">{event.title}</h4>
                                   
                                   <div className="pt-4 border-t border-white/5 space-y-3">
                                      <p className="text-[11px] text-muted-foreground/60 italic leading-relaxed font-medium">
                                        {event.aiRationale || event.description || 'Genesis Strategic Session'}
                                      </p>
                                      {event.exercises && event.exercises.length > 0 && (
                                          <div className="flex flex-wrap gap-1.5">
                                             {event.exercises.slice(0, 3).map((ex, i) => (
                                                <span key={i} className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[8px] font-black text-muted-foreground/40 uppercase">{ex.name}</span>
                                             ))}
                                             {event.exercises.length > 3 && <span className="text-[8px] font-black text-primary/40 uppercase">+{event.exercises.length-3} more</span>}
                                          </div>
                                      )}
                                   </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto scrollbar-hide relative bg-black/20 rounded-[2.5rem] border border-white/5 overflow-hidden">
               <div className="flex h-full min-w-[1200px]">
                  <div className="w-20 border-r border-white/5 flex flex-col pt-4 bg-black/40 backdrop-blur-sm sticky left-0 z-30">
                     {HOURS.map(hour => (
                       <div key={hour} className="h-28 px-4 text-right flex items-start justify-end -mt-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/20">{hour}:00</span>
                       </div>
                     ))}
                  </div>

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
                            <div className="absolute inset-0 z-0 pointer-events-none divide-y divide-white/[0.02]">
                               {HOURS.map(hour => (
                                 <div key={hour} className="h-28" />
                               ))}
                            </div>

                            <div className="absolute inset-0 z-10 text-center opacity-0 group-hover:opacity-100 transition-opacity flex flex-col">
                               {HOURS.map(hour => (
                                   <button 
                                       key={hour}
                                       onClick={() => { setAddModalInitialDate(setHours(day, hour)); setAddModalOpen(true); }}
                                       className="h-28 w-full hover:bg-primary/[0.03] transition-all flex items-center justify-center border-b border-transparent group-hover:border-white/[0.01]"
                                   >
                                       <Plus className="w-5 h-5 text-primary/20" />
                                   </button>
                               ))}
                            </div>

                            <div className="relative z-20 h-full">
                              {dayEvents.map(event => {
                                const eventDate = parseISO(event.date);
                                const startPos = (getHours(eventDate) - 7 + getMinutes(eventDate) / 60) * 112;
                                const height = Math.max(56, (event.duration / 60) * 112);

                                return (
                                  <motion.div
                                    key={event.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, event)}
                                    onClick={() => setSelectedEventId(event.id)}
                                    whileHover={{ scale: 1.01, zIndex: 50 }}
                                    className={cn(
                                      "absolute left-2 right-2 rounded-[1.5rem] p-5 border transition-all cursor-grab active:cursor-grabbing select-none shadow-2xl flex flex-col justify-between overflow-hidden group/ev",
                                      getEventColor(event.type, event.status)
                                    )}
                                    style={{ top: `${startPos}px`, height: `${height}px` }}
                                  >
                                     <div className="absolute top-0 left-0 w-full h-1 bg-white/10 group-hover/ev:bg-white/20 transition-colors" />
                                     <div>
                                        <div className="flex items-center gap-2 mb-2">
                                           <div className={cn("w-2 h-2 rounded-full", getEventDot(event.type, event.status))} />
                                           <p className="text-xs font-black uppercase tracking-tight truncate flex-1">{event.title}</p>
                                        </div>
                                        <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">{format(eventDate, 'HH:mm')} • {event.duration} MIN</p>
                                     </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                         </div>
                       );
                     })}
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Legend Footer */}
        <div className="px-12 py-8 border-t border-white/5 bg-black/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-10">
               <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]" />
                  <span className="text-[10px] font-black uppercase text-muted-foreground/30 tracking-[0.3em]">Strength</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
                  <span className="text-[10px] font-black uppercase text-muted-foreground/30 tracking-[0.3em]">Nutrition</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                  <span className="text-[10px] font-black uppercase text-muted-foreground/30 tracking-[0.3em]">Recovery</span>
               </div>
            </div>
            <div className="flex items-center gap-4 opacity-10">
               <Brain className="w-4 h-4" />
               <p className="text-[10px] font-black uppercase italic tracking-[0.4em]">Genesis Engine Active</p>
            </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent && selectedEventId && (
          <AIEventDetailsModal 
            key={selectedEventId}
            event={selectedEvent} 
            onClose={() => setSelectedEventId(null)} 
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
