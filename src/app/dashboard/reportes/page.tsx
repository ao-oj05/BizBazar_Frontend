import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { cn } from "@/src/shared/utils";
import { BarChart3, Calendar, Download, PieChart, TrendingUp, Package, Gem, Layers, Loader2, Tag, Diamond } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type ReportTab = 'Diario' | 'Por rango' | 'Por lote' | 'Por categoría' | 'Inventario actual';

// ─── Shared types ─────────────────────────────────────────────────────────────

interface VentaReporte {
    hora: string;
    producto: string;
    tipo: 'Directa' | 'Subasta';
    precio: string;
    ganancia: string;
}

interface ReporteDiarioResponse {
    ventasRopa: number;
    ventasJoyeria: number;
    totalVendido: string;
    totalGanancia: string;
    subastasCerradas: number;
    productosAgregados: number;
    ventas: VentaReporte[];
}

interface ReporteRangoResponse {
    totalVentas: number;
    totalVendido: string;
    totalGanancia: string;
    ventasDirectas: string;
    subastas: string;
    periodo: string;
    ventas: VentaReporte[];
}

interface ReporteCategoriaResponse {
    categoria: string;
    totalVendido: string;
    totalDisponible: number;
    ingresos: string;
    ganancia: string;
    cantidadProductos: number;
    precioPromedio: string;
    productos: {
        id: string;
        nombre: string;
        tipoVenta: string;
        precio: number;
        estado: string;
    }[];
}

