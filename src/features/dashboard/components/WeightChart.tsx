import React, { useMemo } from 'react';
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis, ReferenceLine } from 'recharts';
import { WeightEntry, Goal } from '../../../types';
import { formatDate, formatWeight } from '../../../lib/utils';
import { isAfter, parseISO } from 'date-fns';

interface WeightChartProps {
  data: WeightEntry[];
  goal?: Goal | null;
  forecastedDate?: string | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/90 border border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-display font-bold" style={{ color: p.color }}>
            {p.name === 'current' ? 'Факт: ' : 'Цель: '}
            {formatWeight(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const WeightChart: React.FC<WeightChartProps> = ({ data, goal, forecastedDate }) => {
  const chartData = useMemo(() => {
    if (!data.length) return [];

    // Sort by date ascending for the chart
    const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Process data to avoid duplicate dates on X-axis (average per day)
    const dailyMap = new Map<string, number[]>();
    sorted.forEach(e => {
      const day = formatDate(e.date);
      const vals = dailyMap.get(day) || [];
      vals.push(e.value);
      dailyMap.set(day, vals);
    });

    const processed = Array.from(dailyMap.entries()).map(([date, vals]) => {
      const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
      return {
        date,
        current: Number(avg.toFixed(1)),
        goal: goal?.targetValue
      };
    });

    // Add forecast point if available
    if (forecastedDate && goal) {
      processed.push({
        date: formatDate(forecastedDate),
        current: goal.targetValue,
        goal: goal.targetValue
      });
    }

    return processed;
  }, [data, goal, forecastedDate]);

  const minVal = useMemo(() => {
    if (!chartData.length) return 0;
    const values = chartData.map(d => d.current);
    if (goal) values.push(goal.targetValue);
    return Math.min(...values);
  }, [chartData, goal]);

  const maxVal = useMemo(() => {
    if (!chartData.length) return 100;
    const values = chartData.map(d => d.current);
    if (goal) values.push(goal.targetValue);
    return Math.max(...values);
  }, [chartData, goal]);

  if (!data.length) return null;

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#DFFF00" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#DFFF00" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorGoal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#71717a" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#71717a" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="5 5" stroke="#ffffff05" vertical={false} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 9, fontWeight: 500 }}
            dy={15}
            interval="preserveStartEnd"
          />
          <YAxis 
            hide 
            domain={[minVal - 2, maxVal + 2]} 
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: '#DFFF00', strokeWidth: 1, strokeDasharray: '5 5' }}
          />

          {goal && (
            <ReferenceLine 
              y={goal.targetValue} 
              stroke="#DFFF00" 
              strokeDasharray="5 5" 
              strokeOpacity={0.5}
              label={{ position: 'right', value: 'ЦЕЛЬ', fill: '#DFFF00', fontSize: 9, fontWeight: 'bold' }} 
            />
          )}

          {goal && (
            <Area 
              name="goal"
              type="monotone" 
              dataKey="goal" 
              stroke="#71717a" 
              strokeWidth={1}
              strokeDasharray="3 3"
              fillOpacity={1} 
              fill="url(#colorGoal)" 
              animationDuration={1500}
            />
          )}

          <Area 
            name="current"
            type="monotone" 
            dataKey="current" 
            stroke="#DFFF00" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            animationDuration={2000}
            activeDot={{ r: 6, fill: '#DFFF00', stroke: '#000', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
