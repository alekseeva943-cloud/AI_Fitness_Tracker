import React, { useMemo } from 'react';
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis, ReferenceLine } from 'recharts';
import { WeightEntry, Goal } from '../../../types';
import { formatDate } from '../../../lib/utils';
import { motion } from 'motion/react';

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
  workouts?: { date: string; intensity?: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const unit = payload[0].payload.unit || '';
    const workout = payload[0].payload.workout;
    return (
      <div className="bg-zinc-900/90 border border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-xl">
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
          {workout && (
            <div className="pt-2 mt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-bold uppercase text-primary">Тренировка!</p>
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

export const MetricChart: React.FC<MetricChartProps> = ({ data, goal, forecastedDate, unit: propUnit, color = "#DFFF00", workouts = [] }) => {
  const chartData = useMemo(() => {
    if (!data.length && !goal) return [];

    const unit = propUnit || goal?.unit || '';

    // Process real measurements (average per day)
    const dailyMap = new Map<string, number[]>();
    data.forEach(e => {
      if (!isValidDate(e.date)) return;
      const d = new Date(e.date);
      const dayKey = d.toISOString().split('T')[0];
      const vals = dailyMap.get(dayKey) || [];
      vals.push(e.value);
      dailyMap.set(dayKey, vals);
    });

    // Workout Map
    const workoutMap = new Map<string, boolean>();
    workouts.forEach(w => {
      if (!isValidDate(w.date)) return;
      const dayKey = new Date(w.date).toISOString().split('T')[0];
      workoutMap.set(dayKey, true);
    });

    const processed = Array.from(dailyMap.entries())
      .map(([dateKey, vals]) => {
        const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
        return {
          dateKey,
          displayDate: formatDate(new Date(dateKey)),
          current: Number(avg.toFixed(1)),
          forecast: null as number | null,
          goal: goal?.targetValue,
          unit,
          workout: workoutMap.has(dateKey)
        };
      })
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    if (processed.length === 0 && goal && isValidDate(goal.startDate)) {
      const startIso = new Date(goal.startDate).toISOString().split('T')[0];
      processed.push({
        dateKey: startIso,
        displayDate: formatDate(goal.startDate),
        current: goal.startValue,
        forecast: null as number | null,
        goal: goal.targetValue,
        unit,
        workout: workoutMap.has(startIso)
      });
    } else if (goal && processed.length > 0 && isValidDate(goal.startDate)) {
      const startIso = new Date(goal.startDate).toISOString().split('T')[0];
      if (startIso < processed[0].dateKey) {
        processed.unshift({
          dateKey: startIso,
          displayDate: formatDate(goal.startDate),
          current: goal.startValue,
          forecast: null as number | null,
          goal: goal.targetValue,
          unit,
          workout: workoutMap.has(startIso)
        });
      }
    }

    if (processed.length === 0) return [];

    const lastRealPoint = processed[processed.length - 1];
    if (!lastRealPoint) return processed;
    
    if (forecastedDate && goal && goal.status === 'ACTIVE' && isValidDate(forecastedDate)) {
      const fDate = new Date(forecastedDate);
      const forecastIso = fDate.toISOString().split('T')[0];
      
      if (forecastIso >= lastRealPoint.dateKey) {
          lastRealPoint.forecast = lastRealPoint.current;
  
          processed.push({
            dateKey: forecastIso,
            displayDate: formatDate(forecastedDate),
            current: null as any,
            forecast: goal.targetValue,
            goal: goal.targetValue,
            unit,
            workout: false
          });
        }
      }

    return processed;
  }, [data, goal, forecastedDate, propUnit, workouts]);

  const minVal = useMemo(() => {
    if (!chartData.length) return 0;
    const values: number[] = chartData.map(d => d.current).filter(v => v !== null && !isNaN(v));
    chartData.forEach(d => { if (d.forecast !== null && !isNaN(d.forecast)) values.push(d.forecast); });
    if (goal && !isNaN(goal.targetValue)) values.push(goal.targetValue);
    
    if (values.length === 0) return 0;
    const min = Math.min(...values);
    return Math.max(0, min - (min * 0.05));
  }, [chartData, goal]);

  const maxVal = useMemo(() => {
    if (!chartData.length) return 100;
    const values: number[] = chartData.map(d => d.current).filter(v => v !== null && !isNaN(v));
    chartData.forEach(d => { if (d.forecast !== null && !isNaN(d.forecast)) values.push(d.forecast); });
    if (goal && !isNaN(goal.targetValue)) values.push(goal.targetValue);
    
    if (values.length === 0) return 100;
    const max = Math.max(...values);
    return max + (max * 0.05);
  }, [chartData, goal]);

  if (!data.length && !goal) return (
    <div className="w-full h-full min-h-[200px] flex items-center justify-center text-muted-foreground/40 italic text-xs">
       Нет данных
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full h-full min-h-[200px] relative"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis 
            dataKey="displayDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
            dy={15}
          />
          <YAxis 
            hide 
            domain={[minVal, maxVal]} 
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }}
          />

          {goal && (
            <ReferenceLine 
              y={goal.targetValue} 
              stroke={color} 
              strokeDasharray="8 8" 
              strokeOpacity={0.2}
              label={{ 
                position: 'insideRight', 
                value: `ЦЕЛЬ: ${goal.targetValue} ${propUnit || goal.unit}`, 
                fill: color, 
                fontSize: 10, 
                fontWeight: 'bold',
                opacity: 0.5,
                dy: -10
              }} 
            />
          )}

          {goal && (
            <ReferenceLine 
              y={goal.startValue} 
              stroke="#71717a" 
              strokeDasharray="4 4" 
              strokeOpacity={0.3}
              label={{ 
                position: 'insideLeft', 
                value: `СТАРТ: ${goal.startValue} ${propUnit || goal.unit}`, 
                fill: '#71717a', 
                fontSize: 9, 
                fontWeight: 'bold',
                opacity: 0.5,
                dy: 10
              }} 
            />
          )}

          <Area 
            name="current"
            type="monotone" 
            dataKey="current" 
            stroke={color} 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            animationDuration={1500}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              if (payload.workout) {
                return (
                  <g key={`dot-${payload.dateKey}`}>
                    <circle cx={cx} cy={cy} r={6} fill={color} stroke="#000" strokeWidth={2} />
                    <circle cx={cx} cy={cy} r={8} fill={color} fillOpacity={0.2} className="animate-pulse" />
                  </g>
                );
              }
              return <circle key={`dot-${payload.dateKey}`} cx={cx} cy={cy} r={3} fill={color} stroke="#000" strokeWidth={1} />;
            }}
            activeDot={{ r: 8, fill: color, stroke: '#000', strokeWidth: 3 }}
            connectNulls={true}
          />

          <Area 
            name="forecast"
            type="monotone" 
            dataKey="forecast" 
            stroke={color} 
            strokeWidth={2}
            strokeDasharray="6 6"
            fillOpacity={1} 
            fill="url(#colorForecast)" 
            animationDuration={2500}
            connectNulls={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

