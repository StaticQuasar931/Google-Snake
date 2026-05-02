const http = require('http');
const fs = require('fs');
const path = require('path');

const host = '127.0.0.1';
const port = 8787;
const root = __dirname;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.bin': 'application/octet-stream'
};

http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const target = urlPath === '/' ? '/index.html' : urlPath;
  const safePath = path.normalize(target).replace(/^([\\/])+/, '');
  const filePath = path.join(root, safePath);

  if (!filePath.startsWith(root)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      const code = error.code === 'ENOENT' ? 404 : 500;
      res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(code === 404 ? 'Not found' : 'Server error');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': types[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
}).listen(port, host, () => {
  console.log(`Google Snake local server running at http://${host}:${port}`);
});
