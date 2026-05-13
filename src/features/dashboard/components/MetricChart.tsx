import React, { useMemo } from 'react';
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis, ReferenceLine } from 'recharts';
import { WeightEntry, Goal } from '../../../types';
import { formatDate, cn } from '../../../lib/utils';
import { THEME } from '../../../constants/theme';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DataPoint {
  date: string;
  value: number;
}

interface MetricChartProps {
  data: DataPoint[];
  goal?: Goal | null;
  forecastedDate?: string | null;
  unit?: string;
  color?: string;
  workouts?: any[]; // Full workout objects
  onPointClick?: (type: 'workout' | 'measurement', id: string, original: any) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const unit = payload[0].payload.unit || '';
    const workoutsAtDate = payload[0].payload.workoutsAtDate || [];
    return (
      <div className="bg-zinc-900/90 border border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-xl max-w-[200px]">
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((p: any, i: number) => {
            if (p.value === null || p.value === undefined || p.name === 'workout') return null;
            
            const nameMap: Record<string, string> = {
              current: 'Факт: ',
              forecast: 'Прогноз: ',
              goal: 'Цель: '
            };

            return (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                <p className="text-sm font-display font-medium" style={{ color: p.color }}>
                  {nameMap[p.name] || p.name}
                  <span className="font-bold text-white ml-1">{p.value} {unit}</span>
                </p>
              </div>
            );
          })}
          {workoutsAtDate.length > 0 && (
            <div className="pt-2 mt-2 border-t border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-bold uppercase text-primary">Тренировки:</p>
              </div>
              <div className="space-y-1">
                {workoutsAtDate.map((w: any) => (
                  <p key={w.id} className="text-[9px] text-muted-foreground truncate">• {w.type}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const isValidDate = (d: any) => {
  if (!d) return false;
  const date = new Date(d);
  return date instanceof Date && !isNaN(date.getTime());
};

export const MetricChart: React.FC<MetricChartProps> = ({ data, goal, forecastedDate, unit: propUnit, color = THEME.colors.primary, workouts = [], onPointClick }) => {
  const chartData = useMemo(() => {
    const unit = propUnit || goal?.unit || '';

    // Process real measurements
    const dailyMap = new Map<string, { avg: number, entries: any[] }>();
    data.forEach((e: any) => {
      if (!isValidDate(e.date)) return;
      const d = new Date(e.date);
      const dayKey = d.toISOString().split('T')[0];
      const existing = dailyMap.get(dayKey) || { avg: 0, entries: [] };
      existing.entries.push(e);
      dailyMap.set(dayKey, existing);
    });

    // Collect all dates from data and workouts
    const allDates = new Set<string>();
    dailyMap.forEach((_, key) => allDates.add(key));
    workouts.forEach(w => {
      if (isValidDate(w.date)) {
        allDates.add(new Date(w.date).toISOString().split('T')[0]);
      }
    });

    // Workout Map
    const workoutMap = new Map<string, any[]>();
    workouts.forEach(w => {
      if (!isValidDate(w.date)) return;
      const dayKey = new Date(w.date).toISOString().split('T')[0];
      const list = workoutMap.get(dayKey) || [];
      list.push(w);
      workoutMap.set(dayKey, list);
    });

    let processed = Array.from(allDates)
      .map((dateKey) => {
        const measurement = dailyMap.get(dateKey);
        const avg = measurement ? measurement.entries.reduce((s, v) => s + (v.value || v.current || 0), 0) / measurement.entries.length : null;
        
        return {
          dateKey,
          displayDate: formatDate(new Date(dateKey)),
          current: avg !== null ? Number(avg.toFixed(1)) : null,
          forecast: null as number | null,
          goal: goal?.targetValue,
          unit,
          workout: workoutMap.has(dateKey),
          workoutsAtDate: workoutMap.get(dateKey) || [],
          measurementEntries: measurement?.entries || [],
          isForecast: false
        };
      })
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    // Ensure we have a baseline if weightHistory is empty OR the goal start is earlier than first entry
    if (goal && isValidDate(goal.startDate)) {
      const startIso = new Date(goal.startDate).toISOString().split('T')[0];
      const hasRealStart = goal.startValue > 0;
      
      if (processed.length === 0) {
        processed.push({
          dateKey: startIso,
          displayDate: formatDate(goal.startDate),
          current: hasRealStart ? goal.startValue : null,
          forecast: null as number | null,
          goal: goal.targetValue,
          unit,
          workout: workoutMap.has(startIso),
          workoutsAtDate: workoutMap.get(startIso) || [],
          measurementEntries: [],
          isForecast: false
        });
      } else if (startIso < processed[0].dateKey) {
        processed.unshift({
          dateKey: startIso,
          displayDate: formatDate(goal.startDate),
          current: hasRealStart ? goal.startValue : processed[0].current,
          forecast: null as number | null,
          goal: goal.targetValue,
          unit,
          workout: workoutMap.has(startIso),
          workoutsAtDate: workoutMap.get(startIso) || [],
          measurementEntries: [],
          isForecast: false
        });
      }
    }

    // Fill startValue from first real data if goal start value is null/zero
    if (processed.length > 0 && processed[0].current === null) {
       const firstReal = processed.find(p => p.current !== null && p.current > 0);
       if (firstReal) {
          processed[0].current = firstReal.current;
       }
    }

    // Linear interpolation for missing measurements
    for (let i = 0; i < processed.length; i++) {
      if (processed[i].current === null) {
        // Find previous non-null
        let prev = null;
        for (let j = i - 1; j >= 0; j--) {
          if (processed[j].current !== null) {
            prev = processed[j];
            break;
          }
        }
        
        // Find next non-null
        let next = null;
        for (let j = i + 1; j < processed.length; j++) {
          if (processed[j].current !== null) {
            next = processed[j];
            break;
          }
        }
        
        if (prev && next) {
          const t1 = new Date(prev.dateKey).getTime();
          const t2 = new Date(next.dateKey).getTime();
          const t = new Date(processed[i].dateKey).getTime();
          const ratio = (t - t1) / (t2 - t1);
          processed[i].current = Number((prev.current + (next.current - prev.current) * ratio).toFixed(1));
        } else if (prev) {
          processed[i].current = prev.current;
        } else if (next) {
          processed[i].current = next.current;
        }
      }
    }

    // If still everything is null (can happen if goal startValue was also 0/null and no measurements)
    // Fallback to goal target or some default to avoid crash
    if (processed.every(p => p.current === null)) {
       const fallback = goal?.targetValue || 70;
       processed.forEach(p => { p.current = fallback; });
    }

    if (processed.length === 0) return [];

    // If only one point, add a tiny offset point to make it visible in Recharts
    if (processed.length === 1) {
      const single = processed[0];
      const nextDay = new Date(new Date(single.dateKey).getTime() + 86400000);
      processed.push({
        ...single,
        dateKey: nextDay.toISOString().split('T')[0],
        displayDate: formatDate(nextDay),
      });
    }

    const lastRealPoint = processed[processed.length - 1];
    if (!lastRealPoint) return processed;
    
    if (forecastedDate && goal && goal.status === 'ACTIVE' && isValidDate(forecastedDate)) {
      const fDate = new Date(forecastedDate);
      const forecastIso = fDate.toISOString().split('T')[0];
      
      if (forecastIso >= lastRealPoint.dateKey) {
          const daysGap = Math.abs(new Date(forecastIso).getTime() - new Date(lastRealPoint.dateKey).getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysGap > 30) {
            const midDate = new Date(new Date(lastRealPoint.dateKey).getTime() + (new Date(forecastIso).getTime() - new Date(lastRealPoint.dateKey).getTime()) / 2);
            processed.push({
              dateKey: midDate.toISOString().split('T')[0],
              displayDate: formatDate(midDate),
              current: null as any,
              forecast: (lastRealPoint.current + goal.targetValue) / 2,
              goal: goal.targetValue,
              unit,
              workout: false,
              workoutsAtDate: [],
              measurementEntries: [],
              isForecast: true
            });
          }

          lastRealPoint.forecast = lastRealPoint.current;
  
          processed.push({
            dateKey: forecastIso,
            displayDate: formatDate(forecastedDate),
            current: null as any,
            forecast: goal.targetValue,
            goal: goal.targetValue,
            unit,
            workout: false,
            workoutsAtDate: [],
            measurementEntries: [],
            isForecast: true
          });
        }
      }

    console.log('[MetricChart] Rendering with data points:', processed.length, unit);
    if (processed.length > 0) console.log('[MetricChart] First point:', processed[0], 'Last point:', processed[processed.length-1]);

    return processed;
  }, [data, goal, forecastedDate, propUnit, workouts]);

  const minVal = useMemo(() => {
    if (!chartData.length) return 0;
    const values: number[] = chartData.map(d => d.current).filter(v => v !== null && !isNaN(v));
    chartData.forEach(d => { if (d.forecast !== null && !isNaN(d.forecast)) values.push(d.forecast); });
    if (goal && !isNaN(goal.targetValue)) values.push(goal.targetValue);
    if (goal && !isNaN(goal.startValue)) values.push(goal.startValue);
    
    if (values.length === 0) return 0;
    const min = Math.min(...values);
    return Math.max(0, min - Math.max(2, min * 0.05));
  }, [chartData, goal]);

  const maxVal = useMemo(() => {
    if (!chartData.length) return 100;
    const values: number[] = chartData.map(d => d.current).filter(v => v !== null && !isNaN(v));
    chartData.forEach(d => { if (d.forecast !== null && !isNaN(d.forecast)) values.push(d.forecast); });
    if (goal && !isNaN(goal.targetValue)) values.push(goal.targetValue);
    if (goal && !isNaN(goal.startValue)) values.push(goal.startValue);
    
    if (values.length === 0) return 100;
    const max = Math.max(...values);
    return max + Math.max(2, max * 0.05);
  }, [chartData, goal]);

  const showArrow = useMemo(() => {
    // Filter out forecast points for trend calculation
    const realPoints = chartData.filter(p => !p.isForecast && p.current !== null);
    if (realPoints.length < 2) return null;
    
    const first = realPoints[0].current;
    const last = realPoints[realPoints.length - 1].current;
    
    if (first === undefined || last === undefined || first === last) return null;
    return last > first ? 'up' : 'down';
  }, [chartData]);

  if (!data.length && !goal) return (
    <div className="w-full h-full min-h-[260px] flex items-center justify-center text-muted-foreground/40 italic text-xs">
       Нет данных для отображения графика
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full h-full min-h-[260px] relative group"
    >
      {showArrow && (
        <div className={cn(
          "absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border backdrop-blur-md transition-all group-hover:scale-110",
          showArrow === 'up' ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
        )}>
           {showArrow === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
           <span className="text-[10px] font-black uppercase tracking-widest">{showArrow === 'up' ? 'Рост' : 'Спад'}</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.05}/>
              <stop offset="95%" stopColor={color} stopOpacity={0.01}/>
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
          <XAxis 
            dataKey="displayDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 9, fontWeight: 700 }}
            dy={15}
            minTickGap={30}
          />
          <YAxis 
            hide 
            domain={[minVal, maxVal]} 
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.3 }}
          />

           {goal && (
            <ReferenceLine 
              y={goal.targetValue} 
              stroke={color} 
              strokeDasharray="10 5" 
              strokeOpacity={0.4}
              label={{ 
                position: 'insideTopRight', 
                value: `ЦЕЛЬ: ${goal.targetValue}`, 
                fill: color, 
                fontSize: 10, 
                fontWeight: 900,
                opacity: 0.6,
                tracking: '0.1em',
                dy: -12
              }} 
            />
          )}

          {goal && chartData.length > 0 && chartData.filter(p => !p.isForecast).length < 3 && (
            <ReferenceLine 
              segment={[
                { x: chartData[0].displayDate, y: goal.startValue },
                { x: chartData[chartData.length - 1].displayDate, y: goal.targetValue }
              ]}
              stroke={color}
              strokeWidth={1}
              strokeDasharray="5 5"
              strokeOpacity={0.1}
            />
          )}

          <Area 
            name="current"
            type="monotone" 
            dataKey="current" 
            stroke={color} 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            animationDuration={2000}
            style={{ filter: 'url(#glow)' }}
            dot={(props: any) => {
              const { cx, cy, payload, index } = props;
              const isStart = index === 0;
              
              const handleClick = (e: React.MouseEvent) => {
                e.stopPropagation();
                if (onPointClick) {
                  if (payload.workoutsAtDate.length > 0) {
                    onPointClick('workout', payload.workoutsAtDate[0].id, payload.workoutsAtDate[0]);
                  } else if (payload.measurementEntries.length > 0) {
                    onPointClick('measurement', payload.measurementEntries[0].id, payload.measurementEntries[0]);
                  }
                }
              };

              if (payload.workout) {
                return (
                  <g key={`dot-${payload.dateKey}`} className="cursor-pointer" onClick={handleClick}>
                    <circle cx={cx} cy={cy} r={5} fill={color} stroke="#000" strokeWidth={1.5} />
                    <circle cx={cx} cy={cy} r={10} fill={color} fillOpacity={0.1} className="animate-pulse" />
                  </g>
                );
              }

              if (isStart) {
                return (
                  <g key={`start-dot`}>
                    <circle cx={cx} cy={cy} r={6} fill="#fff" stroke={color} strokeWidth={2} />
                    <circle cx={cx} cy={cy} r={12} fill={color} fillOpacity={0.15} className="animate-pulse" />
                    <text x={cx} y={cy - 15} textAnchor="middle" fill="#71717a" fontSize="8" fontWeight="bold">СТАРТ</text>
                  </g>
                );
              }
              
              // Standard interactive point
              return (
                <circle 
                  key={`dot-${index}`}
                  cx={cx} cy={cy} r={3} 
                  fill={color}
                  fillOpacity={0.4}
                  stroke={color}
                  strokeWidth={1}
                  className="cursor-pointer hover:fill-white hover:fill-opacity-100 transition-all" 
                  onClick={handleClick}
                />
              );
            }}
            activeDot={{ r: 6, fill: color, stroke: '#000', strokeWidth: 2 }}
            connectNulls={true}
          />

          <Area 
            name="forecast"
            type="monotone" 
            dataKey="forecast" 
            stroke={color} 
            strokeWidth={2}
            strokeDasharray="5 5"
            strokeOpacity={0.6}
            fillOpacity={1} 
            fill="url(#colorForecast)" 
            animationDuration={3000}
            connectNulls={true}
            dot={(props: any) => {
              const { cx, cy, payload, index } = props;
              const isLast = index === chartData.length - 1;
              if (isLast && payload.isForecast) {
                return (
                  <g key="forecast-end">
                    <circle cx={cx} cy={cy} r={5} fill={color} stroke="#000" strokeWidth={1} />
                    <text x={cx} y={cy - 15} textAnchor="middle" fill={color} fontSize="8" fontWeight="800">ПРОГНОЗ</text>
                    <path d={`M${cx},${cy} L${cx},${cy+40}`} stroke={color} strokeWidth={1} strokeDasharray="2 2" strokeOpacity={0.5} />
                  </g>
                );
              }
              return null;
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

