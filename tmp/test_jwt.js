// Test JWT decode
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJlNTFkN2FjLTY3YzEtNGExMC1hNmIxLWJkNDM3MzFiMDQwNSIsImVtYWlsIjoibHVjaTI1QGdtYWlsLmNvbSIsIm5vbWJyZSI6Ikx1Y2lhIExvcGV6IiwiaWF0IjoxNzc0OTIxMjkwLCJleHAiOjE3NzUwMDc2OTB9.mg4ZVGTZHf0truP_1QWBy8Nxa8AUo6NtNmCvhcmInWQ';

// Attempt 1: base64url
function decode1(t) {
    const b64 = t.split('.')[1];
    return Buffer.from(b64, 'base64url').toString('utf8');
}

// Attempt 2: replace chars + base64
function decode2(t) {
    const b64 = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '=='.slice(0, (4 - b64.length % 4) % 4);
    return Buffer.from(padded, 'base64').toString('utf8');
}

try {
    const r1 = JSON.parse(decode1(token));
    console.log('Method 1 success:', r1);
} catch (e) {
    console.error('Method 1 FAILED:', e.message);
}

try {
    const r2 = JSON.parse(decode2(token));
    console.log('Method 2 success:', r2);
} catch (e) {
    console.error('Method 2 FAILED:', e.message);
}
