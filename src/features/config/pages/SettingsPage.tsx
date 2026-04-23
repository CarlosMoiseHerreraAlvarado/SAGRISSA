import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/hooks/useAuth';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-gradient-primary text-white pt-6 pb-16 px-5 clip-bottom-curve shadow-smooth-md">
        <div className="flex items-center gap-4">
          <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors" onClick={() => navigate('/app/home')}>
            <ArrowLeft size={24} className="text-white" />
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
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-smooth-sm">
          <p className="font-bold text-sm text-slate-800 mb-4">Cambiar modo de ingresar</p>
          
          <div className="py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors rounded-t-lg px-2 -mx-2">
            <span className="text-sm text-primary font-bold">Ingresar con huella</span>
          </div>
          <div className="pt-4 pb-1 cursor-pointer hover:bg-slate-50 transition-colors rounded-b-lg px-2 -mx-2">
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
