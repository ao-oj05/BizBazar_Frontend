'use client';
import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { cn } from "@/src/shared/utils";
import { Plus, Loader2, Search } from "lucide-react";

interface SubastaItem {
    id: string;
    tipo: string;
    nombre: string;
    codigo: string;
    precioInicial: number;
    estado: string;
    tiempo: string;
    imagen: string;
}

function getTimeAgo(dateString: string) {
    if (!dateString) return 'Hace un momento';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Hace un momento';
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins > 0 ? `Hace ${diffMins} min` : 'Hace un momento';
    }
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
}

export default function SubastasPage() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [activeTab, setActiveTab] = useState<'Activas' | 'Finalizadas'>('Activas');
    const [isLoading, setIsLoading] = useState(true);
    const [subastas, setSubastas] = useState<SubastaItem[]>([]);
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/productos');
            const data = res.ok ? await res.json() : [];
            const allItems = Array.isArray(data) ? data : data.data || [];
            
            const filtrados = allItems.filter((p:any) => p.estado && p.estado.toLowerCase() === 'en_subasta');
            
            const formatizados: SubastaItem[] = filtrados.map((p: any) => {
                const isJoya = (p.categoria || p.tipo || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 'joyeria';
                return {
                    id: p.id || p._id,
                    tipo: isJoya ? 'Joyería' : 'Ropa',
                    nombre: p.nombre || 'Sin nombre',
                    codigo: p.codigo || 'S/N',
                    precioInicial: Number(p.precio || p.costo_base || p.costo || 0),
                    estado: 'EN VIVO',
                    tiempo: getTimeAgo(p.created_at || p.fecha),
                    imagen: p.imagenes?.[0] || p.imagen || ''
                };
            });
            
            setSubastas(formatizados);
        } catch (error) {
            console.error("Error fetching subastas", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredSubastas = subastas.filter(s => 
        !search || 
        s.nombre.toLowerCase().includes(search.toLowerCase()) || 
        s.codigo.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-20" : "ml-64")}>
                <Topbar />

                <main className="p-8 pb-20">
                    
                    {/* Headers & Actions */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center bg-white rounded-xl shadow-sm border border-slate-100 p-1">
                            <button 
                                onClick={() => setActiveTab('Activas')}
                                className={cn("px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2", 
                                    activeTab === 'Activas' ? "bg-[#FACC15] text-white shadow-md shadow-yellow-400/30" : "text-slate-500 hover:bg-slate-50"
                                )}
                            >
                                <span className={cn("w-2 h-2 rounded-full", activeTab === 'Activas' ? "bg-white" : "bg-slate-300")} />
                                Activas ({subastas.length})
                            </button>
                            <button 
                                onClick={() => setActiveTab('Finalizadas')}
                                className={cn("px-6 py-2.5 rounded-lg text-sm font-bold transition-colors", 
                                    activeTab === 'Finalizadas' ? "bg-[#FACC15] text-white shadow-md shadow-yellow-400/30" : "text-slate-500 hover:bg-slate-50"
                                )}
                            >
                                Finalizadas
                            </button>
                        </div>

                        <button className="flex items-center gap-2 bg-[#FACC15] hover:bg-[#FACC15]/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-yellow-400/20 transition-all">
                            <Plus className="w-4 h-4" /> Nueva Subasta
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 relative">
                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]/30 placeholder-slate-400 transition-shadow"
                            placeholder="Buscar subasta por nombre o código..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-[#FACC15]" />
                            <p className="font-bold text-sm">Cargando subastas...</p>
                        </div>
                    ) : activeTab === 'Activas' ? (
                        filteredSubastas.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                                {filteredSubastas.map(subasta => (
                                    <div key={subasta.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#FACC15] transition-all overflow-hidden flex flex-col group cursor-pointer">
                                        
                                        {/* Image Area - standardized to h-52 exactly like products */}
                                        <div className="h-52 bg-slate-100 overflow-hidden relative shrink-0">
                                            {subasta.imagen ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={subasta.imagen} alt={subasta.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase tracking-widest bg-slate-50">Sin Imagen</div>
                                            )}
                                            
                                            {/* Top-left Code Pill */}
                                            <div className="absolute top-3 left-3 px-2 py-1 rounded bg-white/90 text-[10px] font-black text-slate-500 backdrop-blur-sm z-20 shadow-sm">
                                                {subasta.codigo}
                                            </div>
                                            
                                            {/* Top-right State Pill (EN VIVO) */}
                                            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black shadow-sm z-20 bg-[#FACC15] text-white flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                                {subasta.estado}
                                            </div>

                                            {/* Type Pill bottom-left of image */}
                                            <div className={cn("absolute bottom-3 left-3 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider z-20 shadow-sm backdrop-blur-md", 
                                                subasta.tipo === 'Ropa' ? "text-[#40C4AA] bg-white/95" : "text-[#FF8A9B] bg-white/95"
                                            )}>
                                                {subasta.tipo}
                                            </div>
                                        </div>
                                        
                                        {/* Info Area */}
                                        <div className="p-4 flex flex-col flex-1 bg-white">
                                            <h3 className="font-bold text-slate-800 text-[15px] leading-tight mb-4 line-clamp-2" title={subasta.nombre}>
                                                {subasta.nombre}
                                            </h3>
                                            
                                            <div className="mt-auto">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Precio inicial</span>
                                                <span className="text-[22px] font-black text-[#FACC15] leading-none">${subasta.precioInicial.toFixed(0)}</span>
                                                
                                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                                                    <span className="text-[10px] font-bold text-slate-400">{subasta.tiempo}</span>
                                                    <span className="text-[10px] font-black text-[#FACC15] bg-[#FACC15]/10 px-2.5 py-1.5 rounded-lg hover:bg-[#FACC15]/20 transition-colors">
                                                        VER DETALLE
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[24px] border border-slate-100 shadow-sm text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl text-slate-300">⚖️</span>
                                </div>
                                <h3 className="text-lg font-black text-slate-800 mb-1">
                                    {search ? "No se encontraron resultados" : "Ninguna Subasta Activa"}
                                </h3>
                                <p className="text-sm font-medium text-slate-500 max-w-sm">
                                    {search 
                                        ? "No hay productos en subasta que coincidan con tu búsqueda."
                                        : "Actualmente no hay productos marcados en subasta. Marca productos como 'En subasta' y aparecerán aquí."}
                                </p>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[24px] border border-slate-100 shadow-sm text-center">
                            <h3 className="text-lg font-black text-slate-800 mb-1">Cero Subastas Finalizadas</h3>
                            <p className="text-sm font-medium text-slate-500 max-w-sm">No existen registros de subastas terminadas aún.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
