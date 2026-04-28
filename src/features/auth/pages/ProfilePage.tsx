import { useState, useEffect } from 'react';
import { User, Mail, Shield, Smartphone, Bell, Moon, LogOut, ChevronRight, Briefcase, CheckCircle2, MapPin } from 'lucide-react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { useAuth } from '../../../core/hooks/useAuth';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [success, setSuccess] = useState(false);
  
  // Persistencia real vía LocalStorage (Simulando persistencia en Dynamics 365)
  const [preferences, setPreferences] = useState({
    notifications: true,
    darkMode: false,
    offlineSync: true,
    biometrics: false
  });

  useEffect(() => {
    const saved = localStorage.getItem('sagrissa_prefs');
    if (saved) setPreferences(JSON.parse(saved));
  }, []);

  const togglePreference = async (key: keyof typeof preferences) => {
    const isActivating = !preferences[key];
    const newPrefs = { ...preferences, [key]: isActivating };
    
    if (key === 'notifications' && isActivating) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('SAGRISA', {
            body: '¡Notificaciones activadas exitosamente! Recibirás alertas importantes aquí.',
            icon: '/vite.svg'
          });
        } else {
          newPrefs.notifications = false; // Revert if denied
        }
      } else {
        alert('Tu navegador no soporta notificaciones web.');
      }
    }

    setPreferences(newPrefs);
    localStorage.setItem('sagrissa_prefs', JSON.stringify(newPrefs));
    
    // Feedback de persistencia
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <MobilePage>
      <header className="px-6 md:px-0 pt-16 md:pt-0 pb-8 flex flex-col gap-1 z-10 relative">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Mi Perfil</h1>
        <p className="text-[12px] font-bold text-brand-blue uppercase tracking-[0.2em]">Configuración de Usuario</p>
      </header>

      <div className="flex flex-col gap-8 px-6 md:px-0 z-10 relative pb-32">
        
        {/* User Card */}
        <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm flex flex-col items-center text-center">
           <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-brand-blue border-4 border-slate-50 shadow-inner mb-4">
              <User size={48} />
           </div>
           <h3 className="text-xl font-black text-slate-800">{user?.name}</h3>
           <span className="px-4 py-1 bg-brand-blue/10 text-brand-blue text-[10px] font-black uppercase tracking-widest rounded-full mt-2">
              {user?.role}
           </span>

           <div className="grid grid-cols-2 gap-4 w-full mt-8 pt-8 border-t border-slate-50">
              <div className="flex flex-col items-center">
                 <Mail size={16} className="text-slate-300 mb-1" />
                 <span className="text-[11px] font-bold text-slate-400 truncate w-full px-2">{user?.email || 'vendedor@sagrissa.com'}</span>
              </div>
              <div className="flex flex-col items-center">
                 <Briefcase size={16} className="text-slate-300 mb-1" />
                 <span className="text-[11px] font-bold text-slate-400">{user?.department || 'Comercial'}</span>
              </div>
           </div>

           <div className="w-full mt-4 pt-4 border-t border-slate-50 flex justify-center">
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Última conexión: Hoy, 08:30 AM
             </div>
           </div>
        </div>

        {/* Persistence Feedback Toast (Subtle) */}
        {success && (
           <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mx-auto animate-in fade-in zoom-in duration-300">
              <CheckCircle2 size={14} /> Cambios Guardados Localmente
           </div>
        )}

        {/* Settings Groups */}
        <div className="flex flex-col gap-4">
           <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-wider px-2">Preferencias del Sistema</h4>
           <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">
              
              <button onClick={() => togglePreference('notifications')} className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${preferences.notifications ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-50 text-slate-300'}`}>
                     <Bell size={20} />
                  </div>
                  <div className="text-left">
                     <p className="text-[14px] font-black text-slate-800">Notificaciones Push</p>
                     <p className="text-[11px] font-medium text-slate-400">Alertas de pedidos y cobros</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${preferences.notifications ? 'bg-brand-blue' : 'bg-slate-200'}`}>
                   <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences.notifications ? 'left-6' : 'left-1'}`} />
                </div>
              </button>

              <button onClick={() => togglePreference('darkMode')} className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${preferences.darkMode ? 'bg-slate-800 text-amber-400' : 'bg-slate-50 text-slate-300'}`}>
                     <Moon size={20} />
                  </div>
                  <div className="text-left">
                     <p className="text-[14px] font-black text-slate-800">Modo Oscuro</p>
                     <p className="text-[11px] font-medium text-slate-400">Reducir fatiga visual</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${preferences.darkMode ? 'bg-brand-blue' : 'bg-slate-200'}`}>
                   <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences.darkMode ? 'left-6' : 'left-1'}`} />
                </div>
              </button>

              <button onClick={() => togglePreference('offlineSync')} className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${preferences.offlineSync ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                     <Smartphone size={20} />
                  </div>
                  <div className="text-left">
                     <p className="text-[14px] font-black text-slate-800">Sincronización Offline</p>
                     <p className="text-[11px] font-medium text-slate-400">Persistencia local de datos</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${preferences.offlineSync ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                   <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences.offlineSync ? 'left-6' : 'left-1'}`} />
                </div>
              </button>

              <button onClick={() => togglePreference('biometrics')} className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${preferences.biometrics ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-50 text-slate-300'}`}>
                     <Shield size={20} />
                  </div>
                  <div className="text-left">
                     <p className="text-[14px] font-black text-slate-800">Acceso Biométrico</p>
                     <p className="text-[11px] font-medium text-slate-400">Face ID / Huella Digital</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${preferences.biometrics ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                   <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences.biometrics ? 'left-6' : 'left-1'}`} />
                </div>
              </button>

           </div>
        </div>

        {/* Effective Permissions (Claims) */}
        <div className="flex flex-col gap-4">
           <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-wider px-2">Capacidades Efectivas (Claims)</h4>
           <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm flex flex-col gap-4">
             <div className="flex flex-wrap gap-2">
               {user?.claims?.map(claim => (
                 <span key={claim} className="px-3 py-1.5 bg-brand-blue/10 text-brand-blue border border-brand-blue/20 rounded-lg text-[11px] font-bold tracking-wide">
                   {claim}
                 </span>
               )) || <span className="text-slate-400 text-sm">Sin capacidades especiales</span>}
             </div>
             
             <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-black text-slate-800">Acceso Offline Habilitado</p>
                  <p className="text-[11px] font-medium text-slate-400">Permite ingreso sin internet</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user?.isOfflineCapable ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                  {user?.isOfflineCapable ? 'Habilitado' : 'Bloqueado'}
                </div>
             </div>
           </div>
        </div>

        {/* System Diagnostics (PWA Integration Visibility) */}
        <div className="flex flex-col gap-4">
           <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-wider px-2">Diagnóstico de Sistema</h4>
           <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="flex flex-col gap-6 relative z-10">
                 <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Estado GPS</span>
                       <span className="text-sm font-black text-emerald-400 flex items-center gap-2">
                          <MapPin size={14} /> Activo y Calibrado
                       </span>
                    </div>
                    <div className="flex flex-col text-right">
                       <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Cola de Sinc.</span>
                       <span className="text-sm font-black text-white">0 Pendientes</span>
                    </div>
                 </div>
                 
                 <div className="h-px bg-white/10 w-full" />

                 <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Última Sincronización</span>
                    <span className="text-[13px] font-medium text-white/80 italic">
                       "Catálogo actualizado hace 12 minutos via Wi-Fi"
                    </span>
                 </div>
              </div>
              {/* Abstract pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 rounded-full blur-3xl -mr-16 -mt-16" />
           </div>
        </div>

        {/* Security / Additional Actions */}
        <div className="flex flex-col gap-3">
           <button className="w-full flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[32px] hover:border-brand-blue/30 transition-all">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                    <Shield size={20} />
                 </div>
                 <span className="text-[14px] font-black text-slate-800">Seguridad y Acceso</span>
              </div>
              <ChevronRight size={18} className="text-slate-200" />
           </button>
           
           <button 
             onClick={logout}
             className="w-full py-5 bg-red-50 border border-red-100 text-red-600 rounded-[32px] font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all shadow-sm mt-4"
           >
             <LogOut size={20} /> Cerrar Sesión
           </button>
        </div>

      </div>

      {/* Decor */}
      <svg className="absolute bottom-[5%] right-6 w-2 h-40 pointer-events-none opacity-20" viewBox="0 0 10 100" fill="none">
        <line x1="5" y1="0" x2="5" y2="100" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" />
      </svg>
    </MobilePage>
  );
}
