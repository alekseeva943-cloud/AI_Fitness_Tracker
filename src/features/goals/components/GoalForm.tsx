import React, { useState } from "react";
import { RU } from "../../../constants";
import { GoalType } from "../../../types";
import { VALIDATION_LIMITS, validateNumeric, isValidTitle } from "../../../lib/validation";
import { ChevronDown } from "lucide-react";

interface GoalFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export const GoalForm: React.FC<GoalFormProps> = ({ onSubmit, initialData }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    const newErrors: Record<string, string> = {};

    if (!isValidTitle(String(data.title))) {
      newErrors.title = "Введите корректное название цели (минимум 3 символа)";
    }

    const valErr = validateNumeric(String(data.targetValue), VALIDATION_LIMITS.weight.value);
    if (valErr) newErrors.targetValue = valErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(data);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      onChange={(e) => {
        const name = (e.target as HTMLInputElement).name;
        if (errors[name]) {
          const newErrors = { ...errors };
          delete newErrors[name];
          setErrors(newErrors);
        }
      }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Название цели</label>
        <input 
          name="title" 
          defaultValue={initialData?.title}
          required
          placeholder="Напр: Сбросить 5 кг"
          className={`w-full bg-secondary/80 border ${errors.title ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-sm font-medium shadow-lg backdrop-blur-sm`}
        />
        {errors.title && <p className="text-[10px] text-red-400 font-medium px-1">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Тип</label>
          <div className="relative group">
            <select 
              name="type" 
              defaultValue={initialData?.type || GoalType.WEIGHT_LOSS} 
              className="w-full bg-secondary/80 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all appearance-none cursor-pointer text-sm font-medium pr-10 shadow-lg backdrop-blur-sm"
            >
              <option value={GoalType.WEIGHT_LOSS}>📉 {RU.GOALS.TYPES.WEIGHT_LOSS}</option>
              <option value={GoalType.MUSCLE_GAIN}>💪 {RU.GOALS.TYPES.MUSCLE_GAIN}</option>
              <option value={GoalType.STRENGTH}>⚡ {RU.GOALS.TYPES.STRENGTH}</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Цель (кг)</label>
          <input 
            name="targetValue" 
            type="number" 
            step="0.1"
            inputMode="decimal"
            defaultValue={initialData?.targetValue}
            required
            placeholder="70.0"
            className={`w-full bg-secondary/80 border ${errors.targetValue ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-sm font-bold shadow-lg backdrop-blur-sm`}
          />
          {errors.targetValue && <p className="text-[10px] text-red-400 font-medium px-1">{errors.targetValue}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Срок достижения</label>
        <input 
          name="deadline" 
          type="date"
          defaultValue={initialData?.deadline?.split('T')[0]}
          required
          className="w-full bg-secondary/80 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-sm font-medium shadow-lg backdrop-blur-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Мотивация (зачем вам это?)</label>
        <textarea 
          name="motivation" 
          defaultValue={initialData?.motivation}
          placeholder="Напр: Хочу вернуться в форму к отпуску..."
          rows={3}
          className="w-full bg-secondary/80 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all resize-none text-sm font-medium shadow-lg backdrop-blur-sm"
        />
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
