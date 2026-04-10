"use client";

import React, { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { cn } from "@/src/shared/utils";
import {
    Bell,
    AlertTriangle,
    ShoppingCart,
    Gavel,
    Package,
    TrendingUp,
    Info,
    Check
} from "lucide-react";
import Link from "next/link";

interface Notification {
    id: string;
    type: 'Stock Bajo' | 'Venta' | 'Lote' | 'Ganancia' | 'Sistema';
    title: string;
    description: string;
    time: string;
    linkText?: string;
    linkUrl?: string;
    unread: boolean;
}

const mockNotifications: Notification[] = [
    {
        id: "1",
        type: "Stock Bajo",
        title: "Stock bajo: Blusa Floral Manga Larga",
        description: "Solo quedan 2 unidades de 'Blusa Floral Manga Larga' (tallas S, M). Considera reabastecer.",
        time: "Hace 30 min",
        linkText: "Ver producto →",
        linkUrl: "/dashboard/productos",
        unread: true
    },
    {
        id: "2",
        type: "Venta",
        title: "Venta completada #V-0412",
        description: "Se vendieron 3 artículos por $1,850. Ganancia: $620 (33.5%). Método de pago: Efectivo.",
        time: "Hace 1h",
        linkText: "Ver venta →",
        linkUrl: "/dashboard/ventas",
        unread: true
    },

    {
        id: "4",
        type: "Lote",
        title: "Lote #L-087 registrado exitosamente",
        description: "Se registró el lote 'Primavera 2026' con 45 prendas. Costo base por prenda: $40.",
        time: "Hace 5h",
        linkText: "Ver lote →",
        linkUrl: "/dashboard/lotes",
        unread: false
    },
    {
        id: "5",
        type: "Ganancia",
        title: "Meta de ganancia diaria alcanzada",
        description: "Has alcanzado tu meta de ganancia diaria de $1,200. Ganancia actual: $1,240. Sigue vendiendo!",
        time: "Hace 5h",
        linkText: "Ver reportes →",
        linkUrl: "/dashboard/reportes",
        unread: false
    },
    {
        id: "6",
        type: "Stock Bajo",
        title: "Stock agotado: Anillo Plata 925 Zirconia",
        description: "El producto 'Anillo Plata 925 Zirconia' (código JOY-045) se ha agotado. Última venta hace 2 días.",
        time: "Hace 20h",
        linkText: "Ver joyería →",
        linkUrl: "/dashboard/joyeria",
        unread: false
    },

    {
        id: "8",
        type: "Venta",
        title: "Venta completada #V-0411",
        description: "Se vendieron 5 artículos por $3,200. Ganancia: $1,050 (32.8%). Método de pago: Tarjeta.",
        time: "Hace 23h",
        linkText: "Ver venta →",
        linkUrl: "/dashboard/ventas",
        unread: false
    },
    {
        id: "9",
        type: "Sistema",
        title: "Respaldo automático completado",
        description: "Se realizó el respaldo automático de la base de datos. Próximo respaldo: 2026-03-13 03:00.",
        time: "Ayer",
        unread: false
    },
    {
        id: "10",
        type: "Stock Bajo",
        title: "5 productos con stock bajo",
        description: "Hay 5 productos de ropa con menos de 3 unidades disponibles. Revisa tu inventario para evitar faltantes.",
        time: "Ayer",
        linkText: "Ver inventario →",
        linkUrl: "/dashboard/reportes",
        unread: false
    },
    {
        id: "11",
        type: "Ganancia",
        title: "Reporte semanal disponible",
        description: "Tu reporte de la semana del 3 al 9 de marzo ya está disponible. Ganancia total: $8,720. Mejora del 12% vs semana anterior.",
        time: "Hace 2 días",
        linkText: "Ver reportes →",
        linkUrl: "/dashboard/reportes",
        unread: false
    },
    {
        id: "12",
        type: "Lote",
        title: "Lote #L-086 - 80% vendido",
        description: "El lote 'Invierno Remate' tiene el 80% de sus productos vendidos. Quedan 6 prendas por vender.",
        time: "Hace 2 días",
        linkText: "Ver lote →",
        linkUrl: "/dashboard/lotes",
        unread: false
    }
];

const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
        case 'Stock Bajo':
            return {
                icon: AlertTriangle,
                wrapperClass: "bg-red-50 text-red-500",
                badgeClass: "bg-red-50 text-red-500"
            };
        case 'Venta':
            return {
                icon: ShoppingCart,
                wrapperClass: "bg-pink-50 text-[#F9007A]",
                badgeClass: "bg-pink-50 text-[#F9007A]"
            };

        case 'Lote':
            return {
                icon: Package,
                wrapperClass: "bg-[#FF9DAA]/20 text-[#FF1970]",
                badgeClass: "bg-[#FF9DAA]/20 text-[#FF1970]"
            };
        case 'Ganancia':
            return {
                icon: TrendingUp,
                wrapperClass: "bg-amber-50 text-amber-500",
                badgeClass: "bg-amber-50 text-amber-500"
            };
        case 'Sistema':
            return {
                icon: Info,
                wrapperClass: "bg-slate-100 text-slate-500",
                badgeClass: "bg-slate-100 text-slate-500"
            };
    }
};

