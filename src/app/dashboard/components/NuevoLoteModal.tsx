import { useState } from 'react';
import { X, Package, Loader2, Calculator } from 'lucide-react';

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
    tipo: string;
    productos: { nombre: string; estado: 'Vendido' | 'Disponible'; precio: number | null; ganancia: number | null }[];
}

export function NuevoLoteModal({ onClose, onSave }: { onClose: () => void; onSave: (lote: Lote) => void }) {
    const [tipoLote, setTipoLote] = useState<'ropa' | 'joyeria'>('ropa');
    const [form, setForm] = useState<NuevoLoteForm>({
        nombre: '', piezas: '', fecha: TODAY,
        gastosAdicionales: '', precioTotal: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    /** Decode JWT payload in the browser without verifying signature */
    const getUsuarioId = (): string | null => {
        try {
            const cookie = document.cookie.split('; ').find(c => c.startsWith('auth_token='));
            if (!cookie) return null;
            const token = cookie.split('=')[1];
            const base64Payload = token.split('.')[1];
            if (!base64Payload) return null;
            const padded = base64Payload.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - base64Payload.length % 4) % 4);
            const payload = JSON.parse(atob(padded));
            return payload.id || payload.usuario_id || null;
        } catch { return null; }
    };

    const handleSave = async () => {
        setErrorMsg(null);
        if (!form.nombre || !form.piezas || !form.fecha || !form.precioTotal) return;
        setIsSaving(true);
        try {
            let nombre = form.nombre.trim();
            const joyeriaRegex = /(joyer|anillo|collar|pulsera|dije|arete|reloj)/i;
            if (tipoLote === 'joyeria' && !joyeriaRegex.test(nombre)) {
                nombre += ' (Joyería)';
            }
            
            let baseCodigo = nombre.replace(/\s+/g, '-').toUpperCase();
            if (baseCodigo.length > 25) baseCodigo = baseCodigo.slice(0, 25);
            if (baseCodigo.endsWith('-')) baseCodigo = baseCodigo.slice(0, 24);
            const codigo = baseCodigo + '-' + Date.now().toString().slice(-4);
            const usuario_id = getUsuarioId();

            const res = await fetch('/api/lotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    codigo,
                    nombre,
                    // If you have a way to persist "tipo" at the lot level, add it here.
                    // Assuming we can send it or it ignores it if unused.
                    tipo: tipoLote, 
                    piezas_total: Number(form.piezas),
                    fecha_compra: form.fecha,
                    precio_total: Number(form.precioTotal),
                    gastos_adicionales: Number(form.gastosAdicionales) || 0,
                    ...(usuario_id ? { usuario_id } : {}),
                }),
            });

            if (res.ok) {
                const newLote = await res.json();
                const data = newLote.data || newLote;
                onSave({ ...data, tipo: tipoLote });
            } else {
                const errText = await res.text();
                try {
                    const errJson = JSON.parse(errText);
                    setErrorMsg(errJson.error || errJson.message || 'Error al crear lote');
                } catch {
                    setErrorMsg(`Error del servidor: ${errText.slice(0, 120)}`);
                }
            }
        } catch (error: any) {
            console.error('Error al crear lote:', error);
            setErrorMsg(error.message || 'Error de conexión');
        } finally {
            setIsSaving(false);
        }
    };

    const isRopa = tipoLote === 'ropa';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white shadow-2xl w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-2xl overflow-hidden">
                
                {/* Header DYNAMIC COLOR */}
                <div className={`flex items-center justify-between px-6 py-4 ${isRopa ? 'bg-[#FF007F]' : 'bg-[#29AFFF]'} transition-colors`}>
                    <h2 className="text-base font-bold text-white tracking-tight">Crear nuevo lote</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-full transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="p-8 grid grid-cols-2 gap-6 text-left">
                    
                    {/* TIPO DE LOTE */}
                    <div className="col-span-2 flex flex-col gap-2">
                        <label className="text-[13px] font-semibold text-slate-600">Tipo de lote</label>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Option Ropa */}
                            <div 
                                onClick={() => setTipoLote('ropa')}
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${isRopa ? 'border-[#FF007F] bg-[#FF007F]/5' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isRopa ? 'bg-[#FF007F]/10 text-[#FF007F]' : 'bg-slate-100 text-slate-400'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42l-8.704-8.704z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-[15px]">Ropa</h3>
                                    <p className="text-[11px] text-slate-500 font-medium">Costo se divide entre piezas</p>
                                </div>
                            </div>

                            {/* Option Joyería */}
                            <div 
                                onClick={() => setTipoLote('joyeria')}
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${!isRopa ? 'border-[#29AFFF] bg-[#29AFFF]/5' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!isRopa ? 'bg-[#29AFFF]/10 text-[#29AFFF]' : 'bg-slate-100 text-slate-400'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 18 3 22 8 12 22 2 8"/><path d="M12 22 8 8 12 3 16 8z"/><path d="M2 8h20"/></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-[15px]">Joyería</h3>
                                    <p className="text-[11px] text-slate-500 font-medium">Cada pieza con costo individual</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BANNER INFORMATIVO */}
                    <div className={`col-span-2 p-4 rounded-xl text-xs flex items-center border ${isRopa ? 'bg-pink-50/50 text-slate-600 border-pink-100' : 'bg-sky-50/50 text-slate-600 border-sky-100'}`}>
                        {isRopa 
                          ? "Para ropa: El costo total del lote se dividirá automáticamente entre todas las piezas para calcular el costo base por prenda."
                          : "Para joyería: El costo total es referencia del lote. Al agregar cada pieza en la sección de Joyería, podrás asignarle su costo individual y código personalizado."
                        }
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#475569]">Nombre del lote</label>
                        <input className="border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300 placeholder-slate-400" placeholder={isRopa ? "Ej: Lote Primavera 2026" : "Ej: Lote Joyería Premium"} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#475569]">Cantidad de piezas</label>
                        <input type="number" className="border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300 placeholder-slate-400" placeholder="0" value={form.piezas} onChange={e => setForm(f => ({ ...f, piezas: e.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#475569]">Fecha de compra</label>
                        <input type="date" max={TODAY} className="border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300 text-slate-700" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#475569]">Gastos adicionales</label>
                        <div className="relative flex flex-col gap-1">
                            <span className="absolute left-4 top-2 text-slate-400 text-sm pointer-events-none">$</span>
                            <input type="number" className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300 placeholder-slate-400" placeholder="0.00" value={form.gastosAdicionales} onChange={e => setForm(f => ({ ...f, gastosAdicionales: e.target.value }))} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 col-span-2">
                        <label className="text-xs font-semibold text-[#475569]">{isRopa ? 'Precio total del lote' : 'Inversión total del lote'}</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">$</span>
                            <input type="number" className="w-full sm:w-1/2 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300 placeholder-slate-400" placeholder="0.00" value={form.precioTotal} onChange={e => setForm(f => ({ ...f, precioTotal: e.target.value }))} />
                        </div>
                    </div>

                    {/* CUADRO DE COSTO PROMEDIO */}
                    {(Number(form.precioTotal) > 0 && Number(form.piezas) > 0) && (
                        <div className="col-span-2 bg-[#FFFCF0] border border-[#FACC15]/40 rounded-xl p-4 flex items-center gap-4 animate-in fade-in zoom-in duration-300">
                            <div className="w-12 h-12 bg-[#FACC15] rounded-xl flex items-center justify-center text-white shadow-sm shadow-[#FACC15]/20 shrink-0">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Costo promedio por pieza</p>
                                <p className="text-2xl font-black text-[#FACC15]">
                                    ${((Number(form.precioTotal) + Number(form.gastosAdicionales)) / Number(form.piezas)).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    )}

                    {errorMsg && (
                        <div className="col-span-2 text-red-500 text-sm font-medium mt-2">
                            {errorMsg}
                        </div>
                    )}
                </div>

                <div className="px-8 pb-8 pt-2 flex gap-4 w-full">
                    <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Cancelar</button>
                    <button onClick={handleSave} disabled={!form.nombre || !form.piezas || !form.precioTotal || isSaving} className={`flex-1 py-3.5 rounded-xl text-white text-[15px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isRopa ? 'bg-[#FF007F] hover:bg-[#E60073]' : 'bg-[#29AFFF] hover:bg-[#209BF0]'}`}>
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Guardar lote
                    </button>
                </div>
            </div>
        </div>
    );
}
