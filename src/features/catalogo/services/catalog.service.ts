import { fetchApi } from '../../../core/api/api.config';
import { syncService } from '../../../core/api/sync.service';
import type { BackendProducto, Product } from '../../../types';

function mapProducto(product: BackendProducto): Product {
  return { id: product.codigo, sku: product.codigo, name: product.nombre, description: '', family: '', price: product.precio, stock: 0, warehouse: product.bodega, presentation: product.presentacion };
}

export const catalogService = {
  async getProducts(): Promise<Product[]> {
    try {
      const products = (await fetchApi<BackendProducto[]>('/catalog/products')).map(mapProducto);
      await syncService.saveCatalogLocally(products);
      return products;
    } catch (caught) {
      console.error('No fue posible consultar el catálogo; usando caché local.', caught);
      return syncService.getCatalogLocally();
    }
  },
  async getProductBySku(sku: string): Promise<Product | undefined> {
    try { return mapProducto(await fetchApi<BackendProducto>(`/catalog/products/${encodeURIComponent(sku)}`)); } catch { return undefined; }
  },
  createProduct: (product: Omit<Product, 'id'>): Promise<Product> => fetchApi<Product>('/catalog/products', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (id: string, product: Partial<Product>): Promise<Product> => fetchApi<Product>(`/catalog/products/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(product) }),
};
