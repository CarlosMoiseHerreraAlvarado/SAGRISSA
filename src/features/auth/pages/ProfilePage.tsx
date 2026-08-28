import { useState } from 'react';
import { User, Mail, Shield, Smartphone, Bell, Moon, LogOut, Briefcase, CheckCircle2, MapPin } from 'lucide-react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { useAuth } from '../../../core/hooks/useAuth';
import { useTheme } from '../../../core/context/ThemeContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [success, setSuccess] = useState(false);
  
  const [preferences, setPreferences] = useState(() => {
    const defaults = { notifications: true, offlineSync: true, biometrics: false };
    const saved = localStorage.getItem('sagrissa_other_prefs');
    if (!saved) return defaults;
    try { return { ...defaults, ...JSON.parse(saved) as Partial<typeof defaults> }; } catch { return defaults; }
  });

  const togglePreference = async (key: keyof typeof preferences) => {
    const isActivating = !preferences[key];
    const newPrefs = { ...preferences, [key]: isActivating };
    
    if (key === 'notifications' && isActivating) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('SAGRISA', {
            body: '¡Notificaciones activadas exitosamente! Recibirás alertas importantes aquí.',
            icon: '/icons/icon-192.svg'
          });
        } else {
          newPrefs.notifications = false;
        }
      } else {
        alert('Tu navegador no soporta notificaciones web.');
      }
    }

    setPreferences(newPrefs);
    localStorage.setItem('sagrissa_other_prefs', JSON.stringify(newPrefs));
    
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleDarkToggle = () => {
    toggleTheme();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <MobilePage>
      <header className="px-6 md:px-0 pt-16 md:pt-0 pb-8 flex flex-col gap-1 z-10 relative">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">Mi Perfil</h1>
        <p className="text-[12px] font-bold text-brand-blue uppercase tracking-[0.2em]">Configuración de Usuario</p>
      </header>

      <div className="flex flex-col gap-8 px-6 md:px-0 z-10 relative pb-32">
        
        {/* User Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] p-8 shadow-sm flex flex-col items-center text-center transition-colors">
           <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-brand-blue border-4 border-slate-50 dark:border-slate-700 shadow-inner mb-4">
              <User size={48} />
           </div>
           <h3 className="text-xl font-black text-slate-800 dark:text-white">{user?.name}</h3>
           <span className="px-4 py-1 bg-brand-blue/10 text-brand-blue text-[10px] font-black uppercase tracking-widest rounded-full mt-2">
              {user?.role}
           </span>

           <div className="grid grid-cols-2 gap-4 w-full mt-8 pt-8 border-t border-slate-50 dark:border-slate-800">
              <div className="flex flex-col items-center">
                 <Mail size={16} className="text-slate-300 dark:text-slate-600 mb-1" />
                 <span className="text-[11px] font-bold text-slate-400 truncate w-full px-2">{user?.email || 'usuario@sagrissa.com'}</span>
              </div>
              <div className="flex flex-col items-center">
                 <Briefcase size={16} className="text-slate-300 dark:text-slate-600 mb-1" />
                 <span className="text-[11px] font-bold text-slate-400">{user?.department || 'Comercial'}</span>
              </div>
           </div>

           <div className="w-full mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-center">
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                DUI: {user?.dui || 'N/A'} · Conectado
             </div>
           </div>
        </div>

        {/* Persistence Feedback Toast (Subtle) */}
        {success && (
           <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mx-auto animate-in fade-in zoom-in duration-300">
              <CheckCircle2 size={14} /> Preferencias Actualizadas
           </div>
        )}

        {/* Settings Groups */}
        <div className="flex flex-col gap-4">
           <h4 className="text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider px-2">Preferencias del Sistema</h4>
           <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] overflow-hidden shadow-sm transition-colors">
              
              {/* Dark Mode Toggle */}
              <button 
                type="button"
                onClick={handleDarkToggle} 
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-amber-400/10 text-amber-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                     <Moon size={20} />
                  </div>
                  <div className="text-left">
                     <p className="text-[14px] font-black text-slate-800 dark:text-white">Modo Oscuro</p>
                     <p className="text-[11px] font-medium text-slate-400">{isDark ? 'Tema oscuro activo' : 'Reducir fatiga visual'}</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${isDark ? 'bg-brand-blue' : 'bg-slate-200 dark:bg-slate-700'}`}>
                   <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDark ? 'left-6' : 'left-1'}`} />
                </div>
              </button>

              {/* Push Notifications */}
              <button 
                type="button"
                onClick={() => togglePreference('notifications')} 
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${preferences.notifications ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                     <Bell size={20} />
                  </div>
                  <div className="text-left">
                     <p className="text-[14px] font-black text-slate-800 dark:text-white">Notificaciones Push</p>
                     <p className="text-[11px] font-medium text-slate-400">Alertas de pedidos y aprobaciones</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${preferences.notifications ? 'bg-brand-blue' : 'bg-slate-200 dark:bg-slate-700'}`}>
                   <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences.notifications ? 'left-6' : 'left-1'}`} />
                </div>
              </button>

              {/* Offline Sync */}
              <button 
                type="button"
                onClick={() => togglePreference('offlineSync')} 
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${preferences.offlineSync ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                     <Smartphone size={20} />
                  </div>
                  <div className="text-left">
                     <p className="text-[14px] font-black text-slate-800 dark:text-white">Sincronización Offline PWA</p>
                     <p className="text-[11px] font-medium text-slate-400">Persistencia local de datos</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${preferences.offlineSync ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                   <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences.offlineSync ? 'left-6' : 'left-1'}`} />
                </div>
              </button>

              {/* Biometrics */}
              <button 
                type="button"
                onClick={() => togglePreference('biometrics')} 
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${preferences.biometrics ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 dark:text-indigo-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                     <Shield size={20} />
                  </div>
                  <div className="text-left">
                     <p className="text-[14px] font-black text-slate-800 dark:text-white">Acceso Biométrico / Huella</p>
                     <p className="text-[11px] font-medium text-slate-400">Fingerprint / PIN Rápido</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${preferences.biometrics ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                   <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences.biometrics ? 'left-6' : 'left-1'}`} />
                </div>
              </button>

           </div>
        </div>

        {/* Effective Permissions (Claims) */}
        <div className="flex flex-col gap-4">
           <h4 className="text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider px-2">Capacidades Efectivas (Claims)</h4>
           <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] p-8 shadow-sm flex flex-col gap-4 transition-colors">
             <div className="flex flex-wrap gap-2">
               {user?.claims?.map(claim => (
                 <span key={claim} className="px-3 py-1.5 bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue border border-brand-blue/20 rounded-lg text-[11px] font-bold tracking-wide">
                   {claim}
                 </span>
               )) || <span className="text-slate-400 text-sm">Sin capacidades especiales</span>}
             </div>
             
             <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-black text-slate-800 dark:text-white">Acceso Offline Habilitado</p>
                  <p className="text-[11px] font-medium text-slate-400">Permite operar sin conexión</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user?.isOfflineCapable ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/50 text-red-500'}`}>
                  {user?.isOfflineCapable ? 'Habilitado' : 'Bloqueado'}
                </div>
             </div>
           </div>
        </div>

        {/* System Diagnostics (PWA Integration Visibility) */}
        <div className="flex flex-col gap-4">
           <h4 className="text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider px-2">Diagnóstico de Sistema PWA</h4>
           <div className="bg-slate-900 dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden">
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
                       "Catálogo sincronizado vía PWA Cache"
                    </span>
                 </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 rounded-full blur-3xl -mr-16 -mt-16" />
           </div>
        </div>

        {/* Security / Logout */}
        <div className="flex flex-col gap-3">
           <button 
             type="button"
             onClick={logout}
             className="w-full py-5 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-[32px] font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all shadow-sm mt-4"
           >
             <LogOut size={20} /> Cerrar Sesión
           </button>
        </div>

      </div>
    </MobilePage>
  );
}
