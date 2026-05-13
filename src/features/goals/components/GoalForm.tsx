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

  const metric = Object.values(METRICS).find(m => m.compatibleGoalTypes?.includes(selectedType)) || METRICS.weight;

  // Get baseline from profile or latest entry
  const getBaselineValue = () => {
    if (initialData?.startValue !== undefined) return initialData.startValue;
    
    // 1. Check latest weight history if it's a weight metric
    if (metric.id === 'weight' && weightHistory && weightHistory.length > 0) {
      // Sort by date to get the absolute latest
      const latest = [...weightHistory].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      if (latest && latest.value > 0) return latest.value;
    }

    // 2. Exact match in baselines
    const baseline = profile?.baselines?.find(b => b.id === metric.id);
    if (baseline && baseline.value > 0) return baseline.value;
    
    // 3. Fallback for weight specifically from profile
    if (metric.id === 'weight' && profile?.startingWeight) return profile.startingWeight;
    
    // 4. Look for similar named metric
    const fuzzyBaseline = profile?.baselines?.find(b => 
      b.name.toLowerCase().includes(metric.label.toLowerCase()) || 
      metric.label.toLowerCase().includes(b.name.toLowerCase())
    );
    if (fuzzyBaseline && fuzzyBaseline.value > 0) return fuzzyBaseline.value;

    return 0;
  };

  const categoryOptions = [
    { value: 'STRENGTH', label: 'Силовая', icon: '⚡' },
    { value: 'CARDIO', label: 'Кардио', icon: '❤️' },
    { value: 'ENDURANCE', label: 'Выносливость', icon: '🏃' },
    { value: 'FLEXIBILITY', label: 'Йога и растяжка', icon: '🧘' },
    { value: 'OTHER', label: 'Другое', icon: '✨' },
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newErrors: Record<string, string> = {};

    const startVal = getBaselineValue();
    const data: any = {
      title: title,
      type: selectedType,
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
      metricId: metric.id,
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
      className="space-y-10"
    >
      <div className="space-y-6">
        {/* Title & Presets */}
        <div className="space-y-3 relative">
          <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1 flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-primary/60" />
            Какая у вас цель?
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
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
               {showPresets ? <ChevronUp className="w-5 h-5 text-primary/40" /> : <ChevronDown className="w-5 h-5 text-muted-foreground/20" />}
            </div>
          </div>

          <AnimatePresence>
            {showPresets && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setShowPresets(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 8, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute z-50 left-0 right-0 top-full bg-secondary/95 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden p-3 grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  {GOAL_PRESETS.map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => {
                        setTitle(preset.title);
                        setSelectedType(preset.type);
                        setShowPresets(false);
                      }}
                      className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-primary/10 hover:border-primary/20 transition-all text-left text-sm font-semibold group"
                    >
                      <span className="text-xl group-hover:scale-125 transition-transform">{preset.icon}</span>
                      {preset.title}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
          {errors.title && <p className="text-[10px] text-red-400 font-bold px-2 uppercase tracking-widest">{errors.title}</p>}
        </div>

        {/* Direction & Value */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
             <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Направление</label>
             <FitnessSelect
               options={typeOptions}
               value={selectedType}
               onChange={(val) => setSelectedType(val as GoalType)}
               selectClassName="h-[68px] rounded-3xl"
             />
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Цель ({metric.unit})</label>
            <div className="relative">
              <input 
                name="targetValue" 
                type="number" 
                step={metric.id === 'workingWeight' ? '0.5' : '1'}
                inputMode="decimal"
                defaultValue={initialData?.targetValue}
                required
                placeholder={metric.placeholder}
                className={cn(
                  "w-full bg-secondary/40 border rounded-3xl px-6 py-5 outline-none focus:border-primary/50 transition-all text-2xl font-black shadow-xl text-center pr-16 h-[68px]",
                  errors.targetValue ? 'border-red-500/50' : 'border-white/10'
                )}
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary/40 uppercase tracking-tighter">{metric.unit}</span>
            </div>
          </div>
        </div>

        {/* Info Box about Baseline */}
        {!initialData && (
          <div className="p-5 bg-primary/10 rounded-[2rem] border border-primary/20 flex items-center gap-4 shadow-[0_10px_30px_rgba(223,255,0,0.05)]">
             <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-black shrink-0 shadow-lg shadow-primary/30">
                <Target className="w-6 h-6 stroke-[2.5]" />
             </div>
             <div className="space-y-0.5">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Точка отсчета</p>
               <p className="text-sm text-foreground leading-tight font-bold">
                 Текущий показатель: <span className="text-primary text-lg">{getBaselineValue()} {metric.unit}</span>
               </p>
               <p className="text-[10px] text-muted-foreground font-medium">Прогноз будет строиться от этого значения</p>
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-white/5">
        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary px-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            Желаемая дата
          </label>
          <div className="relative">
            <input 
              name="deadline" 
              type="date"
              defaultValue={initialData?.deadline?.split('T')[0]}
              required
              className="w-full bg-secondary/40 border border-white/10 rounded-3xl px-6 py-5 outline-none focus:border-primary/50 transition-all text-lg font-black text-center h-[68px] appearance-none"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary px-1 flex items-center gap-2">
            <Heart className="w-3.5 h-3.5" />
            Твоя мотивация
          </label>
          <textarea 
            name="motivation" 
            defaultValue={initialData?.motivation}
            placeholder="Зачем тебе это?"
            rows={1}
            className="w-full bg-secondary/40 border border-white/10 rounded-3xl px-6 py-5 outline-none focus:border-primary/50 transition-all resize-none text-base font-semibold placeholder:text-muted-foreground/40 h-[68px] flex items-center shadow-inner"
          />
        </div>
      </div>

      <div className="space-y-4 pt-8 border-t border-white/5">
        <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1 flex items-center gap-2">
          <Dumbbell className="w-3.5 h-3.5 text-primary/60" />
          Связать с тренировками (фильтр)
        </label>
        <p className="text-[10px] text-muted-foreground px-1 -mt-2">
          Выберите группу тренировок, которая будет отображаться в деталях этой цели
        </p>
        <FitnessSelect
          options={[{ value: '', label: 'Все тренировки', icon: '📎' }, ...categoryOptions]}
          value={workoutTypeFilter}
          onChange={setWorkoutTypeFilter}
          selectClassName="h-[68px] rounded-3xl"
        />
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
