import { useState, useEffect } from 'react';
import { ArrowLeft, Search, User, Package, ChevronRight, CheckCircle2, ShoppingCart, Calendar, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../facturacion/services/customer.service';
import { catalogService } from '../../catalogo/services/catalog.service';
import { orderService } from '../services/order.service';
import type { CustomerAccount, Product, OrderItem } from '../../../types';
import { Skeleton } from '../../../core/ui/Skeleton';

type Step = 'cliente' | 'productos' | 'entrega' | 'success';

export default function NuevoPedidoPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('cliente');
  const [loading, setLoading] = useState(false);
  
  // State for Selection
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerAccount | null>(null);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [deliveryData, setDeliveryData] = useState({
    date: '',
    address: '',
    notes: ''
  });

  // Services State
  const [customers, setCustomers] = useState<CustomerAccount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Initial Data Fetch
  useEffect(() => {
    if (step === 'cliente') {
      setLoading(true);
      customerService.getCustomersList().then(data => {
        setCustomers(data);
        setLoading(false);
      });
    } else if (step === 'productos') {
      setLoading(true);
      catalogService.getProducts().then(data => {
        setProducts(data);
        setLoading(false);
      });
    }
  }, [step]);

  // ─── Step Actions ────────────────────────────────────────────────────────

  const handleCreateOrder = async () => {
    if (!selectedCustomer) return;
    setLoading(true);
    
    const items: OrderItem[] = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.price,
      totalPrice: item.product.price * item.quantity
    }));

    try {
      await orderService.createOrder({
        customerId: selectedCustomer.customerId,
        customerName: selectedCustomer.name,
        items,
        totalAmount: items.reduce((sum, i) => sum + i.totalPrice, 0),
        deliveryDate: deliveryData.date,
        deliveryAddress: deliveryData.address,
        observations: deliveryData.notes
      });
      setStep('success');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? {...i, quantity: i.quantity + 1} : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // ─── Sub-Renders ─────────────────────────────────────────────────────────

  const renderClienteStep = () => (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col gap-2 mb-2">
         <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider px-1">1. Seleccionar Cliente</h3>
         <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-brand-blue/15 transition-all">
            <Search size={18} className="text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o DUI..." 
              className="w-full text-sm font-bold bg-transparent outline-none placeholder:text-slate-300"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-3xl" />)
        ) : (
          customers
            .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.dui.includes(searchTerm))
            .map(c => (
              <button 
                key={c.customerId}
                onClick={() => { setSelectedCustomer(c); setStep('productos'); setSearchTerm(''); }}
                className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm hover:border-brand-blue/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-all">
                    <User size={24} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[14px] font-black text-slate-800">{c.name}</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{c.dui}</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-200 group-hover:text-brand-blue transition-all" />
              </button>
            ))
        )}
      </div>
    </div>
  );

  const renderProductosStep = () => (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-32">
       <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shrink-0">
             <User size={20} />
          </div>
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente Seleccionado</span>
             <span className="text-[13px] font-black text-slate-800">{selectedCustomer?.name}</span>
          </div>
       </div>

       <div className="flex flex-col gap-2">
         <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest px-1">2. Agregar Productos</h3>
         <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-brand-blue/15 transition-all">
            <Search size={18} className="text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Buscar SKU o nombre..." 
              className="w-full text-sm font-bold bg-transparent outline-none placeholder:text-slate-300"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {loading ? (
           Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-3xl" />)
         ) : (
           products
             .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.includes(searchTerm))
             .map(p => (
               <div key={p.id} className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex gap-4 items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 shrink-0">
                     <Package size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                     <span className="text-[10px] font-bold text-brand-blue uppercase">{p.sku}</span>
                     <h4 className="text-[13px] font-black text-slate-800 truncate">{p.name}</h4>
                     <p className="text-sm font-black text-slate-900">${p.price.toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => addToCart(p)}
                    className="w-10 h-10 bg-brand-blue text-white rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-all"
                  >
                    +
                  </button>
               </div>
             ))
         )}
       </div>

       {/* Floating Cart Panel */}
       {cart.length > 0 && (
         <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] md:max-w-[380px] bg-slate-900 text-white rounded-3xl p-4 shadow-2xl z-50 animate-in slide-in-from-bottom-8">
            <div className="flex items-center justify-between mb-4 px-2">
               <div className="flex items-center gap-2">
                 <ShoppingCart size={18} className="text-brand-blue" />
                 <span className="font-black text-sm">{cart.length} productos</span>
               </div>
               <span className="text-lg font-black text-brand-blue">${cartTotal.toFixed(2)}</span>
            </div>
            <button 
              onClick={() => { setStep('entrega'); setSearchTerm(''); }}
              className="w-full bg-[#00A9F4] py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              Continuar a Entrega
            </button>
         </div>
       )}
    </div>
  );

  const renderEntregaStep = () => (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
       <div className="bg-[#00A9F4] rounded-[32px] p-6 text-white shadow-lg relative overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Total del Pedido</p>
          <p className="text-3xl font-black tracking-tighter mb-4">${cartTotal.toFixed(2)}</p>
          <div className="flex items-center gap-2">
             <User size={14} className="text-white/50" />
             <span className="text-sm font-bold">{selectedCustomer?.name}</span>
          </div>
       </div>

       <div className="flex flex-col gap-4">
          <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest px-2 underline decoration-[#00A9F4] decoration-2 underline-offset-4">3. Detalles de Entrega</h3>
          
          <div className="space-y-4">
             <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                   <Calendar size={14} /> Fecha Solicitada
                </label>
                <input 
                  type="date" 
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:border-brand-blue outline-none shadow-sm"
                  value={deliveryData.date}
                  onChange={e => setDeliveryData({...deliveryData, date: e.target.value})}
                />
             </div>

             <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                   <MapPin size={14} /> Dirección de Entrega
                </label>
                <input 
                  type="text" 
                  placeholder="Ej: Bodega Central Calle 5"
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:border-brand-blue outline-none shadow-sm"
                  value={deliveryData.address}
                  onChange={e => setDeliveryData({...deliveryData, address: e.target.value})}
                />
             </div>

             <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                   Observaciones
                </label>
                <textarea 
                  rows={3}
                  placeholder="Cualquier nota adicional..."
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:border-brand-blue outline-none shadow-sm resize-none"
                  value={deliveryData.notes}
                  onChange={e => setDeliveryData({...deliveryData, notes: e.target.value})}
                />
             </div>
          </div>
       </div>

       <button 
         onClick={handleCreateOrder}
         disabled={loading || !deliveryData.date || !deliveryData.address}
         className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all
           ${loading || !deliveryData.date || !deliveryData.address ? 'bg-slate-200 text-slate-400' : 'bg-[#00A9F4] text-white hover:bg-brand-dark active:scale-95'}`}
       >
         {loading ? 'Procesando...' : 'Finalizar Pedido'}
       </button>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in zoom-in-95 duration-500">
       <div className="w-24 h-24 bg-emerald-50 rounded-[40px] flex items-center justify-center text-emerald-500 mb-8 border border-emerald-100 shadow-inner">
          <CheckCircle2 size={48} strokeWidth={2.5} />
       </div>
       <h2 className="text-2xl font-black text-slate-800 mb-2">¡Pedido Realizado!</h2>
       <p className="text-sm font-medium text-slate-400 mb-10 leading-relaxed px-4">
         El pedido ha sido enviado exitosamente al sistema central para su validación y procesamiento.
       </p>
       <button 
         onClick={() => navigate('/app/vendedor/home')}
         className="w-full max-w-[200px] bg-slate-800 text-white py-4 rounded-2xl font-black text-[13px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
       >
         Volver al Inicio
       </button>
    </div>
  );

  // ─── Main Render ───

  return (
    <div className="w-full min-h-screen flex justify-center pb-20 md:pb-0 bg-white md:bg-transparent">
      <div className="w-full h-full xl:max-w-4xl flex flex-col relative md:pt-4 md:px-8">
        
        {/* Mockup Dash Line Patterns */}
        <svg className="absolute top-0 right-10 w-24 h-32 pointer-events-none opacity-40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 0 Q 10 60 70 40 Q 90 30 100 40" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" fill="none"/>
        </svg>

        {/* Dynamic Header */}
        <div className="px-6 md:px-0 pt-16 md:pt-0 pb-6 md:pb-8 flex items-center justify-between z-10 sticky top-0 md:relative bg-white/90 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-b border-slate-50 md:border-none">
           <div className="flex items-center gap-3">
             {step !== 'success' && (
               <button onClick={() => {
                 if (step === 'cliente') navigate(-1);
                 else if (step === 'productos') setStep('cliente');
                 else if (step === 'entrega') setStep('productos');
               }} className="p-2 -ml-2 text-slate-400 hover:text-brand-blue md:hidden">
                 <ArrowLeft size={24} />
               </button>
             )}
             <h2 className="font-black text-xl md:text-2xl text-slate-800 tracking-tight uppercase tracking-widest leading-none">Registrar Pedido</h2>
           </div>
        </div>

        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide z-10">
          {step === 'cliente' && renderClienteStep()}
          {step === 'productos' && renderProductosStep()}
          {step === 'entrega' && renderEntregaStep()}
          {step === 'success' && renderSuccess()}
        </main>

        <svg className="absolute bottom-10 right-6 w-2 h-40 pointer-events-none opacity-20" viewBox="0 0 10 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="5" y1="0" x2="5" y2="100" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" />
        </svg>

      </div>
    </div>
  );
}
