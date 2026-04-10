'use client';
import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { StatCard } from './components/StatCard';
import { Shirt, Gem, ShoppingBag, DollarSign, TrendingUp, Package, Plus, Eye, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/button';
import { cn } from '@/src/shared/utils';
import { NuevoLoteModal } from './components/NuevoLoteModal';
import { NuevoProductoModal, LoteBasico } from './components/NuevoProductoModal';
import { NuevaJoyaModal } from './components/NuevaJoyaModal';
import { useRouter } from 'next/navigation';

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
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [sales, setSales] = useState<Sale[]>([]);
    const [stats, setStats] = useState<Stats>({
        clothingProducts: 0,
        jewelryProducts: 0,
        soldToday: 0,
        dailyProfit: '$0',
        accumulatedProfit: '$0',
        activeLots: 0,
    });
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [showNuevoLote, setShowNuevoLote] = useState(false);
    const [showNuevoProducto, setShowNuevoProducto] = useState(false);
    const [showNuevaJoya, setShowNuevaJoya] = useState(false);
    const [lotes, setLotes] = useState<LoteBasico[]>([]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [resDash, resL, resP] = await Promise.all([
                fetch('/api/dashboard'),
                fetch('/api/lotes'),
                fetch('/api/productos')
            ]);
            if (!resDash.ok) throw new Error('Error al cargar el dashboard');
            
            const dashData = await resDash.json();
            const dataL = resL.ok ? await resL.json() : [];
            const dataP = resP.ok ? await resP.json() : [];
            
            const backendData = dashData.data || dashData;
            
            setSales(backendData.ventas_recientes ?? backendData.sales ?? []);
            
            const parsedLotes = Array.isArray(dataL) ? dataL : dataL.data ?? [];
            const parsedProductos = Array.isArray(dataP) ? dataP : dataP.data ?? [];

            const countLotesActivos = parsedLotes.filter((l: any) => l.estado?.toLowerCase() === 'activo').length;

            if (backendData.metricas) {
                setStats({
                    clothingProducts: backendData.metricas.productos_ropa_disponibles || 0,
                    jewelryProducts: backendData.metricas.joyeria_disponible || 0,
                    soldToday: backendData.metricas.vendidos_hoy || 0,
                    dailyProfit: `$${backendData.metricas.ganancia_dia || 0}`,
                    accumulatedProfit: `$${backendData.metricas.ganancia_acumulada || 0}`,
                    activeLots: countLotesActivos || backendData.metricas.lotes_activos || 0,
                });
            } else if (backendData.stats) {
                setStats({
                    ...backendData.stats,
                    activeLots: countLotesActivos || backendData.stats.activeLots || 0,
                });
            } else {
                setStats({ clothingProducts: 0, jewelryProducts: 0, soldToday: 0, dailyProfit: '$0', accumulatedProfit: '$0', activeLots: countLotesActivos });
            }

            setLotes(parsedLotes);

            // Compute Alerts client-side
            const newAlerts: Alert[] = [];
            
            // 1. Stock bajo en ropa (<= 2 prendas)
            const ropaDisponiblesCount = parsedProductos.filter((p: any) => 
                p.categoria?.toLowerCase() === 'ropa' && (!p.estado || p.estado?.toLowerCase() === 'disponible' || p.estado?.toLowerCase() === 'activo')
            ).length;
            
            if (ropaDisponiblesCount <= 2) {
                newAlerts.push({
                    id: 'alert-stock-ropa',
                    title: 'Stock bajo ropa',
                    description: `${ropaDisponiblesCount} productos`,
                    type: 'danger'
                });
            }

            // Keep any backend alerts if they happen to exist
            if (backendData.alerts) {
                newAlerts.push(...backendData.alerts);
            }

            setAlerts(newAlerts);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className={cn(
                'flex-1 transition-all duration-300',
                isCollapsed ? 'ml-20' : 'ml-64'
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
                                                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">COSTO LOTE</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {sales.length > 0 ? (
                                                    sales.map((sale: any, index) => {
                                                        const saleId = sale.id?.toString().slice(-4).toUpperCase() || `00${index + 1}`;
                                                        const saleTime = new Date(sale.created_at || sale.time || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                                                        const isJoya = (sale.type || '').toLowerCase().includes('joyeria') || (sale.items?.[0]?.categoria_nombre || '').toLowerCase().includes('joyeria');
                                                        
                                                        return (
                                                            <tr key={sale.id} className="group hover:bg-slate-50 transition-colors">
                                                                <td className="py-5 text-sm font-bold text-slate-800">V{saleId}</td>
                                                                <td className="py-5 text-sm font-medium text-slate-600">
                                                                    {sale.product || (sale.items && sale.items.length > 0 ? sale.items.map((i:any)=>i.producto_nombre).join(', ') : 'Venta General')}
                                                                </td>
                                                                <td className="py-5">
                                                                    <span className={cn(
                                                                        'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                                                                        !isJoya ? 'bg-[#FF8A9B]/10 text-[#FF8A9B]' : 'bg-[#29AFFF]/10 text-[#29AFFF]'
                                                                    )}>
                                                                        {!isJoya ? 'Ropa' : 'Joyería'}
                                                                    </span>
                                                                </td>
                                                                <td className="py-5 text-sm font-black text-slate-800">${sale.total || sale.precio_venta || sale.price || 0}</td>
                                                                <td className="py-5 text-sm font-black text-[#EAB308]">${sale.ganancia_total || sale.profit || 0}</td>
                                                                <td className="py-5 text-sm font-medium text-slate-600">${sale.items && sale.items.length > 0 ? (sale.items[0]?.costo_base || sale.items[0]?.costo || 0) : 0}</td>
                                                            </tr>
                                                        );
                                                    })
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
                                            <Button onClick={() => setShowNuevoLote(true)} className="w-full justify-center gap-3 bg-primary hover:bg-primary/90 h-12 rounded-xl font-bold">
                                                <Plus className="w-5 h-5" /> Nuevo lote
                                            </Button>
                                            <Button onClick={() => setShowNuevoProducto(true)} className="w-full justify-center gap-3 bg-primary hover:bg-primary/90 h-12 rounded-xl font-bold">
                                                <Plus className="w-5 h-5" /> Agregar producto
                                            </Button>
                                            <Button onClick={() => setShowNuevaJoya(true)} className="w-full justify-center gap-3 bg-secondary hover:bg-secondary/90 h-12 rounded-xl font-bold">
                                                <Plus className="w-5 h-5" /> Agregar joyería
                                            </Button>
                                            <Button onClick={() => router.push('/dashboard/ventas')} className="w-full justify-center gap-3 bg-primary hover:bg-primary/90 h-12 rounded-xl font-bold">
                                                <Plus className="w-5 h-5" /> Registrar venta
                                            </Button>
                                            <Button onClick={() => router.push('/dashboard/subastas')} className="w-full justify-center gap-3 bg-secondary hover:bg-secondary/90 h-12 rounded-xl font-bold">
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
                                                        'p-5 rounded-2xl bg-white border flex gap-4 shadow-sm',
                                                        alert.type === 'danger' ? 'border-red-200' :
                                                            alert.type === 'warning' ? 'border-cyan-200' : 'border-secondary/20'
                                                    )}>
                                                        <div className={cn(
                                                            'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                                                            alert.type === 'danger' ? 'bg-red-50' :
                                                                alert.type === 'warning' ? 'bg-[#40C4AA]/10' : 'bg-secondary/5'
                                                        )}>
                                                            <AlertCircle className={cn(
                                                                'w-6 h-6',
                                                                alert.type === 'danger' ? 'text-red-500' :
                                                                    alert.type === 'warning' ? 'text-[#40C4AA]' : 'text-secondary'
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

            {showNuevoLote && (
                <NuevoLoteModal
                    onClose={() => setShowNuevoLote(false)}
                    onSave={() => {
                        setShowNuevoLote(false);
                        fetchData();
                    }}
                />
            )}

            {showNuevoProducto && (
                <NuevoProductoModal
                    lotes={lotes}
                    onClose={() => setShowNuevoProducto(false)}
                    onSave={() => {
                        setShowNuevoProducto(false);
                        fetchData();
                    }}
                />
            )}

            {showNuevaJoya && (
                <NuevaJoyaModal
                    lotes={lotes}
                    onClose={() => setShowNuevaJoya(false)}
                    onSave={() => {
                        setShowNuevaJoya(false);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
}
