import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../core/hooks/useAuth';
import { fetchApi } from '../../../core/api/api.config';
import { ROLE_OFFLINE_CAPABILITIES, ROLE_PERMISSIONS } from '../../../core/auth/permissions';
import type { BackendLoginResponse, Role, User } from '../../../types';
import { trackEvent } from '../../../core/utils/appInsights';

const AUTH_LOGIN_PATH = import.meta.env.VITE_AUTH_LOGIN_PATH || '/auth/login';
type BackendLoginPayload = BackendLoginResponse & {
  user?: Partial<BackendLoginResponse>;
  expiresIn?: number;
};

type BackendLoginEnvelope = {
  success?: boolean;
  message?: string;
  data?: BackendLoginPayload;
};

const DEFAULT_ROUTES: Record<Role, string> = {
  vendedor: '/app/vendedor/home',
  supervisor: '/app/supervisor/home',
  gerente: '/app/gerente/home',
  director: '/app/director/home',
  cliente: '/app/cliente/home',
};

function normalizeRole(value: string): Role {
  const role = value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const aliases: Record<string, Role> = {
    cliente: 'cliente',
    customer: 'cliente',
    vendedor: 'vendedor',
    seller: 'vendedor',
    supervisor: 'supervisor',
    gerente: 'gerente',
    manager: 'gerente',
    admin: 'gerente',
    director: 'director',
    director_general: 'director',
  };

  const normalized = aliases[role];
  if (!normalized) throw new Error('El rol recibido no está habilitado para SAGRISA.');
  return normalized;
}

function normalizeLoginResponse(raw: BackendLoginEnvelope | BackendLoginResponse): BackendLoginResponse {
  const payload = ((raw as BackendLoginEnvelope).data ?? raw) as BackendLoginPayload;
  const nestedUser = payload.user;
  const token = payload.accessToken ?? payload.token ?? '';
  const expiresAt = payload.expiresAt ?? (payload.expiresIn
    ? new Date(Date.now() + payload.expiresIn * 1000).toISOString()
    : undefined);

  return {
    nombre: payload.nombre ?? nestedUser?.nombre ?? '',
    codVendedor: payload.codVendedor ?? nestedUser?.codVendedor ?? '',
    cargo: payload.cargo ?? nestedUser?.cargo ?? '',
    rol: payload.rol ?? nestedUser?.rol ?? '',
    token,
    accessToken: token,
    expiresAt,
    email: payload.email ?? nestedUser?.email,
    permissions: payload.permissions ?? nestedUser?.permissions,
    claims: payload.claims ?? nestedUser?.claims,
    scope: payload.scope ?? nestedUser?.scope,
    offlineCapabilities: payload.offlineCapabilities ?? nestedUser?.offlineCapabilities,
  };
}

