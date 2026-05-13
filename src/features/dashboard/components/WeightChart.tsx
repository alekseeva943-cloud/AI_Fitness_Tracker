import React, { useMemo } from 'react';
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis, ReferenceLine } from 'recharts';
import { WeightEntry, Goal } from '../../../types';
import { formatDate } from '../../../lib/utils';
import { isAfter, parseISO } from 'date-fns';

interface WeightChartProps {
  data: WeightEntry[];
  goal?: Goal | null;
  forecastedDate?: string | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const unit = payload[0].payload.unit || 'кг';
    return (
      <div className="bg-zinc-900/90 border border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((p: any, i: number) => {
            if (p.value === null || p.value === undefined) return null;
            
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
        </div>
      </div>
    );
  }
  return null;
};

export const WeightChart: React.FC<WeightChartProps> = ({ data, goal, forecastedDate }) => {
  const chartData = useMemo(() => {
    if (!data.length && !goal) return [];

    const unit = goal?.unit || 'кг';

    // Combine real data and forecast
    const realSorted = [...data]
      .filter(e => e.date && !isNaN(new Date(e.date).getTime()))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Process real measurements (average per day)
    const dailyMap = new Map<string, number[]>();
    realSorted.forEach(e => {
      const d = new Date(e.date);
      const dayKey = d.toISOString().split('T')[0];
      const vals = dailyMap.get(dayKey) || [];
      vals.push(e.value);
      dailyMap.set(dayKey, vals);
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
          unit
        };
      })
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    if (processed.length === 0 && goal) {
      processed.push({
        dateKey: goal.startDate.split('T')[0],
        displayDate: formatDate(goal.startDate),
        current: goal.startValue,
        forecast: null as number | null,
        goal: goal.targetValue,
        unit
      });
    } else if (goal && processed.length > 0) {
      const startIso = goal.startDate.split('T')[0];
      if (startIso < processed[0].dateKey) {
        processed.unshift({
          dateKey: startIso,
          displayDate: formatDate(goal.startDate),
          current: goal.startValue,
          forecast: null as number | null,
          goal: goal.targetValue,
          unit
        });
      }
    }

    if (processed.length === 0) return [];

    const lastRealPoint = processed[processed.length - 1];
    if (!lastRealPoint) return processed;
    
    if (forecastedDate && goal && goal.status === 'ACTIVE') {
      const fDate = new Date(forecastedDate);
      if (!isNaN(fDate.getTime())) {
        const forecastIso = fDate.toISOString().split('T')[0];
        
        if (forecastIso >= lastRealPoint.dateKey) {
          lastRealPoint.forecast = lastRealPoint.current;
  
          processed.push({
            dateKey: forecastIso,
            displayDate: formatDate(forecastedDate),
            current: null as any,
            forecast: goal.targetValue,
            goal: goal.targetValue,
            unit
          });
        }
      }
    }

    return processed;
  }, [data, goal, forecastedDate]);

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

  if (!data.length) return (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center text-muted-foreground/40 italic">
       Нет данных для графика
    </div>
  );

  return (
    <div className="w-full h-full min-h-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#DFFF00" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#DFFF00" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#DFFF00" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#DFFF00" stopOpacity={0}/>
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
            cursor={{ stroke: '#DFFF00', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }}
          />

          {goal && (
            <ReferenceLine 
              y={goal.targetValue} 
              stroke="#DFFF00" 
              strokeDasharray="8 8" 
              strokeOpacity={0.2}
              label={{ 
                position: 'insideRight', 
                value: `ЦЕЛЬ: ${goal.targetValue} ${goal.unit}`, 
                fill: '#DFFF00', 
                fontSize: 10, 
                fontWeight: 'bold',
                opacity: 0.5,
                dy: -10
              }} 
            />
          )}

          <Area 
            name="current"
            type="monotone" 
            dataKey="current" 
            stroke="#DFFF00" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            animationDuration={1500}
            dot={{ r: 3, fill: '#DFFF00', stroke: '#000', strokeWidth: 1, fillOpacity: 1 }}
            activeDot={{ r: 8, fill: '#DFFF00', stroke: '#000', strokeWidth: 3 }}
            connectNulls={true}
          />

          <Area 
            name="forecast"
            type="monotone" 
            dataKey="forecast" 
            stroke="#DFFF00" 
            strokeWidth={2}
            strokeDasharray="6 6"
            fillOpacity={1} 
            fill="url(#colorForecast)" 
            animationDuration={2500}
            connectNulls={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
