import React, { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { useFitnessStore } from "../../store/useFitnessStore";
import { cn } from "../../lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { theme } = useFitnessStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <div className={cn(
      "min-h-screen bg-background text-foreground flex font-sans",
      theme === 'dark' ? 'dark' : 'light'
    )}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
