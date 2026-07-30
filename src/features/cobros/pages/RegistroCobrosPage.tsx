import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, CreditCard, Landmark, Loader2, Receipt, Search, Upload, User, Wallet } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../facturacion/services/customer.service';
import { Card } from '../../../core/ui/Card';
import { cobrosService, type PendingInvoice } from '../services/cobros.service';
import type { CustomerAccount } from '../../../types';

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No fue posible leer el comprobante.'));
    reader.readAsDataURL(file);
  });
}

export default function RegistroCobrosPage() {
  const navigate = useNavigate();
  const signature = useRef<SignatureCanvas>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerAccount[]>([]);
  const [invoices, setInvoices] = useState<PendingInvoice[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerAccount | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<PendingInvoice | null>(null);
  const [form, setForm] = useState({ amount: 0, paymentMethod: 'transferencia' as 'efectivo' | 'transferencia' | 'cheque', reference: '' });

  useEffect(() => {
    customerService.getCustomersList().then(setCustomers).catch(() => setError('No fue posible cargar los clientes asignados.'));
  }, []);

  const selectCustomer = async (customer: CustomerAccount) => {
    setLoading(true);
    setError('');
    try {
      setSelectedCustomer(customer);
      setInvoices(await cobrosService.getPendingInvoices(customer.customerId));
      setStep(2);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible cargar las facturas pendientes.');
    } finally {
      setLoading(false);
    }
  };

  const selectInvoice = (invoice: PendingInvoice) => {
    setSelectedInvoice(invoice);
    setForm(current => ({ ...current, amount: invoice.balance }));
    setStep(3);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCustomer || !selectedInvoice || form.amount <= 0 || form.amount > selectedInvoice.balance) return;
    setLoading(true);
    setError('');
    try {
      const result = await cobrosService.registerPayment({
        invoiceId: selectedInvoice.id,
        invoiceNumber: selectedInvoice.number,
        customerName: selectedCustomer.name,
        amount: form.amount,
        paymentMethod: form.paymentMethod,
        reference: form.reference,
        receiptFileName: receiptFile?.name,
        receiptContentBase64: receiptFile ? await fileToDataUrl(receiptFile) : undefined,
        signatureDataUrl: signature.current?.isEmpty() ? undefined : signature.current?.toDataURL(),
      });
      if (result.queuedOffline) {
        setError('Cobro guardado localmente. Se sincronizará al recuperar la conexión.');
        setStep(1);
      } else {
        navigate('/app/cobros');
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible registrar el cobro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-full bg-white md:bg-transparent pb-24 md:pb-10">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8 md:py-8">
        <header className="mb-8 flex items-center gap-4">
          <button type="button" onClick={() => step > 1 ? setStep((step - 1) as 1 | 2 | 3) : navigate(-1)} className="min-h-11 min-w-11 rounded-2xl border border-surface-border text-ink-muted hover:text-brand-blue" aria-label="Volver"><ArrowLeft size={20} className="mx-auto" /></button>
          <div><h1 className="text-xl font-black tracking-tight text-ink">Registrar cobro</h1><p className="text-[11px] font-black uppercase tracking-widest text-ink-muted">Paso {step} de 3</p></div>
        </header>

        {error && <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900"><CheckCircle2 size={18} className="mt-0.5 shrink-0" />{error}</div>}

        {step === 1 && <section aria-labelledby="customer-title"><h2 id="customer-title" className="mb-5 text-sm font-black uppercase tracking-widest text-ink">Seleccione el cliente</h2><div className="mb-4 flex items-center gap-3 rounded-2xl border border-surface-border bg-white px-4 py-3"><Search size={18} className="text-ink-light" /><input className="w-full outline-none" placeholder="Buscar cliente" aria-label="Buscar cliente" /></div><div className="grid gap-3">{customers.map(customer => <button key={customer.customerId} type="button" onClick={() => void selectCustomer(customer)} className="flex min-h-20 items-center justify-between rounded-3xl border border-surface-border bg-white p-5 text-left shadow-card hover:border-brand-blue/40"><span className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-soft text-brand-blue"><User size={20} /></span><span><strong className="block text-sm text-ink">{customer.name}</strong><small className="text-xs font-semibold text-ink-muted">{customer.customerId}</small></span></span><ArrowLeft size={18} className="rotate-180 text-ink-light" /></button>)}</div>{loading && <Loader2 className="mx-auto mt-6 animate-spin text-brand-blue" />}</section>}

        {step === 2 && <section aria-labelledby="invoice-title"><h2 id="invoice-title" className="mb-5 text-sm font-black uppercase tracking-widest text-ink">Facturas con saldo</h2><div className="mb-5 rounded-2xl bg-brand-blue/5 p-4 text-sm font-black text-brand-blue">{selectedCustomer?.name}</div><div className="grid gap-3">{invoices.map(invoice => <button key={invoice.id} type="button" onClick={() => selectInvoice(invoice)} className="flex min-h-24 items-center justify-between rounded-3xl border border-surface-border bg-white p-5 text-left shadow-card hover:border-brand-blue/40"><span className="flex items-center gap-4"><Receipt className="text-brand-blue" size={20} /><span><strong className="block text-sm text-ink">{invoice.number}</strong><small className="text-xs font-semibold text-ink-muted">{invoice.date}</small></span></span><span className="text-right"><small className="block text-[10px] font-black uppercase tracking-widest text-ink-muted">Saldo</small><strong className="text-red-600">${invoice.balance.toLocaleString()}</strong></span></button>)}</div></section>}

        {step === 3 && selectedInvoice && <form onSubmit={submit} className="space-y-6"><Card padding="lg"><div className="mb-6 flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-widest text-ink-muted">Abono a factura</p><h2 className="break-words text-lg font-black text-ink">{selectedInvoice.number}</h2></div><strong className="shrink-0 text-brand-blue">${selectedInvoice.balance.toLocaleString()}</strong></div><label className="block text-xs font-black uppercase tracking-widest text-ink-muted">Monto<input required min="0.01" max={selectedInvoice.balance} step="0.01" type="number" value={form.amount} onChange={event => setForm({ ...form, amount: Number(event.target.value) })} className="mt-2 min-h-14 w-full rounded-2xl border border-surface-border px-5 text-xl font-black" /></label><fieldset><legend className="mb-3 text-xs font-black uppercase tracking-widest text-ink-muted">Método de pago</legend><div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{([{ id: 'transferencia', label: 'Transferencia', icon: Landmark }, { id: 'efectivo', label: 'Efectivo', icon: Wallet }, { id: 'cheque', label: 'Cheque', icon: CreditCard }] as const).map(method => <button key={method.id} type="button" onClick={() => setForm({ ...form, paymentMethod: method.id })} className={`min-h-20 rounded-2xl border text-xs font-black ${form.paymentMethod === method.id ? 'border-brand-blue bg-brand-blue text-white' : 'border-surface-border bg-surface-soft text-ink-muted'}`}><method.icon aria-hidden="true" size={18} className="mx-auto mb-1" />{method.label}</button>)}</div></fieldset><label className="block text-xs font-black uppercase tracking-widest text-ink-muted">Referencia<input value={form.reference} onChange={event => setForm({ ...form, reference: event.target.value })} className="mt-2 min-h-12 w-full rounded-2xl border border-surface-border px-4" placeholder="Número de transacción" /></label><label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface-soft text-sm font-semibold text-ink-muted"><Upload aria-hidden="true" size={20} /><span className="max-w-full truncate px-3">{receiptFile?.name ?? 'Subir comprobante'}</span><input type="file" accept="image/*,.pdf" className="sr-only" onChange={event => setReceiptFile(event.target.files?.[0] ?? null)} /></label><div><div className="mb-2 flex justify-between text-xs font-black uppercase tracking-widest text-ink-muted"><span>Firma del cliente</span><button type="button" onClick={() => signature.current?.clear()} className="min-h-11 px-2 text-brand-blue">Limpiar</button></div><div className="h-40 overflow-hidden rounded-2xl border border-surface-border bg-surface-soft"><SignatureCanvas ref={signature} canvasProps={{ className: 'h-full w-full' }} /></div></div></Card><button type="submit" disabled={loading} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-blue text-sm font-black uppercase tracking-widest text-white disabled:opacity-60">{loading ? <Loader2 className="animate-spin" size={18} /> : <Receipt size={18} />} Confirmar cobro</button></form>}
      </div>
    </main>
  );
}
