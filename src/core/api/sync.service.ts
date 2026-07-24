import localforage from 'localforage';
import type { Product } from '../../types';

type JsonRecord = Record<string, unknown>;

export interface SyncTask {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH';
  payload: JsonRecord | null;
  timestamp: number;
  attempts: number;
  lastError?: string;
}

const catalogStore = localforage.createInstance({ name: 'sagrissa_catalog' });
const syncQueueStore = localforage.createInstance({ name: 'sagrissa_sync_queue' });

async function readQueue(): Promise<SyncTask[]> {
  return (await syncQueueStore.getItem<SyncTask[]>('queue')) ?? [];
}

export const syncService = {
  saveCatalogLocally: async (products: Product[]) => {
    await catalogStore.setItem('products', products);
  },

  getCatalogLocally: async (): Promise<Product[]> => {
    return (await catalogStore.getItem<Product[]>('products')) ?? [];
  },

  enqueueRequest: async (endpoint: string, options: RequestInit) => {
    const payload = typeof options.body === 'string' ? JSON.parse(options.body) as JsonRecord : null;
    const queue = await readQueue();
    const duplicate = queue.some(task => task.endpoint === endpoint && JSON.stringify(task.payload) === JSON.stringify(payload));
    if (duplicate) return;

    queue.push({
      id: crypto.randomUUID(),
      endpoint,
      method: (options.method?.toUpperCase() as SyncTask['method']) || 'POST',
      payload,
      timestamp: Date.now(),
      attempts: 0,
    });
    await syncQueueStore.setItem('queue', queue);
  },

  getQueue: readQueue,

  clearQueue: async () => {
    await syncQueueStore.setItem('queue', []);
  },

  processQueue: async (apiCallback: (endpoint: string, options: RequestInit) => Promise<unknown>) => {
    const queue = await readQueue();
    const remaining: SyncTask[] = [];
    for (const task of queue) {
      try {
        await apiCallback(task.endpoint, { method: task.method, body: JSON.stringify(task.payload) });
      } catch (caught) {
        remaining.push({ ...task, attempts: task.attempts + 1, lastError: caught instanceof Error ? caught.message : 'Error desconocido' });
      }
    }
    await syncQueueStore.setItem('queue', remaining);
    return { processed: queue.length - remaining.length, pending: remaining.length };
  },
};
