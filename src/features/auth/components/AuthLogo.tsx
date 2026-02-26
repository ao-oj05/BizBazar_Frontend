import { ShoppingBag } from "lucide-react";
import { cn } from "@/src/shared/utils";

export const AuthLogo = ({ className }: { className?: string }) => {
    return (
        <div className={cn("flex flex-col items-center gap-2", className)}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                <ShoppingBag className="text-white w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">BizBazar</h1>
        </div>
    );
};
