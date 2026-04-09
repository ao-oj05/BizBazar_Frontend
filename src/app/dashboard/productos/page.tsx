'use client';
import { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { cn } from '@/src/shared/utils';
import {
    Search, Grid2X2, List, Plus, X, ChevronLeft, ChevronRight,
    Loader2, Package
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type EstadoProducto = 'Disponible' | 'Vendido' | 'En subasta';

interface Producto {
    id: string;
    nombre: string;
    codigo: string;
    subcategoria: string;
    lote: string;
    loteId: string;
    imagen: string;
    estado: EstadoProducto;
    precio: number | null;
    costo: number;
    tipoVenta: 'Directa' | 'Subasta';
}

interface Lote {
    id: string;
    nombre: string;
    codigo: string;
}

type FilterTab = 'Todos' | EstadoProducto;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductosPage() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [filterTab, setFilterTab] = useState<FilterTab>('Todos');
    const [productos, setProductos] = useState<Producto[]>([]);
    const [lotes, setLotes] = useState<Lote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
    const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
    const [showNuevoProducto, setShowNuevoProducto] = useState(false);
    const [imgIndex, setImgIndex] = useState(0);

    const filterTabs: FilterTab[] = ['Todos', 'Disponible', 'Vendido', 'En subasta'];

    // Map raw backend row → frontend Producto shape
    const mapProducto = (raw: any): Producto => {
        // imagenes can be a JSON string, array, or null
        let imagenUrl = '';
        try {
            const imgs = typeof raw.imagenes === 'string' ? JSON.parse(raw.imagenes) : (raw.imagenes ?? []);
            imagenUrl = Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : '';
        } catch { imagenUrl = ''; }

        // Capitalise first letter of estado so it matches filter tabs
        const rawEstado: string = raw.estado ?? 'disponible';
        const estado = (rawEstado.charAt(0).toUpperCase() + rawEstado.slice(1).toLowerCase()) as Producto['estado'];

        return {
            id: raw.id,
            nombre: raw.nombre ?? '',
            codigo: raw.codigo ?? '',
            subcategoria: raw.subcategoria_nombre ?? raw.subcategoria ?? '',
            lote: raw.lote_nombre ?? raw.lote ?? '',
            loteId: raw.lote_id ?? raw.loteId ?? '',
            imagen: imagenUrl,
            estado,
            precio: raw.precio ?? null,
            costo: Number(raw.costo_base ?? raw.costo ?? 0),
            tipoVenta: raw.tipo_venta === 'subasta' ? 'Subasta' : 'Directa',
        };
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [resP, resL] = await Promise.all([
                fetch('/api/productos'),
                fetch('/api/lotes'),
            ]);
            const dataP = resP.ok ? await resP.json() : [];
            const dataL = resL.ok ? await resL.json() : [];
            const rawProductos: any[] = Array.isArray(dataP) ? dataP : (dataP.data ?? []);
            setProductos(rawProductos.map(mapProducto));
            setLotes(Array.isArray(dataL) ? dataL : (dataL.data ?? []));
        } catch (error) {
            console.error('Error fetching productos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = productos.filter(p => {
        const matchSearch = !search || p.nombre.toLowerCase().includes(search.toLowerCase()) || p.codigo?.toLowerCase().includes(search.toLowerCase());
        const matchTab = filterTab === 'Todos' || p.estado === filterTab;
        return matchSearch && matchTab;
    });

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className={cn('flex-1 transition-all duration-300', isCollapsed ? 'ml-20' : 'ml-64')}>
                <Topbar />

                <main className="p-8 pb-20">
                    <div className="flex items-center justify-end mb-6">
                        <button
                            onClick={() => setShowNuevoProducto(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Agregar producto
                        </button>
                    </div>

                    {/* Search & Filters */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder-slate-400"
                                placeholder="Buscar por nombre o código..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                                {filterTabs.map(tab => (
                                    <button key={tab} onClick={() => setFilterTab(tab)}
                                        className={cn('px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                                            filterTab === tab ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                        )}>
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                                <button onClick={() => setViewMode('grid')} className={cn('p-2 rounded-lg transition-colors', viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600')}>
                                    <Grid2X2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => setViewMode('list')} className={cn('p-2 rounded-lg transition-colors', viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600')}>
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm">Cargando productos...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                            <Package className="w-12 h-12 opacity-20" />
                            <p className="text-sm">No hay productos registrados.</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                            {filtered.map(p => (
                                <div key={p.id} onClick={() => { setSelectedProducto(p); setImgIndex(0); }}
                                    className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group overflow-hidden flex flex-col">
                                    <div className="h-52 bg-slate-100 overflow-hidden relative shrink-0">
                                        {p.imagen ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-8 h-8" /></div>
                                        )}
                                        
                                        {/* Top-left Code Pill */}
                                        <div className="absolute top-3 left-3 px-2 py-1 rounded bg-white text-slate-800 text-[11px] font-bold shadow-sm">
                                            {p.codigo}
                                        </div>
                                        
                                        {/* Top-right State Pill */}
                                        <div className={cn('absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm',
                                            p.estado === 'Disponible' ? 'bg-[#FF0080] text-white' :
                                                p.estado === 'Vendido' ? 'bg-slate-200 text-slate-600' :
                                                    'bg-yellow-400 text-white'
                                        )}>
                                            {p.estado}
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-1 bg-white">
                                        <h3 className="font-semibold text-[#1E293B] text-[18px] leading-tight mb-3">{p.nombre}</h3>
                                        
                                        <div className="flex items-center justify-between mb-4 mt-auto">
                                            {p.subcategoria ? (
                                                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#FF007F]/5 text-[#FF007F]/70">
                                                    {p.subcategoria}
                                                </span>
                                            ) : <span />}
                                            <span className="text-[17px] font-medium text-slate-500">
                                                ${Number(p.precio ?? p.costo ?? 0).toFixed(0)}
                                            </span>
                                        </div>
                                        
                                        <div className="text-[13px] text-slate-400">
                                            Lote: {p.lote}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        {['Código', 'Nombre', 'Lote', 'Subcategoría', 'Estado', 'Precio', 'Acciones'].map(h => (
                                            <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filtered.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50/50">
                                            <td className="px-5 py-4 text-sm font-bold text-slate-800">{p.codigo}</td>
                                            <td className="px-5 py-4 text-sm text-slate-700">{p.nombre}</td>
                                            <td className="px-5 py-4 text-sm text-slate-500">{p.lote}</td>
                                            <td className="px-5 py-4 text-sm text-slate-500">{p.subcategoria}</td>
                                            <td className="px-5 py-4">
                                                <span className={cn('px-2 py-1 rounded-lg text-xs font-bold',
                                                    p.estado === 'Disponible' ? 'bg-[#FF0080]/10 text-[#FF0080]' :
                                                        p.estado === 'Vendido' ? 'bg-slate-100 text-slate-500' :
                                                            'bg-yellow-100 text-yellow-600'
                                                )}>{p.estado}</span>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-bold text-slate-800">${Number(p.precio ?? p.costo ?? 0).toFixed(0)}</td>
                                            <td className="px-5 py-4">
                                                <button onClick={() => { setSelectedProducto(p); setImgIndex(0); }}
                                                    className="text-sm font-semibold text-primary hover:underline">Ver</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>

            {/* Detail Modal */}
            {selectedProducto && (
                <DetalleProductoModal
                    producto={selectedProducto}
                    imgIndex={imgIndex}
                    setImgIndex={setImgIndex}
                    onClose={() => setSelectedProducto(null)}
                    onEdit={() => {
                        setEditingProducto(selectedProducto);
                        setSelectedProducto(null);
                    }}
                />
            )}

            {/* Nuevo / Editar Producto Modal */}
            {(showNuevoProducto || editingProducto) && (
                <NuevoProductoModal
                    lotes={lotes}
                    productoToEdit={editingProducto || undefined}
                    onClose={() => { setShowNuevoProducto(false); setEditingProducto(null); }}
                    onSave={() => { fetchData(); setShowNuevoProducto(false); setEditingProducto(null); }}
                />
            )}
        </div>
    );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetalleProductoModal({ producto, imgIndex, setImgIndex, onClose, onEdit }:
    { producto: Producto; imgIndex: number; setImgIndex: (i: number) => void; onClose: () => void; onEdit: () => void }) {
    const images = producto.imagen ? [producto.imagen] : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden relative">
                
                {/* Close Button top-right absolute */}
                <button onClick={onClose} className="absolute right-4 top-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100/50 hover:bg-slate-100 text-slate-500 transition-colors">
                    <X className="w-4 h-4" />
                </button>

                {/* Body: 2-column layout missing header */}
                <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]">

                    {/* Left: Image (takes full height on the left) */}
                    <div className="relative bg-slate-50 min-h-[400px] h-full overflow-hidden flex items-center justify-center">
                        {images.length > 0 ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={images[imgIndex]}
                                alt={producto.nombre}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-300">
                                <Package className="w-12 h-12" />
                                <span className="text-xs font-semibold">Sin imagen</span>
                            </div>
                        )}
                        {images.length > 1 && (
                            <>
                                <button onClick={() => setImgIndex(Math.max(0, imgIndex - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow"><ChevronLeft className="w-4 h-4" /></button>
                                <button onClick={() => setImgIndex(Math.min(images.length - 1, imgIndex + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow"><ChevronRight className="w-4 h-4" /></button>
                            </>
                        )}
                    </div>

                    {/* Right: Details content matching the screenshot EXACTLY */}
                    <div className="p-8 pb-8 pt-8 flex flex-col items-start gap-4 h-full relative bg-white">

                        {/* Código */}
                        <div className="flex flex-col gap-1 w-full">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Código</span>
                            <span className="text-base font-bold text-[#FF0080]">{producto.codigo || '—'}</span>
                        </div>

                        {/* Nombre */}
                        <div className="flex flex-col gap-1 w-full mt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre</span>
                            <span className="text-2xl font-black text-[#1E293B] leading-tight">{producto.nombre}</span>
                        </div>

                        {/* Lote origen */}
                        <div className="flex flex-col gap-1 w-full mt-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lote origen</span>
                            <span className="text-[15px] font-bold text-[#1E293B]">{producto.lote || '—'}</span>
                        </div>

                        {/* Costo base and optional Precio */}
                        <div className="grid grid-cols-2 gap-4 w-full mt-2">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Costo base</span>
                                <span className="text-[28px] font-black text-[#FACC15]">${Number(producto.costo || 0).toFixed(2)}</span>
                            </div>
                            {producto.precio != null && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Precio Venta</span>
                                    <span className="text-[28px] font-black text-[#FF0080]">${Number(producto.precio).toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        {/* Estado actual */}
                        <div className="flex flex-col gap-1.5 w-full mt-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado actual</span>
                            <span className={cn('inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-bold w-max',
                                producto.estado === 'Disponible' ? 'bg-[#FF0080] text-white' :
                                    producto.estado === 'Vendido' ? 'bg-slate-200 text-slate-600' :
                                        'bg-[#FACC15] text-white'
                            )}>
                                {producto.estado}
                            </span>
                        </div>

                        {/* Spacer to push buttons to the bottom */}
                        <div className="flex-1 w-full"></div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 w-full mt-4">
                            {producto.estado === 'Disponible' && (
                                <button
                                    className="w-full py-3.5 rounded-xl bg-[#FF0080] hover:bg-[#FF0080]/90 text-white font-bold tracking-wide transition-colors"
                                    onClick={onClose}
                                >
                                    Registrar venta
                                </button>
                            )}
                            <button
                                className="w-full py-3.5 rounded-xl border-2 border-[#FF0080] text-[#FF0080] bg-white hover:bg-pink-50/50 font-bold tracking-wide transition-colors"
                                onClick={onEdit}
                            >
                                Editar producto
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



import { NuevoProductoModal } from '../components/NuevoProductoModal';
