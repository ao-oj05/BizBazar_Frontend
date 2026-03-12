'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

const NuevoLoteSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    piezas: z.number().int().positive('Debe ser un número positivo'),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
    gastosAdicionales: z.number().min(0, 'No puede ser negativo'),
    precioTotal: z.number().positive('El precio debe ser mayor a 0')
});

export async function crearLoteAction(prevState: any, formData: FormData) {
    const rawData = {
        nombre: formData.get('nombre'),
        piezas: Number(formData.get('piezas')),
        fecha: formData.get('fecha'),
        gastosAdicionales: Number(formData.get('gastosAdicionales')),
        precioTotal: Number(formData.get('precioTotal'))
    };

    const validatedFields = NuevoLoteSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            error: 'Campos inválidos. Verifica los datos del lote.',
            details: validatedFields.error.flatten().fieldErrors,
            success: false
        };
    }

    const { nombre, piezas, fecha, gastosAdicionales, precioTotal } = validatedFields.data;

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/api/lotes`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                codigo: nombre.replace(/\s+/g, '-').toUpperCase() + '-' + Date.now().toString().slice(-4),
                nombre: nombre,
                piezas_total: piezas,
                fecha_compra: fecha,
                precio_total: precioTotal,
                gastos_adicionales: gastosAdicionales,
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            return { error: `Error del servidor: ${errorText}`, success: false };
        }

        const newLote = await res.json();
        return { success: true, data: newLote };

    } catch (error: any) {
        return { error: error.message || 'Error de conexión', success: false };
    }
}
