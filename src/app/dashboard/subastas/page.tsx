'use client';
import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { cn } from "@/src/shared/utils";
import { Plus, Loader2, Search, X, Trophy, DollarSign, User, Calculator } from "lucide-react";

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
    const [subastaToClose, setSubastaToClose] = useState<SubastaItem | null>(null);

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
                                    <div key={subasta.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#FACC15] transition-all overflow-hidden flex flex-col group curso-pointer">
                                        
                                        {/* Image Area */}
                                        <div className="h-52 bg-slate-100 overflow-hidden relative shrink-0">
                                            {subasta.imagen ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={subasta.imagen} alt={subasta.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase tracking-widest bg-slate-50">Sin Imagen</div>
                                            )}
                                            
                                            {/* Code Pill */}
                                            <div className="absolute top-3 left-3 px-2 py-1 rounded bg-white/90 text-[10px] font-black text-slate-500 backdrop-blur-sm z-20 shadow-sm">
                                                {subasta.codigo}
                                            </div>
                                            
                                            {/* State Pill */}
                                            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black shadow-sm z-20 bg-[#FACC15] text-white flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                                {subasta.estado}
                                            </div>

                                            {/* Type Pill */}
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
                                                <div className="flex items-end justify-between mb-3">
                                                    <div>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Precio inicial</span>
                                                        <span className="text-[20px] font-black text-[#FACC15] leading-none">${subasta.precioInicial.toFixed(0)}</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400">{subasta.tiempo}</span>
                                                </div>
                                                
                                                <button 
                                                    onClick={() => setSubastaToClose(subasta)}
                                                    className="w-full py-2.5 bg-[#FACC15] hover:bg-[#FACC15]/90 text-white font-black text-[11px] uppercase tracking-wider rounded-xl shadow-md shadow-yellow-400/20 transition-all active:scale-95"
                                                >
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

            {subastaToClose && (
                <CerrarSubastaModal 
                    subasta={subastaToClose} 
                    onClose={() => setSubastaToClose(null)} 
                    onSuccess={() => fetchData()} 
                />
            )}
        </div>
    );
}

// ─── Modal Components ─────────────────────────────────────────────────────────

function CerrarSubastaModal({ subasta, onClose, onSuccess }: { subasta: SubastaItem; onClose: () => void; onSuccess?: () => void }) {
    const [precioFinal, setPrecioFinal] = useState<number | ''>('');
    const [ganadora, setGanadora] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const costoBase = subasta.precioInicial;
    const ganancia = (Number(precioFinal) || 0) - costoBase;

    const handleCerrar = async () => {
        if (!precioFinal || !ganadora.trim()) {
            return alert("Por favor ingresa el precio final y el nombre de la ganadora.");
        }
        setIsSubmitting(true);
        try {
            const body = {
                items: [{ producto_id: subasta.id, precio_venta: Number(precioFinal), tipo: subasta.tipo }],
                cliente_nombre: ganadora.trim(),
            };
            const res = await fetch('/api/ventas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                alert("Error al intentar cerrar la subasta.");
            }
        } catch (e) {
            console.error(e);
            alert("Error al cerrar subasta");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 overflow-hidden relative border border-slate-100">
                
                <button onClick={onClose} className="absolute right-4 top-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors">
                    <X className="w-4 h-4" />
                </button>

                {/* Banner */}
                <div className="bg-[#FACC15] p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#EAB308] rounded-full blur-xl -ml-8 -mb-8"></div>
                    
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30 shadow-inner relative z-10">
                        <Trophy className="w-8 h-8 text-white drop-shadow-md" />
                    </div>
                    <h2 className="text-2xl font-black text-white leading-tight relative z-10 drop-shadow-sm">Cerrar Subasta</h2>
                    <p className="text-yellow-50 font-medium text-sm mt-1.5 relative z-10 opacity-90">{subasta.nombre}</p>
                </div>

                <div className="p-7 flex flex-col gap-5">
                    {/* Costo Base */}
                    <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100/80 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-400 border border-slate-100">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Costo Base / Lote</p>
                                <p className="text-lg font-black text-slate-700 leading-none mt-0.5">${costoBase.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="flex flex-col gap-4 mt-1">
                        <div>
                            <label className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-[#FACC15]" /> Nombre de la Ganadora
                            </label>
                            <input 
                                type="text"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FACC15]/30 focus:border-[#FACC15] transition-all shadow-sm"
                                placeholder="Ej. Ana García"
                                value={ganadora}
                                onChange={e => setGanadora(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5 text-[#FACC15]" /> Precio Final Alcanzado
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                                <input 
                                    type="number"
                                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xl font-black text-[#FACC15] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/30 focus:border-[#FACC15] transition-all shadow-sm placeholder-[#FACC15]/30"
                                    placeholder="0.00"
                                    value={precioFinal}
                                    onChange={e => setPrecioFinal(Number(e.target.value) || '')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ganancia Calculada */}
                    <div className="mt-2 bg-[#40C4AA]/10 border border-[#40C4AA]/20 p-4 rounded-xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2 text-[#40C4AA]">
                            <Calculator className="w-5 h-5 bg-white rounded-md p-0.5 shadow-sm" />
                            <span className="text-[11px] font-black uppercase tracking-wider">Ganancia Neta</span>
                        </div>
                        <span className="text-2xl font-black text-[#40C4AA] drop-shadow-sm">${ganancia > 0 ? ganancia.toFixed(2) : '0.00'}</span>
                    </div>

                    <button 
                        onClick={handleCerrar}
                        disabled={isSubmitting || !precioFinal || !ganadora.trim()}
                        className="w-full mt-3 py-4 bg-[#FACC15] hover:bg-[#EAB308] disabled:opacity-50 disabled:hover:bg-[#FACC15] text-white font-black text-sm rounded-xl shadow-lg shadow-yellow-400/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trophy className="w-5 h-5" />}
                        {isSubmitting ? 'CERRANDO SUBASTA...' : 'CONFIRMAR Y CERRAR SUBASTA'}
                    </button>
                </div>
            </div>
        </div>
    );
}
