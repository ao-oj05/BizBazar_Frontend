import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// GET /api/reportes/rango?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
// Respuesta esperada:
// { totalVendido, totalGanancia, ventasDirectas, subastas, tendencia: [...] }
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.toString();
        
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const authHeader = req.headers.get('authorization') || (token ? `Bearer ${token}` : null);
        const headersContent: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authHeader) headersContent['Authorization'] = authHeader;
        
        const res = await fetch(`${API_URL}/api/reportes/rango${query ? `?${query}` : ''}`, {
            headers: headersContent,
            cache: 'no-store',
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[API] GET /reportes/rango error:', error);
        return NextResponse.json({ message: 'Error al conectar con el servidor' }, { status: 500 });
    }
}
