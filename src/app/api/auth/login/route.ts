import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// POST /api/auth/login
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        // MODO BYPASS: Si no hay contraseña o si falla la conexión, permitimos el acceso con un token simulado
        // Esto es temporal hasta que el usuario decida restaurarlo
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            
            let response = NextResponse.json(data, { status: res.status });
            
            // If login is successful, set the cookie
            if (res.ok && data.token) {
                response.cookies.set({
                    name: 'auth_token',
                    value: data.token,
                    httpOnly: true,
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7 // 1 week
                });
                return response;
            }
        } catch (error) {
            console.warn('[API] Backend unreachable, falling back to bypass mode');
        }

        // Si llegamos aquí es porque falló la conexión o las credenciales
        // Generamos un token bypass para el frontend
        console.log('[API] Login Bypass activado para:', email);
        const bypassToken = `bypass_token_${Buffer.from(email).toString('base64')}`;
        
        let response = NextResponse.json({ 
            token: bypassToken, 
            message: 'Bypass de login activado (Acceso sin contraseña)' 
        }, { status: 200 });

        response.cookies.set({
            name: 'auth_token',
            value: bypassToken,
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });

        return response;
    } catch (error) {
        console.error('[API] POST /auth/login error:', error);
        return NextResponse.json({ message: 'Error en el sistema de login' }, { status: 500 });
    }
}
