'use client';
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLogo } from "@/src/features/auth/components/AuthLogo";
import { Input } from "@/src/shared/components/ui/input";
import { Button } from "@/src/shared/components/ui/button";
import { FormEvent, useState } from "react";
import { Loader2, X } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isTermsOpen, setIsTermsOpen] = useState(false);

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
                            Acepto los <button type="button" onClick={() => setIsTermsOpen(true)} className="text-secondary hover:underline font-medium">términos y condiciones</button>
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

            {/* Modal de Términos y Condiciones */}
            {isTermsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
                    >
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-bold text-slate-800">Términos y Condiciones</h2>
                            <button type="button" onClick={() => setIsTermsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto text-sm text-slate-600 space-y-4">
                            <p><strong>1. Aceptación de los Términos</strong><br/>Al registrarte y utilizar BizBazar, aceptas estar sujeto a estos términos y condiciones de uso y políticas de privacidad.</p>
                            <p><strong>2. Uso de la Plataforma</strong><br/>BizBazar es un sistema diseñado para la gestión integral de inventario general, lotes, joyería y subastas. Te comprometes a proporcionar información veraz sobre tus productos y a no utilizar la plataforma para actividades ilegales.</p>
                            <p><strong>3. Privacidad y Protección de Datos</strong><br/>Nos tomamos en serio la seguridad de tu negocio. Tus datos de ventas, reportes financieros e información de clientes se almacenan de manera segura bajo los estándares de la industria y no serán compartidos o vendidos a terceros.</p>
                            <p><strong>4. Responsabilidad de la Cuenta</strong><br/>Eres el único responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta. BizBazar no será responsable por pérdidas derivadas de accesos no autorizados a tu sesión si compartes tus credenciales.</p>
                            <p><strong>5. Modificaciones al Servicio</strong><br/>Nos reservamos el derecho de modificar o descontinuar el servicio, así como de actualizar estos términos en cualquier momento. Los cambios significativos te serán notificados adecuadamente.</p>
                        </div>
                        <div className="p-4 border-t bg-slate-50 flex justify-end">
                            <Button type="button" onClick={() => setIsTermsOpen(false)} className="bg-primary text-white px-6">
                                Entendido
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
