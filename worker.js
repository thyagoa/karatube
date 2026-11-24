// Proxy mínimo para o KaraTube falar com o YouTube Lounge (Cloudflare Worker, plano grátis).
export default {
  async fetch(req) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const u = new URL(req.url);
    if (!u.pathname.startsWith('/api/lounge/')) return new Response('not found', { status: 404, headers: cors });
    if (req.method === 'GET') { // escuta ao vivo (eventos da TV): repassa o fluxo sem esperar terminar
      const g = await fetch('https://www.youtube.com' + u.pathname + u.search, { method: 'GET', headers: { 'Origin': 'https://www.youtube.com', 'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Safari/537.36' } });
      const gh = new Headers(cors); gh.set('Content-Type', g.headers.get('Content-Type') || 'text/plain');
      return new Response(g.body, { status: g.status, headers: gh });
    }
    const r = await fetch('https://www.youtube.com' + u.pathname + u.search, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Origin': 'https://www.youtube.com', 'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Safari/537.36' },
      body: await req.text()
    });
    const h = new Headers(cors); h.set('Content-Type', r.headers.get('Content-Type') || 'text/plain');
    return new Response(await r.text(), { status: r.status, headers: h });
  }
};
