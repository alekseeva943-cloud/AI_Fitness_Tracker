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
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Тренировка</label>
              <input 
                name="type" 
                required 
                placeholder="Что тренируем? (Силовая, Бег...)" 
                className={`w-full bg-secondary/40 border ${errors.type ? 'border-red-500/50' : 'border-white/5'} rounded-2xl px-5 py-4 outline-none focus:border-primary/50 focus:bg-secondary/60 transition-all text-base font-medium shadow-inner placeholder:text-muted-foreground/20`} 
              />
              {errors.type && <p className="text-[10px] text-red-400 font-medium px-2">{errors.type}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1 flex items-center gap-2">
                  <Timer className="w-3 h-3 text-primary" />
                  Время
                </label>
                <div className="relative">
                  <input 
                    name="duration" 
                    type="number" 
                    inputMode="numeric" 
                    required 
                    placeholder="45"
                    className={`w-full bg-secondary/40 border ${errors.duration ? 'border-red-500/50' : 'border-white/5'} rounded-2xl px-5 py-4 outline-none focus:border-primary/50 focus:bg-secondary/60 transition-all text-base font-medium pr-12`} 
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground/40 uppercase">Мин</span>
                </div>
                {errors.duration && <p className="text-[10px] text-red-400 font-medium px-2">{errors.duration}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1 flex items-center gap-2">
                  <Activity className="w-3 h-3 text-primary" />
                  Калории
                </label>
                <div className="relative">
                  <input 
                    name="caloriesBurned" 
                    type="number" 
                    inputMode="numeric" 
                    placeholder="350"
                    className="w-full bg-secondary/40 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-primary/50 focus:bg-secondary/60 transition-all text-base font-medium pr-14" 
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/40 uppercase">ккал</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 p-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary px-1 flex items-center gap-2">
                <Scale className="w-3 h-3" />
                Твой вес сегодня
              </label>
              <div className="relative">
                <input 
                  name="weight" 
                  type="number" 
                  step="0.1"
                  placeholder="75.0"
                  className="w-full bg-primary/5 border border-primary/20 rounded-2xl px-5 py-4 outline-none focus:border-primary/40 transition-all text-base font-bold text-primary shadow-[0_0_15px_rgba(223,255,0,0.05)]" 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-primary/40 uppercase">кг</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="button" 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Settings2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-widest leading-none">Дополнительно</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Подходы, дистанция, пульс...</p>
                </div>
              </div>
              {showAdvanced ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {showAdvanced && (
              <div className="mt-4 p-5 space-y-6 bg-secondary/20 rounded-3xl border border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Категория (AI)</label>
                  <div className="relative group">
                    <select 
                      name="category" 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all appearance-none cursor-pointer text-sm font-medium pr-10"
                    >
                      <option value="STRENGTH">💪 Силовая</option>
                      <option value="CARDIO">🏃 Кардио</option>
                      <option value="ENDURANCE">🚴 Выносливость</option>
                      <option value="FLEXIBILITY">🧘 Гибкость</option>
                      <option value="OTHER">✨ Другое</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                      <ChevronDown className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {getMetricsByCategory(category as any).map(metric => (
                    <div key={metric.id} className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground/80 px-1 flex items-center gap-1.5 leading-tight">
                        {metric.id === 'heartRate' ? <Heart className="w-2.5 h-2.5" /> : null}
                        {metric.label}
                      </label>
                      <div className="relative">
                        <input 
                          name={metric.id} 
                          type="number" 
                          step={metric.id === 'workingWeight' || metric.id === 'distance' ? '0.1' : '1'}
                          placeholder={metric.placeholder} 
                          className="w-full bg-background/50 border border-white/5 rounded-xl px-3 py-3 text-sm outline-none focus:border-primary/40 transition-all font-bold" 
                        />
                        {metric.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-muted-foreground/30 uppercase">{metric.unit}</span>}
                      </div>
                    </div>
                  ))}
                  
                  <div className="space-y-1.5 col-span-full pt-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground/80 px-1 flex items-center gap-1.5">
                      <Calendar className="w-2.5 h-2.5" />
                      Дата и время
                    </label>
                    <input 
                      name="date" 
                      type="datetime-local" 
                      defaultValue={new Date().toISOString().slice(0, 16)} 
                      className="w-full bg-background/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/40 transition-all font-medium" 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2 p-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary px-1 flex items-center gap-2">
              <Scale className="w-3 h-3" />
              Твой вес сегодня
            </label>
            <div className="relative">
              <input 
                name="value" 
                type="number" 
                step="0.1" 
                inputMode="decimal" 
                required 
                placeholder="75.5"
                className={`w-full bg-primary/5 border ${errors.value ? 'border-red-400/50' : 'border-primary/20'} rounded-2xl px-6 py-5 text-2xl font-bold outline-none focus:border-primary/40 transition-all text-primary shadow-[0_0_20px_rgba(223,255,0,0.03)]`} 
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-primary/40 uppercase">кг</span>
            </div>
            {errors.value && <p className="text-[10px] text-red-400 font-medium px-2">{errors.value}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Когда взвесились?</label>
            <input 
              name="date" 
              type="datetime-local" 
              defaultValue={new Date().toISOString().slice(0, 16)} 
              className="w-full bg-secondary/40 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-primary/50 transition-all text-base font-medium" 
            />
          </div>
        </div>
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
