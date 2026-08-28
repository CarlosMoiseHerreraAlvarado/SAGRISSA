import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

interface ListCardProps {
  children: ReactNode;
  onClick?: () => void;
  status?: ReactNode;
  className?: string;
}

export function ListCard({ children, onClick, status, className = '' }: ListCardProps) {
  const isClickable = !!onClick;

  return (
    <div
      className={`
        min-w-0 rounded-[32px] border border-surface-border dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm dark:shadow-card-dark
        transition-all duration-300
        ${isClickable ? 'cursor-pointer hover:border-brand-blue/30 dark:hover:border-brand-blue/50 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2' : ''}
        ${className}
      `}
      onClick={onClick}
      onKeyDown={event => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
      {status && (
        <div className="mt-4 pt-4 border-t border-surface-border dark:border-slate-800 flex justify-end">
          {status}
        </div>
      )}
    </div>
  );
}

interface ListCardHeaderProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export function ListCardHeader({ title, subtitle, badge, icon: Icon, className = '' }: ListCardHeaderProps) {
  return (
    <div className={`mb-4 flex min-w-0 items-start justify-between gap-3 ${className}`}>
      <div className="flex min-w-0 flex-col">
        {Icon && (
          <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-1">
            {title}
          </span>
        )}
        <span className="break-words text-[15px] font-black text-slate-800 dark:text-white">{title}</span>
        {subtitle && (
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400 mt-0.5">{subtitle}</span>
        )}
      </div>
      <span className="shrink-0">{badge}</span>
    </div>
  );
}

interface ListCardRowProps {
  label: string;
  value: string | ReactNode;
  valueClassName?: string;
  className?: string;
}

export function ListCardRow({ label, value, valueClassName = '', className = '' }: ListCardRowProps) {
  return (
    <div className={`flex min-w-0 items-center justify-between gap-3 ${className}`}>
      <span className="text-[12px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">{label}</span>
      <span className={`break-words text-right text-[13px] font-black text-slate-800 dark:text-white ${valueClassName}`}>{value}</span>
    </div>
  );
}

interface ListCardFooterProps {
  label: string;
  value: string;
  variant?: 'default' | 'highlight';
  className?: string;
}

export function ListCardFooter({ label, value, variant = 'default', className = '' }: ListCardFooterProps) {
  return (
    <div
      className={`
        flex min-w-0 items-center justify-between gap-3 rounded-2xl border p-3
        ${variant === 'highlight'
          ? 'bg-brand-blue/5 dark:bg-brand-blue/15 border-brand-blue/20 dark:border-brand-blue/30'
          : 'bg-slate-50 dark:bg-slate-800/60 border-surface-border dark:border-slate-800'
        }
        ${className}
      `}
    >
      <span className="text-[12px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{label}</span>
      <span className={`break-words text-right text-[14px] font-black ${variant === 'highlight' ? 'text-brand-blue' : 'text-slate-800 dark:text-white'}`}>
        {value}
      </span>
    </div>
  );
}

interface ListCardItemProps {
  children: ReactNode;
  onClick?: () => void;
  showArrow?: boolean;
  className?: string;
}

export function ListCardItem({ children, onClick, showArrow = true, className = '' }: ListCardItemProps) {
  return (
    <div
      className={`
        p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-surface-border dark:border-slate-800 
        hover:bg-slate-100/50 dark:hover:bg-slate-800 transition-all cursor-pointer
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        {children}
        {showArrow && onClick && (
          <ChevronRight size={16} className="text-slate-300 dark:text-slate-500" />
        )}
      </div>
    </div>
  );
}
