import { WifiOff } from 'lucide-react';

export function OfflineState({ pending = 0, failed = 0 }: { pending?: number; failed?: number }) {
  return <div role="status" className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-center text-sm font-semibold text-amber-800"><WifiOff className="mx-auto mb-2" size={24} />Sin conexión. {pending > 0 ? `${pending} operación(es) pendiente(s).` : 'Las consultas oficiales requieren conexión.'}{failed > 0 ? ` ${failed} operación(es) fallida(s) requieren revisión.` : ''}</div>;
}
