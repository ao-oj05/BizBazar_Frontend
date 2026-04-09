import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// POST /api/auth/login
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Llamada real al backend
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { message: data.message || 'Credenciales inválidas o error en el servidor' },
                { status: res.status }
            );
        }

        // Si el login es exitoso, esperamos un token en data.token
        const token = data.token;
        if (!token) {
            return NextResponse.json(
                { message: 'El servidor no devolvió un token válido' },
                { status: 500 }
            );
        }

        const response = NextResponse.json(data, { status: 200 });
        
        // Seteamos la cookie con el token real devuelto por la base de datos
        response.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 semana
        });

        return response;
    } catch (error) {
        console.error('[API] POST /auth/login error:', error);
        return NextResponse.json(
            { message: 'No se pudo conectar con el servidor de autenticación' }, 
            { status: 500 }
        );
    }
}
