import { GoalType } from '../types';

export type MetricCategory = 'BODY' | 'WORKOUT_BASIC' | 'STRENGTH' | 'CARDIO' | 'ENDURANCE' | 'OTHER';

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
    compatibleGoalTypes: [GoalType.WEIGHT_LOSS, GoalType.MUSCLE_GAIN],
    chartCompatible: true,
    aiCompatible: true,
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
    label: 'Рабочий вес',
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
    description: 'Вес отягощения, используемый в упражнении.'
  },
  volume: {
    id: 'volume',
    label: 'Объем',
    unit: 'кг',
    category: 'STRENGTH',
    primary: false,
    priority: 7,
    format: (val) => `${Math.round(val)} кг`,
    chartCompatible: true,
    aiCompatible: true,
    description: 'Суммарный тоннаж тренировки (сеты * повторения * вес).'
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
    chartCompatible: true,
    aiCompatible: true,
    description: 'Пройденное расстояние во время кардио-активности.'
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
    description: 'Частота сердечных сокращений во время нагрузки.'
  }
};

export const getMetricsByCategory = (category: MetricCategory) => 
  Object.values(METRICS).filter(m => m.category === category).sort((a, b) => a.priority - b.priority);

export const getPrimaryMetrics = () => 
  Object.values(METRICS).filter(m => m.primary).sort((a, b) => a.priority - b.priority);
