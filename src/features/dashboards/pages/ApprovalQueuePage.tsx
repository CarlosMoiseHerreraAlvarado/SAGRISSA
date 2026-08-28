import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  FileCheck, 
  FileText, 
  Loader2, 
  MapPin, 
  Search, 
  ShieldAlert, 
  X, 
  XCircle,
  Package,
  Calendar,
  CheckSquare,
  Square
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobilePage } from '../../../core/layout/MobilePage';
import { useAuth } from '../../../core/hooks/useAuth';
import { hasPermission } from '../../../core/auth/permissions';
import { BottomSheet } from '../../../core/ui/BottomSheet';
import { approvalsService, type ApprovalRequest } from '../services/approvals.service';

interface Props {
  title: string;
  subtitle: string;
}

export default function ApprovalQueuePage({ title, subtitle }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canDecide = hasPermission(user?.permissions, 'approvals.decide') || user?.role === 'gerente' || user?.role === 'director';

  const [items, setItems] = useState<ApprovalRequest[]>([]);
  const [selected, setSelected] = useState<ApprovalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal de confirmación obligatoria según diseño ("¿Está seguro de ejecutar la acción?")
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    decision: 'approve' | 'reject';
    targetId: string | null;
    isBulk?: boolean;
  }>({
    open: false,
    decision: 'approve',
    targetId: null,
  });

  const [deciding, setDeciding] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const loadData = () => {
    setLoading(true);
    approvalsService.getPending()
      .then(data => {
        setItems(data);
        if (data.length > 0 && !selected) {
          // En tablet/PC pre-seleccionar el primer elemento para la vista Master-Detail
          if (window.innerWidth >= 768) {
            setSelected(data[0]);
          }
        }
      })
      .catch(caught => setError(caught instanceof Error ? caught.message : 'No fue posible cargar las aprobaciones.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  // Filtrado reactivo
  const filteredItems = items.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = 
      item.customer.toLowerCase().includes(search.toLowerCase()) ||
      item.orderNumber.includes(search) ||
      (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(search.toLowerCase())) ||
      item.reason.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleTriggerDecision = (targetId: string, decision: 'approve' | 'reject') => {
    setConfirmDialog({
      open: true,
      decision,
      targetId,
      isBulk: false,
    });
  };

  const handleTriggerBulk = (decision: 'approve' | 'reject') => {
    if (selectedIds.length === 0) return;
    setConfirmDialog({
      open: true,
      decision,
      targetId: null,
      isBulk: true,
    });
  };

  const executeConfirmedDecision = async () => {
    setDeciding(true);
    try {
      if (confirmDialog.isBulk) {
        await approvalsService.decideBulk(selectedIds, confirmDialog.decision);
        setItems(current => current.map(item => 
          selectedIds.includes(item.id) 
            ? { ...item, status: confirmDialog.decision === 'approve' ? 'approved' : 'rejected' }
            : item
        ));
        setSuccessToast(`${selectedIds.length} solicitudes ${confirmDialog.decision === 'approve' ? 'aprobadas' : 'rechazadas'} exitosamente.`);
        setSelectedIds([]);
      } else if (confirmDialog.targetId) {
        const id = confirmDialog.targetId;
        await approvalsService.decide(id, confirmDialog.decision);
        setItems(current => current.map(item => 
          item.id === id 
            ? { ...item, status: confirmDialog.decision === 'approve' ? 'approved' : 'rejected' }
            : item
        ));
        if (selected?.id === id) {
          setSelected(prev => prev ? { ...prev, status: confirmDialog.decision === 'approve' ? 'approved' : 'rejected' } : null);
        }
        setSuccessToast(`Solicitud #${id} ${confirmDialog.decision === 'approve' ? 'aprobada' : 'rechazada'} exitosamente.`);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible registrar la decisión.');
    } finally {
      setDeciding(false);
      setConfirmDialog({ open: false, decision: 'approve', targetId: null });
      setTimeout(() => setSuccessToast(''), 3000);
    }
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const pendings = filteredItems.filter(x => x.status === 'pending').map(x => x.id);
    if (selectedIds.length === pendings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendings);
    }
  };

  return (
    <MobilePage>
      {/* Header */}
      <header className="px-6 md:px-0 pt-12 md:pt-0 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 z-10 relative">
        <div className="flex items-center gap-4">
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="min-h-11 min-w-11 rounded-full p-2 text-ink-muted dark:text-slate-400 hover:bg-surface-soft dark:hover:bg-slate-800 md:hidden" 
            aria-label="Volver"
          >
            <ArrowLeft size={24} className="mx-auto" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-ink dark:text-white tracking-tight">{title}</h1>
            <p className="text-[11px] font-black uppercase tracking-widest text-brand-blue">{subtitle}</p>
          </div>
        </div>

        {/* Date period badge matching PDF (06/06/22 - 06/10/22) */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-2xl text-xs font-bold text-ink dark:text-slate-200 shadow-sm">
            <Calendar size={14} className="text-brand-blue" /> Periodo Activo: 06/06/22 - 06/10/22
          </span>
        </div>
      </header>

      {/* Main Body */}
      <div className="px-6 md:px-0 pb-32 space-y-6">
        
        {/* Toast de Éxito */}
        {successToast && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            {successToast}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <p role="alert" className="rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 p-4 text-sm font-semibold text-red-700 dark:text-red-300">
            {error}
          </p>
        )}

        {/* Search & Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por cliente, pedido, factura..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-2xl text-sm text-ink dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-blue transition-all"
            />
            {search && (
              <button 
                type="button" 
                onClick={() => setSearch('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-ink"
                aria-label="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            {(['pending', 'approved', 'rejected', 'all'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                  filterStatus === st 
                    ? 'bg-brand-blue text-white shadow-sm' 
                    : 'bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 text-ink-muted dark:text-slate-400 hover:text-ink dark:hover:text-white'
                }`}
              >
                {st === 'pending' ? 'Pendientes' : st === 'approved' ? 'Aprobadas' : st === 'rejected' ? 'Rechazadas' : 'Todas'}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Action Toolbar (For Desktop/Tablet when items are selected) */}
        {selectedIds.length > 0 && canDecide && (
          <div className="p-4 bg-brand-blue/10 dark:bg-brand-blue/20 border border-brand-blue/30 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <span className="text-xs font-bold text-brand-blue dark:text-brand-blue">
              {selectedIds.length} solicitud(es) seleccionada(s)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTriggerBulk('reject')}
                className="px-4 py-2 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-red-600 hover:text-white transition-all"
              >
                Rechazar Selección
              </button>
              <button
                type="button"
                onClick={() => handleTriggerBulk('approve')}
                className="px-4 py-2 bg-brand-blue text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-brand-dark transition-all shadow-sm"
              >
                Aprobar Selección
              </button>
            </div>
          </div>
        )}

        {/* Content Loading State */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-brand-blue" size={36} />
            <p className="text-sm font-bold text-ink-muted dark:text-slate-400">Cargando expediente de autorizaciones...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-3xl p-8">
            <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
            <h3 className="text-base font-black text-ink dark:text-white">Sin autorizaciones en este criterio</h3>
            <p className="text-xs font-semibold text-ink-muted dark:text-slate-400 mt-1">No hay solicitudes que requieran atención en este momento.</p>
          </div>
        ) : (
          /* Responsive Layout: Mobile (Cards + BottomSheet) vs Tablet/PC (Master-Detail / DataGrid) */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: List of Requests (Full width on Mobile, 5 cols on Tablet/PC) */}
            <div className="col-span-1 md:col-span-5 lg:col-span-5 space-y-3">
              
              {/* Select All Checkbox on Tablet/PC */}
              <div className="hidden md:flex items-center justify-between px-2 pb-1">
                <button 
                  type="button" 
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-xs font-bold text-ink-muted dark:text-slate-400 hover:text-brand-blue"
                >
                  {selectedIds.length > 0 && selectedIds.length === filteredItems.filter(x => x.status === 'pending').length ? (
                    <CheckSquare size={16} className="text-brand-blue" />
                  ) : (
                    <Square size={16} />
                  )}
                  Seleccionar pendientes
                </button>
                <span className="text-[11px] font-bold text-slate-400">
                  {filteredItems.length} resultado(s)
                </span>
              </div>

              {filteredItems.map(item => {
                const isSelected = selected?.id === item.id;
                const isChecked = selectedIds.includes(item.id);
                const isPending = item.status === 'pending';

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className={`relative rounded-3xl border p-5 text-left cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-brand-blue bg-brand-blue/5 dark:bg-brand-blue/10 shadow-md ring-2 ring-brand-blue/20'
                        : 'border-surface-border dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-blue/40 shadow-card dark:shadow-card-dark'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {/* Checkbox for bulk */}
                        {isPending && canDecide && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectId(item.id);
                            }}
                            className="text-slate-400 hover:text-brand-blue"
                            aria-label="Seleccionar"
                          >
                            {isChecked ? (
                              <CheckSquare size={18} className="text-brand-blue" />
                            ) : (
                              <Square size={18} />
                            )}
                          </button>
                        )}
                        <span className={`p-2.5 rounded-2xl ${
                          item.riskLevel === 'critical' ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400' :
                          item.riskLevel === 'high' ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400' :
                          'bg-brand-blue/10 text-brand-blue'
                        }`}>
                          <FileText size={20} />
                        </span>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Nº Pedido {item.orderNumber}
                          </p>
                          <h4 className="text-sm font-black text-ink dark:text-white leading-tight">
                            {item.customer}
                          </h4>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-brand-blue block">
                          ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mt-1 ${
                          item.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600' :
                          item.status === 'rejected' ? 'bg-red-50 dark:bg-red-950 text-red-600' :
                          'bg-amber-50 dark:bg-amber-950 text-amber-600'
                        }`}>
                          {item.status === 'approved' ? 'Aprobado' : item.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-surface-border dark:border-slate-800 flex items-center justify-between text-xs text-ink-muted dark:text-slate-400">
                      <span className="truncate max-w-[200px] font-medium text-amber-600 dark:text-amber-400 font-semibold">
                        {item.reason}
                      </span>
                      <span className="text-[11px] shrink-0 font-bold">{item.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Tablet & PC Dossier Panel (Master-Detail View) */}
            <div className="hidden md:block md:col-span-7 lg:col-span-7 sticky top-4">
              {selected ? (
                <div className="bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-3xl p-6 shadow-card dark:shadow-card-dark space-y-6">
                  
                  {/* Header Dossier */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-surface-border dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-[10px] font-black uppercase tracking-widest">
                          Factura / Pedido #{selected.orderNumber}
                        </span>
                        {selected.invoiceNumber && (
                          <span className="text-xs font-bold text-slate-400">
                            Doc: {selected.invoiceNumber}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-black text-ink dark:text-white mt-2">
                        {selected.customer}
                      </h3>
                      <p className="text-xs font-bold text-slate-400">
                        Código: {selected.customerCode} · Vendedor: {selected.sellerName}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monto Total</p>
                      <p className="text-2xl font-black text-brand-blue">
                        ${selected.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Financial & Aging Health Card (Matching PDF specification) */}
                  <div className="p-4 bg-surface-soft dark:bg-slate-800/60 rounded-2xl space-y-3">
                    <p className="text-[11px] font-black uppercase tracking-widest text-ink dark:text-slate-200">
                      Estado Financiero y Cartera del Cliente
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-surface-border dark:border-slate-700">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Límite Crédito</span>
                        <strong className="text-xs font-black text-ink dark:text-white">
                          ${selected.financials.creditLimit.toLocaleString()}
                        </strong>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-surface-border dark:border-slate-700">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Adeudado</span>
                        <strong className="text-xs font-black text-amber-600">
                          ${selected.financials.totalDebt.toLocaleString()}
                        </strong>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-surface-border dark:border-slate-700">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Saldo Disponible</span>
                        <strong className="text-xs font-black text-emerald-600">
                          ${selected.financials.availableCredit.toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    {/* Aging Bars */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                        <span>Antigüedad de Saldo (Aging)</span>
                        <span>0 a 90+ días</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-center text-[9px] font-black">
                        <div className="p-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          0-30d: ${(selected.financials.aging0to30 / 1000).toFixed(0)}k
                        </div>
                        <div className="p-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          31-60d: ${(selected.financials.aging31to60 / 1000).toFixed(0)}k
                        </div>
                        <div className="p-1 rounded bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300">
                          61-90d: ${(selected.financials.aging61to90 / 1000).toFixed(0)}k
                        </div>
                        <div className="p-1 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                          90+d: ${(selected.financials.aging90Plus / 1000).toFixed(0)}k
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="p-4 bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-2xl space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-widest text-brand-blue">
                      Datos de Entrega y Observaciones
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-ink dark:text-slate-300">
                      <MapPin size={15} className="text-slate-400 shrink-0" />
                      <span>{selected.deliveryAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-ink dark:text-slate-300">
                      <Calendar size={15} className="text-slate-400 shrink-0" />
                      <span>Fecha requerida: {selected.deliveryDate}</span>
                    </div>
                    {selected.observations && (
                      <p className="text-xs italic text-slate-500 dark:text-slate-400 bg-surface-soft dark:bg-slate-800 p-2.5 rounded-xl mt-2">
                        "{selected.observations}"
                      </p>
                    )}
                  </div>

                  {/* Order Line Items Table (Matching PDF BIOMIN BOOTER 11) */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-widest text-ink dark:text-slate-200">
                      Detalle de Partidas ({selected.items.length} productos)
                    </p>
                    <div className="border border-surface-border dark:border-slate-800 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-surface-soft dark:bg-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          <tr>
                            <th className="p-3">Producto</th>
                            <th className="p-3 text-center">Cant.</th>
                            <th className="p-3 text-right">P. Unit</th>
                            <th className="p-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border dark:divide-slate-800">
                          {selected.items.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="p-3">
                                <p className="font-bold text-ink dark:text-white leading-tight">{item.productName}</p>
                                <span className="text-[10px] text-slate-400">{item.presentation}</span>
                              </td>
                              <td className="p-3 text-center font-bold text-ink dark:text-white">{item.quantity} un.</td>
                              <td className="p-3 text-right text-slate-500 dark:text-slate-400">${item.unitPrice.toLocaleString()}</td>
                              <td className="p-3 text-right font-black text-brand-blue">${item.totalPrice.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Action Buttons for Tablet / PC */}
                  {selected.status === 'pending' && canDecide && (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleTriggerDecision(selected.id, 'reject')}
                        className="flex-1 py-4 bg-surface-soft dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/60 dark:hover:text-red-400 text-ink-muted dark:text-slate-300 font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
                      >
                        Denegar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTriggerDecision(selected.id, 'approve')}
                        className="flex-1 py-4 bg-brand-blue hover:bg-brand-dark text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md shadow-brand-blue/20 transition-all"
                      >
                        Autorizar
                      </button>
                    </div>
                  )}

                </div>
              ) : (
                <div className="p-12 text-center bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-3xl text-slate-400">
                  <Package size={36} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-bold">Seleccione una solicitud para inspeccionar el expediente</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Mobile BottomSheet for Viewing Details and Deciding */}
      <div className="md:hidden">
        <BottomSheet
          open={Boolean(selected && window.innerWidth < 768)}
          title={`Expediente Pedido #${selected?.orderNumber || ''}`}
          onClose={() => setSelected(null)}
        >
          {selected && (
            <div className="space-y-5 max-h-[75vh] overflow-y-auto pb-4 pr-1">
              
              {/* Customer & Amount */}
              <div className="flex items-start justify-between gap-2 border-b border-surface-border dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-black text-ink dark:text-white leading-tight">{selected.customer}</h3>
                  <p className="text-[11px] font-bold text-slate-400">DUI: {selected.customerDui || 'N/A'} · Cod: {selected.customerCode}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Total</span>
                  <span className="text-lg font-black text-brand-blue">
                    ${selected.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Reason alert */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-2xl flex items-center gap-2">
                <ShieldAlert size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">{selected.reason}</span>
              </div>

              {/* Financial Health */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-surface-soft dark:bg-slate-800 rounded-xl">
                  <span className="text-[9px] text-slate-400 font-bold block">Límite</span>
                  <strong className="text-[11px] font-black dark:text-white">${(selected.financials.creditLimit / 1000).toFixed(0)}k</strong>
                </div>
                <div className="p-2 bg-surface-soft dark:bg-slate-800 rounded-xl">
                  <span className="text-[9px] text-slate-400 font-bold block">Deuda</span>
                  <strong className="text-[11px] font-black text-amber-600">${(selected.financials.totalDebt / 1000).toFixed(0)}k</strong>
                </div>
                <div className="p-2 bg-surface-soft dark:bg-slate-800 rounded-xl">
                  <span className="text-[9px] text-slate-400 font-bold block">Disponible</span>
                  <strong className="text-[11px] font-black text-emerald-600">${(selected.financials.availableCredit / 1000).toFixed(1)}k</strong>
                </div>
              </div>

              {/* Delivery Data */}
              <div className="p-3 bg-surface-soft dark:bg-slate-800/80 rounded-2xl space-y-1.5 text-xs">
                <p className="text-[10px] font-black uppercase text-brand-blue tracking-wider">Datos de Entrega</p>
                <p className="font-semibold text-ink dark:text-slate-300 flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" /> {selected.deliveryAddress}
                </p>
                <p className="font-semibold text-ink dark:text-slate-300 flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" /> Entrega: {selected.deliveryDate}
                </p>
                {selected.observations && (
                  <p className="text-xs italic text-slate-500 dark:text-slate-400 pt-1">
                    "{selected.observations}"
                  </p>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-ink dark:text-slate-200 tracking-wider">
                  Partidas ({selected.items.length})
                </p>
                <div className="space-y-2">
                  {selected.items.map(item => (
                    <div key={item.id} className="p-3 bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-black text-ink dark:text-white">{item.productName}</p>
                        <p className="text-[10px] text-slate-400">{item.presentation} · {item.quantity} unidades</p>
                      </div>
                      <strong className="text-brand-blue font-black shrink-0">${item.totalPrice.toLocaleString()}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {selected.status === 'pending' && canDecide ? (
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleTriggerDecision(selected.id, 'reject')}
                    className="flex-1 py-4 bg-surface-soft dark:bg-slate-800 text-ink dark:text-slate-200 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    Denegar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTriggerDecision(selected.id, 'approve')}
                    className="flex-1 py-4 bg-brand-blue text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md shadow-brand-blue/20 transition-all"
                  >
                    Autorizar
                  </button>
                </div>
              ) : (
                <p className="p-3 bg-surface-soft dark:bg-slate-800 text-center text-xs font-bold text-slate-400 rounded-2xl">
                  Estado: {selected.status === 'approved' ? 'Aprobado formalmente' : selected.status === 'rejected' ? 'Rechazado' : 'Solo lectura'}
                </p>
              )}

            </div>
          )}
        </BottomSheet>
      </div>

      {/* MODAL DE CONFIRMACIÓN OBLIGATORIO SEGÚN DISEÑO ("¿Está seguro de ejecutar la acción?") */}
      {confirmDialog.open && typeof document !== 'undefined' && createPortal(
        <div 
          role="dialog" 
          aria-modal="true" 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-[32px] p-6 shadow-2xl space-y-5 text-center animate-in zoom-in-95 duration-200">
            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
              confirmDialog.decision === 'approve' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
            }`}>
              {confirmDialog.decision === 'approve' ? <FileCheck size={32} /> : <XCircle size={32} />}
            </div>

            <div>
              <h3 className="text-lg font-black text-ink dark:text-white">
                ¿Está seguro de ejecutar la acción?
              </h3>
              <p className="text-xs text-ink-muted dark:text-slate-400 mt-2 leading-relaxed">
                {confirmDialog.isBulk 
                  ? `Se procederá a ${confirmDialog.decision === 'approve' ? 'AUTORIZAR' : 'DENEGAR'} ${selectedIds.length} solicitudes seleccionadas.`
                  : `Se registrará la decisión de ${confirmDialog.decision === 'approve' ? 'AUTORIZACIÓN' : 'DENEGACIÓN'} en el sistema formal de SAGRISA.`
                }
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={deciding}
                onClick={() => setConfirmDialog({ open: false, decision: 'approve', targetId: null })}
                className="flex-1 py-3.5 bg-surface-soft dark:bg-slate-800 text-ink-muted dark:text-slate-300 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deciding}
                onClick={executeConfirmedDecision}
                className={`flex-1 py-3.5 font-black text-xs uppercase tracking-widest rounded-2xl text-white shadow-md transition-all ${
                  confirmDialog.decision === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                }`}
              >
                {deciding ? <Loader2 size={16} className="mx-auto animate-spin" /> : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </MobilePage>
  );
}
