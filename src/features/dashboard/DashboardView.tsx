import React from "react";
import { RU } from "../../constants";
import { AppLayout } from "../../components/layout/AppLayout";
import { DashboardGrid } from "./components/DashboardGrid";
import { GlassCard } from "../../components/ui/GlassCard";
import { GradientButton } from "../../components/ui/GradientButton";
import { ChevronRight, Sparkles } from "lucide-react";

export const DashboardView: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-display font-medium mb-2">{RU.NAV.DASHBOARD}</h1>
            <p className="text-muted-foreground">Добро пожаловать в ваш персональный трекер на базе ИИ.</p>
          </div>
          <div className="hidden md:block">
            <GradientButton className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {RU.DASHBOARD.GET_RECOMMENDATION}
            </GradientButton>
          </div>
        </header>

        <DashboardGrid />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <GlassCard className="lg:col-span-2 min-h-[400px] flex flex-col justify-between p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Динамика веса</h2>
              <div className="flex gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                <span className="text-primary border-b border-primary pb-1">Анализ ИИ: Стабильно</span>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center border-t border-white/5 mt-4">
              <p className="text-muted-foreground italic opacity-50">Место для графика Recharts...</p>
            </div>
          </GlassCard>

          <div className="space-y-8">
            <GlassCard className="p-6 border-l-4 border-l-primary">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {RU.DASHBOARD.FORECAST}
              </h3>
              <div className="bg-white/5 rounded-2xl p-4 mb-4">
                <p className="text-2xl font-bold mb-1">15 Октября</p>
                <p className="text-xs text-muted-foreground">На основе ваших последних 14 тренировок.</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Вы достигнете цели на 5 дней раньше графика. Добавьте 15 минут кардио.
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">{RU.ENTRIES.TITLE}</h3>
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Силовая: Плечи</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Сегодня</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                ))}
              </div>
              <GradientButton variant="outline" className="w-full mt-6">
                Смотреть все
              </GradientButton>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

// Activity icon for list
const Activity = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);
