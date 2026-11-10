// Servidor estático mínimo (sin dependencias) para el frontend.
// Sirve /public y genera /config.js con la URL de la API.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT) || 8080;
const API_URL = process.env.API_URL || 'http://localhost:3000';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  if (pathname === '/config.js') {
    res.writeHead(200, { 'Content-Type': TYPES['.js'] });
    return res.end(`window.APP_CONFIG = ${JSON.stringify({ API_URL })};\n`);
  }

  const relative = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
  const filePath = path.resolve(PUBLIC_DIR, relative);

  // Evita salir de /public con rutas tipo ../../
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  try {
    const content = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(filePath)] || 'application/octet-stream' });
    return res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('No encontrado');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend en http://localhost:${PORT} (API: ${API_URL})`);
});
