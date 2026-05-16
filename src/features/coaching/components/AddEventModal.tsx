import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Brain, Zap, Clock, Activity, Target, 
  Trash2, Calendar, CheckCircle2, AlertTriangle,
  RotateCcw, Save, Trash, ChevronRight, Edit3,
  ChevronDown, ChevronUp, Utensils, Info, Lightbulb,
  Dumbbell, Plus, Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { PlanEvent, PlanEventType, PlanEventStatus } from '../../../types';
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
    targetMuscle: eventToEdit?.metadata?.targetMuscle || ''
  });

  const [isGenerating, setIsGenerating] = useState(false);

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
        metadata: {
            intensity: formData.intensity,
            targetMuscle: formData.targetMuscle
        },
        aiRationale: isAIEnabled ? 'Сгенерировано по твоему запросу для оптимизации текущего цикла.' : undefined
    };

    // If AI enabled and workout, simulate generation
    if (isAIEnabled && formData.type === 'WORKOUT') {
        newEvent.exercises = [
            { 
                name: 'Жим штанги лёжа', 
                sets: 4, 
                reps: '8-10', 
                weight: '80кг', 
                rest: '90s',
                technique: {
                    steps: [
                        'Ляг на горизонтальную скамью.',
                        'Сведи лопатки и упрись ногами в пол.',
                        'Опускай штангу до касания нижней части грудных.',
                        'Выжми вес на выдохе.'
                    ],
                    coachTip: 'Держи локти под углом 45 градусов к корпусу для здоровья плеч.'
                }
            },
            { name: 'Разведение гантелей', sets: 3, reps: '12-15', weight: '16кг', rest: '60s' }
        ];
    }

    if (isAIEnabled && formData.type === 'NUTRITION') {
        newEvent.nutrition = {
            calories: 2800,
            protein: 180,
            carbs: 350,
            fats: 80,
            recommendedFoods: ['Бурый рис', 'Куриное филе', 'Авокадо', 'Греческий йогурт']
        };
    }

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
        className="relative w-full max-w-xl"
      >
        <GlassCard className="border-white/10 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                 </div>
                 <h2 className="text-xl font-display font-bold uppercase tracking-tight">Добавить событие</h2>
              </div>
              <button type="button" onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-8 space-y-6">
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
                        <p className="text-[10px] text-muted-foreground/60">Авто-генерация программы и нутриентов</p>
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
                    rows={3}
                    placeholder="Что мы сегодня планируем?"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-primary/40 transition-all resize-none"
                 />
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-black/40 flex gap-3">
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
