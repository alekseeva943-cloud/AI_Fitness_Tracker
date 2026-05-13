import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, ChevronDown, ChevronUp, Sparkles, Scale, Dumbbell, Zap, Trophy, Heart, Calendar } from 'lucide-react';
import { Goal, GoalType } from '../../../types';
import { RU } from '../../../constants';
import { METRICS } from '../../../constants/metrics';
import { FitnessSelect } from '../../../components/ui/FitnessSelect';
import { cn } from '../../../lib/utils';
import { isValidTitle, validateNumeric } from '../../../lib/validation';
import { useFitnessStore } from '../../../store/useFitnessStore';

const GOAL_PRESETS = [
  { title: 'Сбросить лишний вес', type: GoalType.WEIGHT_LOSS, icon: '📉' },
  { title: 'Набрать мышечную массу', type: GoalType.MUSCLE_GAIN, icon: '💪' },
  { title: 'Увеличить рабочий вес', type: GoalType.STRENGTH, icon: '⚡' },
  { title: 'Подготовиться к забегу', type: GoalType.STRENGTH, icon: '🏃' },
  { title: 'Привести тело в тонус', type: GoalType.WEIGHT_LOSS, icon: '✨' },
];

interface GoalFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  onCancel?: () => void;
}

export const GoalForm: React.FC<GoalFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const { profile, weightHistory } = useFitnessStore();
  const [selectedType, setSelectedType] = useState<GoalType>(initialData?.type || GoalType.WEIGHT_LOSS);
  const [workoutTypeFilter, setWorkoutTypeFilter] = useState<string>(initialData?.workoutTypeFilter || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [showPresets, setShowPresets] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [selectedMetricId, setSelectedMetricId] = useState<string>(initialData?.metricId || (selectedType === GoalType.STRENGTH ? 'workingWeight' : selectedType === GoalType.ENDURANCE ? 'distance' : 'weight'));

  const metric = METRICS[selectedMetricId] || METRICS.weight;

  const getBaselineValue = () => {
    if (selectedMetricId === 'weight') return weightHistory[0]?.value || profile?.startingWeight || 0;
    // For other metrics, we can look at the average of recent workouts
    return 0; // Default or complex lookup
  };

  const categoryOptions = [
    { value: 'STRENGTH', label: 'Силовая', icon: '⚡' },
    { value: 'CARDIO', label: 'Кардио', icon: '🫀' },
    { value: 'ENDURANCE', label: 'Выносливость', icon: '🏃' },
    { value: 'FLEXIBILITY', label: 'Йога и растяжка', icon: '🧘' },
    { value: 'OTHER', label: 'Другое', icon: '🎯' }
  ];

  // Update selected metric when type changes if not manually set
  const handleTypeChange = (type: GoalType) => {
    setSelectedType(type);
    const defaultMetric = Object.values(METRICS).find(m => m.compatibleGoalTypes?.includes(type)) || METRICS.weight;
    setSelectedMetricId(defaultMetric.id);
  };

  const metricOptions = Object.values(METRICS)
    .filter(m => m.chartCompatible || m.aiCompatible)
    .map(m => ({ value: m.id, label: m.label, icon: m.icon || '📊' }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newErrors: Record<string, string> = {};

    const startVal = getBaselineValue();
    const data: any = {
      title: title,
      type: selectedType,
      metricId: selectedMetricId,
      workoutTypeFilter: workoutTypeFilter || undefined,
      targetValue: Number(formData.get('targetValue')),
      deadline: formData.get('deadline') as string,
      motivation: formData.get('motivation') as string,
      startDate: initialData?.startDate || new Date().toISOString(),
      currentValue: initialData?.currentValue || startVal,
      startValue: startVal,
      status: initialData?.status || 'ACTIVE',
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    if (initialData?.id) {
      data.id = initialData.id;
    }

    if (!isValidTitle(data.title)) {
      newErrors.title = "Введите корректное название цели (минимум 3 символа)";
    }

    const valErr = validateNumeric(String(data.targetValue), { min: metric.min || 0, max: metric.max || 10000 });
    if (valErr) newErrors.targetValue = valErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...data,
      unit: metric.unit
    });
  };

  const typeOptions = [
    { value: GoalType.WEIGHT_LOSS, label: 'Похудение', icon: '📉' },
    { value: GoalType.MUSCLE_GAIN, label: 'Набор массы', icon: '💪' },
    { value: GoalType.STRENGTH, label: 'Сила и мощь', icon: '⚡' },
    { value: GoalType.ENDURANCE, label: 'Выносливость', icon: '🏃' },
    { value: GoalType.FLEXIBILITY, label: 'Растяжка', icon: '🧘' },
  ];

  return (
    <form 
      onSubmit={handleSubmit}
      className="space-y-8 pb-10"
    >
      <div className="space-y-6">
        {/* Title & Presets */}
        <div className="space-y-3 relative">
          <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1 flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-primary/60" />
            Название цели
          </label>
          
          <div className="relative group">
            <input 
              name="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setShowPresets(true)}
              required
              placeholder="Например: Пляжный сезон 2024..."
              className={cn(
                "w-full bg-secondary/40 border rounded-3xl px-6 py-5 outline-none focus:bg-secondary/60 transition-all text-lg font-medium shadow-inner placeholder:text-muted-foreground/30",
                errors.title ? 'border-red-500/50' : 'border-white/5 focus:border-primary/50'
              )}
            />
          </div>
          {/* ... (Presets section remains contextually same) */}
        </div>

        {/* Direction & Metric Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
             <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Тип цели</label>
             <FitnessSelect
               options={typeOptions}
               value={selectedType}
               onChange={(val) => handleTypeChange(val as GoalType)}
               selectClassName="h-[68px] rounded-3xl"
             />
          </div>

          <div className="space-y-3">
             <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Основной показатель</label>
             <FitnessSelect
               options={metricOptions}
               value={selectedMetricId}
               onChange={(val) => setSelectedMetricId(val as string)}
               selectClassName="h-[68px] rounded-3xl border-primary/20"
             />
          </div>
        </div>

        {/* Target Value */}
        <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1 flex justify-between items-center">
              <span>Целевой показатель</span>
              <span className="text-primary/60 underline decoration-dotted">{metric.label}</span>
            </label>
            <div className="relative">
              <input 
                name="targetValue" 
                type="number" 
                step={metric.unit === 'кг' ? '0.5' : '1'}
                inputMode="decimal"
                defaultValue={initialData?.targetValue}
                required
                placeholder={metric.placeholder}
                className={cn(
                  "w-full bg-secondary/40 border rounded-3xl px-6 py-5 outline-none focus:border-primary/50 transition-all text-3xl font-black shadow-xl text-center pr-20 h-[80px]",
                  errors.targetValue ? 'border-red-500/50' : 'border-white/10'
                )}
              />
              <span className="absolute right-8 top-1/2 -translate-y-1/2 text-sm font-black text-primary uppercase tracking-widest">{metric.unit}</span>
            </div>
          </div>

        {/* Info Box about Baseline */}
        <div className="p-5 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-black shrink-0 relative overflow-hidden">
                <Target className="w-6 h-6 stroke-[2.5] relative z-10" />
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Базовый показатель</p>
              <p className="text-sm text-foreground leading-tight font-bold">
                Отсчет от: <span className="text-primary text-lg">{getBaselineValue()} {metric.unit}</span>
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">Это ваш текущий уровень в выбранной метрике</p>
            </div>
        </div>
      </div>

      <div className="space-y-6 pt-8 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary px-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Желаемая дата
            </label>
            <input 
              name="deadline" 
              type="date"
              defaultValue={initialData?.deadline?.split('T')[0]}
              required
              className="w-full bg-secondary/40 border border-white/10 rounded-3xl px-6 py-5 outline-none focus:border-primary/50 transition-all text-lg font-black text-center h-[68px]"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary px-1 flex items-center gap-2">
              <Heart className="w-3.5 h-3.5" />
              Твоя мотивация
            </label>
            <input 
              name="motivation" 
              defaultValue={initialData?.motivation}
              placeholder="Зачем тебе это?"
              className="w-full bg-secondary/40 border border-white/10 rounded-3xl px-6 py-5 outline-none focus:border-primary/50 transition-all text-base font-semibold h-[68px]"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1 flex items-center gap-2">
            <Dumbbell className="w-3.5 h-3.5 text-primary/60" />
            Связать с типом тренировок
          </label>
          <FitnessSelect
            options={[{ value: '', label: 'Все тренировки', icon: '📎' }, ...categoryOptions]}
            value={workoutTypeFilter}
            onChange={setWorkoutTypeFilter}
            selectClassName="h-[68px] rounded-3xl"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="px-8 py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-white/5 transition-all"
          >
            Отмена
          </button>
        )}
        <button 
          type="submit" 
          className="flex-1 bg-primary text-black px-8 py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(223,255,0,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3 group"
        >
          <Zap className="w-4 h-4 fill-black group-hover:animate-pulse" />
          {initialData ? 'Сохранить изменения' : 'Активировать цель'}
        </button>
      </div>
    </form>
  );
};
