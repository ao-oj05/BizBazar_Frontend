'use client';
import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { cn } from "@/src/shared/utils";
import { Search, Gavel, Clock, ChevronRight, X, Loader2 } from "lucide-react";

type SubastaEstado = 'Activa' | 'Cerrada';

interface SubastaItem {
    id: string;
    nombre: string;
    codigo: string;
    categoria: 'Ropa' | 'Joyería';
    imagen: string;
    precioBase: number;
    pujaActual: number;
    estado: SubastaEstado;
    tiempoRestante: number;
    pujas: number;
}

function formatTime(seconds: number) {
    if (seconds <= 0) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function SubastasPage() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [search, setSearch] = useState('');
    const [filterEstado, setFilterEstado] = useState<'Todas' | 'Activa' | 'Cerrada'>('Activa');
    const [subastas, setSubastas] = useState<SubastaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSubasta, setSelectedSubasta] = useState<SubastaItem | null>(null);
    const [pujaInput, setPujaInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchSubastas = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/subastas');
            const data = res.ok ? await res.json() : [];
            setSubastas(Array.isArray(data) ? data : data.data ?? []);
        } catch (error) {
            console.error('Error fetching subastas:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchSubastas(); }, []);

    // Countdown timer for active auctions (client-side decrement)
    useEffect(() => {
        const interval = setInterval(() => {
            setSubastas(prev => prev.map(s => {
                if (s.estado === 'Activa' && s.tiempoRestante > 0) {
                    return { ...s, tiempoRestante: s.tiempoRestante - 1 };
                }
                return s;
            }));
            setSelectedSubasta(prev => {
                if (prev && prev.estado === 'Activa' && prev.tiempoRestante > 0) {
                    return { ...prev, tiempoRestante: prev.tiempoRestante - 1 };
                }
                return prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const filtered = subastas.filter(s => {
        const matchSearch = !search || s.nombre.toLowerCase().includes(search.toLowerCase()) || s.codigo.toLowerCase().includes(search.toLowerCase());
        const matchTab = filterEstado === 'Todas' || s.estado === filterEstado;
        return matchSearch && matchTab;
    });

    const registrarPuja = async (id: string) => {
        const monto = parseFloat(pujaInput);
        const subasta = subastas.find(s => s.id === id);
        if (!subasta || !monto || monto <= subasta.pujaActual) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/subastas/${id}/puja`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ monto }),
            });
            if (res.ok) {
                setSubastas(prev => prev.map(s => s.id === id ? { ...s, pujaActual: monto, pujas: s.pujas + 1 } : s));
                setSelectedSubasta(prev => prev && prev.id === id ? { ...prev, pujaActual: monto, pujas: prev.pujas + 1 } : prev);
                setPujaInput('');
            }
        } catch (error) {
            console.error('Error registrando puja:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const cerrarSubasta = async (id: string) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/subastas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: 'Cerrada' }),
            });
            if (res.ok) {
                setSubastas(prev => prev.map(s => s.id === id ? { ...s, estado: 'Cerrada', tiempoRestante: 0 } : s));
                setSelectedSubasta(prev => prev && prev.id === id ? { ...prev, estado: 'Cerrada', tiempoRestante: 0 } : prev);
            }
        } catch (error) {
            console.error('Error cerrando subasta:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-20" : "ml-64")}>
                <Topbar />

                <main className="p-8">
                    <div className="flex items-center justify-end mb-6">
                        {/* El título ahora está en la Topbar */}
                    </div>

                    {/* Search & Filters */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder-slate-400 transition-all"
                                placeholder="Buscar subasta por producto o código..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {(['Todas', 'Activa', 'Cerrada'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setFilterEstado(tab)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                                        filterEstado === tab
                                            ? "bg-primary text-white shadow-sm shadow-primary/20"
                                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    {tab === 'Todas' ? 'Todas las subastas' : `Subastas ${tab}s`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm">Cargando subastas...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map(s => (
                                <div key={s.id} onClick={() => { setSelectedSubasta(s); setPujaInput(String(s.pujaActual + 10)); }}
                                    className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-lg transition-all group flex flex-col">
                                    <div className="h-48 bg-slate-100 relative overflow-hidden shrink-0">
                                        {s.imagen ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={s.imagen} alt={s.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><Gavel className="w-10 h-10" /></div>
                                        )}
                                        <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm backdrop-blur-sm">
                                            {s.codigo}
                                        </div>
                                        <div className={cn(
                                            "absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-bold shadow-sm backdrop-blur-sm flex items-center gap-1.5",
                                            s.estado === 'Activa' ? "bg-[#EAB308]/90 text-white" : "bg-slate-700/90 text-white"
                                        )}>
                                            <Gavel className="w-3 h-3" />{s.estado}
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", s.categoria === 'Ropa' ? "text-[#40C4AA] bg-[#40C4AA]/10" : "text-primary bg-primary/10")}>
                                                {s.categoria}
                                            </span>
                                            <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
                                                <Clock className="w-3.5 h-3.5" />
                                                {s.estado === 'Activa' ? formatTime(s.tiempoRestante) : 'Finalizada'}
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight mb-4">{s.nombre}</h3>
                                        <div className="mt-auto grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium tracking-wide">PRECIO BASE</p>
                                                <p className="font-bold text-slate-700 text-sm">${s.precioBase}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium tracking-wide">PUJA ACTUAL ({s.pujas})</p>
                                                <p className="font-bold text-[#40C4AA] text-lg">${s.pujaActual}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                                    <Gavel className="w-12 h-12 opacity-20 mb-4" />
                                    <p>No se encontraron subastas.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Modal */}
            {selectedSubasta && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 shrink-0">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Gavel className="w-5 h-5 text-primary" /> Detalle de Subasta
                            </h2>
                            <button onClick={() => setSelectedSubasta(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                                    {selectedSubasta.imagen ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={selectedSubasta.imagen} alt={selectedSubasta.nombre} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><Gavel /></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400">{selectedSubasta.codigo}</p>
                                            <h3 className="font-bold text-slate-800 text-lg leading-tight">{selectedSubasta.nombre}</h3>
                                        </div>
                                        <span className={cn("text-xs font-bold px-2 py-1 rounded-md",
                                            selectedSubasta.estado === 'Activa' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                                        )}>
                                            {selectedSubasta.estado}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-50 p-2 rounded-lg inline-flex">
                                        <Clock className="w-4 h-4 text-primary" />
                                        {selectedSubasta.estado === 'Activa' ? `Tiempo restante: ${formatTime(selectedSubasta.tiempoRestante)}` : 'Subasta Finalizada'}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-slate-400">Precio Base</span>
                                    <span className="text-xl font-bold text-slate-800">${selectedSubasta.precioBase}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-slate-400">Total Pujas</span>
                                    <span className="text-xl font-bold text-slate-800">{selectedSubasta.pujas}</span>
                                </div>
                                <div className="col-span-2 flex justify-between items-end border-t border-slate-200 pt-3 mt-1">
                                    <span className="text-sm font-bold text-slate-500">Puja Actual Ganadora</span>
                                    <span className="text-3xl font-bold text-[#EAB308]">${selectedSubasta.pujaActual}</span>
                                </div>
                            </div>
                            {selectedSubasta.estado === 'Activa' && (
                                <div className="flex flex-col gap-3">
                                    <p className="text-sm font-bold text-slate-800">Registrar nueva puja</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={pujaInput}
                                            onChange={e => setPujaInput(e.target.value)}
                                            className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        />
                                        <button
                                            onClick={() => registrarPuja(selectedSubasta.id)}
                                            disabled={isSubmitting || parseFloat(pujaInput) <= selectedSubasta.pujaActual}
                                            className="bg-[#40C4AA] hover:bg-[#40C4AA]/90 text-white font-bold px-6 rounded-xl transition-colors shadow-lg shadow-teal-200 flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Pujar <ChevronRight className="w-4 h-4" /></>}
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => cerrarSubasta(selectedSubasta.id)}
                                        disabled={isSubmitting}
                                        className="w-full mt-2 py-3 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        Cerrar subasta anticipadamente
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
