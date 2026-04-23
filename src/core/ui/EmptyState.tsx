import { PackageOpen, FileText, Users, Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const defaultIcons = {
  generic: Inbox,
  products: PackageOpen,
  invoices: FileText,
  customers: Users,
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  const Icon = icon || Inbox;

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
        <Icon size={32} className="text-slate-200" />
      </div>
      <h3 className="text-[15px] font-bold text-slate-400 mb-2">{title}</h3>
      {description && (
        <p className="text-[13px] text-slate-300 max-w-[240px]">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-5 py-2.5 bg-brand-blue text-white text-[12px] font-bold rounded-xl 
                     hover:bg-brand-dark transition-colors active:scale-95"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

EmptyState.Icon = defaultIcons;
