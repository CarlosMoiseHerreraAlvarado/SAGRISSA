import type { Product } from '../../../types';

/**
 * Servicio de Catálogo e Inventario
 * Lee directamente desde la base de datos Espejo (Mirror SQL) para consultas de ultra-alta velocidad.
 */
export const catalogService = {
  // Obtiene los productos filtrables. En producción va al Mirror SQL vía APIM.
  getProducts: async (): Promise<Product[]> => {
    try {
      // return await fetchApi<Product[]>('/catalog/products');
      
      // Simulación de latencia de APIM -> Mirror SQL
      await new Promise(r => setTimeout(r, 600));
      return MOCK_PRODUCTS;
    } catch (e) {
      throw e;
    }
  },

  getProductBySku: async (sku: string): Promise<Product | undefined> => {
    // return await fetchApi<Product>(`/catalog/products/${sku}`);
    await new Promise(r => setTimeout(r, 300));
    return MOCK_PRODUCTS.find(p => p.sku === sku);
  }
};

// ------------------ MOCKS ------------------ //
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    sku: 'BIO-11-BL',
    name: 'BIOMIN BOOTER 11 (1gl) BLANCO',
    description: 'Acondicionador de suelos biológico de alta eficiencia.',
    family: 'Fertilizantes',
    price: 40.00,
    stock: 250,
    warehouse: 'Bodega Central',
    presentation: 'Galón'
  },
  {
    id: 'p2',
    sku: 'UR-46-KG',
    name: 'UREA 46% GRANULADA SACO',
    description: 'Saco de 50 KG de nitrógeno de liberación rápida.',
    family: 'Fertilizantes',
    price: 35.50,
    stock: 12,
    warehouse: 'Bodega Central',
    presentation: 'Saco'
  },
  {
    id: 'p3',
    sku: 'SEM-MAIZ-50',
    name: 'SEMILLA MAÍZ BLANCO H-59',
    description: 'Semilla certificada de alta resistencia a sequía.',
    family: 'Semillas',
    price: 120.00,
    stock: 45,
    warehouse: 'Almacén 2',
    presentation: 'Bolsa'
  },
  {
    id: 'p4',
    sku: 'HERB-GLI-LT',
    name: 'HERBICIDA GLIFOSATO 480 SL',
    description: 'Herbicida sistémico no selectivo post-emergencia.',
    family: 'Herbicidas',
    price: 18.50,
    stock: 0,
    warehouse: 'Bodega Central',
    presentation: 'Litro'
  },
  {
    id: 'p5',
    sku: 'MAQ-BOM-20',
    name: 'BOMBA DE ESPALDA MANUAL 20L',
    description: 'Pulverizador de alta resistencia para aplicaciones agrícolas.',
    family: 'Maquinaria',
    price: 85.00,
    stock: 8,
    warehouse: 'Almacén 1',
    presentation: 'Unidad'
  },
  {
    id: 'p6',
    sku: 'FUN-MAN-KG',
    name: 'FUNGICIDA MANCOZEB 80 WP',
    description: 'Fungicida protector de contacto de amplio espectro.',
    family: 'Fungicidas',
    price: 12.00,
    stock: 150,
    warehouse: 'Bodega Central',
    presentation: 'Bolsa'
  }
];

