import { ReactNode } from "react";
import { cn } from "@/src/shared/utils";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: ReactNode;
    iconBg: string;
    trend?: {
        value: string;
        isUp: boolean;
    };
}

export function StatCard({ label, value, icon, iconBg }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
                <h3 className={cn(
                    "text-3xl font-bold",
                    label.includes("Ganancia") ? "text-yellow-500" :
                        label.includes("Joyería") ? "text-secondary" : "text-primary"
                )}>{value}</h3>
            </div>
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconBg)}>
                {icon}
            </div>
        </div>
    );
}
