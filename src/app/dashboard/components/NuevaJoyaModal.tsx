import { useState, useRef, useEffect } from 'react';
import { X, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/src/shared/utils';
import { LoteBasico } from './NuevoProductoModal';

interface Subcategoria {
    id: string;
    nombre: string;
    tipo: string;
}

interface Joya {
    id: string;
    nombre: string;
    codigo: string;
    subcategoria: string;
    imagen: string;
    estado: 'Disponible' | 'Vendido' | 'En subasta';
    precio: number | null;
    costo: number;
    tipoVenta: 'Directa' | 'Subasta';
    categoria: string;
}

const normalize = (s: string) =>
    (s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function NuevaJoyaModal({ lotes, onClose, onSave }: { lotes: LoteBasico[]; onClose: () => void; onSave: (j: Joya) => void }) {
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        subcategoria_id: '',
        lote_id: '',
        costo_base: '',
        codigo_custom: '',
        tipo_venta: 'directa',
        imagenUrl: ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
    const [loadingCats, setLoadingCats] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchSubs = async () => {
            setLoadingCats(true);
            try {
                // Use ?tipo=Joyería so the backend filters directly
                const res = await fetch('/api/configuracion/categorias?tipo=Joyer%C3%ADa');
                if (res.ok) {
                    const json = await res.json();
                    // Backend returns { success: true, data: [...] } OR a plain array
                    const all: Subcategoria[] = Array.isArray(json) ? json : (json.data ?? []);
                    // Client-side fallback filter in case the backend didn't filter by tipo
                    const filtered = all.filter(s => normalize(s.tipo) === 'joyeria');
                    setSubcategorias(filtered.length > 0 ? filtered : all);
                }
            } catch (e) {
                console.error('Error fetching subcategorias joyería:', e);
            } finally {
                setLoadingCats(false);
            }
        };
        fetchSubs();
    }, []);

    // Computed preview code
    const previewCodigo = form.codigo_custom.trim()
        ? form.codigo_custom.trim()
        : 'BIZ-' + Date.now().toString().slice(-3);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        uploadFile(e.target.files[0]);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            uploadFile(e.dataTransfer.files[0]);
        }
    };

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        setErrorMessage('');
        try {
            const formData = new FormData();
            formData.append('imagen', file);
            const res = await fetch('/api/uploads', { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok && data.success) {
                setForm(f => ({ ...f, imagenUrl: data.data.url }));
            } else {
                setErrorMessage(data.error || 'Error al subir imagen');
            }
        } catch {
            setErrorMessage('Error de red al subir imagen');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        setErrorMessage('');
        if (!form.nombre || !form.subcategoria_id || !form.costo_base || !form.lote_id) return;
        setIsSaving(true);
        try {
            const finalCodigo = form.codigo_custom.trim()
                ? form.codigo_custom.trim()
                : 'BIZ-' + Date.now().toString().slice(-3);

            const subcategoriaNombre = subcategorias.find(s => s.id === form.subcategoria_id)?.nombre || '';

            const res = await fetch('/api/productos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    codigo: finalCodigo,
                    nombre: form.nombre,
                    descripcion: form.descripcion,
                    categoria: 'joyeria',
                    subcategoria: subcategoriaNombre,
                    subcategoria_id: form.subcategoria_id,
                    lote_id: form.lote_id,
                    tipo_venta: form.tipo_venta,
                    premium: form.tipo_venta === 'subasta', // Flag premium si es subasta
                    costo_base: parseFloat(form.costo_base),
                    imagenes: form.imagenUrl ? [form.imagenUrl] : []
                }),
            });

            if (res.ok) {
                const responseData = await res.json();
                const rawJoya = responseData.data || responseData;
                
                // Asegurar que pasamos la categoría para el estado local
                const nuevaJoya: Joya = {
                    id: rawJoya.id,
                    nombre: rawJoya.nombre,
                    codigo: rawJoya.codigo,
                    subcategoria: rawJoya.subcategoria_nombre || rawJoya.subcategoria,
                    imagen: rawJoya.imagenes?.[0] || rawJoya.imagen || form.imagenUrl,
                    estado: (rawJoya.estado?.charAt(0).toUpperCase() + rawJoya.estado?.slice(1).toLowerCase()) || 'Disponible',
                    precio: rawJoya.precio || null,
                    costo: Number(rawJoya.costo_base || rawJoya.costo || form.costo_base),
                    tipoVenta: rawJoya.tipo_venta === 'subasta' ? 'Subasta' : 'Directa',
                    categoria: rawJoya.categoria || 'joyeria'
                };

                // Lógica Extra: Crear subasta automática si es tipo subasta
                if (form.tipo_venta === 'subasta') {
                    try {
                        await fetch('/api/subastas', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                producto_id: nuevaJoya.id,
                                precio_inicial: nuevaJoya.costo_base || nuevaJoya.costo || 0,
                                incremento_minimo: 10
                            })
                        });
                    } catch (subErr) {
                        console.error('Error al crear subasta automática de joya:', subErr);
                    }
                }

                onSave(nuevaJoya);
            } else {
                const errText = await res.text();
                try {
                    const errJson = JSON.parse(errText);
                    setErrorMessage(errJson.error || errJson.message || 'Error al crear joya');
                } catch {
                    setErrorMessage(`Error: ${errText}`);
                }
            }
        } catch (error: unknown) {
            setErrorMessage(error instanceof Error ? error.message : 'Error de conexión');
        } finally {
            setIsSaving(false);
        }
    };

    const canSave = !isSaving && !!form.nombre && !!form.subcategoria_id && !!form.costo_base && !!form.lote_id;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-[#29AFFF]">
                    <h2 className="text-base font-bold text-white">Agregar nueva joyería</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]">

                    {/* Left: Image Upload */}
                    <div className="p-8 flex flex-col gap-3 border-r border-slate-100 bg-white">
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-tight">Imagen de la joya</p>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className={cn(
                                "w-full aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all overflow-hidden relative",
                                isDragging
                                    ? "border-[#29AFFF] bg-sky-50"
                                    : form.imagenUrl
                                        ? "border-transparent"
                                        : "border-[#29AFFF] border-sky-500/0 bg-white hover:bg-sky-50/30"
                            )}
                            style={!form.imagenUrl ? { borderColor: '#29AFFF', borderStyle: 'dotted' } : {}}
                            // Dotted blue border per user request to keep it blue
                        >
                            {isUploading ? (
                                <Loader2 className="w-8 h-8 text-[#29AFFF] animate-spin" />
                            ) : form.imagenUrl ? (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={form.imagenUrl} alt="preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                                        <span className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-lg">Cambiar imagen</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="w-12 h-12 text-[#29AFFF]" strokeWidth={1.5} />
                                    <div className="text-center px-4">
                                        <p className="text-xs font-bold text-slate-600 leading-tight mb-2">Arrastra tu imagen aquí o haz clic para seleccionar</p>
                                        <p className="text-[10px] text-slate-400">JPG, PNG o WEBP (máx. 5MB)</p>
                                    </div>
                                </>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </div>

                    {/* Right: Form */}
                    <div className="p-8 flex flex-col gap-6 overflow-y-auto max-h-[75vh]">
                        <h3 className="text-sm font-bold text-slate-800">Datos de la joya</h3>

                        {/* Nombre */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Nombre *</label>
                            <input
                                value={form.nombre}
                                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                                placeholder="Ej: Collar dorado cadena fina"
                                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#29AFFF]/40 text-slate-800 placeholder-slate-400"
                            />
                        </div>

                        {/* Descripción */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Descripción</label>
                            <textarea
                                value={form.descripcion}
                                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                                placeholder="Descripción de la joya"
                                rows={3}
                                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#29AFFF]/40 resize-none text-slate-800 placeholder-slate-400"
                            />
                        </div>

                        {/* Subcategoría */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Subcategoría *</label>
                            <select
                                value={form.subcategoria_id}
                                onChange={e => setForm(f => ({ ...f, subcategoria_id: e.target.value }))}
                                disabled={loadingCats}
                                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#29AFFF]/40 bg-white text-slate-800 disabled:opacity-60"
                            >
                                <option value="">Selecciona subcategoría</option>
                                {subcategorias.map(s => (
                                    <option key={s.id} value={s.id}>{s.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Lote */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Lote asociado</label>
                            <select
                                value={form.lote_id}
                                onChange={e => setForm(f => ({ ...f, lote_id: e.target.value }))}
                                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#29AFFF]/40 bg-white text-slate-800"
                            >
                                <option value="">Sin lote (pieza individual)</option>
                                {lotes
                                    .filter(l => l.tipo === 'joyeria' || l.tipo === 'joyería' || (!l.tipo && l.nombre.toLowerCase().includes('joyer')))
                                    .map(l => (
                                        <option key={l.id} value={l.id}>{l.nombre} ({l.codigo})</option>
                                    ))}
                            </select>
                            <p className="text-[10px] text-slate-400">Selecciona un lote si esta pieza fue comprada como parte de un lote de joyería.</p>
                        </div>

                        {/* Costo Section */}
                        <div className="bg-sky-50/50 border border-[#29AFFF]/30 rounded-2xl p-5 flex flex-col gap-3">
                            <h4 className="text-sm font-bold text-slate-800">Costo</h4>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600">Costo individual *</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                                    <input
                                        type="number"
                                        value={form.costo_base}
                                        onChange={e => setForm(f => ({ ...f, costo_base: e.target.value }))}
                                        placeholder="0.00"
                                        className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#29AFFF]/40 bg-white text-slate-800"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400">Ingresa el costo de adquisición de esta pieza</p>
                            </div>
                        </div>

                        {/* Código Section */}
                        <div className="flex flex-col gap-4">
                            <h4 className="text-sm font-bold text-slate-800">Código</h4>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600">Código personalizado</label>
                                <input
                                    value={form.codigo_custom}
                                    onChange={e => setForm(f => ({ ...f, codigo_custom: e.target.value }))}
                                    placeholder="Ej: AB07"
                                    className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#29AFFF]/40 text-slate-800 placeholder-slate-400"
                                />
                                <p className="text-[10px] text-slate-400">Deja vacío para generar automático (BIZ-XXX) o usa tu propio código</p>
                            </div>
                        </div>

                        {/* Tipo de Venta */}
                        <div className="flex flex-col gap-4">
                            <h4 className="text-sm font-bold text-slate-800">Tipo de venta</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, tipo_venta: 'directa' }))}
                                    className={cn(
                                        "flex items-center gap-3 py-3.5 px-4 rounded-xl border-2 transition-all text-left",
                                        form.tipo_venta === 'directa'
                                            ? "border-[#29AFFF] bg-white"
                                            : "border-slate-100 hover:border-slate-200"
                                    )}
                                >
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                                        form.tipo_venta === 'directa' ? "border-[#29AFFF]" : "border-slate-300"
                                    )}>
                                        {form.tipo_venta === 'directa' && <div className="w-2.5 h-2.5 rounded-full bg-[#29AFFF]" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Venta directa</p>
                                        <p className="text-[10px] text-slate-500">Precio fijo</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, tipo_venta: 'subasta' }))}
                                    className={cn(
                                        "flex items-center gap-3 py-3.5 px-4 rounded-xl border-2 transition-all text-left",
                                        form.tipo_venta === 'subasta'
                                            ? "border-[#29AFFF] bg-white"
                                            : "border-slate-100 hover:border-slate-200"
                                    )}
                                >
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                                        form.tipo_venta === 'subasta' ? "border-slate-700" : "border-slate-300"
                                    )}>
                                        {form.tipo_venta === 'subasta' && <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Subasta premium</p>
                                        <p className="text-[10px] text-slate-500">Para mejores piezas</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Preview Box */}
                        <div className="bg-sky-50/30 border border-[#29AFFF]/20 rounded-2xl p-5 flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-500">Código que se usará:</span>
                            <span className="text-sm font-bold text-[#29AFFF]">{previewCodigo}</span>
                        </div>

                        {errorMessage && (
                            <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-100">
                                {errorMessage}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!canSave}
                                className="flex-1 py-3.5 rounded-2xl bg-[#29AFFF] hover:bg-[#2596D7] text-white text-sm font-bold shadow-lg shadow-sky-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : null}
                                Guardar joyería
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
