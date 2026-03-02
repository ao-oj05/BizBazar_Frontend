'use client';
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { cn } from "@/src/shared/utils";
import {
    Plus, Eye, Calendar, Filter, ChevronDown, X,
    AlertTriangle, TrendingDown, Package, Search
} from "lucide-react";
import { Button } from "@/src/shared/components/ui/button";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Producto {
    nombre: string;
    estado: 'Vendido' | 'Disponible' | 'En subasta';
    precio: number | null;
    ganancia: number | null;
}

interface Lote {
    id: string;
    codigo: string;
    nombre: string;
    fecha: string; // ISO YYYY-MM-DD
    inversion: number;
    piezas: number;
    recuperado: number;
    estado: 'Activo' | 'Cerrado';
    productos: Producto[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_LOTES: Lote[] = [
    {
        id: '1', codigo: 'LOT-001', nombre: 'Lote Primavera 2026',
        fecha: '2026-02-10', inversion: 5000, piezas: 150, recuperado: 3200, estado: 'Activo',
        productos: [
            { nombre: 'Blusa floreada', estado: 'Vendido', precio: 180, ganancia: 90 },
            { nombre: 'Pantalón negro', estado: 'Disponible', precio: null, ganancia: null },
            { nombre: 'Vestido rojo', estado: 'En subasta', precio: null, ganancia: null },
        ],
    },
    {
        id: '2', codigo: 'LOT-002', nombre: 'Lote Invierno',
        fecha: '2026-01-15', inversion: 8000, piezas: 200, recuperado: 8500, estado: 'Cerrado',
        productos: [
            { nombre: 'Chamarra de cuero', estado: 'Vendido', precio: 450, ganancia: 210 },
            { nombre: 'Bufanda tejida', estado: 'Vendido', precio: 120, ganancia: 60 },
        ],
    },
    {
        id: '3', codigo: 'LOT-003', nombre: 'Lote Verano',
        fecha: '2026-02-01', inversion: 6000, piezas: 180, recuperado: 2100, estado: 'Activo',
        productos: [
            { nombre: 'Falda plisada', estado: 'Disponible', precio: null, ganancia: null },
            { nombre: 'Short casual', estado: 'En subasta', precio: null, ganancia: null },
            { nombre: 'Top floral', estado: 'Disponible', precio: null, ganancia: null },
        ],
    },
];

// Earliest date across all lots (for date filter min)
const EARLIEST_DATE = INITIAL_LOTES.reduce(
    (min, l) => l.fecha < min ? l.fecha : min,
    INITIAL_LOTES[0].fecha
);
const TODAY = new Date().toISOString().split('T')[0];

type EstadoFilter = 'Todos los estados' | 'Activo' | 'Cerrado';

// ─── Sub-components ───────────────────────────────────────────────────────────

function RecoveryBar({ recuperado, inversion }: { recuperado: number; inversion: number }) {
    const pct = Math.min((recuperado / inversion) * 100, 100);
    const over = recuperado >= inversion;
    return (
        <div className="flex flex-col gap-1 min-w-[120px]">
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">${recuperado.toLocaleString()}</span>
                <span className={cn("text-xs font-bold", over ? "text-green-500" : "text-primary")}>
                    {Math.round((recuperado / inversion) * 100)}%
                </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all", over ? "bg-green-500" : "bg-gradient-to-r from-primary to-secondary")}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function AuctionDot() {
    return (
        <span className="relative inline-flex h-2 w-2 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
        </span>
    );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetalleModal({ lote, onClose }: { lote: Lote; onClose: () => void }) {
    const router = useRouter();
    const costoPieza = (lote.inversion / lote.piezas).toFixed(2);
    const ganancia = lote.recuperado - lote.inversion;
    const pctRecuperacion = Math.round((lote.recuperado / lote.inversion) * 100);
    const isOver = lote.recuperado >= lote.inversion;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-primary to-secondary rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-white">{lote.nombre}</h2>
                        <p className="text-white/80 text-sm">{lote.codigo} · {lote.fecha}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-6">
                    {[
                        { label: 'Inversión Total', value: `$${lote.inversion.toLocaleString()}`, color: 'text-slate-800' },
                        { label: 'Costo/pieza', value: `$${costoPieza}`, color: 'text-slate-800' },
                        { label: 'Recuperado', value: `$${lote.recuperado.toLocaleString()}`, color: 'text-slate-800' },
                        { label: 'Ganancia', value: `$${ganancia.toLocaleString()}`, color: ganancia >= 0 ? 'text-green-600' : 'text-yellow-500' },
                        {
                            label: '% Recuperación',
                            value: `${pctRecuperacion}%`,
                            color: isOver ? 'text-green-600' : 'text-primary',
                            circle: true,
                        },
                    ].map(stat => (
                        <div key={stat.label} className="bg-slate-50 rounded-xl p-4 flex flex-col gap-1">
                            <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
                            {stat.circle ? (
                                <span className={cn("text-lg font-bold border-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto", isOver ? "border-green-500 text-green-600" : "border-primary text-primary")}>
                                    {stat.value}
                                </span>
                            ) : (
                                <span className={cn("text-lg font-bold", stat.color)}>{stat.value}</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Products table */}
                <div className="px-6 pb-4">
                    <h3 className="text-sm font-bold text-slate-700 mb-3">Productos del lote</h3>
                    <div className="rounded-xl border border-slate-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase">Producto</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase">Estado</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase">Precio</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase">Ganancia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {lote.productos.map((p, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-medium text-slate-800">{p.nombre}</td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-xs font-semibold",
                                                p.estado === 'Vendido' ? "bg-slate-100 text-slate-600" :
                                                    p.estado === 'Disponible' ? "bg-blue-50 text-blue-600 border border-blue-200" :
                                                        "bg-yellow-50 text-yellow-600 border border-yellow-200"
                                            )}>
                                                {p.estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{p.precio ? `$${p.precio}` : '–'}</td>
                                        <td className="px-4 py-3">
                                            {p.ganancia != null
                                                ? <span className="font-bold text-yellow-500">${p.ganancia}</span>
                                                : <span className="text-slate-300">–</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex justify-between items-center">
                    <button
                        onClick={() => router.push('/dashboard/productos')}
                        className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                        Productos Ropa →
                    </button>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl bg-slate-100 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Nuevo Lote Modal ─────────────────────────────────────────────────────────

interface NuevoLoteForm {
    nombre: string;
    piezas: string;
    fecha: string;
    gastosAdicionales: string;
    precioTotal: string;
}

function NuevoLoteModal({ onClose, onSave }: { onClose: () => void; onSave: (lote: Lote) => void }) {
    const [form, setForm] = useState<NuevoLoteForm>({
        nombre: '', piezas: '', fecha: TODAY,
        gastosAdicionales: '', precioTotal: '',
    });

    const inversionTotal = (parseFloat(form.precioTotal) || 0) + (parseFloat(form.gastosAdicionales) || 0);
    const piezasNum = parseFloat(form.piezas) || 0;
    const costoPieza = piezasNum > 0 ? (inversionTotal / piezasNum).toFixed(2) : '0.00';

    const handleSave = () => {
        if (!form.nombre || !form.piezas || !form.fecha || !form.precioTotal) return;
        const newLote: Lote = {
            id: String(Date.now()),
            codigo: `LOT-${String(Math.floor(Math.random() * 900) + 100)}`,
            nombre: form.nombre,
            fecha: form.fecha,
            inversion: inversionTotal,
            piezas: piezasNum,
            recuperado: 0,
            estado: 'Activo',
            productos: [],
        };
        onSave(newLote);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-primary to-secondary rounded-t-2xl">
                    <h2 className="text-xl font-bold text-white">Crear nuevo lote</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 col-span-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Nombre del lote</label>
                        <input
                            className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder-slate-300"
                            placeholder="LOTE FEBRERO"
                            value={form.nombre}
                            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Cantidad de piezas</label>
                        <input
                            type="number"
                            className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder-slate-300"
                            placeholder="400"
                            value={form.piezas}
                            onChange={e => setForm(f => ({ ...f, piezas: e.target.value }))}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Fecha de compra</label>
                        <input
                            type="date"
                            min={EARLIEST_DATE}
                            max={TODAY}
                            className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            value={form.fecha}
                            onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Precio total del lote</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <input
                                type="number"
                                className="w-full border border-slate-200 rounded-xl pl-7 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder-slate-300"
                                placeholder="3500"
                                value={form.precioTotal}
                                onChange={e => setForm(f => ({ ...f, precioTotal: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Gastos adicionales</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <input
                                type="number"
                                className="w-full border border-slate-200 rounded-xl pl-7 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder-slate-300"
                                placeholder="800"
                                value={form.gastosAdicionales}
                                onChange={e => setForm(f => ({ ...f, gastosAdicionales: e.target.value }))}
                            />
                        </div>
                        <span className="text-xs text-slate-400">Transporte, bolsas, etc.</span>
                    </div>

                    {/* Costo promedio */}
                    <div className="col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-amber-700 font-medium">Costo promedio por pieza</p>
                            <p className="text-2xl font-bold text-amber-500">${costoPieza}</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!form.nombre || !form.piezas || !form.precioTotal}
                        className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Guardar lote
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LotesPage() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [lotes, setLotes] = useState<Lote[]>(INITIAL_LOTES);
    const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('Todos los estados');
    const [showEstadoDropdown, setShowEstadoDropdown] = useState(false);
    const [search, setSearch] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
    const [showNuevoLote, setShowNuevoLote] = useState(false);

    const estadoOptions: EstadoFilter[] = ['Todos los estados', 'Activo', 'Cerrado'];

    // Low stock alert: lots with less than 20% unsold pieces that are still Active
    const lowStockLotes = useMemo(() =>
        lotes.filter(l => {
            if (l.estado !== 'Activo') return false;
            const vendidos = l.productos.filter(p => p.estado === 'Vendido').length;
            const totalProductos = l.productos.length;
            if (totalProductos === 0) return false;
            const remaining = totalProductos - vendidos;
            return remaining / totalProductos <= 0.2;
        }),
        [lotes]
    );

    const lotesFiltrados = useMemo(() => lotes.filter(lote => {
        const matchSearch = !search ||
            lote.codigo.toLowerCase().includes(search.toLowerCase()) ||
            lote.nombre.toLowerCase().includes(search.toLowerCase());
        const matchEstado = estadoFilter === 'Todos los estados' || lote.estado === estadoFilter;
        const matchDesde = !fechaDesde || lote.fecha >= fechaDesde;
        const matchHasta = !fechaHasta || lote.fecha <= fechaHasta;
        return matchSearch && matchEstado && matchDesde && matchHasta;
    }), [lotes, search, estadoFilter, fechaDesde, fechaHasta]);

    const hasAuction = (lote: Lote) => lote.productos.some(p => p.estado === 'En subasta');

    // Auto-refresh auction state every 30s (simulating live updates)
    useEffect(() => {
        const interval = setInterval(() => {
            setLotes(prev => prev.map(l => ({ ...l })));
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-20" : "ml-64")}>
                <Topbar />

                <main className="p-8">
                    {/* Low stock alerts */}
                    {lowStockLotes.map(l => (
                        <div key={l.id} className="flex items-center gap-3 mb-4 px-5 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                            <span><strong>{l.nombre}</strong> ({l.codigo}) tiene stock bajo — quedan pocos productos disponibles.</span>
                        </div>
                    ))}

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-slate-800">Lotes - Primavera</h1>
                    </div>

                    {/* Search & Filters Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder-slate-400 transition-all"
                                placeholder="Buscar lote por nombre o código..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Filters & Actions */}
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3 flex-wrap">
                                {/* Date filter */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowDateFilter(!showDateFilter)}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium transition-colors shadow-sm",
                                            (fechaDesde || fechaHasta)
                                                ? "border-primary text-primary"
                                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Filtrar por fecha
                                        {(fechaDesde || fechaHasta) && (
                                            <span className="ml-1 w-2 h-2 rounded-full bg-primary" />
                                        )}
                                    </button>

                                    {showDateFilter && (
                                        <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl p-4 z-20 flex flex-col gap-3 min-w-[260px]">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-semibold text-slate-500 uppercase">Desde</label>
                                                <input
                                                    type="date"
                                                    min={EARLIEST_DATE}
                                                    max={TODAY}
                                                    value={fechaDesde}
                                                    onChange={e => setFechaDesde(e.target.value)}
                                                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-semibold text-slate-500 uppercase">Hasta</label>
                                                <input
                                                    type="date"
                                                    min={fechaDesde || EARLIEST_DATE}
                                                    max={TODAY}
                                                    value={fechaHasta}
                                                    onChange={e => setFechaHasta(e.target.value)}
                                                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                            <div className="flex gap-2 mt-1">
                                                <button
                                                    onClick={() => { setFechaDesde(''); setFechaHasta(''); setShowDateFilter(false); }}
                                                    className="flex-1 text-xs py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                                                >
                                                    Limpiar
                                                </button>
                                                <button
                                                    onClick={() => setShowDateFilter(false)}
                                                    className="flex-1 text-xs py-1.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90"
                                                >
                                                    Aplicar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Estado filter */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowEstadoDropdown(!showEstadoDropdown)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                                    >
                                        <Filter className="w-4 h-4 text-primary" />
                                        {estadoFilter}
                                        <ChevronDown className={cn("w-3 h-3 transition-transform", showEstadoDropdown && "rotate-180")} />
                                    </button>

                                    {showEstadoDropdown && (
                                        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-10">
                                            {estadoOptions.map(option => (
                                                <button
                                                    key={option}
                                                    onClick={() => { setEstadoFilter(option); setShowEstadoDropdown(false); }}
                                                    className={cn(
                                                        "w-full text-left px-4 py-2.5 text-sm transition-colors",
                                                        estadoFilter === option
                                                            ? "bg-primary/10 text-primary font-semibold"
                                                            : "text-slate-600 hover:bg-slate-50"
                                                    )}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={() => setShowNuevoLote(true)}
                                className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 px-5 py-2.5"
                            >
                                <Plus className="w-4 h-4" />
                                Nuevo Lote
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Código</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Inversión</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Piezas</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Recuperado</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {lotesFiltrados.length > 0 ? (
                                        lotesFiltrados.map((lote) => (
                                            <tr key={lote.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-5 text-sm font-bold text-slate-800">{lote.codigo}</td>
                                                <td className="px-6 py-5 text-sm text-slate-700">{lote.nombre}</td>
                                                <td className="px-6 py-5 text-sm text-slate-500">{lote.fecha}</td>
                                                <td className="px-6 py-5 text-sm font-semibold text-slate-800">${lote.inversion.toLocaleString()}</td>
                                                <td className="px-6 py-5 text-sm text-slate-700">{lote.piezas}</td>
                                                <td className="px-6 py-5">
                                                    <RecoveryBar recuperado={lote.recuperado} inversion={lote.inversion} />
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={cn(
                                                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                                                        lote.estado === 'Activo'
                                                            ? "bg-primary/10 text-primary border border-primary/20"
                                                            : "bg-slate-100 text-slate-500 border border-slate-200"
                                                    )}>
                                                        {lote.estado}
                                                        {lote.estado === 'Activo' && hasAuction(lote) && <AuctionDot />}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <button
                                                        onClick={() => setSelectedLote(lote)}
                                                        className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Ver detalle
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                                    <TrendingDown className="w-8 h-8" />
                                                    <p className="text-sm">No hay lotes con los filtros seleccionados.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modals */}
            {selectedLote && (
                <DetalleModal lote={selectedLote} onClose={() => setSelectedLote(null)} />
            )}
            {showNuevoLote && (
                <NuevoLoteModal
                    onClose={() => setShowNuevoLote(false)}
                    onSave={(lote) => {
                        setLotes(prev => [...prev, lote]);
                        setShowNuevoLote(false);
                    }}
                />
            )}
        </div>
    );
}
