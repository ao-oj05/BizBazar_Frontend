import { useState, useRef, useEffect } from 'react';
import { X, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/src/shared/utils';

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
}

const normalize = (s: string) =>
    (s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function NuevaJoyaModal({ onClose, onSave }: { onClose: () => void; onSave: (j: Joya) => void }) {
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        subcategoria_id: '',
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
        if (!form.nombre || !form.subcategoria_id || !form.costo_base) return;
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
                    tipo_venta: form.tipo_venta,
                    costo_base: parseFloat(form.costo_base),
                    imagenes: form.imagenUrl ? [form.imagenUrl] : []
                }),
            });

            if (res.ok) {
                const responseData = await res.json();
                onSave(responseData.data || responseData);
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

    const canSave = !isSaving && !!form.nombre && !!form.subcategoria_id && !!form.costo_base;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-[#FF9696]">
                    <h2 className="text-base font-bold text-white">Agregar nueva joyería</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">

                    {/* Left: Image Upload */}
                    <div className="p-8 flex flex-col gap-3 border-r border-slate-100 bg-white">
                        <p className="text-xs font-semibold text-slate-500">Imagen de la joya</p>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className={cn(
                                "w-full aspect-[4/3] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all overflow-hidden relative",
                                isDragging
                                    ? "border-[#FF1970] bg-pink-50"
                                    : form.imagenUrl
                                        ? "border-transparent"
                                        : "border-[#FF1970] bg-white hover:bg-pink-50/30"
                            )}
                        >
                            {isUploading ? (
                                <Loader2 className="w-8 h-8 text-[#FF1970] animate-spin" />
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
                                    <ImageIcon className="w-10 h-10 text-[#FF1970]" strokeWidth={1.5} />
                                    <div className="text-center px-4">
                                        <p className="text-xs font-bold text-slate-600 leading-tight mb-2">Arrastra tu imagen aquí o haz clic para seleccionar</p>
                                        <p className="text-[10px] text-slate-400">JPG, PNG o WEBP (máx. 5MB)</p>
                                    </div>
                                </>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        {form.imagenUrl && (
                            <button
                                type="button"
                                onClick={() => setForm(f => ({ ...f, imagenUrl: '' }))}
                                className="text-[10px] text-slate-400 hover:text-red-500 transition-colors text-center"
                            >
                                Eliminar imagen
                            </button>
                        )}
                    </div>

                    {/* Right: Form */}
                    <div className="p-8 flex flex-col gap-5 overflow-y-auto max-h-[75vh]">
                        <h3 className="text-sm font-bold text-slate-800">Datos de la joya</h3>

                        {/* Nombre */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600">Nombre <span className="text-[#FF1970]">*</span></label>
                            <input
                                value={form.nombre}
                                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                                placeholder="Ej: Collar dorado cadena fina"
                                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9696]/40 text-slate-800"
                            />
                        </div>

                        {/* Descripción */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600">Descripción</label>
                            <textarea
                                value={form.descripcion}
                                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                                placeholder="Descripción de la joya"
                                rows={3}
                                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9696]/40 resize-none text-slate-800"
                            />
                        </div>

                        {/* Subcategoría */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600">Subcategoría <span className="text-[#FF1970]">*</span></label>
                            <select
                                value={form.subcategoria_id}
                                onChange={e => setForm(f => ({ ...f, subcategoria_id: e.target.value }))}
                                disabled={loadingCats}
                                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9696]/40 bg-white text-slate-800 disabled:opacity-60"
                            >
                                <option value="">
                                    {loadingCats ? 'Cargando...' : subcategorias.length === 0 ? 'Sin subcategorías — ve a Configuración' : 'Selecciona subcategoría'}
                                </option>
                                {subcategorias.map(s => (
                                    <option key={s.id} value={s.id}>{s.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Costo */}
                        <div className="bg-[#FFF5F5] border border-[#FFD6E0] rounded-xl p-4 flex flex-col gap-1.5">
                            <h4 className="text-sm font-bold text-slate-800 mb-1">Costo</h4>
                            <label className="text-xs font-semibold text-slate-600">Costo individual <span className="text-[#FF1970]">*</span></label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">$</span>
                                <input
                                    type="number"
                                    value={form.costo_base}
                                    onChange={e => setForm(f => ({ ...f, costo_base: e.target.value }))}
                                    placeholder="0.00"
                                    className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9696]/40 bg-white text-slate-800"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Ingresa el costo de adquisición de esta pieza</p>
                        </div>

                        {/* Código */}
                        <div className="flex flex-col gap-3">
                            <h4 className="text-sm font-bold text-slate-800">Código</h4>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Código personalizado</label>
                                <input
                                    value={form.codigo_custom}
                                    onChange={e => setForm(f => ({ ...f, codigo_custom: e.target.value }))}
                                    placeholder="Ej: AB07"
                                    className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9696]/40 text-slate-800"
                                />
                                <p className="text-[10px] text-slate-400">Deja vacío para generar automático (BIZ-XXX) o usa tu propio código</p>
                            </div>
                        </div>

                        {/* Tipo de Venta — radio style */}
                        <div className="flex flex-col gap-3">
                            <h4 className="text-sm font-bold text-slate-800">Tipo de venta</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {/* Venta directa */}
                                <button
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, tipo_venta: 'directa' }))}
                                    className={cn(
                                        "flex items-center gap-3 py-3 px-4 rounded-xl border-2 transition-all text-left",
                                        form.tipo_venta === 'directa'
                                            ? "border-[#40C4AA] bg-white"
                                            : "border-slate-200 hover:border-slate-300"
                                    )}
                                >
                                    <span className={cn(
                                        "w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                                        form.tipo_venta === 'directa' ? "border-[#FF9696]" : "border-slate-300"
                                    )}>
                                        {form.tipo_venta === 'directa' && (
                                            <span className="w-2 h-2 rounded-full bg-[#FF9696]" />
                                        )}
                                    </span>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Venta directa</p>
                                        <p className="text-[10px] text-slate-500">Precio fijo</p>
                                    </div>
                                </button>

                                {/* Subasta premium */}
                                <button
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, tipo_venta: 'subasta' }))}
                                    className={cn(
                                        "flex items-center gap-3 py-3 px-4 rounded-xl border-2 transition-all text-left",
                                        form.tipo_venta === 'subasta'
                                            ? "border-[#FF1970] bg-white"
                                            : "border-slate-200 hover:border-slate-300"
                                    )}
                                >
                                    <span className={cn(
                                        "w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                                        form.tipo_venta === 'subasta' ? "border-slate-600" : "border-slate-300"
                                    )}>
                                        {form.tipo_venta === 'subasta' && (
                                            <span className="w-2 h-2 rounded-full bg-slate-600" />
                                        )}
                                    </span>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Subasta premium</p>
                                        <p className="text-[10px] text-slate-500">Para mejores piezas</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Código preview */}
                        <div className="bg-[#FFF0F3] border border-[#FFD6E0] rounded-xl px-4 py-3 flex items-center justify-between">
                            <span className="text-sm text-slate-500">Código que se usará:</span>
                            <span className="text-sm font-bold text-[#FF9696]">{previewCodigo}</span>
                        </div>

                        {errorMessage && (
                            <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl">
                                {errorMessage}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 mt-2 pt-4 border-t border-slate-100">
                            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!canSave}
                                className="flex-1 py-3 rounded-xl bg-[#FF9696] hover:bg-[#ff8080] text-white text-sm font-bold shadow-lg shadow-pink-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
