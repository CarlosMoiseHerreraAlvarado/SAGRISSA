import type { Product } from '../../../types';
import { fetchApi } from '../../../core/api/api.config';
import { syncService } from '../../../core/api/sync.service';
import type { BackendProducto } from '../../../types';

/**
 * Mapea un ProductoDto del backend al Product del frontend.
 * Campos como description, family y stock no existen en el backend aun.
 */
function mapProducto(p: BackendProducto): Product {
  return {
    id: p.codigo,
    sku: p.codigo,
    name: p.nombre,
    description: '',
    family: '',
    price: p.precio,
    stock: 0,
    warehouse: p.bodega,
    presentation: p.presentacion,
  };
}

/**
 * Servicio de Catalogo de Productos.
 * Conecta a GET /api/productos y GET /api/productos/{codigo} del backend ASP.NET Core.
 */
export const catalogService = {
  getProducts: async (): Promise<Product[]> => {
    try {
      const data = await fetchApi<BackendProducto[]>('/api/productos');
      const mapped = data.map(mapProducto);
      await syncService.saveCatalogLocally(mapped);
      return mapped;
    } catch (e) {
      console.error('Error fetching products from API, falling back to local:', e);
      const localData = await syncService.getCatalogLocally() as Product[];
      return localData || [];
    }
  },

  getProductBySku: async (sku: string): Promise<Product | undefined> => {
    try {
      const data = await fetchApi<BackendProducto>(`/api/productos/${sku}`);
      return mapProducto(data);
    } catch {
      return undefined;
    }
  },

  // POST — aun no existe en el backend, mantener mock
  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    await new Promise((r) => setTimeout(r, 800));
    const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) };
    return newProduct;
  },

  // PUT — aun no existe en el backend, mantener mock
  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    await new Promise((r) => setTimeout(r, 800));
    if (!product.name) throw new Error('Product not found');
    return { id, ...product } as Product;
  },
};
