import { AlertTriangle } from 'lucide-react';

export function ErrorState({ message = 'No fue posible cargar la información.', onRetry }: { message?: string; onRetry?: () => void }) {
  return <div role="alert" className="flex flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50 p-8 text-center"><AlertTriangle className="mb-3 text-red-500" size={28} /><p className="max-w-sm text-sm font-semibold text-red-700">{message}</p>{onRetry && <button type="button" onClick={onRetry} className="mt-4 min-h-11 rounded-xl bg-red-600 px-5 text-xs font-black uppercase tracking-widest text-white">Reintentar</button>}</div>;
}
