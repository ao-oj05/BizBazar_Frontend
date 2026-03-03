'use client';
import { useState, useEffect, useRef } from 'react';
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
    const [showNuevoProducto, setShowNuevoProducto] = useState(false);
    const [imgIndex, setImgIndex] = useState(0);

    const filterTabs: FilterTab[] = ['Todos', 'Disponible', 'Vendido', 'En subasta'];

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [resP, resL] = await Promise.all([
                fetch('/api/productos'),
                fetch('/api/lotes'),
            ]);
            const dataP = resP.ok ? await resP.json() : [];
            const dataL = resL.ok ? await resL.json() : [];
            setProductos(Array.isArray(dataP) ? dataP : dataP.data ?? []);
            setLotes(Array.isArray(dataL) ? dataL : dataL.data ?? []);
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
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-slate-800">Productos — Ropa</h1>
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
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group overflow-hidden flex flex-col">
                                    <div className="h-52 bg-slate-100 overflow-hidden relative shrink-0">
                                        {p.imagen ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-8 h-8" /></div>
                                        )}
                                        <div className={cn('absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-sm',
                                            p.estado === 'Disponible' ? 'bg-white/90 text-[#40C4AA]' :
                                                p.estado === 'Vendido' ? 'bg-white/90 text-slate-500' :
                                                    'bg-yellow-500/90 text-white'
                                        )}>
                                            {p.estado}
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col gap-2 flex-1">
                                        <span className="text-[10px] font-bold text-slate-400">{p.codigo}</span>
                                        <h3 className="font-bold text-slate-800 text-sm leading-tight">{p.nombre}</h3>
                                        <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-50">
                                            <span className="text-xs text-slate-400 font-medium">{p.subcategoria}</span>
                                            {p.precio ? <span className="font-bold text-primary text-sm">${p.precio}</span> : <span className="text-xs text-slate-300">Sin precio</span>}
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
                                                    p.estado === 'Disponible' ? 'bg-[#40C4AA]/10 text-[#40C4AA]' :
                                                        p.estado === 'Vendido' ? 'bg-slate-100 text-slate-500' :
                                                            'bg-yellow-100 text-yellow-600'
                                                )}>{p.estado}</span>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-bold text-slate-800">{p.precio ? `$${p.precio}` : '—'}</td>
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
                />
            )}

            {/* Nuevo Producto Modal */}
            {showNuevoProducto && (
                <NuevoProductoModal
                    lotes={lotes}
                    onClose={() => setShowNuevoProducto(false)}
                    onSave={p => { setProductos(prev => [...prev, p]); setShowNuevoProducto(false); }}
                />
            )}
        </div>
    );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetalleProductoModal({ producto, imgIndex, setImgIndex, onClose }:
    { producto: Producto; imgIndex: number; setImgIndex: (i: number) => void; onClose: () => void }) {
    // For now we only have one image per product; carousel ready for multiple
    const images = producto.imagen ? [producto.imagen] : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between px-6 py-4 bg-slate-800">
                    <h2 className="text-lg font-bold text-white">Detalle de producto</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-6 flex flex-col gap-6">
                    {/* Image */}
                    <div className="h-64 bg-slate-100 rounded-xl overflow-hidden relative">
                        {images.length > 0 ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={images[imgIndex]} alt={producto.nombre} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-12 h-12" /></div>
                        )}
                        {images.length > 1 && (
                            <>
                                <button onClick={() => setImgIndex(Math.max(0, imgIndex - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1"><ChevronLeft className="w-4 h-4" /></button>
                                <button onClick={() => setImgIndex(Math.min(images.length - 1, imgIndex + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1"><ChevronRight className="w-4 h-4" /></button>
                            </>
                        )}
                    </div>
                    {/* Info */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Código', value: producto.codigo },
                            { label: 'Subcategoría', value: producto.subcategoria },
                            { label: 'Lote', value: producto.lote },
                            { label: 'Tipo de venta', value: producto.tipoVenta },
                            { label: 'Costo', value: `$${producto.costo}` },
                            { label: 'Precio', value: producto.precio ? `$${producto.precio}` : 'Sin precio' },
                        ].map(f => (
                            <div key={f.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-xs text-slate-400 font-medium">{f.label}</p>
                                <p className="font-bold text-slate-800 text-sm mt-1">{f.value}</p>
                            </div>
                        ))}
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium mb-2">Nombre</p>
                        <p className="font-bold text-slate-800">{producto.nombre}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Nuevo Producto Modal ─────────────────────────────────────────────────────

function NuevoProductoModal({ lotes, onClose, onSave }:
    { lotes: Lote[]; onClose: () => void; onSave: (p: Producto) => void }) {
    const [form, setForm] = useState({ nombre: '', subcategoria: '', loteId: '', tipoVenta: 'Directa', precio: '', costo: '' });
    const [isSaving, setIsSaving] = useState(false);

    const subcategorias = ['Blusas', 'Pantalones', 'Vestidos', 'Chamarras', 'Shorts', 'Faldas', 'Tops', 'Otros'];

    const handleSave = async () => {
        if (!form.nombre || !form.subcategoria || !form.loteId) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/productos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: form.nombre,
                    subcategoria: form.subcategoria,
                    loteId: form.loteId,
                    tipoVenta: form.tipoVenta,
                    precio: form.precio ? parseFloat(form.precio) : null,
                    costo: form.costo ? parseFloat(form.costo) : 0,
                }),
            });
            if (res.ok) {
                const newProducto = await res.json();
                onSave(newProducto);
            } else {
                console.error('Error al crear producto:', await res.text());
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between px-6 py-4 bg-slate-800">
                    <h2 className="text-lg font-bold text-white">Agregar producto</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                    <div className="col-span-2 flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Nombre del producto</label>
                        <input className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Blusa floreada azul" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Subcategoría</label>
                        <select className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" value={form.subcategoria} onChange={e => setForm(f => ({ ...f, subcategoria: e.target.value }))}>
                            <option value="">Seleccionar</option>
                            {subcategorias.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Lote</label>
                        <select className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" value={form.loteId} onChange={e => setForm(f => ({ ...f, loteId: e.target.value }))}>
                            <option value="">Seleccionar lote</option>
                            {lotes.map(l => <option key={l.id} value={l.id}>{l.nombre} ({l.codigo})</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Tipo de venta</label>
                        <select className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" value={form.tipoVenta} onChange={e => setForm(f => ({ ...f, tipoVenta: e.target.value }))}>
                            <option value="Directa">Directa</option>
                            <option value="Subasta">Subasta</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Costo</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <input type="number" className="w-full border border-slate-200 rounded-xl pl-7 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="0" value={form.costo} onChange={e => setForm(f => ({ ...f, costo: e.target.value }))} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Precio de venta</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <input type="number" className="w-full border border-slate-200 rounded-xl pl-7 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="0" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} />
                        </div>
                    </div>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancelar</button>
                    <button onClick={handleSave} disabled={!form.nombre || !form.subcategoria || !form.loteId || isSaving}
                        className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
