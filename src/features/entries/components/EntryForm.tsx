import React, { useState, useEffect } from "react";
import { RU } from "../../../constants";
import { VALIDATION_LIMITS, validateNumeric, isValidTitle } from "../../../lib/validation";
import { ChevronDown, ChevronUp, Settings2, Activity, Timer, Heart, Scale, Calendar, Info, Plus, Trash2, Dumbbell } from "lucide-react";
import { METRICS, getMetricsByCategory } from "../../../constants/metrics";
import { FitnessSelect } from "../../../components/ui/FitnessSelect";
import { cn } from "../../../lib/utils";
import { Exercise } from "../../../types";

interface EntryFormProps {
  type: 'workout' | 'weight';
  onSubmit: (data: any) => void;
  initialData?: any;
  onCancel?: () => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({ type, onSubmit, initialData, onCancel }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(initialData ? true : false);
  const [category, setCategory] = useState<string>(initialData?.category || 'STRENGTH');
  const [exercises, setExercises] = useState<Exercise[]>(
    initialData?.exercises || (initialData?.category === 'STRENGTH' || !initialData ? [
      { id: crypto.randomUUID(), name: initialData?.type || '', sets: initialData?.sets || 0, reps: initialData?.reps || 0, weight: initialData?.workingWeight || 0, totalWeight: initialData?.totalWeight || 0 }
    ] : [])
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const rawData = Object.fromEntries(formData);
    const newErrors: Record<string, string> = {};

    if (type === 'workout') {
      const title = String(rawData.type);
      if (!isValidTitle(title)) {
        newErrors.type = "Введите название тренировки";
      }

      ['duration', 'caloriesBurned', 'weight'].forEach(metricId => {
        if (rawData[metricId]) {
          const metric = METRICS[metricId];
          const err = validateNumeric(String(rawData[metricId]), { min: metric.min || 0, max: metric.max || 10000 });
          if (err) newErrors[metricId] = err;
        }
      });
      
      const durationErr = validateNumeric(String(rawData.duration), VALIDATION_LIMITS.workout.duration);
      if (durationErr) newErrors.duration = durationErr;

      const categoryMetrics = getMetricsByCategory(category as any);
      categoryMetrics.forEach(metric => {
        if (rawData[metric.id]) {
          const err = validateNumeric(String(rawData[metric.id]), { min: metric.min || 0, max: metric.max || 10000 });
          if (err) newErrors[metric.id] = err;
        }
      });
    } else {
      const metric = METRICS.weight;
      const weightErr = validateNumeric(String(rawData.value), { min: metric.min || 0, max: metric.max || 500 });
      if (weightErr) newErrors.value = weightErr;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data: any = { 
      ...rawData, 
      category: category
    };
    if (initialData?.id) {
      data.id = initialData.id;
    }
    if (type === 'workout') {
      Object.keys(METRICS).forEach(metricId => {
        if (data[metricId]) data[metricId] = Number(data[metricId]);
      });
      
      if (category === 'STRENGTH') {
        data.exercises = exercises;
        data.totalWeight = exercises.reduce((sum, ex) => sum + ex.totalWeight, 0);
        // For backward compatibility/legacy display if needed
        data.sets = exercises.reduce((sum, ex) => sum + Number(ex.sets), 0);
        data.reps = exercises.length > 0 ? Math.round(exercises.reduce((sum, ex) => sum + Number(ex.reps), 0) / exercises.length) : 0;
        data.workingWeight = exercises.length > 0 ? Math.max(...exercises.map(ex => Number(ex.weight))) : 0;
      }
    } else {
      data.value = Number(data.value);
    }

    onSubmit(data);
  };

  const addExercise = () => {
    setExercises([...exercises, { 
      id: crypto.randomUUID(), 
      name: '', 
      sets: 0, 
      reps: 0, 
      weight: 0, 
      totalWeight: 0 
    }]);
  };

  const removeExercise = (id: string) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter(ex => ex.id !== id));
    }
  };

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map(ex => {
      if (ex.id === id) {
        const updated = { ...ex, [field]: value };
        if (field === 'sets' || field === 'reps' || field === 'weight') {
          updated.totalWeight = Number(updated.sets || 0) * Number(updated.reps || 0) * Number(updated.weight || 0);
        }
        return updated;
      }
      return ex;
    }));
  };

  const categoryOptions = [
    { value: 'STRENGTH', label: 'Силовая', icon: '💪' },
    { value: 'CARDIO', label: 'Кардио', icon: '🏃' },
    { value: 'ENDURANCE', label: 'Выносливость', icon: '🚴' },
    { value: 'FLEXIBILITY', label: 'Йога и растяжка', icon: '🧘' },
    { value: 'OTHER', label: 'Другое', icon: '✨' },
  ];

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-6"
    >
      {type === 'workout' ? (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60 px-1">Тренировка</label>
              <input 
                name="type" 
                required 
                defaultValue={initialData?.type}
                placeholder="Что тренируем? (Напр: Жим лежа, Бег...)" 
                className={cn(
                  "w-full bg-secondary/40 border rounded-2xl px-5 py-4 outline-none focus:bg-secondary/60 transition-all text-base font-medium shadow-inner placeholder:text-muted-foreground/20",
                  errors.type ? 'border-red-500/50' : 'border-white/5 focus:border-primary/50'
                )} 
              />
              {errors.type && <p className="text-[10px] text-red-400 font-medium px-2">{errors.type}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60 px-1 flex items-center gap-2">
                  <Timer className="w-3 h-3 text-primary" />
                  Время (мин)
                </label>
                <input 
                  name="duration" 
                  type="number" 
                  inputMode="numeric" 
                  required 
                  defaultValue={initialData?.duration}
                  placeholder="45"
                  className={cn(
                    "w-full bg-secondary/40 border rounded-2xl px-5 py-4 outline-none focus:border-primary/50 focus:bg-secondary/60 transition-all text-base font-medium",
                    errors.duration ? 'border-red-500/50' : 'border-white/5'
                  )} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60 px-1 flex items-center gap-2">
                  <Activity className="w-3 h-3 text-primary" />
                  Калории
                </label>
                <input 
                  name="caloriesBurned" 
                  type="number" 
                  inputMode="numeric" 
                  defaultValue={initialData?.caloriesBurned}
                  placeholder="350"
                  className="w-full bg-secondary/40 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-primary/50 focus:bg-secondary/60 transition-all text-base font-medium" 
                />
              </div>
            </div>

            <div className="space-y-2 p-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary px-1 flex items-center gap-2">
                <Scale className="w-3 h-3" />
                Вес на момент тренировки (кг)
              </label>
              <input 
                name="weight" 
                type="number" 
                step="0.1"
                defaultValue={initialData?.weight}
                placeholder="75.0"
                className="w-full bg-primary/5 border border-primary/20 rounded-2xl px-5 py-4 outline-none focus:border-primary/40 transition-all text-xl font-black text-primary shadow-[0_0_20px_rgba(223,255,0,0.05)]" 
              />
            </div>
          </div>

          <div className="pt-2">
            <div className="space-y-2 mb-6">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Дата тренировки</label>
              <input 
                name="date" 
                type="date" 
                defaultValue={initialData?.date ? initialData.date.slice(0, 10) : new Date().toISOString().slice(0, 10)} 
                className="w-full bg-secondary/40 border border-white/5 rounded-2xl px-5 py-4 text-sm outline-none focus:border-primary/40 transition-all font-medium" 
              />
            </div>

            <button 
              type="button" 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] leading-none">Дополнительные параметры</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Подходы, рабочий вес, дистанция, пульс
                  </p>
                </div>
              </div>
              {showAdvanced ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {showAdvanced && (
              <div className="mt-4 p-6 space-y-6 bg-secondary/20 rounded-[2.5rem] border border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
                <FitnessSelect
                  label="Тип нагрузки"
                  options={categoryOptions}
                  value={category}
                  onChange={setCategory}
                />

                {category === 'STRENGTH' ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Список упражнений</label>
                      <button 
                        type="button"
                        onClick={addExercise}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase hover:bg-primary/20 transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        Добавить
                      </button>
                    </div>

                    <div className="grid gap-4">
                      {exercises.map((ex, idx) => (
                        <div key={ex.id} className="relative p-5 bg-background/40 border border-white/5 rounded-3xl space-y-4 group">
                          <button 
                            type="button"
                            onClick={() => removeExercise(ex.id)}
                            className="absolute top-4 right-4 p-2 text-muted-foreground/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Упражнение {idx + 1}</label>
                            <input 
                              value={ex.name}
                              onChange={(e) => updateExercise(ex.id, 'name', e.target.value)}
                              placeholder="Напр. Жим лежа"
                              className="w-full bg-secondary/20 border border-white/5 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary/40 transition-all"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                              <span className="text-[8px] font-bold uppercase text-muted-foreground px-1">Подходы</span>
                              <input 
                                type="number"
                                value={ex.sets || ''}
                                onChange={(e) => updateExercise(ex.id, 'sets', Number(e.target.value))}
                                className="w-full bg-secondary/20 border border-white/5 rounded-xl px-3 py-2.5 text-sm font-bold text-center outline-none focus:border-primary/40"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <span className="text-[8px] font-bold uppercase text-muted-foreground px-1">Повт.</span>
                              <input 
                                type="number"
                                value={ex.reps || ''}
                                onChange={(e) => updateExercise(ex.id, 'reps', Number(e.target.value))}
                                className="w-full bg-secondary/20 border border-white/5 rounded-xl px-3 py-2.5 text-sm font-bold text-center outline-none focus:border-primary/40"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <span className="text-[8px] font-bold uppercase text-muted-foreground px-1">Вес (кг)</span>
                              <input 
                                type="number"
                                step="0.5"
                                value={ex.weight || ''}
                                onChange={(e) => updateExercise(ex.id, 'weight', Number(e.target.value))}
                                className="w-full bg-secondary/20 border border-white/5 rounded-xl px-3 py-2.5 text-sm font-bold text-center outline-none focus:border-primary/40 text-primary"
                              />
                            </div>
                          </div>

                          {ex.totalWeight > 0 && (
                            <div className="pt-2 flex justify-between items-center border-t border-white/5">
                              <span className="text-[9px] font-bold uppercase text-muted-foreground/40">Итого в упр.</span>
                              <span className="text-sm font-black text-primary">{ex.totalWeight} кг</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {exercises.length > 0 && (
                      <div className="p-5 bg-primary/5 border border-primary/20 rounded-3xl flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Общий поднятый вес</p>
                          <p className="text-[8px] text-muted-foreground italic mt-0.5">Сумма всех упражнений</p>
                        </div>
                        <p className="text-2xl font-black text-primary tracking-tighter">
                          {exercises.reduce((sum, ex) => sum + ex.totalWeight, 0)} <span className="text-xs font-bold opacity-60">кг</span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {getMetricsByCategory(category as any).filter(m => m.id !== 'sets' && m.id !== 'reps' && m.id !== 'workingWeight' && m.id !== 'volume').map(metric => (
                      <div key={metric.id} className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] uppercase font-black text-muted-foreground/80 tracking-widest leading-tight">
                            {metric.label}
                          </label>
                          {metric.unit && <span className="text-[8px] font-bold text-primary/40 uppercase">{metric.unit}</span>}
                        </div>
                        <input 
                          name={metric.id} 
                          type="number" 
                          step={metric.id === 'workingWeight' || metric.id === 'distance' ? '0.1' : '1'}
                          defaultValue={initialData?.[metric.id]}
                          placeholder={metric.placeholder} 
                          className="w-full bg-background/40 border border-white/5 rounded-2xl px-4 py-4 text-base outline-none focus:border-primary/40 focus:bg-background/60 transition-all font-bold" 
                        />
                        {metric.description && (
                          <p className="text-[9px] text-muted-foreground/40 leading-tight px-1 italic">
                            {metric.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-3 p-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary px-1 flex items-center gap-2">
              <Scale className="w-3 h-3" />
              Твой вес сегодня
            </label>
            <div className="relative group">
              <input 
                name="value" 
                type="number" 
                step="0.1" 
                inputMode="decimal" 
                required 
                defaultValue={initialData?.value}
                placeholder="75.5"
                className={cn(
                  "w-full bg-primary/5 border rounded-3xl px-8 py-8 text-4xl font-black outline-none focus:border-primary/40 focus:bg-primary/10 transition-all text-primary shadow-[0_0_30px_rgba(223,255,0,0.05)] text-center",
                  errors.value ? 'border-red-400/50' : 'border-primary/20'
                )} 
              />
              <span className="absolute right-8 top-1/2 -translate-y-1/2 text-lg font-black text-primary/20 uppercase tracking-tighter">кг</span>
            </div>
            {errors.value && <p className="text-center text-[10px] text-red-400 font-medium animate-pulse">{errors.value}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1 text-center block">Дата замера</label>
            <input 
              name="date" 
              type="date" 
              defaultValue={initialData?.date ? initialData.date.slice(0, 10) : new Date().toISOString().slice(0, 10)} 
              className="w-full bg-secondary/40 border border-white/5 rounded-3xl px-6 py-4 outline-none focus:border-primary/50 transition-all text-base font-medium text-center" 
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Заметки и мысли</label>
        <textarea 
          name="notes" 
          rows={2} 
          defaultValue={initialData?.notes}
          placeholder={type === 'weight' ? "Как ты себя чувствуешь?" : "Твои впечатления от тренировки..."}
          className="w-full bg-secondary/30 border border-white/5 rounded-3xl px-6 py-5 outline-none focus:border-primary/40 focus:bg-secondary/50 transition-all resize-none text-sm leading-relaxed" 
        />
      </div>

      <button 
        type="submit" 
        disabled={Object.keys(errors).length > 0}
        className="w-full bg-primary text-black font-black py-6 rounded-[2rem] hover:scale-[1.01] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(223,255,0,0.15)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.3em] text-xs"
      >
        Сохранить достижение
      </button>
    </form>
  );
};
