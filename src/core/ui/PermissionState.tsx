import { ShieldAlert } from 'lucide-react';

export function PermissionState({ message = 'No tienes permisos para ver este módulo.' }: { message?: string }) {
  return <div role="alert" className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center"><ShieldAlert className="mb-3 text-slate-400" size={30} /><p className="text-sm font-semibold text-slate-600">{message}</p></div>;
}
