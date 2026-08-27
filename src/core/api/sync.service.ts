import localforage from 'localforage';
import type { CustomerAccount, Product, Role } from '../../types';

type JsonRecord = Record<string, unknown>;
export type SyncResource = 'catalog' | 'orders' | 'collections';
export type SyncStatus = 'pending' | 'failed';

export interface SyncTask {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH';
  payload: JsonRecord;
  timestamp: number;
  attempts: number;
  ownerId: string;
  resource: SyncResource;
  status: SyncStatus;
  lastError?: string;
  lastStatus?: number;
}

interface StoredUser { id?: string; role?: Role; }
interface QueueResult {
  processed: number;
  pending: number;
  failed: number;
  authExpired: boolean;
}

const catalogStore = localforage.createInstance({ name: 'sagrissa_catalog' });
const customerStore = localforage.createInstance({ name: 'sagrissa_customers' });
const syncQueueStore = localforage.createInstance({ name: 'sagrissa_sync_queue' });
const failedQueueStore = localforage.createInstance({ name: 'sagrissa_failed_queue' });

function getActiveOwnerId(): string {
  if (typeof window === 'undefined') return 'anonymous';
  try {
    const stored = localStorage.getItem('sagrissa_user') || sessionStorage.getItem('sagrissa_user');
    const user = stored ? JSON.parse(stored) as StoredUser : undefined;
    return user?.id?.trim() || 'anonymous';
  } catch {
    return 'anonymous';
  }
}

function getResource(endpoint: string): SyncResource {
  if (/^\/productos(?:\/|$)/i.test(endpoint)) return 'catalog';
  if (/^(?:\/orders|\/pedidos)(?:\/|$)/i.test(endpoint)) return 'orders';
  return 'collections';
}

async function readStoredQueue(store: LocalForage): Promise<SyncTask[]> {
  const value = await store.getItem<SyncTask[]>('queue');
  return Array.isArray(value) ? value : [];
}

function ownerTasks(tasks: SyncTask[], ownerId: string) {
  return tasks.filter(task => (task.ownerId || 'anonymous') === ownerId);
}

async function readQueue(ownerId = getActiveOwnerId()): Promise<SyncTask[]> {
  return ownerTasks(await readStoredQueue(syncQueueStore), ownerId);
}

async function writeOwnerQueue(store: LocalForage, ownerId: string, tasks: SyncTask[]) {
  const existing = await readStoredQueue(store);
  const otherOwners = existing.filter(task => (task.ownerId || 'anonymous') !== ownerId);
  await store.setItem('queue', [...otherOwners, ...tasks]);
}

function normalizeTask(task: SyncTask): SyncTask {
  return {
    ...task,
    ownerId: task.ownerId || 'anonymous',
    resource: task.resource || getResource(task.endpoint),
    status: task.status || 'pending',
    payload: task.payload && typeof task.payload === 'object' ? task.payload : {},
  };
}

