import * as React from "react";
import { cn } from "@/src/shared/utils";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const variants = {
            primary: "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20",
            secondary: "bg-secondary text-white hover:bg-secondary/90 shadow-lg shadow-secondary/20",
            outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700",
            ghost: "hover:bg-slate-100 text-slate-600",
        };

        const sizes = {
            sm: "h-9 px-3 text-xs",
            md: "h-11 px-6 text-sm font-medium",
            lg: "h-12 px-8 text-base font-semibold",
        };

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
