import { useState, useEffect } from 'react';
import { Search, Filter, PackageOpen, ArrowLeft, Plus, Edit2, X, Save, Loader2 } from 'lucide-react';
import { catalogService } from '../services/catalog.service';
import type { Product } from '../../../types';
import { Skeleton } from '../../../core/ui/Skeleton';
import { useNavigate } from 'react-router-dom';

export default function CatalogoPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['Todos', 'Fertilizantes', 'Semillas', 'Herbicidas', 'Fungicidas', 'Maquinaria'];
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStock, setFilterStock] = useState('all');

  // Estado para el Modal de Producto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    sku: '',
    name: '',
    description: '',
    family: 'Fertilizantes',
    price: 0,
    stock: 0,
    warehouse: 'Bodega Central',
    presentation: 'Unidad'
  });

  const fetchProducts = () => {
    setLoading(true);
    catalogService.getProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      sku: '',
      name: '',
      description: '',
      family: 'Fertilizantes',
      price: 0,
      stock: 0,
      warehouse: 'Bodega Central',
      presentation: 'Unidad'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description,
      family: product.family,
      price: product.price,
      stock: product.stock,
      warehouse: product.warehouse,
      presentation: product.presentation
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingProduct) {
        await catalogService.updateProduct(editingProduct.id, formData);
      } else {
        await catalogService.createProduct(formData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || p.family === selectedCategory;
    const matchesStock = filterStock === 'all' || (filterStock === 'in' ? p.stock > 0 : p.stock === 0);
    return matchesSearch && matchesCategory && matchesStock;
  });


  return (
    <div className="w-full min-h-screen flex justify-center bg-white md:bg-transparent pb-20 md:pb-0">
      
      <div className="w-full h-full xl:max-w-6xl flex flex-col relative md:pt-4 md:px-8">
        
        {/* Pattern Background strictly following brand guidelines */}
        <svg className="absolute top-0 right-10 w-24 h-32 pointer-events-none opacity-40 z-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 0 Q 10 60 70 40 Q 90 30 100 40" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" fill="none"/>
        </svg>

        {/* ─── Sticky Header ─── */}
        <div className="z-40 pt-6 pb-2 flex flex-col gap-5 md:pt-0">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-brand-blue transition-colors md:hidden">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="font-black text-xl md:text-2xl text-slate-800 tracking-tight">Catálogo</h2>
             </div>
             
             <div className="flex items-center gap-2">
                {filterStock !== 'all' && (
                  <button onClick={() => setFilterStock('all')} className="text-[9px] font-black text-brand-blue uppercase bg-brand-blue/5 px-3 py-1 rounded-full mr-2">
                    Limpiar Filtros
                  </button>
                )}
                <button 
                  onClick={openCreateModal}
                  className="bg-brand-blue text-white px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-brand-blue/20 hover:scale-105 transition-all"
                >
                  <Plus size={16} />
                  <span className="hidden md:inline">Nuevo Producto</span>
                </button>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-brand-blue/15 transition-all">
               <Search size={18} className="text-slate-400 mr-2" />
               <input 
                 type="text" 
                 placeholder="Buscar SKU o nombre..." 
                 className="w-full text-sm font-medium text-slate-700 bg-transparent outline-none placeholder:text-slate-300" 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
               />
            </div>
            <button 
              onClick={() => setShowFilters(true)}
              className={`p-3.5 rounded-2xl shadow-sm transition-all border ${showFilters ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-slate-400 border-slate-200 hover:border-brand-blue'}`}
            >
               <Filter size={18} />
            </button>
          </div>

          {/* Categories Pill Scroller */}
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-2 px-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                  ${selectedCategory === cat 
                    ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20' 
                    : 'bg-white text-slate-400 border-slate-100 hover:border-brand-blue/30'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Overlay Modal */}
        {showFilters && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-end md:items-center justify-center p-4">
             <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-xl font-black text-slate-800">Filtros Avanzados</h3>
                   <button onClick={() => setShowFilters(false)} className="p-2 text-slate-300">
                      <Filter size={20} />
                   </button>
                </div>

                <div className="space-y-8 mb-10">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Disponibilidad</p>
                      <div className="flex gap-3">
                         {['all', 'in', 'out'].map((s) => (
                           <button 
                             key={s} 
                             onClick={() => setFilterStock(s)}
                             className={`flex-1 py-3 rounded-2xl text-[11px] font-black uppercase border transition-all ${filterStock === s ? 'bg-brand-blue text-white border-brand-blue' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                           >
                              {s === 'all' ? 'Todos' : s === 'in' ? 'Stock' : 'Agotado'}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Orden de Precio</p>
                      <p className="text-sm font-medium text-slate-300 italic text-center">Próximamente integración APIM...</p>
                   </div>
                </div>

                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-full py-5 bg-brand-blue text-white rounded-3xl font-black text-[13px] uppercase tracking-widest shadow-lg shadow-brand-blue/20 active:scale-95 transition-all"
                >
                   Aplicar Filtros
                </button>
             </div>
          </div>
        )}

        {/* Product Form Modal (Create/Edit) */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">
                    {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Maestro de Artículos</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU / Código</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Ej: BIO-11-BL"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                      value={formData.sku}
                      onChange={e => setFormData({...formData, sku: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Familia</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all appearance-none"
                      value={formData.family}
                      onChange={e => setFormData({...formData, family: e.target.value})}
                    >
                      {categories.filter(c => c !== 'Todos').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Nombre descriptivo del artículo..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción Técnica</label>
                  <textarea 
                    rows={3}
                    placeholder="Detalles, usos y especificaciones..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all resize-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio ($)</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-black text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock</label>
                    <input 
                      required
                      type="number" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-black text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                      value={formData.stock}
                      onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pres.</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Galón, Saco..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                      value={formData.presentation}
                      onChange={e => setFormData({...formData, presentation: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                   <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                   >
                     Cancelar
                   </button>
                   <button 
                    disabled={isSaving}
                    type="submit"
                    className="flex-[2] bg-brand-blue text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-blue/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                   >
                     {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                     {editingProduct ? 'Guardar Cambios' : 'Crear Artículo'}
                   </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── Scrollable List ─── */}
        <div className="flex-1 overflow-y-auto pb-24 z-10 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
               Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-white p-4 rounded-3xl border border-slate-100 flex gap-4 shadow-sm">
                    <Skeleton className="w-20 h-20 rounded-2xl" />
                    <div className="flex-1 flex flex-col gap-2 justify-center">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
               ))
            ) : filtered.length === 0 ? (
               <div className="text-center py-20 flex flex-col items-center">
                 <PackageOpen size={48} className="text-slate-100 mb-4" />
                 <p className="font-bold text-slate-300">Sin productos</p>
               </div>
            ) : (
              filtered.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex gap-4 hover:border-brand-blue/30 transition-all cursor-pointer relative group"
                >
                  <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shrink-0 overflow-hidden relative">
                     <PackageOpen className="text-slate-200" size={32} />
                     <div className="absolute bottom-0 w-full bg-slate-100/80 py-1 text-center">
                       <span className="text-[9px] font-black text-slate-400 uppercase">{item.presentation}</span>
                     </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-brand-blue mb-1 uppercase tracking-wider">{item.sku}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-brand-blue transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                    <h4 className="font-bold text-[13px] text-slate-800 leading-tight mb-1 truncate">{item.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium mb-3 line-clamp-1">{item.description}</p>
                    
                    <div className="flex justify-between items-center mt-auto">
                      <span className="font-black text-base text-slate-800">${item.price.toFixed(2)}</span>
                      
                      {item.stock === 0 ? (
                        <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-red-100">Agotado</span>
                      ) : item.stock < 20 ? (
                        <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-orange-100">Solo {item.stock}</span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-100">{item.stock} uni.</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Decorative Dash Line Bottom */}
        <svg className="absolute bottom-[10%] right-6 w-2 h-40 pointer-events-none opacity-20" viewBox="0 0 10 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="5" y1="0" x2="5" y2="100" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" />
        </svg>

      </div>
    </div>
  );
}
