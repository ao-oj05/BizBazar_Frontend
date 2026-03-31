import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

function decodeJwtPayload(token: string): Record<string, any> | null {
    try {
        const base64Payload = token.split('.')[1];
        if (!base64Payload) return null;
        return JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf8'));
    } catch { return null; }
}

// GET  /api/joyeria    → Listar piezas de joyería (soporta ?estado=&search=)
// POST /api/joyeria    → Crear nueva pieza de joyería
//
// Body esperado para POST:
// { nombre, descripcion, subcategoria, costo, codigo?, tipoVenta, imagen? }
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.toString();
        
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const authHeader = req.headers.get('authorization') || (token ? `Bearer ${token}` : null);
        const headersContent: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authHeader) headersContent['Authorization'] = authHeader;
        
        const res = await fetch(`${API_URL}/api/joyeria${query ? `?${query}` : ''}`, {
            headers: headersContent,
            cache: 'no-store',
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[API] GET /joyeria error:', error);
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

        let enrichedBody = { ...body };
        if (token) {
            const payload = decodeJwtPayload(token);
            if (payload?.id && !enrichedBody.usuario_id) {
                enrichedBody.usuario_id = payload.id;
            }
        }
        
        const res = await fetch(`${API_URL}/api/joyeria`, {
            method: 'POST',
            headers: headersContent,
            body: JSON.stringify(enrichedBody),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[API] POST /joyeria error:', error);
        return NextResponse.json({ message: 'Error al conectar con el servidor' }, { status: 500 });
    }
}
