'use client';
import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { cn } from "@/src/shared/utils";
import { BarChart3, Calendar, Download, PieChart, TrendingUp, Search, Package, Gem, TrendingDown, Layers } from "lucide-react";

type ReportTab = 'Diario' | 'Por rango' | 'Por lote' | 'Por categoría' | 'Inventario actual';

export default function ReportesPage() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [activeTab, setActiveTab] = useState<ReportTab>('Diario');

    const tabs: { id: ReportTab, icon: any }[] = [
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
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">Reportes</h1>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                            {tabs.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                                        activeTab === t.id
                                            ? "bg-[#40C4AA] text-white shadow-md shadow-teal-200"
                                            : "text-slate-500 hover:bg-slate-50"
                                    )}
                                >
                                    <t.icon className={cn("w-4 h-4", activeTab === t.id ? "text-white" : "text-slate-400")} />
                                    {t.id}
                                </button>
                            ))}
                        </div>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#40C4AA] hover:bg-[#40C4AA]/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-200 transition-colors">
                            <Download className="w-4 h-4" />
                            Exportar
                        </button>
                    </div>

                    {/* Content */}
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeTab === 'Diario' && <DiarioTab />}
                        {activeTab === 'Por rango' && <PorRangoTab />}
                        {activeTab === 'Por categoría' && <PorCategoriaTab />}
                        {/* Placeholder for others */}
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

// ─── TABS COMPONENTS ─────────────────────────────────────────────────────────

