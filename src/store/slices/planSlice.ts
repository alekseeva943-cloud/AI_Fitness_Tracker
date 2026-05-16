import { StateCreator } from 'zustand';
import { PlanEvent } from '../../types';

export interface PlanSlice {
  planEvents: PlanEvent[];
  addPlanEvent: (event: PlanEvent) => void;
  updatePlanEvent: (id: string, event: Partial<PlanEvent>) => void;
  removePlanEvent: (id: string) => void;
  togglePlanEvent: (id: string) => void;
  setPlanEventStatus: (id: string, status: PlanEvent['status']) => void;
  setPlanEvents: (events: PlanEvent[]) => void;
}

export const createPlanSlice: StateCreator<
  any,
  [],
  [],
  PlanSlice
> = (set) => ({
  planEvents: [],
  addPlanEvent: (event) => set((state: any) => ({
    planEvents: [...state.planEvents, event]
  })),
  updatePlanEvent: (id, event) => set((state: any) => ({
    planEvents: state.planEvents.map((e: any) => e.id === id ? { ...e, ...event } : e)
  })),
  removePlanEvent: (id) => set((state: any) => ({
    planEvents: state.planEvents.filter((e: any) => e.id !== id)
  })),
  togglePlanEvent: (id) => set((state: any) => ({
    planEvents: state.planEvents.map((e: any) => e.id === id ? { 
      ...e, 
      isCompleted: !e.isCompleted,
      status: !e.isCompleted ? 'COMPLETED' : 'PLANNED'
    } : e)
  })),
  setPlanEventStatus: (id, status) => set((state: any) => ({
    planEvents: state.planEvents.map((e: any) => e.id === id ? { 
      ...e, 
      status,
      isCompleted: status === 'COMPLETED'
    } : e)
  })),
  setPlanEvents: (events) => set({ planEvents: events }),
});
