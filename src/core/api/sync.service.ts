import localforage from 'localforage';

// Stores
const catalogStore = localforage.createInstance({ name: 'sagrissa_catalog' });
const syncQueueStore = localforage.createInstance({ name: 'sagrissa_sync_queue' });

export interface SyncTask {
  id: string;
  endpoint: string;
  method: string;
  payload: any;
  timestamp: number;
}

export const syncService = {
  // CATÁLOGO LOCAL
  saveCatalogLocally: async (products: any[]) => {
    await catalogStore.setItem('products', products);
    console.log('[Offline] Catálogo guardado en IndexedDB para uso offline');
  },

  getCatalogLocally: async () => {
    return await catalogStore.getItem('products');
  },

  // COLA DE SINCRONIZACIÓN (PEDIDOS OFFLINE)
  enqueueRequest: async (endpoint: string, options: RequestInit) => {
    const task: SyncTask = {
      id: `task_${Date.now()}`,
      endpoint,
      method: options.method || 'POST',
      payload: options.body ? JSON.parse(options.body as string) : null,
      timestamp: Date.now()
    };
    
    const currentQueue: SyncTask[] = await syncQueueStore.getItem('queue') || [];
    currentQueue.push(task);
    await syncQueueStore.setItem('queue', currentQueue);
    
    console.log(`[Offline] Petición a ${endpoint} guardada en cola de sincronización.`);
  },

  getQueue: async (): Promise<SyncTask[]> => {
    return await syncQueueStore.getItem('queue') || [];
  },

  clearQueue: async () => {
    await syncQueueStore.setItem('queue', []);
  },

  // PROCESAR COLA (SINCRONIZAR)
  processQueue: async (apiCallback: (endpoint: string, options: any) => Promise<any>) => {
    const queue: SyncTask[] = await syncQueueStore.getItem('queue') || [];
    if (queue.length === 0) return;

    console.log(`[Offline] Iniciando sincronización de ${queue.length} tareas pendientes...`);
    
    for (const task of queue) {
      try {
        await apiCallback(task.endpoint, {
          method: task.method,
          body: JSON.stringify(task.payload)
        });
        console.log(`[Offline] Tarea ${task.id} sincronizada con éxito.`);
      } catch (error) {
        console.error(`[Offline] Fallo al sincronizar tarea ${task.id}:`, error);
        // Podríamos implementar reintentos o dejarla en la cola
      }
    }

    await syncService.clearQueue();
    console.log('[Offline] Sincronización completada.');
  }
};
