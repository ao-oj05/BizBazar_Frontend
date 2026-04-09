'use client';
import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/src/shared/utils';

export interface LoteBasico {
    id: string;
    nombre: string;
    codigo: string;
    precio_total?: number;
    inversion?: number;
    piezas_total?: number;
    piezas?: number;
    tipo?: string;
}

interface Subcategoria {
    id: string;
    nombre: string;
    tipo: string;
}

interface Producto {
    id: string;
    nombre: string;
    codigo: string;
    subcategoria: string;
    lote: string;
    loteId: string;
    imagen: string;
    estado: 'Disponible' | 'Vendido' | 'En subasta';
    precio: number | null;
    costo: number;
    tipoVenta: 'Directa' | 'Subasta';
    categoria: string;
}

export function NuevoProductoModal({ lotes, onClose, onSave, productoToEdit }:
    { lotes: LoteBasico[]; onClose: () => void; onSave: (p: Producto) => void; productoToEdit?: Producto }) {
    
    // Preset form using `productoToEdit` if provided
    const [form, setForm] = useState({ 
        nombre: productoToEdit?.nombre || '', 
        descripcion: '', // the frontend Producto interface doesn't store descripcion currently, so starting empty
        subcategoria_id: '', // this needs to be matched asynchronously once subcategories load
        lote_id: productoToEdit?.loteId || '', 
        tipo_venta: productoToEdit?.tipoVenta === 'Subasta' ? 'subasta' : 'directa', 
        costo_base: productoToEdit?.costo?.toString() || '', 
        imagenUrl: productoToEdit?.imagen || '' 
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
    const [loadingCats, setLoadingCats] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const normalize = (s: string) =>
        (s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    useEffect(() => {
        const fetchSubs = async () => {
            setLoadingCats(true);
            try {
                const res = await fetch('/api/configuracion/categorias?tipo=Ropa');
                if (res.ok) {
                    const json = await res.json();
                    const all: Subcategoria[] = Array.isArray(json) ? json : (json.data ?? []);
                    const filtered = all.filter(s => normalize(s.tipo) === 'ropa');
                    const finalSubs = filtered.length > 0 ? filtered : all;
                    setSubcategorias(finalSubs);

                    // If editing, find the ID of the subcategory by matching names
                    if (productoToEdit?.subcategoria) {
                        const matchingSub = finalSubs.find(s => s.nombre === productoToEdit.subcategoria);
                        if (matchingSub) {
                            setForm(prev => ({ ...prev, subcategoria_id: matchingSub.id }));
                        }
                    }
                }
            } catch (e) {
                console.error('Error fetching subcategorias ropa:', e);
            } finally {
                setLoadingCats(false);
            }
        };
        fetchSubs();
    }, [productoToEdit]);

    useEffect(() => {
        // Auto-calculate cost based on lote if creating NEW or explicitly modifying blank cost
        if (form.lote_id && !productoToEdit) {
            const loteSelect = lotes.find(l => l.id === form.lote_id);
            if (loteSelect) {
                const inv = loteSelect.precio_total || loteSelect.inversion || 0;
                const pzs = loteSelect.piezas_total || loteSelect.piezas || 1;
                if (inv > 0 && pzs > 0) {
                    setForm(f => ({ ...f, costo_base: (inv / pzs).toFixed(2) }));
                }
            }
        }
    }, [form.lote_id, lotes, productoToEdit]);

    const processFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setErrorMessage('Solo se permiten imágenes (JPG, PNG o WEBP).');
            return;
        }
        setIsUploading(true);
        setErrorMessage('');
        try {
            const fd = new FormData();
            fd.append('imagen', file);
            const res = await fetch('/api/uploads', { method: 'POST', body: fd });
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) processFile(e.target.files[0]);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
    };

    const getUsuarioId = (): string | null => {
        try {
            const cookie = document.cookie.split('; ').find(c => c.startsWith('auth_token='));
            if (!cookie) return null;
            const token = cookie.split('=')[1];
            const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const padded = b64 + '=='.slice(0, (4 - b64.length % 4) % 4);
            const payload = JSON.parse(atob(padded));
            return payload.id || payload.usuario_id || null;
        } catch { return null; }
    };

    const handleSave = async () => {
        setErrorMessage('');
        if (!form.nombre || !form.subcategoria_id || !form.lote_id) return;
        setIsSaving(true);
        try {
            const generatedCodigo = productoToEdit?.codigo || ('BIZ-' + String(Date.now()).slice(-4));
            const usuario_id = getUsuarioId();
            
            const endpoint = productoToEdit ? `/api/productos/${productoToEdit.id}` : '/api/productos';
            const method = productoToEdit ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    codigo: generatedCodigo,
                    nombre: form.nombre,
                    descripcion: form.descripcion,
                    categoria: 'ropa',
                    subcategoria: subcategorias.find(s => s.id === form.subcategoria_id)?.nombre || '',
                    subcategoria_id: form.subcategoria_id,
                    lote_id: form.lote_id,
                    tipo_venta: form.tipo_venta,
                    premium: form.tipo_venta === 'subasta', // Se marca como premium si es subasta
                    costo_base: form.costo_base ? parseFloat(form.costo_base) : 0,
                    imagenes: form.imagenUrl ? [form.imagenUrl] : [],
                    ...(usuario_id ? { usuario_id } : {}),
                }),
            });
            if (res.ok) {
                const responseData: any = await res.json();
                const nuevoProducto = responseData.data || responseData;

                // Formatear el objeto para que coincida con la interfaz Producto
                const prodParaGuardar: Producto = {
                    id: nuevoProducto.id,
                    nombre: nuevoProducto.nombre,
                    codigo: nuevoProducto.codigo,
                    subcategoria: nuevoProducto.subcategoria_nombre || nuevoProducto.subcategoria,
                    lote: nuevoProducto.lote_nombre || nuevoProducto.lote,
                    loteId: nuevoProducto.lote_id || nuevoProducto.loteId,
                    imagen: nuevoProducto.imagenes?.[0] || nuevoProducto.imagen || form.imagenUrl,
                    estado: (nuevoProducto.estado?.charAt(0).toUpperCase() + nuevoProducto.estado?.slice(1).toLowerCase()) || 'Disponible',
                    precio: nuevoProducto.precio || null,
                    costo: Number(nuevoProducto.costo_base || nuevoProducto.costo || form.costo_base),
                    tipoVenta: nuevoProducto.tipo_venta === 'subasta' ? 'Subasta' : 'Directa',
                    categoria: nuevoProducto.categoria || 'ropa'
                };

                // Lógica Extra: Si es subasta, crearla automáticamente en el backend
                if (form.tipo_venta === 'subasta') {
                    try {
                        await fetch('/api/subastas', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                producto_id: nuevoProducto.id,
                                precio_inicial: prodParaGuardar.costo || 0,
                                incremento_minimo: 10 // Valor por defecto
                            })
                        });
                    } catch (subErr) {
                        console.error('Error al intentar crear subasta automática:', subErr);
                    }
                }

                onSave(prodParaGuardar);
            } else {
                const errText = await res.text();
                try {
                    const errJson = JSON.parse(errText);
                    setErrorMessage(errJson.error || errJson.message || 'Error al guardar producto');
                } catch {
                    setErrorMessage(`Error: ${errText}`);
                }
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Error de conexión');
        } finally {
            setIsSaving(false);
        }
    };


    const canSave = !isSaving && !!form.nombre && !!form.subcategoria_id && !!form.lote_id;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 bg-[#FF0080]">
                    <h2 className="text-xl font-bold text-white tracking-tight">Agregar nuevo producto - Ropa</h2>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-full transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]">

                    {/* Left: Image Upload */}
                    <div className="p-5 flex flex-col gap-3 border-r border-slate-100">
                        <p className="text-xs font-semibold text-slate-500">Imagen del producto</p>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className={cn(
                                "w-full aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all overflow-hidden relative",
                                isDragging
                                    ? "border-[#FF0080] bg-pink-50"
                                    : form.imagenUrl
                                        ? "border-transparent"
                                        : "border-[#FF1970] bg-pink-50/40 hover:bg-pink-50"
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
                                    <div className="text-center px-3">
                                        <p className="text-xs font-semibold text-slate-600 leading-tight">Arrastra tu imagen aquí o haz clic para seleccionar</p>
                                        <p className="text-[10px] text-slate-400 mt-1">JPG, PNG o WEBP (máx. 5MB)</p>
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
                    <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">

                        {/* Lote Section */}
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Información del lote</p>
                            <label className="text-xs text-slate-500">Seleccionar lote <span className="text-[#FF1970]">*</span></label>
                            <select
                                value={form.lote_id}
                                onChange={e => setForm(f => ({ ...f, lote_id: e.target.value }))}
                                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF0080]/40 bg-white"
                            >
                                <option value=""></option>
                                {lotes
                                    .filter(l => l.tipo === 'ropa')
                                    .map(l => <option key={l.id} value={l.id}>{l.nombre} ({l.codigo})</option>)}
                            </select>
                        </div>

                        <div className="h-px bg-slate-100" />

                        {/* Product Data */}
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Datos del producto</p>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-slate-500">Nombre del producto <span className="text-[#FF1970]">*</span></label>
                                <input
                                    value={form.nombre}
                                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                                    placeholder="Ej: Blusa floreada azul"
                                    className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0080]/40"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-slate-500">Descripción</label>
                                <textarea
                                    value={form.descripcion}
                                    onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                                    placeholder="Descripción opcional del producto"
                                    rows={3}
                                    className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0080]/40 resize-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-slate-500">Subcategoría <span className="text-[#FF1970]">*</span></label>
                            <select
                                value={form.subcategoria_id}
                                onChange={e => setForm(f => ({ ...f, subcategoria_id: e.target.value }))}
                                disabled={loadingCats}
                                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF0080]/40 bg-white disabled:opacity-60"
                            >
                                <option value="">
                                    {loadingCats ? 'Cargando...' : subcategorias.length === 0 ? 'Sin subcategorías — ve a Configuración' : ''}
                                </option>
                                {subcategorias.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                            </select>
                            </div>

                            {/* Tipo de venta pill toggle */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-slate-500">Tipo de venta</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, tipo_venta: 'directa' }))}
                                        className={cn(
                                            "flex flex-col items-center py-3 px-2 rounded-xl border-2 font-bold text-sm transition-all",
                                            form.tipo_venta === 'directa'
                                                ? "border-[#FF0080] bg-[#FF0080]/10 text-[#FF0080]"
                                                : "border-slate-200 text-slate-500 hover:border-slate-300"
                                        )}
                                    >
                                        Venta directa
                                        <span className="text-[10px] font-normal mt-0.5 opacity-70">Precio fijo</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, tipo_venta: 'subasta' }))}
                                        className={cn(
                                            "flex flex-col items-center py-3 px-2 rounded-xl border-2 font-bold text-sm transition-all",
                                            form.tipo_venta === 'subasta'
                                                ? "border-[#FF1970] bg-[#FF1970]/10 text-[#FF1970]"
                                                : "border-slate-200 text-slate-500 hover:border-slate-300"
                                        )}
                                    >
                                        Subasta premium
                                        <span className="text-[10px] font-normal mt-0.5 opacity-70">Para mejores piezas</span>
                                    </button>
                                </div>
                            </div>

                            {/* Info card */}
                            <div className="bg-[#E8FAF7] border border-[#40C4AA]/30 rounded-xl px-4 py-3 flex flex-col gap-1.5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Código generado:</span>
                                    <span className="font-bold text-[#40C4AA]">BIZ-{String(Date.now()).slice(-4)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Costo base asignado:</span>
                                    <span className="font-bold text-[#FF0080]">
                                        {form.costo_base ? `$${parseFloat(form.costo_base).toFixed(2)}` : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {errorMessage && (
                            <p className="text-xs text-red-500 font-semibold">{errorMessage}</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!canSave}
                        className="flex-1 py-3 rounded-xl bg-[#FF0080] hover:bg-[#FF0080]/90 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                    >
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Guardar producto
                    </button>
                </div>
            </div>
        </div>
    );
}
