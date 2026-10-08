import { ShieldAlert } from 'lucide-react';

export function PermissionState({ message = 'No tienes permisos para ver este módulo.' }: { message?: string }) {
  return <div role="alert" className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-8 text-center"><ShieldAlert className="mb-3 text-slate-400 dark:text-slate-300" size={30} /><p className="text-sm font-semibold text-slate-600 dark:text-slate-200">{message}</p></div>;
}
