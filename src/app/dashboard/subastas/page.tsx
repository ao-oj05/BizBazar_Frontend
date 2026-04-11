import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { cn } from "@/src/shared/utils";
import { Plus, Loader2 } from "lucide-react";

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

    useEffect(() => {
        const fetchSubastas = async () => {
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
        fetchSubastas();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-20" : "ml-64")}>
                <Topbar />

                <main className="p-8 pb-20 max-w-7xl mx-auto">
                    
                    {/* Headers & Actions */}
                    <div className="flex items-center justify-between mb-8">
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

                    {/* Content */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-[#FACC15]" />
                            <p className="font-bold text-sm">Cargando subastas...</p>
                        </div>
                    ) : activeTab === 'Activas' ? (
                        subastas.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {subastas.map(subasta => (
                                    <div key={subasta.id} className="bg-white rounded-[24px] border-4 border-slate-50 shadow-xl shadow-slate-200/40 p-3 flex flex-col hover:border-yellow-100 transition-colors">
                                        
                                        {/* Top Banner (Yellow) */}
                                        <div className="bg-[#FACC15] rounded-xl py-2 mb-3 flex items-center justify-center gap-2 shadow-sm">
                                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                            <span className="text-white text-xs font-black tracking-wider">{subasta.estado}</span>
                                        </div>
                                        
                                        {/* Image */}
                                        <div className="w-full h-56 bg-slate-100 rounded-xl overflow-hidden mb-4 relative">
                                            {subasta.imagen ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={subasta.imagen} alt={subasta.nombre} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-bold uppercase">Sin Imagen</div>
                                            )}
                                        </div>
                                        
                                        <div className="px-2 flex flex-col flex-1">
                                            {/* Type Pill */}
                                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md w-max mb-3",
                                                subasta.tipo === 'Ropa' ? "text-[#40C4AA] bg-[#40C4AA]/10" : "text-[#FF8A9B] bg-[#FF8A9B]/10"
                                            )}>
                                                {subasta.tipo}
                                            </span>
                                            
                                            {/* Title & Code */}
                                            <h3 className="text-lg font-black text-slate-800 leading-tight mb-1 truncate">{subasta.nombre}</h3>
                                            <span className="text-xs font-bold text-slate-400 mb-4 block">{subasta.codigo}</span>
                                            
                                            {/* Price Box */}
                                            <div className="bg-slate-50 rounded-xl p-4 flex flex-col mb-4">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Precio inicial</span>
                                                <span className="text-3xl font-black text-[#FACC15]">${subasta.precioInicial.toFixed(2)}</span>
                                            </div>
                                            
                                            <div className="mt-auto flex flex-col gap-4">
                                                <span className="text-[11px] font-bold text-slate-400">{subasta.tiempo}</span>
                                                <button className="w-full py-3.5 bg-[#FACC15] hover:bg-[#FACC15]/90 text-white font-black text-sm rounded-xl shadow-lg shadow-yellow-400/30 transition-colors">
                                                    Cerrar subasta
                                                </button>
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
                                <h3 className="text-lg font-black text-slate-800 mb-1">Ninguna Subasta Activa</h3>
                                <p className="text-sm font-medium text-slate-500 max-w-sm">
                                    Actualmente no hay productos marcados en subasta. Marca productos como "En subasta" y aparecerán aquí.
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
