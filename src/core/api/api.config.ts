/**
 * Archivo base para llamadas a los servicios internos de ASP.NET Core a través de Azure API Management (APIM).
 * Según el documento maestro de arquitectura, la PWA nunca se comunica con Dynamics ni la SQL directa.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.sagrissa.com/v1';

// Interceptor básico de fetch (simulado) para inyectar token de Entra ID cuando aplique y manejar roles
export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('sagrissa_auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error en la petición API');
    }

    return response.json();
  } catch (error) {
    console.error(`[API Call Failed] ${endpoint}:`, error);
    throw error;
  }
}
