interface ConfirmDialogProps { open: boolean; title: string; description?: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void; }

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirmar', onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;
  return <div role="presentation" className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-4 md:items-center"><section role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><h2 id="confirm-dialog-title" className="text-lg font-black text-ink">{title}</h2>{description && <p className="mt-2 text-sm text-ink-muted">{description}</p>}<div className="mt-6 flex gap-3"><button type="button" onClick={onCancel} className="min-h-12 flex-1 rounded-2xl border border-surface-border text-sm font-black text-ink-muted">Cancelar</button><button type="button" onClick={onConfirm} className="min-h-12 flex-1 rounded-2xl bg-brand-blue text-sm font-black text-white">{confirmLabel}</button></div></section></div>;
}