function DiarioTab() {
    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Ventas Ropa" value="8" icon={Package} valueColor="text-[#40C4AA]" />
                <MetricCard title="Ventas Joyería" value="4" icon={Gem} valueColor="text-primary" />
                <MetricCard title="Total Vendido" value="$1,240" icon={TrendingUp} valueColor="text-[#40C4AA]" />
                <MetricCard title="Total Ganancia" value="$620" icon={TrendingUp} valueColor="text-[#EAB308]" />
                <MetricCard title="Subastas Cerradas" value="2" icon={GavelPlaceholder} valueColor="text-primary" />
                <MetricCard title="Productos Agregados" value="15" icon={Package} valueColor="text-[#40C4AA]" />
            </div>

            {/* Bar Chart Mock */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-6">Ventas del día por hora</h3>
                <div className="flex flex-col h-64 border-l border-b border-slate-100 relative pl-4 mt-4">
                    {/* Y Axis */}
                    <div className="absolute left-[-24px] bottom-0 w-6 flex flex-col justify-between h-full text-[10px] text-slate-400 font-medium pb-6 pt-2">
                        <span>3</span>
                        <span>2.25</span>
                        <span>1.5</span>
                        <span>0.75</span>
                        <span>0</span>
                    </div>

                    {/* Bars Grid */}
                    <div className="flex-1 flex items-end justify-around pb-6 h-full border-b border-slate-300 mr-4">
                        <BarGroup direct={75} subasta={0} label="9am" />
                        <BarGroup direct={30} subasta={30} label="10am" />
                        <BarGroup direct={100} subasta={0} label="11am" />
                        <BarGroup direct={75} subasta={30} label="12pm" />
                        <BarGroup direct={30} subasta={0} label="2pm" />
                        <BarGroup direct={75} subasta={30} label="3pm" />
                        <BarGroup direct={30} subasta={0} label="4pm" />
                    </div>

                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[10px] font-bold">
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#40C4AA]" /> Venta directa</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#FF9DAA]" /> Subastas</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overflow-hidden">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Ventas de hoy</h3>
                <table className="w-full">
                    <thead className="border-b border-slate-100">
                        <tr>
                            <th className="text-left text-[10px] font-bold text-slate-400 uppercase pb-3">Hora</th>
                            <th className="text-left text-[10px] font-bold text-slate-400 uppercase pb-3">Producto</th>
                            <th className="text-left text-[10px] font-bold text-slate-400 uppercase pb-3">Tipo</th>
                            <th className="text-left text-[10px] font-bold text-slate-400 uppercase pb-3">Precio</th>
                            <th className="text-left text-[10px] font-bold text-slate-400 uppercase pb-3">Ganancia</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { time: '10:30 AM', prod: 'Blusa floreada', tipo: 'Directa', px: '$180', gan: '$90' },
                            { time: '11:15 AM', prod: 'Collar dorado', tipo: 'Directa', px: '$450', gan: '$200' },
                            { time: '2:45 PM', prod: 'Vestido rojo', tipo: 'Subasta', px: '$220', gan: '$110', isSubasta: true },
                        ].map((r, i) => (
                            <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                <td className="py-4 text-xs font-semibold text-slate-500">{r.time}</td>
                                <td className="py-4 text-sm font-bold text-slate-800">{r.prod}</td>
                                <td className="py-4">
                                    <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md", r.isSubasta ? "bg-[#FF9DAA]/10 text-[#FF8A9B]" : "bg-[#40C4AA]/10 text-[#40C4AA]")}>{r.tipo}</span>
                                </td>
                                <td className="py-4 text-sm font-bold text-slate-800">{r.px}</td>
                                <td className="py-4 text-sm font-bold text-[#EAB308]">{r.gan}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function PorRangoTab() {
    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Desde:</span>
                    <input type="date" className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Hasta:</span>
                    <input type="date" className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard title="Total Vendido" value="$7,200" valueColor="text-[#40C4AA]" />
                <MetricCard title="Total Ganancia" value="$4,000" valueColor="text-[#EAB308]" />
                <MetricCard title="Ventas Directas" value="$4,500" valueColor="text-[#40C4AA]" />
                <MetricCard title="Subastas" value="$2,700" valueColor="text-primary" />
            </div>

            {/* Line Chart Mock */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-[400px]">
                <h3 className="text-sm font-bold text-slate-800 mb-6">Tendencia de ventas</h3>
                <div className="relative h-64 mt-12 mb-10 border-l border-b border-slate-200 ml-10 flex items-end">
                    {/* Y Axis */}
                    <div className="absolute left-[-35px] bottom-0 flex flex-col justify-between h-full text-[10px] text-slate-400 font-medium pb-2">
                        <span>2200</span>
                        <span>1650</span>
                        <span>1100</span>
                        <span>550</span>
                        <span>0</span>
                    </div>
                    {/* X Axis */}
                    <div className="absolute -bottom-6 left-0 w-full flex justify-between text-[10px] text-slate-400 font-medium px-4">
                        <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span>
                    </div>

                    {/* SVG Line Chart Representation */}
                    <svg viewBox="0 0 800 240" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        {/* Ventas directas path (Teal) */}
                        <path d="M 0 120 C 200 80, 400 160, 600 40 S 800 20, 800 20" fill="none" stroke="#40C4AA" strokeWidth="3" />
                        <circle cx="0" cy="120" r="4" fill="white" stroke="#40C4AA" strokeWidth="2" />
                        <circle cx="266" cy="100" r="4" fill="white" stroke="#40C4AA" strokeWidth="2" />
                        <circle cx="533" cy="140" r="4" fill="white" stroke="#40C4AA" strokeWidth="2" />
                        <circle cx="800" cy="20" r="4" fill="white" stroke="#40C4AA" strokeWidth="2" />

                        {/* Subastas path (Pink) */}
                        <path d="M 0 160 C 200 180, 400 100, 600 200 S 800 140, 800 140" fill="none" stroke="#FF9DAA" strokeWidth="3" />
                        <circle cx="0" cy="160" r="4" fill="white" stroke="#FF9DAA" strokeWidth="2" />
                        <circle cx="266" cy="170" r="4" fill="white" stroke="#FF9DAA" strokeWidth="2" />
                        <circle cx="533" cy="110" r="4" fill="white" stroke="#FF9DAA" strokeWidth="2" />
                        <circle cx="800" cy="140" r="4" fill="white" stroke="#FF9DAA" strokeWidth="2" />

                        {/* Ganancia path (Yellow) */}
                        <path d="M 0 140 C 200 130, 400 140, 600 100 S 800 80, 800 80" fill="none" stroke="#EAB308" strokeWidth="3" />
                        <circle cx="0" cy="140" r="4" fill="white" stroke="#EAB308" strokeWidth="2" />
                        <circle cx="266" cy="135" r="4" fill="white" stroke="#EAB308" strokeWidth="2" />
                        <circle cx="533" cy="135" r="4" fill="white" stroke="#EAB308" strokeWidth="2" />
                        <circle cx="800" cy="80" r="4" fill="white" stroke="#EAB308" strokeWidth="2" />
                    </svg>

                    {/* Legend */}
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[10px] font-bold">
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-[#40C4AA]" /> Ventas directas</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-[#FF9DAA]" /> Subastas</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-[#EAB308]" /> Ganancia total</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PorCategoriaTab() {
    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 flex items-center gap-2 max-w-xs">
                <button className="flex-1 py-1.5 bg-[#40C4AA] text-white text-sm font-bold rounded-lg shadow-sm">Ropa</button>
                <button className="flex-1 py-1.5 text-slate-500 hover:bg-slate-50 text-sm font-bold rounded-lg transition-colors">Joyería</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard title="Total Disponible" value="245" valueColor="text-[#40C4AA]" />
                <MetricCard title="Total Vendido" value="180" valueColor="text-slate-800" />
                <MetricCard title="Ingresos" value="$15,400" valueColor="text-[#40C4AA]" />
                <MetricCard title="Ganancia" value="$8,200" valueColor="text-[#EAB308]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart Mock */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center min-h-[350px]">
                    <h3 className="text-sm font-bold text-slate-800 self-start mb-6">Ventas por subcategoría</h3>

                    <div className="relative w-48 h-48 rounded-full shadow-inner" style={{
                        background: 'conic-gradient(#40C4AA 0% 30%, #FF9DAA 30% 55%, #EAB308 55% 75%, #F05A5A 75% 90%, #64748B 90% 100%)'
                    }}>
                        <div className="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
                        </div>

                        {/* Labels floating around */}
                        <div className="absolute -right-16 top-4 text-[10px] font-bold text-[#40C4AA]">Blusas 30%</div>
                        <div className="absolute -left-16 top-12 text-[10px] font-bold text-[#FF9DAA]">Pantalones 25%</div>
                        <div className="absolute -left-8 bottom-4 text-[10px] font-bold text-[#EAB308]">Vestidos 20%</div>
                        <div className="absolute right-0 bottom-0 text-[10px] font-bold text-[#F05A5A]">Joyería 15%</div>
                        <div className="absolute right-[-20px] top-1/2 text-[10px] font-bold text-slate-500">Otros 10%</div>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-sm font-bold text-slate-800 mb-6">Top productos más vendidos</h3>
                    <div className="flex flex-col gap-5">
                        {[
                            { n: 'Blusa floreada azul', v: '15 ventas', p: '$450' },
                            { n: 'Pantalón negro elegante', v: '12 ventas', p: '$380' },
                            { n: 'Vestido rojo premium', v: '10 ventas', p: '$550' },
                            { n: 'Chamarra denim', v: '8 ventas', p: '$320' },
                        ].map((i, idx) => (
                            <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{i.n}</p>
                                    <p className="text-xs text-slate-400 font-medium">{i.v}</p>
                                </div>
                                <span className="text-sm font-bold text-[#EAB308]">{i.p}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

function MetricCard({ title, value, icon: Icon, valueColor }: { title: string, value: string, icon?: any, valueColor?: string }) {
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

function GavelPlaceholder(props: any) {
    // Quick custom icon wrapper to match Gavel since we can't import casually multiple times inside
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" /><path d="m16 16 6-6" /><path d="m8 8 6-6" /><path d="m9 7 8 8" /><path d="m21 11-8-8" /></svg>
    );
}

function BarGroup({ direct, subasta, label }: { direct: number, subasta: number, label: string }): React.ReactElement {
    return (
        <div className="flex flex-col items-center h-full justify-end gap-2 w-16 relative">
            <div className="flex items-end gap-1 h-full w-full justify-center">
                {direct > 0 && <div className="w-5 bg-[#40C4AA] rounded-t-sm" style={{ height: `${direct}%` }} />}
                {subasta > 0 && <div className="w-5 bg-[#FF9DAA] rounded-t-sm" style={{ height: `${subasta}%` }} />}
            </div>
            <span className="absolute -bottom-6 text-[10px] font-bold text-slate-500">{label}</span>
        </div>
    );
}

function InventarioActualTab() {
    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="Valor Total Disponible" value="$8,250" valueColor="text-[#40C4AA]" />
                <MetricCard title="Items Disponibles" value="334" valueColor="text-slate-800" />
                <MetricCard title="En Subasta" value="$1,200" valueColor="text-[#FF9DAA]" />
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-slate-100 p-1.5 self-start">
                <button className="px-6 py-2 bg-[#40C4AA] text-white text-sm font-bold rounded-lg shadow-sm transition-colors">Disponibles</button>
                <button className="px-6 py-2 text-slate-500 hover:bg-slate-50 text-sm font-bold rounded-lg transition-colors">En subasta</button>
                <button className="px-6 py-2 text-slate-500 hover:bg-slate-50 text-sm font-bold rounded-lg transition-colors">Vendidos</button>
            </div>

            {/* Products Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="flex flex-col gap-3 group">
                            {/* Image Placeholder */}
                            <div className="aspect-square bg-slate-200 rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-md">
                            </div>
                            {/* Info */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Producto {i}</h4>
                                <p className="text-xs font-semibold text-slate-500 mt-0.5">$30</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
