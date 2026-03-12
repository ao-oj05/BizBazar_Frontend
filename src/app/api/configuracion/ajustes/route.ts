import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// GET /api/configuracion/ajustes    → Obtener ajustes generales
// PUT /api/configuracion/ajustes    → Guardar ajustes generales
//
// Body para PUT: { incrementoMinimo, moneda, formatoCodigos }
export async function GET(req: NextRequest) {
    try {
        
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const authHeader = req.headers.get('authorization') || (token ? `Bearer ${token}` : null);
        const headersContent: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authHeader) headersContent['Authorization'] = authHeader;
        
        const res = await fetch(`${API_URL}/api/configuracion/ajustes`, {
            headers: headersContent,
            cache: 'no-store',
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[API] GET /configuracion/ajustes error:', error);
        return NextResponse.json({ message: 'Error al conectar con el servidor' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const authHeader = req.headers.get('authorization') || (token ? `Bearer ${token}` : null);
        const headersContent: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authHeader) headersContent['Authorization'] = authHeader;
        
        const res = await fetch(`${API_URL}/api/configuracion/ajustes`, {
            method: 'PUT',
            headers: headersContent,
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[API] PUT /configuracion/ajustes error:', error);
        return NextResponse.json({ message: 'Error al conectar con el servidor' }, { status: 500 });
    }
}
