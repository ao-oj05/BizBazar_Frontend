'use client';
import { useState, useMemo, useRef } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { cn } from "@/src/shared/utils";
import { Plus, Search, LayoutGrid, List, X, Upload, Tag, Check } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type EstadoProducto = 'Disponible' | 'En subasta' | 'Vendido';
type TipoVenta = 'directa' | 'subasta';

interface Producto {
    id: string;
    codigo: string;
    nombre: string;
    descripcion: string;
    subcategoria: string;
    lote: string;
    precio: number;
    estado: EstadoProducto;
    tipoVenta: TipoVenta;
    imagen: string;
}

type FilterTab = 'Todos' | EstadoProducto;

// ─── Mock data ────────────────────────────────────────────────────────────────

const LOTES_ROPA = [
    { codigo: 'LOT-001', nombre: 'Lote Primavera 2026', costoPieza: 33.33 },
    { codigo: 'LOT-002', nombre: 'Lote Invierno', costoPieza: 40.00 },
    { codigo: 'LOT-003', nombre: 'Lote Verano', costoPieza: 33.33 },
];

const IMAGES = [
    'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400&q=80', // blusa
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80', // pantalon negro
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80', // vestido rojo
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80', // chamarra
    'https://images.unsplash.com/photo-1551163943-3f7b8e08f4c5?w=400&q=80', // falda
    'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=400&q=80', // short
];

