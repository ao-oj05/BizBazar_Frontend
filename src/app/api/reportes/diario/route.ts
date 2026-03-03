import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

// GET /api/reportes/diario?fecha=YYYY-MM-DD
// Respuesta esperada:
// { ventasRopa, ventasJoyeria, totalVendido, totalGanancia, subastasCerradas,
//   productosAgregados, ventasPorHora: [...], ventas: [...] }
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.toString();
        const res = await fetch(`${API_URL}/reportes/diario${query ? `?${query}` : ''}`, {
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[API] GET /reportes/diario error:', error);
        return NextResponse.json({ message: 'Error al conectar con el servidor' }, { status: 500 });
    }
}
