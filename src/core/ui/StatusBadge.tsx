

type InvoiceStatus = 'pending' | 'paid' | 'partial' | 'cancelled' | 'draft' | 'approved' | 'rejected';
type OrderStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'fulfilled';

type Status = InvoiceStatus | OrderStatus;

interface StatusBadgeProps {
  status: Status;
  label?: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

const statusConfig: Record<Status, { bg: string; text: string; dot: string; defaultLabel: string }> = {
  pending: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    dot: 'bg-orange-500',
    defaultLabel: 'Pendiente',
  },
  paid: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    dot: 'bg-emerald-500',
    defaultLabel: 'Saldado',
  },
  partial: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    dot: 'bg-amber-500',
    defaultLabel: 'Parcial',
  },
  cancelled: {
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    dot: 'bg-slate-400',
    defaultLabel: 'Anulado',
  },
  draft: {
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    dot: 'bg-slate-400',
    defaultLabel: 'Borrador',
  },
  approved: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    dot: 'bg-emerald-500',
    defaultLabel: 'Aprobado',
  },
  rejected: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    dot: 'bg-red-500',
    defaultLabel: 'Rechazado',
  },
  pending_approval: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    dot: 'bg-orange-500',
    defaultLabel: 'Por Aprobar',
  },
  fulfilled: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    dot: 'bg-blue-500',
    defaultLabel: 'Completado',
  },
};

export function StatusBadge({
  status,
  label,
  size = 'md',
  showDot = true,
  className = '',
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = label || config.defaultLabel;

  const sizeClasses = size === 'sm'
    ? 'text-[9px] px-2 py-1 gap-1.5'
    : 'text-[10px] px-2.5 py-1.5 gap-2';

  return (
    <span
      className={`
        inline-flex items-center font-bold uppercase rounded-lg border
        ${config.bg} ${config.text} ${config.bg.replace('bg-', 'border-')}
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
