import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, FileDown, Receipt, CheckCircle, Loader2 } from 'lucide-react';
import { Card } from '../../../core/ui/Card';
import { StatusBadge } from '../../../core/ui/StatusBadge';
import { Skeleton } from '../../../core/ui/Skeleton';
import { useAuth } from '../../../core/hooks/useAuth';

import { getFacturaById, downloadInvoicePdf, type InvoiceDetail } from '../services/factura.service';

export default function FacturaDetailCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    
    getFacturaById(id).then(data => {
      if (mounted) {
        setInvoice(data);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    return () => { mounted = false; };
  }, [id]);

  const handleDownload = async () => {
    if (!id) return;
    setIsDownloading(true);
    await downloadInvoicePdf(id);
    setIsDownloading(false);
  };

  return (
    <div className="w-full min-h-screen flex justify-center bg-white md:bg-transparent pb-20 md:pb-10">
      <div className="w-full h-full xl:max-w-6xl flex flex-col relative md:pt-4 md:px-8">

        {/* Header */}
        <div className="p-6 md:px-0 md:pt-0 md:pb-8 border-b border-slate-100 md:border-none flex items-center justify-between sticky top-0 md:relative bg-white/90 md:bg-transparent backdrop-blur-md md:backdrop-blur-none z-30">
          <div className="flex items-center gap-3">
            <button
              className="p-2 -ml-2 text-brand-blue hover:bg-slate-50 rounded-full transition-all md:hidden"
              onClick={() => navigate('/app/cliente/facturas')}
            >
              <ArrowLeft size={24} />
            </button>
            <span className="text-[13px] md:text-[15px] font-black text-slate-800 uppercase tracking-widest">
              Detalle Documento
            </span>
          </div>
          
          <button 
            disabled={isDownloading || loading}
            onClick={handleDownload}
            className="flex items-center gap-2 bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all disabled:opacity-50"
          >
            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-24 md:pb-10 scrollbar-hide">
          <div className="flex flex-col gap-6">

            {/* Info Header */}
            <Card padding="lg" className="relative overflow-hidden shadow-xl shadow-slate-200/40 border-slate-100">
              <svg className="absolute bottom-[-10px] right-[-10px] w-24 h-24 pointer-events-none opacity-10" viewBox="0 0 100 100" fill="none">
                <path d="M 0 50 Q 50 20 80 80" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" fill="none"/>
              </svg>

              {loading || !invoice ? (
                <div className="space-y-4">
                  <Skeleton width="60%" height={16} />
                  <Skeleton width="40%" height={16} />
                  <Skeleton width="80%" height={16} />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-y-6 mb-6">
                    <div>
                      <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mb-1">Referencia</p>
                      <p className="font-black text-slate-800 text-[14px]">{invoice.number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fecha Contable</p>
                      <p className="font-black text-slate-800 text-[14px]">{invoice.date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Número Pedido</p>
                      <p className="font-black text-brand-blue text-[14px]">{invoice.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={invoice.status} />
                    </div>
                  </div>

                  <div className="pt-5 border-t border-slate-200 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Titular Cuenta</p>
                      <p className="font-black text-slate-800 text-[14px]">{user?.name || invoice.customer.name}</p>
                      <p className="text-[11px] font-medium text-slate-400">ID: {invoice.customer.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Saldo Pendiente</p>
                      <p className="font-black text-red-500 text-lg">${invoice.balance.toLocaleString()}</p>
                    </div>
                  </div>
                </>
              )}
            </Card>

            {/* Items & Credit Notes */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider px-2">
                Líneas Detalle
              </h3>
              <Card padding="none" className="overflow-hidden shadow-lg shadow-slate-200/30">
                {loading || !invoice ? (
                  <div className="p-5 space-y-4">
                    <Skeleton height={60} />
                    <Skeleton height={60} />
                  </div>
                ) : (
                  <>
                    {invoice.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-5 flex flex-col gap-3 border-b border-slate-50"
                      >
                        <p className="font-bold text-slate-700 text-[12px] pr-8">
                          {item.name}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-black text-brand-blue bg-blue-50 px-2 py-1 rounded-md">
                            {item.quantity} UNIDADES
                          </span>
                          <span className="font-black text-sm text-slate-800">
                            ${(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Credit Notes Section */}
                    {invoice.creditNotes && invoice.creditNotes.length > 0 && (
                      <div className="bg-orange-50/50 p-5 border-b border-orange-100">
                        <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Receipt size={14} />
                          Notas de Crédito Aplicadas
                        </p>
                        {invoice.creditNotes.map(nc => (
                          <div key={nc.id} className="flex justify-between items-center mb-2 last:mb-0">
                            <div className="flex flex-col">
                              <span className="text-[11px] font-black text-slate-700">{nc.number}</span>
                              <span className="text-[10px] font-medium text-slate-400">{nc.reason}</span>
                            </div>
                            <span className="font-black text-sm text-orange-600">-${nc.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Facturado</span>
                    <span className="text-xl font-black">${invoice?.total.toLocaleString()}</span>
                  </div>
                  {invoice && (
                    <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <CheckCircle size={20} className="text-emerald-400" />
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Delivery Info */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider px-2 flex items-center gap-2">
                <Calendar size={16} className="text-brand-blue" />
                Planificación Entrega
              </h3>
              <Card className="shadow-sm">
                <div className="flex flex-col gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm h-fit">
                      <MapPin size={16} className="text-brand-blue" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Lugar de Entrega</span>
                      {loading || !invoice ? (
                        <Skeleton width="180px" height={14} className="mt-1" />
                      ) : (
                        <p className="text-[13px] font-bold text-slate-700 leading-tight">
                          {invoice.delivery.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
