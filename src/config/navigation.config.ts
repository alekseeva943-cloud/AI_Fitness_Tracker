import { LayoutDashboard, BarChart2, Dumbbell, Target, MessageSquare, UserCircle } from 'lucide-react';
import { RU } from '../constants';

export const NAVIGATION_CONFIG = [
  {
    id: 'dashboard',
    label: RU.NAV.DASHBOARD,
    icon: LayoutDashboard,
    path: '/',
  },
  {
    id: 'profile',
    label: RU.NAV.PROFILE,
    icon: UserCircle,
    path: '/profile',
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
