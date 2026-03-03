'use client';
import { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { cn } from '@/src/shared/utils';
import { Search, Grid2X2, List, Plus, X, Loader2, Gem } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type EstadoJoya = 'Disponible' | 'Vendido' | 'En subasta';

interface Joya {
    id: string;
    nombre: string;
    codigo: string;
    subcategoria: string;
    imagen: string;
    estado: EstadoJoya;
    precio: number | null;
    costo: number;
    tipoVenta: 'Directa' | 'Subasta';
}

type FilterTab = 'Todos' | EstadoJoya;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JoyeriaPage() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [filterTab, setFilterTab] = useState<FilterTab>('Todos');
    const [joyas, setJoyas] = useState<Joya[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedJoya, setSelectedJoya] = useState<Joya | null>(null);
    const [showNuevaJoya, setShowNuevaJoya] = useState(false);

    const filterTabs: FilterTab[] = ['Todos', 'Disponible', 'Vendido', 'En subasta'];

    const fetchJoyas = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/joyeria');
            const data = res.ok ? await res.json() : [];
            setJoyas(Array.isArray(data) ? data : data.data ?? []);
        } catch (error) {
            console.error('Error fetching joyería:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchJoyas(); }, []);

    const filtered = joyas.filter(j => {
        const matchSearch = !search || j.nombre.toLowerCase().includes(search.toLowerCase()) || j.codigo?.toLowerCase().includes(search.toLowerCase());
        const matchTab = filterTab === 'Todos' || j.estado === filterTab;
        return matchSearch && matchTab;
    });

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className={cn('flex-1 transition-all duration-300', isCollapsed ? 'ml-20' : 'ml-64')}>
                <Topbar />

                <main className="p-8 pb-20">
                    <div className="flex items-center justify-end mb-6">
                        <button onClick={() => setShowNuevaJoya(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-colors">
                            <Plus className="w-4 h-4" /> Agregar pieza
                        </button>
                    </div>

                    {/* Search & Filters */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder-slate-400"
                                placeholder="Buscar por nombre o código..."
                                value={search} onChange={e => setSearch(e.target.value)} />
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
                            <p className="text-sm">Cargando joyería...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                            <Gem className="w-12 h-12 opacity-20" />
                            <p className="text-sm">No hay piezas de joyería registradas.</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                            {filtered.map(j => (
                                <div key={j.id} onClick={() => setSelectedJoya(j)}
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group overflow-hidden flex flex-col">
                                    <div className="h-52 bg-slate-100 overflow-hidden relative shrink-0">
                                        {j.imagen ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={j.imagen} alt={j.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><Gem className="w-8 h-8" /></div>
                                        )}
                                        <div className={cn('absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-sm',
                                            j.estado === 'Disponible' ? 'bg-white/90 text-[#40C4AA]' :
                                                j.estado === 'Vendido' ? 'bg-white/90 text-slate-500' :
                                                    'bg-yellow-500/90 text-white'
                                        )}>
                                            {j.estado}
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col gap-2 flex-1">
                                        <span className="text-[10px] font-bold text-slate-400">{j.codigo}</span>
                                        <h3 className="font-bold text-slate-800 text-sm leading-tight">{j.nombre}</h3>
                                        <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-50">
                                            <span className="text-xs text-slate-400 font-medium">{j.subcategoria}</span>
                                            {j.precio ? <span className="font-bold text-primary text-sm">${j.precio}</span> : <span className="text-xs text-slate-300">Sin precio</span>}
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
                                        {['Código', 'Nombre', 'Subcategoría', 'Estado', 'Tipo', 'Precio', 'Acciones'].map(h => (
                                            <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filtered.map(j => (
                                        <tr key={j.id} className="hover:bg-slate-50/50">
                                            <td className="px-5 py-4 text-sm font-bold text-slate-800">{j.codigo}</td>
                                            <td className="px-5 py-4 text-sm text-slate-700">{j.nombre}</td>
                                            <td className="px-5 py-4 text-sm text-slate-500">{j.subcategoria}</td>
                                            <td className="px-5 py-4">
                                                <span className={cn('px-2 py-1 rounded-lg text-xs font-bold',
                                                    j.estado === 'Disponible' ? 'bg-[#40C4AA]/10 text-[#40C4AA]' :
                                                        j.estado === 'Vendido' ? 'bg-slate-100 text-slate-500' :
                                                            'bg-yellow-100 text-yellow-600'
                                                )}>{j.estado}</span>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-500">{j.tipoVenta}</td>
                                            <td className="px-5 py-4 text-sm font-bold text-slate-800">{j.precio ? `$${j.precio}` : '—'}</td>
                                            <td className="px-5 py-4">
                                                <button onClick={() => setSelectedJoya(j)} className="text-sm font-semibold text-primary hover:underline">Ver</button>
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
            {selectedJoya && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-800">
                            <h2 className="text-lg font-bold text-white">Detalle — Joyería</h2>
                            <button onClick={() => setSelectedJoya(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div className="h-56 bg-slate-100 rounded-xl overflow-hidden">
                                {selectedJoya.imagen ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={selectedJoya.imagen} alt={selectedJoya.nombre} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Gem className="w-12 h-12" /></div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Código', value: selectedJoya.codigo },
                                    { label: 'Subcategoría', value: selectedJoya.subcategoria },
                                    { label: 'Estado', value: selectedJoya.estado },
                                    { label: 'Tipo de venta', value: selectedJoya.tipoVenta },
                                    { label: 'Costo', value: `$${selectedJoya.costo}` },
                                    { label: 'Precio', value: selectedJoya.precio ? `$${selectedJoya.precio}` : 'Sin precio' },
                                ].map(f => (
                                    <div key={f.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="text-xs text-slate-400 font-medium">{f.label}</p>
                                        <p className="font-bold text-slate-800 text-sm mt-0.5">{f.value}</p>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium mb-1">Nombre</p>
                                <p className="font-bold text-slate-800">{selectedJoya.nombre}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Nueva Joya Modal */}
            {showNuevaJoya && (
                <NuevaJoyaModal
                    onClose={() => setShowNuevaJoya(false)}
                    onSave={j => { setJoyas(prev => [...prev, j]); setShowNuevaJoya(false); }}
                />
            )}
        </div>
    );
}

// ─── Nueva Joya Modal ─────────────────────────────────────────────────────────

function NuevaJoyaModal({ onClose, onSave }: { onClose: () => void; onSave: (j: Joya) => void }) {
    const [form, setForm] = useState({ nombre: '', subcategoria: '', tipoVenta: 'Directa', precio: '', costo: '' });
    const [isSaving, setIsSaving] = useState(false);

    const subcategorias = ['Collares', 'Pulseras', 'Anillos', 'Aretes', 'Broches', 'Otros'];

    const handleSave = async () => {
        if (!form.nombre || !form.subcategoria) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/joyeria', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: form.nombre,
                    subcategoria: form.subcategoria,
                    tipoVenta: form.tipoVenta,
                    precio: form.precio ? parseFloat(form.precio) : null,
                    costo: form.costo ? parseFloat(form.costo) : 0,
                }),
            });
            if (res.ok) {
                const nueva = await res.json();
                onSave(nueva);
            } else {
                console.error('Error al crear joya:', await res.text());
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
                    <h2 className="text-lg font-bold text-white">Agregar pieza</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                    <div className="col-span-2 flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Nombre</label>
                        <input className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Pulsera dorada vintage" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Subcategoría</label>
                        <select className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" value={form.subcategoria} onChange={e => setForm(f => ({ ...f, subcategoria: e.target.value }))}>
                            <option value="">Seleccionar</option>
                            {subcategorias.map(s => <option key={s} value={s}>{s}</option>)}
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
                    <button onClick={handleSave} disabled={!form.nombre || !form.subcategoria || isSaving}
                        className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
