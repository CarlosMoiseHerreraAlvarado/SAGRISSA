import { fetchApi } from '../../../core/api/api.config';
import { syncService } from '../../../core/api/sync.service';
import type { BackendProducto, Product } from '../../../types';
import { API_ENDPOINTS } from '../../../core/api/endpoints';

function mapProducto(product: BackendProducto): Product {
  return { id: product.codigo, sku: product.codigo, name: product.nombre, description: '', family: '', price: product.precio, stock: 0, warehouse: product.bodega, presentation: product.presentacion };
}

export const catalogService = {
  async getProducts(): Promise<Product[]> {
    try {
      const products = (await fetchApi<BackendProducto[]>(API_ENDPOINTS.productos)).map(mapProducto);
      await syncService.saveCatalogLocally(products);
      return products;
    } catch (caught) {
      console.error('No fue posible consultar el catálogo; usando caché local.', caught);
      return syncService.getCatalogLocally();
    }
  },
  async getProductBySku(sku: string): Promise<Product | undefined> {
    try { return mapProducto(await fetchApi<BackendProducto>(`${API_ENDPOINTS.productos}/${encodeURIComponent(sku)}`)); } catch { return undefined; }
  },
  createProduct: (product: Omit<Product, 'id'>): Promise<Product> => fetchApi<Product>(API_ENDPOINTS.productos, { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (id: string, product: Partial<Product>): Promise<Product> => fetchApi<Product>(`${API_ENDPOINTS.productos}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(product) }),
};
