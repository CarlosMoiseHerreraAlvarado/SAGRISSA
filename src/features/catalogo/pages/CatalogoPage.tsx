import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Edit2, Filter, Loader2, PackageOpen, Plus, Save, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { catalogService } from '../services/catalog.service';
import type { Product } from '../../../types';
import { useAuth } from '../../../core/hooks/useAuth';
import { syncService } from '../../../core/api/sync.service';
import { BottomSheet } from '../../../core/ui/BottomSheet';
import { Skeleton } from '../../../core/ui/Skeleton';
import { hasPermission } from '../../../core/auth/permissions';

interface CatalogoPageProps {
  readOnly?: boolean;
}

const categories = ['Todos', 'Fertilizantes', 'Semillas', 'Herbicidas', 'Fungicidas', 'Maquinaria'];
const emptyForm: Omit<Product, 'id'> = {
  sku: '',
  name: '',
  description: '',
  family: 'Fertilizantes',
  price: 0,
  stock: 0,
  warehouse: 'Bodega Central',
  presentation: 'Unidad',
};

function ProductStatus({ product }: { product: Product }) {
  if (product.syncStatus === 'pending' || product.queuedOffline) {
    return <span className="rounded-lg border border-amber-100 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">Pendiente</span>;
  }
  if (product.syncStatus === 'failed') {
    return <span className="rounded-lg border border-red-100 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">Revisar</span>;
  }
  if (product.stock === 0) {
    return <span className="rounded-lg border border-red-100 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">Agotado</span>;
  }
  if (product.stock < 20) {
    return <span className="rounded-lg border border-orange-100 bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-600">Solo {product.stock}</span>;
  }
  return <span className="rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">{product.stock} uni.</span>;
}

