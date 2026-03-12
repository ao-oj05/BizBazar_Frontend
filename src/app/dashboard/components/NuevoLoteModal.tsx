import { useState } from 'react';
import { X, Package, Loader2 } from 'lucide-react';

const TODAY = new Date().toISOString().split('T')[0];

interface NuevoLoteForm {
    nombre: string;
    piezas: string;
    fecha: string;
    gastosAdicionales: string;
    precioTotal: string;
}

interface Lote {
    id: string;
    codigo: string;
    nombre: string;
    fecha: string;
    inversion: number;
    piezas: number;
    recuperado: number;
    estado: 'Activo' | 'Cerrado';
    productos: { nombre: string; estado: 'Vendido' | 'Disponible' | 'En subasta'; precio: number | null; ganancia: number | null }[];
}

export function NuevoLoteModal({ onClose, onSave }: { onClose: () => void; onSave: (lote: Lote) => void }) {
    const [form, setForm] = useState<NuevoLoteForm>({
        nombre: '', piezas: '', fecha: TODAY,
        gastosAdicionales: '', precioTotal: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const inversionTotal = (parseFloat(form.precioTotal) || 0) + (parseFloat(form.gastosAdicionales) || 0);
    const piezasNum = parseFloat(form.piezas) || 0;
    const costoPieza = piezasNum > 0 ? (inversionTotal / piezasNum).toFixed(2) : '0.00';

    const handleSave = async () => {
        if (!form.nombre || !form.piezas || !form.fecha || !form.precioTotal) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/lotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: form.nombre,
                    piezas: piezasNum,
                    fecha: form.fecha,
                    precioTotal: parseFloat(form.precioTotal) || 0,
                    gastosAdicionales: parseFloat(form.gastosAdicionales) || 0,
                }),
            });
            if (res.ok) {
                const newLote = await res.json();
                onSave(newLote);
            } else {
                console.error('Error al crear lote:', await res.text());
            }
        } catch (error) {
            console.error('Error al crear lote:', error);
        } finally {
            setIsSaving(false);
        }
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
                <div className="p-6 grid grid-cols-2 gap-4 text-left">
                    <div className="flex flex-col gap-1 col-span-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Nombre del lote</label>
                        <input className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder-slate-300" placeholder="LOTE FEBRERO" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Cantidad de piezas</label>
                        <input type="number" className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder-slate-300" placeholder="400" value={form.piezas} onChange={e => setForm(f => ({ ...f, piezas: e.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Fecha de compra</label>
                        <input type="date" max={TODAY} className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Precio total del lote</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <input type="number" className="w-full border border-slate-200 rounded-xl pl-7 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder-slate-300" placeholder="3500" value={form.precioTotal} onChange={e => setForm(f => ({ ...f, precioTotal: e.target.value }))} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Gastos adicionales</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <input type="number" className="w-full border border-slate-200 rounded-xl pl-7 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder-slate-300" placeholder="800" value={form.gastosAdicionales} onChange={e => setForm(f => ({ ...f, gastosAdicionales: e.target.value }))} />
                        </div>
                        <span className="text-xs text-slate-400">Transporte, bolsas, etc.</span>
                    </div>
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
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
                    <button onClick={handleSave} disabled={!form.nombre || !form.piezas || !form.precioTotal || isSaving} className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Guardar lote
                    </button>
                </div>
            </div>
        </div>
    );
}
