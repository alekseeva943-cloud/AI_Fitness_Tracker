import React, { useState } from "react";
import { RU } from "../../../constants";
import { VALIDATION_LIMITS, validateNumeric, isValidTitle } from "../../../lib/validation";
import { ChevronDown, ChevronUp, Settings2, Dumbbell, Activity, Timer, Weight, Heart, Scale, Calendar } from "lucide-react";
import { METRICS, getMetricsByCategory } from "../../../constants/metrics";

interface EntryFormProps {
  type: 'workout' | 'weight';
  onSubmit: (data: any) => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({ type, onSubmit }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [category, setCategory] = useState<string>('STRENGTH');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const rawData = Object.fromEntries(formData);
    const newErrors: Record<string, string> = {};

    if (type === 'workout') {
      const title = String(rawData.type);
      if (!isValidTitle(title)) {
        newErrors.type = "Введите корректное название тренировки (минимум 3 символа)";
      }

      // Validate primary metrics
      ['duration', 'caloriesBurned', 'weight'].forEach(metricId => {
        if (rawData[metricId]) {
          const metric = METRICS[metricId];
          const err = validateNumeric(String(rawData[metricId]), { min: metric.min || 0, max: metric.max || 10000 });
          if (err) newErrors[metricId] = err;
        }
      });
      
      const durationErr = validateNumeric(String(rawData.duration), VALIDATION_LIMITS.workout.duration);
      if (durationErr) newErrors.duration = durationErr;

      // Dynamic validation based on registry for category metrics
      const categoryMetrics = getMetricsByCategory(category as any);
      categoryMetrics.forEach(metric => {
        if (rawData[metric.id]) {
          const err = validateNumeric(String(rawData[metric.id]), { min: metric.min || 0, max: metric.max || 10000 });
          if (err) newErrors[metric.id] = err;
        }
      });
      
      if (rawData.heartRate) {
        const metric = METRICS.heartRate;
        const err = validateNumeric(String(rawData.heartRate), { min: metric.min || 0, max: metric.max || 250 });
        if (err) newErrors.heartRate = err;
      }
    } else {
      const metric = METRICS.weight;
      const weightErr = validateNumeric(String(rawData.value), { min: metric.min || 0, max: metric.max || 500 });
      if (weightErr) newErrors.value = weightErr;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Process and cast types
    const data: any = { ...rawData };
    if (type === 'workout') {
      Object.keys(METRICS).forEach(metricId => {
        if (data[metricId]) data[metricId] = Number(data[metricId]);
      });
      
      // Auto-calculate volume for strength
      if (data.sets && data.reps && data.workingWeight) {
        data.volume = data.sets * data.reps * data.workingWeight;
      }
    } else {
      data.value = Number(data.value);
    }

    onSubmit(data);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      onChange={(e) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        const name = target.name;
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Категория</label>
              <div className="relative group">
                <select 
                  name="category" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-secondary/80 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all appearance-none cursor-pointer text-sm font-medium pr-10 shadow-lg backdrop-blur-sm group-hover:bg-secondary group-hover:border-white/20"
                >
                  <option value="STRENGTH">💪 Силовая</option>
                  <option value="CARDIO">🏃 Кардио</option>
                  <option value="ENDURANCE">🚴 Выносливость</option>
                  <option value="FLEXIBILITY">🧘 Гибкость</option>
                  <option value="OTHER">✨ Другое</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Тренировка</label>
              <input 
                name="type" 
                required 
                placeholder="Жим, Бег и т.д." 
                className={`w-full bg-secondary/80 border ${errors.type ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-sm font-medium shadow-lg backdrop-blur-sm placeholder:text-muted-foreground/30`} 
              />
              {errors.type && <p className="text-[10px] text-red-400 font-medium px-1">{errors.type}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block flex items-center gap-1.5">
                <Timer className="w-3 h-3" />
                {METRICS.duration.label} ({METRICS.duration.unit})
              </label>
              <input 
                name="duration" 
                type="number" 
                inputMode="numeric" 
                required 
                placeholder={METRICS.duration.placeholder}
                className={`w-full bg-secondary/80 border ${errors.duration ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-sm font-medium shadow-sm`} 
              />
              {errors.duration && <p className="text-[10px] text-red-400 font-medium">{errors.duration}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block flex items-center gap-1.5">
                <Activity className="w-3 h-3" />
                {METRICS.caloriesBurned.label} ({METRICS.caloriesBurned.unit})
              </label>
              <input 
                name="caloriesBurned" 
                type="number" 
                inputMode="numeric" 
                placeholder={METRICS.caloriesBurned.placeholder}
                className={`w-full bg-secondary/80 border ${errors.caloriesBurned ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-sm font-medium shadow-sm`} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary block flex items-center gap-1.5">
                <Scale className="w-3 h-3" />
                {METRICS.weight.label} ({METRICS.weight.unit})
              </label>
              <input 
                name="weight" 
                type="number" 
                step="0.1"
                placeholder={METRICS.weight.placeholder}
                className="w-full bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-sm font-bold shadow-lg shadow-primary/5" 
              />
            </div>
          </div>

          <div className="p-5 bg-white/5 rounded-3xl border border-white/5 space-y-6">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-primary flex items-center gap-2">
              <Settings2 className="w-3 h-3" />
              Метрики по категории
            </h4>
            
            <div className={`grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${category === 'FLEXIBILITY' || category === 'OTHER' ? 'hidden' : ''}`}>
               {getMetricsByCategory(category as any).map(metric => (
                 <div key={metric.id} className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground leading-tight">
                      {metric.label} {metric.unit ? `(${metric.unit})` : ''}
                    </label>
                    <input 
                      name={metric.id} 
                      type="number" 
                      step={metric.id === 'workingWeight' || metric.id === 'distance' ? '0.1' : '1'}
                      placeholder={metric.placeholder} 
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-colors font-medium" 
                    />
                    {errors[metric.id] && <p className="text-[8px] text-red-400 font-bold uppercase mt-1">{errors[metric.id]}</p>}
                 </div>
               ))}
            </div>

            {(category === 'FLEXIBILITY' || category === 'OTHER') && (
              <div className="text-center py-4 px-2 bg-background/50 rounded-xl border border-dashed border-border border-white/10">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Используйте заметки для фиксации специфических достижений
                </p>
              </div>
            )}
          </div>

          <button 
            type="button" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors py-2"
          >
            Расширенные данные
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showAdvanced && (
            <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300 bg-secondary/20 p-5 rounded-3xl border border-white/5">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                    <Heart className="w-3 h-3" />
                    Пульс (BPM)
                  </label>
                  <input 
                    name="heartRate" 
                    type="number" 
                    placeholder="145"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-all font-medium" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    Дата и время
                  </label>
                  <input 
                    name="date" 
                    type="datetime-local" 
                    defaultValue={new Date().toISOString().slice(0, 16)} 
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-all font-medium" 
                  />
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Текущий вес (кг)</label>
            <input 
              name="value" 
              type="number" 
              step="0.1" 
              inputMode="decimal" 
              required 
              placeholder="75.5"
              className={`w-full bg-secondary/50 border ${errors.value ? 'border-red-500/50' : 'border-border'} rounded-2xl px-5 py-4 text-xl font-bold outline-none focus:border-primary transition-colors`} 
            />
            {errors.value && <p className="text-[10px] text-red-400 font-medium">{errors.value}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">Дата взвешивания</label>
            <input 
              name="date" 
              type="datetime-local" 
              defaultValue={new Date().toISOString().slice(0, 16)} 
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors" 
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Контекст и заметки</label>
        <textarea 
          name="notes" 
          rows={3} 
          placeholder={type === 'weight' ? "Напр: После читмила, плохой сон..." : "Детали подхода, самочувствие, оборудование..."}
          className="w-full bg-secondary/50 border border-border rounded-2xl px-4 py-4 outline-none focus:border-primary transition-colors resize-none text-sm" 
        />
      </div>

      <button 
        type="submit" 
        disabled={Object.keys(errors).length > 0}
        className="w-full bg-primary text-primary-foreground font-bold py-5 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(223,255,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
      >
        {RU.COMMON.SAVE}
      </button>
    </form>
  );
};
