
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { User, Activity, Heart, Clock, FileText, Scale, Ruler, Coffee, Zap, Info, Plus, Trash2, ChevronDown, Check } from 'lucide-react';
import { useFitnessStore, useProfile } from '../../store/useFitnessStore';
import { ActivityLevel, BodyType, FitnessLevel, Gender, MetricBaseline } from '../../types';
import { BaselineParameters } from './components/BaselineParameters';
import { HealthContext } from './components/HealthContext';
import { LifestyleSection } from './components/LifestyleSection';
import { ProfileAvatar } from './components/ProfileAvatar';
import { METRICS, getMetricsByCategory } from '../../constants/metrics';
import { motion, AnimatePresence } from 'motion/react';

export const ProfileView: React.FC = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const profile = useProfile();
  
  const updateProfile = useFitnessStore(state => state.updateProfile);
  const updateBaseline = useFitnessStore(state => state.updateBaseline);
  const [showAdditional, setShowAdditional] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedMetricId, setSelectedMetricId] = useState('chest');

  useEffect(() => {
    const checkHydration = () => {
      if (useFitnessStore.persist.hasHydrated()) {
        setIsHydrated(true);
      } else {
        const unsub = useFitnessStore.persist.onFinishHydration(() => {
          setIsHydrated(true);
        });
        return unsub;
      }
    };
    return checkHydration();
  }, []);

  if (!isHydrated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Загрузка профиля...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-6">
        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl">
          <h2 className="text-2xl font-black uppercase text-red-500 mb-2 tracking-tighter italic">Ошибка загрузки</h2>
          <p className="text-muted-foreground text-sm uppercase font-black tracking-widest leading-relaxed">
            Не удалось загрузить данные профиля. Пожалуйста, перезагрузите страницу или обратитесь в поддержку.
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Обновить страницу
        </button>
      </div>
    );
  }

  const bodyMetrics = getMetricsByCategory('BODY').filter(m => m.id !== 'weight');
  const strengthMetrics = getMetricsByCategory('STRENGTH').filter(m => m.primary);
  const cardioMetrics = getMetricsByCategory('CARDIO').filter(m => m.primary);
  
  const currentMeasurements = (profile.baselines || []).filter(b => {
    const metric = METRICS[b.id];
    return (metric && (metric.category === 'BODY' || metric.category === 'STRENGTH' || metric.category === 'CARDIO') && b.id !== 'weight') || 
           (!metric && b.id.length > 30);
  });

  const handleAddMeasurement = (metricId: string) => {
    if (metricId === 'custom') {
      const newBaseline: MetricBaseline = {
        id: crypto.randomUUID(),
        name: 'Новый замер',
        value: 0,
        unit: 'ед.',
        date: new Date().toISOString()
      };
      updateBaseline(newBaseline);
    } else {
      const metricConfig = METRICS[metricId];
      if (!metricConfig) return;

      const newBaseline: MetricBaseline = {
        id: metricConfig.id,
        name: metricConfig.label,
        value: 0,
        unit: metricConfig.unit,
        date: new Date().toISOString()
      };
      updateBaseline(newBaseline);
    }
    setIsSelectOpen(false);
  };

  const removeMeasurement = (id: string) => {
    const newBaselines = (profile.baselines || []).filter(b => b.id !== id);
    updateProfile({ baselines: newBaselines });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 px-4 pt-10">
      {/* Header / Identity */}
      <div className="flex flex-col md:flex-row items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <ProfileAvatar profile={profile} />
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-5xl font-display font-black italic uppercase tracking-tighter text-white">
            {profile.name || 'Фитнес-профиль'}
          </h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
             <div className="bg-primary/20 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
               {profile.fitnessLevel === 'BEGINNER' ? 'Новичок' : 
                profile.fitnessLevel === 'INTERMEDIATE' ? 'Средний уровень' : 
                profile.fitnessLevel === 'ADVANCED' ? 'Продвинутый' : 'Новичок'}
             </div>
             <div className="bg-white/5 text-muted-foreground border border-white/10 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
               {profile.bodyType === 'ECTOMORPH' ? 'Эктоморф' : 
                profile.bodyType === 'MESOMORPH' ? 'Мезоморф' : 
                profile.bodyType === 'ENDOMORPH' ? 'Эндоморф' : 'Мезоморф'}
             </div>
             <div className="bg-white/5 text-muted-foreground border border-white/10 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
               {profile.activityLevel === 'LOW' ? 'Низкая активность' : 
                profile.activityLevel === 'MEDIUM' ? 'Умеренная' : 
                profile.activityLevel === 'HIGH' ? 'Высокая' : 'Умеренная'}
             </div>
          </div>
          <p className="text-muted-foreground max-w-xl text-sm">
             Ваша цифровая фитнес-карта. Здесь хранится информация о вашем теле, базовые показатели и история изменений, которые ИИ использует для настройки тренировок специально под вас.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal Data */}
        <div className="lg:col-span-1 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
           <GlassCard className="p-8 space-y-8 overflow-visible">
              <div className="flex items-center gap-3">
                 <User className="w-5 h-5 text-primary" />
                 <h3 className="text-lg font-bold tracking-tight">Личные данные</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Вес (кг)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={profile.weight || ''}
                      onChange={e => updateProfile({ weight: parseFloat(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-hidden focus:border-primary/50 transition-all font-bold text-primary"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Рост (см)</label>
                    <input 
                      type="number"
                      value={profile.height}
                      onChange={e => updateProfile({ height: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-hidden focus:border-primary/50 transition-all font-bold"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Возраст</label>
                    <input 
                      type="number"
                      value={profile.age}
                      onChange={e => updateProfile({ age: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-hidden focus:border-primary/50 transition-all font-bold"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Пол</label>
                    <div className="relative group">
                      <select 
                        value={profile.gender}
                        onChange={e => updateProfile({ gender: e.target.value as Gender })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-hidden focus:border-primary/50 transition-all appearance-none font-bold cursor-pointer"
                      >
                        <option value="MALE">Мужской</option>
                        <option value="FEMALE">Женский</option>
                        <option value="OTHER">Другой</option>
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                 </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => setShowAdditional(!showAdditional)}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
                >
                  <motion.div
                    animate={{ rotate: showAdditional ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                  Дополнительно
                </button>

                <AnimatePresence>
                  {showAdditional && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6 space-y-6">
                        <div className="flex items-center justify-between gap-4">
                          <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Обмеры тела</label>
                          <div className="relative">
                            <button
                              onClick={() => setIsSelectOpen(!isSelectOpen)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl hover:border-primary/30 transition-all text-[10px] font-bold uppercase"
                            >
                              <Plus className="w-3 h-3 text-primary" />
                              Добавить
                            </button>
                            
                            <AnimatePresence>
                              {isSelectOpen && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 top-full mt-2 w-48 bg-[#16161D] border border-white/10 rounded-2xl shadow-2xl z-[100] py-2"
                                >
                                  <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                                    <div className="px-4 py-2 text-[8px] font-black uppercase text-muted-foreground tracking-widest bg-white/5">Тело</div>
                                    {bodyMetrics.map(m => {
                                      const isAdded = currentMeasurements.some(curr => curr.id === m.id);
                                      return (
                                        <button
                                          key={m.id}
                                          onClick={() => !isAdded && handleAddMeasurement(m.id)}
                                          className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase flex items-center justify-between transition-colors ${
                                            isAdded ? 'opacity-30 cursor-default' : 'hover:bg-primary/10 hover:text-primary'
                                          }`}
                                        >
                                          {m.label}
                                          {isAdded && <Check className="w-3 h-3" />}
                                        </button>
                                      );
                                    })}
                                    
                                    <div className="px-4 py-2 text-[8px] font-black uppercase text-muted-foreground tracking-widest bg-white/5 border-t border-white/5">Сила</div>
                                    {strengthMetrics.map(m => {
                                      const isAdded = currentMeasurements.some(curr => curr.id === m.id);
                                      return (
                                        <button
                                          key={m.id}
                                          onClick={() => !isAdded && handleAddMeasurement(m.id)}
                                          className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase flex items-center justify-between transition-colors ${
                                            isAdded ? 'opacity-30 cursor-default' : 'hover:bg-primary/10 hover:text-primary'
                                          }`}
                                        >
                                          {m.label}
                                          {isAdded && <Check className="w-3 h-3" />}
                                        </button>
                                      );
                                    })}

                                    <div className="px-4 py-2 text-[8px] font-black uppercase text-muted-foreground tracking-widest bg-white/5 border-t border-white/5">Кардио / Выносливость</div>
                                    {cardioMetrics.map(m => {
                                      const isAdded = currentMeasurements.some(curr => curr.id === m.id);
                                      return (
                                        <button
                                          key={m.id}
                                          onClick={() => !isAdded && handleAddMeasurement(m.id)}
                                          className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase flex items-center justify-between transition-colors ${
                                            isAdded ? 'opacity-30 cursor-default' : 'hover:bg-primary/10 hover:text-primary'
                                          }`}
                                        >
                                          {m.label}
                                          {isAdded && <Check className="w-3 h-3" />}
                                        </button>
                                      );
                                    })}

                                    <div className="border-t border-white/5 mt-1 pt-1">
                                      <button
                                        onClick={() => handleAddMeasurement('custom')}
                                        className="w-full text-left px-4 py-2 text-[10px] font-black uppercase flex items-center gap-2 text-primary hover:bg-primary/10 transition-colors"
                                      >
                                        <Plus className="w-3 h-3" />
                                        Свой показатель
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {currentMeasurements.map(m => (
                            <div key={m.id} className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-2xl group/item">
                                <div className="flex-1">
                                  <input 
                                     type="text"
                                     value={m.name}
                                     onChange={e => updateBaseline({ ...m, name: e.target.value })}
                                     className="text-[9px] uppercase font-black text-muted-foreground tracking-tighter mb-1 bg-transparent border-none focus:outline-hidden w-full"
                                  />
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="number"
                                      value={m.value}
                                      onChange={e => updateBaseline({ ...m, value: parseFloat(e.target.value) })}
                                      className="bg-transparent font-display font-black text-lg w-16 focus:outline-hidden"
                                    />
                                    <input 
                                      type="text"
                                      value={m.unit}
                                      onChange={e => updateBaseline({ ...m, unit: e.target.value })}
                                      className="text-[10px] font-bold text-muted-foreground uppercase bg-transparent border-none focus:outline-hidden w-10"
                                    />
                                  </div>
                                </div>
                              <button 
                                onClick={() => removeMeasurement(m.id)}
                                className="opacity-0 group-hover/item:opacity-100 p-2 text-red-500/30 hover:text-red-500 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          
                          {currentMeasurements.length === 0 && (
                            <div className="text-center py-4 border border-dashed border-white/5 rounded-2xl">
                              <p className="text-[9px] uppercase font-bold text-muted-foreground/50 italic px-4">
                                Обмеры тела (грудь, бицепс и др.) помогают боту точнее видеть ваш прогресс
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
           </GlassCard>

           <GlassCard className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                 <Activity className="w-5 h-5 text-primary" />
                 <h3 className="text-lg font-bold tracking-tight">Телосложение</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                 {(['ECTOMORPH', 'MESOMORPH', 'ENDOMORPH'] as BodyType[]).map(type => (
                   <button
                     key={type}
                     onClick={() => updateProfile({ bodyType: type })}
                     className={`text-left p-4 rounded-2xl border transition-all ${
                       profile.bodyType === type 
                       ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(223,255,0,0.1)]' 
                       : 'bg-white/5 border-white/10 hover:bg-white/10'
                     }`}
                   >
                     <div className="font-bold text-sm tracking-tight">
                        {type === 'ECTOMORPH' ? 'Эктоморф' : type === 'MESOMORPH' ? 'Мезоморф' : 'Эндоморф'}
                     </div>
                     <div className="text-[10px] text-muted-foreground italic leading-tight mt-1">
                       {type === 'ECTOMORPH' && 'Хрупкое телосложение, быстрый обмен веществ, сложно набрать вес'}
                       {type === 'MESOMORPH' && 'Атлетичное тело, легко набирает мышцы и сжигает жир'}
                       {type === 'ENDOMORPH' && 'Крупное телосложение, замедленный метаболизм, склонность к полноте'}
                     </div>
                   </button>
                 ))}
              </div>
           </GlassCard>
        </div>

        {/* Center/Right Column: Baselines, Health, Lifestyle */}
        <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-right-4 duration-1000">
           <BaselineParameters />
           <HealthContext />
           <LifestyleSection />
           
           <GlassCard className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                 <FileText className="w-5 h-5 text-primary" />
                 <h3 className="text-lg font-bold tracking-tight">Ваши цели и мотивация</h3>
              </div>
              <textarea 
                placeholder="Что заставляет вас двигаться вперед? Чего вы хотите достичь на самом деле?"
                value={profile.motivation}
                onChange={e => updateProfile({ motivation: e.target.value })}
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-hidden focus:border-primary/50 transition-all text-sm resize-none leading-relaxed"
              />
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex gap-4 items-center">
                 <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <Info className="w-5 h-5" />
                 </div>
                 <div className="text-[10px] text-muted-foreground leading-relaxed uppercase font-black tracking-widest">
                    Эти данные анализируются ИИ для более точной персональной настройки ваших рекомендаций.
                 </div>
              </div>
           </GlassCard>
        </div>
      </div>
    </div>
  );
};
