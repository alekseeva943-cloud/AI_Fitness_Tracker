import { GoalType, ActivityLevel, Goal, FitnessState } from "./index";

export const MOCK_GOAL_ID = 'goal-1';

export const INITIAL_DEMO_STATE: FitnessState = {
  profile: {
    id: 'demo-user',
    name: 'Алексей',
    displayName: 'Алексей',
    age: 28,
    gender: 'MALE',
    height: 182,
    weight: 85.5,
    bodyType: 'MESOMORPH',
    activityLevel: ActivityLevel.MEDIUM,
    fitnessLevel: 'INTERMEDIATE',
    baselines: [
      { id: 'weight', name: 'Вес', value: 85.5, unit: 'кг', date: '2026-04-01T00:00:00.000Z' },
      { id: 'workingWeight', name: 'Жим лежа', value: 60, unit: 'кг', date: '2026-04-01T00:00:00.000Z' },
      { id: 'distance', name: 'Бег (5км)', value: 32, unit: 'мин', date: '2026-04-01T00:00:00.000Z' }
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-05-15T00:00:00.000Z',
  },
  goals: [
    {
      id: MOCK_GOAL_ID,
      title: 'Сбросить 5 кг',
      type: GoalType.WEIGHT_LOSS,
      metricId: 'weight',
      targetValue: 80,
      currentValue: 82.3,
      startValue: 85.5,
      unit: 'кг',
      startDate: '2026-04-01T00:00:00.000Z',
      deadline: '2026-07-01T00:00:00.000Z',
      createdAt: '2026-04-01T00:00:00.000Z',
      status: 'ACTIVE',
    }
  ],
  activeGoalId: MOCK_GOAL_ID,
  weightHistory: [
    { id: 'w1', date: '2026-05-10T10:00:00Z', value: 82.3, unit: 'кг' },
    { id: 'w2', date: '2026-05-03T10:00:00Z', value: 83.1, unit: 'кг' },
    { id: 'w3', date: '2026-04-26T10:00:00Z', value: 83.8, unit: 'кг' },
    { id: 'w4', date: '2026-04-19T10:00:00Z', value: 84.5, unit: 'кг' },
    { id: 'w5', date: '2026-04-12T10:00:00Z', value: 85.0, unit: 'кг' },
    { id: 'w6', date: '2026-04-01T10:00:00Z', value: 85.5, unit: 'кг' },
  ],
  workouts: [
    { id: 'ex1', date: '2026-05-11T08:00:00Z', type: 'Силовая: Плечи', duration: 60, caloriesBurned: 450 },
    { id: 'ex2', date: '2026-05-09T08:00:00Z', type: 'Бег: 5км', duration: 30, caloriesBurned: 350 },
    { id: 'ex3', date: '2026-05-07T08:00:00Z', type: 'Силовая: Спина', duration: 75, caloriesBurned: 550 },
    { id: 'ex4', date: '2026-05-05T08:00:00Z', type: 'Йога', duration: 45, caloriesBurned: 150 },
    { id: 'ex5', date: '2026-05-02T08:00:00Z', type: 'Силовая: Грудь', duration: 60, caloriesBurned: 480 },
  ],
  analyses: [],
  isDemoMode: true
};