interface ReporteInventarioResponse {
    totalProductos: number;
    valorInventario: string;
    costoTotal: string;
    gananciaProyectada: string;
    articulos: {
        id: string;
        nombre: string;
        lote: string;
        estado: string;
        costo: number;
        precio: number | null;
        imagen?: string;
    }[];
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({ title, value, icon: Icon, valueColor }: { title: string; value: string | number; icon?: React.ElementType; valueColor?: string }) {
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

function DiarioTab({ onExportReady }: { onExportReady: (exportFn: () => void) => void }) {
    const today = new Date().toLocaleDateString('en-CA');
    const [fecha, setFecha] = useState(today);
    const [data, setData] = useState<ReporteDiarioResponse | null>(null);
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

    const handleExport = useCallback(() => {
        import("@/src/shared/report-utils").then(({ generatePDFReport }) => {
            generatePDFReport({
                title: "Reporte Diario de Ventas",
                subtitle: `Resumen de operaciones del día`,
                dateRange: fecha,
                columns: ["Hora", "Producto", "Tipo", "Precio", "Ganancia"],
                rows: (data?.ventas ?? []).map((v) => [v.hora, v.producto, v.tipo, v.precio, v.ganancia]),
                filename: `Reporte_Diario_${fecha}`
            });
        });
    }, [data, fecha]);

    useEffect(() => {
        onExportReady(handleExport);
    }, [handleExport, onExportReady]);

    if (isLoading) return <LoadingState />;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <input type="date" value={fecha} max={today}
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
                        ) : (data?.ventas ?? []).map((r, i) => (
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

function PorRangoTab({ onExportReady }: { onExportReady: (exportFn: () => void) => void }) {
    const today = new Date().toLocaleDateString('en-CA');
    const [desde, setDesde] = useState(today);
    const [hasta, setHasta] = useState(today);
    const [data, setData] = useState<ReporteRangoResponse | null>(null);
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

    const handleExport = useCallback(() => {
        import("@/src/shared/report-utils").then(({ generatePDFReport }) => {
            generatePDFReport({
                title: "Reporte de Ventas por Rango",
                subtitle: "Resumen consolidado",
                dateRange: (desde && hasta) ? `${desde} al ${hasta}` : 'Rango no especificado',
                columns: ["Métrica", "Valor"],
                rows: [
                    ["Total Vendido", data?.totalVendido ?? '$0'],
                    ["Total Ganancia", data?.totalGanancia ?? '$0'],
                    ["Ventas Directas", data?.ventasDirectas ?? '$0'],
                    ["Subastas", data?.subastas ?? '$0']
                ],
                filename: `Reporte_Rango_${desde || 'inicio'}_${hasta || 'fin'}`
            });
        });
    }, [data, desde, hasta]);

    useEffect(() => {
        onExportReady(handleExport);
    }, [handleExport, onExportReady]);

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

function PorCategoriaTab({ onExportReady }: { onExportReady: (exportFn: () => void) => void }) {
    const [tipo, setTipo] = useState<'Ropa' | 'Joyería'>('Ropa');
    const [data, setData] = useState<ReporteCategoriaResponse | null>(null);
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

    const handleExport = useCallback(() => {
        import("@/src/shared/report-utils").then(({ generatePDFReport }) => {
            generatePDFReport({
                title: "Reporte por Categoría",
                subtitle: `Ventas y top productos`,
                category: tipo,
                columns: ["Producto", "Ventas", "Total"],
                rows: (data?.productos ?? []).map((p) => [p.nombre, 1, `$${p.precio}`]),
                filename: `Reporte_Categoria_${tipo}`
            });
        });
    }, [data, tipo]);

    useEffect(() => {
        onExportReady(handleExport);
    }, [handleExport, onExportReady]);

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
                            {(data?.productos ?? []).length === 0 ? (
                                <p className="text-slate-400 text-sm text-center py-6">Sin datos disponibles.</p>
                            ) : (data?.productos ?? []).map((i, idx) => (
                                <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{i.nombre}</p>
                                        <p className="text-xs text-slate-400 font-medium">{i.estado}</p>
                                    </div>
                                    <span className="text-sm font-bold text-[#EAB308]">${i.precio}</span>
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

function InventarioActualTab({ onExportReady }: { onExportReady: (exportFn: () => void) => void }) {
    const [estado, setEstado] = useState<'Disponible' | 'En subasta' | 'Vendido'>('Disponible');
    const [data, setData] = useState<ReporteInventarioResponse | null>(null);
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

    const handleExport = useCallback(() => {
        import("@/src/shared/report-utils").then(({ generatePDFReport }) => {
            generatePDFReport({
                title: "Reporte de Inventario Actual",
                subtitle: `Estado: ${estado}`,
                columns: ["Producto", "Precio"],
                rows: (data?.articulos ?? []).map((p) => [p.nombre, p.precio ? `$${p.precio}` : '—']),
                filename: `Reporte_Inventario_${estado}`
            });
        });
    }, [data, estado]);

    useEffect(() => {
        onExportReady(handleExport);
    }, [handleExport, onExportReady]);

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard title="Total Productos" value={data?.totalProductos ?? 0} valueColor="text-slate-800" />
                <MetricCard title="Valor Inventario" value={data?.valorInventario ?? '$0'} valueColor="text-[#40C4AA]" />
                <MetricCard title="Costo Total" value={data?.costoTotal ?? '$0'} valueColor="text-primary" />
                <MetricCard title="Ganancia Proyectada" value={data?.gananciaProyectada ?? '$0'} valueColor="text-[#EAB308]" />
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
                        {(data?.articulos ?? []).length === 0 ? (
                            <div className="col-span-full py-16 text-center text-slate-400">
                                <p className="text-sm">No hay productos en este estado.</p>
                            </div>
                        ) : (data?.articulos ?? []).map((p, i) => (
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

// ─── Por Lote Tab ─────────────────────────────────────────────────────────────

function PorLoteTab({ onExportReady }: { onExportReady: (exportFn: () => void) => void }) {
    const [lotes, setLotes] = useState<any[]>([]);
    const [productos, setProductos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [resL, resP] = await Promise.all([
                fetch('/api/lotes'),
                fetch('/api/productos')
            ]);
            const dataL = resL.ok ? await resL.json() : [];
            const dataP = resP.ok ? await resP.json() : [];
            
            setLotes(Array.isArray(dataL) ? dataL : dataL.data ?? []);
            setProductos(Array.isArray(dataP) ? dataP : dataP.data ?? []);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Data Transformation
    const activePlots = lotes.filter(l => l.estado?.toLowerCase() === 'activo').length;
    const totalInversion = lotes.reduce((acc, l) => acc + (Number(l.precio_total || l.inversion) || 0) + (Number(l.gastos_adicionales) || 0), 0);
    const ventasRecuperadas = productos.filter(p => p.estado?.toLowerCase() === 'vendido');
    const totalRecuperado = ventasRecuperadas.reduce((acc, p) => acc + (Number(p.precio_venta || p.precio) || 0), 0);
    
    let recuperacionPromedio = 0;
    if (totalInversion > 0) recuperacionPromedio = Math.round((totalRecuperado / totalInversion) * 100);

    const chartData = React.useMemo(() => {
        return lotes.map(lote => {
            const lotProducts = productos.filter(p => p.lote_id === lote.id);
            const recuperadoLote = lotProducts.filter(p => p.estado?.toLowerCase() === 'vendido')
                                              .reduce((acc, p) => acc + (Number(p.precio_venta || p.precio) || 0), 0);
            const inver = (Number(lote.precio_total || lote.inversion) || 0) + (Number(lote.gastos_adicionales) || 0);
            return {
                id: lote.id,
                name: lote.codigo || lote.nombre,
                fullName: lote.nombre,
                details: `${lote.fecha_compra?.split('T')[0] ?? 'Sin fecha'} - ${lote.piezas_total || lote.piezas || 0} piezas`,
                estado: lote.estado || 'Activo',
                inversion: inver,
                recuperado: recuperadoLote,
                porcentaje: inver > 0 ? Math.round((recuperadoLote / inver) * 100) : 0
            };
        });
    }, [lotes, productos]);

    const handleExport = useCallback(() => {
        import("@/src/shared/report-utils").then(({ generatePDFReport }) => {
            generatePDFReport({
                title: "Reporte de Inversión por Lote",
                subtitle: "Resumen de recuperación",
                columns: ["Lote", "Inversión", "Recuperado", "%", "Estado"],
                rows: chartData.map((d: any) => [d.name, `$${d.inversion.toFixed(2)}`, `$${d.recuperado.toFixed(2)}`, `${d.porcentaje}%`, d.estado]),
                filename: `Reporte_Lotes_${new Date().toLocaleDateString('en-CA')}`
            });
        });
    }, [chartData]);

    if (isLoading) return <LoadingState />;

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard 
                    title="Total Lotes" 
                    value={lotes.length} 
                    valueColor="text-slate-800"
                />
                <MetricCard 
                    title="Inversión Total" 
                    value={`$${totalInversion.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits:2})}`} 
                    valueColor="text-[#E84E4E]" 
                />
                <MetricCard 
                    title="Total Recuperado" 
                    value={`$${totalRecuperado.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits:2})}`} 
                    valueColor="text-[#40C4AA]" 
                />
                <MetricCard 
                    title="Recuperación Promedio" 
                    value={`${recuperacionPromedio}%`} 
                    valueColor="text-[#EAB308]" 
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center">
                <h3 className="text-sm font-bold text-slate-800 self-start mb-6">Inversión vs Recuperado por lote</h3>
                <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            <Legend iconType="square" wrapperStyle={{fontSize: '12px', paddingTop: '20px'}} />
                            <Bar dataKey="inversion" name="Inversión + gastos" fill="#FF8A9B" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="recuperado" name="Recuperado" fill="#40C4AA" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-800 px-2">Detalle por lote</h3>
                {chartData.map((d, i) => {
                    const progressValue = d.porcentaje > 100 ? 100 : d.porcentaje;
                    const isClosed = d.estado?.toLowerCase() === 'cerrado';
                    return (
                        <div key={d.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", 
                                    d.fullName.toLowerCase().includes('joy') ? 'bg-blue-50 text-blue-400' : 'bg-[#FF9DAA]/10 text-[#FF8A9B]'
                                )}>
                                    {d.fullName.toLowerCase().includes('joy') ? <Diamond className="w-6 h-6" /> : <Tag className="w-6 h-6" />}
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-slate-800">{d.fullName}</h4>
                                        <span className="text-[10px] font-semibold text-slate-400">{d.name}</span>
                                        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase", 
                                            isClosed ? "bg-slate-100 text-slate-500" : "bg-[#FF9DAA]/10 text-[#FF8A9B]"
                                        )}>
                                            {d.estado}
                                        </span>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400 mt-0.5">{d.details}</span>
                                </div>
                            </div>

                            <div className="w-full md:w-1/3 flex flex-col gap-1 items-end">
                                <div className="flex justify-between w-full md:justify-end gap-2 text-xs font-bold">
                                    <span className="text-slate-800">{d.porcentaje}%</span>
                                    <span className="text-slate-400 font-medium">recuperado</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                                    <div 
                                        className={cn("h-full transition-all duration-1000", isClosed || d.porcentaje >= 100 ? "bg-[#40C4AA]" : "bg-[#FF1970]")}
                                        style={{ width: `${progressValue}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportesPage() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [activeTab, setActiveTab] = useState<ReportTab>('Diario');
    const [exportFn, setExportFn] = useState<(() => void) | null>(null);

    const handleExportReady = useCallback((fn: () => void) => {
        setExportFn(() => fn);
    }, []);

    const tabs: { id: ReportTab; icon: React.ElementType }[] = [
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
                    <div className="flex items-center justify-end mb-8">
                        {/* El título ahora está en la Topbar */}
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
                        <button
                            onClick={() => exportFn?.()}
                            disabled={!exportFn}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#40C4AA] hover:bg-[#40C4AA]/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-200 transition-colors disabled:opacity-50">
                            <Download className="w-4 h-4" /> Exportar
                        </button>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeTab === 'Diario' && <DiarioTab onExportReady={handleExportReady} />}
                        {activeTab === 'Por rango' && <PorRangoTab onExportReady={handleExportReady} />}
                        {activeTab === 'Por categoría' && <PorCategoriaTab onExportReady={handleExportReady} />}
                        {activeTab === 'Por lote' && <PorLoteTab onExportReady={handleExportReady} />}
                        {activeTab === 'Inventario actual' && <InventarioActualTab onExportReady={handleExportReady} />}
                    </div>
                </main>
            </div>
        </div>
    );
}
