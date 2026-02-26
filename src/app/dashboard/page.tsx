'use client';
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { StatCard } from "./components/StatCard";
import { Shirt, Gem, ShoppingBag, DollarSign, TrendingUp, Package, Plus, Eye, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/src/shared/components/ui/button";
import { cn } from "@/src/shared/utils";
import { useState, useEffect } from "react";

interface Sale {
    id: string;
    product: string;
    type: string;
    price: string;
    profit: string;
    time: string;
}

interface Stats {
    clothingProducts: number;
    jewelryProducts: number;
    soldToday: number;
    dailyProfit: string;
    accumulatedProfit: string;
    activeLots: number;
}

interface Alert {
    id: string;
    title: string;
    description: string;
    type: 'danger' | 'warning' | 'info';
}

export default function DashboardPage() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [sales, setSales] = useState<Sale[]>([]);
    const [stats, setStats] = useState<Stats>({
        clothingProducts: 0,
        jewelryProducts: 0,
        soldToday: 0,
        dailyProfit: "$0",
        accumulatedProfit: "$0",
        activeLots: 0
    });
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        // TODO: Conectar con la API aquí
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Simulación de carga de API (reemplazar con fetch real)
                // const response = await fetch('/api/dashboard');
                // const data = await response.json();
                // setSales(data.sales);
                // setStats(data.stats);
                // setAlerts(data.alerts);

                // Por ahora lo dejamos vacío como solicitó el usuario
                setSales([]);
                setStats({
                    clothingProducts: 0,
                    jewelryProducts: 0,
                    soldToday: 0,
                    dailyProfit: "$0",
                    accumulatedProfit: "$0",
                    activeLots: 0
                });
                setAlerts([]);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className={cn(
                "flex-1 transition-all duration-300",
                isCollapsed ? "ml-20" : "ml-64"
            )}>
                <Topbar />

                <main className="p-8 space-y-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="font-medium">Cargando datos del dashboard...</p>
                        </div>
                    ) : (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <StatCard
                                    label="Productos Ropa"
                                    value={stats.clothingProducts}
                                    icon={<Shirt className="text-primary w-6 h-6" />}
                                    iconBg="bg-primary/10"
                                />
                                <StatCard
                                    label="Joyería"
                                    value={stats.jewelryProducts}
                                    icon={<Gem className="text-secondary w-6 h-6" />}
                                    iconBg="bg-secondary/10"
                                />
                                <StatCard
                                    label="Vendidos Hoy"
                                    value={stats.soldToday}
                                    icon={<ShoppingBag className="text-primary w-6 h-6" />}
                                    iconBg="bg-primary/10"
                                />
                                <StatCard
                                    label="Ganancia del Día"
                                    value={stats.dailyProfit}
                                    icon={<DollarSign className="text-yellow-500 w-6 h-6" />}
                                    iconBg="bg-yellow-50"
                                />
                                <StatCard
                                    label="Ganancia Acumulada"
                                    value={stats.accumulatedProfit}
                                    icon={<TrendingUp className="text-yellow-500 w-6 h-6" />}
                                    iconBg="bg-yellow-50"
                                />
                                <StatCard
                                    label="Lotes Activos"
                                    value={stats.activeLots}
                                    icon={<Package className="text-primary w-6 h-6" />}
                                    iconBg="bg-primary/10"
                                />
                            </div>

                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* Recent Sales Table */}
                                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                                    <h3 className="text-xl font-bold text-slate-800 mb-8">Ventas Recientes del Día</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left border-b border-slate-50">
                                                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                                                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">PRODUCTO</th>
                                                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">TIPO</th>
                                                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">PRECIO</th>
                                                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">GANANCIA</th>
                                                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">HORA</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {sales.length > 0 ? (
                                                    sales.map((sale) => (
                                                        <tr key={sale.id} className="group hover:bg-slate-50 transition-colors">
                                                            <td className="py-5 text-sm font-bold text-slate-800">{sale.id}</td>
                                                            <td className="py-5 text-sm text-slate-600">{sale.product}</td>
                                                            <td className="py-5">
                                                                <span className={cn(
                                                                    "px-3 py-1 rounded-lg text-[10px] font-bold uppercase",
                                                                    sale.type === "Ropa" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                                                                )}>
                                                                    {sale.type}
                                                                </span>
                                                            </td>
                                                            <td className="py-5 text-sm font-bold text-slate-800">{sale.price}</td>
                                                            <td className="py-5 text-sm font-bold text-yellow-500">{sale.profit}</td>
                                                            <td className="py-5 text-sm text-slate-400">{sale.time}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={6} className="py-20 text-center text-slate-400">
                                                            No hay ventas registradas hoy.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Quick Actions & Alerts */}
                                <div className="space-y-8">
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                                        <h3 className="text-xl font-bold text-slate-800 mb-8">Acciones Rápidas</h3>
                                        <div className="space-y-4">
                                            <Button className="w-full justify-center gap-3 bg-primary hover:bg-primary/90 h-12 rounded-xl font-bold">
                                                <Plus className="w-5 h-5" /> Nuevo lote
                                            </Button>
                                            <Button className="w-full justify-center gap-3 bg-primary hover:bg-primary/90 h-12 rounded-xl font-bold">
                                                <Plus className="w-5 h-5" /> Agregar producto
                                            </Button>
                                            <Button className="w-full justify-center gap-3 bg-secondary hover:bg-secondary/90 h-12 rounded-xl font-bold">
                                                <Plus className="w-5 h-5" /> Agregar joyería
                                            </Button>
                                            <Button className="w-full justify-center gap-3 bg-primary hover:bg-primary/90 h-12 rounded-xl font-bold">
                                                <Plus className="w-5 h-5" /> Registrar venta
                                            </Button>
                                            <Button className="w-full justify-center gap-3 bg-secondary hover:bg-secondary/90 h-12 rounded-xl font-bold">
                                                <Eye className="w-5 h-5" /> Ver subastas
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                                        <h3 className="text-xl font-bold text-slate-800 mb-8">Alertas</h3>
                                        <div className="space-y-4">
                                            {alerts.length > 0 ? (
                                                alerts.map((alert) => (
                                                    <div key={alert.id} className={cn(
                                                        "p-5 rounded-2xl bg-white border flex gap-4 shadow-sm",
                                                        alert.type === 'danger' ? "border-red-200" : "border-secondary/20"
                                                    )}>
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                                            alert.type === 'danger' ? "bg-red-50" : "bg-secondary/5"
                                                        )}>
                                                            <AlertCircle className={cn(
                                                                "w-6 h-6",
                                                                alert.type === 'danger' ? "text-red-500" : "text-secondary"
                                                            )} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">{alert.title}</p>
                                                            <p className="text-xs text-slate-500">{alert.description}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-10 text-slate-400">
                                                    <p className="text-sm">No hay alertas pendientes.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
