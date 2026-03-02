'use client';
import { useState, useMemo, useRef } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { cn } from "@/src/shared/utils";
import { Plus, Search, LayoutGrid, List, X, Upload, Tag } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type EstadoProducto = 'Disponible' | 'En subasta' | 'Vendido';
type TipoVenta = 'directa' | 'subasta';

interface Joyeria {
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

const LOTES_JOYERIA = [
    { codigo: 'LOT-J01', nombre: 'Lote Verano 2026', costoPieza: 50.00 },
    { codigo: 'LOT-J02', nombre: 'Lote Diamantes', costoPieza: 80.00 },
];

const IMAGES = [
    'https://images.unsplash.com/photo-1599643478524-fb66f70d00f8?w=400&q=80', // Collar dorado
    'https://images.unsplash.com/photo-1535632066927-ab7e3ab60d37?w=400&q=80', // Aretes
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80', // Pulsera
    'https://images.unsplash.com/photo-1605100804763-247f67b454d6?w=400&q=80', // Anillo
    'https://images.unsplash.com/photo-1515562141207-7a8ea4114e17?w=400&q=80', // Collar perlas
];

const INITIAL_JOYERIA: Joyeria[] = [
    { id: '1', codigo: 'AB07', nombre: 'Collar dorado cadena fina', descripcion: 'Elegante', subcategoria: 'Collar', lote: 'LOT-J01', precio: 120, estado: 'Disponible', tipoVenta: 'directa', imagen: IMAGES[0] },
    { id: '2', codigo: 'BIZ-101', nombre: 'Aretes plateados perla', descripcion: 'Clásicos', subcategoria: 'Arete', lote: 'LOT-J01', precio: 85, estado: 'Vendido', tipoVenta: 'directa', imagen: IMAGES[1] },
    { id: '3', codigo: 'JY15', nombre: 'Pulsera oro rosa premium', descripcion: 'Premium', subcategoria: 'Pulsera', lote: 'LOT-J02', precio: 200, estado: 'En subasta', tipoVenta: 'subasta', imagen: IMAGES[2] },
    { id: '4', codigo: 'BIZ-102', nombre: 'Anillo diamante sintético', descripcion: 'Brillante', subcategoria: 'Anillo', lote: 'LOT-J02', precio: 150, estado: 'Disponible', tipoVenta: 'directa', imagen: IMAGES[3] },
    { id: '5', codigo: 'CC22', nombre: 'Collar perlas naturales', descripcion: 'Puro', subcategoria: 'Collar', lote: 'LOT-J01', precio: 180, estado: 'Disponible', tipoVenta: 'directa', imagen: IMAGES[4] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADO_STYLE: Record<EstadoProducto, string> = {
    'Disponible': 'bg-teal-50 text-teal-600 border-teal-200',
    'En subasta': 'bg-orange-50 text-orange-500 border-orange-200',
    'Vendido': 'bg-slate-700 text-white border-slate-700',
};

// ─── Nuevo Modal ─────────────────────────────────────────────────────

interface NuevoForm {
    nombre: string;
    descripcion: string;
    subcategoria: string;
    lote: string;
    costo: string;
    codigoPers: string;
    tipoVenta: TipoVenta;
    imagen: string;
}

const EMPTY_FORM: NuevoForm = {
    nombre: '', descripcion: '', subcategoria: '', lote: '', costo: '', codigoPers: '',
    tipoVenta: 'directa', imagen: '',
};

function NuevaJoyeriaModal({
    onClose, onSave, nextGenerado
}: {
    onClose: () => void;
    onSave: (j: Joyeria) => void;
    nextGenerado: string;
}) {
    const [form, setForm] = useState<NuevoForm>(EMPTY_FORM);
    const [preview, setPreview] = useState<string>('');
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        const url = URL.createObjectURL(file);
        setPreview(url);
        setForm(f => ({ ...f, imagen: url }));
    };

    const handleSave = () => {
        if (!form.nombre || !form.subcategoria || !form.costo) return;
        const j: Joyeria = {
            id: String(Date.now()),
            codigo: form.codigoPers || nextGenerado,
            nombre: form.nombre,
            descripcion: form.descripcion,
            subcategoria: form.subcategoria,
            lote: form.lote || 'Sin lote',
            precio: parseFloat(form.costo) || 0,
            estado: 'Disponible',
            tipoVenta: form.tipoVenta,
            imagen: preview || IMAGES[0],
        };
        onSave(j);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-[#FF9DAA] sticky top-0 z-10 shrink-0">
                    <h2 className="text-lg font-bold text-white">Agregar nueva joyería</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 flex gap-6 overflow-y-auto">
                    {/* Image upload */}
                    <div className="flex flex-col gap-2 w-48 shrink-0">
                        <label className="text-xs font-bold text-slate-800">Imagen de la joya</label>
                        <div
                            onClick={() => fileRef.current?.click()}
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                            className={cn(
                                "border-2 border-primary rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden",
                                preview ? "border-primary" : "hover:border-primary hover:bg-primary/5 bg-white"
                            )}
                            style={{ minHeight: 180 }}
                        >
                            {preview ? (
                                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 p-4 text-center">
                                    <div className="w-12 h-12 flex items-center justify-center text-primary">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-700">Arrastra tu imagen aquí o haz clic para seleccionar</p>
                                    <p className="text-[10px] text-slate-400">JPG, PNG o WEBP (máx. 5MB)</p>
                                </div>
                            )}
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                        </div>
                    </div>

                    {/* Form fields */}
                    <div className="flex-1 flex flex-col gap-4">
                        <p className="text-xs font-bold text-slate-800 uppercase mb-1">Datos de la joya</p>
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 block">Nombre *</label>
                                <input
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    placeholder="Ej: Collar dorado cadena fina"
                                    value={form.nombre}
                                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 block">Descripción</label>
                                <textarea
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[60px] resize-none"
                                    placeholder="Descripción de la joya"
                                    rows={2}
                                    value={form.descripcion}
                                    onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 block">Subcategoría *</label>
                                <input
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    placeholder=""
                                    value={form.subcategoria}
                                    onChange={e => setForm(f => ({ ...f, subcategoria: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Cost */}
                        <div className="bg-red-50/50 border border-primary/20 rounded-xl p-4">
                            <p className="text-xs font-bold text-slate-800 mb-2">Costo</p>
                            <label className="text-xs font-bold text-slate-700 mb-1 block">Costo individual *</label>
                            <input
                                type="number"
                                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                placeholder="$ 0.00"
                                value={form.costo}
                                onChange={e => setForm(f => ({ ...f, costo: e.target.value }))}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Ingresa el costo de adquisición de esta pieza</p>
                        </div>

                        {/* Codigo */}
                        <div>
                            <p className="text-xs font-bold text-slate-800 mb-2">Código</p>
                            <label className="text-xs font-bold text-slate-700 mb-1 block">Código personalizado</label>
                            <input
                                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                placeholder={`Ej: AB07`}
                                value={form.codigoPers}
                                onChange={e => setForm(f => ({ ...f, codigoPers: e.target.value }))}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Deja vacío para generar automático ({nextGenerado}) o usa tu propio código</p>
                        </div>

                        {/* Tipo de venta */}
                        <div>
                            <p className="text-xs font-bold text-slate-800 mb-2">Tipo de venta</p>
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
                                        <span className="text-sm font-bold text-slate-800">{opt.label}</span>
                                        <span className="text-xs text-slate-400">{opt.sub}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                <div className="px-6 py-4 flex gap-3 border-t border-slate-100 shrink-0">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!form.nombre || !form.subcategoria || !form.costo}
                        className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Guardar joyería
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Card (Grid) ──────────────────────────────────────────────────────

function JoyeriaCard({ joyeria }: { joyeria: Joyeria }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden group">
            <div className="relative h-52 bg-slate-100 overflow-hidden">
                <img src={joyeria.imagen} alt={joyeria.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 text-slate-800 text-[10px] font-bold rounded-md">
                    {joyeria.codigo}
                </span>
                <span className={cn("absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-md border", ESTADO_STYLE[joyeria.estado])}>
                    {joyeria.estado}
                </span>
            </div>
            <div className="p-4">
                <h3 className="font-bold text-slate-800 text-sm leading-tight">{joyeria.nombre}</h3>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{joyeria.subcategoria}</span>
                    <span className="text-sm font-bold text-[#EAB308]">${joyeria.precio}</span>
                </div>
            </div>
        </div>
    );
}

// ─── Row (List) ───────────────────────────────────────────────────────

function JoyeriaRow({ joyeria }: { joyeria: Joyeria }) {
    return (
        <tr className="hover:bg-slate-50/60 transition-colors cursor-pointer border-b border-slate-50 last:border-0">
            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                        <img src={joyeria.imagen} alt={joyeria.nombre} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400">{joyeria.codigo}</p>
                        <p className="text-sm font-semibold text-slate-800">{joyeria.nombre}</p>
                    </div>
                </div>
            </td>
            <td className="px-5 py-4">
                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{joyeria.subcategoria}</span>
            </td>
            <td className="px-5 py-4 text-sm font-bold text-[#EAB308]">${joyeria.precio}</td>
            <td className="px-5 py-4">
                <span className={cn("px-2 py-0.5 text-xs font-bold rounded-full border", ESTADO_STYLE[joyeria.estado])}>
                    {joyeria.estado}
                </span>
            </td>
        </tr>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JoyeriaPage() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [items, setItems] = useState<Joyeria[]>(INITIAL_JOYERIA);
    const [search, setSearch] = useState('');
    const [filterTab, setFilterTab] = useState<FilterTab>('Todos');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showNuevo, setShowNuevo] = useState(false);

    const tabs: FilterTab[] = ['Todos', 'Disponible', 'En subasta', 'Vendido'];

    const filtered = items.filter(p => {
        const matchSearch = !search ||
            p.nombre.toLowerCase().includes(search.toLowerCase()) ||
            p.codigo.toLowerCase().includes(search.toLowerCase());
        const matchTab = filterTab === 'Todos' || p.estado === filterTab;
        return matchSearch && matchTab;
    });

    const nextCodigo = `BIZ-${String(items.length + 100).padStart(3, '0')}`;

    const TAB_STYLE: Record<FilterTab, string> = {
        'Todos': 'bg-[#FF9DAA] text-white',
        'Disponible': 'bg-[#FF9DAA] text-white',
        'En subasta': 'bg-[#FF9DAA] text-white',
        'Vendido': 'bg-[#FF9DAA] text-white',
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-20" : "ml-64")}>
                <Topbar />

                <main className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-slate-800">Joyería</h1>
                    </div>

                    {/* Search & Filters Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder-slate-400 transition-all"
                                placeholder="Buscar joyería por nombre o código..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Filters & Actions */}
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
                                    Nueva Joyería
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
                            <Tag className="w-10 h-10 opacity-30" />
                            <p className="text-sm">No hay joyería con los filtros seleccionados.</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                            {filtered.map(p => (
                                <JoyeriaCard key={p.id} joyeria={p} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50/60 border-b border-slate-100">
                                    <tr>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase">Joyería</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase">Subcategoría</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase">Costo</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(p => (
                                        <JoyeriaRow key={p.id} joyeria={p} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>

            {/* Modals */}
            {showNuevo && (
                <NuevaJoyeriaModal
                    nextGenerado={nextCodigo}
                    onClose={() => setShowNuevo(false)}
                    onSave={(p) => { setItems(prev => [...prev, p]); setShowNuevo(false); }}
                />
            )}
        </div>
    );
}
