// KaraTube · Sala (fila compartilhada). Cloudflare Worker + Durable Object. Separado do proxy da TV (worker.js).
// Cada sala é um Durable Object cujo nome é o código da sala. Quem não sabe o código não entra.
// Papéis: dono (chave própria), moderador (chave derivada do token do GitHub) e convidado (só o código).

const MAX_Q = 300, MAX_IX = 20000, GUEST_LIMIT = 3, SEARCH_MAX = 15;
const DAY = 86400000, IDLE_DAYS = 3;
const enc = new TextEncoder();
async function sha(s) { const h = await crypto.subtle.digest('SHA-256', enc.encode(s)); return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join(''); }
const cut = (s, n) => String(s == null ? '' : s).slice(0, n);
const okCode = c => /^[A-Z2-9]{8,16}$/.test(c);
const okMusic = c => /^\d{6}-\d{2}$/.test(c);
const tok = s => String(s || '').normalize('NFKD').toLowerCase().replace(/[^\p{L}\p{N}\p{M}]+/gu, ' ').trim();

// Funções puras (testáveis): papel que pode cada coisa.
export const CAN = {
  add: () => true,
  rm: (role, own, idx) => role !== 'guest' || (own && idx > 0),
  mod: role => role === 'owner' || role === 'mod',
  owner: role => role === 'owner'
};

