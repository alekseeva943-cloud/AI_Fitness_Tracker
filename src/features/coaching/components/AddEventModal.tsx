import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Brain, Zap, Clock, Activity, Target, 
  Trash2, Calendar, CheckCircle2, AlertTriangle,
  RotateCcw, Save, Trash, ChevronRight, Edit3,
  ChevronDown, ChevronUp, Utensils, Info, Lightbulb,
  Dumbbell, Plus, Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { PlanEvent, PlanEventType, PlanEventStatus, ExercisePlan } from '../../../types';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GradientButton } from '../../../components/ui/GradientButton';
import { cn } from '../../../lib/utils';
import { useFitnessStore } from '../../../store/useFitnessStore';

interface AddEventModalProps {
  onClose: () => void;
  initialDate?: Date;
  eventToEdit?: PlanEvent;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ onClose, initialDate, eventToEdit }) => {
  const addPlanEvent = useFitnessStore(state => state.addPlanEvent);
  const updatePlanEvent = useFitnessStore(state => state.updatePlanEvent);
  
  const [isAIEnabled, setIsAIEnabled] = useState(eventToEdit ? eventToEdit.source === 'AI' : true);
  const [formData, setFormData] = useState({
    title: eventToEdit?.title || '',
    type: eventToEdit?.type || 'WORKOUT' as PlanEventType,
    date: (eventToEdit ? new Date(eventToEdit.date) : (initialDate || new Date())).toISOString().split('T')[0],
    time: eventToEdit ? format(new Date(eventToEdit.date), 'HH:mm') : '09:00',
    duration: eventToEdit?.duration?.toString() || '60',
    description: eventToEdit?.description || '',
    intensity: eventToEdit?.metadata?.intensity || 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    targetMuscle: eventToEdit?.metadata?.targetMuscle || '',
    exercises: eventToEdit?.exercises || [] as ExercisePlan[],
    nutrition: eventToEdit?.nutrition || { calories: 2500, protein: 150, carbs: 300, fats: 70, recommendedFoods: [] }
  });

  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  // Simulate AI reaction to changes
  useEffect(() => {
    if (!isAIEnabled) return;

    const timeout = setTimeout(() => {
        if (formData.type === 'WORKOUT' && formData.targetMuscle) {
            setAiAdvice(`Анализ Genesis-X9: Тренировка на ${formData.targetMuscle} при текущем уровне стресса ${useFitnessStore.getState().profile?.stressLevel || 4}/10 оптимальна. Я рекомендую держать RPE в районе 8.`);
        } else if (formData.type === 'NUTRITION') {
            setAiAdvice(`Анализ Genesis-X9: Твоя цель — гипертрофия. Профицит в ${formData.nutrition.calories} ккал обеспечит нужный анаболический фон.`);
        }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [formData.targetMuscle, formData.intensity, formData.nutrition.calories, isAIEnabled]);

  const addExercise = () => {
    setFormData({
        ...formData,
        exercises: [...formData.exercises, { name: 'Новое упражнение', sets: 3, reps: '12', rest: '60s' }]
    });
  };

  const updateExercise = (index: number, field: keyof ExercisePlan, value: any) => {
    const newExs = [...formData.exercises];
    newExs[index] = { ...newExs[index], [field]: value };
    setFormData({ ...formData, exercises: newExs });
  };

  const removeExercise = (index: number) => {
    setFormData({ ...formData, exercises: formData.exercises.filter((_, i) => i !== index) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dateTime = new Date(`${formData.date}T${formData.time}`);
    
    if (eventToEdit) {
        updatePlanEvent(eventToEdit.id, {
            title: formData.title,
            type: formData.type,
            date: dateTime.toISOString(),
            duration: parseInt(formData.duration),
            description: formData.description,
            exercises: formData.type === 'WORKOUT' ? formData.exercises : undefined,
            nutrition: formData.type === 'NUTRITION' ? formData.nutrition : undefined,
            metadata: {
                ...eventToEdit.metadata,
                intensity: formData.intensity,
                targetMuscle: formData.targetMuscle
            }
        });
        onClose();
        return;
    }
    
    const newEvent: PlanEvent = {
        id: crypto.randomUUID(),
        title: formData.title || (formData.type === 'WORKOUT' ? 'Новая тренировка' : 'Новое событие'),
        type: formData.type,
        source: isAIEnabled ? 'AI' : 'USER',
        status: 'PLANNED',
        date: dateTime.toISOString(),
        duration: parseInt(formData.duration),
        description: formData.description,
        isCompleted: false,
        isAI: isAIEnabled,
        createdAt: new Date().toISOString(),
        exercises: formData.type === 'WORKOUT' ? (formData.exercises.length > 0 ? formData.exercises : [
            { name: 'Жим штанги лёжа', sets: 4, reps: '8-10', weight: '80кг', rest: '90s' },
            { name: 'Разведение гантелей', sets: 3, reps: '12-15', weight: '16кг', rest: '60s' }
        ]) : undefined,
        nutrition: formData.type === 'NUTRITION' ? formData.nutrition : undefined,
        metadata: {
            intensity: formData.intensity,
            targetMuscle: formData.targetMuscle
        },
        aiRationale: isAIEnabled ? 'Сгенерировано по твоему запросу для оптимизации текущего цикла.' : undefined
    };

    addPlanEvent(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl h-[85vh] flex flex-col"
      >
        <GlassCard className="border-white/10 overflow-hidden flex flex-col h-full shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                 </div>
                 <h2 className="text-xl font-display font-bold uppercase tracking-tight">
                    {eventToEdit ? 'Изменить событие' : 'Добавить в календарь'}
                 </h2>
              </div>
              <button type="button" onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-8 space-y-6">
              {/* Type Selection */}
              <div className="flex gap-2">
                 {(['WORKOUT', 'NUTRITION', 'RECOVERY', 'REMINDER'] as PlanEventType[]).map(type => (
                   <button
                     key={type}
                     type="button"
                     onClick={() => setFormData({ ...formData, type })}
                     className={cn(
                       "flex-1 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all",
                       formData.type === type ? "bg-primary border-primary text-black" : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                     )}
                   >
                     {type === 'WORKOUT' ? 'Зал' : type === 'NUTRITION' ? 'Питание' : type === 'RECOVERY' ? 'Отдых' : 'Инфо'}
                   </button>
                 ))}
              </div>

              {/* AI Toggle */}
              <div className="space-y-4">
                <button
                    type="button"
                    onClick={() => setIsAIEnabled(!isAIEnabled)}
                    className={cn(
                        "w-full p-4 rounded-3xl border flex items-center justify-between transition-all group",
                        isAIEnabled ? "bg-primary/5 border-primary/20" : "bg-white/5 border-white/5"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                            isAIEnabled ? "bg-primary text-black shadow-[0_0_15px_rgba(223,255,0,0.3)]" : "bg-white/5 text-muted-foreground"
                        )}>
                            <Brain className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className={cn("text-xs font-bold uppercase tracking-tight", isAIEnabled ? "text-primary" : "text-muted-foreground")}>AI Assisted Mode</p>
                            <p className="text-[10px] text-muted-foreground/60">Авто-генерация и анализ изменений</p>
                        </div>
                    </div>
                    <div className={cn(
                        "w-12 h-6 rounded-full p-1 transition-all",
                        isAIEnabled ? "bg-primary" : "bg-white/10"
                    )}>
                        <div className={cn(
                            "w-4 h-4 rounded-full bg-white transition-all transform",
                            isAIEnabled ? "translate-x-6" : "translate-x-0"
                        )} />
                    </div>
                </button>

                <AnimatePresence>
                    {isAIEnabled && aiAdvice && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 bg-primary/10 rounded-2xl border border-primary/20 flex gap-3 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-2 opacity-5">
                                <Brain className="w-12 h-12" />
                            </div>
                            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <p className="text-[10px] font-bold text-primary leading-snug italic">
                                "{aiAdvice}"
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Название</label>
                    <input 
                       type="text" 
                       value={formData.title}
                       onChange={e => setFormData({ ...formData, title: e.target.value })}
                       placeholder={isAIEnabled ? "Оставь пустым для AI..." : "Напр: Грудь + Трицепс"}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-primary/40 transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Целевая мышца</label>
                    <input 
                       type="text" 
                       value={formData.targetMuscle}
                       onChange={e => setFormData({ ...formData, targetMuscle: e.target.value })}
                       placeholder="Грудь, Спина..."
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-primary/40 transition-all"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Дата</label>
                    <input 
                       type="date" 
                       value={formData.date}
                       onChange={e => setFormData({ ...formData, date: e.target.value })}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-primary/40 transition-all [color-scheme:dark]"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Время</label>
                    <input 
                       type="time" 
                       value={formData.time}
                       onChange={e => setFormData({ ...formData, time: e.target.value })}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-primary/40 transition-all [color-scheme:dark]"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Длительность</label>
                    <input 
                       type="number" 
                       value={formData.duration}
                       onChange={e => setFormData({ ...formData, duration: e.target.value })}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-primary/40 transition-all"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Заметки / Описание</label>
                 <textarea 
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    placeholder="Что мы сегодня планируем?"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-primary/40 transition-all resize-none"
                 />
              </div>

              {/* Workout Editor */}
              {formData.type === 'WORKOUT' && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                   <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Программа упражнений</h3>
                      <button 
                        type="button"
                        onClick={addExercise}
                        className="flex items-center gap-1.5 text-[10px] font-black text-primary hover:bg-primary/10 px-3 py-1.5 rounded-xl transition-all"
                      >
                         <Plus className="w-3 h-3" /> ДОБАВИТЬ
                      </button>
                   </div>
                   
                   <div className="space-y-3">
                      {formData.exercises.map((ex, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 group/ex">
                           <div className="flex items-center gap-3">
                              <input 
                                type="text"
                                value={ex.name}
                                onChange={e => updateExercise(idx, 'name', e.target.value)}
                                placeholder="Название упражнения"
                                className="flex-1 bg-transparent border-none text-sm font-bold focus:outline-none placeholder:text-muted-foreground/30"
                              />
                              <button 
                                type="button" 
                                onClick={() => removeExercise(idx)}
                                className="p-1.5 text-muted-foreground hover:text-red-400 opacity-0 group-hover/ex:opacity-100 transition-all"
                              >
                                 <Trash2 className="w-3.5 h-3.5" />
                              </button>
                           </div>
                           <div className="grid grid-cols-4 gap-2">
                              <div className="space-y-1">
                                 <p className="text-[8px] font-black uppercase text-muted-foreground/40">Sets</p>
                                 <input 
                                    type="number" 
                                    value={ex.sets}
                                    onChange={e => updateExercise(idx, 'sets', parseInt(e.target.value))}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-[11px] focus:outline-none"
                                 />
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[8px] font-black uppercase text-muted-foreground/40">Reps</p>
                                 <input 
                                    type="text" 
                                    value={ex.reps}
                                    onChange={e => updateExercise(idx, 'reps', e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-[11px] focus:outline-none"
                                 />
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[8px] font-black uppercase text-muted-foreground/40">Weight</p>
                                 <input 
                                    type="text" 
                                    value={ex.weight}
                                    onChange={e => updateExercise(idx, 'weight', e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-[11px] focus:outline-none"
                                 />
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[8px] font-black uppercase text-muted-foreground/40">Rest</p>
                                 <input 
                                    type="text" 
                                    value={ex.rest}
                                    onChange={e => updateExercise(idx, 'rest', e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-[11px] focus:outline-none"
                                 />
                              </div>
                           </div>
                        </div>
                      ))}
                      {formData.exercises.length === 0 && (
                        <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-3xl">
                           <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest italic">Нет упражнений</p>
                        </div>
                      )}
                   </div>
                </div>
              )}

              {/* Nutrition Editor */}
              {formData.type === 'NUTRITION' && (
                 <div className="space-y-4 pt-4 border-t border-white/5">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">План питания</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-2">Цель калорий</label>
                          <input 
                             type="number" 
                             value={formData.nutrition.calories}
                             onChange={e => setFormData({ ...formData, nutrition: { ...formData.nutrition, calories: parseInt(e.target.value) } })}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-primary/40 transition-all"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-2">Белки (г)</label>
                          <input 
                             type="number" 
                             value={formData.nutrition.protein}
                             onChange={e => setFormData({ ...formData, nutrition: { ...formData.nutrition, protein: parseInt(e.target.value) } })}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-primary/40 transition-all"
                          />
                       </div>
                    </div>
                 </div>
              )}
            </div>

            <div className="p-6 border-t border-white/5 bg-black/40 flex gap-3 shrink-0">
               <GradientButton 
                 type="button" 
                 variant="outline" 
                 onClick={onClose}
                 className="flex-1 h-14 text-[10px] font-black"
               >
                  ОТМЕНА
               </GradientButton>
               <GradientButton 
                 type="submit"
                 className="flex-[2] h-14 text-[10px] font-black"
               >
                  {isAIEnabled ? (
                      <div className="flex items-center gap-2">
                         <Sparkles className="w-4 h-4" />
                         СФОРМИРОВАТЬ ПЛАН
                      </div>
                  ) : 'ДОБАВИТЬ В ПЛАН'}
               </GradientButton>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};
