import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';
import { Tabs } from '../../../core/ui/Tabs';
import { SearchInput } from '../../../core/ui/SearchInput';
import { ListCard, ListCardHeader, ListCardFooter } from '../../../core/ui/ListCard';
import { StatusBadge } from '../../../core/ui/StatusBadge';
import { EmptyState } from '../../../core/ui/EmptyState';
import { SkeletonListItem } from '../../../core/ui/Skeleton';
import { facturaService, type InvoiceSummary } from '../services/factura.service';
import { reportsService } from '../../dashboards/services/reports.service';

export default function FacturasCliente() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);

  useEffect(() => {
    let isMounted = true;
    facturaService.getInvoices()
      .then(data => {
        if (isMounted) {
          setInvoices(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.warn('Error al cargar facturas:', err);
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'pending' 
      ? (inv.status === 'pending' || inv.status === 'overdue') 
      : inv.status === 'paid';
    return matchesSearch && matchesTab;
  });

  const handleExport = async () => {
    await reportsService.downloadReport({
      id: 'inv-export',
      title: 'Listado_Facturas_Cliente',
      type: 'XLSX',
      size: '15KB',
      date: new Date().toLocaleDateString()
    });
  };

  const tabs = [
    { id: 'pending', label: 'Saldos Pendientes', count: invoices.filter(i => i.status !== 'paid').length },
    { id: 'history', label: 'Facturado Histórico', count: invoices.filter(i => i.status === 'paid').length },
  ];

  return (
    <div className="w-full min-h-screen flex justify-center bg-white md:bg-transparent pb-20 md:pb-0">
      <div className="w-full h-full xl:max-w-6xl flex flex-col relative md:pt-4 md:px-8">

        {/* Header */}
        <div className="md:bg-transparent bg-white border-b border-slate-100 md:border-none p-6 flex flex-col gap-5 sticky top-0 z-30 md:relative md:p-0 md:mb-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Volver"
              className="-ml-2 min-h-11 min-w-11 rounded-xl p-2 text-slate-400 transition-colors hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue md:hidden"
              onClick={() => navigate('/app/cliente/cartera')}
            >
              <ArrowLeft size={24} aria-hidden="true" />
            </button>
            <div className="flex-1">
               <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Facturas</h1>
            </div>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
            >
               <FileSpreadsheet size={16} />
               <span className="hidden md:inline">Exportar Excel</span>
            </button>
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
