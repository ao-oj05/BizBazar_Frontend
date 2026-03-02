'use client';
import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { cn } from "@/src/shared/utils";
import { Store, ListTree, Settings as SettingsIcon, Image as ImageIcon, Plus, Edit2, Trash2, Save } from "lucide-react";

type ConfigTab = 'Datos del Negocio' | 'Categorías' | 'Ajustes Generales';

export default function ConfiguracionPage() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [activeTab, setActiveTab] = useState<ConfigTab>('Datos del Negocio');

    const tabs: { id: ConfigTab, icon: any }[] = [
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
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">Configuración</h1>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar Menu for Configurations */}
                        <div className="w-full lg:w-64 shrink-0">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                                <h2 className="text-sm font-bold text-slate-800 mb-4 px-2">Configuración</h2>
                                <nav className="flex flex-col gap-1">
                                    {tabs.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setActiveTab(t.id)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-full text-left whitespace-nowrap",
                                                activeTab === t.id
                                                    ? "bg-[#40C4AA] text-white shadow-md shadow-teal-200"
                                                    : "text-slate-500 hover:bg-slate-50"
                                            )}
                                        >
                                            <t.icon className={cn("w-5 h-5", activeTab === t.id ? "text-white" : "text-slate-400")} />
                                            {t.id}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Content Area */}
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

// ─── TABS COMPONENTS ─────────────────────────────────────────────────────────

function DatosNegocioTab() {
    return (
        <div className="flex flex-col gap-6 max-w-3xl">
            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Logo del negocio</label>
                <div className="border-2 border-dashed border-[#F43F5E] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors w-full max-w-md mx-auto">
                    <div className="w-16 h-16 bg-[#F43F5E]/10 text-[#F43F5E] rounded-2xl flex items-center justify-center mb-4">
                        <ImageIcon className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 mb-1">Arrastra tu imagen aquí o haz clic para seleccionar</p>
                    <p className="text-xs text-slate-400 font-medium">JPG, PNG o WEBP (máx. 5MB)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">Nombre del negocio</label>
                    <input type="text" defaultValue="BizBazar" className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#40C4AA]/20 focus:border-[#40C4AA] transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">Teléfono</label>
                    <input type="text" placeholder="+52 xxx xxx xxxx" className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#40C4AA]/20 focus:border-[#40C4AA] transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">Email</label>
                    <input type="email" placeholder="" className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#40C4AA]/20 focus:border-[#40C4AA] transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">Dirección</label>
                    <input type="text" placeholder="" className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#40C4AA]/20 focus:border-[#40C4AA] transition-all" />
                </div>
            </div>

            <div className="flex justify-end mt-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-[#40C4AA] hover:bg-[#40C4AA]/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-200 transition-colors">
                    <Save className="w-4 h-4" />
                    Guardar cambios
                </button>
            </div>
        </div>
    );
}

function CategoriasTab() {
    const [subTab, setSubTab] = useState<'Ropa' | 'Joyería'>('Ropa');

    const ropaCats = ['Blusa', 'Pantalón', 'Short', 'Vestido', 'Falda', 'Chamarra'];
    const joyeriaCats = ['Collar', 'Pulsera', 'Arete', 'Anillo', 'Otro'];

    const items = subTab === 'Ropa' ? ropaCats : joyeriaCats;

    return (
        <div className="flex flex-col gap-6">
            <h3 className="text-sm font-bold text-slate-800">Categorías y Subcategorías</h3>

            <div className="bg-white rounded-xl border border-slate-100 p-1.5 flex items-center gap-2 max-w-[200px]">
                <button
                    onClick={() => setSubTab('Ropa')}
                    className={cn("flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors", subTab === 'Ropa' ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-500 hover:bg-slate-50")}
                >
                    Ropa
                </button>
                <button
                    onClick={() => setSubTab('Joyería')}
                    className={cn("flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors", subTab === 'Joyería' ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-500 hover:bg-slate-50")}
                >
                    Joyería
                </button>
            </div>

            <div className="flex items-center gap-4">
                <input type="text" placeholder="Nueva subcategoría..." className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#40C4AA]/20 focus:border-[#40C4AA] transition-all" />
                <button className={cn("flex items-center gap-2 px-6 py-3 text-white rounded-xl text-sm font-bold shadow-md transition-colors", subTab === 'Ropa' ? "bg-[#40C4AA] hover:bg-[#40C4AA]/90 shadow-teal-200" : "bg-[#FF9DAA] hover:bg-[#FF9DAA]/90 shadow-pink-200")}>
                    <Plus className="w-4 h-4" />
                    Agregar
                </button>
            </div>

            <div className="flex flex-col gap-3 mt-2">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between border border-slate-100 rounded-xl p-4 bg-white hover:border-[#40C4AA]/30 transition-colors group">
                        <span className="text-sm font-bold text-slate-800">{item}</span>
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-[#40C4AA] hover:bg-[#40C4AA]/10 p-1.5 rounded-lg transition-colors">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="text-[#F43F5E] hover:bg-[#F43F5E]/10 p-1.5 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AjustesGeneralesTab() {
    return (
        <div className="flex flex-col gap-6 max-w-xl">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Incremento mínimo en subastas</label>
                <input type="text" defaultValue="$ 5" className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#40C4AA]/20 focus:border-[#40C4AA] transition-all" />
                <p className="text-[10px] text-slate-400 font-medium">Incremento mínimo por defecto para las subastas</p>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Moneda</label>
                <input type="text" placeholder="" className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#40C4AA]/20 focus:border-[#40C4AA] transition-all w-1/3" />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Formato de códigos automáticos</label>
                <input type="text" defaultValue="BIZ-XXX" className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#40C4AA]/20 focus:border-[#40C4AA] transition-all w-2/3" />
                <p className="text-[10px] text-slate-400 font-medium">Ejemplo: BIZ-001, BIZ-002, etc.</p>
            </div>

            <div className="flex justify-end mt-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-[#40C4AA] hover:bg-[#40C4AA]/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-200 transition-colors">
                    <Save className="w-4 h-4" />
                    Guardar ajustes
                </button>
            </div>
        </div>
    );
}
