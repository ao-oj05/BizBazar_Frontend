import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

// GET /api/dashboard
// Respuesta esperada de la API de Node:
// {
//   stats: {
//     clothingProducts: number,
//     jewelryProducts: number,
//     soldToday: number,
//     dailyProfit: string,
//     accumulatedProfit: string,
//     activeLots: number
//   },
//   sales: Array<{ id, product, type, price, profit, time }>,
//   alerts: Array<{ id, title, description, type: 'danger'|'warning'|'info' }>
// }
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
