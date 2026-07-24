import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Landmark, Wallet, CreditCard, Receipt, User, Search, Upload, X } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { cobrosService } from '../services/cobros.service';
import { Card } from '../../../core/ui/Card';

export default function RegistroCobrosPage() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState(1); // 1: Cliente, 2: Factura, 3: Monto
  const sigPad = useRef<SignatureCanvas>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    invoiceId: '',
    invoiceNumber: '',
    amount: 0,
    paymentMethod: 'transferencia' as 'efectivo' | 'transferencia' | 'cheque',
    reference: '',
    maxAmount: 0
  });

  const [pendingInvoices, setPendingInvoices] = useState<any[]>([]);

  // Simulación de búsqueda de cliente
  const handleSelectCustomer = (id: string, name: string) => {
    setFormData({ ...formData, customerId: id, customerName: name });
    cobrosService.getPendingInvoices(id).then(invoices => {
      setPendingInvoices(invoices);
      setStep(2);
    });
  };

  const handleSelectInvoice = (invoice: any) => {
    setFormData({ 
      ...formData, 
      invoiceId: invoice.id, 
      invoiceNumber: invoice.number,
      maxAmount: invoice.balance,
      amount: invoice.balance 
    });
    setStep(3);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await cobrosService.registerPayment({
        invoiceId: formData.invoiceId,
        invoiceNumber: formData.invoiceNumber,
        customerName: formData.customerName,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        reference: formData.reference,
      });
      alert('Cobro registrado exitosamente');
      navigate('/app/vendedor/cobros');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white md:bg-transparent pb-20 md:pb-10">
      <div className="w-full h-full xl:max-w-4xl mx-auto flex flex-col relative md:pt-6 md:px-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 px-6 md:px-0">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-blue shadow-sm transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-black text-xl text-slate-800 tracking-tight">Registro de Cobro</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paso {step} de 3</p>
          </div>
        </div>

        {/* ─── Paso 1: Selección de Cliente ─── */}
        {step === 1 && (
          <div className="px-4 md:px-0 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-sm font-black text-slate-800 mb-6 px-2">Seleccione el Cliente</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all">
                <Search size={18} className="text-slate-300" />
                <input type="text" placeholder="Buscar por nombre o DUI..." className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-700" />
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'C1', name: 'Luis Armando S.', dui: '05128392-1' },
                  { id: 'C2', name: 'Agrícola San José', dui: '01293844-5' },
                  { id: 'C3', name: 'Distribuidora Central', dui: '06654321-9' }
                ].map(c => (
                  <button 
                    key={c.id}
                    onClick={() => handleSelectCustomer(c.id, c.name)}
                    className="bg-white p-5 rounded-3xl border border-slate-100 hover:border-brand-blue/40 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-blue/5 group-hover:text-brand-blue transition-all">
                        <User size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-[14px] text-slate-800">{c.name}</p>
                        <p className="text-[11px] font-bold text-slate-400">{c.dui}</p>
                      </div>
                    </div>
                    <ArrowLeft size={18} className="text-slate-200 rotate-180 group-hover:text-brand-blue" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Paso 2: Selección de Factura ─── */}
        {step === 2 && (
          <div className="px-4 md:px-0 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-brand-blue/5 p-4 rounded-2xl mb-6 flex items-center gap-3 border border-brand-blue/10">
              <User size={16} className="text-brand-blue" />
              <span className="text-xs font-black text-brand-blue uppercase">{formData.customerName}</span>
            </div>
            <h3 className="text-sm font-black text-slate-800 mb-6 px-2">Documentos con Saldo Pendiente</h3>
            <div className="grid grid-cols-1 gap-3">
              {pendingInvoices.map(inv => (
                <button 
                  key={inv.id}
                  onClick={() => handleSelectInvoice(inv)}
                  className="bg-white p-6 rounded-[32px] border border-slate-100 hover:border-brand-blue/40 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-blue/5 group-hover:text-brand-blue transition-all">
                      <Receipt size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-[14px] text-slate-800">{inv.number}</p>
                      <p className="text-[11px] font-bold text-slate-400">Emisión: {inv.date}</p>
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo</p>
                    <p className="font-black text-[15px] text-red-500">${inv.balance.toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Paso 3: Detalles del Pago ─── */}
        {step === 3 && (
          <form onSubmit={handleSave} className="px-4 md:px-0 animate-in fade-in slide-in-from-bottom-4 space-y-6">
            <Card padding="lg" className="shadow-xl shadow-slate-200/50">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Abono a Factura</p>
                  <h4 className="text-lg font-black text-slate-800">{formData.invoiceNumber}</h4>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Actual</p>
                  <p className="text-lg font-black text-brand-blue">${formData.maxAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">Monto del Abono ($)</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    max={formData.maxAmount}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  />
                  {formData.amount === formData.maxAmount && (
                    <p className="text-[10px] font-bold text-emerald-500 uppercase mt-2 ml-1">Pago Total Detectado</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-3">Método de Pago</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'transferencia', label: 'Transf.', icon: Landmark },
                      { id: 'efectivo', label: 'Efectivo', icon: Wallet },
                      { id: 'cheque', label: 'Cheque', icon: CreditCard },
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: m.id as any })}
                        className={`py-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${formData.paymentMethod === m.id ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                      >
                        <m.icon size={18} />
                        <span className="text-[10px] font-black uppercase tracking-tight">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">Referencia / Comprobante</label>
                  <input 
                    type="text"
                    placeholder="Ej: # Transacción o Número de Cheque"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                    value={formData.reference}
                    onChange={e => setFormData({ ...formData, reference: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">Comprobante Físico (Foto/PDF)</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 bg-slate-50 border border-slate-100 border-dashed hover:border-brand-blue/40 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
                      <Upload size={20} className="text-slate-400 mb-2" />
                      <span className="text-[11px] font-bold text-slate-500 text-center">Subir documento</span>
                      <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => setReceiptFile(e.target.files?.[0] || null)} />
                    </label>
                    {receiptFile && (
                      <div className="flex-1 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl p-4 relative flex items-center justify-between">
                        <span className="text-[11px] font-bold text-brand-blue truncate pr-4">{receiptFile.name}</span>
                        <button type="button" onClick={() => setReceiptFile(null)} className="text-slate-400 hover:text-red-500 absolute top-2 right-2"><X size={14} /></button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 flex justify-between items-end">
                    <span>Firma del Cliente</span>
                    <button type="button" onClick={() => sigPad.current?.clear()} className="text-brand-blue hover:underline text-[10px]">Limpiar</button>
                  </label>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden w-full h-40">
                    <SignatureCanvas 
                      ref={sigPad}
                      canvasProps={{ className: 'w-full h-full' }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <button 
              disabled={isSaving || formData.amount <= 0}
              type="submit"
              className="w-full bg-brand-blue text-white py-5 rounded-[28px] font-black text-[13px] uppercase tracking-widest shadow-xl shadow-brand-blue/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Confirmar y Registrar Pago
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
