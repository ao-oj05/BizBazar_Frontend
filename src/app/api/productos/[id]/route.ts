import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// GET    /api/productos/[id]  → Obtener un producto por ID
// PUT    /api/productos/[id]  → Actualizar producto
// DELETE /api/productos/[id]  → Eliminar producto

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    try {
        
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const authHeader = req.headers.get('authorization') || (token ? `Bearer ${token}` : null);
        const headersContent: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authHeader) headersContent['Authorization'] = authHeader;
        
        const res = await fetch(`${API_URL}/api/productos/${id}`, {
            headers: headersContent,
            cache: 'no-store',
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error(`[API] GET /productos/${id} error:`, error);
        return NextResponse.json({ message: 'Error al conectar con el servidor' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    try {
        const body = await req.json();
        
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const authHeader = req.headers.get('authorization') || (token ? `Bearer ${token}` : null);
        const headersContent: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authHeader) headersContent['Authorization'] = authHeader;
        
        const res = await fetch(`${API_URL}/api/productos/${id}`, {
            method: 'PUT',
            headers: headersContent,
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error(`[API] PUT /productos/${id} error:`, error);
        return NextResponse.json({ message: 'Error al conectar con el servidor' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    try {
        
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const authHeader = req.headers.get('authorization') || (token ? `Bearer ${token}` : null);
        const headersContent: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authHeader) headersContent['Authorization'] = authHeader;
        
        const res = await fetch(`${API_URL}/api/productos/${id}`, {
            method: 'DELETE',
            headers: headersContent,
        });
        const data = await res.json().catch(() => ({}));
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error(`[API] DELETE /productos/${id} error:`, error);
        return NextResponse.json({ message: 'Error al conectar con el servidor' }, { status: 500 });
    }
}
