import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint } from 'lucide-react';
import { useAuth } from '../../../core/hooks/useAuth';
import type { Role } from '../../../types';

/**
 * DUIs de prueba (solo ambiente local de desarrollo).
 */
const DEV_USERS: Record<string, { id: string; name: string; role: Role; to: string; claims: string[]; isOfflineCapable: boolean }> = {
  '05678945-8': { id: 'c1', name: 'Andrea Montoya', role: 'cliente',  to: '/app/cliente/home', claims: ['view:account', 'view:orders'], isOfflineCapable: false },
  '02888123-1': { id: 'v1', name: 'Luis Navarro',   role: 'vendedor', to: '/app/vendedor/home', claims: ['view:dashboard_operativo', 'action:create_order', 'action:register_payment', 'view:facturas'], isOfflineCapable: true },
  '03999234-2': { id: 's1', name: 'Carlos Ruíz',    role: 'supervisor', to: '/app/supervisor/home', claims: ['view:dashboard_operativo', 'view:team_metrics', 'action:approve_operations', 'view:facturas'], isOfflineCapable: true },
  '04777345-3': { id: 'g1', name: 'Roberto Sosa',   role: 'gerente',   to: '/app/gerente/home', claims: ['view:dashboard_estrategico', 'action:approve_operations', 'view:metas_globales', 'view:facturas'], isOfflineCapable: false },
  '01666456-4': { id: 'd1', name: 'Elena Méndez',   role: 'director',  to: '/app/director/home', claims: ['view:dashboard_estrategico', 'view:metas_globales', 'view:analytics_avanzado', 'view:facturas'], isOfflineCapable: false },
};


