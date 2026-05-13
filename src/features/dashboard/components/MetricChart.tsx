import React, { useMemo } from 'react';
import { AreaChart, Area, LineChart, Line, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis, ReferenceLine, ComposedChart } from 'recharts';
import { WeightEntry, Goal, GoalType } from '../../../types';
import { formatDate, cn } from '../../../lib/utils';
import { THEME } from '../../../constants/theme';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { METRICS } from '../../../constants/metrics';

import { buildChartTimeline, ChartDataPoint } from '../../../lib/chart-engine';

interface MetricChartProps {
  data: any[]; // Raw data points
  goal?: Goal | null;
  forecastedDate?: string | null;
  unit?: string;
  metricId?: string;
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
              goal: 'Цель: ',
              ideal: 'Путь: '
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

export const MetricChart: React.FC<MetricChartProps> = ({ 
  data, 
  goal, 
  forecastedDate, 
  unit: propUnit, 
  metricId = 'weight',
  color = THEME.colors.primary, 
  workouts = [], 
  onPointClick 
}) => {
  const chartData = useMemo(() => {
    return buildChartTimeline(data, workouts, goal, metricId, forecastedDate);
  }, [data, goal, forecastedDate, propUnit, metricId, workouts]);

  if (chartData.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center opacity-40 space-y-4">
        <Activity className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest italic text-center">
          Нет данных для анализа {METRICS[metricId || '']?.label || ''}
          <br />
          <span className="text-[10px] mt-2 block">Добавьте тренировки или замеры</span>
        </p>
      </div>
    );
  }

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

  const trendInfo = useMemo(() => {
    // Filter out forecast points for trend calculation
    const realPoints = chartData.filter(p => !p.isForecast && p.current !== null);
    if (realPoints.length < 2) return null;
    
    const first = realPoints[0].current!;
    const last = realPoints[realPoints.length - 1].current!;
    
    if (first === last) return null;
    const isUp = last > first;
    
    // Determine if the trend is positive or negative based on goal type or direction
    const isDownGoal = goal?.type === GoalType.WEIGHT_LOSS || (goal && goal.startValue > goal.targetValue);
    
    let label = '';
    let isPositive = true;
    
    if (isDownGoal) {
      label = isUp ? 'Регресс' : 'Снижение';
      isPositive = !isUp;
    } else {
      label = isUp ? 'Рост' : 'Спад';
      isPositive = isUp;
    }
    
    return { label, isPositive, isUp };
  }, [chartData, goal]);

  // DEBUG LOGS
  console.group('[METRIC CHART]');
  console.log('metricId:', metricId);
  console.log('goal:', goal);
  console.log('raw data length:', data?.length);
  console.log('chartData length:', chartData?.length);
  console.log('chartData:', chartData);
  console.log('minVal:', minVal);
  console.log('maxVal:', maxVal);
  console.groupEnd();

  if (!data.length && !goal) return (
    <div className="w-full h-full min-h-[260px] flex flex-col items-center justify-center text-muted-foreground/40 italic text-xs">
       <Activity className="w-8 h-8 mb-2 opacity-20" />
       Нет данных для отображения графика
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full h-full min-h-[260px] relative group flex flex-col"
    >
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
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
                strokeOpacity={0.2}
                label={{ 
                  position: 'insideTopRight', 
                  value: `ЦЕЛЬ: ${goal.targetValue}`, 
                  fill: color, 
                  fontSize: 9, 
                  fontWeight: 900,
                  opacity: 0.4,
                  tracking: '0.1em',
                  dy: -12
                }} 
              />
            )}

            <Line 
              name="ideal"
              type="monotone" 
              dataKey="ideal" 
              stroke={color} 
              strokeWidth={1}
              strokeDasharray="10 5"
              strokeOpacity={0.2}
              dot={false}
              animationDuration={1500}
              connectNulls={true}
            />

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
                
                // Only render dots for REAL measurements or WORKOUTS
                if (!payload.isReal && !payload.workout) return null;

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
                    fillOpacity={0.8}
                    stroke={color}
                    strokeWidth={1}
                    className="cursor-pointer hover:fill-white hover:fill-opacity-100 transition-all shadow-xl" 
                    onClick={handleClick}
                  />
                );
              }}
              activeDot={{ r: 6, fill: color, stroke: '#000', strokeWidth: 2 }}
              connectNulls={true}
            />

            <Line 
              name="forecast"
              type="monotone" 
              dataKey="forecast" 
              stroke={color} 
              strokeWidth={2}
              strokeDasharray="5 5"
              strokeOpacity={0.6}
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
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* DEBUG DATA OUTPUT */}
      <div className="absolute bottom-0 left-0 right-0 max-h-[100px] overflow-auto bg-black/80 p-2 text-[8px] font-mono whitespace-pre text-green-400 opacity-20 pointer-events-none">
        {JSON.stringify(chartData, null, 2)}
      </div>
    </motion.div>
  );
};

