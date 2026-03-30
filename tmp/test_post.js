const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhkYWM2ODZhLWNkODQtNGQ0NS04OTUxLTNiYmEyYTA5ZjE4NiIsImVtYWlsIjoibHVjaTI1QGdtYWlsLmNvbSIsIm5vbWJyZSI6Ikx1Y2lhIExvcGV6ICIsImlhdCI6MTc3NDkxMzkwMCwiZXhwIjoxNzc1MDAwMzAwfQ.qBvlTFwVk4jQQUBCJ7Kjfdxt2P1JDPhCc0HyksEp1t8';
const vercelJwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiaXpiYXphci04aHkyeTBkNDEtYW8tb2owNXMtcHJvamVjdHMudmVyY2VsLmFwcCIsInVzZXJJZCI6Imxyb2FsdEg0TmdyT0J1SlAwY1Jubm1OUyIsInVzZXJuYW1lIjoiYW8tb2owNSIsIm93bmVySWQiOiJ0ZWFtX0thNHhIdHdUSEFCTUpiQWlOdzdLTkduSCIsInN1YiI6InNzby1wcm90ZWN0aW9uIiwiaWF0IjoxNzc0OTEzNjY2fQ.-_kmj_pOksFCmOuKWF1QaB7z_AaqPFDr0vHWOibAqfk';
const headers = { 'Cookie': `_vercel_jwt=${vercelJwt}; auth_token=${token}` };

async function run() {
    const catsRes = await fetch('https://bizbazar-8hy2y0d41-ao-oj05s-projects.vercel.app/api/configuracion/categorias', { headers });
    const cats = await catsRes.json();
    const blusa = cats.data.find(c => c.nombre.toLowerCase().includes('blusa'));

    const lotesRes = await fetch('https://bizbazar-8hy2y0d41-ao-oj05s-projects.vercel.app/api/lotes', { headers });
    const lotes = await lotesRes.json();
    const lote = lotes.data[0];

    const body = {
        codigo: 'TEST-' + Date.now(),
        nombre: 'Test Producto Omit Sub ID',
        descripcion: 'desc',
        categoria: 'ropa',
        subcategoria: blusa.nombre, // String name?
        // subcategoria_id is OMITTED
        lote_id: lote.id,
        tipo_venta: 'directa',
        costo_base: 15,
        imagenes: []
    };
    
    const res = await fetch('https://bizbazar-8hy2y0d41-ao-oj05s-projects.vercel.app/api/productos', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    console.log('Status omitted subcategoria_id, used subcategoria str:', res.status);
    console.log('Text:', await res.text());
}
run();
