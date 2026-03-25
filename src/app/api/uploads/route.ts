import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// POST /api/uploads
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const headersContent: Record<string, string> = {};
        if (token) headersContent['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/api/uploads`, {
            method: 'POST',
            headers: headersContent,
            body: formData,
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[API] POST /uploads error:', error);
        return NextResponse.json({ message: 'Error al subir imagen' }, { status: 500 });
    }
}
