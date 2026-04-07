const http = require('http');
const fs = require('fs');
const path = require('path');
const { loadEnv, requireApiUrl } = require('./scripts/load-env');

loadEnv();

const PORT = process.env.PORT || 80;

// Angular может собирать в dist/ или dist/finance/browser/ — ищем папку с index.html
function findDistDir() {
  const candidates = [
    path.join(__dirname, 'dist'),
    path.join(__dirname, 'dist', 'finance', 'browser'),
    path.join(__dirname, 'dist', 'finance'),
  ];
  for (const dir of candidates) {
    const indexPath = path.join(dir, 'index.html');
    if (fs.existsSync(indexPath)) return dir;
  }
  return path.join(__dirname, 'dist');
}

const DIST_DIR = findDistDir();
console.log('Serving static files from:', DIST_DIR);

function writeRuntimeConfig() {
  const apiUrl = requireApiUrl();
  const configPath = path.join(DIST_DIR, 'config.js');
  const configContent = `window.API_URL = ${JSON.stringify(apiUrl)};\n`;
  fs.writeFileSync(configPath, configContent, 'utf-8');
  console.log('Runtime config generated:', configPath, 'API_URL:', apiUrl);
}

writeRuntimeConfig();

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  let filePath = req.url.split('?')[0].split('#')[0];

  if (filePath === '/') {
    filePath = '/index.html';
  }

  const fullPath = path.join(DIST_DIR, filePath);

  fs.stat(fullPath, (err, stats) => {
    if (err || stats.isDirectory()) {
      const indexPath = path.join(DIST_DIR, 'index.html');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(indexPath, 'utf-8'));
    } else {
      const ext = path.extname(fullPath).toLowerCase();
      const contentTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
      };

      const contentType = contentTypes[ext] || 'application/octet-stream';

      if (ext !== '.html') {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(fs.readFileSync(fullPath));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

