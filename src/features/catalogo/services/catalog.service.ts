import { fetchApi } from '../../../core/api/api.config';
import { syncService } from '../../../core/api/sync.service';
import type { BackendProducto, Product } from '../../../types';
import { API_ENDPOINTS } from '../../../core/api/endpoints';

function mapProducto(product: BackendProducto): Product {
  return { id: product.codigo, sku: product.codigo, name: product.nombre, description: product.descripcion ?? '', family: product.familia ?? product.categoria ?? '', price: product.precio, stock: product.stock ?? 0, warehouse: product.bodega, presentation: product.presentacion };
}

type PagedApiResponse<T> = { items?: T[] };
type CatalogApiResponse = Partial<Product> & {
  codigo?: string;
  nombre?: string;
  presentacion?: string;
  precio?: number;
  bodega?: string;
  familia?: string;
  descripcion?: string;
  stock?: number;
  activo?: boolean;
  _offlineQueued?: boolean;
  syncTaskId?: string;
};

function mapSavedProduct(value: CatalogApiResponse, fallback: Product): Product {
  if (value.codigo || value.nombre || value.precio !== undefined) {
    return mapProducto({
      codigo: value.codigo ?? fallback.sku,
      nombre: value.nombre ?? fallback.name,
      presentacion: value.presentacion ?? fallback.presentation,
      precio: value.precio ?? fallback.price,
      bodega: value.bodega ?? fallback.warehouse,
      activo: true,
      familia: value.familia ?? value.family ?? fallback.family,
      descripcion: value.descripcion ?? fallback.description,
      stock: value.stock ?? fallback.stock,
    });
  }
  return { ...fallback, ...value };
}

function toBackendProduct(product: Partial<Product>) {
  return {
    codigo: product.sku,
    nombre: product.name,
    descripcion: product.description,
    familia: product.family,
    presentacion: product.presentation,
    precio: product.price,
    stock: product.stock,
    bodega: product.warehouse,
    activo: true,
  };
}
export const catalogService = {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetchApi<BackendProducto[] | PagedApiResponse<BackendProducto>>(API_ENDPOINTS.productos);
      const products = (Array.isArray(response) ? response : response.items ?? []).map(mapProducto);
      await syncService.saveCatalogLocally(products, syncService.getCurrentOwnerId());
      return products;
    } catch (caught) {
      if (!navigator.onLine) {
        return syncService.getCatalogLocally(syncService.getCurrentOwnerId());
      }
      throw caught;
    }
  },
  async getProductBySku(sku: string): Promise<Product | undefined> {
    const data = await fetchApi<BackendProducto>(`${API_ENDPOINTS.productos}/${encodeURIComponent(sku)}`);
    return mapProducto(data);
  },
  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const fallback = { ...product, id: `offline-${Date.now()}` } as Product;
    const response = await fetchApi<CatalogApiResponse>(API_ENDPOINTS.productos, { method: 'POST', body: JSON.stringify(toBackendProduct(product)) });
    if (response._offlineQueued) {
      return { ...fallback, queuedOffline: true, syncStatus: 'pending', syncTaskId: response.syncTaskId };
    }
    return mapSavedProduct(response, fallback);
  },
  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    const fallback = { ...product, id } as Product;
    const response = await fetchApi<CatalogApiResponse>(`${API_ENDPOINTS.productos}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(toBackendProduct(product)) });
    if (response._offlineQueued) {
      return { ...fallback, queuedOffline: true, syncStatus: 'pending', syncTaskId: response.syncTaskId };
    }
    return mapSavedProduct(response, fallback);
  },
};
