'use client';
import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { cn } from "@/src/shared/utils";
import { Store, ListTree, Settings as SettingsIcon, Plus, Trash2, Save, Loader2 } from "lucide-react";

type ConfigTab = 'Datos del Negocio' | 'Categorías' | 'Ajustes Generales';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConfiguracionPage() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [activeTab, setActiveTab] = useState<ConfigTab>('Datos del Negocio');

    const tabs: { id: ConfigTab; icon: React.ElementType }[] = [
        { id: 'Datos del Negocio', icon: Store },
        { id: 'Categorías', icon: ListTree },
        { id: 'Ajustes Generales', icon: SettingsIcon },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-20" : "ml-64")}>
                <Topbar />

                <main className="p-8 max-w-7xl mx-auto pb-20">
                    <div className="flex items-center justify-end mb-8">
                        {/* El título ahora está en la Topbar */}
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar Menu */}
                        <div className="w-full lg:w-64 shrink-0">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                                <h2 className="text-sm font-bold text-slate-800 mb-4 px-2">Configuración</h2>
                                <nav className="flex flex-col gap-1">
                                    {tabs.map(t => (
                                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                                            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-full text-left whitespace-nowrap",
                                                activeTab === t.id ? "bg-[#40C4AA] text-white shadow-md shadow-teal-200" : "text-slate-500 hover:bg-slate-50"
                                            )}>
                                            <t.icon className={cn("w-5 h-5", activeTab === t.id ? "text-white" : "text-slate-400")} />
                                            {t.id}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 min-h-[500px]">
                                <h2 className="text-lg font-bold text-slate-800 mb-6">{activeTab}</h2>
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {activeTab === 'Datos del Negocio' && <DatosNegocioTab />}
                                    {activeTab === 'Categorías' && <CategoriasTab />}
                                    {activeTab === 'Ajustes Generales' && <AjustesGeneralesTab />}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

// ─── Datos del Negocio ────────────────────────────────────────────────────────

function DatosNegocioTab() {
    const [form, setForm] = useState({ nombre: '', telefono: '', email: '', direccion: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/configuracion/negocio');
                if (res.ok) {
                    const data = await res.json();
                    setForm({
                        nombre: data.nombre ?? '',
                        telefono: data.telefono ?? '',
                        email: data.email ?? '',
                        direccion: data.direccion ?? '',
                    });
                }
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        })();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/configuracion/negocio', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
        } catch (e) { console.error(e); }
        finally { setIsSaving(false); }
    };

    if (isLoading) return <div className="flex items-center gap-3 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Cargando...</span></div>;

    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { label: 'Nombre del negocio', key: 'nombre', placeholder: 'BizBazar' },
                    { label: 'Teléfono', key: 'telefono', placeholder: '+52 55 1234 5678' },
                    { label: 'Correo electrónico', key: 'email', placeholder: 'contacto@bizbazar.com' },
                    { label: 'Dirección', key: 'direccion', placeholder: 'Calle Principal 123' },
                ].map(f => (
                    <div key={f.key} className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{f.label}</label>
                        <input
                            className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#40C4AA]/30 placeholder-slate-300"
                            placeholder={f.placeholder}
                            value={form[f.key as keyof typeof form]}
                            onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        />
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-4">
                <button onClick={handleSave} disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#40C4AA] hover:bg-[#40C4AA]/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-200 transition-colors disabled:opacity-50">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar cambios
                </button>
                {saved && <span className="text-sm text-green-600 font-semibold">¡Guardado correctamente!</span>}
            </div>
        </div>
    );
}

// ─── Categorías ───────────────────────────────────────────────────────────────

interface Categoria { id: string; nombre: string; tipo: 'Ropa' | 'Joyería'; }

