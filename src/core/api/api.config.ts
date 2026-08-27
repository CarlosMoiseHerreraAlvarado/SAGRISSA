/**
 * Archivo base para llamadas a los servicios internos de ASP.NET Core a través de Azure API Management (APIM).
 * Según el documento maestro de arquitectura, la PWA nunca se comunica con Dynamics ni la SQL directa.
 */

/**
 * Archivo base para llamadas a los servicios internos de ASP.NET Core a través de Azure API Management (APIM).
 * Según el documento maestro de arquitectura, la PWA nunca se comunica con Dynamics ni la SQL directa.
 */

import { syncService } from './sync.service';
import { trackEvent, trackException } from '../utils/appInsights';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://sagrissa-bac.onrender.com').replace(/\/$/, '');
export const AUTH_EXPIRED_EVENT = 'sagrissa:auth-expired';

function getAuthToken(): string | null {
  try {
    return localStorage.getItem('sagrissa_auth_token') || sessionStorage.getItem('sagrissa_auth_token');
  } catch {
    return null;
  }
}

// Interceptor central para APIM: inyecta la sesión y correlaciona cada solicitud.
export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const startedAt = performance.now();
  const token = getAuthToken();
  const requestId = crypto.randomUUID();
  const method = options?.method?.toUpperCase() || 'GET';
  const isFormData = typeof FormData !== 'undefined' && options?.body instanceof FormData;
  const isOfflineWrite = /^\/(orders|pedidos|collections|cobros|productos)(?:\/|$)/i.test(endpoint) && ['POST', 'PUT', 'PATCH'].includes(method);
  
  const headers: Record<string, string> = {
    'X-Correlation-Id': requestId,
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(options?.headers as Record<string, string>),
  };

  // DETECCIÓN DE MODO OFFLINE EXPLÍCITO
  if (!navigator.onLine) {
    console.warn(`[Offline] Sin conexión detectada. Interceptando llamada a ${endpoint}`);
    
    if (isOfflineWrite) {
      const task = await syncService.enqueueRequest(endpoint, options || {});
      trackEvent(endpoint.startsWith('/productos') ? 'catalog.write.queued' : 'offline.operation.queued', { endpoint, method });
      return { _offlineQueued: true, syncTaskId: task.id, message: 'Guardado localmente, pendiente de sincronización' } as unknown as T;
    }
    
    throw new Error('Sin conexión de red para realizar esta consulta.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    }

    const contentType = response.headers.get('content-type') ?? '';
    const responseData: unknown = response.status === 204
      ? undefined
      : contentType.includes('application/json')
        ? await response.json().catch(() => ({}))
        : await response.text().catch(() => '');

    if (!response.ok) {
      const errorData = responseData && typeof responseData === 'object' ? responseData as { message?: string; mensaje?: string } : {};
      trackEvent('api.request.error', { endpoint, status: response.status, durationMs: Math.round(performance.now() - startedAt) });
      const apiError = new Error(errorData.message || errorData.mensaje || `Error en la petición API (${response.status})`) as Error & { status?: number };
      apiError.status = response.status;
      throw apiError;
    }

    trackEvent('api.request.completed', { endpoint, status: response.status, durationMs: Math.round(performance.now() - startedAt) });

    // ASP.NET devuelve ApiResponse<T>; los servicios del frontend consumen T directamente.
    if (responseData && typeof responseData === 'object' && 'success' in responseData && 'data' in responseData) {
      return (responseData as { data: T }).data as T;
    }
    return responseData as T;
  } catch (error) {
    // Si falla por desconexión de red durante el envío de una operación de escritura, encolar offline
    if (isOfflineWrite && (error instanceof TypeError || !navigator.onLine)) {
      console.warn(`[Network Drop] Encolando ${endpoint} por pérdida de conexión durante la solicitud.`);
      try {
        const task = await syncService.enqueueRequest(endpoint, options || {});
        trackEvent('offline.operation.queued', { endpoint, method, reason: 'network_failure' });
        return { _offlineQueued: true, syncTaskId: task.id, message: 'Guardado localmente tras interrupción de red' } as unknown as T;
      } catch (queueErr) {
        console.error('No fue posible encolar offline:', queueErr);
      }
    }

    console.error(`[API Call Failed] ${endpoint}:`, error);
    trackException(error instanceof Error ? error : new Error('Error desconocido en API'));
    throw error;
  }
}

export async function downloadApiFile(endpoint: string, filename: string): Promise<void> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-Correlation-Id': crypto.randomUUID(),
    },
  });
  if (response.status === 401 && !endpoint.includes('/auth/login')) window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
  if (!response.ok) throw new Error(`No fue posible descargar el archivo (${response.status}).`);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
