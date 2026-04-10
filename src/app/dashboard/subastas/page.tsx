'use client';
import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { cn } from "@/src/shared/utils";
import { Gavel } from "lucide-react";

export default function SubastasPage() {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-20" : "ml-64")}>
                <Topbar />

                <main className="p-8 pb-20 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
                        <Gavel className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 mb-2">Módulo deshabilitado</h1>
                    <p className="text-slate-500 text-center max-w-md font-medium">
                        La funcionalidad de subastas ha sido removida del sistema. 
                        Todas las ventas se gestionan ahora de forma directa desde los módulos de Ropa y Joyería.
                    </p>
                </main>
            </div>
        </div>
    );
}
