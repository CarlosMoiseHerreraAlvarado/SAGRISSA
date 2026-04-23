import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Tabs } from '../../../core/ui/Tabs';
import { SearchInput } from '../../../core/ui/SearchInput';
import { ListCard, ListCardHeader, ListCardFooter } from '../../../core/ui/ListCard';
import { StatusBadge } from '../../../core/ui/StatusBadge';
import { EmptyState } from '../../../core/ui/EmptyState';
import { SkeletonListItem } from '../../../core/ui/Skeleton';

const MOCK_INVOICES = [
  { id: '1', number: 'FAC-99201-1', date: '30 Abr, 2022', total: 580000, balance: 580000, status: 'pending' as const },
  { id: '2', number: 'FAC-99201-2', date: '15 Mar, 2022', total: 245000, balance: 0, status: 'paid' as const },
  { id: '3', number: 'FAC-99201-3', date: '28 Feb, 2022', total: 125000, balance: 0, status: 'paid' as const },
  { id: '4', number: 'FAC-99201-4', date: '10 Ene, 2022', total: 89000, balance: 0, status: 'paid' as const },
];

export default function FacturasCliente() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredInvoices = MOCK_INVOICES.filter(inv => {
    const matchesSearch = inv.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'pending' ? inv.status === 'pending' : inv.status === 'paid';
    return matchesSearch && matchesTab;
  });

  const tabs = [
    { id: 'pending', label: 'Saldos Pendientes', count: MOCK_INVOICES.filter(i => i.status === 'pending').length },
    { id: 'history', label: 'Facturado Histórico', count: MOCK_INVOICES.filter(i => i.status === 'paid').length },
  ];

  return (
    <div className="w-full min-h-screen flex justify-center bg-white md:bg-transparent pb-20 md:pb-0">
      <div className="w-full h-full xl:max-w-6xl flex flex-col relative md:pt-4 md:px-8">

        {/* Header */}
        <div className="md:bg-transparent bg-white border-b border-slate-100 md:border-none p-6 flex flex-col gap-5 sticky top-0 z-30 md:relative md:p-0 md:mb-8">
          <div className="flex items-center gap-3">
            <button
              className="p-2 -ml-2 text-slate-400 hover:text-brand-blue transition-colors md:hidden"
              onClick={() => navigate('/app/cliente/cuenta')}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Facturas</h1>
          </div>

          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por Folio..."
          />
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Invoice List */}
        <div className="flex-1 overflow-y-auto p-6 pb-24 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <>
                <SkeletonListItem />
                <SkeletonListItem />
                <SkeletonListItem />
              </>
            ) : filteredInvoices.length === 0 ? (
              <EmptyState
                icon={EmptyState.Icon.products}
                title="Sin facturas"
                description={activeTab === 'pending'
                  ? 'No tienes facturas pendientes'
                  : 'No hay historial de facturas'}
              />
            ) : (
              filteredInvoices.map((invoice) => (
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
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Emisión</span>
                      <span className="text-[13px] font-bold text-slate-700">{invoice.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Gravado</span>
                      <span className="text-[13px] font-bold text-slate-700">
                        ${invoice.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <ListCardFooter
                    label="Saldo Actual"
                    value={invoice.status === 'paid' ? '$0.00' : `$${invoice.balance.toLocaleString()}`}
                    variant={invoice.status === 'paid' ? 'default' : 'highlight'}
                  />
                </ListCard>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
