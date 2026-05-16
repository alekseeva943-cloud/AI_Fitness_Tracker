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
      <div className="flex flex-col h-full bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        {/* Calendar Header */}
        <div className="p-8 pb-4 flex items-center justify-between shrink-0 bg-white/[0.02] border-b border-white/5">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-white/10 rounded-2xl">
              <button 
                onClick={() => setView('month')}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  view === 'month' ? "bg-primary text-black" : "text-muted-foreground hover:text-white"
                )}
              >
                Month
              </button>
              <button 
                onClick={() => setView('week')}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  view === 'week' ? "bg-primary text-black" : "text-muted-foreground hover:text-white"
                )}
              >
                Week
              </button>
            </div>
            <div className="flex items-center gap-4">
               <button onClick={prevRange} className="p-3 hover:bg-white/10 rounded-xl transition-all border border-white/5"><ChevronLeft className="w-5 h-5 text-white/60" /></button>
               <h2 className="text-xl font-display font-bold uppercase tracking-tight w-56 text-center text-white">
                 {format(currentDate, view === 'month' ? 'LLLL yyyy' : 'd LLLL, yyyy', { locale: ru })}
               </h2>
               <button onClick={nextRange} className="p-3 hover:bg-white/10 rounded-xl transition-all border border-white/5"><ChevronRight className="w-5 h-5 text-white/60" /></button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <GradientButton onClick={() => setAddModalOpen(true)} className="px-8 py-3.5 rounded-2xl h-auto text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/10">
              <Plus className="w-4 h-4 mr-2" />
              New Action
            </GradientButton>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-8 pt-0">
          <div className="grid grid-cols-7 border-b border-white/10 mb-8">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
              <div key={day} className="py-6 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">{day}</span>
              </div>
            ))}
          </div>

          {view === 'month' ? (
            <div className="grid grid-cols-7 gap-3">
              {days.map((day, idx) => {
                  const dayEvents = getEventsForDay(day);
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  
                  return (
                    <div 
                      key={idx}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, day)}
                      className={cn(
                        "min-h-[160px] p-5 rounded-[2rem] border transition-all relative group flex flex-col gap-3",
                        isCurrentMonth ? "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20" : "bg-transparent border-transparent opacity-5 pointer-events-none grayscale",
                        isToday(day) && "bg-primary/[0.04] border-primary/30 shadow-[0_0_30px_rgba(223,255,0,0.08)]"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-xs font-black tracking-widest leading-none",
                          isToday(day) ? "text-primary italic" : "text-white/30"
                        )}>
                          {format(day, 'd')}
                        </span>
                        {isToday(day) && (
                           <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_15px_#dfff00]" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5 relative">
                        {dayEvents.map(event => (
                          <div key={event.id} className="relative z-10">
                            <motion.button 
                              draggable
                              onDragStart={(e) => handleDragStart(e, event)}
                              onClick={() => setSelectedEventId(event.id)}
                              onMouseEnter={() => setHoveredEventId(event.id)}
                              onMouseLeave={() => setHoveredEventId(null)}
                              whileHover={{ x: 2 }}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-3 truncate",
                                getEventColor(event.type, event.status),
                                hoveredEventId === event.id && "ring-2 ring-primary/40 border-primary/40 scale-[1.03] shadow-2xl z-20"
                              )}
                            >
                              <div className={cn("w-2 h-2 rounded-full shrink-0", getEventDot(event.type, event.status))} />
                              <span className="truncate uppercase tracking-tight flex-1">{event.title}</span>
                            </motion.button>
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={() => { setAddModalInitialDate(day); setAddModalOpen(true); }}
                        className="w-full py-2 rounded-xl bg-white/5 border border-white/5 text-white/0 group-hover:text-primary group-hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto scrollbar-hide relative bg-white/[0.01] rounded-[2.5rem] border border-white/10 overflow-hidden">
               <div className="flex h-full min-w-[1200px]">
                  <div className="w-24 border-r border-white/10 flex flex-col pt-4 bg-black/40 backdrop-blur-md sticky left-0 z-30">
                     {HOURS.map(hour => (
                       <div key={hour} className="h-28 px-4 text-right flex items-start justify-end -mt-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/10">{hour}:00</span>
                       </div>
                     ))}
                  </div>

                  <div className="flex-1 grid grid-cols-7 divide-x divide-white/5">
                     {days.map((day) => {
                       const dayEvents = getEventsForDay(day);
                       return (
                         <div 
                           key={day.toISOString()} 
                           className={cn(
                             "relative group min-h-full",
                             isToday(day) && "bg-primary/[0.02]"
                           )}
                           onDragOver={(e) => e.preventDefault()}
                           onDrop={(e) => handleDrop(e, day)}
                         >
                            <div className="absolute inset-0 z-0 pointer-events-none divide-y divide-white/[0.03]">
                               {HOURS.map(hour => (
                                 <div key={hour} className="h-28" />
                               ))}
                            </div>

                            <div className="absolute inset-0 z-10 text-center opacity-0 group-hover:opacity-100 transition-opacity flex flex-col">
                               {HOURS.map(hour => (
                                   <button 
                                       key={hour}
                                       onClick={() => { setAddModalInitialDate(setHours(day, hour)); setAddModalOpen(true); }}
                                       className="h-28 w-full hover:bg-primary/[0.05] transition-all flex items-center justify-center border-b border-transparent group-hover:border-white/[0.02]"
                                   >
                                       <Plus className="w-6 h-6 text-primary/30" />
                                   </button>
                               ))}
                            </div>

                            <div className="relative z-20 h-full">
                              {dayEvents.map(event => {
                                const eventDate = parseISO(event.date);
                                const startPos = (getHours(eventDate) - 7 + getMinutes(eventDate) / 60) * 112;
                                const height = Math.max(70, (event.duration / 60) * 112);

                                return (
                                  <motion.div
                                    key={event.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, event)}
                                    onClick={() => setSelectedEventId(event.id)}
                                    onMouseEnter={() => setHoveredEventId(event.id)}
                                    onMouseLeave={() => setHoveredEventId(null)}
                                    whileHover={{ scale: 1.02, zIndex: 50 }}
                                    className={cn(
                                      "absolute left-3 right-3 rounded-[2rem] p-6 border transition-all cursor-grab active:cursor-grabbing select-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden group/ev",
                                      getEventColor(event.type, event.status)
                                    )}
                                    style={{ top: `${startPos}px`, height: `${height}px` }}
                                  >
                                     <div className="absolute top-0 left-0 w-full h-1.5 bg-white/10 group-hover/ev:bg-white/30 transition-colors" />
                                     <div>
                                        <div className="flex items-center gap-3 mb-3">
                                           <div className={cn("w-3 h-3 rounded-full shadow-lg", getEventDot(event.type, event.status))} />
                                           <p className="text-sm font-black uppercase tracking-tight truncate flex-1 leading-none">{event.title}</p>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">
                                           <span>{format(eventDate, 'HH:mm')}</span>
                                           <span>•</span>
                                           <span>{event.duration} MIN</span>
                                        </div>
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

        {/* Global Hover Preview (Detached) */}
        <AnimatePresence>
          {hoveredEventId && !selectedEventId && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[400px] z-[100] pointer-events-none"
            >
              {(() => {
                const event = planEvents.find(e => e.id === hoveredEventId);
                if (!event) return null;
                return (
                  <div className="p-8 pb-10 glass border border-white/20 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.9)] backdrop-blur-3xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary/40" />
                    <div className="flex items-center justify-between mb-6">
                      <div className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                        {event.type}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase">
                        <Clock className="w-3.5 h-3.5" />
                        {event.duration} MIN SESSION
                      </div>
                    </div>

                    <h4 className="text-xl font-bold text-white mb-4 leading-tight tracking-tight uppercase group-hover:text-primary transition-colors">
                      {event.title}
                    </h4>
                    
                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                        <p className="text-[12px] text-white/70 italic leading-relaxed font-medium">
                          "{event.aiRationale || event.description || 'Stratregy optimized for peak performance and recovery.'}"
                        </p>
                      </div>
                      
                      {event.exercises && event.exercises.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Target Elements</p>
                          <div className="flex flex-wrap gap-2">
                             {event.exercises.slice(0, 4).map((ex, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-white/40 uppercase">{ex.name}</span>
                             ))}
                             {event.exercises.length > 4 && <span className="text-[9px] font-black text-primary/60 uppercase">+{event.exercises.length-4} more</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend Footer */}
        <div className="px-12 py-10 border-t border-white/10 bg-black/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-12">
               <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
                  <span className="text-[11px] font-black uppercase text-white/30 tracking-[0.4em]">Strategy</span>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                  <span className="text-[11px] font-black uppercase text-white/30 tracking-[0.4em]">Fueling</span>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
                  <span className="text-[11px] font-black uppercase text-white/30 tracking-[0.4em]">Regen</span>
               </div>
            </div>
            <div className="flex items-center gap-6 opacity-30">
               <div className="h-px w-20 bg-white/20" />
               <p className="text-[10px] font-black uppercase italic tracking-[0.5em] text-white">Genesis Adaptive OS</p>
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
