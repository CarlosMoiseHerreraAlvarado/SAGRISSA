import { useEffect } from 'react';
import { syncService } from '../api/sync.service';
import { fetchApi } from '../api/api.config';
import { trackEvent } from '../utils/appInsights';

export function useOfflineSync() {
  useEffect(() => {
    const handleOnline = async () => {
      console.log('[Network] Conexión recuperada. Procesando cola de sincronización...');
      
      // Esperamos un momento para asegurar que el socket esté listo
      setTimeout(async () => {
        const result = await syncService.processQueue(fetchApi);
        trackEvent('offline.sync.completed', result);
        
        // Opcional: Mostrar una notificación nativa si tenemos permiso
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('SAGRISA', {
            body: '¡Sincronización completada! Tus pedidos pendientes han sido enviados.',
            icon: '/icons/icon-192.svg'
          });
        }
      }, 3000);
    };

    const handleOffline = () => {
      console.warn('[Network] Conexión perdida. Entrando en modo offline.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificación inicial por si la app carga directamente offline
    if (navigator.onLine) {
       void syncService.processQueue(fetchApi).then(result => trackEvent('offline.sync.completed', result));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
}
