import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// GET  /api/configuracion/categorias            → Listar categorías (soporta ?tipo=Ropa|Joyería)
// POST /api/configuracion/categorias            → Agregar categoría
// DELETE /api/configuracion/categorias?id=xxx   → Eliminar categoría
//
// Body para POST: { nombre, tipo: 'Ropa' | 'Joyería' }
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.toString();
        
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const authHeader = req.headers.get('authorization') || (token ? `Bearer ${token}` : null);
        const headersContent: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authHeader) headersContent['Authorization'] = authHeader;
        
        const res = await fetch(`${API_URL}/api/configuracion/categorias${query ? `?${query}` : ''}`, {
            headers: headersContent,
            cache: 'no-store',
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[API] GET /configuracion/categorias error:', error);
        return NextResponse.json({ message: 'Error al conectar con el servidor' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const authHeader = req.headers.get('authorization') || (token ? `Bearer ${token}` : null);
        const headersContent: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authHeader) headersContent['Authorization'] = authHeader;
        
        const res = await fetch(`${API_URL}/api/configuracion/categorias`, {
            method: 'POST',
            headers: headersContent,
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[API] POST /configuracion/categorias error:', error);
        return NextResponse.json({ message: 'Error al conectar con el servidor' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const authHeader = req.headers.get('authorization') || (token ? `Bearer ${token}` : null);
        const headersContent: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authHeader) headersContent['Authorization'] = authHeader;
        
        const res = await fetch(`${API_URL}/api/configuracion/categorias/${id}`, {
            method: 'DELETE',
            headers: headersContent,
        });
        const data = await res.json().catch(() => ({}));
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[API] DELETE /configuracion/categorias error:', error);
        return NextResponse.json({ message: 'Error al conectar con el servidor' }, { status: 500 });
    }
}
