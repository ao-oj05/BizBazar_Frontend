'use client';
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLogo } from "@/src/features/auth/components/AuthLogo";
import { Input } from "@/src/shared/components/ui/input";
import { Button } from "@/src/shared/components/ui/button";
import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                setError('Credenciales inválidas o error de conexión');
                return;
            }

            const data = await res.json();
            // El backend devuelve un token
            localStorage.setItem('auth_token', data.token);

            router.push("/dashboard");
        } catch (err) {
            console.error("Login error:", err);
            setError('No se pudo conectar con el servidor. Intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bizbazar-gradient flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-md p-8 rounded-3xl flex flex-col items-center"
            >
                <AuthLogo className="mb-2" />
                <p className="text-slate-500 text-sm mb-8">Gestión de Inventario y Ventas</p>

                <form className="w-full space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 ml-1">Correo electrónico</label>
                        <Input
                            type="email"
                            placeholder="tu@email.com"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 ml-1">Contraseña</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center">
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Iniciar sesión"}
                    </Button>
                </form>

                <div className="mt-6 text-center space-y-4">
                    <div className="pt-4 border-t border-slate-100 w-full">
                        <p className="text-slate-500 text-sm">
                            ¿No tienes cuenta?{" "}
                            <Link href="/auth/register" className="text-secondary font-semibold hover:underline">
                                Crear cuenta
                            </Link>
                        </p>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-8">
                        © 2026 BizBazar. Todos los derechos reservados.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
