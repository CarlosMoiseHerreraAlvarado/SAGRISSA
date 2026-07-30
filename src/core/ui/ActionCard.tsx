import type { LucideIcon } from 'lucide-react';

interface ActionCardProps {
  label: string;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'orange' | 'purple' | 'slate';
  onClick: () => void;
  badge?: string;
  className?: string;
}

const colorConfig = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-100',
    iconHover: 'group-hover:bg-brand-blue group-hover:text-white',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
    iconHover: 'group-hover:bg-emerald-500 group-hover:text-white',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-100',
    iconHover: 'group-hover:bg-orange-500 group-hover:text-white',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-100',
    iconHover: 'group-hover:bg-purple-500 group-hover:text-white',
  },
  slate: {
    bg: 'bg-slate-50',
    text: 'text-slate-500',
    border: 'border-slate-100',
    iconHover: 'group-hover:bg-slate-500 group-hover:text-white',
  },
};

export function ActionCard({
  label,
  icon: Icon,
  color = 'blue',
  onClick,
  badge,
  className = '',
}: ActionCardProps) {
  const config = colorConfig[color];

  return (
    <button
      onClick={onClick}
      className={`
        min-h-28 bg-white border border-slate-100 p-4 rounded-3xl shadow-sm
        flex flex-col gap-3 hover:border-brand-blue/30 hover:scale-[1.03] hover:shadow-xl hover:shadow-brand-blue/5 transition-all duration-300
        text-left w-full active:scale-[0.98] group relative overflow-hidden
        ${className}
      `}
    >
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${config.bg} ${config.text} ${config.border} ${config.iconHover} transition-all`}>
        <Icon size={20} />
      </div>
      <span className="text-[12px] font-bold text-slate-700 leading-tight">
        {label}
      </span>
      {badge && (
        <span className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-1 rounded-lg ${config.bg} ${config.text}`}>
          {badge}
        </span>
      )}
    </button>
  );
}
