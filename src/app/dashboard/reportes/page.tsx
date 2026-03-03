'use client';
import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { cn } from "@/src/shared/utils";
import { BarChart3, Calendar, Download, PieChart, TrendingUp, Package, Gem, Layers, Loader2 } from "lucide-react";

type ReportTab = 'Diario' | 'Por rango' | 'Por lote' | 'Por categoría' | 'Inventario actual';

// ─── Shared types ─────────────────────────────────────────────────────────────

interface MetricData {
    title: string;
    value: string | number;
    color?: string;
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({ title, value, icon: Icon, valueColor }: { title: string; value: string | number; icon?: any; valueColor?: string }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center justify-between">
            <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-400">{title}</span>
                <span className={cn("text-3xl font-black tracking-tight", valueColor || "text-slate-800")}>{value}</span>
            </div>
            {Icon && (
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 opacity-60">
                    <Icon className="w-6 h-6" />
                </div>
            )}
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Cargando reporte...</p>
        </div>
    );
}

// ─── Diario Tab ───────────────────────────────────────────────────────────────

function DiarioTab() {
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/reportes/diario?fecha=${fecha}`);
            if (res.ok) setData(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    }, [fecha]);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (isLoading) return <LoadingState />;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <input type="date" value={fecha} max={new Date().toISOString().split('T')[0]}
                        onChange={e => setFecha(e.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Ventas Ropa" value={data?.ventasRopa ?? 0} icon={Package} valueColor="text-[#40C4AA]" />
                <MetricCard title="Ventas Joyería" value={data?.ventasJoyeria ?? 0} icon={Gem} valueColor="text-primary" />
                <MetricCard title="Total Vendido" value={data?.totalVendido ?? '$0'} icon={TrendingUp} valueColor="text-[#40C4AA]" />
                <MetricCard title="Total Ganancia" value={data?.totalGanancia ?? '$0'} icon={TrendingUp} valueColor="text-[#EAB308]" />
                <MetricCard title="Subastas Cerradas" value={data?.subastasCerradas ?? 0} valueColor="text-primary" />
                <MetricCard title="Productos Agregados" value={data?.productosAgregados ?? 0} icon={Package} valueColor="text-[#40C4AA]" />
            </div>
            {/* Sales Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overflow-hidden">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Ventas de hoy</h3>
                <table className="w-full">
                    <thead className="border-b border-slate-100">
                        <tr>
                            {['Hora', 'Producto', 'Tipo', 'Precio', 'Ganancia'].map(h => (
                                <th key={h} className="text-left text-[10px] font-bold text-slate-400 uppercase pb-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(data?.ventas ?? []).length === 0 ? (
                            <tr><td colSpan={5} className="py-10 text-center text-slate-400 text-sm">Sin ventas para esta fecha.</td></tr>
                        ) : (data?.ventas ?? []).map((r: any, i: number) => (
                            <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                <td className="py-4 text-xs font-semibold text-slate-500">{r.hora}</td>
                                <td className="py-4 text-sm font-bold text-slate-800">{r.producto}</td>
                                <td className="py-4"><span className={cn("text-[10px] font-bold px-2 py-1 rounded-md", r.tipo === 'Subasta' ? "bg-[#FF9DAA]/10 text-[#FF8A9B]" : "bg-[#40C4AA]/10 text-[#40C4AA]")}>{r.tipo}</span></td>
                                <td className="py-4 text-sm font-bold text-slate-800">{r.precio}</td>
                                <td className="py-4 text-sm font-bold text-[#EAB308]">{r.ganancia}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Por Rango Tab ────────────────────────────────────────────────────────────

function PorRangoTab() {
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async () => {
        if (!desde || !hasta) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/reportes/rango?desde=${desde}&hasta=${hasta}`);
            if (res.ok) setData(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Desde:</span>
                    <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Hasta:</span>
                    <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <button onClick={fetchData} disabled={!desde || !hasta} className="px-4 py-1.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 disabled:opacity-40">Consultar</button>
            </div>
            {isLoading ? <LoadingState /> : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <MetricCard title="Total Vendido" value={data?.totalVendido ?? '$0'} valueColor="text-[#40C4AA]" />
                    <MetricCard title="Total Ganancia" value={data?.totalGanancia ?? '$0'} valueColor="text-[#EAB308]" />
                    <MetricCard title="Ventas Directas" value={data?.ventasDirectas ?? '$0'} valueColor="text-[#40C4AA]" />
                    <MetricCard title="Subastas" value={data?.subastas ?? '$0'} valueColor="text-primary" />
                </div>
            )}
        </div>
    );
}

// ─── Por Categoría Tab ────────────────────────────────────────────────────────