export const syncService = {
  getCurrentOwnerId: getActiveOwnerId,

  saveCatalogLocally: async (products: Product[], ownerId = getActiveOwnerId()) => {
    await catalogStore.setItem(`products:${ownerId}`, products);
  },

  getCatalogLocally: async (ownerId = getActiveOwnerId()): Promise<Product[]> => {
    return (await catalogStore.getItem<Product[]>(`products:${ownerId}`)) ?? [];
  },

  clearCatalogLocally: async (ownerId = getActiveOwnerId()) => {
    await catalogStore.removeItem(`products:${ownerId}`);
  },

  saveCustomersLocally: async (customers: CustomerAccount[], ownerId = getActiveOwnerId()) => {
    await customerStore.setItem(`customers:${ownerId}`, customers);
  },

  getCustomersLocally: async (ownerId = getActiveOwnerId()): Promise<CustomerAccount[]> => {
    return (await customerStore.getItem<CustomerAccount[]>(`customers:${ownerId}`)) ?? [];
  },

  clearCustomersLocally: async (ownerId = getActiveOwnerId()) => {
    await customerStore.removeItem(`customers:${ownerId}`);
  },

  enqueueRequest: async (endpoint: string, options: RequestInit, ownerId = getActiveOwnerId()): Promise<SyncTask> => {
    const method = options.method?.toUpperCase();
    if (!method || !['POST', 'PUT', 'PATCH'].includes(method)) {
      throw new Error('Las operaciones offline deben usar POST, PUT o PATCH.');
    }
    if (typeof options.body !== 'string' || options.body.trim().length === 0) {
      throw new Error('La operación offline requiere un cuerpo JSON.');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(options.body);
    } catch {
      throw new Error('La operación offline requiere un cuerpo JSON válido.');
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('La operación offline requiere un objeto JSON.');
    }

    const resource = getResource(endpoint);
    const queue = (await readStoredQueue(syncQueueStore)).map(normalizeTask);
    const payload = parsed as JsonRecord;
    const duplicate = queue.find(task => task.ownerId === ownerId && task.endpoint === endpoint && task.method === method && JSON.stringify(task.payload) === JSON.stringify(payload));
    if (duplicate) return duplicate;

    const isUpdate = method === 'PUT' || method === 'PATCH';
    const compacted = isUpdate
      ? queue.filter(task => !(task.ownerId === ownerId && task.endpoint === endpoint && (task.method === 'PUT' || task.method === 'PATCH')))
      : queue;
    const task: SyncTask = {
      id: crypto.randomUUID(),
      endpoint,
      method: method as SyncTask['method'],
      payload,
      timestamp: Date.now(),
      attempts: 0,
      ownerId,
      resource,
      status: 'pending',
    };
    await syncQueueStore.setItem('queue', [...compacted, task]);
    return task;
  },

  getQueue: readQueue,

  getFailedQueue: async (ownerId = getActiveOwnerId()): Promise<SyncTask[]> => {
    return ownerTasks(await readStoredQueue(failedQueueStore), ownerId).map(normalizeTask);
  },

  clearQueue: async (ownerId = getActiveOwnerId()) => {
    await writeOwnerQueue(syncQueueStore, ownerId, []);
  },

  discardFailed: async (taskId?: string, ownerId = getActiveOwnerId()) => {
    const failed = await readStoredQueue(failedQueueStore);
    const remaining = failed.filter(task => (task.ownerId || 'anonymous') !== ownerId || (taskId && task.id !== taskId));
    await failedQueueStore.setItem('queue', remaining);
  },

  retryFailed: async (taskId?: string, ownerId = getActiveOwnerId()) => {
    const failed = (await readStoredQueue(failedQueueStore)).map(normalizeTask);
    const retryable = failed.filter(task => task.ownerId === ownerId && (!taskId || task.id === taskId));
    const remainingFailed = failed.filter(task => task.ownerId !== ownerId || (taskId ? task.id !== taskId : false));
    const pending = await readStoredQueue(syncQueueStore);
    const restored = retryable.map(task => ({ ...task, attempts: 0, status: 'pending' as const, lastError: undefined, lastStatus: undefined }));
    await syncQueueStore.setItem('queue', [...pending, ...restored]);
    await failedQueueStore.setItem('queue', remainingFailed);
  },

  processQueue: async (apiCallback: (endpoint: string, options: RequestInit) => Promise<unknown>, ownerId = getActiveOwnerId()): Promise<QueueResult> => {
    const queue = (await readQueue(ownerId)).map(normalizeTask);
    const remaining: SyncTask[] = [];
    const failedAll = (await readStoredQueue(failedQueueStore)).map(normalizeTask);
    const failedOwner = ownerTasks(failedAll, ownerId);
    let authExpired = false;
    let processed = 0;

    for (let index = 0; index < queue.length; index += 1) {
      const task = queue[index];
      try {
        await apiCallback(task.endpoint, { method: task.method, body: JSON.stringify(task.payload) });
        processed += 1;
      } catch (caught) {
        const status = typeof caught === 'object' && caught !== null && 'status' in caught && typeof caught.status === 'number'
          ? caught.status
          : undefined;
        const nextTask: SyncTask = {
          ...task,
          attempts: task.attempts + 1,
          status: 'pending',
          lastError: caught instanceof Error ? caught.message : 'Error desconocido',
          lastStatus: status,
        };
        if (status === 401) {
          authExpired = true;
          remaining.push(...queue.slice(index));
          break;
        }
        if (status === 409 || nextTask.attempts >= 3) {
          failedOwner.push({ ...nextTask, status: 'failed' });
        } else {
          remaining.push(nextTask);
        }
      }
    }

    await writeOwnerQueue(syncQueueStore, ownerId, remaining);
    const otherFailed = failedAll.filter(task => (task.ownerId || 'anonymous') !== ownerId);
    await failedQueueStore.setItem('queue', [...otherFailed, ...failedOwner]);
    return { processed, pending: remaining.length, failed: failedOwner.length, authExpired };
  },
};
