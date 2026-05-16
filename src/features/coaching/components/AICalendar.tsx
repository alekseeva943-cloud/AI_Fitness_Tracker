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
    if (status === 'COMPLETED') return 'bg-green-500/10 border-green-500/20 text-green-400';
    if (type === 'WORKOUT') return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
    if (type === 'NUTRITION') return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    if (type === 'RECOVERY') return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
    return 'bg-white/5 border-white/10 text-white';
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

        {/* Content Body */}
        {view === 'month' ? (
          <div className="flex-1 grid grid-cols-7 overflow-y-auto scrollbar-hide divide-x divide-y divide-white/5">
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
                    "min-h-[160px] p-4 transition-all group relative",
                    !isCurrentMonth && "bg-black/40 opacity-20",
                    isCurrentMonth && "hover:bg-white/[0.015]",
                    isTodayDate && "bg-primary/[0.02]"
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                     <span className={cn(
                       "w-10 h-10 flex items-center justify-center rounded-2xl text-[13px] font-black transition-all border",
                       isTodayDate ? "bg-primary border-primary/20 text-black shadow-lg shadow-primary/30" : "bg-white/5 border-white/5 text-muted-foreground group-hover:text-white"
                     )}>
                       {format(day, 'd')}
                     </span>
                     <button 
                        onClick={() => { setAddModalInitialDate(day); setAddModalOpen(true); }}
                        className="p-2.5 rounded-xl bg-white/5 text-muted-foreground/0 group-hover:text-muted-foreground/40 hover:bg-primary/20 hover:text-primary transition-all shadow-xl"
                      >
                         <Plus className="w-4 h-4" />
                      </button>
                  </div>

                  <div className="space-y-2">
                    {dayEvents.map(event => (
                      <div key={event.id} className="relative">
                        <motion.div 
                          draggable
                          onDragStart={(e) => handleDragStart(e, event)}
                          onClick={() => setSelectedEvent(event)}
                          onMouseEnter={() => setHoveredEventId(event.id)}
                          onMouseLeave={() => setHoveredEventId(null)}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.05, x: 2, zIndex: 50 }}
                          className={cn(
                            "group/event relative px-3 py-2.5 rounded-xl text-[10px] font-black border transition-all cursor-grab active:cursor-grabbing flex items-center gap-2",
                            getEventColor(event.type, event.status),
                            event.status === 'COMPLETED' && "opacity-50 line-through grayscale"
                          )}
                        >
                          <div className={cn(
                            "w-1.5 h-4 rounded-full shrink-0",
                            event.status === 'COMPLETED' ? "bg-green-500" : 
                            event.type === 'WORKOUT' ? "bg-orange-500" :
                            event.type === 'NUTRITION' ? "bg-blue-500" : "bg-primary"
                          )} />
                          <span className="truncate flex-1">{event.title}</span>
                          {event.source === 'AI' && <Brain className="w-3 h-3 text-current opacity-40 shrink-0" />}
                          
                          {event.status === 'ACTIVE' && (
                            <div className="absolute -right-1 top-0 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </div>
                          )}
                        </motion.div>

                        {/* Hover Preview Tooltip */}
                        <AnimatePresence>
                          {hoveredEventId === event.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.9 }}
                              className="absolute top-full left-0 right-0 mt-2 p-4 glass border border-white/10 rounded-2xl z-[100] pointer-events-none shadow-2xl"
                            >
                               <div className="flex items-center gap-2 mb-2">
                                  {getEventIcon(event.type)}
                                  <p className="text-[10px] font-black uppercase tracking-tight">{event.title}</p>
                               </div>
                               <div className="space-y-2">
                                  <div className="flex items-center justify-between text-[8px] font-black uppercase text-muted-foreground/60">
                                     <span>{event.duration} МИН</span>
                                     <span>{event.metadata?.intensity || 'MEDIUM'} LOAD</span>
                                  </div>
                                  <p className="text-[9px] text-muted-foreground line-clamp-2 italic leading-relaxed">
                                     {event.description || event.aiRationale || 'Детали в полном описании...'}
                                  </p>
                               </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  {/* Day cell bottom padding */}
                  <div className="h-4" />
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
                              whileHover={{ scale: 1.02, x: 2 }}
                              className={cn(
                                "absolute left-2 right-2 rounded-2xl p-4 border transition-all cursor-grab active:cursor-grabbing group/wevent select-none",
                                getEventColor(event.type, event.status),
                                event.status === 'COMPLETED' && "opacity-50"
                              )}
                              style={{ top: `${startPos + 16}px`, height: `${height}px` }}
                            >
                               <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                     <div className="flex items-center gap-2">
                                        <p className="text-[10px] font-black uppercase tracking-tight truncate max-w-[120px]">{event.title}</p>
                                        {event.source === 'AI' && <Brain className="w-3 h-3 opacity-40 shrink-0" />}
                                     </div>
                                     <p className="text-[8px] font-bold opacity-60">{format(eventDate, 'HH:mm')} • {event.duration}m</p>
                                  </div>
                                  <div className="p-1 px-2 rounded-lg bg-white/5 border border-white/10">
                                     {getEventIcon(event.type)}
                                  </div>
                               </div>

                               <div className="mt-3 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                     <div className="flex -space-x-1 grayscale">
                                        <div className="w-4 h-4 rounded-full bg-white/10 border border-white/10" />
                                        <div className="w-4 h-4 rounded-full bg-white/20 border border-white/10" />
                                     </div>
                                     <div className="text-[7px] font-bold opacity-40 uppercase">Session Link</div>
                                  </div>
                                  {event.metadata?.intensity === 'HIGH' && (
                                     <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                                  )}
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

