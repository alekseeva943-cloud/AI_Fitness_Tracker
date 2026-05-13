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
  placeholder?: string;
}

export const FitnessSelect: React.FC<FitnessSelectProps> = ({
  options,
  value,
  onChange,
  label,
  className,
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
          "w-full bg-secondary/40 border border-white/5 rounded-2xl px-5 py-4 flex items-center justify-between text-base font-medium transition-all group hover:bg-secondary/60 hover:border-white/10 outline-none focus:border-primary/50",
          isOpen && "border-primary/50 bg-secondary/60"
        )}
      >
        <div className="flex items-center gap-3">
          {selectedOption?.icon && (
            <span className="text-xl leading-none">{selectedOption.icon}</span>
          )}
          <span className={cn(
            !selectedOption && "text-muted-foreground/30 font-normal"
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground transition-transform duration-300",
          isOpen && "rotate-180 text-primary"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 left-0 right-0 top-full bg-secondary/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden py-2"
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-5 py-3 flex items-center justify-between text-sm font-medium transition-colors hover:bg-primary/10 group",
                    value === option.value ? "bg-primary/20 text-primary" : "text-muted-foreground/80 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {option.icon && <span>{option.icon}</span>}
                    {option.label}
                  </div>
                  {value === option.value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
