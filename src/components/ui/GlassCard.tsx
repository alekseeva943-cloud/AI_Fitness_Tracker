import React from "react";
import { cn } from "../../lib/utils";
import { motion } from "motion/react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className,
  animate = true,
  ...props
}) => {
  const Component = animate ? motion.div : 'div';
  
  return (
    <Component
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={animate && props.onClick ? { 
        y: -4, 
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        transition: { duration: 0.3 } 
      } : undefined}
      className={cn(
        "glass dashboard-card overflow-hidden",
        props.onClick && "cursor-pointer active:scale-[0.99] transition-transform",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
