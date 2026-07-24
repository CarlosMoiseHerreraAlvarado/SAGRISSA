import type { ReactNode } from 'react';

export function BottomSheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return <div role="presentation" className="fixed inset-0 z-50 flex items-end bg-slate-900/60 md:items-center md:justify-center" onClick={onClose}><section role="dialog" aria-modal="true" aria-labelledby="bottom-sheet-title" onClick={event => event.stopPropagation()} className="w-full rounded-t-3xl bg-white p-6 md:max-w-lg md:rounded-3xl"><div className="mb-5 flex items-center justify-between"><h2 id="bottom-sheet-title" className="text-lg font-black text-ink">{title}</h2><button type="button" onClick={onClose} aria-label="Cerrar" className="min-h-11 min-w-11 rounded-xl text-ink-muted">×</button></div>{children}</section></div>;
}
