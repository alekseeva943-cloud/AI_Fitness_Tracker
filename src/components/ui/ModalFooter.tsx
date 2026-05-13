import React from 'react';
import { cn } from '../../lib/utils';
import { GradientButton } from './GradientButton';
import { Trash2, Edit2, ChevronLeft, X } from 'lucide-react';

interface ModalFooterProps {
  onClose?: () => void;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ 
  onClose, 
  onBack, 
  onEdit, 
  onDelete, 
  primaryAction,
  className
}) => {
  return (
    <div className={cn("flex flex-wrap gap-3 pt-6 border-t border-white/5 mt-auto", className)}>
      <div className="flex gap-2">
        {onBack && (
          <button 
            type="button" 
            onClick={onBack}
            className="p-4 rounded-2xl bg-secondary/50 text-muted-foreground hover:text-primary transition-all group"
            title="Назад"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
        )}
        {onEdit && (
          <button 
            type="button" 
            onClick={onEdit}
            className="p-4 rounded-2xl bg-secondary/50 text-muted-foreground hover:text-primary transition-all"
            title="Редактировать"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        )}
        {onDelete && (
          <button 
            type="button" 
            onClick={onDelete}
            className="p-4 rounded-2xl bg-secondary/50 text-muted-foreground hover:text-red-400 transition-all"
            title="Удалить"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 flex gap-3">
        {primaryAction ? (
          <GradientButton 
            onClick={primaryAction.onClick}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {primaryAction.icon}
            {primaryAction.label}
          </GradientButton>
        ) : (
          onClose && (
            <GradientButton 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Закрыть
            </GradientButton>
          )
        )}
      </div>
    </div>
  );
};
