import React from "react";
import { RU } from "../../../constants";
import { GoalType } from "../../../types";

interface GoalFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export const GoalForm: React.FC<GoalFormProps> = ({ onSubmit, initialData }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onSubmit(Object.fromEntries(formData));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Название цели</label>
        <input 
          name="title" 
          defaultValue={initialData?.title}
          required
          placeholder="Напр: Сбросить 5 кг"
          className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Тип</label>
          <select name="type" defaultValue={initialData?.type || GoalType.WEIGHT_LOSS} className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors">
            <option value={GoalType.WEIGHT_LOSS}>{RU.GOALS.TYPES.WEIGHT_LOSS}</option>
            <option value={GoalType.MUSCLE_GAIN}>{RU.GOALS.TYPES.MUSCLE_GAIN}</option>
            <option value={GoalType.STRENGTH}>{RU.GOALS.TYPES.STRENGTH}</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Целевое значение</label>
          <input 
            name="targetValue" 
            type="number" 
            step="0.1"
            inputMode="decimal"
            defaultValue={initialData?.targetValue}
            required
            className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Срок</label>
        <input 
          name="deadline" 
          type="date"
          defaultValue={initialData?.deadline?.split('T')[0]}
          required
          className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
        />
      </div>

      <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity">
        {initialData ? RU.COMMON.SAVE : RU.GOALS.ADD}
      </button>
    </form>
  );
};
