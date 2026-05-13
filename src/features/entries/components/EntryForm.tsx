import React, { useState } from "react";
import { RU } from "../../../constants";
import { VALIDATION_LIMITS, validateNumeric, isValidTitle } from "../../../lib/validation";

interface EntryFormProps {
  type: 'workout' | 'weight';
  onSubmit: (data: any) => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({ type, onSubmit }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    const newErrors: Record<string, string> = {};

    if (type === 'workout') {
      const title = String(data.type);
      if (!isValidTitle(title)) {
        newErrors.type = "Введите корректное название тренировки (минимум 3 символа)";
      }

      const durationErr = validateNumeric(String(data.duration), VALIDATION_LIMITS.workout.duration);
      if (durationErr) newErrors.duration = durationErr;

      const calErr = validateNumeric(String(data.caloriesBurned), VALIDATION_LIMITS.workout.calories);
      if (calErr) newErrors.caloriesBurned = calErr;

      if (data.weight) {
        const workoutWeightErr = validateNumeric(String(data.weight), VALIDATION_LIMITS.weight.value);
        if (workoutWeightErr) newErrors.weight = workoutWeightErr;
      }
    } else {
      const weightErr = validateNumeric(String(data.value), VALIDATION_LIMITS.weight.value);
      if (weightErr) newErrors.value = weightErr;
    }

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
      {type === 'workout' ? (
        <>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Тип тренировки</label>
            <input 
              name="type" 
              required 
              placeholder="Напр: Силовая, Плечи" 
              className={`w-full bg-secondary/50 border ${errors.type ? 'border-red-500/50' : 'border-border'} rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors`} 
            />
            {errors.type && <p className="text-[10px] text-red-400 font-medium">{errors.type}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{RU.ENTRIES.DURATION} (мин)</label>
              <input 
                name="duration" 
                type="number" 
                inputMode="numeric" 
                required 
                className={`w-full bg-secondary/50 border ${errors.duration ? 'border-red-500/50' : 'border-border'} rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors`} 
              />
              {errors.duration && <p className="text-[10px] text-red-400 font-medium">{errors.duration}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{RU.ENTRIES.CALORIES}</label>
              <input 
                name="caloriesBurned" 
                type="number" 
                inputMode="numeric" 
                className={`w-full bg-secondary/50 border ${errors.caloriesBurned ? 'border-red-500/50' : 'border-border'} rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors`} 
              />
              {errors.caloriesBurned && <p className="text-[10px] text-red-400 font-medium">{errors.caloriesBurned}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Вес (кг, опционально)</label>
            <input 
              name="weight" 
              type="number" 
              step="0.1" 
              inputMode="decimal" 
              className={`w-full bg-secondary/50 border ${errors.weight ? 'border-red-500/50' : 'border-border'} rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors`} 
              placeholder="Укажите вес, если актуально"
            />
            {errors.weight && <p className="text-[10px] text-red-400 font-medium">{errors.weight}</p>}
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Вес (кг)</label>
          <input 
            name="value" 
            type="number" 
            step="0.1" 
            inputMode="decimal" 
            required 
            className={`w-full bg-secondary/50 border ${errors.value ? 'border-red-500/50' : 'border-border'} rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors`} 
          />
          {errors.value && <p className="text-[10px] text-red-400 font-medium">{errors.value}</p>}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Дата</label>
        <input name="date" type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} required className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors" />
      </div>

      {type === 'workout' && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Заметки</label>
          <textarea name="notes" rows={3} className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors resize-none" />
        </div>
      )}

      <button 
        type="submit" 
        disabled={Object.keys(errors).length > 0}
        className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {RU.COMMON.SAVE}
      </button>
    </form>
  );
};
