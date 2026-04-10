'use client';
import { Bell, User, Settings, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

import { usePathname } from "next/navigation";

const routeTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/productos': 'Productos — Ropa',
    '/dashboard/lotes': 'Gestión de Lotes',
    '/dashboard/joyeria': 'Productos — Joyería',
    '/dashboard/ventas': 'Ventas y Movimientos',

    '/dashboard/reportes': 'Reportes y Métricas',
    '/dashboard/configuracion': 'Configuración del Sistema',
    '/dashboard/notificaciones': 'Notificaciones',
};

export function Topbar() {
    const [showProfile, setShowProfile] = useState(false);
    const [hasAlerts, setHasAlerts] = useState(false);
    const pathname = usePathname();
    const title = routeTitles[pathname] || 'Dashboard';

    useEffect(() => {
        const checkAlerts = async () => {
            try {
                const res = await fetch('/api/dashboard');
                if (res.ok) {
                    const data = await res.json();
                    if (data.alerts && data.alerts.length > 0) {
                        setHasAlerts(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching alerts:', error);
            }
        };
        checkAlerts();
    }, [pathname]);

    return (
        <header className="h-20 bg-white flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            </div>

            <div className="flex items-center gap-6">

                <Link href="/dashboard/notificaciones" className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
                    <Bell className="w-5 h-5" />
                    {hasAlerts && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white" />
                    )}
                </Link>

                <div className="relative">
                    <button
                        onClick={() => setShowProfile(!showProfile)}
                        className="flex items-center gap-3 p-1 pr-3 hover:bg-slate-50 rounded-full transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                            <User className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">Usuario</span>
                    </button>

                    <AnimatePresence>
                        {showProfile && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 overflow-hidden"
                            >
                                <Link href="/dashboard/configuracion" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                                    <Settings className="w-4 h-4" />
                                    Configuración
                                </Link>
                                <Link href="/auth/login" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <LogOut className="w-4 h-4" />
                                    Cerrar sesión
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
