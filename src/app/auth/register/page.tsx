'use client';
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLogo } from "@/src/features/auth/components/AuthLogo";
import { Input } from "@/src/shared/components/ui/input";
import { Button } from "@/src/shared/components/ui/button";
import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message || 'Error al crear la cuenta');
                return;
            }

            router.push("/auth/login");
        } catch (error) {
            console.error("Register error:", error);
            setError('No se pudo conectar con el servidor');
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
                <p className="text-slate-500 text-sm mb-8">Crea tu cuenta</p>

                <form className="w-full space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 ml-1">Nombre completo</label>
                        <Input
                            type="text"
                            placeholder="Tu nombre"
                            required
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 ml-1">Email</label>
                        <Input
                            type="email"
                            placeholder="tu@email.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 ml-1">Contraseña</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <p className="text-[10px] text-slate-400 ml-1">Mínimo 8 caracteres</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 ml-1">Confirmar contraseña</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center">
                            {error}
                        </p>
                    )}

                    <div className="flex items-center gap-2 px-1 py-2">
                        <input type="checkbox" id="terms" className="rounded border-slate-300 text-primary focus:ring-primary" required />
                        <label htmlFor="terms" className="text-xs text-slate-600">
                            Acepto los <Link href="#" className="text-secondary hover:underline">términos y condiciones</Link>
                        </label>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Crear cuenta"}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-slate-500 text-sm">
                        ¿Ya tienes cuenta?{" "}
                        <Link href="/auth/login" className="text-secondary font-semibold hover:underline">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
