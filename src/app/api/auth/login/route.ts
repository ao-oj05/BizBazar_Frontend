import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// POST /api/auth/login
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
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
        }
        
        return response;
    } catch (error) {
        console.error('[API] POST /auth/login error:', error);
        return NextResponse.json({ message: 'Error al conectar con el servidor' }, { status: 500 });
    }
}
