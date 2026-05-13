import React, { useState } from "react";
import { RU } from "../../../constants";
import { GoalType } from "../../../types";
import { VALIDATION_LIMITS, validateNumeric, isValidTitle } from "../../../lib/validation";
import { ChevronDown } from "lucide-react";
import { METRICS } from "../../../constants/metrics";

interface GoalFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export const GoalForm: React.FC<GoalFormProps> = ({ onSubmit, initialData }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedType, setSelectedType] = useState<GoalType>(initialData?.type || GoalType.WEIGHT_LOSS);

  // Find primary metric for this goal type
  const metric = Object.values(METRICS).find(m => m.compatibleGoalTypes?.includes(selectedType)) || METRICS.weight;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    const newErrors: Record<string, string> = {};

    if (!isValidTitle(String(data.title))) {
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

  return (
    <form 
      onSubmit={handleSubmit} 
      onChange={(e) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        const name = target.name;
        if (name === 'type') {
          setSelectedType(target.value as GoalType);
        }
        if (errors[name]) {
          const newErrors = { ...errors };
          delete newErrors[name];
          setErrors(newErrors);
        }
      }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Твоя главная цель</label>
          <input 
            name="title" 
            defaultValue={initialData?.title}
            required
            placeholder="Напр: Сбросить 5 кг к лету"
            className={`w-full bg-secondary/40 border ${errors.title ? 'border-red-500/50' : 'border-white/5'} rounded-2xl px-5 py-4 outline-none focus:border-primary/50 focus:bg-secondary/60 transition-all text-base font-medium shadow-inner placeholder:text-muted-foreground/20`}
          />
          {errors.title && <p className="text-[10px] text-red-400 font-medium px-2">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1 text-center block">Направление</label>
            <div className="relative group">
              <select 
                name="type" 
                defaultValue={selectedType} 
                className="w-full bg-secondary/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer text-sm font-bold shadow-lg"
              >
                <option value={GoalType.WEIGHT_LOSS}>📉 Похудение</option>
                <option value={GoalType.MUSCLE_GAIN}>💪 Набор массы</option>
                <option value={GoalType.STRENGTH}>⚡ Сила</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1 text-center block">Цель ({metric.unit})</label>
            <div className="relative">
              <input 
                name="targetValue" 
                type="number" 
                step={metric.id === 'workingWeight' ? '0.5' : '1'}
                inputMode="decimal"
                defaultValue={initialData?.targetValue}
                required
                placeholder={metric.placeholder}
                className={`w-full bg-secondary/40 border ${errors.targetValue ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-4 outline-none focus:border-primary/50 transition-all text-base font-bold shadow-lg text-center`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/30 uppercase">{metric.unit}</span>
            </div>
            {errors.targetValue && <p className="text-[10px] text-red-400 font-medium px-2">{errors.targetValue}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Когда планируешь достичь?</label>
          <input 
            name="deadline" 
            type="date"
            defaultValue={initialData?.deadline?.split('T')[0]}
            required
            className="w-full bg-secondary/40 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-primary/50 transition-all text-base font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Твоя мотивация</label>
          <textarea 
            name="motivation" 
            defaultValue={initialData?.motivation}
            placeholder="Зачем тебе это? (Напр: Хочу быть здоровым, влезть в старые джинсы...)"
            rows={3}
            className="w-full bg-secondary/40 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-primary/50 transition-all resize-none text-base font-medium placeholder:text-muted-foreground/20 leading-relaxed"
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={Object.keys(errors).length > 0}
        className="w-full bg-primary text-primary-foreground font-bold py-5 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(223,255,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
      >
        {initialData ? RU.COMMON.SAVE : RU.GOALS.ADD}
      </button>
    </form>
  );
};
