import { GoalType } from '../types';

export type MetricCategory = 'BODY' | 'WORKOUT_BASIC' | 'STRENGTH' | 'CARDIO' | 'ENDURANCE' | 'FLEXIBILITY' | 'OTHER';

export interface MetricDefinition {
  id: string;
  label: string;
  unit: string;
  category: MetricCategory;
  primary: boolean;
  priority: number; // For sorting/display
  format: (val: number) => string;
  placeholder?: string;
  min?: number;
  max?: number;
  compatibleGoalTypes?: GoalType[];
  chartCompatible: boolean;
  aiCompatible: boolean;
  icon?: string;
  description?: string;
}

export const METRICS: Record<string, MetricDefinition> = {
  weight: {
    id: 'weight',
    label: 'Вес',
    unit: 'кг',
    category: 'BODY',
    primary: true,
    priority: 1,
    format: (val) => `${val.toFixed(1)} кг`,
    placeholder: '75.0',
    min: 30,
    max: 300,
    compatibleGoalTypes: [GoalType.WEIGHT_LOSS, GoalType.MUSCLE_GAIN, GoalType.MAINTENANCE],
    chartCompatible: true,
    aiCompatible: true,
    icon: '⚖️',
    description: 'Масса тела пользователя для отслеживания динамики похудения или набора мышечной массы.'
  },
  duration: {
    id: 'duration',
    label: 'Длительность',
    unit: 'мин',
    category: 'WORKOUT_BASIC',
    primary: true,
    priority: 2,
    format: (val) => `${Math.round(val)} мин`,
    placeholder: '45',
    min: 1,
    max: 360,
    chartCompatible: true,
    aiCompatible: true,
    icon: '⏱️',
    description: 'Общее время тренировочной сессии.'
  },
  caloriesBurned: {
    id: 'caloriesBurned',
    label: 'Калории',
    unit: 'ккал',
    category: 'WORKOUT_BASIC',
    primary: true,
    priority: 3,
    format: (val) => `${Math.round(val)} ккал`,
    placeholder: '300',
    min: 0,
    max: 5000,
    chartCompatible: true,
    aiCompatible: true,
    icon: '🔥',
    description: 'Оценочное количество сожженных калорий во время активности.'
  },
  sets: {
    id: 'sets',
    label: 'Подходы',
    unit: '',
    category: 'STRENGTH',
    primary: false,
    priority: 4,
    format: (val) => `${val}`,
    placeholder: '4',
    min: 1,
    max: 100,
    chartCompatible: false,
    aiCompatible: true,
    description: 'Количество выполненных подходов в упражнении.'
  },
  reps: {
    id: 'reps',
    label: 'Повторения',
    unit: '',
    category: 'STRENGTH',
    primary: false,
    priority: 5,
    format: (val) => `${val}`,
    placeholder: '12',
    min: 1,
    max: 1000,
    chartCompatible: false,
    aiCompatible: true,
    description: 'Количество повторений в одном подходе.'
  },
  workingWeight: {
    id: 'workingWeight',
    label: 'Рабочий вес в упражнении',
    unit: 'кг',
    category: 'STRENGTH',
    primary: false,
    priority: 6,
    format: (val) => `${val} кг`,
    placeholder: '60',
    min: 0,
    max: 1000,
    compatibleGoalTypes: [GoalType.STRENGTH],
    chartCompatible: true,
    aiCompatible: true,
    icon: '🏋️',
    description: 'Вес отягощения для тренировочного упражнения.'
  },
  volume: {
    id: 'volume',
    label: 'Общий поднятый вес',
    unit: 'кг',
    category: 'STRENGTH',
    primary: false,
    priority: 7,
    format: (val) => `${Math.round(val)} кг`,
    chartCompatible: true,
    aiCompatible: true,
    description: 'Сколько веса суммарно поднято за тренировку (Сеты × Повторения × Вес).'
  },
  distance: {
    id: 'distance',
    label: 'Дистанция',
    unit: 'км',
    category: 'CARDIO',
    primary: false,
    priority: 8,
    format: (val) => `${val.toFixed(2)} км`,
    placeholder: '5.0',
    min: 0,
    max: 1000,
    compatibleGoalTypes: [GoalType.ENDURANCE],
    chartCompatible: true,
    aiCompatible: true,
    icon: '🛣️',
    description: 'Пройденное расстояние во время кардио-активности.'
  },
  pace: {
    id: 'pace',
    label: 'Темп',
    unit: 'мин/км',
    category: 'CARDIO',
    primary: false,
    priority: 8.5,
    format: (val) => `${val} мин/км`,
    placeholder: '5:30',
    compatibleGoalTypes: [GoalType.ENDURANCE],
    chartCompatible: true,
    aiCompatible: true,
    icon: '🏃',
    description: 'Среднее время на преодоление одного километра.'
  },
  speed: {
    id: 'speed',
    label: 'Скорость',
    unit: 'км/ч',
    category: 'CARDIO',
    primary: false,
    priority: 9,
    format: (val) => `${val.toFixed(1)} км/ч`,
    placeholder: '10.0',
    min: 0,
    max: 100,
    chartCompatible: true,
    aiCompatible: true,
    description: 'Средняя скорость движения.'
  },
  heartRate: {
    id: 'heartRate',
    label: 'Пульс',
    unit: 'BPM',
    category: 'ENDURANCE',
    primary: false,
    priority: 10,
    format: (val) => `${Math.round(val)} BPM`,
    placeholder: '145',
    min: 30,
    max: 250,
    chartCompatible: true,
    aiCompatible: true,
    icon: '💓',
    description: 'Частота сердечных сокращений во время нагрузки.'
  },
  intensity: {
    id: 'intensity',
    label: 'Интенсивность',
    unit: '%',
    category: 'OTHER',
    primary: false,
    priority: 11,
    format: (val) => `${val}%`,
    placeholder: '80',
    min: 0,
    max: 100,
    chartCompatible: true,
    aiCompatible: true,
    icon: '⚡',
    description: 'Субъективная оценка сложности тренировки.'
  },
  flexibilityScale: {
    id: 'flexibilityScale',
    label: 'Уровень растяжки',
    unit: '/10',
    category: 'FLEXIBILITY',
    primary: false,
    priority: 12,
    format: (val) => `${val}/10`,
    placeholder: '5',
    min: 1,
    max: 10,
    chartCompatible: true,
    aiCompatible: true,
    icon: '🧘',
    description: 'Прогресс в гибкости и выполнении асан.'
  },
  biceps: {
    id: 'biceps',
    label: 'Бицепс',
    unit: 'см',
    category: 'BODY',
    primary: false,
    priority: 20,
    format: (val) => `${val.toFixed(1)} см`,
    placeholder: '38.0',
    min: 10,
    max: 100,
    chartCompatible: true,
    aiCompatible: true,
    icon: '💪',
    description: 'Обхват плеча (бицепса).'
  },
  chest: {
    id: 'chest',
    label: 'Грудь',
    unit: 'см',
    category: 'BODY',
    primary: false,
    priority: 21,
    format: (val) => `${val.toFixed(1)} см`,
    placeholder: '105.0',
    min: 40,
    max: 200,
    chartCompatible: true,
    aiCompatible: true,
    icon: '👕',
    description: 'Обхват грудной клетки.'
  },
  waist: {
    id: 'waist',
    label: 'Талия',
    unit: 'см',
    category: 'BODY',
    primary: false,
    priority: 22,
    format: (val) => `${val.toFixed(1)} см`,
    placeholder: '85.0',
    min: 30,
    max: 200,
    chartCompatible: true,
    aiCompatible: true,
    icon: '📏',
    description: 'Обхват талии.'
  },
  hips: {
    id: 'hips',
    label: 'Бедра',
    unit: 'см',
    category: 'BODY',
    primary: false,
    priority: 23,
    format: (val: number) => `${val.toFixed(1)} см`,
    placeholder: '95.0',
    min: 30,
    max: 200,
    chartCompatible: true,
    aiCompatible: true,
    icon: '🍑',
    description: 'Обхват бедер.'
  },
  forearm: {
    id: 'forearm',
    label: 'Предплечье',
    unit: 'см',
    category: 'BODY',
    primary: false,
    priority: 24,
    format: (val: number) => `${val.toFixed(1)} см`,
    placeholder: '28.0',
    min: 10,
    max: 60,
    chartCompatible: true,
    aiCompatible: true,
    icon: '💪',
    description: 'Обхват предплечья.'
  },
  thigh: {
    id: 'thigh',
    label: 'Бедро',
    unit: 'см',
    category: 'BODY',
    primary: false,
    priority: 25,
    format: (val: number) => `${val.toFixed(1)} см`,
    placeholder: '60.0',
    min: 20,
    max: 120,
    chartCompatible: true,
    aiCompatible: true,
    icon: '🦵',
    description: 'Обхват бедра в самой широкой части.'
  },
  calf: {
    id: 'calf',
    label: 'Голень',
    unit: 'см',
    category: 'BODY',
    primary: false,
    priority: 26,
    format: (val: number) => `${val.toFixed(1)} см`,
    placeholder: '38.0',
    min: 10,
    max: 80,
    chartCompatible: true,
    aiCompatible: true,
    icon: '🦶',
    description: 'Обхват голени (икроножной мышцы).'
  },
  neck: {
    id: 'neck',
    label: 'Шея',
    unit: 'см',
    category: 'BODY',
    primary: false,
    priority: 27,
    format: (val: number) => `${val.toFixed(1)} см`,
    placeholder: '40.0',
    min: 20,
    max: 80,
    chartCompatible: true,
    aiCompatible: true,
    icon: '🦒',
    description: 'Обхват шеи.'
  },
  shoulders: {
    id: 'shoulders',
    label: 'Плечи',
    unit: 'см',
    category: 'BODY',
    primary: false,
    priority: 28,
    format: (val: number) => `${val.toFixed(1)} см`,
    placeholder: '120.0',
    min: 40,
    max: 250,
    chartCompatible: true,
    aiCompatible: true,
    icon: '👔',
    description: 'Обхват плечевого пояса.'
  }
};

export const getMetricsByCategory = (category: MetricCategory) => 
  Object.values(METRICS).filter(m => m.category === category).sort((a, b) => a.priority - b.priority);

export const getPrimaryMetrics = () => 
  Object.values(METRICS).filter(m => m.primary).sort((a, b) => a.priority - b.priority);