export default function LoginPage() {
  const [step, setStep] = useState<'dui' | 'pin'>('dui');
  const [dui, setDui] = useState('');
  const [pin, setPin] = useState('');
  const [showBiometric, setShowBiometric] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const matchedUser = DEV_USERS[dui];

  const handleAction = () => {
    if (step === 'dui' && dui.length > 5) {
      setStep('pin');
    } else if (step === 'pin' && pin.length >= 4) {
      const u = matchedUser ?? DEV_USERS['05678945-8']; // Fallback for unmatched
      login({ id: u.id, name: u.name, dui: dui || '05678945-8', role: u.role, claims: u.claims, isOfflineCapable: u.isOfflineCapable }, 'apim-token-xyz');
      navigate(u.to);
    }
  };

  const handleBiometric = () => {
    setShowBiometric(true);
    setTimeout(() => {
      const u = matchedUser ?? DEV_USERS['05678945-8'];
      login({ id: u.id, name: u.name, dui: dui || '05678945-8', role: u.role, claims: u.claims, isOfflineCapable: u.isOfflineCapable }, 'apim-token-xyz');
      navigate(u.to);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#f3f6f9] flex items-center justify-center p-0 md:p-6">
      
      {/* Contenedor tipo Web App Card (Full en Móvil, Card en PC) */}
      <div className="w-full h-screen md:h-auto md:min-h-[700px] md:max-w-md bg-white md:rounded-[40px] md:shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Decoraciones SVG (Replicadas del Mockup) */}
        {/* Superior derecho */}
        <svg className="absolute top-0 right-10 w-24 h-32 pointer-events-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 0 Q 10 60 70 40 Q 90 30 100 40" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" fill="none"/>
        </svg>

        {/* Inferior Izquierdo */}
        <svg className="absolute top-[60%] left-[-20px] w-24 h-24 pointer-events-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 50 Q 50 20 80 80" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" fill="none"/>
        </svg>

        {/* Inferior Derecho */}
        <svg className="absolute bottom-[20%] right-6 w-2 h-40 pointer-events-none" viewBox="0 0 10 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="5" y1="0" x2="5" y2="100" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" />
        </svg>

        {/* ─── Contenido Principal ─── */}
        <div className="flex-1 px-8 pt-24 z-10 flex flex-col">
          
          <h1 className="text-[#00A9F4] font-logo font-black text-[28px] tracking-tight mb-8">SAGRISA</h1>

          <div className="mb-8">
            <h2 className="text-[#1a1a1a] font-black text-xl mb-1">¡Bienvenido/a!</h2>
            <p className="text-slate-600 text-[13px] font-medium leading-relaxed max-w-[250px]">
              Para iniciar, escriba su nombre y número de DUI
            </p>
          </div>

          <div className="mb-6">
            <input
              type={step === 'dui' ? 'text' : 'password'}
              autoFocus
              value={step === 'dui' ? dui : pin}
              onChange={(e) => step === 'dui' ? setDui(e.target.value) : setPin(e.target.value)}
              placeholder={step === 'dui' ? 'Escriba su DUI' : 'Escriba su PIN'}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:border-[#00A9F4] text-slate-800 text-sm font-medium outline-none transition-colors"
              onKeyDown={e => e.key === 'Enter' && handleAction()}
            />
          </div>

          <button
            onClick={handleAction}
            className="w-full bg-[#00A9F4] text-white font-bold py-3.5 rounded-xl transition-all hover:bg-[#0095D8] active:scale-[0.98]"
          >
            Iniciar
          </button>

          {/* Biometría (Idéntico a Capturas 3 y 4) */}
          {step === 'pin' && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-[13px] font-bold text-[#1a1a1a]">Iniciar con huella digital</p>
              <button onClick={handleBiometric} className="active:scale-95 transition-transform p-1">
                <Fingerprint size={42} className="text-[#888888]" strokeWidth={1} />
              </button>
            </div>
          )}

          {/* Dev Hints - Expanded for all roles */}
          {step === 'dui' && (
             <div className="mt-auto pb-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Acceso Rápido (Dev)</p>
                <div className="grid grid-cols-2 gap-2">
                   <button className="text-center bg-white border border-slate-200 py-2 rounded-lg text-[10px] font-bold text-[#00A9F4] hover:bg-brand-blue/5" onClick={() => setDui('05678945-8')}>Cliente</button>
                   <button className="text-center bg-white border border-slate-200 py-2 rounded-lg text-[10px] font-bold text-[#00A9F4] hover:bg-brand-blue/5" onClick={() => setDui('02888123-1')}>Vendedor</button>
                   <button className="text-center bg-white border border-slate-200 py-2 rounded-lg text-[10px] font-bold text-[#00A9F4] hover:bg-brand-blue/5" onClick={() => setDui('03999234-2')}>Supervisor</button>
                   <button className="text-center bg-white border border-slate-200 py-2 rounded-lg text-[10px] font-bold text-[#00A9F4] hover:bg-brand-blue/5" onClick={() => setDui('04777345-3')}>Gerente</button>
                   <button className="col-span-2 text-center bg-white border border-slate-200 py-2 rounded-lg text-[10px] font-bold text-[#00A9F4] hover:bg-brand-blue/5" onClick={() => setDui('01666456-4')}>Director</button>
                </div>
             </div>
          )}


        </div>

        {/* ─── Modal Biométrico (Captura 5) ─── */}
        {showBiometric && (
          <div className="absolute inset-0 bg-[#2b2b2b] z-50 flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
             
             <div className="w-full bg-[#363636]/0 flex flex-col items-center">
               <div className="w-24 h-24 bg-[#3d3d3d] rounded-full flex items-center justify-center mb-10 shadow-inner">
                  {/* Fingerprint abstract inside dark circle */}
               </div>
               
               <h3 className="text-white font-bold text-[18px] mb-2 text-center">Uso de huella digital</h3>
               <p className="text-[#a0a0a0] text-[13px] text-center mb-10 px-2 leading-relaxed">
                 Use su huella digital para ingresar a la plataforma.
               </p>

               {/* Simulated Input field for biometric */}
               <div className="w-full relative mb-8">
                 <div className="absolute -top-2 left-6 px-1 bg-[#2b2b2b] text-[10px] text-[#888] font-bold">Ingresar DUI</div>
                 <div className="w-full h-14 border border-[#444] rounded-xl flex items-center px-4 justify-between bg-[#2d2d2d]">
                    <span className="text-[#666] text-xl tracking-widest pl-2 font-mono">|</span>
                    <Fingerprint size={28} className="text-[#666]" strokeWidth={1} />
                 </div>
               </div>

               <button 
                 className="w-full bg-[#3d3d3d] text-[#666] font-bold py-3.5 rounded-xl cursor-not-allowed"
                 onClick={() => setShowBiometric(false)}
               >
                 Iniciar
               </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
