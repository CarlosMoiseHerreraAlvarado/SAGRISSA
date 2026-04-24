import { useEffect } from 'react';
import { syncService } from '../api/sync.service';
import { fetchApi } from '../api/api.config';

export function useOfflineSync() {
  useEffect(() => {
    const handleOnline = async () => {
      console.log('[Network] Conexión recuperada. Procesando cola de sincronización...');
      
      // Esperamos un momento para asegurar que el socket esté listo
      setTimeout(async () => {
        await syncService.processQueue(fetchApi);
        
        // Opcional: Mostrar una notificación nativa si tenemos permiso
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('SAGRISA', {
            body: '¡Sincronización completada! Tus pedidos pendientes han sido enviados.',
            icon: '/vite.svg'
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
       syncService.processQueue(fetchApi);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
}
