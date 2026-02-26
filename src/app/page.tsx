'use client';
import { motion } from "motion/react";
import Link from "next/link";
import { ShoppingBag, ArrowRight, ShieldCheck, BarChart3, Zap, Gem, Shirt, Star } from "lucide-react";
import { Button } from "@/src/shared/components/ui/button";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-bizbazar-gradient overflow-x-hidden">
            {/* Navigation */}
            <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                        <ShoppingBag className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold text-slate-800 tracking-tight">BizBazar</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                    <a href="#features" className="hover:text-primary transition-colors">Características</a>
                    <a href="#about" className="hover:text-primary transition-colors">Nosotros</a>
                    <Link href="/auth/login">
                        <Button variant="outline" size="sm" className="rounded-full">Iniciar Sesión</Button>
                    </Link>
                    <Link href="/auth/register">
                        <Button size="sm" className="rounded-full">Registrarse</Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6">
                        <Zap className="w-3 h-3" />
                        NUEVA VERSIÓN 2.0
                    </div>
                    <h1 className="text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6">
                        Gestiona tu negocio <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                            sin complicaciones.
                        </span>
                    </h1>
                    <p className="text-lg text-slate-600 mb-10 mx-auto max-w-lg leading-relaxed">
                        La plataforma definitiva para el control de inventario, ventas y subastas.
                        Diseñada para emprendedores que buscan eficiencia y crecimiento real.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/register">
                            <Button size="lg" className="rounded-2xl group w-full sm:w-auto">
                                Empezar ahora
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-12 flex items-center gap-6 grayscale opacity-50 justify-center">
                        <div className="flex items-center gap-2 font-bold text-slate-400">
                            <ShieldCheck className="w-5 h-5" /> SEGURO
                        </div>
                        <div className="flex items-center gap-2 font-bold text-slate-400">
                            <BarChart3 className="w-5 h-5" /> ANALÍTICO
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Features Section */}
            <section id="features" className="py-24 relative overflow-hidden">

                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-slate-900 mb-6 uppercase tracking-tighter">Características</h2>
                        <p className="text-2xl font-bold max-w-3xl mx-auto leading-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Solo una app</span>{" "}
                            <span className="text-slate-700">que ayuda a la gestión de tu negocio</span>{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">centrados en bazares y joyería.</span>
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <motion.div
                            whileHover={{ y: -10 }}
                            className="glass-card p-8 rounded-3xl border-t-4 border-t-primary"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                                <Shirt className="text-primary w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">Control de Bazares</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Gestiona lotes de ropa y accesorios con facilidad. Inventario detallado y seguimiento de ventas en tiempo real.
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -10 }}
                            className="glass-card p-8 rounded-3xl border-t-4 border-t-secondary"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
                                <Gem className="text-secondary w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">Joyas y Accesorios</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Herramientas específicas para el valor y detalle de piezas de joyería. Control de stock de alta precisión.
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -10 }}
                            className="glass-card p-8 rounded-3xl border-t-4 border-t-accent"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                                <Star className="text-accent w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">Ventas y Subastas</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Potencia tus ingresos con módulos de subastas integrados y reportes de ganancias automáticos.
                            </p>
                        </motion.div>
                    </div>

                    <div className="flex justify-center">
                        <Link href="/auth/register">
                            <Button size="lg" className="rounded-2xl px-12 bg-primary hover:bg-primary/90 hover:scale-105 transition-transform font-bold text-lg">
                                Iniciar ahora
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about" className="py-24 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="glass-card p-12 rounded-[3rem] text-center border-none shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />

                        <h2 className="text-4xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Nosotros</h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
                            Somos un equipo dedicado a crear herramientas eficientes para emprendedores de bazares y joyería, facilitando cada paso de su crecimiento. Creemos en el poder del comercio local y artesanal.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <div className="px-8 py-3 rounded-2xl bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] border border-primary/20 shadow-sm shadow-primary/5">Pasión</div>
                            <div className="px-8 py-3 rounded-2xl bg-secondary/10 text-secondary text-xs font-black uppercase tracking-[0.2em] border border-secondary/20 shadow-sm shadow-secondary/5">Tecnología</div>
                            <div className="px-8 py-3 rounded-2xl bg-accent/10 text-accent text-xs font-black uppercase tracking-[0.2em] border border-accent/20 shadow-sm shadow-accent/5">Crecimiento</div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="py-12 border-t border-slate-100 text-center text-slate-400 text-sm">
                <p>© 2026 BizBazar. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}
