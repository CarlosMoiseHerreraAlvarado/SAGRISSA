import { fetchApi } from '../../../core/api/api.config';
import { syncService } from '../../../core/api/sync.service';
import type { BackendProducto, Product } from '../../../types';
import { API_ENDPOINTS } from '../../../core/api/endpoints';

function mapProducto(product: BackendProducto): Product {
  return { id: product.codigo, sku: product.codigo, name: product.nombre, description: '', family: product.familia ?? product.categoria ?? '', price: product.precio, stock: 0, warehouse: product.bodega, presentation: product.presentacion };
}

type PagedApiResponse<T> = { items?: T[] };
type CatalogApiResponse = Partial<Product> & {
  codigo?: string;
  nombre?: string;
  presentacion?: string;
  precio?: number;
  bodega?: string;
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
      familia: value.family ?? fallback.family,
    });
  }
  return { ...fallback, ...value };
}

export const catalogService = {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetchApi<BackendProducto[] | PagedApiResponse<BackendProducto>>(API_ENDPOINTS.productos);
      const products = (Array.isArray(response) ? response : response.items ?? []).map(mapProducto);
      await syncService.saveCatalogLocally(products, syncService.getCurrentOwnerId());
      return products;
    } catch (caught) {
      console.error('No fue posible consultar el catálogo; usando caché local.', caught);
      return syncService.getCatalogLocally(syncService.getCurrentOwnerId());
    }
  },
  async getProductBySku(sku: string): Promise<Product | undefined> {
    try { return mapProducto(await fetchApi<BackendProducto>(`${API_ENDPOINTS.productos}/${encodeURIComponent(sku)}`)); } catch { return undefined; }
  },
  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const fallback = { ...product, id: `offline-${Date.now()}` } as Product;
    const response = await fetchApi<CatalogApiResponse>(API_ENDPOINTS.productos, { method: 'POST', body: JSON.stringify(product) });
    if (response._offlineQueued) {
      return { ...fallback, queuedOffline: true, syncStatus: 'pending', syncTaskId: response.syncTaskId };
    }
    return mapSavedProduct(response, fallback);
  },
  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    const fallback = { ...product, id } as Product;
    const response = await fetchApi<CatalogApiResponse>(`${API_ENDPOINTS.productos}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(product) });
    if (response._offlineQueued) {
      return { ...fallback, queuedOffline: true, syncStatus: 'pending', syncTaskId: response.syncTaskId };
    }
    return mapSavedProduct(response, fallback);
  },
};
