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
// GET /api/dashboard
export async function GET(req: NextRequest) {
    try {
        // Simulando datos para que puedas ver el dashboard sin la API
        const mockData = {
            stats: {
                clothingProducts: 156,
                jewelryProducts: 43,
                soldToday: 12,
                dailyProfit: '$1,240',
                accumulatedProfit: '$15,400',
                activeLots: 8
            },
            sales: [
                { id: "#001", product: "Chamarra de Cuero", type: "Ropa", price: "$450", profit: "+$120", time: "10:30 AM" },
                { id: "#002", product: "Collar de Oro 14k", type: "Joyería", price: "$1,200", profit: "+$400", time: "11:15 AM" }
            ],
            alerts: [
                { id: "1", title: "Stock bajo", description: "Pantalones de mezclilla talla 32 están por agotarse.", type: "warning" },
                { id: "2", title: "Lote expirado", description: "Lote #45 no se vendió por completo.", type: "danger" }
            ]
        };

        return NextResponse.json(mockData, { status: 200 });

        /* 
        // Descomentar cuando la API esté lista
        const res = await fetch(`${API_URL}/dashboard`, {
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
        */
    } catch (error) {
        console.error('[API] GET /dashboard error:', error);
        return NextResponse.json({ message: 'Error al conectar con el servidor' }, { status: 500 });
    }
}
