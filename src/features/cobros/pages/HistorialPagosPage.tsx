import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, History, Landmark, Wallet, CreditCard, Search, Plus } from 'lucide-react';
import { cobrosService, type PaymentRecord } from '../services/cobros.service';
import { ListCard, ListCardHeader, ListCardFooter } from '../../../core/ui/ListCard';
import { SkeletonListItem } from '../../../core/ui/Skeleton';
import { APP_ROUTES } from '../../../core/routing/routes';

interface HistorialPagosPageProps { readOnly?: boolean; }

export default function HistorialPagosPage({ readOnly = false }: HistorialPagosPageProps) {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cobrosService.getPaymentHistory().then(data => {
      setPayments(data);
      setLoading(false);
    });
  }, []);

  const getIcon = (method: string) => {
    if (method === 'efectivo') return Wallet;
    if (method === 'cheque') return CreditCard;
    return Landmark;
  };

  const filtered = payments.filter(p => 
    p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen flex justify-center bg-white md:bg-transparent pb-20 md:pb-10">
      <div className="w-full h-full xl:max-w-6xl flex flex-col relative md:pt-4 md:px-8">
        
        {/* Header */}
        <div className="p-6 md:p-0 flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 text-slate-400 hover:text-brand-blue transition-colors md:hidden"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Historial de Cobros</h1>
            </div>
            
            {!readOnly && <button onClick={() => navigate(APP_ROUTES.vendedor.nuevoCobro)} className="min-h-11 bg-brand-blue text-white px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-brand-blue/20 hover:scale-105 transition-all"><Plus size={16} /><span>Nuevo Cobro</span></button>}
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-brand-blue/15 transition-all">
            <Search size={18} className="text-slate-300 mr-2" />
            <input 
              type="text" 
              placeholder="Buscar por factura o cliente..." 
              className="w-full text-sm font-medium text-slate-700 bg-transparent outline-none" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 md:px-0 pb-20 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <>
                <SkeletonListItem />
                <SkeletonListItem />
              </>
            ) : filtered.length === 0 ? (
              <div className="col-span-full text-center py-20 flex flex-col items-center opacity-30">
                <History size={48} className="mb-4" />
                <p className="font-black text-xs uppercase tracking-widest">No hay cobros registrados</p>
              </div>
            ) : (
              filtered.map(payment => {
                const Icon = getIcon(payment.paymentMethod);
                return (
                  <ListCard key={payment.id} onClick={() => {}}>
                    <ListCardHeader 
                      title={payment.invoiceNumber}
                      badge={
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border border-emerald-100">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Aplicado
                        </div>
                      }
                    />
                    
                    <div className="mb-6">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cliente</p>
                      <p className="text-[13px] font-black text-slate-800">{payment.customerName}</p>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                          <Icon size={14} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{payment.paymentMethod}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Monto</p>
                        <p className="text-lg font-black text-slate-800">${payment.amount.toLocaleString()}</p>
                      </div>
                    </div>

                    <ListCardFooter 
                      label="Fecha"
                      value={new Date(payment.date).toLocaleDateString()}
                    />
                  </ListCard>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
