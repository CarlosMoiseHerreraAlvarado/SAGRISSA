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
  lastStatus?: number;
}

const catalogStore = localforage.createInstance({ name: 'sagrissa_catalog' });
const syncQueueStore = localforage.createInstance({ name: 'sagrissa_sync_queue' });
const failedQueueStore = localforage.createInstance({ name: 'sagrissa_failed_queue' });

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

  getFailedQueue: async (): Promise<SyncTask[]> => (await failedQueueStore.getItem<SyncTask[]>('queue')) ?? [],

  clearQueue: async () => {
    await syncQueueStore.setItem('queue', []);
  },

  retryFailed: async (taskId?: string) => {
    const failed = await syncService.getFailedQueue();
    const retryable = taskId ? failed.filter(task => task.id === taskId) : failed;
    const remainingFailed = taskId ? failed.filter(task => task.id !== taskId) : [];
    const pending = await readQueue();
    const restored = retryable.map(task => ({ ...task, attempts: 0, lastError: undefined, lastStatus: undefined }));
    await syncQueueStore.setItem('queue', [...pending, ...restored]);
    await failedQueueStore.setItem('queue', remainingFailed);
  },

  processQueue: async (apiCallback: (endpoint: string, options: RequestInit) => Promise<unknown>) => {
    const queue = await readQueue();
    const remaining: SyncTask[] = [];
    const failed = await syncService.getFailedQueue();
    const failedBefore = failed.length;
    for (const task of queue) {
      try {
        await apiCallback(task.endpoint, { method: task.method, body: JSON.stringify(task.payload) });
      } catch (caught) {
        const status = typeof caught === 'object' && caught !== null && 'status' in caught && typeof caught.status === 'number' ? caught.status : undefined;
        const nextTask = { ...task, attempts: task.attempts + 1, lastError: caught instanceof Error ? caught.message : 'Error desconocido', lastStatus: status };
        if (status === 409 || nextTask.attempts >= 3) failed.push(nextTask);
        else remaining.push(nextTask);
      }
    }
    await syncQueueStore.setItem('queue', remaining);
    await failedQueueStore.setItem('queue', failed);
    return { processed: queue.length - remaining.length - (failed.length - failedBefore), pending: remaining.length, failed: failed.length };
  },
};
