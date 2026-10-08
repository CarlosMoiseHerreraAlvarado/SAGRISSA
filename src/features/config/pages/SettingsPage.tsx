import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/hooks/useAuth';
import { useTheme } from '../../../core/context/useTheme';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-gradient-primary text-white pt-6 pb-16 px-5 clip-bottom-curve shadow-smooth-md">
        <div className="flex items-center gap-4">
          <button type="button" aria-label="Volver" className="min-h-11 min-w-11 rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20" onClick={() => navigate(-1)}>
            <ArrowLeft aria-hidden="true" size={24} className="mx-auto text-white" />
          </button>
          <h3 className="font-bold text-lg">Configuraciones</h3>
        </div>
      </div>

      <div className="px-5 -mt-8 relative z-10 flex flex-col gap-5 md:max-w-2xl md:mx-auto w-full">
        {/* Profile Card */}
        <div className="bg-primary-dark text-white p-6 rounded-2xl shadow-smooth-sm">
          <p className="text-sm font-bold opacity-90 capitalize mb-2">{user?.role || 'Cliente'}</p>
          <h4 className="font-black text-xl tracking-tight">{user?.name || 'Usuario Prueba'}</h4>
          <p className="text-sm opacity-80 mt-1 font-medium">DUI: {user?.dui || 'N/A'}</p>
        </div>

        {/* Options Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-smooth-sm">
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-4">Apariencia</h4>
          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            onClick={toggleTheme}
            className="flex min-h-14 w-full items-center justify-between rounded-xl px-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-brand-blue"
          >
            <span className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {isDark ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
              Modo oscuro
            </span>
            <span className={`relative h-6 w-11 rounded-full transition-colors ${isDark ? 'bg-brand-blue' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-smooth-sm">
          <p className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-4">Cambiar modo de ingresar</p>
          
          <div className="py-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-t-lg px-2 -mx-2">
            <span className="text-sm text-primary font-bold">Ingresar con huella</span>
          </div>
          <div className="pt-4 pb-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-b-lg px-2 -mx-2">
            <span className="text-sm text-primary font-bold">Ingresar con PIN</span>
          </div>
        </div>

        <button 
          className="mt-4 text-left font-bold text-sm text-primary py-3 hover:text-primary-dark transition-colors" 
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
