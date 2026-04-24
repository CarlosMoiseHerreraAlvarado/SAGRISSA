import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageSearch, Users, Landmark, FileText, Activity, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '../../../core/hooks/useAuth';
import { Skeleton } from '../../../core/ui/Skeleton';
import { getGeoLocation } from '../../../core/utils/geolocation';

export default function DashboardVendedor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleGetLocation = async () => {
    setGeoLoading(true);
    setGeoError(null);
    try {
      const pos = await getGeoLocation();
      setLocation({ lat: pos.latitude, lng: pos.longitude });
    } catch (err) {
      setGeoError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setGeoLoading(false);
    }
  };

  const menuItems = [
    { id: 'cat', icon: PackageSearch, label: 'Catálogo Rápido', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', path: '/app/catalogo' },
    { id: 'new', icon: FileText, label: 'Registrar Pedido', color: 'bg-blue-50 text-blue-600 border-blue-100', path: '/app/pedidos/nuevo' },
    { id: 'cli', icon: Users, label: 'Mis Clientes', color: 'bg-orange-50 text-orange-600 border-orange-100', path: '/app/clientes' },
    { id: 'cob', icon: Landmark, label: 'Hacer Cobro', color: 'bg-purple-50 text-purple-600 border-purple-100', path: '/app/cobros' },
  ];

  return (
    <div className="w-full min-h-screen flex justify-center pb-20 md:pb-0 bg-white md:bg-transparent">
      
      <div className="w-full xl:max-w-6xl flex flex-col relative md:pt-4 md:px-8">
        
        {/* Pattern Background strictly following Login/Home mockup */}
        <svg className="absolute top-0 right-10 w-24 h-32 pointer-events-none opacity-40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 0 Q 10 60 70 40 Q 90 30 100 40" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" fill="none"/>
        </svg>

        {/* ─── Header (Oculto en Desktop) ─── */}
        <div className="px-8 pt-16 pb-8 z-10 md:hidden">
          <h2 className="text-[#00A9F4] font-bold text-[11px] uppercase tracking-[0.2em] mb-1">Vendedor Principal</h2>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Hola, {user?.name.split(' ')[0]}</h1>
        </div>

        {/* ─── Scrollable Content ─── */}
        <div className="flex-1 overflow-y-auto px-6 md:px-0 pb-24 scrollbar-hide z-10">
          
          <div className="flex flex-col gap-8 md:gap-10">

            {/* Metas Card - Solid Style, no gradients */}
            <div className="bg-[#00A9F4] rounded-[32px] p-6 text-white shadow-lg relative overflow-hidden">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Activity size={20} />
                 </div>
                 <span className="font-black text-[15px] tracking-tight">Rendimiento Mensual</span>
               </div>

               <div className="grid grid-cols-2 gap-6">
                 <div>
                   <p className="text-[10px] font-bold text-white/60 mb-2 uppercase tracking-wider">Ventas</p>
                   {loading ? <Skeleton className="h-6 w-20 bg-white/20" /> : <p className="text-xl font-black">$45,200</p>}
                   <div className="w-full h-1.5 bg-black/10 rounded-full mt-3 overflow-hidden">
                     <div className="h-full bg-white rounded-full" style={{ width: '90%' }} />
                   </div>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-white/60 mb-2 uppercase tracking-wider">Cobros</p>
                   {loading ? <Skeleton className="h-6 w-20 bg-white/20" /> : <p className="text-xl font-black">$22,800</p>}
                   <div className="w-full h-1.5 bg-black/10 rounded-full mt-3 overflow-hidden">
                     <div className="h-full bg-white rounded-full" style={{ width: '75%' }} />
                   </div>
                 </div>
               </div>
            </div>

            {/* Geolocalización */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider px-2">Ubicación</h3>
              <div className="bg-white border border-slate-100 rounded-[32px] p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${location ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                      {geoLoading ? <Loader2 size={24} className="animate-spin" /> : <MapPin size={24} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-slate-800">
                        {location ? 'Ubicación Actual' : 'Sin ubicación'}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {geoError ? geoError : location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Presiona para obtener tu ubicación'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleGetLocation}
                    disabled={geoLoading}
                    className="bg-brand-blue text-white px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-brand-dark transition-all disabled:opacity-50"
                  >
                    {geoLoading ? 'Obteniendo...' : location ? 'Actualizar' : 'Obtener'}
                  </button>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider px-2">Operaciones</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {menuItems.map((item) => (
                   <button 
                     key={item.id} 
                     onClick={() => navigate(item.path)}
                     className="bg-white border border-slate-100 p-5 rounded-[28px] shadow-sm flex flex-col gap-4 hover:border-brand-blue/30 transition-all text-left"
                   >
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color} border`}>
                       <item.icon size={24} />
                     </div>
                     <span className="text-[13px] font-bold text-slate-700 leading-tight">
                       {item.label}
                     </span>
                   </button>
                ))}
              </div>
            </div>

            {/* Últimos Pedidos */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider px-2">Actividad Reciente</h3>
              <div className="bg-white border border-slate-100 rounded-[32px] p-5 shadow-sm space-y-4">
                {loading ? (
                   Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
                ) : (
                  <>
                    <div className="flex items-center justify-between group cursor-pointer" onClick={() => navigate('/app/pedidos')}>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-800">Luis Armando S.</span>
                        <span className="text-[10px] font-medium text-slate-400">ORD-99020 · Hace 2h</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#00A9F4]" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase">Borrador</span>
                      </div>
                    </div>
                    <div className="w-full h-px bg-slate-50" />
                    <div className="flex items-center justify-between group cursor-pointer" onClick={() => navigate('/app/pedidos')}>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-800">Andrea Montoya</span>
                        <span className="text-[10px] font-medium text-slate-400">ORD-99018 · Ayer</span>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-700 uppercase">Enviado</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Decorative Vertical Dash Line */}
        <svg className="absolute bottom-[10%] right-6 w-2 h-40 pointer-events-none opacity-20" viewBox="0 0 10 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="5" y1="0" x2="5" y2="100" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" />
        </svg>

      </div>

    </div>
  );
}