function CategoriasTab() {
    const [tipo, setTipo] = useState<'Ropa' | 'Joyería'>('Ropa');
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [nuevaCat, setNuevaCat] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const fetchCats = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/configuracion/categorias?tipo=${tipo}`);
            const data = res.ok ? await res.json() : [];
            setCategorias(Array.isArray(data) ? data : data.data ?? []);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    }, [tipo]);

    useEffect(() => { fetchCats(); }, [fetchCats]);

    const agregarCategoria = async () => {
        if (!nuevaCat.trim()) return;
        setIsAdding(true);
        try {
            const res = await fetch('/api/configuracion/categorias', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: nuevaCat.trim(), tipo }),
            });
            if (res.ok) {
                const cat = await res.json();
                setCategorias(prev => [...prev, cat]);
                setNuevaCat('');
            }
        } catch (e) { console.error(e); }
        finally { setIsAdding(false); }
    };

    const eliminarCategoria = async (id: string) => {
        try {
            const res = await fetch(`/api/configuracion/categorias?id=${id}`, { method: 'DELETE' });
            if (res.ok) setCategorias(prev => prev.filter(c => c.id !== id));
        } catch (e) { console.error(e); }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Tipo selector */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1 self-start">
                {(['Ropa', 'Joyería'] as const).map(t => (
                    <button key={t} onClick={() => setTipo(t)}
                        className={cn("px-5 py-2 rounded-lg text-sm font-bold transition-colors",
                            tipo === t ? "bg-white shadow-sm text-[#40C4AA]" : "text-slate-500 hover:text-slate-700"
                        )}>
                        {t}
                    </button>
                ))}
            </div>
            {/* Add category */}
            <div className="flex gap-2">
                <input className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#40C4AA]/30 placeholder-slate-300"
                    placeholder={`Nueva categoría de ${tipo}...`}
                    value={nuevaCat}
                    onChange={e => setNuevaCat(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && agregarCategoria()}
                />
                <button onClick={agregarCategoria} disabled={!nuevaCat.trim() || isAdding}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#40C4AA] text-white rounded-xl text-sm font-bold hover:bg-[#40C4AA]/90 disabled:opacity-40">
                    {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Agregar
                </button>
            </div>
            {/* List */}
            {isLoading ? (
                <div className="flex items-center gap-3 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Cargando...</span></div>
            ) : categorias.length === 0 ? (
                <p className="text-slate-400 text-sm">No hay categorías de {tipo} registradas.</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {categorias.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                            <span className="text-sm font-semibold text-slate-800">{cat.nombre}</span>
                            <button onClick={() => eliminarCategoria(cat.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Ajustes Generales ────────────────────────────────────────────────────────

function AjustesGeneralesTab() {
    const [form, setForm] = useState({ incrementoMinimo: '', moneda: 'MXN (Peso Mexicano)', formatoCodigos: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/configuracion/ajustes');
                if (res.ok) {
                    const data = await res.json();
                    setForm({
                        incrementoMinimo: data.incrementoMinimo ?? '',
                        moneda: data.moneda ?? 'MXN (Peso Mexicano)',
                        formatoCodigos: data.formatoCodigos ?? '',
                    });
                }
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        })();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/configuracion/ajustes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
        } catch (e) { console.error(e); }
        finally { setIsSaving(false); }
    };

    if (isLoading) return <div className="flex items-center gap-3 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Cargando...</span></div>;

    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Incremento mínimo en subastas ($)</label>
                    <input type="number" className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#40C4AA]/30 placeholder-slate-300"
                        placeholder="10" value={form.incrementoMinimo} onChange={e => setForm(f => ({ ...f, incrementoMinimo: e.target.value }))} />
                    <span className="text-xs text-slate-400">Monto mínimo para registrar una puja.</span>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Moneda</label>
                    <select className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#40C4AA]/30 bg-white"
                        value={form.moneda} onChange={e => setForm(f => ({ ...f, moneda: e.target.value }))}>
                        <option>MXN (Peso Mexicano)</option>
                        <option>USD (Dólar)</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Formato de códigos</label>
                    <input className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#40C4AA]/30 placeholder-slate-300"
                        placeholder="LOT-001" value={form.formatoCodigos} onChange={e => setForm(f => ({ ...f, formatoCodigos: e.target.value }))} />
                    <span className="text-xs text-slate-400">Ejemplo: LOT-001, LOTE-2025.</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={handleSave} disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#40C4AA] hover:bg-[#40C4AA]/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-200 transition-colors disabled:opacity-50">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar cambios
                </button>
                {saved && <span className="text-sm text-green-600 font-semibold">¡Guardado correctamente!</span>}
            </div>
        </div>
    );
}