const INITIAL_PRODUCTS: Producto[] = [
    { id: '1', codigo: 'BIZ-001', nombre: 'Blusa floreada azul', descripcion: 'Blusa de flores primaveral', subcategoria: 'Blusa', lote: 'LOT-001', precio: 30, estado: 'Disponible', tipoVenta: 'directa', imagen: IMAGES[0] },
    { id: '2', codigo: 'BIZ-002', nombre: 'Pantalón negro elegante', descripcion: 'Pantalón de corte recto', subcategoria: 'Pantalón', lote: 'LOT-001', precio: 35, estado: 'Vendido', tipoVenta: 'directa', imagen: IMAGES[1] },
    { id: '3', codigo: 'BIZ-003', nombre: 'Vestido rojo premium', descripcion: 'Vestido largo de noche', subcategoria: 'Vestido', lote: 'LOT-002', precio: 50, estado: 'En subasta', tipoVenta: 'subasta', imagen: IMAGES[2] },
    { id: '4', codigo: 'BIZ-004', nombre: 'Chamarra denim', descripcion: 'Chamarra de mezclilla vintage', subcategoria: 'Chamarra', lote: 'LOT-001', precio: 45, estado: 'Disponible', tipoVenta: 'directa', imagen: IMAGES[3] },
    { id: '5', codigo: 'BIZ-005', nombre: 'Falda plisada rosa', descripcion: 'Falda midi plisada', subcategoria: 'Falda', lote: 'LOT-003', precio: 28, estado: 'Disponible', tipoVenta: 'directa', imagen: IMAGES[4] },
    { id: '6', codigo: 'BIZ-006', nombre: 'Short casual beige', descripcion: 'Short de verano casual', subcategoria: 'Short', lote: 'LOT-002', precio: 25, estado: 'Disponible', tipoVenta: 'directa', imagen: IMAGES[5] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADO_STYLE: Record<EstadoProducto, string> = {
    'Disponible': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    'En subasta': 'bg-yellow-50 text-yellow-600 border-yellow-200',
    'Vendido': 'bg-slate-100 text-slate-500 border-slate-200',
};

// ─── Product Detail Modal ─────────────────────────────────────────────────────

function DetalleProductoModal({ producto, onClose }: { producto: Producto; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Detalle del Producto</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </div>

                <div className="flex gap-6 p-6">
                    {/* Image */}
                    <div className="w-52 h-64 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-4 flex-1">
                        <div>
                            <p className="text-xs text-slate-400 font-medium mb-1">Código</p>
                            <p className="text-lg font-bold text-emerald-500">{producto.codigo}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium mb-1">Nombre</p>
                            <p className="text-2xl font-bold text-slate-800">{producto.nombre}</p>
                            <span className="mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-pink-100 text-pink-600">
                                {producto.subcategoria}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium mb-1">Lote origen</p>
                            <p className="text-sm font-semibold text-slate-700">{producto.lote}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium mb-1">Costo base</p>
                            <p className="text-2xl font-bold text-amber-500">${producto.precio}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium mb-1">Estado actual</p>
                            <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", ESTADO_STYLE[producto.estado])}>
                                {producto.estado}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6 flex flex-col gap-2">
                    <button className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors">
                        Registrar venta
                    </button>
                    <button className="w-full py-3 rounded-xl border border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-semibold text-sm transition-colors">
                        Editar producto
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Nuevo Producto Modal ─────────────────────────────────────────────────────

interface NuevoProductoForm {
    nombre: string;
    descripcion: string;
    subcategoria: string;
    lote: string;
    tipoVenta: TipoVenta;
    imagen: string;
}

const EMPTY_FORM: NuevoProductoForm = {
    nombre: '', descripcion: '', subcategoria: '', lote: '',
    tipoVenta: 'directa', imagen: '',
};

function NuevoProductoModal({
    onClose, onSave, nextCodigo,
}: {
    onClose: () => void;
    onSave: (p: Producto) => void;
    nextCodigo: string;
}) {
    const [form, setForm] = useState<NuevoProductoForm>(EMPTY_FORM);
    const [preview, setPreview] = useState<string>('');
    const fileRef = useRef<HTMLInputElement>(null);

    const selectedLote = LOTES_ROPA.find(l => l.codigo === form.lote);

    const handleFile = (file: File) => {
        const url = URL.createObjectURL(file);
        setPreview(url);
        setForm(f => ({ ...f, imagen: url }));
    };

    const handleSave = () => {
        if (!form.nombre || !form.lote || !form.subcategoria) return;
        const p: Producto = {
            id: String(Date.now()),
            codigo: nextCodigo,
            nombre: form.nombre,
            descripcion: form.descripcion,
            subcategoria: form.subcategoria,
            lote: form.lote,
            precio: selectedLote?.costoPieza ?? 0,
            estado: 'Disponible',
            tipoVenta: form.tipoVenta,
            imagen: preview || IMAGES[0],
        };
        onSave(p);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-[#FF9DAA] sticky top-0 z-10">
                    <h2 className="text-lg font-bold text-white">Agregar nuevo producto - Ropa</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 flex gap-6">
                    {/* Image upload */}
                    <div
                        onClick={() => fileRef.current?.click()}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                        className={cn(
                            "w-48 shrink-0 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden",
                            preview ? "border-primary" : "border-primary hover:border-primary/80 hover:bg-primary/5"
                        )}
                        style={{ minHeight: 200 }}
                    >
                        {preview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={preview} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center gap-2 p-4 text-center">
                                <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                                    <Upload className="w-6 h-6 text-primary" />
                                </div>
                                <p className="text-xs text-slate-500 font-medium">Arrastra tu imagen aquí o haz clic para seleccionar</p>
                                <p className="text-[10px] text-slate-400">JPG, PNG o WEBP (máx. 5MB)</p>
                            </div>
                        )}
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                    </div>

                    {/* Form fields */}
                    <div className="flex-1 flex flex-col gap-4">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Información del lote</p>
                            <label className="text-xs text-slate-500 mb-1 block">Seleccionar lote *</label>
                            <select
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 text-slate-700"
                                value={form.lote}
                                onChange={e => setForm(f => ({ ...f, lote: e.target.value }))}
                            >
                                <option value="">-- Selecciona un lote --</option>
                                {LOTES_ROPA.map(l => (
                                    <option key={l.codigo} value={l.codigo}>{l.codigo} — {l.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Datos del producto</p>
                            <div className="flex flex-col gap-3">
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Nombre del producto *</label>
                                    <input
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 placeholder-slate-300"
                                        placeholder="Ej: Blusa floreada azul"
                                        value={form.nombre}
                                        onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Descripción</label>
                                    <textarea
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 placeholder-slate-300 resize-none"
                                        placeholder="Descripción opcional del producto"
                                        rows={2}
                                        value={form.descripcion}
                                        onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Subcategoría *</label>
                                    <input
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 placeholder-slate-300"
                                        placeholder="Ej: Blusa, Pantalón, Vestido..."
                                        value={form.subcategoria}
                                        onChange={e => setForm(f => ({ ...f, subcategoria: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Tipo de venta</p>
                            <div className="grid grid-cols-2 gap-2">
                                {([
                                    { key: 'directa', label: 'Venta directa', sub: 'Precio fijo' },
                                    { key: 'subasta', label: 'Subasta premium', sub: 'Para mejores piezas' },
                                ] as const).map(opt => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setForm(f => ({ ...f, tipoVenta: opt.key }))}
                                        className={cn(
                                            "flex flex-col items-start px-4 py-3 rounded-xl border-2 text-left transition-all",
                                            form.tipoVenta === opt.key
                                                ? "border-[#40C4AA] bg-[#40C4AA]/5"
                                                : "border-slate-200 hover:border-slate-300"
                                        )}
                                    >
                                        <span className="text-sm font-semibold text-slate-800">{opt.label}</span>
                                        <span className="text-xs text-slate-400">{opt.sub}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Auto info */}
                        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex justify-between text-sm">
                            <span className="text-teal-700 font-medium">Código generado:</span>
                            <span className="font-bold text-emerald-600">{nextCodigo}</span>
                        </div>
                        {selectedLote && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex justify-between text-sm">
                                <span className="text-amber-700 font-medium">Costo base asignado:</span>
                                <span className="font-bold text-amber-500">${selectedLote.costoPieza.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 pb-6 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!form.nombre || !form.lote || !form.subcategoria}
                        className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Guardar producto
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Product Card (Grid) ──────────────────────────────────────────────────────

function ProductCard({ producto, onClick }: { producto: Producto; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden group"
        >
            <div className="relative h-52 bg-slate-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded-md">
                    {producto.codigo}
                </span>
                <span className={cn("absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-md border", ESTADO_STYLE[producto.estado])}>
                    {producto.estado}
                </span>
            </div>
            <div className="p-4">
                <h3 className="font-bold text-slate-800 text-sm leading-tight">{producto.nombre}</h3>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-semibold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full">{producto.subcategoria}</span>
                    <span className="text-sm font-bold text-slate-700">${producto.precio}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Lote: {producto.lote}</p>
            </div>
        </div>
    );
}

// ─── Product Row (List) ───────────────────────────────────────────────────────

function ProductRow({ producto, onClick }: { producto: Producto; onClick: () => void }) {
    return (
        <tr onClick={onClick} className="hover:bg-slate-50/60 transition-colors cursor-pointer border-b border-slate-50 last:border-0">
            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400">{producto.codigo}</p>
                        <p className="text-sm font-semibold text-slate-800">{producto.nombre}</p>
                    </div>
                </div>
            </td>
            <td className="px-5 py-4">
                <span className="text-[10px] font-semibold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full">{producto.subcategoria}</span>
            </td>
            <td className="px-5 py-4 text-xs text-slate-500">{producto.lote}</td>
            <td className="px-5 py-4 text-sm font-bold text-slate-700">${producto.precio}</td>
            <td className="px-5 py-4">
                <span className={cn("px-2 py-0.5 text-xs font-bold rounded-full border", ESTADO_STYLE[producto.estado])}>
                    {producto.estado}
                </span>
            </td>
        </tr>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductosRopaPage() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [productos, setProductos] = useState<Producto[]>(INITIAL_PRODUCTS);
    const [search, setSearch] = useState('');
    const [filterTab, setFilterTab] = useState<FilterTab>('Todos');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
    const [showNuevo, setShowNuevo] = useState(false);

    const tabs: FilterTab[] = ['Todos', 'Disponible', 'En subasta', 'Vendido'];

    const filtered = useMemo(() => productos.filter(p => {
        const matchSearch = !search ||
            p.nombre.toLowerCase().includes(search.toLowerCase()) ||
            p.codigo.toLowerCase().includes(search.toLowerCase());
        const matchTab = filterTab === 'Todos' || p.estado === filterTab;
        return matchSearch && matchTab;
    }), [productos, search, filterTab]);

    const nextCodigo = `BIZ-${String(productos.length + 1).padStart(3, '0')}`;

    const TAB_STYLE: Record<FilterTab, string> = {
        'Todos': 'bg-primary text-white border-primary shadow-sm shadow-primary/20',
        'Disponible': 'bg-emerald-500 text-white border-emerald-500 shadow-sm',
        'En subasta': 'bg-amber-400 text-white border-amber-400 shadow-sm',
        'Vendido': 'bg-slate-500 text-white border-slate-500 shadow-sm',
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-20" : "ml-64")}>
                <Topbar />

                <main className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-slate-800">Productos - Ropa</h1>
                    </div>

                    {/* Search & Filters Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder-slate-400 transition-all"
                                placeholder="Buscar producto por nombre o código..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Filters + view toggle */}
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                {tabs.map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setFilterTab(tab)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                                            filterTab === tab
                                                ? TAB_STYLE[tab]
                                                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-3">
                                {/* View toggle */}
                                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={cn("p-2 rounded-lg transition-colors", viewMode === 'grid' ? "bg-primary text-white" : "text-slate-400 hover:text-slate-600")}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={cn("p-2 rounded-lg transition-colors", viewMode === 'list' ? "bg-primary text-white" : "text-slate-400 hover:text-slate-600")}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => setShowNuevo(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Nuevo Producto
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Product results */}
                    {
                        filtered.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
                                <Tag className="w-10 h-10 opacity-30" />
                                <p className="text-sm">No hay productos con los filtros seleccionados.</p>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                                {filtered.map(p => (
                                    <ProductCard key={p.id} producto={p} onClick={() => setSelectedProducto(p)} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-50/60 border-b border-slate-100">
                                        <tr>
                                            <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase">Producto</th>
                                            <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase">Subcategoría</th>
                                            <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase">Lote</th>
                                            <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase">Precio</th>
                                            <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(p => (
                                            <ProductRow key={p.id} producto={p} onClick={() => setSelectedProducto(p)} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    }
                </main >
            </div >

            {/* Modals */}
            {
                selectedProducto && (
                    <DetalleProductoModal producto={selectedProducto} onClose={() => setSelectedProducto(null)} />
                )
            }
            {
                showNuevo && (
                    <NuevoProductoModal
                        nextCodigo={nextCodigo}
                        onClose={() => setShowNuevo(false)}
                        onSave={(p) => { setProductos(prev => [...prev, p]); setShowNuevo(false); }}
                    />
                )
            }
        </div >
    );
}