export class Sala {
  constructor(state, env) {
    this.state = state; this.env = env; this.loaded = false;
    this.q = []; this.meta = null; this.ix = []; this.ixTs = 0; this.ixBuf = null; this.rate = new Map();
    try { if (typeof WebSocketRequestResponsePair !== 'undefined') state.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong')); } catch (e) { }
  }
  async load() {
    if (this.loaded) return;
    const st = this.state.storage;
    this.meta = (await st.get('meta')) || null; this.q = (await st.get('queue')) || [];
    const im = (await st.get('ixmeta')) || { n: 0, ts: 0 }; this.ixTs = im.ts || 0; this.ix = [];
    for (let i = 0; i < im.n; i++) { const c = await st.get('ix:' + i); if (c) this.ix.push(...c); }
    this.loaded = true;
  }
  // entrada do Worker: abre o WebSocket
  async fetch(req) {
    const pair = new WebSocketPair(); const [client, server] = Object.values(pair);
    this.state.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }
  send(ws, o) { try { ws.send(JSON.stringify(o)); } catch (e) { } }
  all() { return this.state.getWebSockets(); }
  att(ws) { try { return ws.deserializeAttachment() || {}; } catch (e) { return {}; } }
  bcast(o, pred) { this.all().forEach(ws => { const a = this.att(ws); if (a.role && (!pred || pred(a))) this.send(ws, o); }); }
  presence() {
    const a = this.all().map(w => this.att(w)).filter(x => x.role);
    return { t: 'who', owner: a.some(x => x.role === 'owner'), mods: a.filter(x => x.role === 'mod').length, guests: a.filter(x => x.role === 'guest').length };
  }
  async persistQ() { this.meta.last = Date.now(); await this.state.storage.put({ queue: this.q, meta: this.meta }); this.bcast({ t: 'queue', queue: this.q }); this.schedule(); }
  async schedule() { try { await this.state.storage.setAlarm(Date.now() + IDLE_DAYS * DAY); } catch (e) { } }
  async alarm() { await this.load(); if (this.meta && Date.now() - (this.meta.last || 0) >= IDLE_DAYS * DAY) await this.destroy('idle'); else this.schedule(); }
  async destroy(why) {
    this.bcast({ t: 'closed', why });
    this.all().forEach(ws => { try { ws.close(1000, 'closed'); } catch (e) { } });
    await this.state.storage.deleteAll(); this.meta = null; this.q = []; this.ix = []; this.ixTs = 0; this.loaded = true;
  }
  async webSocketClose(ws) { this.bcast(this.presence()); }
  async webSocketError(ws) { this.bcast(this.presence()); }

  async webSocketMessage(ws, raw) {
    if (typeof raw !== 'string' || raw.length > 900000) return;
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (!m || typeof m.t !== 'string') return;
    await this.load();
    const a = this.att(ws);
    if (m.t === 'hello') return this.hello(ws, m);
    if (!a.role) return this.send(ws, { t: 'err', code: 'hello' });
    this.meta.last = Date.now();
    switch (m.t) {
      case 'add': return this.add(ws, a, m);
      case 'rm': return this.rm(ws, a, m);
      case 'up': if (!CAN.mod(a.role)) return this.deny(ws); return this.up(m);
      case 'done': if (!CAN.mod(a.role)) return this.deny(ws); return this.done(m);
      case 'setq': if (!CAN.mod(a.role)) return this.deny(ws); return this.setq(m);
      case 'index': if (!CAN.mod(a.role)) return this.deny(ws); return this.index(ws, m);
      case 'search': return this.search(ws, a, m);
      case 'cfg': if (!CAN.owner(a.role)) return this.deny(ws); this.meta.search = !!m.search; await this.state.storage.put('meta', this.meta); return this.bcast({ t: 'cfg', search: this.meta.search });
      case 'close': if (!CAN.owner(a.role)) return this.deny(ws); return this.destroy('owner');
      case 'tv': return this.tv(ws, a, m);
      case 'tvres': if (a.role !== 'owner') return; return this.bcast({ t: 'tvres', id: cut(m.id, 24), ok: !!m.ok, err: cut(m.err, 120) }, x => x.dev === cut(m.to, 64));
    }
  }
  deny(ws) { this.send(ws, { t: 'err', code: 'perm' }); }

  async hello(ws, m) {
    const dev = cut(m.dev, 64), name = cut(m.name, 30).trim() || 'Convidado';
    if (!dev) return this.send(ws, { t: 'err', code: 'hello' });
    if (m.create) {
      if (this.meta) return this.send(ws, { t: 'err', code: 'exists' });
      if (!m.owner || String(m.owner).length < 16) return this.send(ws, { t: 'err', code: 'hello' });
      this.meta = { created: Date.now(), last: Date.now(), owner: await sha('o|' + m.owner), mod: m.mod ? await sha('m|' + m.mod) : '', search: m.search !== false };
      this.q = (Array.isArray(m.queue) ? m.queue : []).slice(0, MAX_Q).map(e => this.entry(e, { role: 'owner', dev, name })).filter(Boolean);
      await this.state.storage.put({ meta: this.meta, queue: this.q }); this.schedule();
    }
    if (!this.meta) return this.send(ws, { t: 'err', code: 'nosala' });
    let role = 'guest';
    if (m.owner && await sha('o|' + m.owner) === this.meta.owner) role = 'owner';
    else if (m.mod && this.meta.mod && await sha('m|' + m.mod) === this.meta.mod) role = 'mod';
    ws.serializeAttachment({ role, dev, name });
    this.send(ws, { t: 'ready', role, queue: this.q, search: this.meta.search, ixTs: this.ixTs, ixN: this.ix.length, created: !!m.create });
    this.bcast(this.presence());
  }
  entry(e, who, front) {
    if (!e || !okMusic(String(e.code || e.c))) return null;
    const code = String(e.code || e.c);
    return { q: cut(e.q, 16) || Math.random().toString(36).slice(2, 10), code, t: cut(e.t, 120), s: cut(e.s, 80), v: cut(e.v, 12), k: cut(e.k, 8), o: cut(e.o, 30), n: cut(e.n, 60), by: cut(e.by || who.name, 30), dev: cut(e.dev || who.dev, 64), role: e.role || who.role, ts: Date.now() };
  }
  lookup(code) { return this.ix.find(x => x.c === code); }
  async add(ws, a, m) {
    const id = cut(m.id, 24); const code = cut(m.code, 10).trim();
    const rep = (ok, why, extra) => this.send(ws, Object.assign({ t: 'added', id, ok, why, code }, extra || {}));
    const lim = this.limit(a);
    if (lim) return rep(false, 'espere', { wait: lim });
    if (!okMusic(code)) { this.miss(a); return rep(false, 'naoencontrado'); }
    let src = null;
    if (CAN.mod(a.role) && m.snap) src = m.snap;                // moderador manda os dados (o índice pode estar velho)
    else { const x = this.lookup(code); if (x) src = { code, t: x.t, s: x.s, v: x.v, k: x.k, o: x.o, n: x.n }; }
    if (!src) { this.miss(a); return rep(false, 'naoencontrado'); }
    if (this.q.some(e => e.code === code)) return rep(false, 'repetida');
    if (a.role === 'guest' && this.q.filter(e => e.dev === a.dev).length >= GUEST_LIMIT) return rep(false, 'limite');
    if (this.q.length >= MAX_Q) return rep(false, 'cheia');
    const rr = this.rate.get(a.dev); if (rr) rr.miss = 0;
    const e = this.entry(Object.assign({}, src, { code }), a);
    if (m.front && CAN.mod(a.role) && this.q.length) this.q.splice(1, 0, e); else this.q.push(e);
    rep(true, 'enviado', { title: e.t });
    await this.persistQ();
  }
  limit(a) {   // erros seguidos de código → espera; busca → no máximo 40 por minuto
    const r = this.rate.get(a.dev) || { until: 0, miss: 0, s: [] }; this.rate.set(a.dev, r);
    if (a.role !== 'guest') return 0;
    const t = Date.now(); return r.until > t ? Math.ceil((r.until - t) / 1000) : 0;
  }
  miss(a) {
    if (a.role !== 'guest') return;
    const r = this.rate.get(a.dev); if (!r) return;
    r.miss = (r.miss || 0) + 1; if (r.miss >= 5) { r.until = Date.now() + 30000; r.miss = 0; }
  }
  async rm(ws, a, m) {
    const i = this.q.findIndex(e => e.q === m.q); if (i < 0) return;
    const own = this.q[i].dev === a.dev;
    if (!CAN.rm(a.role, own, i)) return this.deny(ws);
    this.q.splice(i, 1); await this.persistQ();
  }
  async up(m) { const i = this.q.findIndex(e => e.q === m.q); if (i > 1) { const [e] = this.q.splice(i, 1); this.q.splice(1, 0, e); await this.persistQ(); } }
  async done(m) {
    const i = this.q.findIndex(e => e.q === m.q); if (i < 0) return;
    const [e] = this.q.splice(i, 1);
    this.bcast({ t: 'done', q: e.q, code: e.code, sung: !!m.sung });
    await this.persistQ();
  }
  async setq(m) {
    const who = { role: 'mod', dev: '', name: '' };
    this.q = (Array.isArray(m.queue) ? m.queue : []).slice(0, MAX_Q).map(e => this.entry(e, who)).filter(Boolean);
    const seen = new Set(); this.q = this.q.filter(e => !seen.has(e.code) && seen.add(e.code));
    await this.persistQ();
  }
  async index(ws, m) {
    const n = m.n | 0, i = m.i | 0; if (n < 1 || n > 80 || i < 0 || i >= n) return;
    if (i === 0 || !this.ixBuf || this.ixBuf.id !== m.id) this.ixBuf = { id: cut(m.id, 24), n, parts: [], ts: +m.ts || Date.now(), size: 0 };
    const items = (Array.isArray(m.items) ? m.items : []).map(x => ({ c: cut(x.c, 10), t: cut(x.t, 120), s: cut(x.s, 80), v: cut(x.v, 12), k: cut(x.k, 8), o: cut(x.o, 30), n: cut(x.n, 60), x: cut(x.x, 400) })).filter(x => okMusic(x.c));
    this.ixBuf.parts[i] = items; this.ixBuf.size += items.length;
    if (this.ixBuf.size > MAX_IX) { this.ixBuf = null; return this.send(ws, { t: 'err', code: 'big' }); }
    if (this.ixBuf.parts.filter(Boolean).length < n) return;
    const st = this.state.storage; const old = (await st.get('ixmeta')) || { n: 0 };
    for (let k = 0; k < n; k++) await st.put('ix:' + k, this.ixBuf.parts[k]);
    for (let k = n; k < old.n; k++) await st.delete('ix:' + k);
    await st.put('ixmeta', { n, ts: this.ixBuf.ts });
    this.ix = [].concat(...this.ixBuf.parts); this.ixTs = this.ixBuf.ts; this.ixBuf = null;
    this.bcast({ t: 'indexed', n: this.ix.length, ts: this.ixTs }, x => x.role !== 'guest');
  }
  search(ws, a, m) {
    const id = cut(m.id, 24); const out = items => this.send(ws, { t: 'results', id, items });
    if (!this.meta.search && a.role === 'guest') return this.send(ws, { t: 'results', id, items: [], off: true });
    const r = this.rate.get(a.dev) || { until: 0, miss: 0, s: [] }; this.rate.set(a.dev, r);
    const t = Date.now(); r.s = r.s.filter(x => t - x < 60000);
    if (r.s.length >= 40) return this.send(ws, { t: 'results', id, items: [], wait: 10 });
    r.s.push(t);
    const toks = (Array.isArray(m.q) ? m.q : []).slice(0, 6).map(x => tok(x)).filter(Boolean);
    const joined = toks.join('');
    if (!toks.length || (joined.length < 2 && !/[^\x00-\x7f]/.test(joined))) return out([]);
    const inq = new Set(this.q.map(e => e.code));
    const hit = [];
    for (const x of this.ix) {
      const hay = x.x || ''; let sc = 0, ok = true;
      for (const tk of toks) { const p = hay.indexOf(tk); if (p < 0) { ok = false; break; } sc += p === 0 ? 3 : (hay[p - 1] === ' ' ? 2 : 1); }
      if (ok) hit.push([sc, x]);
      if (hit.length > 400) break;
    }
    hit.sort((p, q) => q[0] - p[0] || (p[1].c < q[1].c ? -1 : 1));
    out(hit.slice(0, SEARCH_MAX).map(([, x]) => ({ c: x.c, t: x.t, s: x.s, v: x.v, k: x.k, o: x.o, n: x.n, inq: inq.has(x.c) })));
  }
  tv(ws, a, m) {
    if (!CAN.mod(a.role)) return this.deny(ws);
    const id = cut(m.id, 24);
    const owners = this.all().filter(w => this.att(w).role === 'owner');
    if (!owners.length) return this.send(ws, { t: 'tvres', id, ok: false, err: 'owner-offline' });
    if (a.role === 'owner') return;
    owners.forEach(w => this.send(w, { t: 'tv', id, code: cut(m.code, 10), to: a.dev }));
  }
}

// Entrada: /sala/<CODIGO> (WebSocket). Tudo o mais responde 404. Segurança extra: limite simples por IP.
const hits = new Map();
export default {
  async fetch(req, env) {
    const cors = { 'Access-Control-Allow-Origin': '*' };
    const u = new URL(req.url);
    const m = /^\/sala\/([A-Za-z0-9]{8,16})$/.exec(u.pathname);
    if (req.method === 'OPTIONS') return new Response(null, { headers: Object.assign({ 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Allow-Headers': '*' }, cors) });
    if (u.pathname === '/' || u.pathname === '/ping') return new Response('karatube-sala ok', { headers: cors });
    if (!m) return new Response('not found', { status: 404, headers: cors });
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('expected websocket', { status: 426, headers: cors });
    const code = m[1].toUpperCase(); if (!okCode(code)) return new Response('bad code', { status: 400, headers: cors });
    const ip = req.headers.get('CF-Connecting-IP') || '?'; const t = Date.now();
    const arr = (hits.get(ip) || []).filter(x => t - x < 60000); arr.push(t); hits.set(ip, arr);
    if (hits.size > 5000) hits.clear();
    if (arr.length > 30) return new Response('slow down', { status: 429, headers: cors });
    return env.SALA.get(env.SALA.idFromName(code)).fetch(req);
  }
};
