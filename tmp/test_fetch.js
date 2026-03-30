const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhkYWM2ODZhLWNkODQtNGQ0NS04OTUxLTNiYmEyYTA5ZjE4NiIsImVtYWlsIjoibHVjaTI1QGdtYWlsLmNvbSIsIm5vbWJyZSI6Ikx1Y2lhIExvcGV6ICIsImlhdCI6MTc3NDkxMzkwMCwiZXhwIjoxNzc1MDAwMzAwfQ.qBvlTFwVk4jQQUBCJ7Kjfdxt2P1JDPhCc0HyksEp1t8';
const vercelJwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiaXpiYXphci04aHkyeTBkNDEtYW8tb2owNXMtcHJvamVjdHMudmVyY2VsLmFwcCIsInVzZXJJZCI6Imxyb2FsdEg0TmdyT0J1SlAwY1Jubm1OUyIsInVzZXJuYW1lIjoiYW8tb2owNSIsIm93bmVySWQiOiJ0ZWFtX0thNHhIdHdUSEFCTUpiQWlOdzdLTkduSCIsInN1YiI6InNzby1wcm90ZWN0aW9uIiwiaWF0IjoxNzc0OTEzNjY2fQ.-_kmj_pOksFCmOuKWF1QaB7z_AaqPFDr0vHWOibAqfk';

fetch('https://bizbazar-8hy2y0d41-ao-oj05s-projects.vercel.app/api/configuracion/categorias', {
    headers: {
        'Cookie': `_vercel_jwt=${vercelJwt}; auth_token=${token}`
    }
}).then(r => r.json()).then(t => console.log('Result:', JSON.stringify(t, null, 2))).catch(e => console.error(e));
