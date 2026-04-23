import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { StatCard } from '../../../core/ui/StatCard';
import { AgingCard } from '../../../core/ui/AgingCard';
import { Skeleton } from '../../../core/ui/Skeleton';
import { useAuth } from '../../../core/hooks/useAuth';

const AGING_DATA = [
  { range: '0 a 30 días', amount: 350000 },
  { range: '31 a 60 días', amount: 130000 },
  { range: '61 a 90 días', amount: 80000 },
  { range: '91 a 120 días', amount: 20000 },
  { range: 'Más de 120 días', amount: 0.01 },
];

export default function AccountCliente() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full min-h-screen flex justify-center bg-white md:bg-transparent pb-20 md:pb-0">
      <div className="w-full h-full xl:max-w-6xl flex flex-col relative md:pt-4 md:px-8">

        {/* Header */}
        <div className="md:bg-transparent bg-white border-b border-slate-100 md:border-none p-6 md:px-0 md:pt-0 md:pb-8 flex flex-col gap-6 relative overflow-hidden">
          <svg className="absolute top-0 right-10 w-24 h-32 pointer-events-none opacity-20" viewBox="0 0 100 100" fill="none">
            <path d="M 0 0 Q 10 60 70 40 Q 90 30 100 40" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" fill="none"/>
          </svg>

          <div className="flex items-center gap-3 z-10">
            <button
              className="p-2 -ml-2 text-slate-400 hover:text-brand-blue transition-colors md:hidden"
              onClick={() => navigate('/app/cliente/home')}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Mi Cuenta</h1>
          </div>

          <div className="flex justify-between items-center z-10">
            <div>
              <h3 className="font-bold text-slate-800">{user?.name || 'Cliente SAGRISA'}</h3>
              <p className="text-[11px] font-bold text-brand-blue uppercase tracking-widest mt-1">
                {user?.dui || 'N/A'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Total Adeudado
              </p>
              {loading ? (
                <Skeleton width={120} height={28} />
              ) : (
                <p className="text-2xl font-black text-brand-blue tracking-tighter">$580,000.00</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-24 scrollbar-hide">
          <div className="flex flex-col gap-6">

            {/* Antigüedad de Saldo & Extras */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
              <div className="flex flex-col gap-6">
                <AgingCard items={AGING_DATA} loading={loading} />

                {/* Info Grid */}
                <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { label: 'Días Pago', value: '24 días' },
                      { label: 'Término Crédito', value: '30 días' },
                      { label: 'Último Pago', value: '$2,971.02' },
                      { label: 'Fecha Últ. Pago', value: '16/05/2022' },
                      { label: 'Línea Crédito', value: '$1,000,000' },
                      { label: 'Crédito Disponible', value: '$420,000' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-1 items-start justify-center">
                        <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                          {item.label}
                        </span>
                        {loading ? (
                          <Skeleton width={80} height={14} />
                        ) : (
                          <span className="text-[14px] font-black text-slate-800">{item.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard title="Facturas Pendientes" value="3" variant="default" />
                  <StatCard title="Pedidos Abiertos" value="2" variant="default" />
                </div>
                {/* Boton Ver Documentos */}
                <button
                  className="w-full bg-brand-blue text-white font-black py-4 rounded-2xl shadow-lg hover:bg-brand-dark transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-auto"
                  onClick={() => navigate('/app/cliente/facturas')}
                >
                  <FileText size={20} />
                  VER DETALLE
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
