import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, ChevronDown, ChevronUp, Sparkles, Scale, Dumbbell, Zap, Trophy, Heart } from 'lucide-react';
import { Goal, GoalType } from '../../../types';
import { RU } from '../../../constants';
import { METRICS } from '../../../constants/metrics';
import { FitnessSelect } from '../../../components/ui/FitnessSelect';
import { cn } from '../../../lib/utils';
import { isValidTitle, validateNumeric } from '../../../lib/validation';

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
  const [selectedType, setSelectedType] = useState<GoalType>(initialData?.type || GoalType.WEIGHT_LOSS);
  const [title, setTitle] = useState(initialData?.title || '');
  const [showPresets, setShowPresets] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const metric = Object.values(METRICS).find(m => m.compatibleGoalTypes?.includes(selectedType)) || METRICS.weight;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newErrors: Record<string, string> = {};

    const data = {
      title: title,
      type: selectedType,
      targetValue: Number(formData.get('targetValue')),
      deadline: formData.get('deadline') as string,
      motivation: formData.get('motivation') as string,
      startDate: initialData?.startDate || new Date().toISOString(),
      currentValue: initialData?.currentValue || 0,
      startValue: initialData?.startValue || 0,
      status: initialData?.status || 'ACTIVE',
      createdAt: initialData?.createdAt || new Date().toISOString(),
      id: initialData?.id
    };

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
    { value: GoalType.WEIGHT_LOSS, label: '📉 Похудение', icon: '📉' },
    { value: GoalType.MUSCLE_GAIN, label: '💪 Набор массы', icon: '💪' },
    { value: GoalType.STRENGTH, label: '⚡ Сила и мощь', icon: '⚡' },
  ];

  return (
    <form 
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <div className="space-y-4">
        <div className="space-y-3 relative">
          <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60 px-1">Какая у вас цель?</label>
          
          <div className="relative group">
            <input 
              name="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setShowPresets(true)}
              required
              placeholder="Введите цель или выберите из списка..."
              className={cn(
                "w-full bg-secondary/40 border rounded-2xl px-5 py-4 outline-none focus:bg-secondary/60 transition-all text-base font-medium shadow-inner placeholder:text-muted-foreground/20",
                errors.title ? 'border-red-500/50' : 'border-white/5 focus:border-primary/50'
              )}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
               {showPresets ? <ChevronUp className="w-4 h-4 text-primary/40" /> : <ChevronDown className="w-4 h-4 text-muted-foreground/20" />}
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
                  animate={{ opacity: 1, y: 4, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute z-50 left-0 right-0 top-full bg-secondary/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden p-2 grid grid-cols-1 sm:grid-cols-2 gap-2"
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
                      className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-primary/10 hover:border-primary/20 transition-all text-left text-xs font-medium group"
                    >
                      <span className="text-lg group-hover:scale-125 transition-transform">{preset.icon}</span>
                      {preset.title}
                    </button>
                  ))}
                  <div className="col-span-full p-2 border-t border-white/5 text-[9px] text-muted-foreground/40 text-center uppercase tracking-widest">
                    Или продолжайте вводить свой вариант
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          {errors.title && <p className="text-[10px] text-red-400 font-medium px-2">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FitnessSelect
            label="Направление"
            options={typeOptions}
            value={selectedType}
            onChange={(val) => setSelectedType(val as GoalType)}
          />

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60 px-1 text-center block">Цель ({metric.unit})</label>
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
                  "w-full bg-secondary/40 border rounded-2xl px-5 py-4 outline-none focus:border-primary/50 transition-all text-xl font-bold shadow-lg text-center pr-12",
                  errors.targetValue ? 'border-red-500/50' : 'border-white/10'
                )}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary/40 uppercase">{metric.unit}</span>
            </div>
            {errors.targetValue && <p className="text-[10px] text-red-400 font-medium px-2">{errors.targetValue}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-white/5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 px-1 flex items-center gap-2">
              <Trophy className="w-3 h-3 text-primary" />
              Желаемая дата
            </label>
            <input 
              name="deadline" 
              type="date"
              defaultValue={initialData?.deadline?.split('T')[0]}
              required
              className="w-full bg-secondary/30 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-primary/50 transition-all text-sm font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 px-1 flex items-center gap-2">
              <Heart className="w-3 h-3 text-primary" />
              Твоя мотивация
            </label>
            <textarea 
              name="motivation" 
              defaultValue={initialData?.motivation}
              placeholder="Зачем тебе это?"
              rows={1}
              className="w-full bg-secondary/30 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-primary/50 transition-all resize-none text-sm font-medium placeholder:text-muted-foreground/20"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-white/5 transition-all"
          >
            Отмена
          </button>
        )}
        <button 
          type="submit" 
          className="flex-1 bg-primary text-black px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
        >
          <Zap className="w-4 h-4 fill-black group-hover:animate-pulse" />
          {initialData ? 'Сохранить изменения' : 'Активировать цель'}
        </button>
      </div>
    </form>
  );
};
