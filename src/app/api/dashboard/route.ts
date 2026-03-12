import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// GET /api/dashboard
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization') || (req.cookies && req.cookies.get('auth_token')?.value ? 'Bearer ' + req.cookies.get('auth_token').value : null);
        const headersContent = {  'Content-Type': 'application/json'  };
        if (authHeader) headersContent['Authorization'] = authHeader;
        
        const res = await fetch(`${API_URL}/api/dashboard`, {
            headers: headersContent,
            cache: 'no-store',
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[API] GET /dashboard error:', error);
        return NextResponse.json({ message: 'Error al conectar con el servidor' }, { status: 500 });
    }
}
