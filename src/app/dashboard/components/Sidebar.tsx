'use client';
import {
    LayoutDashboard,
    Package,
    Shirt,
    Gem,
    ShoppingCart,
    Gavel,
    BarChart2,
    Settings,
    LogOut,
    Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/shared/utils";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Package, label: "Lotes", path: "/dashboard/lotes" },
    { icon: Shirt, label: "Productos - Ropa", path: "/dashboard/productos" },
    { icon: Gem, label: "Joyería", path: "/dashboard/joyeria" },
    { icon: ShoppingCart, label: "Ventas", path: "/dashboard/ventas" },
    { icon: BarChart2, label: "Reportes", path: "/dashboard/reportes" },
    { icon: Settings, label: "Configuración", path: "/dashboard/configuracion" },
];

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            onMouseEnter={() => setIsCollapsed(false)}
            onMouseLeave={() => setIsCollapsed(true)}
            className={cn(
                "bg-primary min-h-screen flex flex-col p-4 text-white fixed left-0 top-0 z-20 transition-all duration-300 ease-in-out shadow-xl",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className={cn(
                "flex items-center mb-10 px-2 h-10",
                isCollapsed ? "justify-center" : "justify-start"
            )}>
                {!isCollapsed ? (
                    <h1 className="text-2xl font-bold tracking-tight animate-in fade-in duration-300">BizBazar</h1>
                ) : (
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <Menu className="w-6 h-6" />
                    </div>
                )}
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group overflow-hidden whitespace-nowrap",
                                isActive
                                    ? "bg-secondary text-white shadow-lg shadow-secondary/20"
                                    : "hover:bg-white/10 text-white/80 hover:text-white",
                                isCollapsed && "justify-center px-0"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-white/70 group-hover:text-white")} />
                            {!isCollapsed && (
                                <span className="font-medium animate-in slide-in-from-left-2 duration-300">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <Link
                href="/auth/login"
                className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-all mt-auto group overflow-hidden whitespace-nowrap",
                    isCollapsed && "justify-center px-0"
                )}
            >
                <LogOut className="w-5 h-5 text-white/70 group-hover:text-white shrink-0" />
                {!isCollapsed && (
                    <span className="font-medium animate-in slide-in-from-left-2 duration-300">
                        Cerrar sesión
                    </span>
                )}
            </Link>
        </aside>
    );
}
