import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useFitnessStore } from "../../store/useFitnessStore";
import { NAVIGATION_CONFIG } from "../../config/navigation.config";
import { cn } from "../../lib/utils";
import { Dumbbell, Sun, Moon } from "lucide-react";

export const Sidebar: React.FC = () => {
  const { theme, toggleTheme } = useFitnessStore();
  const profile = useFitnessStore(state => state.profile);

  return (
    <aside className="w-64 border-r border-white/5 flex flex-col h-screen sticky top-0 bg-background/50 backdrop-blur-md">
      <Link to="/" className="p-8 flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-black" />
        </div>
        <span className="text-xl font-display font-bold tracking-tight">AI FITNESS</span>
      </Link>

      <nav className="flex-1 px-4 space-y-2">
        {NAVIGATION_CONFIG.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group text-muted-foreground hover:text-foreground hover:bg-white/5",
              isActive && "bg-white/5 text-foreground border border-white/10"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="text-sm font-medium">{theme === 'dark' ? 'Светлая тема' : 'Темная тема'}</span>
        </button>
        
        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 mt-4">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1 opacity-50">Архитектура v1.0.4</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-mono opacity-70">AI Engine Online</span>
          </div>
        </div>

        {/* User Mini Profile */}
        <Link 
          to="/profile" 
          className="flex items-center gap-3 p-3 mt-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary/20 border border-primary/20 flex items-center justify-center shrink-0">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              <Dumbbell className="w-5 h-5 text-primary opacity-50" />
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-foreground truncate">{profile?.displayName || 'Пользователь'}</p>
            <p className="text-[8px] uppercase font-black tracking-widest text-muted-foreground truncate">Открыть профиль</p>
          </div>
        </Link>
      </div>
    </aside>
  );
};
