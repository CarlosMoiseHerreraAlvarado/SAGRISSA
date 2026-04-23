import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Shield, LogOut, ChevronRight, User, Globe } from 'lucide-react';
import { Card } from '../../../core/ui/Card';
import { Skeleton } from '../../../core/ui/Skeleton';
import { useAuth } from '../../../core/hooks/useAuth';

interface SettingsItemProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick?: () => void;
  loading?: boolean;
}

function SettingsItem({ icon: Icon, label, description, onClick, loading }: SettingsItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/50 transition-all"
    >
      <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
        <Icon size={20} className="text-brand-blue" />
      </div>
      <div className="flex-1 text-left">
        {loading ? (
          <Skeleton width={100} height={14} />
        ) : (
          <>
            <p className="text-[14px] font-bold text-slate-800">{label}</p>
            {description && (
              <p className="text-[11px] text-slate-400">{description}</p>
            )}
          </>
        )}
      </div>
      <ChevronRight size={18} className="text-slate-300" />
    </button>
  );
}

export default function SettingsCliente() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-full min-h-screen flex justify-center bg-white md:bg-transparent pb-20 md:pb-0">
      <div className="w-full h-full xl:max-w-6xl flex flex-col relative md:pt-4 md:px-8">
        {/* Header */}
        <div className="md:bg-transparent bg-white border-b border-slate-100 md:border-none p-6 md:px-0 md:pt-0 md:pb-8 flex items-center gap-3 sticky top-0 md:relative z-30 md:shadow-none">
          <button
            className="p-2 -ml-2 text-slate-400 hover:text-brand-blue transition-colors md:hidden"
            onClick={() => navigate('/app/cliente/home')}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Configuración</h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-24 scrollbar-hide">
          <div className="flex flex-col gap-6">

            {/* Profile Card */}
            <Card padding="lg">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-blue flex items-center justify-center shadow-md">
                  <span className="text-white font-black text-xl">
                    {user?.name?.charAt(0) ?? 'C'}
                  </span>
                </div>
                <div>
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton width={140} height={16} />
                      <Skeleton width={80} height={12} />
                    </div>
                  ) : (
                    <>
                      <p className="text-[15px] font-black text-slate-800">{user?.name}</p>
                      <p className="text-[12px] text-brand-blue font-medium">{user?.email}</p>
                      <p className="text-[11px] text-slate-400 uppercase font-bold mt-1">
                        {user?.role}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Notifications */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                Preferencias
              </h3>
<Card padding="sm">
                <div className="flex flex-col gap-2">
                  <SettingsItem
                    icon={Bell}
                    label="Notificaciones"
                    description="Alertas de facturas y pedidos"
                    loading={loading}
                  />
                  <SettingsItem
                    icon={Shield}
                    label="Seguridad"
                    description="Cambiar contraseña y PIN"
                    loading={loading}
                  />
                  <SettingsItem
                    icon={Globe}
                    label="Idioma"
                    description="Español"
                    loading={loading}
                  />
                </div>
              </Card>
            </div>

            {/* Account */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                Cuenta
              </h3>
              <Card padding="sm">
                <div className="flex flex-col gap-2">
                  <SettingsItem
                    icon={User}
                    label="Datos Personales"
                    loading={loading}
                  />
                  <SettingsItem
                    icon={User}
                    label="Direcciones de Entrega"
                    loading={loading}
                  />
                </div>
              </Card>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 hover:bg-red-100 transition-all mt-4"
            >
              <LogOut size={20} />
              <span className="text-[14px] font-bold">Cerrar Sesión</span>
            </button>

            {/* Version */}
            <p className="text-center text-[11px] text-slate-300 mt-4">
              SAGRISA v1.0.0
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
