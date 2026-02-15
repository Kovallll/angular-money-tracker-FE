const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 80;
const DIST_DIR = path.join(__dirname, 'dist');

const server = http.createServer((req, res) => {
  // Log requests for debugging
  console.log(`${req.method} ${req.url}`);

  // Remove query string and hash
  let filePath = req.url.split('?')[0].split('#')[0];

  // If it's just /, serve index.html
  if (filePath === '/') {
    filePath = '/index.html';
  }

  // Try to serve the file
  const fullPath = path.join(DIST_DIR, filePath);

  // Check if file exists
  fs.stat(fullPath, (err, stats) => {
    if (err || stats.isDirectory()) {
      // If file doesn't exist or is a directory, serve index.html (SPA routing)
      const indexPath = path.join(DIST_DIR, 'index.html');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(indexPath, 'utf-8'));
    } else {
      // Serve the file with appropriate content type
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

      // Add caching headers for static assets
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
