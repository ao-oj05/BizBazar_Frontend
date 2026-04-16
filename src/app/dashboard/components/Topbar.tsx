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

    const [negocio, setNegocio] = useState<{ nombre: string | null, logoUrl: string | null }>({ nombre: null, logoUrl: null });

    const loadBusinessData = async () => {
        // Primero cargar de localStorage para mostrar inmediatamente
        const cached = localStorage.getItem('bizbazar_negocio');
        if (cached) {
            try {
                const c = JSON.parse(cached);
                setNegocio({ nombre: c.nombre || null, logoUrl: c.logoUrl || null });
            } catch { /* ignore */ }
        }
        // Luego intentar desde el API
        try {
            const res = await fetch('/api/configuracion/negocio?t=' + Date.now(), { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                const nombre = data.nombre || null;
                const logoUrl = data.logoUrl || data.logo || null;
                if ((nombre || logoUrl) && !cached) {
                    setNegocio({ nombre, logoUrl });
                }
            }
        } catch (e) {
            console.error('Error fetching business info:', e);
        }
    };

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
        loadBusinessData();

        const handleUpdate = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.nombre !== undefined || detail?.logoUrl !== undefined) {
                setNegocio({
                    nombre: detail.nombre || null,
                    logoUrl: detail.logoUrl || null,
                });
            } else {
                loadBusinessData();
            }
        };
        window.addEventListener('business_data_updated', handleUpdate);
        return () => window.removeEventListener('business_data_updated', handleUpdate);
    }, [pathname]);

    return (
        <header className="h-20 bg-white flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            </div>

            <div className="flex items-center gap-6">

                <div className="relative">
                    <button
                        onClick={() => setShowProfile(!showProfile)}
                        className="flex items-center gap-3 p-1 pr-3 hover:bg-slate-50 rounded-full transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white overflow-hidden shadow-sm">
                            {negocio.logoUrl ? (
                                <img src={negocio.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-6 h-6" />
                            )}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{negocio.nombre || 'Usuario'}</span>
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
