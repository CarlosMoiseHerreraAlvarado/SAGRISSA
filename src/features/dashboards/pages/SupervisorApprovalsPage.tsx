import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Calendar, FileText } from 'lucide-react';


import { MobilePage } from '../../../core/layout/MobilePage';
import { Skeleton } from '../../../core/ui/Skeleton';

interface ApprovalRequest {
  id: string;
  customer: string;
  amount: number;
  reason: string;
  date: string;
  details: string;
  type: 'credit_limit' | 'order_approval';
}

export default function SupervisorApprovalsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);

  useEffect(() => {
    // Simulación de carga de datos desde APIM
    const timer = setTimeout(() => {
      setRequests([
        { 
          id: '2', 
          customer: 'Ferretería Central', 
          amount: 8400, 
          reason: 'Margen de Utilidad Bajo', 
          date: '2026-04-21',
          details: 'Pedido con descuento especial del 15% aplicado por el vendedor que reduce el margen operativo por debajo del límite permitido (12%). Se requiere revisión para aprobar descuento agresivo.',
          type: 'order_approval'
        },
        { 
          id: '3', 
          customer: 'Agropecuaria El Sol', 
          amount: 2200, 
          reason: 'Excepción de Inventario', 
          date: '2026-04-22',
          details: 'Aprobación de reserva de producto de alta rotación (Urea 46%) que excede la cuota mensual permitida para este cliente.',
          type: 'order_approval'
        },
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (id: string, _action: 'approve' | 'reject') => {

    // Aquí iría la llamada a la API (ASP.NET Core)
    setRequests(prev => prev.filter(r => r.id !== id));
    setSelectedRequest(null);
    // Mostrar feedback visual...
  };

  return (
    <MobilePage>
      {/* Pattern Background strictly following brand guidelines */}
      <svg className="absolute top-0 right-10 w-24 h-32 pointer-events-none opacity-40 z-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0 0 Q 10 60 70 40 Q 90 30 100 40" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" fill="none"/>
      </svg>

      <header className="px-6 md:px-0 pt-16 md:pt-0 pb-6 flex items-center gap-4 z-10 relative">

        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-brand-blue transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Aprobaciones Operativas</h1>
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Supervisor de Ventas</p>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-6 md:px-0 z-10 relative pb-24">
        {loading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-[32px]" />)
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4 text-emerald-500">
              <CheckCircle2 size={40} />
            </div>
            <p className="font-bold text-slate-400">No hay aprobaciones pendientes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <div 
                key={req.id} 
                onClick={() => setSelectedRequest(req)}
                className={`bg-white border p-6 rounded-[32px] shadow-sm transition-all cursor-pointer group ${selectedRequest?.id === req.id ? 'border-brand-blue ring-4 ring-brand-blue/10' : 'border-slate-100 hover:border-brand-blue/30'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-colors">
                    {req.type === 'credit_limit' ? <AlertCircle size={24} /> : <FileText size={24} />}
                  </div>
                  <span className="text-[14px] font-black text-slate-800">${req.amount.toLocaleString()}</span>
                </div>
                
                <h3 className="font-black text-[15px] text-slate-800 mb-1">{req.customer}</h3>
                <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-4">{req.reason}</p>
                
                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {req.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Panel / Modal (Simplified for PWA) */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Detalles de Solicitud</span>
                  <h2 className="text-xl font-black text-slate-800">{selectedRequest.customer}</h2>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="p-2 text-slate-300 hover:text-slate-600">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-6 mb-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Monto</p>
                    <p className="text-lg font-black text-slate-800">${selectedRequest.amount.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Fecha</p>
                    <p className="text-lg font-black text-slate-800">{selectedRequest.date}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Justificación Técnica</p>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    {selectedRequest.details}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => handleAction(selectedRequest.id, 'reject')}
                  className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  Rechazar
                </button>
                <button 
                  onClick={() => handleAction(selectedRequest.id, 'approve')}
                  className="flex-2 bg-brand-blue text-white py-4 px-8 rounded-2xl font-black text-[13px] uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:bg-brand-dark transition-all active:scale-95"
                >
                  Aprobar Ahora
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <svg className="absolute bottom-[10%] left-6 w-2 h-40 pointer-events-none opacity-20" viewBox="0 0 10 100" fill="none">
        <line x1="5" y1="0" x2="5" y2="100" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" />
      </svg>
    </MobilePage>
  );
}
