const fs = require('fs');
const path = require('path');

function walk(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            walk(fullPath);
        } else if (file.isFile() && fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Target ONLY the fetch calls with ${API_URL}/
            // We use a regex that looks specifically for the template literal part
            const regex = /\${API_URL}\/(?!api\/)/g;
            if (regex.test(content)) {
                console.log(`Fixing: ${fullPath}`);
                content = content.replace(regex, '${API_URL}/api/');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}

walk('src/app/api');
console.log('Done.');
