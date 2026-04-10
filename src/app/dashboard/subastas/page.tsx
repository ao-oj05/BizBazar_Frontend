'use client';
import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { cn } from "@/src/shared/utils";
import { Plus } from "lucide-react";

const mockSubastas = [
    {
        id: 's1',
        tipo: 'Ropa',
        nombre: 'Vestido rojo premium',
        codigo: 'BIZ-003',
        precioInicial: 120,
        estado: 'EN VIVO',
        tiempo: 'Hace 2 horas',
        imagen: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80',
    },
    {
        id: 's2',
        tipo: 'Joyería',
        nombre: 'Pulsera oro rosa premium',
        codigo: 'JY15',
        precioInicial: 350,
        estado: 'EN VIVO',
        tiempo: 'Hace 5 horas',
        imagen: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
    },
    {
        id: 's3',
        tipo: 'Joyería',
        nombre: 'Anillo diamante sintético',
        codigo: 'BIZ-102',
        precioInicial: 280,
        estado: 'EN VIVO',
        tiempo: 'Hace 1 día',
        imagen: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?w=800&q=80',
    }
];

export default function SubastasPage() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [activeTab, setActiveTab] = useState<'Activas' | 'Finalizadas'>('Activas');

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-20" : "ml-64")}>
                <Topbar />

                <main className="p-8 pb-20 max-w-7xl mx-auto">
                    
                    {/* Headers & Actions */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center bg-white rounded-xl shadow-sm border border-slate-100 p-1">
                            <button 
                                onClick={() => setActiveTab('Activas')}
                                className={cn("px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2", 
                                    activeTab === 'Activas' ? "bg-[#FACC15] text-white shadow-md shadow-yellow-400/30" : "text-slate-500 hover:bg-slate-50"
                                )}
                            >
                                <span className={cn("w-2 h-2 rounded-full", activeTab === 'Activas' ? "bg-white" : "bg-slate-300")} />
                                Activas (3)
                            </button>
                            <button 
                                onClick={() => setActiveTab('Finalizadas')}
                                className={cn("px-6 py-2.5 rounded-lg text-sm font-bold transition-colors", 
                                    activeTab === 'Finalizadas' ? "bg-[#FACC15] text-white shadow-md shadow-yellow-400/30" : "text-slate-500 hover:bg-slate-50"
                                )}
                            >
                                Finalizadas
                            </button>
                        </div>

                        <button className="flex items-center gap-2 bg-[#FACC15] hover:bg-[#FACC15]/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-yellow-400/20 transition-all">
                            <Plus className="w-4 h-4" /> Nueva Subasta
                        </button>
                    </div>

                    {/* Cards Grid */}
                    {activeTab === 'Activas' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mockSubastas.map(subasta => (
                                <div key={subasta.id} className="bg-white rounded-[24px] border-4 border-slate-50 shadow-xl shadow-slate-200/40 p-3 flex flex-col hover:border-yellow-100 transition-colors">
                                    
                                    {/* Top Banner (Yellow) */}
                                    <div className="bg-[#FACC15] rounded-xl py-2 mb-3 flex items-center justify-center gap-2 shadow-sm">
                                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                        <span className="text-white text-xs font-black tracking-wider">{subasta.estado}</span>
                                    </div>
                                    
                                    {/* Image */}
                                    <div className="w-full h-56 bg-slate-100 rounded-xl overflow-hidden mb-4">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={subasta.imagen} alt={subasta.nombre} className="w-full h-full object-cover" />
                                    </div>
                                    
                                    <div className="px-2 flex flex-col flex-1">
                                        {/* Type Pill */}
                                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md w-max mb-3",
                                            subasta.tipo === 'Ropa' ? "text-[#40C4AA] bg-[#40C4AA]/10" : "text-[#FF8A9B] bg-[#FF8A9B]/10"
                                        )}>
                                            {subasta.tipo}
                                        </span>
                                        
                                        {/* Title & Code */}
                                        <h3 className="text-lg font-black text-slate-800 leading-tight mb-1">{subasta.nombre}</h3>
                                        <span className="text-xs font-bold text-slate-400 mb-4 block">{subasta.codigo}</span>
                                        
                                        {/* Price Box */}
                                        <div className="bg-slate-50 rounded-xl p-4 flex flex-col mb-4">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Precio inicial</span>
                                            <span className="text-3xl font-black text-[#FACC15]">${subasta.precioInicial}</span>
                                        </div>
                                        
                                        <div className="mt-auto flex flex-col gap-4">
                                            <span className="text-[11px] font-bold text-slate-400">{subasta.tiempo}</span>
                                            <button className="w-full py-3.5 bg-[#FACC15] hover:bg-[#FACC15]/90 text-white font-black text-sm rounded-xl shadow-lg shadow-yellow-400/30 transition-colors">
                                                Cerrar subasta
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-slate-400 font-medium">
                            No hay subastas finalizadas.
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
