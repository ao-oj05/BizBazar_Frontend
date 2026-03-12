import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

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

interface Subcategoria {
    id: string;
    nombre: string;
    tipo: string;
}

export function NuevaJoyaModal({ onClose, onSave }: { onClose: () => void; onSave: (j: Joya) => void }) {
    const [form, setForm] = useState({ nombre: '', subcategoria_id: '', tipo_venta: 'directa', precio: '', costo_base: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);

    useEffect(() => {
        const fetchSubcategorias = async () => {
            try {
                const res = await fetch('/api/configuracion/categorias');
                if (res.ok) {
                    const data = await res.json();
                    // Normalize to handle 'Joyería', 'joyería', 'joyeria'
                    const filtered = (Array.isArray(data) ? data : data.data ?? []).filter((s: Subcategoria) => {
                        const t = s.tipo?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                        return t === 'joyeria';
                    });
                    setSubcategorias(filtered);
                }
            } catch (error) {
                console.error('Error fetching subcategorias:', error);
            }
        };
        fetchSubcategorias();
    }, []);

    const handleSave = async () => {
        if (!form.nombre || !form.subcategoria_id) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/productos', { // <-- Changed from /api/joyeria to /api/productos because joyeria uses the same `productos` table and endpoint.
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    codigo: form.nombre.replace(/\s+/g, '-').toUpperCase() + '-' + Date.now().toString().slice(-4),
                    nombre: form.nombre,
                    categoria: 'joyeria',
                    subcategoria_id: form.subcategoria_id,
                    tipo_venta: form.tipo_venta,
                    costo_base: form.costo_base ? parseFloat(form.costo_base) : 0,
                    precio_venta: form.precio ? parseFloat(form.precio) : null,
                    imagenes: []
                }),
            });
            if (res.ok) {
                const nueva = await res.json();
                onSave(nueva);
            } else {
                console.error('Error al crear joya:', await res.text());
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between px-6 py-4 bg-slate-800 rounded-t-2xl">
                    <h2 className="text-lg font-bold text-white">Agregar pieza</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                    <div className="col-span-2 flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Nombre</label>
                        <input className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Pulsera dorada vintage" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Subcategoría</label>
                        <select className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" value={form.subcategoria_id} onChange={e => setForm(f => ({ ...f, subcategoria_id: e.target.value }))}>
                            <option value="">Seleccionar</option>
                            {subcategorias.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Tipo de venta</label>
                        <select className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" value={form.tipo_venta} onChange={e => setForm(f => ({ ...f, tipo_venta: e.target.value }))}>
                            <option value="directa">Directa</option>
                            <option value="subasta">Subasta</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Costo Base</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <input type="number" className="w-full border border-slate-200 rounded-xl pl-7 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="0" value={form.costo_base} onChange={e => setForm(f => ({ ...f, costo_base: e.target.value }))} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Precio de venta</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <input type="number" className="w-full border border-slate-200 rounded-xl pl-7 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="0" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} />
                        </div>
                    </div>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancelar</button>
                    <button onClick={handleSave} disabled={!form.nombre || !form.subcategoria_id || isSaving}
                        className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
