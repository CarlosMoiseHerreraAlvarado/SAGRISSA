import { useState } from 'react';
import { Search, Filter, Receipt, FileText, Download } from 'lucide-react';
import { Card } from '../../../core/ui/Card';

export default function FacturasPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const mockInvoices = [
    { id: 'F001', client: 'Distribuidora Central', date: '2026-04-20', amount: 1540.50, status: 'Pagada' },
    { id: 'F002', client: 'Agrícola San José', date: '2026-04-22', amount: 890.00, status: 'Pendiente' },
    { id: 'F003', client: 'Ferretería El Sol', date: '2026-04-25', amount: 2350.75, status: 'Vencida' },
  ];

  return (
    <div className="w-full h-full xl:max-w-7xl mx-auto flex flex-col relative md:pt-6 md:px-8 pb-20 md:pb-10">
      <div className="flex justify-between items-end mb-8 px-6 md:px-0">
        <div>
          <h2 className="font-black text-2xl text-slate-800 tracking-tight">Gestión de Facturas</h2>
          <p className="text-sm font-bold text-slate-400 mt-1">Consulta y seguimiento de facturación</p>
        </div>
        <button className="hidden md:flex bg-white px-5 py-3 rounded-2xl border border-slate-100 hover:border-brand-blue/40 text-[13px] font-black text-slate-700 tracking-wide items-center gap-2 transition-all shadow-sm">
          <Download size={18} className="text-brand-blue" />
          Exportar Excel
        </button>
      </div>

      <div className="px-6 md:px-0 space-y-6">
        <div className="flex gap-3">
          <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all">
            <Search size={18} className="text-slate-300" />
            <input 
              type="text" 
              placeholder="Buscar por cliente o número de factura..." 
              className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-white p-4 rounded-2xl border border-slate-200 text-slate-400 hover:text-brand-blue hover:border-brand-blue/40 shadow-sm transition-all">
            <Filter size={20} />
          </button>
        </div>

        <Card padding="none" className="overflow-hidden shadow-xl shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Factura</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Monto ($)</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {mockInvoices.map(inv => (
                  <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-blue/5 flex items-center justify-center text-brand-blue">
                          <Receipt size={16} />
                        </div>
                        <span className="font-black text-slate-800">{inv.id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-sm text-slate-600">{inv.client}</td>
                    <td className="py-4 px-6 font-bold text-sm text-slate-400">{inv.date}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        inv.status === 'Pagada' ? 'bg-emerald-50 text-emerald-600' :
                        inv.status === 'Pendiente' ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-black text-slate-800 text-right">${inv.amount.toLocaleString()}</td>
                    <td className="py-4 px-6 text-center">
                      <button className="p-2 text-slate-300 hover:text-brand-blue transition-colors">
                        <FileText size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
