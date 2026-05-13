import React from "react";
import { RU } from "../../../constants";

interface EntryFormProps {
  type: 'workout' | 'weight';
  onSubmit: (data: any) => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({ type, onSubmit }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onSubmit(Object.fromEntries(formData));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {type === 'workout' ? (
        <>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Тип тренировки</label>
            <input name="type" required placeholder="Напр: Силовая, Плечи" className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{RU.ENTRIES.DURATION} (мин)</label>
              <input name="duration" type="number" inputMode="numeric" required className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{RU.ENTRIES.CALORIES}</label>
              <input name="caloriesBurned" type="number" inputMode="numeric" className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors" />
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Вес (кг)</label>
          <input name="value" type="number" step="0.1" inputMode="decimal" required className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors" />
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Дата</label>
        <input name="date" type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} required className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors" />
      </div>

      {type === 'workout' && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Заметки</label>
          <textarea name="notes" rows={3} className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors resize-none" />
        </div>
      )}

      <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity">
        {RU.COMMON.SAVE}
      </button>
    </form>
  );
};
