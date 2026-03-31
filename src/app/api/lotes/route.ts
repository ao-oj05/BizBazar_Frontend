import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// GET /api/lotes          → Listar todos los lotes
// POST /api/lotes         → Crear un nuevo lote
//
// Body esperado para POST:
// { nombre, piezas, fecha, precioTotal, gastosAdicionales }
import { cookies } from 'next/headers';

/** Decode JWT payload without verifying signature (safe for internal use, signature verified by backend) */
function decodeJwtPayload(token: string): Record<string, any> | null {
    try {
        const base64Payload = token.split('.')[1];
        if (!base64Payload) return null;
        const decoded = Buffer.from(base64Payload, 'base64url').toString('utf8');
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.toString();
        
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const authHeader = req.headers.get('authorization') || (token ? `Bearer ${token}` : null);
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authHeader) headers['Authorization'] = authHeader;

        const res = await fetch(`${API_URL}/api/lotes${query ? `?${query}` : ''}`, {
            headers,
            cache: 'no-store',
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[API] GET /lotes error:', error);
        return NextResponse.json({ message: 'Error al conectar con el servidor' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const authHeader = req.headers.get('authorization') || (token ? `Bearer ${token}` : null);

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authHeader) headers['Authorization'] = authHeader;

        // Decode the JWT to extract usuario_id and inject it into the body
        // The backend DB requires it but doesn't extract it from the token automatically
        let enrichedBody = { ...body };
        if (token) {
            const payload = decodeJwtPayload(token);
            if (payload?.id && !enrichedBody.usuario_id) {
                enrichedBody.usuario_id = payload.id;
            }
        }

        const res = await fetch(`${API_URL}/api/lotes`, {
            method: 'POST',
            headers,
            body: JSON.stringify(enrichedBody),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[API] POST /lotes error:', error);
        return NextResponse.json({ message: 'Error al conectar con el servidor' }, { status: 500 });
    }
}