function buildUser(response: BackendLoginResponse, dui: string): User {
  const role = normalizeRole(response.rol);
  const permissions = response.permissions?.length ? response.permissions : ROLE_PERMISSIONS[role];
  const offlineCapabilities = response.offlineCapabilities ?? ROLE_OFFLINE_CAPABILITIES[role];

  return {
    id: response.codVendedor,
    name: response.nombre,
    dui,
    role,
    email: response.email,
    department: response.cargo,
    claims: response.claims ?? [],
    permissions,
    scope: response.scope ?? {},
    offlineCapabilities,
    isOfflineCapable: offlineCapabilities.length > 0,
  };
}
function formatDui(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 9);
  return digits.length > 8 ? `${digits.slice(0, 8)}-${digits.slice(8)}` : digits;
}

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'dui' | 'pin'>('dui');
  const [dui, setDui] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slowLogin, setSlowLogin] = useState(false);

  useEffect(() => {
    if (user) navigate(DEFAULT_ROUTES[user.role], { replace: true });
  }, [navigate, user]);

  const fieldValue = step === 'dui' ? dui : pin;
  const fieldLabel = step === 'dui' ? 'DUI' : 'PIN';
  const isValid = useMemo(() => step === 'dui' ? /^\d{8}-\d$/.test(dui) : pin.trim().length >= 4, [dui, pin, step]);

  const handleLogin = async () => {
    const cleanDui = dui.trim();
    const cleanPin = pin.trim();
    if (!/^\d{8}-\d$/.test(cleanDui)) {
      setError('Escriba un DUI valido con el formato 00000000-0.');
      setStep('dui');
      return;
    }
    if (cleanPin.length < 4) {
      setError('Escriba un PIN de al menos 4 caracteres.');
      setStep('pin');
      return;
    }

    setLoading(true);
    setSlowLogin(false);
    setError('');
    const slowTimer = window.setTimeout(() => setSlowLogin(true), 1500);
    try {
      const rawResponse = await fetchApi<BackendLoginEnvelope | BackendLoginResponse>(AUTH_LOGIN_PATH, {
        method: 'POST',
        body: JSON.stringify({ dui: cleanDui, pin: cleanPin }),
        signal: AbortSignal.timeout(30000),
      });
      const response = normalizeLoginResponse(rawResponse);
      const nextUser = buildUser(response, cleanDui);
      login(nextUser, response.accessToken ?? response.token, response.expiresAt);
      trackEvent('auth.login.success', { role: nextUser.role });
      navigate(DEFAULT_ROUTES[nextUser.role], { replace: true });
    } catch (caught: unknown) {
      trackEvent('auth.login.failure', { reason: caught instanceof Error ? caught.message : 'unknown' });
      setError(caught instanceof DOMException && caught.name === 'TimeoutError'
        ? 'El servidor tardo demasiado en responder. Intente nuevamente en unos segundos.'
        : caught instanceof Error ? caught.message : 'No fue posible iniciar sesión.');
    } finally {
      window.clearTimeout(slowTimer);
      setLoading(false);
      setSlowLogin(false);
    }
  };

  const handleAction = () => {
    setError('');
    if (step === 'dui') {
      if (!isValid) {
        setError('Escriba un DUI válido para continuar.');
        return;
      }
      setStep('pin');
      return;
    }
    void handleLogin();
  };

  return (
    <main className="min-h-screen bg-surface-soft flex items-center justify-center p-0 md:p-6">
      <section className="w-full min-h-screen md:min-h-[680px] md:h-auto md:max-w-md bg-white md:rounded-[32px] md:shadow-card-hover relative overflow-hidden flex flex-col">
        <div className="absolute inset-x-0 top-0 h-1 bg-brand-blue" />
        <div className="flex-1 px-6 py-12 sm:px-8 md:py-16 flex flex-col relative z-10">
          <div className="mb-12">
            <p className="font-logo font-black text-3xl tracking-tight text-brand-blue">SAGRISA</p>
            <div className="mt-10 flex items-center gap-3 text-brand-blue">
              <ShieldCheck size={22} aria-hidden="true" />
              <span className="text-[11px] font-black uppercase tracking-[0.18em]">Acceso seguro</span>
            </div>
            <h1 className="mt-5 text-2xl font-black tracking-tight text-ink">Bienvenido/a</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Ingrese su DUI y PIN para entrar a la experiencia correspondiente a sus permisos.
            </p>
          </div>

          <div className="flex items-center gap-2 mb-4">
            {step === 'pin' && (
              <button type="button" onClick={() => { setStep('dui'); setError(''); }} className="min-h-11 min-w-11 rounded-xl text-ink-muted hover:bg-surface-soft" aria-label="Volver al DUI">
                <ArrowLeft size={20} className="mx-auto" aria-hidden="true" />
              </button>
            )}
            <label htmlFor="login-value" className="text-xs font-black uppercase tracking-widest text-ink-muted">
              {fieldLabel}
            </label>
          </div>
          <input
            id="login-value"
            autoFocus
            type={step === 'pin' ? 'password' : 'text'}
            inputMode={step === 'pin' ? 'numeric' : 'text'}
            value={fieldValue}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'login-error' : undefined}
            placeholder={step === 'dui' ? '00123456-7' : 'Ingrese su PIN'}
            onChange={event => {
              setError('');
              if (step === 'dui') setDui(formatDui(event.target.value));
              else setPin(event.target.value);
            }}
            onKeyDown={event => { if (event.key === 'Enter') handleAction(); }}
            className="min-h-14 w-full rounded-2xl border border-surface-border bg-white px-5 text-base font-semibold text-ink outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10"
          />

          {error && <p id="login-error" role="alert" className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

          <button
            type="button"
            onClick={handleAction}
            disabled={loading}
            className="mt-6 min-h-14 w-full rounded-2xl bg-brand-blue px-5 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-brand-blue/20 transition hover:bg-brand-dark focus:outline-none focus:ring-4 focus:ring-brand-blue/20 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Validando</span> : step === 'dui' ? 'Continuar' : 'Iniciar sesión'}
          </button>

          {slowLogin && <p className="mt-3 text-center text-xs font-semibold text-amber-700" role="status">El servidor esta tardando en responder. Puede estar despertando; espere unos segundos.</p>}

          <div className="mt-auto pt-12 text-center">
            <p className="text-xs font-medium text-ink-muted">El rol y las capacidades se asignan desde el servidor.</p>
            <p className="mt-2 text-[11px] font-semibold text-ink-light">SAGRISA · Plataforma comercial</p>
          </div>
        </div>
      </section>
    </main>
  );
}
