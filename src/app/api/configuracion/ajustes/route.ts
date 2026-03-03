import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

// GET /api/configuracion/ajustes    → Obtener ajustes generales
// PUT /api/configuracion/ajustes    → Guardar ajustes generales
//
// Body para PUT: { incrementoMinimo, moneda, formatoCodigos }
export async function GET() {
    try {
        const res = await fetch(`${API_URL}/configuracion/ajustes`, {
            headers: { 'Content-Type': 'application/json' },
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
        const res = await fetch(`${API_URL}/configuracion/ajustes`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[API] PUT /configuracion/ajustes error:', error);
        return NextResponse.json({ message: 'Error al conectar con el servidor' }, { status: 500 });
    }
}
