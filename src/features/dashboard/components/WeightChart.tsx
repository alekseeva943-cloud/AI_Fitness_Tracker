import React from 'react';
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { WeightEntry } from '../../../types';
import { formatDate, formatWeight } from '../../../lib/utils';

interface WeightChartProps {
  data: WeightEntry[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1">{label}</p>
        <p className="text-sm font-display font-medium text-primary">
          {formatWeight(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export const WeightChart: React.FC<WeightChartProps> = ({ data }) => {
  const chartData = [...data].reverse().map(entry => ({
    date: formatDate(entry.date),
    value: entry.value,
  }));

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#DFFF00" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#DFFF00" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 10 }}
            dy={10}
          />
          <YAxis 
            hide 
            domain={['dataMin - 1', 'dataMax + 1']} 
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: '#ffffff20', strokeWidth: 1 }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#DFFF00" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
