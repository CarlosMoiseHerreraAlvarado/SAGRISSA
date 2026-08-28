import { useEffect, useMemo, useState } from 'react';
import { 
  ArrowLeft, 
  Filter, 
  PackageOpen, 
  Plus, 
  Search,
  Warehouse,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { catalogService } from '../services/catalog.service';
import type { Product } from '../../../types';
import { useAuth } from '../../../core/hooks/useAuth';
import { BottomSheet } from '../../../core/ui/BottomSheet';
import { Skeleton } from '../../../core/ui/Skeleton';
import { hasPermission } from '../../../core/auth/permissions';

interface CatalogoPageProps {
  readOnly?: boolean;
}

const categories = ['Todos', 'Agrícola', 'Veterinaria', 'Industrial y Servicios', 'Proyectos', 'Talleres'];

const warehouses = [
  { id: 'central', name: 'Bodega Central' },
  { id: 'oriental', name: 'Bodega Oriental' },
  { id: 'occidental', name: 'Bodega Occidental' },
];

function ProductStatus({ product }: { product: Product }) {
  if (product.syncStatus === 'pending' || product.queuedOffline) {
    return <span className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 text-[10px] font-bold text-amber-700 dark:text-amber-300">Pendiente</span>;
  }
  if (product.stock === 0) {
    return <span className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/60 px-2 py-1 text-[10px] font-bold text-red-600 dark:text-red-400">Agotado</span>;
  }
  if (product.stock < 20) {
    return <span className="rounded-lg border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/60 px-2 py-1 text-[10px] font-bold text-orange-600 dark:text-orange-400">Solo {product.stock}</span>;
  }
  return <span className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{product.stock} un.</span>;
}

export default function CatalogoPage({ readOnly = false }: CatalogoPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canWrite = !readOnly && hasPermission(user?.permissions, 'catalog.write');
  const ownerId = user?.id ?? 'anonymous';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedWarehouse, setSelectedWarehouse] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStock, setFilterStock] = useState<'all' | 'in' | 'out'>('all');
  const [viewingLotsProduct, setViewingLotsProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await catalogService.getProducts();
      setProducts(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible cargar el catálogo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, [ownerId]);

  const filtered = useMemo(() => products.filter(product => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query || product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'Todos' || product.family === selectedCategory;
    const matchesWarehouse = selectedWarehouse === 'Todos' || product.warehouse === selectedWarehouse;
    const matchesStock = filterStock === 'all' || (filterStock === 'in' ? product.stock > 0 : product.stock === 0);
    return matchesSearch && matchesCategory && matchesWarehouse && matchesStock;
  }), [filterStock, products, searchTerm, selectedCategory, selectedWarehouse]);

  // Contar productos por bodega dinámicamente desde la BD
  const warehouseCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'Bodega Central': 0,
      'Bodega Oriental': 0,
      'Bodega Occidental': 0,
    };
    products.forEach(p => {
      if (counts[p.warehouse] !== undefined) {
        counts[p.warehouse] += 1;
      }
    });
    return counts;
  }, [products]);

  return (
    <div className="flex min-h-screen w-full justify-center bg-white dark:bg-slate-950 pb-20 md:bg-transparent md:pb-0">
      <div className="relative flex h-full w-full min-w-0 flex-col px-4 md:px-8 md:pt-4 xl:max-w-6xl">
        
        {/* Header */}
        <header className="z-40 flex flex-col gap-4 pb-2 pt-6 md:pt-0">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                className="-ml-2 min-h-11 min-w-11 rounded-xl p-2 text-slate-500 hover:text-brand-blue md:hidden" 
                aria-label="Volver"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="truncate text-2xl font-black tracking-tight text-slate-800 dark:text-white md:text-3xl">
                  Inventario & Catálogo
                </h1>
                <p className="text-[11px] font-black uppercase tracking-widest text-brand-blue">
                  Existencias por Bodega ({products.length} productos en BD)
                </p>
              </div>
            </div>
            {canWrite && (
              <button 
                type="button" 
                onClick={() => alert('Función de nuevo producto conectada con permisos de escritura.')} 
                className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-md shadow-brand-blue/20 transition-all hover:bg-brand-dark"
              >
                <Plus size={16} />
                <span className="hidden md:inline">Nuevo Producto</span>
              </button>
            )}
          </div>

          {/* Bodegas Selector Tabs (Dynamic counts from Supabase DB) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              type="button"
              onClick={() => setSelectedWarehouse('Todos')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedWarehouse === 'Todos'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <Warehouse size={15} /> Todas las Bodegas ({products.length})
            </button>
            {warehouses.map(w => (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedWarehouse(w.name)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedWarehouse === w.name
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white'
                }`}
              >
                <span>{w.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  selectedWarehouse === w.name ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {warehouseCounts[w.name] || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center rounded-2xl border border-surface-border dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-brand-blue/15">
              <Search size={18} className="mr-2 shrink-0 text-slate-400" />
              <input 
                type="search" 
                placeholder="Buscar por código, nombre..." 
                className="w-full bg-transparent text-sm font-medium text-slate-800 dark:text-white outline-none placeholder:text-slate-400" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
            <button 
              type="button" 
              onClick={() => setShowFilters(true)} 
              className={`flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-2xl border p-3 shadow-sm transition-all ${
                showFilters 
                  ? 'border-brand-blue bg-brand-blue text-white' 
                  : 'border-surface-border dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-brand-blue'
              }`}
            >
              <Filter size={18} />
            </button>
          </div>

          {/* Division Categories Tabs */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button 
                key={cat} 
                type="button" 
                onClick={() => setSelectedCategory(cat)} 
                className={`min-h-11 shrink-0 whitespace-nowrap rounded-xl border px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                  selectedCategory === cat 
                    ? 'border-brand-blue bg-brand-blue text-white shadow-md shadow-brand-blue/20' 
                    : 'border-surface-border dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-brand-blue/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {error && (
          <p role="alert" className="z-10 mb-4 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/50 p-4 text-sm font-semibold text-amber-800 dark:text-amber-300">
            {error}
          </p>
        )}

        {/* Products Grid from Database */}
        <div className="z-10 flex-1 overflow-y-auto pb-32 scrollbar-hide">
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? Array.from({ length: 6 }, (_, idx) => (
              <div key={idx} className="p-4 rounded-3xl border border-surface-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex gap-4">
                <Skeleton className="h-20 w-20 shrink-0 rounded-2xl" />
                <div className="flex-1 space-y-2 py-1"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
              </div>
            )) : filtered.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-3xl p-8">
                <PackageOpen size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                <p className="font-bold text-slate-800 dark:text-white">Sin productos encontrados en la base de datos</p>
                <p className="text-xs text-slate-400 mt-1">Pruebe seleccionando otra bodega o categoría.</p>
              </div>
            ) : filtered.map(product => (
              <article 
                key={product.id} 
                className="group relative rounded-3xl border border-surface-border dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card dark:shadow-card-dark transition-all hover:border-brand-blue/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 bg-brand-blue/10 text-brand-blue rounded-full text-[10px] font-black uppercase tracking-wider">
                      {product.sku}
                    </span>
                    <ProductStatus product={product} />
                  </div>

                  <h3 className="text-sm font-black text-slate-800 dark:text-white leading-tight">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-xs text-slate-400 font-medium line-clamp-2 mt-1.5 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-surface-border dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Precio Base</span>
                      <strong className="text-base font-black text-slate-800 dark:text-white">
                        ${product.price.toFixed(2)}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Bodega</span>
                      <span className="font-bold text-brand-blue">{product.warehouse}</span>
                    </div>
                  </div>
                </div>

                {/* Botón para ver ficha técnica */}
                <div className="pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setViewingLotsProduct(product)}
                    className="w-full py-2.5 bg-surface-soft dark:bg-slate-800 hover:bg-brand-blue/10 dark:hover:bg-brand-blue/20 text-brand-blue font-black text-[11px] uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Layers size={14} /> Ver Existencias & Lotes
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

      </div>

      {/* Modal de Filtros */}
      <BottomSheet open={showFilters} title="Filtros de Inventario" onClose={() => setShowFilters(false)}>
        <div className="space-y-6">
          <fieldset>
            <legend className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Disponibilidad en Existencia</legend>
            <div className="grid grid-cols-3 gap-2">
              {(['all', 'in', 'out'] as const).map(value => (
                <button 
                  key={value} 
                  type="button" 
                  onClick={() => setFilterStock(value)} 
                  className={`py-3 rounded-2xl border text-xs font-black uppercase transition-all ${
                    filterStock === value 
                      ? 'border-brand-blue bg-brand-blue text-white shadow-sm' 
                      : 'border-surface-border dark:border-slate-800 bg-surface-soft dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {value === 'all' ? 'Todos' : value === 'in' ? 'Con Stock' : 'Agotados'}
                </button>
              ))}
            </div>
          </fieldset>

          <button 
            type="button" 
            onClick={() => setShowFilters(false)} 
            className="w-full py-4 rounded-2xl bg-brand-blue text-xs font-black uppercase tracking-widest text-white shadow-md shadow-brand-blue/20"
          >
            Aplicar Filtros
          </button>
        </div>
      </BottomSheet>

      {/* Modal de Ficha de Producto y Existencias desde BD */}
      <BottomSheet
        open={Boolean(viewingLotsProduct)}
        title={`Ficha de Existencias`}
        onClose={() => setViewingLotsProduct(null)}
      >
        {viewingLotsProduct && (
          <div className="space-y-5 pb-4">
            
            <div className="border-b border-surface-border dark:border-slate-800 pb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">
                {viewingLotsProduct.sku} · {viewingLotsProduct.warehouse}
              </span>
              <h3 className="text-base font-black text-slate-800 dark:text-white mt-1 leading-tight">
                {viewingLotsProduct.name}
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-1">
                Presentación: {viewingLotsProduct.presentation} · Familia: {viewingLotsProduct.family}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
                Existencias en Base de Datos (Supabase)
              </p>

              <div className="p-4 bg-white dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-brand-blue/10 text-brand-blue font-black text-xs rounded-lg">
                    Código {viewingLotsProduct.sku}
                  </span>
                  <strong className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    Stock: {viewingLotsProduct.stock.toLocaleString()} unidades
                  </strong>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Warehouse size={13} className="text-brand-blue" /> {viewingLotsProduct.warehouse}
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-brand-blue">
                    Precio: ${viewingLotsProduct.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewingLotsProduct(null)}
              className="w-full py-4 bg-brand-blue text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all"
            >
              Cerrar Ficha
            </button>

          </div>
        )}
      </BottomSheet>

    </div>
  );
}
