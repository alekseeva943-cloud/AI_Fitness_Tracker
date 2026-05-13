import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FitnessSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface FitnessSelectProps {
  options: FitnessSelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  selectClassName?: string;
  placeholder?: string;
}

export const FitnessSelect: React.FC<FitnessSelectProps> = ({
  options,
  value,
  onChange,
  label,
  className,
  selectClassName,
  placeholder = 'Выберите...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("space-y-2 relative", className)} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-secondary/40 border border-white/5 rounded-2xl px-6 py-4 flex items-center justify-between text-lg font-medium transition-all group hover:bg-secondary/60 hover:border-white/10 outline-none focus:border-primary/50 shadow-inner",
          isOpen && "border-primary/50 bg-secondary/60 shadow-[0_0_20px_rgba(223,255,0,0.1)]",
          selectClassName
        )}
      >
        <div className="flex items-center gap-4">
          {selectedOption?.icon && (
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-2xl shadow-sm border border-white/5 group-hover:scale-110 transition-transform">
              {selectedOption.icon}
            </div>
          )}
          <span className={cn(
            "tracking-tight",
            !selectedOption && "text-muted-foreground/30 font-normal"
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={cn(
          "w-5 h-5 text-muted-foreground transition-transform duration-500 ease-out",
          isOpen && "rotate-180 text-primary"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute z-50 left-0 right-0 top-full bg-secondary/95 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl overflow-hidden py-3 mt-2"
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-3.5 rounded-2xl flex items-center justify-between text-sm font-semibold transition-all hover:pl-6 group",
                    value === option.value 
                      ? "bg-primary text-black shadow-[0_0_20px_rgba(223,255,0,0.2)]" 
                      : "text-muted-foreground/80 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {option.icon && (
                      <span className={cn(
                        "text-xl transition-transform group-hover:scale-125",
                        value === option.value ? "opacity-100" : "opacity-60"
                      )}>
                        {option.icon}
                      </span>
                    )}
                    {option.label}
                  </div>
                  {value === option.value && <Check className="w-4 h-4 stroke-[3]" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
