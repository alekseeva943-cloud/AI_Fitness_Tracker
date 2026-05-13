import React from 'react';
import { GlassCard } from './ui/GlassCard';
import { Info, RotateCcw } from 'lucide-react';
import { GradientButton } from './ui/GradientButton';
import { useFitnessStore } from '../store/useFitnessStore';

export const DemoModeBanner: React.FC = () => {
  const isDemoMode = useFitnessStore(state => state.isDemoMode);
  const resetData = useFitnessStore(state => state.resetData);

  if (!isDemoMode) return null;

  return (
    <GlassCard className="mb-8 p-4 border-l-4 border-l-primary flex flex-col md:flex-row items-center justify-between gap-4 bg-primary/5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <Info className="w-6 h-6" />
        </div>
        <div>
          <p className="font-semibold">Вы используете демонстрационные данные</p>
          <p className="text-sm text-muted-foreground">Добавьте свои данные, чтобы начать отслеживать реальный прогресс.</p>
        </div>
      </div>
      <GradientButton 
        variant="outline" 
        size="sm" 
        onClick={() => {
          if (window.confirm('Вы уверены, что хотите очистить демонстрационные данные и сбросить прогресс?')) {
            resetData();
          }
        }}
        className="gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Очистить данные
      </GradientButton>
    </GlassCard>
  );
};
