import { fetchApi } from '../../../core/api/api.config';
import { syncService } from '../../../core/api/sync.service';
import type { BackendProducto, Product } from '../../../types';
import { API_ENDPOINTS } from '../../../core/api/endpoints';

function mapProducto(product: BackendProducto): Product {
  return {
    id: product.codigo,
    sku: product.codigo,
    name: product.nombre,
    description: product.descripcion ?? '',
    family: product.familia ?? product.categoria ?? '',
    division: product.division ?? undefined,
    clase: product.clase ?? undefined,
    fechaVencimiento: product.fechaVencimiento ?? undefined,
    estadoVencimiento: (product.estadoVencimiento as 'VIGENTE' | 'POR VENCER' | 'VENCIDO') ?? undefined,
    pais: product.pais ?? undefined,
    lote: product.lote ?? undefined,
    price: product.precio,
    stock: product.stock ?? 0,
    warehouse: product.bodega,
    presentation: product.presentacion
  };
}

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'PROD-SV-001',
    sku: 'PANACUR-1000',
    name: 'Panacur 10% Suspensión Oral 1000ml',
    description: 'Antiparasitario interno de amplio espectro para bovinos y equinos',
    family: 'Veterinaria',
    division: 'Veterinaria',
    clase: 'Desparasitantes',
    fechaVencimiento: '2026-12-15',
    estadoVencimiento: 'VIGENTE',
    pais: 'SV',
    lote: 'LOT-SV-9941',
    price: 38.50,
    stock: 420,
    warehouse: 'Bodega Central',
    presentation: 'Frasco 1000ml'
  },
  {
    id: 'PROD-SV-002',
    sku: 'BOVILIS-VISTA',
    name: 'Bovilis Vista Once SQ 50 Dosis',
    description: 'Vacuna para la prevención de enfermedades respiratorias y reproductivas',
    family: 'Veterinaria',
    division: 'Veterinaria',
    clase: 'Biológicos',
    fechaVencimiento: '2026-11-28',
    estadoVencimiento: 'POR VENCER',
    pais: 'SV',
    lote: 'LOT-SV-8812',
    price: 64.00,
    stock: 180,
    warehouse: 'Bodega Central',
    presentation: 'Vial 50 Dosis'
  },
  {
    id: 'PROD-GT-001',
    sku: 'ENRO-GT-250',
    name: 'Enrofloxacina 10% Inyectable 250ml',
    description: 'Antimicrobiano bactericida de amplio espectro',
    family: 'Veterinaria',
    division: 'Veterinaria',
    clase: 'Antibióticos',
    fechaVencimiento: '2027-03-30',
    estadoVencimiento: 'VIGENTE',
    pais: 'GT',
    lote: 'LOT-GT-3321',
    price: 22.75,
    stock: 310,
    warehouse: 'Bodega Oriental',
    presentation: 'Frasco 250ml'
  },
  {
    id: 'PROD-SV-003',
    sku: 'VITAM-COMP-B',
    name: 'Complejo B Fuerte Inyectable 100ml',
    description: 'Estimulante del apetito y reconstituyente para animales de producción',
    family: 'Veterinaria',
    division: 'Veterinaria',
    clase: 'Vitamínicos',
    fechaVencimiento: '2027-05-10',
    estadoVencimiento: 'VIGENTE',
    pais: 'SV',
    lote: 'LOT-SV-7714',
    price: 14.50,
    stock: 540,
    warehouse: 'Bodega Occidental',
    presentation: 'Frasco 100ml'
  },
  {
    id: 'PROD-GT-002',
    sku: 'POMADA-CICAT',
    name: 'Pomada Antiséptica y Cicatrizante 400g',
    description: 'Tratamiento de heridas, excoriaciones e infecciones cutáneas',
    family: 'Veterinaria',
    division: 'Veterinaria',
    clase: 'Especialidades',
    fechaVencimiento: '2026-08-14',
    estadoVencimiento: 'VENCIDO',
    pais: 'GT',
    lote: 'LOT-GT-1102',
    price: 18.25,
    stock: 220,
    warehouse: 'Bodega Oriental',
    presentation: 'Pote 400g'
  },
  {
    id: 'PROD-GT-003',
    sku: 'OXITETRA-LA',
    name: 'Oxitetraciclina L.A. 200mg 250ml',
    description: 'Antibiótico inyectable de larga acción',
    family: 'Veterinaria',
    division: 'Veterinaria',
    clase: 'Antibióticos',
    fechaVencimiento: '2026-12-05',
    estadoVencimiento: 'POR VENCER',
    pais: 'GT',
    lote: 'LOT-GT-5421',
    price: 29.80,
    stock: 85,
    warehouse: 'Bodega Occidental',
    presentation: 'Frasco 250ml'
  },
  {
    id: 'PROD-SV-004',
    sku: 'FERT-FOLIAR-1K',
    name: 'Fertilizante Foliar 20-20-20 Microelementos 1Kg',
    description: 'Nutrición vegetal balanceada soluble para aplicación foliar',
    family: 'Agrícola',
    division: 'Agrícola',
    clase: 'Fertilizantes y Nutrición',
    fechaVencimiento: '2027-08-20',
    estadoVencimiento: 'VIGENTE',
    pais: 'SV',
    lote: 'LOT-SV-6603',
    price: 16.50,
    stock: 650,
    warehouse: 'Bodega Central',
    presentation: 'Bolsa 1Kg'
  }
];

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
      const response = await fetchApi<BackendProducto[] | PagedApiResponse<BackendProducto>>(`${API_ENDPOINTS.productos}?pageNumber=1&pageSize=500`);
      const raw = Array.isArray(response) ? response : response.items ?? [];
      if (raw.length > 0) {
        const products = raw.map(mapProducto);
        await syncService.saveCatalogLocally(products, syncService.getCurrentOwnerId());
        return products;
      }
      return FALLBACK_PRODUCTS;
    } catch (caught) {
      const local = await syncService.getCatalogLocally(syncService.getCurrentOwnerId());
      if (local && local.length > 0) {
        console.warn('API /productos no disponible, usando catálogo local persistido:', caught);
        return local;
      }
      console.warn('API /productos no disponible, usando catálogo de contingencia ejecutiva:', caught);
      return FALLBACK_PRODUCTS;
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
