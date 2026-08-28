import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  default: {
    container: 'bg-white dark:bg-slate-900 border-surface-border dark:border-slate-800 text-slate-800 dark:text-white',
    iconBg: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300',
    value: 'text-slate-800 dark:text-white',
    subtitle: 'text-slate-400 dark:text-slate-400',
  },
  primary: {
    container: 'bg-brand-blue text-white border-transparent',
    iconBg: 'bg-white/10 text-white',
    value: 'text-white',
    subtitle: 'text-white/70',
  },
  success: {
    container: 'bg-emerald-600 text-white border-transparent',
    iconBg: 'bg-white/10 text-white',
    value: 'text-white',
    subtitle: 'text-white/70',
  },
  warning: {
    container: 'bg-amber-500 text-white border-transparent',
    iconBg: 'bg-white/10 text-white',
    value: 'text-white',
    subtitle: 'text-white/70',
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className = '',
  onClick,
}: StatCardProps) {
  const styles = variantStyles[variant];
  const isColored = variant !== 'default';

  return (
    <div
      onClick={onClick}
      onKeyDown={event => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`
        relative overflow-hidden rounded-3xl border p-5 shadow-card dark:shadow-card-dark transition-all duration-300 sm:p-6
        ${onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:border-brand-blue/30 dark:hover:border-brand-blue/50' : ''}
        ${styles.container}
        ${className}
      `}
    >
      {!isColored && (
        <div className="absolute top-0 right-0 w-20 h-20 border border-slate-100 dark:border-slate-800 rounded-full -translate-y-1/2 translate-x-1/2 opacity-30" />
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isColored ? 'text-white/70' : 'text-slate-400 dark:text-slate-400'}`}>
              {title}
            </p>
            <p className={`break-words text-[clamp(1.5rem,5vw,1.75rem)] font-black leading-none tracking-tight ${styles.value}`}>
              {value}
            </p>
          </div>
          {Icon && (
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles.iconBg}`}>
              <Icon size={20} strokeWidth={2} />
            </div>
          )}
        </div>

        {subtitle && (
          <p className={`text-[11px] font-medium ${styles.subtitle} ${isColored ? 'italic' : ''}`}>
            {subtitle}
          </p>
        )}

        {trend && (
          <div className={`flex items-center gap-1.5 mt-3 pt-3 border-t ${isColored ? 'border-white/10' : 'border-slate-100 dark:border-slate-800'}`}>
            {trend.value >= 0 ? (
              <TrendingUp size={14} className={isColored ? 'text-white/80' : 'text-emerald-500'} />
            ) : (
              <TrendingDown size={14} className={isColored ? 'text-white/80' : 'text-red-500'} />
            )}
            <span className={`text-[11px] font-bold ${isColored ? 'text-white/80' : trend.value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </span>
            {trend.label && (
              <span className={`text-[11px] ${isColored ? 'text-white/50' : 'text-slate-400'}`}>
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
