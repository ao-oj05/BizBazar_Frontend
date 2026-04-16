'use client';
import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { cn } from "@/src/shared/utils";
import { Store, ListTree, Settings as SettingsIcon, Plus, Trash2, Save, Loader2, Image as ImageIcon } from "lucide-react";
import { useRef } from "react";

type ConfigTab = 'Datos del Negocio' | 'Categorías';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConfiguracionPage() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [activeTab, setActiveTab] = useState<ConfigTab>('Datos del Negocio');

    const tabs: { id: ConfigTab; icon: React.ElementType }[] = [
        { id: 'Datos del Negocio', icon: Store },
        { id: 'Categorías', icon: ListTree },
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
    const [form, setForm] = useState({ nombre: '', telefono: '', email: '', direccion: '', logoUrl: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    
    // Imagen
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        (async () => {
            // Cargar datos guardados en localStorage primero
            const cached = localStorage.getItem('bizbazar_negocio');
            let cachedData: Record<string, string> = {};
            if (cached) {
                try { cachedData = JSON.parse(cached); } catch { /* ignore */ }
            }
            try {
                const res = await fetch('/api/configuracion/negocio');
                if (res.ok) {
                    const data = await res.json();
                    setForm({
                        nombre: cachedData.nombre || data.nombre || '',
                        telefono: cachedData.telefono || data.telefono || '',
                        email: cachedData.email || data.email || '',
                        direccion: cachedData.direccion || data.direccion || '',
                        logoUrl: cachedData.logoUrl || data.logoUrl || data.logo || '',
                    });
                } else if (cachedData.nombre || cachedData.logoUrl) {
                    setForm(f => ({ ...f, ...cachedData }));
                }
            } catch (e) {
                console.error(e);
                // Si falla el API, usar datos de localStorage
                if (cachedData.nombre || cachedData.logoUrl) {
                    setForm(f => ({ ...f, ...cachedData }));
                }
            }
            finally { setIsLoading(false); }
        })();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const bodyPayload = { 
                nombre: form.nombre.trim() || 'Usuario',
                telefono: form.telefono || '+52 00 0000 0000',
                email: form.email || 'contacto@bizbazar.com',
                direccion: form.direccion || 'Sin dirección',
                logoUrl: form.logoUrl,
                logo: form.logoUrl 
            };
            const res = await fetch('/api/configuracion/negocio', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload),
            });
            if (res.ok) { 
                setSaved(true); setTimeout(() => setSaved(false), 2500); 
                // Persistir en localStorage para que sobreviva recargas
                const negocioData = { 
                    nombre: form.nombre.trim() || 'Usuario', 
                    logoUrl: form.logoUrl,
                    telefono: form.telefono,
                    email: form.email,
                    direccion: form.direccion
                };
                localStorage.setItem('bizbazar_negocio', JSON.stringify(negocioData));
                // Disparar evento con los datos para que Sidebar y Topbar se actualicen inmediatamente
                window.dispatchEvent(new CustomEvent('business_data_updated', {
                    detail: { nombre: negocioData.nombre, logoUrl: negocioData.logoUrl }
                }));
            } else {
                const errorText = await res.text();
                console.error("Backend Error on Save:", errorText);
                alert("Error al guardar: " + errorText);
            }
        } catch (e: any) { 
            console.error(e); 
            alert("Error de conexión: " + e.message);
        }
        finally { setIsSaving(false); }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) uploadFile(e.dataTransfer.files[0]);
    };

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('imagen', file);
            const res = await fetch('/api/uploads', { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok && data.success) {
                setForm(f => ({ ...f, logoUrl: data.data.url }));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) return <div className="flex items-center gap-3 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Cargando...</span></div>;

    return (
        <div className="flex flex-col gap-8">
        
            <div className="flex flex-col md:flex-row gap-8">
                {/* Logo Uploader */}
                <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logo del negocio</label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        className={cn(
                            "w-full aspect-video md:aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all overflow-hidden relative",
                            isDragging
                                ? "border-[#40C4AA] bg-teal-50"
                                : form.logoUrl
                                    ? "border-transparent"
                                    : "border-[#40C4AA] bg-white hover:bg-teal-50/50"
                        )}
                        style={!form.logoUrl ? { borderColor: '#40C4AA', borderStyle: 'dashed' } : {}}
                    >
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 text-[#40C4AA] animate-spin" />
                        ) : form.logoUrl ? (
                            <>
                                <img src={form.logoUrl} alt="Logo preview" className="w-full h-full object-contain p-2" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <span className="text-white text-[10px] font-bold bg-black/50 px-3 py-1.5 rounded-lg">Cambiar foto</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <ImageIcon className="w-10 h-10 text-[#40C4AA] mb-1" strokeWidth={1} />
                                <div className="text-center px-4">
                                    <p className="text-xs font-bold text-slate-600 leading-snug">Arrastra tu logo aquí</p>
                                    <p className="text-[10px] text-slate-400 font-medium">JPG, PNG o WEBP</p>
                                </div>
                            </>
                        )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} className="hidden" />
                </div>

                {/* Information Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                {[
                    { label: 'Nombre del negocio', key: 'nombre', placeholder: 'Usuario' },
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
                const result = await res.json();
                const cat = result.data ? result.data : result;
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

