import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, FileText, Package, ClipboardList } from 'lucide-react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { StatCard } from '../../../core/ui/StatCard';
import { AgingCard } from '../../../core/ui/AgingCard';
import { ActionCard } from '../../../core/ui/ActionCard';
import { ListCard, ListCardHeader, ListCardFooter } from '../../../core/ui/ListCard';
import { StatusBadge } from '../../../core/ui/StatusBadge';
import { Skeleton } from '../../../core/ui/Skeleton';
import { useAuth } from '../../../core/hooks/useAuth';

const AGING_DATA = [
  { range: '0 a 30 días', amount: 350000 },
  { range: '31 a 60 días', amount: 130000 },
  { range: '61 a 90 días', amount: 80000 },
  { range: 'Más de 90 días', amount: 20000 },
];

const RECENT_INVOICES = [
  {
    id: '1',
    number: 'FAC-99201-1',
    date: '30 Abr, 2022',
    amount: 580000,
    status: 'pending' as const,
  },
  {
    id: '2',
    number: 'FAC-99201-2',
    date: '15 Mar, 2022',
    amount: 245000,
    status: 'paid' as const,
  },
];

export default function HomeCliente() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <MobilePage>
      {/* Decorative Pattern */}
      <svg className="absolute top-0 right-10 w-24 h-32 pointer-events-none opacity-40" viewBox="0 0 100 100" fill="none">
        <path d="M 0 0 Q 10 60 70 40 Q 90 30 100 40" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" fill="none"/>
      </svg>

      {/* Header (Oculto en Desktop ya que el Sidebar tiene el perfil) */}
      <header className="px-6 pt-16 pb-6 z-10 md:hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue flex items-center justify-center shadow-md">
            <span className="text-white font-black text-xl">
              {user?.name?.charAt(0) ?? 'C'}
            </span>
          </div>
          <div>
            {loading ? (
              <div className="flex flex-col gap-1.5">
                <Skeleton width={120} height={16} />
                <Skeleton width={80} height={12} />
              </div>
            ) : (
              <>
                <p className="text-[14px] font-black text-slate-800 leading-tight">
                  Hola, {user?.name?.split(' ')[0]}
                </p>
                <p className="text-[11px] text-brand-blue font-bold uppercase tracking-wider">
                  Cliente
                </p>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 md:px-0 pb-24 z-10 scrollbar-hide">
        <div className="flex flex-col gap-8 md:gap-10">

          {/* Saldo Principal */}
          {loading ? (
            <Skeleton height={180} className="rounded-3xl" />
          ) : (
            <StatCard
              title="Saldo Total Adeudado"
              value="$580,000.00"
              subtitle="Actualizado: hoy, 10:50 AM"
              variant="primary"
              className="relative overflow-hidden"
            />
          )}

          {/* Metricas rapidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Disponible"
              value="$420,000"
              variant="default"
              className="text-center"
            />
            <StatCard
              title="Días Crédito"
              value="30 d"
              variant="default"
              className="text-center"
            />
            <StatCard
              title="Último Pago"
              value="$2,971.02"
              variant="default"
              className="text-center md:hidden lg:flex flex-col"
            />
            <StatCard
              title="Término"
              value="Crédito 30d"
              variant="default"
              className="text-center md:hidden lg:flex flex-col"
            />
          </div>

          {/* Antigüedad de Saldo & Activity Side By Side on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
             <div className="flex flex-col gap-6">
                {/* Antigüedad de Saldo */}
                <AgingCard items={AGING_DATA} loading={loading} />

                {/* Accesos Directos */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider px-1">
                    Accesos Rápidos
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:grid-cols-2 xl:grid-cols-4">
                    <ActionCard
                      label="Estado de Cuenta"
                      icon={DollarSign}
                      color="emerald"
                      onClick={() => navigate('/app/cliente/cartera')}
                    />
                    <ActionCard
                      label="Ver Facturas"
                      icon={FileText}
                      color="blue"
                      onClick={() => navigate('/app/cliente/facturas')}
                    />
                    <ActionCard
                      label="Catálogo"
                      icon={Package}
                      color="orange"
                      onClick={() => navigate('/app/cliente/catalogo')}
                    />
                    <ActionCard
                      label="Mis Pedidos"
                      icon={ClipboardList}
                      color="purple"
                      onClick={() => navigate('/app/cliente/pedidos')}
                    />
                  </div>
                </div>
             </div>

             {/* Ultimas facturas (Alineadas a la derecha en Desktop) */}
             <div className="flex flex-col gap-3">
               <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider px-1">
                 Actividad Reciente
               </h3>
               <div className="flex flex-col gap-4">
                 {loading ? (
                   <>
                     <Skeleton height={120} className="rounded-3xl" />
                     <Skeleton height={120} className="rounded-3xl" />
                   </>
                 ) : (
                   RECENT_INVOICES.map((invoice) => (
                     <ListCard
                       key={invoice.id}
                       onClick={() => navigate(`/app/cliente/facturas/${invoice.id}`)}
                     >
                       <ListCardHeader
                         title={invoice.number}
                         badge={<StatusBadge status={invoice.status} size="sm" />}
                       />
                       <div className="grid grid-cols-2 gap-4 mb-4">
                         <div>
                           <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fecha</span>
                           <span className="text-[13px] font-bold text-slate-700">{invoice.date}</span>
                         </div>
                         <div className="text-right">
                           <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total</span>
                           <span className="text-[13px] font-bold text-slate-700">
                             ${invoice.amount.toLocaleString()}
                           </span>
                         </div>
                       </div>
                       <ListCardFooter
                         label="Saldo"
                         value={invoice.status === 'paid' ? '$0.00' : `$${invoice.amount.toLocaleString()}`}
                         variant={invoice.status === 'paid' ? 'default' : 'highlight'}
                       />
                     </ListCard>
                   ))
                 )}
               </div>
             </div>
          </div>

        </div>
      </div>

      {/* Decorative Bottom */}
      <svg className="absolute bottom-[20%] right-6 w-2 h-40 pointer-events-none opacity-20" viewBox="0 0 10 100" fill="none">
        <line x1="5" y1="0" x2="5" y2="100" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" />
      </svg>
    </MobilePage>
  );
}
