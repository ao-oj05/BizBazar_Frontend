import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// GET /api/reportes/categoria?tipo=Ropa|Joyería
// Respuesta esperada:
// { totalDisponible, totalVendido, ingresos, ganancia,
//   topProductos: [...], ventasPorSubcategoria: [...] }
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.toString();
        const res = await fetch(`${API_URL}/api/reportes/categoria${query ? `?${query}` : ''}`, {
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[API] GET /reportes/categoria error:', error);
        return NextResponse.json({ message: 'Error al conectar con el servidor' }, { status: 500 });
    }
}
