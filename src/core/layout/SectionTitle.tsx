import type { LucideIcon } from 'lucide-react';

interface SectionTitleProps {
  title: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function SectionTitle({ title, icon: Icon, action, className = '' }: SectionTitleProps) {
  return (
    <div className={`flex items-center justify-between px-1 ${className}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-brand-blue" />}
        <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-[11px] font-bold text-brand-blue hover:text-brand-dark transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
