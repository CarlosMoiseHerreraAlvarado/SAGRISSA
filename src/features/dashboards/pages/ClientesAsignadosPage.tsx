import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, User, MapPin, Phone, ChevronRight, FileText } from 'lucide-react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { Skeleton } from '../../../core/ui/Skeleton';

export default function ClientesAsignadosPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const clientes = [
    { id: '1', name: 'Agropecuaria El Sol', zone: 'Zona Centro', balance: '$2,450.00', address: 'San Salvador, El Salvador' },
    { id: '2', name: 'Distribuidora X', zone: 'Zona Occidente', balance: '$0.00', address: 'Santa Ana, El Salvador' },
    { id: '3', name: 'Ferretería Central', zone: 'Zona Centro', balance: '$8,400.00', address: 'San Salvador, El Salvador' },
    { id: '4', name: 'Luis Armando S.', zone: 'Zona Oriente', balance: '$120.00', address: 'San Miguel, El Salvador' },
  ];

  const filtered = clientes.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <MobilePage>
      <header className="px-6 md:px-0 pt-16 md:pt-0 pb-6 flex items-center gap-4 z-10 relative">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-brand-blue transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Mis Clientes</h1>
          <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Cartera Asignada</p>
        </div>
      </header>

      <div className="px-6 md:px-0 z-10 relative mb-6">
        <div className="flex items-center bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-brand-blue/15 transition-all">
          <Search size={18} className="text-slate-300 mr-2" />
          <input 
            type="text" 
            placeholder="Buscar cliente..." 
            className="w-full text-sm font-medium text-slate-700 outline-none placeholder:text-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 px-6 md:px-0 z-10 relative pb-24">
        {loading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-[32px]" />)
        ) : (
          filtered.map((cliente) => (
            <div 
              key={cliente.id} 
              className="bg-white border border-slate-50 p-6 rounded-[32px] shadow-sm hover:border-brand-blue/30 transition-all group cursor-pointer"
              onClick={() => navigate(`/app/pedidos/nuevo?clienteId=${cliente.id}`)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-colors">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-[15px]">{cliente.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <MapPin size={10} /> {cliente.zone}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-black text-slate-700">{cliente.balance}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Saldo Actual</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                 <div className="flex gap-2">
                    <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-brand-blue">
                       <Phone size={14} />
                    </button>
                    <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-brand-blue">
                       <FileText size={14} />
                    </button>
                 </div>
                 <button className="text-[10px] font-black text-brand-blue uppercase flex items-center gap-1">
                    Nuevo Pedido <ChevronRight size={12} />
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      <svg className="absolute bottom-[5%] right-6 w-2 h-40 pointer-events-none opacity-20" viewBox="0 0 10 100" fill="none">
        <line x1="5" y1="0" x2="5" y2="100" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" />
      </svg>
    </MobilePage>
  );
}