export default function NotificacionesPage() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [notifications, setNotifications] = useState(mockNotifications);
    const [activeFilter, setActiveFilter] = useState('Todas');

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
    };

    const clearRead = () => {
        setNotifications(notifications.filter(n => n.unread));
    };

    const countUnread = notifications.filter(n => n.unread).length;
    const filterCounts = {
        'Todas': notifications.length,
        'Stock Bajo': notifications.filter(n => n.type === 'Stock Bajo').length,
        'Ventas': notifications.filter(n => n.type === 'Venta').length,
        'Lotes': notifications.filter(n => n.type === 'Lote').length,
        'Ganancias': notifications.filter(n => n.type === 'Ganancia').length,
        'Sistema': notifications.filter(n => n.type === 'Sistema').length,
    };

    const filteredNotifications = activeFilter === 'Todas'
        ? notifications
        : notifications.filter(n => n.type === activeFilter.replace('s', '') || n.type === activeFilter.slice(0, -1)); // simple plural matching

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className={cn("flex-1 transition-all duration-300 flex flex-col min-h-screen", isCollapsed ? "ml-20" : "ml-64")}>
                <Topbar />

                <main className="flex-1 p-8 pb-20 max-w-6xl mx-auto w-full">
                    {/* Header Top */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center text-[#F9007A] shrink-0">
                                <Bell className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Notificaciones</h1>
                                <p className="text-slate-500 font-medium">{countUnread} sin leer</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm font-semibold">
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-2 text-[#40C4AA] hover:text-[#40C4AA]/80 transition-colors"
                            >
                                <Check className="w-4 h-4" /> Marcar todas como leídas
                            </button>
                            <button
                                onClick={clearRead}
                                className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
                            >
                                <span className="text-lg leading-none mb-0.5">🗑</span> Limpiar leídas
                            </button>
                        </div>
                    </div>

                    {/* Filters Desktop */}
                    <div className="flex flex-wrap items-center gap-3 mb-8">
                        {Object.entries(filterCounts).map(([key, count]) => {
                            const isActive = activeFilter === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveFilter(key)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors shadow-sm",
                                        isActive
                                            ? "bg-[#F9007A] text-white border border-[#F9007A]"
                                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                                    )}
                                >
                                    {key === 'Todas' && <Bell className="w-4 h-4" />}
                                    {key === 'Stock Bajo' && <AlertTriangle className="w-4 h-4" />}
                                    {key === 'Ventas' && <ShoppingCart className="w-4 h-4" />}

                                    {key === 'Lotes' && <Package className="w-4 h-4" />}
                                    {key === 'Ganancias' && <TrendingUp className="w-4 h-4" />}
                                    {key === 'Sistema' && <Info className="w-4 h-4" />}
                                    {key}
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-xs",
                                        isActive ? "bg-white/20" : "bg-slate-100 text-slate-500"
                                    )}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* List container */}
                    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden mb-6">
                        {filteredNotifications.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 font-medium">
                                No tienes notificaciones en esta categoría.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {filteredNotifications.map((notif) => {
                                    const { icon: Icon, wrapperClass, badgeClass } = getTypeStyles(notif.type);
                                    return (
                                        <div
                                            key={notif.id}
                                            className={cn(
                                                "p-6 flex items-start gap-4 transition-colors hover:bg-slate-50/50",
                                                notif.unread ? "bg-white" : "opacity-75 bg-slate-50/50"
                                            )}
                                        >
                                            {/* Unread dot */}
                                            <div className="w-2 flex justify-center pt-5 shrink-0">
                                                {notif.unread && <span className="w-2 h-2 rounded-full bg-[#F9007A]" />}
                                            </div>

                                            {/* Icon */}
                                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", wrapperClass)}>
                                                <Icon className="w-6 h-6" />
                                            </div>

                                            {/* Contenido */}
                                            <div className="flex-1 min-w-0 pr-4">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <h3 className="text-sm md:text-base font-bold text-slate-800">
                                                        {notif.title}
                                                    </h3>
                                                    <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-md tracking-wider border border-white/10", badgeClass)}>
                                                        {notif.type}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 mb-2 leading-relaxed max-w-4xl">
                                                    {notif.description}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs font-semibold">
                                                    <span className="text-slate-400">{notif.time}</span>
                                                    {notif.linkText && notif.linkUrl && (
                                                        <Link href={notif.linkUrl} className="text-[#38bdf8] hover:underline">
                                                            {notif.linkText}
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer list */}
                    <div className="flex flex-wrap items-center justify-between text-xs font-bold text-slate-400 px-2 gap-4">
                        <span>Mostrando {filteredNotifications.length} de {notifications.length} notificaciones</span>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-red-400" /> {filterCounts['Stock Bajo']} alertas</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
