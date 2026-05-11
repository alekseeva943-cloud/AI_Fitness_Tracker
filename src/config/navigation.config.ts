import { LayoutDashboard, BarChart2, Dumbbell, Target, MessageSquare } from 'lucide-react';
import { RU } from '../constants';

export const NAVIGATION_CONFIG = [
  {
    id: 'dashboard',
    label: RU.NAV.DASHBOARD,
    icon: LayoutDashboard,
    path: '/',
  },
  {
    id: 'analytics',
    label: RU.NAV.ANALYTICS,
    icon: BarChart2,
    path: '/analytics',
  },
  {
    id: 'workouts',
    label: RU.NAV.ENTRIES,
    icon: Dumbbell,
    path: '/workouts',
  },
  {
    id: 'goals',
    label: RU.NAV.GOALS,
    icon: Target,
    path: '/goals',
  },
  {
    id: 'ai-chat',
    label: RU.NAV.AI,
    icon: MessageSquare,
    path: '/ai-chat',
  },
];
