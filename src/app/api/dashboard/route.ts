import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

// GET /api/dashboard
export async function GET(req: NextRequest) {
    try {
        const res = await fetch(`${API_URL}/dashboard`, {
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[API] GET /dashboard error:', error);
        return NextResponse.json({ message: 'Error al conectar con el servidor' }, { status: 500 });
    }
}
