'use client';
import { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { cn } from '@/src/shared/utils';
import { Search, ShoppingCart, Plus, Minus, Trash2, Loader2 } from 'lucide-react';

type Categoria = 'Ropa' | 'Joyería';

interface ProductoVenta {
    id: string;
    nombre: string;
    precio: number;
    costo: number;
    categoria: Categoria;
    imagen: string;
}

interface RawProduct {
    id?: string;
    _id?: string;
    nombre: string;
    precio?: number;
    costo?: number;
    imagen?: string;
}

interface RawJoyeria {
    id?: string;
    _id?: string;
    nombre: string;
    precio?: number;
    costo?: number;
    imagen?: string;
}

type FilterType = 'Ambas' | 'Ropa' | 'Joyería';

export default function VentasPage() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [search, setSearch] = useState('');
    const [filterTab, setFilterTab] = useState<FilterType>('Ambas');
    const [items, setItems] = useState<ProductoVenta[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cart, setCart] = useState<Array<{ item: ProductoVenta; qty: number }>>([]);
    const [preciosVenta, setPreciosVenta] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastVenta, setLastVenta] = useState<any>(null);

    useEffect(() => {
        const fetchProductos = async () => {
            setIsLoading(true);
            try {
                // Cargar productos de ropa y joyería disponibles para venta
                // El endpoint /api/productos consolida ambos, y el estado debe ser 'disponible' en minúscula
                const res = await fetch('/api/productos?estado=disponible');
                const data = res.ok ? await res.json() : [];

                const allItems: ProductoVenta[] = (Array.isArray(data) ? data : data.data ?? []).map((p: any) => {
                    const isJoya = (p.categoria || p.tipo || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 'joyeria';
                    return {
                        id: p.id ?? p._id,
                        nombre: p.nombre,
                        precio: Number(p.precio || p.costo_base || 0),
                        costo: Number(p.costo_base || p.costo || 0),
                        categoria: isJoya ? 'Joyería' as Categoria : 'Ropa' as Categoria,
                        imagen: p.imagenes?.[0] || p.imagen || '',
                    };
                });

                setItems(allItems);
            } catch (error) {
                console.error('Error al cargar productos para venta:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProductos();
    }, []);

    const filtered = items.filter(p => {
        const matchSearch = !search || p.nombre.toLowerCase().includes(search.toLowerCase());
        const matchTab = filterTab === 'Ambas' || p.categoria === filterTab;
        return matchSearch && matchTab;
    });

    const getPrecioVenta = (id: string, defaultPrecio: number) => {
        const val = preciosVenta[id];
        return val === undefined || val === '' ? defaultPrecio : Number(val);
    };

    const subtotal = cart.reduce((acc, curr) => acc + getPrecioVenta(curr.item.id, curr.item.precio) * curr.qty, 0);
    const totalGanancia = cart.reduce((acc, curr) => acc + (getPrecioVenta(curr.item.id, curr.item.precio) - curr.item.costo) * curr.qty, 0);
    const countRopa = cart.filter(c => c.item.categoria === 'Ropa').reduce((acc, curr) => acc + curr.qty, 0);
    const countJoyeria = cart.filter(c => c.item.categoria === 'Joyería').reduce((acc, curr) => acc + curr.qty, 0);
    const totalItems = countRopa + countJoyeria;

    const addToCart = (p: ProductoVenta) => {
        setCart(prev => {
            const existing = prev.find(c => c.item.id === p.id);
            if (existing) return prev.map(c => c.item.id === p.id ? { ...c, qty: c.qty + 1 } : c);
            return [...prev, { item: p, qty: 1 }];
        });
    };

    const updateQty = (id: string, delta: number) => {
        setCart(prev => prev.map(c => {
            if (c.item.id === id) return { ...c, qty: Math.max(1, c.qty + delta) };
            return c;
        }));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(c => c.item.id !== id));
    };

    const confirmarVenta = async () => {
        if (cart.length === 0) return;
        setIsSubmitting(true);
        try {
            const body = {
                items: cart.flatMap(c => {
                    const precioActual = getPrecioVenta(c.item.id, c.item.precio);
                    return Array.from({ length: c.qty }).map(() => ({
                        producto_id: c.item.id,
                        precio_venta: precioActual,
                    }));
                }),
                cliente_nombre: 'Cliente General',
            };
            const res = await fetch('/api/ventas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                const result = await res.json();
                setLastVenta({
                    ...result.data,
                    items: cart.map(c => ({
                        ...c.item,
                        qty: c.qty,
                        precio_final: getPrecioVenta(c.item.id, c.item.precio)
                    })),
                    total: subtotal,
                    ganancia: totalGanancia
                });
                setShowSuccessModal(true);
                setCart([]);
                setPreciosVenta({});
                // Recargar productos para actualizar disponibilidad
                const resLoad = await fetch('/api/productos?estado=disponible');
                const data = resLoad.ok ? await resLoad.json() : [];
                const allItems: ProductoVenta[] = (Array.isArray(data) ? data : data.data ?? []).map((p: any) => {
                    const isJoya = (p.categoria || p.tipo || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 'joyeria';
                    return {
                        id: p.id ?? p._id, 
                        nombre: p.nombre, 
                        precio: Number(p.precio || p.costo_base || 0), 
                        costo: Number(p.costo_base || p.costo || 0), 
                        categoria: isJoya ? 'Joyería' as Categoria : 'Ropa' as Categoria, 
                        imagen: p.imagenes?.[0] || p.imagen || ''
                    };
                });
                setItems(allItems);
            } else {
                console.error('Error al registrar venta:', await res.text());
            }
        } catch (error) {
            console.error('Error al confirmar venta:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className={cn('flex-1 transition-all duration-300', isCollapsed ? 'ml-20' : 'ml-64')}>
                <Topbar />

                <main className="p-8 pb-24">
                    <div className="flex items-center justify-end mb-6">
                        {/* El título ahora está en la Topbar */}
                    </div>

                    <div className="flex flex-col xl:flex-row gap-6">
                        {/* Left Side: Products */}
                        <div className="flex-1 flex flex-col gap-6">
                            {/* Search & Filters */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 shrink-0">
                                <div className="relative mb-4">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder-slate-400 transition-all"
                                        placeholder="Buscar producto por nombre o código..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {(['Ambas', 'Ropa', 'Joyería'] as FilterType[]).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setFilterTab(tab)}
                                            className={cn(
                                                'px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                                                filterTab === tab
                                                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                            )}
                                        >
                                            {tab === 'Ambas' ? 'Buscar en Ambas' : `Solo ${tab}`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Products Grid */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                <h2 className="text-lg font-bold text-slate-800 mb-6">Productos disponibles</h2>
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span className="text-sm">Cargando productos...</span>
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                        <p className="text-sm">No hay productos disponibles.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-5">
                                        {filtered.map(p => (
                                            <div key={p.id} onClick={() => addToCart(p)} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer overflow-hidden group">
                                                <div className="h-40 bg-slate-100 overflow-hidden relative">
                                                    {p.imagen ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">Sin imagen</div>
                                                    )}
                                                </div>
                                                <div className="p-4 bg-white">
                                                    <h3 className="font-bold text-slate-800 text-sm leading-tight mb-2 truncate">{p.nombre}</h3>
                                                    <div className="flex items-center justify-between mt-auto">
                                                        <span className={cn(
                                                            'text-[10px] font-bold px-2 py-0.5 rounded-md',
                                                            p.categoria === 'Ropa' ? 'text-[#40C4AA] bg-[#40C4AA]/10' : 'text-[#FF8A9B] bg-[#FF8A9B]/10'
                                                        )}>
                                                            {p.categoria}
                                                        </span>
                                                        <span className="font-bold text-slate-800 text-sm">${p.precio}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Shopping Cart */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex-1 min-h-[300px]">
                                <div className="flex items-center gap-2 mb-6">
                                    <ShoppingCart className="w-5 h-5 text-primary" />
                                    <h2 className="text-lg font-bold text-slate-800">Carrito de venta ({totalItems})</h2>
                                </div>
                                {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                                        <ShoppingCart className="w-12 h-12 opacity-20 mb-3" />
                                        <p className="text-sm">Agrega productos para registrar una venta</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-50">
                                                    <th className="pb-3 pl-2">PRODUCTO</th>
                                                    <th className="pb-3">TIPO</th>
                                                    <th className="pb-3">COSTO BASE</th>
                                                    <th className="pb-3">PRECIO VENTA</th>
                                                    <th className="pb-3">GANANCIA</th>
                                                    <th className="pb-3 text-right"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {cart.map(c => {
                                                    const currentPrice = getPrecioVenta(c.item.id, c.item.precio);
                                                    const profit = currentPrice - c.item.costo;
                                                    return (
                                                        <tr key={c.item.id} className="group hover:bg-slate-50/50 transition-colors">
                                                            <td className="py-4 pl-2">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                                                        {c.item.imagen ? (
                                                                            <img src={c.item.imagen} alt={c.item.nombre} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300">N/A</div>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-sm font-bold text-slate-800">{c.item.nombre}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4">
                                                                <span className={cn(
                                                                    'text-[10px] font-bold px-2 py-0.5 rounded-md',
                                                                    c.item.categoria === 'Ropa' ? 'text-[#40C4AA] bg-[#40C4AA]/10' : 'text-[#FF8A9B] bg-[#FF8A9B]/10'
                                                                )}>
                                                                    {c.item.categoria}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 text-sm font-medium text-slate-500">${c.item.costo.toFixed(2)}</td>
                                                            <td className="py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-slate-400 text-sm">$</span>
                                                                    <input 
                                                                        type="number" 
                                                                        className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                                        value={preciosVenta[c.item.id] ?? c.item.precio}
                                                                        onChange={(e) => setPreciosVenta(prev => ({ ...prev, [c.item.id]: e.target.value }))}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className="py-4">
                                                                <span className={cn(
                                                                    "text-sm font-bold",
                                                                    profit >= 0 ? "text-yellow-500" : "text-red-500"
                                                                )}>
                                                                    ${profit.toFixed(2)}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 text-right">
                                                                <button onClick={() => removeFromCart(c.item.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side: Resumen */}
                        <div className="w-full xl:w-96 shrink-0">
                            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sticky top-24">
                                <h2 className="text-xl font-bold text-slate-800 mb-6">Resumen de venta</h2>
                                <div className="flex flex-col gap-4 mb-6">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Cantidad de items:</span>
                                        <span className="font-bold text-slate-800">{totalItems} productos</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Total Utilidad:</span>
                                        <span className="font-bold text-slate-800 text-lg">${totalGanancia.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="h-px w-full bg-slate-100 mb-6" />
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-slate-800 font-bold text-lg">Total Venta:</span>
                                        <span className="font-bold text-[#EAB308] text-3xl">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                                            <span>Ropa: {countRopa} items</span>
                                            <span>${cart.filter(c => c.item.categoria === 'Ropa').reduce((acc, curr) => acc + (getPrecioVenta(curr.item.id, curr.item.precio) - curr.item.costo) * curr.qty, 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                                            <span>Joyería: {countJoyeria} items</span>
                                            <span>${cart.filter(c => c.item.categoria === 'Joyería').reduce((acc, curr) => acc + (getPrecioVenta(curr.item.id, curr.item.precio) - curr.item.costo) * curr.qty, 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    disabled={cart.length === 0 || isSubmitting}
                                    onClick={confirmarVenta}
                                    className="w-full py-4 rounded-xl bg-slate-300 text-white font-bold text-lg transition-colors flex items-center justify-center gap-2 hover:bg-primary data-[enabled=true]:bg-primary data-[enabled=true]:shadow-lg data-[enabled=true]:shadow-primary/30"
                                    data-enabled={cart.length > 0}
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                                    {isSubmitting ? 'Procesando...' : 'Confirmar venta'}
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {showSuccessModal && lastVenta && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
                        <div className="w-20 h-20 bg-[#40C4AA]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Plus className="w-10 h-10 text-[#40C4AA] rotate-45" /> {/* Simulating a check mark or success icon */}
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">¡Venta Confirmada!</h2>
                        <p className="text-slate-500 font-medium mb-8">El registro se ha procesado correctamente</p>
                        
                        <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Productos</span>
                                <span className="text-slate-800 font-bold">{lastVenta.items?.length} items</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                                <span className="text-slate-800 font-black">TOTAL VENTA</span>
                                <span className="text-[#EAB308] font-black text-xl">${lastVenta.total?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-800 font-black">TOTAL UTILIDAD</span>
                                <span className="text-primary font-black text-xl">${lastVenta.ganancia?.toFixed(2)}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all text-lg"
                        >
                            Listo, volver
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
