'use client';
import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { cn } from '@/src/shared/utils';
import { Search, Grid2X2, List, Plus, X, Loader2, Gem, Camera } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type EstadoJoya = 'Disponible' | 'Vendido';

interface Joya {
    id: string;
    nombre: string;
    codigo: string;
    subcategoria: string;
    imagen: string;
    estado: EstadoJoya;
    precio: number | null;
    costo: number;
    tipoVenta: 'Directa';
    categoria: string;
}

type FilterTab = 'Todos' | EstadoJoya;

interface Lote {
    id: string;
    nombre: string;
    codigo: string;
    tipo?: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JoyeriaPage() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [filterTab, setFilterTab] = useState<FilterTab>('Todos');
    const [joyas, setJoyas] = useState<Joya[]>([]);
    const [lotes, setLotes] = useState<Lote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedJoya, setSelectedJoya] = useState<Joya | null>(null);
    const [showNuevaJoya, setShowNuevaJoya] = useState(false);
    const [isUploadingDetalle, setIsUploadingDetalle] = useState(false);
    const detalleFileRef = useRef<HTMLInputElement>(null);

    const filterTabs: FilterTab[] = ['Todos', 'Disponible', 'Vendido'];

    // Map raw backend row → frontend Joya shape
    const mapJoya = (raw: any): Joya => {
        let imagenUrl = '';
        try {
            const imgs = typeof raw.imagenes === 'string' ? JSON.parse(raw.imagenes) : (raw.imagenes ?? []);
            imagenUrl = Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : (raw.imagen ?? '');
        } catch { imagenUrl = raw.imagen ?? ''; }

        const rawEstado: string = (raw.estado ?? 'disponible').replace(/_/g, ' ');
        const estado = (rawEstado.charAt(0).toUpperCase() + rawEstado.slice(1).toLowerCase()) as Joya['estado'];

        return {
            id: raw.id,
            nombre: raw.nombre ?? '',
            codigo: raw.codigo ?? '',
            subcategoria: raw.subcategoria_nombre ?? raw.subcategoria ?? '',
            imagen: imagenUrl,
            estado,
            precio: raw.precio ?? null,
            costo: Number(raw.costo_base ?? raw.costo ?? 0),
            tipoVenta: 'Directa',
            categoria: raw.categoria ?? 'joyeria',
        };
    };

    const fetchJoyas = async () => {
        setIsLoading(true);
        try {
            const [resJ, resL] = await Promise.all([
                fetch('/api/joyeria'),
                fetch('/api/lotes'),
            ]);
            const dataJ = resJ.ok ? await resJ.json() : [];
            const dataL = resL.ok ? await resL.json() : [];
            
            const raw: any[] = Array.isArray(dataJ) ? dataJ : (dataJ.data ?? []);
            setJoyas(raw.map(mapJoya));
            
            const rawLotes: any[] = Array.isArray(dataL) ? dataL : (dataL.data ?? []);
            setLotes(rawLotes);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => { fetchJoyas(); }, []);

    const uploadDetalleImage = async (file: File) => {
        if (!selectedJoya) return;
        setIsUploadingDetalle(true);
        try {
            const fd = new FormData();
            fd.append('imagen', file);
            const res = await fetch('/api/uploads', { method: 'POST', body: fd });
            const data = await res.json();
            if (res.ok && data.success) {
                // Update the selected joya with the new image and refresh list
                setSelectedJoya(prev => prev ? { ...prev, imagen: data.data.url } : prev);
                setJoyas(prev => prev.map(j => j.id === selectedJoya.id ? { ...j, imagen: data.data.url } : j));
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setIsUploadingDetalle(false);
        }
    };

    const filtered = joyas.filter(j => {
        const isJoyeria = j.categoria.toLowerCase() === 'joyeria' || j.categoria.toLowerCase() === 'joyería';
        const matchSearch = !search || j.nombre.toLowerCase().includes(search.toLowerCase()) || j.codigo?.toLowerCase().includes(search.toLowerCase());
        const matchTab = filterTab === 'Todos' || j.estado === filterTab;
        return isJoyeria && matchSearch && matchTab;
    });

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className={cn('flex-1 transition-all duration-300', isCollapsed ? 'ml-20' : 'ml-64')}>
                <Topbar />

                <main className="p-8 pb-20">
                    <div className="flex items-center justify-end mb-6">
                        <button onClick={() => setShowNuevaJoya(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#29AFFF] hover:bg-[#2596D7] text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-200 transition-colors">
                            <Plus className="w-4 h-4" /> Agregar pieza
                        </button>
                    </div>

                    {/* Search & Filters */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#29AFFF]/20 placeholder-slate-400"
                                placeholder="Buscar por nombre o código..."
                                value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                                {filterTabs.map(tab => (
                                    <button key={tab} onClick={() => setFilterTab(tab)}
                                        className={cn('px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                                            filterTab === tab ? 'bg-[#29AFFF] text-white shadow-sm shadow-sky-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                        )}>
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                                <button onClick={() => setViewMode('grid')} className={cn('p-2 rounded-lg transition-colors', viewMode === 'grid' ? 'bg-white shadow-sm text-[#29AFFF]' : 'text-slate-400 hover:text-slate-600')}>
                                    <Grid2X2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => setViewMode('list')} className={cn('p-2 rounded-lg transition-colors', viewMode === 'list' ? 'bg-white shadow-sm text-[#29AFFF]' : 'text-slate-400 hover:text-slate-600')}>
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-[#29AFFF]" />
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
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-[#29AFFF]/20 transition-all cursor-pointer group overflow-hidden flex flex-col">
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
                                            {j.precio ? <span className="font-bold text-[#29AFFF] text-sm">${j.precio}</span> : <span className="text-xs text-slate-300">Sin precio</span>}
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
                                                    j.estado === 'Disponible' ? 'bg-[#40C4AA]/10 text-[#40C4AA]' : 'bg-slate-100 text-slate-500'
                                                )}>{j.estado}</span>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-500">{j.tipoVenta}</td>
                                            <td className="px-5 py-4 text-sm font-bold text-slate-800">{j.precio ? `$${j.precio}` : '—'}</td>
                                            <td className="px-5 py-4">
                                                <button onClick={() => setSelectedJoya(j)} className="text-sm font-semibold text-[#29AFFF] hover:underline">Ver</button>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-[#1E293B]">Detalle de Joyería</h2>
                            <button onClick={() => setSelectedJoya(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body: 2-column layout */}
                        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] bg-white">

                            {/* Left: Image */}
                            <div className="p-6 pr-3 flex flex-col gap-3">
                                <div className="bg-slate-50 relative rounded-xl w-full h-[400px] flex items-center justify-center group overflow-hidden">
                                     {selectedJoya.imagen ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={selectedJoya.imagen} alt={selectedJoya.nombre} className="w-full h-full object-cover" />
                                     ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                                            <Gem className="w-12 h-12" />
                                            <span className="text-xs font-semibold">Sin imagen</span>
                                        </div>
                                     )}
                                     
                                     {/* Upload overlay */}
                                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                                         <button
                                             onClick={() => detalleFileRef.current?.click()}
                                             disabled={isUploadingDetalle}
                                             className="flex items-center gap-2 bg-white/90 hover:bg-white text-slate-700 text-xs font-bold px-4 py-2 rounded-xl shadow-lg transition-colors"
                                         >
                                             {isUploadingDetalle ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                                             {selectedJoya.imagen ? 'Cambiar foto' : 'Subir foto'}
                                         </button>
                                     </div>
                                     <input
                                         ref={detalleFileRef}
                                         type="file"
                                         accept="image/*"
                                         className="hidden"
                                         onChange={e => e.target.files?.[0] && uploadDetalleImage(e.target.files[0])}
                                     />
                                </div>
                            </div>

                            {/* Right: Details */}
                            <div className="p-6 pl-3 flex flex-col items-start gap-4 h-full relative">

                                {/* Código */}
                                <div className="flex flex-col gap-1 w-full">
                                    <span className="text-xs font-medium text-slate-400">Código</span>
                                    <span className="text-lg font-bold text-[#29AFFF]">{selectedJoya.codigo || '—'}</span>
                                </div>

                                {/* Nombre & Subcategoria label */}
                                <div className="flex flex-col gap-1 w-full mt-2">
                                    <span className="text-xs font-medium text-slate-400">Nombre</span>
                                    <span className="text-2xl font-bold text-[#1E293B] leading-tight">{selectedJoya.nombre}</span>
                                    {selectedJoya.subcategoria && (
                                        <span className="mt-2 inline-flex items-center px-4 py-1 rounded-full text-xs font-bold text-[#29AFFF] bg-[#29AFFF]/10">
                                            {selectedJoya.subcategoria}
                                        </span>
                                    )}
                                </div>

                                {/* Costo Individual */}
                                <div className="flex flex-col gap-1 w-full mt-4">
                                    <span className="text-xs font-medium text-slate-400">Costo individual</span>
                                    <span className="text-4xl font-bold text-[#FACC15]">${Number(selectedJoya.costo || 0).toFixed(0)}</span>
                                </div>

                                {/* Estado actual */}
                                <div className="flex flex-col gap-1.5 w-full mt-4">
                                    <span className="text-xs font-medium text-slate-400">Estado actual</span>
                                    <span className={cn('inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-bold w-max',
                                        selectedJoya.estado === 'Disponible' ? 'bg-[#40C4AA] text-white' :
                                            selectedJoya.estado === 'Vendido' ? 'bg-slate-200 text-slate-600' :
                                                'bg-[#FACC15] text-white'
                                    )}>
                                        {selectedJoya.estado}
                                    </span>
                                </div>

                                {/* Spacer to push buttons to the bottom */}
                                <div className="flex-1 w-full"></div>

                                {/* Actions */}
                                <div className="flex flex-col gap-3 w-full mt-6">
                                    {selectedJoya.estado === 'Disponible' && (
                                        <button
                                            className="w-full py-3.5 rounded-xl bg-[#40C4AA] hover:bg-[#38b098] text-white font-bold tracking-wide transition-colors"
                                            onClick={() => setSelectedJoya(null)}
                                        >
                                            Registrar venta
                                        </button>
                                    )}
                                    <button
                                        className="w-full py-3.5 rounded-xl border-2 border-[#29AFFF] text-[#29AFFF] bg-white hover:bg-[#29AFFF]/5 font-bold tracking-wide transition-colors"
                                        onClick={() => setSelectedJoya(null)}
                                    >
                                        Editar joyería
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Nueva Joya Modal */}
            {showNuevaJoya && (
                <NuevaJoyaModal
                    lotes={lotes}
                    onClose={() => setShowNuevaJoya(false)}
                    onSave={j => { setJoyas(prev => [...prev, j]); setShowNuevaJoya(false); }}
                />
            )}
        </div>
    );
}

import { NuevaJoyaModal } from '../components/NuevaJoyaModal';
