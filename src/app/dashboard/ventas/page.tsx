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
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchProductos = async () => {
            setIsLoading(true);
            try {
                // Cargar productos de ropa y joyería disponibles para venta
                const [resRopa, resJoyeria] = await Promise.all([
                    fetch('/api/productos?estado=Disponible'),
                    fetch('/api/joyeria?estado=Disponible'),
                ]);
                const ropa = resRopa.ok ? await resRopa.json() : [];
                const joyeria = resJoyeria.ok ? await resJoyeria.json() : [];

                const ropaItems: ProductoVenta[] = (Array.isArray(ropa) ? ropa : ropa.data ?? []).map((p: RawProduct) => ({
                    id: p.id ?? p._id,
                    nombre: p.nombre,
                    precio: p.precio ?? 0,
                    costo: p.costo ?? 0,
                    categoria: 'Ropa' as Categoria,
                    imagen: p.imagen ?? '',
                }));
                const joyeriaItems: ProductoVenta[] = (Array.isArray(joyeria) ? joyeria : joyeria.data ?? []).map((j: RawJoyeria) => ({
                    id: j.id ?? j._id,
                    nombre: j.nombre,
                    precio: j.precio ?? 0,
                    costo: j.costo ?? 0,
                    categoria: 'Joyería' as Categoria,
                    imagen: j.imagen ?? '',
                }));

                setItems([...ropaItems, ...joyeriaItems]);
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

    const subtotal = cart.reduce((acc, curr) => acc + curr.item.precio * curr.qty, 0);
    const totalGanancia = cart.reduce((acc, curr) => acc + (curr.item.precio - curr.item.costo) * curr.qty, 0);
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
                    // Si la cantidad es > 1, enviamos el producto múltiples veces (ya que la BD inserta 1 a 1 por producto único)
                    // Nota: En la BD, product_id es único por pieza física, pero si en el futuro se permite stock, esto sirve.
                    // Para productos únicos, count será 1 de todas formas.
                    return Array.from({ length: c.qty }).map(() => ({
                        producto_id: c.item.id,
                        precio_venta: c.item.precio,
                    }));
                }),
                cliente_nombre: 'Cliente General', // Optional, hardcoded for now or add an input later
            };
            const res = await fetch('/api/ventas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                setCart([]);
                // Recargar productos para actualizar disponibilidad
                const [resRopa, resJoyeria] = await Promise.all([
                    fetch('/api/productos?estado=Disponible'),
                    fetch('/api/joyeria?estado=Disponible'),
                ]);
                const ropa = resRopa.ok ? await resRopa.json() : [];
                const joyeria = resJoyeria.ok ? await resJoyeria.json() : [];
                const ropaItems: ProductoVenta[] = (Array.isArray(ropa) ? ropa : ropa.data ?? []).map((p: RawProduct) => ({
                    id: p.id ?? p._id, nombre: p.nombre, precio: p.precio ?? 0, costo: p.costo ?? 0, categoria: 'Ropa', imagen: p.imagen ?? '',
                }));
                const joyeriaItems: ProductoVenta[] = (Array.isArray(joyeria) ? joyeria : joyeria.data ?? []).map((j: RawJoyeria) => ({
                    id: j.id ?? j._id, nombre: j.nombre, precio: j.precio ?? 0, costo: j.costo ?? 0, categoria: 'Joyería', imagen: j.imagen ?? '',
                }));
                setItems([...ropaItems, ...joyeriaItems]);
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
                                    <div className="flex flex-col gap-3">
                                        {cart.map(c => (
                                            <div key={c.item.id} className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                                <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-slate-200">
                                                    {c.item.imagen ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={c.item.imagen} alt={c.item.nombre} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-100" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 truncate">{c.item.nombre}</p>
                                                    <p className="text-xs text-slate-500 font-medium">${c.item.precio} c/u</p>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
                                                        <button onClick={() => updateQty(c.item.id, -1)} className="p-1 hover:bg-slate-100 rounded-md text-slate-500 transition-colors">
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="text-sm font-bold text-slate-800 w-6 text-center">{c.qty}</span>
                                                        <button onClick={() => updateQty(c.item.id, 1)} className="p-1 hover:bg-slate-100 rounded-md text-slate-500 transition-colors">
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <p className="font-bold text-primary w-16 text-right">${c.item.precio * c.qty}</p>
                                                    <button onClick={() => removeFromCart(c.item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
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
                                        <span className="text-slate-500 font-medium">Subtotal venta:</span>
                                        <span className="font-bold text-slate-800 text-lg">${subtotal.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="h-px w-full bg-slate-100 mb-6" />
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-slate-800 font-bold text-lg">Total Utilidad:</span>
                                        <span className="font-bold text-[#EAB308] text-3xl">${totalGanancia.toFixed(2)}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                                            <span>Ropa: {countRopa} items</span>
                                            <span>${cart.filter(c => c.item.categoria === 'Ropa').reduce((acc, curr) => acc + (curr.item.precio - curr.item.costo) * curr.qty, 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                                            <span>Joyería: {countJoyeria} items</span>
                                            <span>${cart.filter(c => c.item.categoria === 'Joyería').reduce((acc, curr) => acc + (curr.item.precio - curr.item.costo) * curr.qty, 0).toFixed(2)}</span>
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
        </div>
    );
}
