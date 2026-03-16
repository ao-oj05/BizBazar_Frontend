import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[API] POST /auth/register error:', error);
        const errorMsg = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ 
            message: `Fallo conexión Vercel->AWS: ${errorMsg}. Verifica puertos EC2.`,
            debugUrl: API_URL
        }, { status: 500 });
    }
}
