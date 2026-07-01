const fs = require('fs');
const path = require('path');

const BASE = '/farmacoclin-mobile';
const indexPath = path.join(__dirname, 'dist', 'index.html');

let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(/href="\//g, `href="${BASE}/`);
html = html.replace(/src="\//g, `src="${BASE}/`);
fs.writeFileSync(indexPath, html);
console.log('Patched dist/index.html for GitHub Pages base path:', BASE);
