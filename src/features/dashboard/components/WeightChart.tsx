import React from 'react';
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { WeightEntry } from '../../../types';
import { formatDate } from '../../../lib/utils';

interface WeightChartProps {
  data: WeightEntry[];
}

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
            contentStyle={{ 
              backgroundColor: '#18181b', 
              border: '1px solid #27272a', 
              borderRadius: '12px',
              fontSize: '12px'
            }}
            itemStyle={{ color: '#DFFF00' }}
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
