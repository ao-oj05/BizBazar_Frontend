"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { cn } from "@/src/shared/utils";
import { BarChart3, Calendar, Download, PieChart, TrendingUp, Package, Gem, Layers, Loader2, Tag, Diamond } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type ReportTab = 'Por lote' | 'Inventario actual';

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
            <Loader2 className="w-8 h-8 animate-spin text-[#40C4AA]" />
            <p className="text-sm font-bold">Cargando datos reales...</p>
        </div>
    );
}

// ─── Inventario Actual Tab ────────────────────────────────────────────────────

function InventarioActualTab({ onExportReady }: { onExportReady: (exportFn: () => void) => void }) {
    const [estado, setEstado] = useState<'Disponible' | 'Vendido' | 'En subasta'>('Disponible');
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/productos`);
            const json = await res.json();
            const allItems = Array.isArray(json) ? json : (json.data || []);
            
            const targetStatus = estado === 'En subasta' ? 'en_subasta' : estado.toLowerCase();
            const filtered = allItems.filter((p:any) => (p.estado || 'disponible').toLowerCase() === targetStatus);
            
            const costoTotal = filtered.reduce((acc:number, p:any) => acc + parseFloat(p.costo_base || p.costo || 0), 0);
            const valorInventario = filtered.reduce((acc:number, p:any) => acc + parseFloat(p.precio_venta || p.precio || p.costo_base || p.costo || 0), 0);
            
            setData({
                totalProductos: filtered.length,
                costoTotal: `$${costoTotal.toFixed(2)}`,
                valorInventario: `$${valorInventario.toFixed(2)}`,
                gananciaProyectada: `$${(valorInventario - costoTotal).toFixed(2)}`,
                articulos: filtered.map((p:any) => {
                    let img = '';
                    try {
                        const imgs = typeof p.imagenes === 'string' ? JSON.parse(p.imagenes) : (p.imagenes || []);
                        img = Array.isArray(imgs) ? imgs[0] : (p.imagen || '');
                    } catch { img = p.imagen || ''; }
                    return {
                        id: p.id,
                        nombre: p.nombre,
                        lote: p.lote_nombre || p.lote,
                        estado: p.estado,
                        costo: parseFloat(p.costo_base || p.costo || 0),
                        precio: parseFloat(p.precio_venta || p.precio || p.costo_base || p.costo || 0),
                        imagen: img
                    }
                })
            });
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    }, [estado]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleExport = useCallback(() => {
        import("@/src/shared/report-utils").then(({ generatePDFReport }) => {
            try {
                generatePDFReport({
                    title: "Reporte de Inventario Actual",
                    subtitle: `Estado: ${estado}`,
                    columns: ["Producto", "Lote", "Precio Asignado/Venta"],
                    rows: (data?.articulos ?? []).map((p:any) => [p.nombre, p.lote || '—', p.precio ? `$${p.precio}` : '—']),
                    filename: `Reporte_Inventario_${estado}`
                });
            } catch (e: any) { alert("Error generating PDF: " + e.message); }
        }).catch((e: any) => alert("Error importing PDF library: " + e.message));
    }, [data, estado]);

    useEffect(() => {
        onExportReady(handleExport);
    }, [handleExport, onExportReady]);

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard title="Volumen (Items)" value={data?.totalProductos ?? 0} valueColor="text-slate-800" />
                <MetricCard title="Costo Invertido" value={data?.costoTotal ?? '$0.00'} valueColor="text-[#FF0080]" />
                <MetricCard title="Valor Asignado/Cobrado" value={data?.valorInventario ?? '$0.00'} valueColor="text-[#22c55e]" />
                <MetricCard title="Margen/Aporte Neto" value={data?.gananciaProyectada ?? '$0.00'} valueColor="text-[#EAB308]" />
            </div>
            
            <div className="flex items-center gap-1.5 bg-white rounded-2xl shadow-sm border border-slate-100 p-1.5 self-start">
                {(['Disponible', 'En subasta', 'Vendido'] as const).map(e => (
                    <button key={e} onClick={() => setEstado(e)}
                        className={cn("px-6 py-2.5 text-sm font-bold rounded-xl transition-all",
                            estado === e ? (
                                e === 'Disponible' ? "bg-[#FF0080] text-white shadow-md shadow-pink-200" :
                                e === 'En subasta' ? "bg-[#FACC15] text-white shadow-md shadow-yellow-200" :
                                "bg-[#40C4AA] text-white shadow-md shadow-teal-200"
                            ) : "text-slate-500 hover:bg-slate-50"
                        )}>
                        {e}
                    </button>
                ))}
            </div>
            
            {isLoading ? <LoadingState /> : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {(data?.articulos ?? []).length === 0 ? (
                            <div className="col-span-full py-16 text-center text-slate-400">
                                <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm font-bold uppercase tracking-wider">No hay productos en este estado.</p>
                            </div>
                        ) : (data?.articulos ?? []).map((p:any, i:number) => (
                            <div key={p.id ?? i} className="flex flex-col gap-3 group bg-slate-50 rounded-xl p-2 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                                <div className="aspect-square bg-slate-200 rounded-lg overflow-hidden relative">
                                    {p.imagen ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-black text-xs uppercase tracking-widest bg-slate-200 border border-slate-300/50">Sin Foto</div>
                                    )}
                                </div>
                                <div className="px-1 pb-1 flex flex-col items-center text-center">
                                    <h4 className="text-[13px] font-bold text-slate-800 line-clamp-1 mb-1">{p.nombre}</h4>
                                    <p className="text-sm font-black text-slate-700">{p.precio ? `$${p.precio.toFixed(2)}` : '—'}</p>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-2 bg-white px-2 py-0.5 rounded shadow-sm">{p.lote || 'Sin Lote'}</span>
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
    const [ventas, setVentas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [resL, resP, resV] = await Promise.all([
                fetch('/api/lotes'),
                fetch('/api/productos'),
                fetch('/api/ventas'),
            ]);
            const dataL = resL.ok ? await resL.json() : [];
            const dataP = resP.ok ? await resP.json() : [];
            const dataV = resV.ok ? await resV.json() : [];

            setLotes(Array.isArray(dataL) ? dataL : dataL.data ?? []);
            setProductos(Array.isArray(dataP) ? dataP : dataP.data ?? []);
            setVentas(Array.isArray(dataV) ? dataV : dataV.data ?? []);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Data Transformation
    const activePlots = lotes.filter(l => l.estado?.toLowerCase() === 'activo').length;
    const totalInversion = lotes.reduce((acc, l) => acc + (Number(l.precio_total || l.inversion) || 0) + (Number(l.gastos_adicionales) || 0), 0);

    // Build a map of lote_id -> { recuperado, ganancia } from ventas items
    const recuperadoPorLote: Record<string, { recuperado: number; ganancia: number }> = {};
    ventas.forEach(venta => {
        const items: any[] = venta.items || venta.productos || [];
        items.forEach((item: any) => {
            // Retrieve product to find lote_id if the sale item doesn't have it
            const prodId = String(item.producto_id || item.id);
            const foundProd = productos.find((p: any) => String(p.id) === prodId);
            const loteId = String(item.lote_id || (foundProd ? foundProd.lote_id || foundProd.loteId : ''));
            
            if (!loteId || loteId === 'undefined' || loteId === 'null' || loteId === '') return;
            if (!recuperadoPorLote[loteId]) recuperadoPorLote[loteId] = { recuperado: 0, ganancia: 0 };
            recuperadoPorLote[loteId].recuperado += Number(item.precio_venta || item.precio || 0);
            recuperadoPorLote[loteId].ganancia += Number(item.ganancia || 0);
        });
    });

    // Fallback: use vendidos from productos if ventas items don't have lote_id
    const ventasRecuperadas = productos.filter((p: any) => p.estado?.toString().trim().toLowerCase() === 'vendido');
    const totalRecuperado = Object.values(recuperadoPorLote).reduce((s, r) => s + r.recuperado, 0)
        || ventasRecuperadas.reduce((acc: number, p: any) => acc + (Number(p.precio_venta || p.precio) || 0), 0);

    let recuperacionPromedio = 0;
    if (totalInversion > 0) recuperacionPromedio = Math.round((totalRecuperado / totalInversion) * 100);

    const chartData = React.useMemo(() => {
        return lotes.map((lote: any) => {
            // Use real ventas data per lote if available
            const lotIdStr = String(lote.id);
            const loteVentas = recuperadoPorLote[lote.id] || recuperadoPorLote[lotIdStr];
            let recuperadoLote = loteVentas?.recuperado ?? 0;
            let gananciaLote = loteVentas?.ganancia ?? 0;

            // Fallback: compute from productos if ventas don't have lote_id
            if (recuperadoLote === 0) {
                const lotProducts = productos.filter((p: any) => String(p.lote_id || p.loteId) === lotIdStr);
                recuperadoLote = lotProducts
                    .filter((p: any) => p.estado?.toString().trim().toLowerCase() === 'vendido')
                    .reduce((acc: number, p: any) => acc + (Number(p.precio_venta || p.precio) || 0), 0);
                gananciaLote = lotProducts
                    .filter((p: any) => p.estado?.toString().trim().toLowerCase() === 'vendido')
                    .reduce((acc: number, p: any) => acc + Math.max(0, (Number(p.precio_venta || p.precio) || 0) - (Number(p.costo_base || p.costo) || 0)), 0);
            }

            const inver = (Number(lote.precio_total || lote.inversion) || 0) + (Number(lote.gastos_adicionales) || 0);
            const lotProductsAll = productos.filter((p: any) => String(p.lote_id || p.loteId) === lotIdStr);
            const totalProductos = lotProductsAll.length;
            const vendidosLote = lotProductsAll.filter((p: any) => p.estado?.toString().trim().toLowerCase() === 'vendido').length;

            return {
                id: lote.id,
                name: lote.codigo || lote.nombre,
                fullName: lote.nombre,
                details: `${lote.fecha_compra?.split('T')[0] ?? 'Sin fecha'} - ${lote.piezas_total || lote.piezas || totalProductos} piezas`,
                estado: lote.estado || 'Activo',
                inversion: inver,
                recuperado: recuperadoLote,
                ganancia: gananciaLote,
                vendidos: vendidosLote,
                totalProductos,
                porcentaje: inver > 0 ? Math.round((recuperadoLote / inver) * 100) : 0
            };
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lotes, productos, ventas, recuperadoPorLote]);

    const handleExport = useCallback(() => {
        import("@/src/shared/report-utils").then(({ generatePDFReport }) => {
            try {
                generatePDFReport({
                    title: "Reporte de Inversión por Lote",
                    subtitle: "Resumen de recuperación",
                    columns: ["Lote", "Inversión", "Recuperado", "%", "Estado"],
                    rows: chartData.map((d: any) => [d.name, `$${d.inversion.toFixed(2)}`, `$${d.recuperado.toFixed(2)}`, `${d.porcentaje}%`, d.estado]),
                    filename: `Reporte_Lotes_${new Date().toLocaleDateString('en-CA')}`
                });
            } catch (e: any) { alert("Error generating PDF: " + e.message); }
        }).catch(err => alert("Error importing PDF library: " + err.message));
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
                    valueColor="text-[#FF0080]" 
                />
                <MetricCard 
                    title="Total Recuperado" 
                    value={`$${totalRecuperado.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits:2})}`} 
                    valueColor="text-[#22c55e]" 
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
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight:'bold'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight:'bold'}} />
                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} />
                            <Legend iconType="square" wrapperStyle={{fontSize: '12px', paddingTop: '20px', fontWeight:'bold'}} />
                            <Bar dataKey="inversion" name="Inversión + Gastos" fill="#FF0080" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="recuperado" name="Recuperado (Ventas)" fill="#22c55e" radius={[6, 6, 0, 0]} />
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
                                    d.fullName.toLowerCase().includes('joy') ? 'bg-[#FF0080]/10 text-[#FF0080]' : 'bg-[#FF0080]/10 text-[#FF0080]'
                                )}>
                                    {d.fullName.toLowerCase().includes('joy') ? <Diamond className="w-6 h-6" /> : <Tag className="w-6 h-6" />}
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-slate-800">{d.fullName}</h4>
                                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 rounded-md">{d.name}</span>
                                        <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider", 
                                            isClosed ? "bg-slate-100 text-slate-400" : "bg-[#FF0080]/10 text-[#FF0080]"
                                        )}>
                                            {d.estado}
                                        </span>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500 mt-1 block">{d.details}</span>
                                    {/* Vendidos & Ganancia row */}
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-[11px] text-slate-500 font-medium">
                                            <span className="font-black text-slate-800">{d.vendidos}</span> vendidos de <span className="font-black text-slate-800">{d.totalProductos}</span>
                                        </span>
                                        {d.recuperado > 0 && (
                                            <span className="text-[11px] font-black tracking-wider text-[#22c55e]">
                                                +${d.recuperado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} recuperado
                                            </span>
                                        )}
                                        {d.ganancia > 0 && (
                                            <span className="text-[11px] font-black tracking-wider text-[#EAB308]">
                                                +${d.ganancia.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ganancia
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-1/3 flex flex-col gap-1 items-end">
                                <div className="flex justify-between w-full md:justify-end gap-2 text-xs font-bold">
                                    <span className="text-slate-800 font-black">{d.porcentaje}%</span>
                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">recuperado</span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                                    <div 
                                        className={cn("h-full transition-all duration-1000", isClosed || d.porcentaje >= 100 ? "bg-[#22c55e]" : "bg-[#FF0080]")}
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
    const [activeTab, setActiveTab] = useState<ReportTab>('Por lote');
    const [exportFn, setExportFn] = useState<(() => void) | null>(null);

    const handleExportReady = useCallback((fn: () => void) => {
        setExportFn(() => fn);
    }, []);

    const tabs: { id: ReportTab; icon: React.ElementType }[] = [
        { id: 'Por lote', icon: Package },
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
                                    className={cn("flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap",
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
                            className="flex items-center gap-2 px-6 py-3 bg-[#FF0080] hover:bg-[#FF0080]/90 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-lg shadow-pink-200 transition-colors disabled:opacity-50">
                            <Download className="w-4 h-4" /> Exportar a PDF
                        </button>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeTab === 'Por lote' && <PorLoteTab onExportReady={handleExportReady} />}
                        {activeTab === 'Inventario actual' && <InventarioActualTab onExportReady={handleExportReady} />}
                    </div>
                </main>
            </div>
        </div>
    );
}
