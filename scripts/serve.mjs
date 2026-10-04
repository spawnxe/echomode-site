// Minimal foreground static server for dist/ — used by Playwright's webServer.
// (`astro preview` daemonises when it has no TTY, which Playwright reads as an early exit.)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const port = Number(process.env.PORT ?? 4321);
const base = (process.env.SITE_BASE ?? '/echomode-site').replace(/\/$/, '');
const root = new URL('../dist/', import.meta.url).pathname;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain', '.ico': 'image/x-icon', '.xml': 'application/xml' };

createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (base && p.startsWith(base)) p = p.slice(base.length) || '/';
  else if (base) { res.writeHead(404); return res.end('outside base'); }
  let file = normalize(join(root, p));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  try {
    let s = await stat(file).catch(() => null);
    if (s?.isDirectory()) { file = join(file, 'index.html'); s = await stat(file); }
    if (!s) { file = file + '.html'; s = await stat(file); }
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'content-length': body.length, 'cache-control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }); res.end('not found');
  }
}).listen(port, () => console.log(`serving dist${base}/ at http://localhost:${port}${base}/`));
