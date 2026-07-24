import type { ReactNode } from 'react';

export function DataTableResponsive({ headers, rows, empty }: { headers: string[]; rows: ReactNode[][]; empty?: ReactNode }) {
  if (rows.length === 0) return <>{empty ?? <div className="p-8 text-center text-sm font-semibold text-ink-muted">Sin registros.</div>}</>;
  return <div className="overflow-x-auto rounded-3xl border border-surface-border bg-white"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-surface-soft text-xs font-black uppercase tracking-widest text-ink-muted"><tr>{headers.map(header => <th key={header} className="px-5 py-4">{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index} className="border-t border-surface-border">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-5 py-4">{cell}</td>)}</tr>)}</tbody></table></div>;
}
