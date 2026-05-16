import React, { useState } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, 
  eachDayOfInterval, isToday, parseISO, startOfDay
} from 'date-fns';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Brain, Plus, Activity, Zap, CheckCircle2, MoreHorizontal 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFitnessStore } from '../../../store/useFitnessStore';
import { cn } from '../../../lib/utils';
import { PlanEvent } from '../../../types';

export const AICalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const planEvents = useFitnessStore(state => state.planEvents);
  const updatePlanEvent = useFitnessStore(state => state.updatePlanEvent);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getEventsForDay = (day: Date) => {
    return planEvents.filter(event => isSameDay(parseISO(event.date), day));
  };

  return (
    <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col h-[700px]">
      {/* Calendar Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3">
              <h2 className="text-2xl font-display font-medium">{format(currentDate, 'MMMM yyyy')}</h2>
              <div className="flex items-center gap-1">
                 <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-xl transition-all text-muted-foreground"><ChevronLeft className="w-4 h-4" /></button>
                 <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-xl transition-all text-muted-foreground"><ChevronRight className="w-4 h-4" /></button>
              </div>
           </div>

           <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
              <button 
                onClick={() => setView('month')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  view === 'month' ? "bg-primary text-black" : "text-muted-foreground hover:text-white"
                )}
              >Month</button>
              <button 
                onClick={() => setView('week')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  view === 'week' ? "bg-primary text-black" : "text-muted-foreground hover:text-white"
                )}
              >Week</button>
           </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all">
           <Plus className="w-4 h-4" />
           Add Event
        </button>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.01]">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 overflow-y-auto scrollbar-hide">
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day);

          return (
            <div 
              key={day.toISOString()} 
              className={cn(
                "min-h-[120px] p-2 border-r border-b border-white/5 transition-all group relative",
                !isCurrentMonth && "bg-black/20 opacity-20",
                isCurrentMonth && "hover:bg-white/[0.02]"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                 <span className={cn(
                   "w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all",
                   isTodayDate ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-muted-foreground group-hover:text-white"
                 )}>
                   {format(day, 'd')}
                 </span>
                 {isTodayDate && <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 pointer-events-none" />}
              </div>

              <div className="space-y-1.5">
                {dayEvents.map(event => (
                  <div 
                    key={event.id}
                    className={cn(
                      "group/event relative px-2 py-1.5 rounded-lg text-[9px] font-bold border transition-all cursor-pointer flex items-center gap-1.5",
                      event.isCompleted ? "opacity-40 bg-green-500/5 border-green-500/10 line-through text-green-400/60" :
                      event.source === 'AI' 
                        ? "bg-primary/10 border-primary/20 text-primary shadow-[0_0_10px_rgba(223,255,0,0.05)] hover:shadow-primary/10" 
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      event.isCompleted ? "bg-green-500" : (event.source === 'AI' ? "bg-primary animate-pulse" : "bg-white/40")
                    )} />
                    <span className="truncate">{event.title}</span>
                    {event.source === 'AI' && <Brain className="w-3 h-3 ml-auto opacity-40 shrink-0" />}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[8px] text-muted-foreground/40 text-center uppercase font-black">+ {dayEvents.length - 3} more</div>
                )}
              </div>

              {/* Day Hover Actions */}
              <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary transition-all">
                   <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