export default function CatalogoPage({ readOnly = false }: CatalogoPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canWrite = !readOnly && hasPermission(user?.permissions, 'catalog.write');
  const ownerId = user?.id ?? 'anonymous';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStock, setFilterStock] = useState<'all' | 'in' | 'out'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(emptyForm);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await catalogService.getProducts();
      setProducts(data);
      if (data.length === 0 && !navigator.onLine) setError('No hay un catálogo guardado para este usuario. Conéctese para cargarlo.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible cargar el catálogo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, [ownerId]);

  useEffect(() => {
    if (!canWrite) return;
    const refreshSyncState = async () => {
      const [pending, failed] = await Promise.all([syncService.getQueue(ownerId), syncService.getFailedQueue(ownerId)]);
      const catalogTasks = [...pending, ...failed].filter(task => task.resource === 'catalog');
      setProducts(current => current.map(product => {
        const task = catalogTasks.find(candidate => {
          const endpointId = candidate.endpoint.startsWith('/productos/') ? decodeURIComponent(candidate.endpoint.split('/').pop() ?? '') : '';
          return endpointId === product.id || (candidate.endpoint === '/productos' && String(candidate.payload.sku ?? '') === product.sku);
        });
        if (!task) return product.syncStatus === 'pending' || product.syncStatus === 'failed' ? { ...product, queuedOffline: false, syncStatus: 'synced', syncError: undefined } : product;
        return task.status === 'failed'
          ? { ...product, queuedOffline: false, syncStatus: 'failed', syncError: task.lastError }
          : { ...product, queuedOffline: true, syncStatus: 'pending', syncTaskId: task.id };
      }));
    };
    void refreshSyncState();
    const interval = window.setInterval(() => void refreshSyncState(), 5000);
    return () => window.clearInterval(interval);
  }, [canWrite, ownerId]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setSaveError('');
    setFormData({ ...emptyForm });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setSaveError('');
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description,
      family: product.family,
      price: product.price,
      stock: product.stock,
      warehouse: product.warehouse,
      presentation: product.presentation,
    });
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    if (!isSaving) setIsModalOpen(false);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canWrite) return;
    setIsSaving(true);
    setSaveError('');
    try {
      const result = editingProduct
        ? await catalogService.updateProduct(editingProduct.id, formData)
        : await catalogService.createProduct(formData);
      const nextProduct = editingProduct ? { ...editingProduct, ...result } : result;
      const nextProducts = editingProduct
        ? products.map(product => product.id === editingProduct.id ? nextProduct : product)
        : [...products, nextProduct];
      setProducts(nextProducts);
      await syncService.saveCatalogLocally(nextProducts, ownerId);
      setIsModalOpen(false);
      setStatusMessage(result.queuedOffline ? 'Producto guardado localmente y pendiente de sincronización.' : 'Producto guardado correctamente.');
      window.setTimeout(() => setStatusMessage(''), 5000);
      if (!result.queuedOffline) void fetchProducts();
    } catch (caught) {
      setSaveError(caught instanceof Error ? caught.message : 'No fue posible guardar el producto.');
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = useMemo(() => products.filter(product => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query || product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'Todos' || product.family === selectedCategory;
    const matchesStock = filterStock === 'all' || (filterStock === 'in' ? product.stock > 0 : product.stock === 0);
    return matchesSearch && matchesCategory && matchesStock;
  }), [filterStock, products, searchTerm, selectedCategory]);

  return (
    <div className="flex min-h-screen w-full justify-center bg-white pb-20 md:bg-transparent md:pb-0">
      <div className="relative flex h-full w-full min-w-0 flex-col px-4 md:px-8 md:pt-4 xl:max-w-6xl">
        <svg className="pointer-events-none absolute right-10 top-0 z-0 h-32 w-24 opacity-40" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <path d="M 0 0 Q 10 60 70 40 Q 90 30 100 40" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" fill="none" />
        </svg>

        <header className="z-40 flex flex-col gap-5 pb-2 pt-6 md:pt-0">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => navigate(-1)} className="-ml-2 min-h-11 min-w-11 rounded-xl p-2 text-slate-500 transition-colors hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue md:hidden" aria-label="Volver">
                <ArrowLeft size={20} aria-hidden="true" />
              </button>
              <h1 className="truncate text-xl font-black tracking-tight text-slate-800 md:text-2xl">Catálogo</h1>
            </div>
            {canWrite && (
              <button type="button" onClick={openCreateModal} aria-label="Crear nuevo producto" className="flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-brand-blue/20 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2">
                <Plus size={16} aria-hidden="true" />
                <span className="hidden md:inline">Nuevo Producto</span>
              </button>
            )}
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all focus-within:ring-2 focus-within:ring-brand-blue/15">
              <Search size={18} className="mr-2 shrink-0 text-slate-400" aria-hidden="true" />
              <label htmlFor="catalog-search" className="sr-only">Buscar por SKU o nombre</label>
              <input id="catalog-search" type="search" placeholder="Buscar SKU o nombre..." className="min-w-0 w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} />
            </div>
            <button type="button" onClick={() => setShowFilters(true)} aria-label="Abrir filtros" aria-haspopup="dialog" aria-expanded={showFilters} className={`flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-2xl border p-3 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${showFilters ? 'border-brand-blue bg-brand-blue text-white' : 'border-slate-200 bg-white text-slate-400 hover:border-brand-blue'}`}>
              <Filter size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide" role="tablist" aria-label="Categorías de productos">
            {categories.map(category => (
              <button key={category} type="button" role="tab" aria-selected={selectedCategory === category} onClick={() => setSelectedCategory(category)} className={`min-h-11 shrink-0 whitespace-nowrap rounded-xl border px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${selectedCategory === category ? 'border-brand-blue bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'border-slate-100 bg-white text-slate-400 hover:border-brand-blue/30'}`}>
                {category}
              </button>
            ))}
          </div>
        </header>

        {error && <p role="alert" className="z-10 mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{error}</p>}
        {!isOnline && <p role="status" className="z-10 mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800">Modo offline: mostrando el último catálogo guardado.</p>}
        {statusMessage && <p role="status" aria-live="polite" className="z-10 mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{statusMessage}</p>}

        <div className="z-10 flex-1 overflow-y-auto pb-24 scrollbar-hide">
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <Skeleton className="h-20 w-20 shrink-0 rounded-2xl" />
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
              </div>
            )) : filtered.length === 0 ? (
              <div className="col-span-full flex flex-col items-center py-20 text-center">
                <PackageOpen size={48} className="mb-4 text-slate-100" aria-hidden="true" />
                <p className="font-bold text-slate-300">Sin productos</p>
                <p className="mt-2 max-w-sm text-sm text-slate-400">Prueba con otra búsqueda o categoría.</p>
              </div>
            ) : filtered.map(product => (
              <article key={product.id} className="group relative flex min-h-[120px] min-w-0 gap-3 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:border-brand-blue/30 sm:gap-4 sm:p-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 sm:h-24 sm:w-24">
                  <PackageOpen className="text-slate-200" size={32} aria-hidden="true" />
                  <div className="absolute bottom-0 w-full bg-slate-100/80 py-1 text-center"><span className="block truncate px-1 text-[9px] font-black uppercase text-slate-400">{product.presentation}</span></div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <span className="min-w-0 truncate text-[10px] font-bold uppercase tracking-wider text-brand-blue">{product.sku}</span>
                    {canWrite && <button type="button" onClick={() => openEditModal(product)} aria-label={`Editar ${product.name}`} className="min-h-11 min-w-11 shrink-0 rounded-xl p-1.5 text-slate-400 transition-colors hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue md:opacity-0 md:group-hover:opacity-100"><Edit2 size={15} className="mx-auto" aria-hidden="true" /></button>}
                  </div>
                  <h2 className="line-clamp-2 text-[13px] font-bold leading-tight text-slate-800">{product.name}</h2>
                  {product.description?.trim() && <p className="mt-1 line-clamp-1 text-[11px] font-medium text-slate-400">{product.description}</p>}
                  <div className="mt-2 flex min-w-0 items-center justify-between gap-2"><span className="truncate text-base font-black text-slate-800">${product.price.toFixed(2)}</span><ProductStatus product={product} /></div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <svg className="pointer-events-none absolute bottom-[10%] right-6 z-0 h-40 w-2 opacity-20" viewBox="0 0 10 100" fill="none" aria-hidden="true"><line x1="5" y1="0" x2="5" y2="100" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" /></svg>
      </div>

      <BottomSheet open={showFilters} title="Filtros avanzados" onClose={() => setShowFilters(false)}>
        <div className="space-y-8">
          <fieldset>
            <legend className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Disponibilidad</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(['all', 'in', 'out'] as const).map(value => <button key={value} type="button" onClick={() => setFilterStock(value)} aria-pressed={filterStock === value} className={`min-h-12 rounded-2xl border text-[11px] font-black uppercase transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${filterStock === value ? 'border-brand-blue bg-brand-blue text-white' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>{value === 'all' ? 'Todos' : value === 'in' ? 'Stock' : 'Agotado'}</button>)}
            </div>
          </fieldset>
          <div><p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Orden de precio</p><p className="text-center text-sm font-medium italic text-slate-300">Próximamente integración APIM...</p></div>
          <button type="button" onClick={() => setShowFilters(false)} className="min-h-14 w-full rounded-3xl bg-brand-blue text-[13px] font-black uppercase tracking-widest text-white shadow-lg shadow-brand-blue/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2">Aplicar filtros</button>
        </div>
      </BottomSheet>

      <BottomSheet open={isModalOpen} title={editingProduct ? 'Editar producto' : 'Nuevo producto'} onClose={closeProductModal}>
        <form onSubmit={handleSave} className="max-h-[calc(100dvh-9rem)] space-y-6 overflow-y-auto pb-[max(0.5rem,env(safe-area-inset-bottom))]" aria-describedby={saveError ? 'catalog-save-error' : undefined}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Maestro de artículos</p>
          {saveError && <p id="catalog-save-error" role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{saveError}</p>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label htmlFor="product-sku" className="space-y-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">SKU / Código<input id="product-sku" required type="text" placeholder="Ej: BIO-11-BL" className="min-h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-bold normal-case tracking-normal text-slate-700 outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" value={formData.sku} onChange={event => setFormData({ ...formData, sku: event.target.value.toUpperCase() })} /></label>
            <label htmlFor="product-family" className="space-y-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Familia<select id="product-family" className="min-h-12 w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-bold normal-case tracking-normal text-slate-700 outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" value={formData.family} onChange={event => setFormData({ ...formData, family: event.target.value })}>{categories.filter(category => category !== 'Todos').map(category => <option key={category} value={category}>{category}</option>)}</select></label>
          </div>
          <label htmlFor="product-name" className="block space-y-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre completo<input id="product-name" required type="text" placeholder="Nombre descriptivo del artículo..." className="min-h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-bold normal-case tracking-normal text-slate-700 outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" value={formData.name} onChange={event => setFormData({ ...formData, name: event.target.value })} /></label>
          <label htmlFor="product-description" className="block space-y-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Descripción técnica<textarea id="product-description" rows={3} placeholder="Detalles, usos y especificaciones..." className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium normal-case tracking-normal text-slate-700 outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" value={formData.description} onChange={event => setFormData({ ...formData, description: event.target.value })} /></label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label htmlFor="product-price" className="space-y-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Precio ($)<input id="product-price" required min="0" step="0.01" type="number" className="min-h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-black normal-case tracking-normal text-slate-700 outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" value={formData.price} onChange={event => setFormData({ ...formData, price: Number(event.target.value) })} /></label>
            <label htmlFor="product-stock" className="space-y-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Stock<input id="product-stock" required min="0" type="number" className="min-h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-black normal-case tracking-normal text-slate-700 outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" value={formData.stock} onChange={event => setFormData({ ...formData, stock: Number(event.target.value) })} /></label>
            <label htmlFor="product-presentation" className="space-y-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Presentación<input id="product-presentation" required type="text" placeholder="Galón, saco..." className="min-h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-bold normal-case tracking-normal text-slate-700 outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" value={formData.presentation} onChange={event => setFormData({ ...formData, presentation: event.target.value })} /></label>
          </div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={closeProductModal} className="min-h-14 flex-1 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">Cancelar</button><button disabled={isSaving} type="submit" className="flex min-h-14 flex-[2] items-center justify-center gap-3 rounded-2xl bg-brand-blue text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-blue/20 transition-transform active:scale-95 disabled:cursor-wait disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2">{isSaving ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <Save size={18} aria-hidden="true" />}{isSaving ? 'Guardando' : editingProduct ? 'Guardar cambios' : 'Crear artículo'}</button></div>
        </form>
      </BottomSheet>
    </div>
  );
}
