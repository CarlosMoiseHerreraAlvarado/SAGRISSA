import { useEffect } from 'react';
import { syncService } from '../api/sync.service';
import { fetchApi } from '../api/api.config';
import { trackEvent } from '../utils/appInsights';

export function useOfflineSync() {
  useEffect(() => {
    let syncTimer: number | undefined;
    let cancelled = false;

    const processPendingQueue = async () => {
      if (cancelled || !navigator.onLine) return;
      try {
        const result = await syncService.processQueue(fetchApi);
        if (!cancelled) {
          trackEvent('offline.sync.completed', {
            processed: result.processed,
            pending: result.pending,
            failed: result.failed,
            authExpired: result.authExpired,
          });
          if (result.authExpired) trackEvent('offline.sync.auth_expired', {});
        }
      } catch (caught) {
        if (!cancelled) {
          trackEvent('offline.sync.failed', {
            message: caught instanceof Error ? caught.message : 'Error desconocido',
          });
        }
      }
    };

    const handleOnline = () => {
      window.clearTimeout(syncTimer);
      syncTimer = window.setTimeout(() => {
        void processPendingQueue();
      }, 3000);
    };

    const handleOffline = () => {
      console.warn('[Network] Conexión perdida. Entrando en modo offline.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificación inicial por si la app carga directamente con conexión.
    void processPendingQueue();

    return () => {
      cancelled = true;
      window.clearTimeout(syncTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
}
