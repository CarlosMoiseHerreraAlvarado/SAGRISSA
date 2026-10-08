

export type InvoiceStatus = 'pending' | 'paid' | 'partial' | 'cancelled' | 'draft' | 'approved' | 'rejected' | 'overdue' | 'unpaid';
export type OrderStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'fulfilled';

export type Status = InvoiceStatus | OrderStatus;

interface StatusBadgeProps {
  status: Status | string;
  label?: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

const statusConfig: Record<string, { bg: string; text: string; border: string; dot: string; defaultLabel: string }> = {
  unpaid: {
    bg: 'bg-red-50 dark:bg-red-950/60',
    text: 'text-red-600 dark:text-red-300',
    border: 'border-red-100 dark:border-red-900',
    dot: 'bg-red-500',
    defaultLabel: 'No Pagado',
  },
  pending: {
    bg: 'bg-orange-50 dark:bg-orange-950/60',
    text: 'text-orange-600 dark:text-orange-300',
    border: 'border-orange-100 dark:border-orange-900',
    dot: 'bg-orange-500',
    defaultLabel: 'Pendiente',
  },
  paid: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-600 dark:text-emerald-300',
    border: 'border-emerald-100 dark:border-emerald-900',
    dot: 'bg-emerald-500',
    defaultLabel: 'Saldado',
  },
  partial: {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-600 dark:text-amber-300',
    border: 'border-amber-100 dark:border-amber-900',
    dot: 'bg-amber-500',
    defaultLabel: 'Parcial',
  },
  cancelled: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-500 dark:text-slate-300',
    border: 'border-slate-100 dark:border-slate-700',
    dot: 'bg-slate-400',
    defaultLabel: 'Anulado',
  },
  draft: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-500 dark:text-slate-300',
    border: 'border-slate-100 dark:border-slate-700',
    dot: 'bg-slate-400',
    defaultLabel: 'Borrador',
  },
  approved: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-600 dark:text-emerald-300',
    border: 'border-emerald-100 dark:border-emerald-900',
    dot: 'bg-emerald-500',
    defaultLabel: 'Aprobado',
  },
  rejected: {
    bg: 'bg-red-50 dark:bg-red-950/60',
    text: 'text-red-600 dark:text-red-300',
    border: 'border-red-100 dark:border-red-900',
    dot: 'bg-red-500',
    defaultLabel: 'Rechazado',
  },
  pending_approval: {
    bg: 'bg-orange-50 dark:bg-orange-950/60',
    text: 'text-orange-600 dark:text-orange-300',
    border: 'border-orange-100 dark:border-orange-900',
    dot: 'bg-orange-500',
    defaultLabel: 'Por Aprobar',
  },
  fulfilled: {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-600 dark:text-blue-300',
    border: 'border-blue-100 dark:border-blue-900',
    dot: 'bg-blue-500',
    defaultLabel: 'Completado',
  },
  overdue: {
    bg: 'bg-red-50 dark:bg-red-950/60',
    text: 'text-red-600 dark:text-red-300',
    border: 'border-red-100 dark:border-red-900',
    dot: 'bg-red-500',
    defaultLabel: 'Vencido',
  },
};

const defaultFallbackConfig = {
  bg: 'bg-slate-100 dark:bg-slate-800',
  text: 'text-slate-600 dark:text-slate-300',
  border: 'border-slate-100 dark:border-slate-700',
  dot: 'bg-slate-400',
  defaultLabel: 'Estado',
};

export function StatusBadge({
  status,
  label,
  size = 'md',
  showDot = true,
  className = '',
}: StatusBadgeProps) {
  const config = statusConfig[status] || defaultFallbackConfig;
  const displayLabel = label || config.defaultLabel;

  const sizeClasses = size === 'sm'
    ? 'text-[9px] px-2 py-1 gap-1.5'
    : 'text-[10px] px-2.5 py-1.5 gap-2';

  return (
    <span
      className={`
        inline-flex items-center font-bold uppercase rounded-lg border
        ${config.bg} ${config.text} ${config.border}
        ${sizeClasses}
        ${className}
      `}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      )}
      {displayLabel}
    </span>
  );
}
