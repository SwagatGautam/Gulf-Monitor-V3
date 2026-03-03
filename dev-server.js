// Local dev server — runs the Vercel-style API function on port 3001
// Usage: node dev-server.js (runs automatically via `npm run dev`)

import { createServer } from 'http';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
try {
  const envFile = readFileSync(resolve(__dirname, '.env.local'), 'utf-8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
  console.log('[dev-server] Loaded .env.local');
} catch {
  console.warn('[dev-server] No .env.local found — set ANTHROPIC_API_KEY in environment');
}

// Import the serverless handler
const { default: handler } = await import('./api/news.js');

const server = createServer(async (req, res) => {
  // Simple adapter: convert Node req/res to match Vercel's serverless API
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString();

  // Attach parsed body (Vercel does this automatically)
  try { req.body = JSON.parse(body); } catch { req.body = body; }

  // Add Vercel-compatible res.status().json() helpers
  let statusCode = 200;
  const origSetHeader = res.setHeader.bind(res);
  res.setHeader = (...args) => { origSetHeader(...args); return res; };
  res.status = (code) => { statusCode = code; return res; };
  res.json = (data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };
  const origEnd = res.end.bind(res);
  res.end = (...args) => {
    if (!res.headersSent) res.writeHead(statusCode);
    origEnd(...args);
  };

  try {
    await handler(req, res);
  } catch (err) {
    console.error('[dev-server] Handler error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
});

server.listen(3001, () => {
  console.log('[dev-server] API running on http://localhost:3001');
  console.log('[dev-server] Vite will proxy /api/* requests here');
});