function PorCategoriaTab() {
    const [tipo, setTipo] = useState<'Ropa' | 'Joyería'>('Ropa');
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/reportes/categoria?tipo=${tipo}`);
            if (res.ok) setData(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    }, [tipo]);

    useEffect(() => { fetchData(); }, [fetchData]);

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 flex items-center gap-2 max-w-xs">
                {(['Ropa', 'Joyería'] as const).map(t => (
                    <button key={t} onClick={() => setTipo(t)}
                        className={cn("flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors",
                            tipo === t ? "bg-[#40C4AA] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                        )}>
                        {t}
                    </button>
                ))}
            </div>
            {isLoading ? <LoadingState /> : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <MetricCard title="Total Disponible" value={data?.totalDisponible ?? 0} valueColor="text-[#40C4AA]" />
                        <MetricCard title="Total Vendido" value={data?.totalVendido ?? 0} valueColor="text-slate-800" />
                        <MetricCard title="Ingresos" value={data?.ingresos ?? '$0'} valueColor="text-[#40C4AA]" />
                        <MetricCard title="Ganancia" value={data?.ganancia ?? '$0'} valueColor="text-[#EAB308]" />
                    </div>
                    {/* Top Products */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h3 className="text-sm font-bold text-slate-800 mb-6">Top productos más vendidos</h3>
                        <div className="flex flex-col gap-4">
                            {(data?.topProductos ?? []).length === 0 ? (
                                <p className="text-slate-400 text-sm text-center py-6">Sin datos disponibles.</p>
                            ) : (data?.topProductos ?? []).map((i: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{i.nombre}</p>
                                        <p className="text-xs text-slate-400 font-medium">{i.ventas} ventas</p>
                                    </div>
                                    <span className="text-sm font-bold text-[#EAB308]">{i.total}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Inventario Actual Tab ────────────────────────────────────────────────────

function InventarioActualTab() {
    const [estado, setEstado] = useState<'Disponible' | 'En subasta' | 'Vendido'>('Disponible');
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/reportes/inventario?estado=${estado}`);
            if (res.ok) setData(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    }, [estado]);

    useEffect(() => { fetchData(); }, [fetchData]);

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="Valor Total Disponible" value={data?.valorTotal ?? '$0'} valueColor="text-[#40C4AA]" />
                <MetricCard title="Items Disponibles" value={data?.itemsDisponibles ?? 0} valueColor="text-slate-800" />
                <MetricCard title="En Subasta" value={data?.enSubasta ?? '$0'} valueColor="text-[#FF9DAA]" />
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-slate-100 p-1.5 self-start">
                {(['Disponible', 'En subasta', 'Vendido'] as const).map(e => (
                    <button key={e} onClick={() => setEstado(e)}
                        className={cn("px-5 py-2 text-sm font-bold rounded-lg transition-colors",
                            estado === e ? "bg-[#40C4AA] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                        )}>
                        {e === 'En subasta' ? 'En subasta' : e}
                    </button>
                ))}
            </div>
            {isLoading ? <LoadingState /> : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {(data?.productos ?? []).length === 0 ? (
                            <div className="col-span-full py-16 text-center text-slate-400">
                                <p className="text-sm">No hay productos en este estado.</p>
                            </div>
                        ) : (data?.productos ?? []).map((p: any, i: number) => (
                            <div key={p.id ?? i} className="flex flex-col gap-2 group">
                                <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
                                    {p.imagen ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-6 h-6" /></div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 truncate">{p.nombre}</h4>
                                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{p.precio ? `$${p.precio}` : '—'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportesPage() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [activeTab, setActiveTab] = useState<ReportTab>('Diario');

    const tabs: { id: ReportTab; icon: any }[] = [
        { id: 'Diario', icon: BarChart3 },
        { id: 'Por rango', icon: Calendar },
        { id: 'Por lote', icon: Package },
        { id: 'Por categoría', icon: PieChart },
        { id: 'Inventario actual', icon: Layers },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-20" : "ml-64")}>
                <Topbar />

                <main className="p-8 pb-20 max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">Reportes</h1>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                            {tabs.map(t => (
                                <button key={t.id} onClick={() => setActiveTab(t.id)}
                                    className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                                        activeTab === t.id ? "bg-[#40C4AA] text-white shadow-md shadow-teal-200" : "text-slate-500 hover:bg-slate-50"
                                    )}>
                                    <t.icon className={cn("w-4 h-4", activeTab === t.id ? "text-white" : "text-slate-400")} />
                                    {t.id}
                                </button>
                            ))}
                        </div>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#40C4AA] hover:bg-[#40C4AA]/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-200 transition-colors">
                            <Download className="w-4 h-4" /> Exportar
                        </button>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeTab === 'Diario' && <DiarioTab />}
                        {activeTab === 'Por rango' && <PorRangoTab />}
                        {activeTab === 'Por categoría' && <PorCategoriaTab />}
                        {activeTab === 'Por lote' && (
                            <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center text-slate-400">
                                <Package className="w-12 h-12 mb-4 opacity-20" />
                                <p>Reporte en construcción</p>
                            </div>
                        )}
                        {activeTab === 'Inventario actual' && <InventarioActualTab />}
                    </div>
                </main>
            </div>
        </div>
    );
}
