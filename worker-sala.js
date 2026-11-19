// KaraTube · Sala (fila compartilhada). Cloudflare Worker + Durable Object. Separado do proxy da TV (worker.js).
// Cada sala é um Durable Object cujo nome é o código da sala. Quem não sabe o código não entra.
// Papéis: dono (chave própria), moderador (chave derivada do token do GitHub) e convidado (só o código).

const MAX_Q = 300, MAX_IX = 20000, GUEST_LIMIT = 3, SEARCH_MAX = 40, PAGE = 150;
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
    this.q = []; this.reqs = []; this.meta = null; this.ix = []; this.ixTs = 0; this.ixBuf = null; this.rate = new Map(); this.sorted = {}; this._g = null; this.sg = {};
    try { if (typeof WebSocketRequestResponsePair !== 'undefined') state.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong')); } catch (e) { }
  }
  async load() {
    if (this.loaded) return;
    const st = this.state.storage;
    this.meta = (await st.get('meta')) || null; this.q = (await st.get('queue')) || []; this.reqs = (await st.get('reqs')) || [];
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
    await this.state.storage.deleteAll(); this.meta = null; this.q = []; this.reqs = []; this.ix = []; this.sorted = {}; this._g = null; this.sg = {}; this.ixTs = 0; this.loaded = true;
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
      case 'list': return this.list(ws, a, m);
      case 'req': if (a.role !== 'guest') return this.deny(ws); return this.req(ws, a, m);
      case 'rdone': if (!CAN.mod(a.role)) return this.deny(ws); return this.rdone(m);
      case 'rdis': return this.rdis(ws, a, m);
      case 'cfg': {
        if (!CAN.owner(a.role)) return this.deny(ws);
        if ('search' in m) this.meta.search = !!m.search;
        if ('browse' in m) this.meta.browse = !!m.browse;
        if ('limit' in m) this.meta.limit = this.lim(m.limit);
        if ('theme' in m) this.meta.theme = ['light', 'dark'].includes(m.theme) ? m.theme : '';
        await this.state.storage.put('meta', this.meta); return this.bcast(this.cfgMsg());
      }
      case 'close': if (!CAN.owner(a.role)) return this.deny(ws); return this.destroy('owner');
      case 'tv': return this.tv(ws, a, m);
      case 'tvres': if (a.role !== 'owner') return; return this.bcast({ t: 'tvres', id: cut(m.id, 24), ok: !!m.ok, err: cut(m.err, 120) }, x => x.dev === cut(m.to, 64));
    }
  }
  lim(v) { v = parseInt(v, 10); return v >= 0 && v <= 9 ? v : GUEST_LIMIT; }       // 0 = sem limite de pedidos por pessoa
  cfgMsg() { const m = this.meta || {}; return { t: 'cfg', search: m.search !== false, browse: !!m.browse, limit: m.limit == null ? GUEST_LIMIT : m.limit, own: m.ownerName || '', theme: m.theme || '' }; }
  deny(ws) { this.send(ws, { t: 'err', code: 'perm' }); }

  async hello(ws, m) {
    const dev = cut(m.dev, 64), name = cut(m.name, 30).trim() || 'Convidado';
    if (!dev) return this.send(ws, { t: 'err', code: 'hello' });
    if (m.create) {
      if (this.meta) return this.send(ws, { t: 'err', code: 'exists' });
      if (!m.owner || String(m.owner).length < 16) return this.send(ws, { t: 'err', code: 'hello' });
      this.meta = { created: Date.now(), last: Date.now(), owner: await sha('o|' + m.owner), mod: m.mod ? await sha('m|' + m.mod) : '', search: m.search !== false, browse: !!m.browse, limit: this.lim(m.limit == null ? GUEST_LIMIT : m.limit) };
      this.q = (Array.isArray(m.queue) ? m.queue : []).slice(0, MAX_Q).map(e => this.entry(e, { role: 'owner', dev, name })).filter(Boolean);
      await this.state.storage.put({ meta: this.meta, queue: this.q }); this.schedule();
    }
    if (!this.meta) return this.send(ws, { t: 'err', code: 'nosala' });
    let role = 'guest';
    if (m.owner && await sha('o|' + m.owner) === this.meta.owner) role = 'owner';
    else if (m.mod && this.meta.mod && await sha('m|' + m.mod) === this.meta.mod) role = 'mod';
    if (role === 'owner' && this.meta.ownerName !== name) { this.meta.ownerName = name; await this.state.storage.put('meta', this.meta); }
    ws.serializeAttachment({ role, dev, name });
    this.send(ws, Object.assign({ t: 'ready', role, queue: this.q, ixTs: this.ixTs, ixN: this.ix.length, created: !!m.create }, this.cfgMsg(), { t: 'ready' }));
    this.send(ws, this.reqView({ role, dev, name }));
    this.bcast(this.presence());
  }
  /* ---- pedidos de cadastro de vídeo (só convidados pedem; dono e moderadores atendem) ----
     Um pedido por vídeo do YouTube: quem pede o mesmo vídeo entra na lista "by" do mesmo pedido.
     r = {r: id, vid, t: título, ch: canal, ts, st: 'p' (aguardando) | 'd' (cadastrado), code, by: [{dev, name, note, ts}]} */
  reqView(a) {
    const inCat = r => !!(r.code && this.lookup(r.code));
    if (a.role === 'guest') {
      const mine = this.reqs.filter(r => r.by.some(b => b.dev === a.dev)).map(r => { const b = r.by.find(x => x.dev === a.dev); return { r: r.r, vid: r.vid, t: r.t, ch: r.ch, st: r.st, code: r.code || '', cat: inCat(r), ts: b.ts, n: r.by.length - 1 }; });
      return { t: 'reqs', reqs: mine };
    }
    return { t: 'reqs', reqs: this.reqs.map(r => ({ r: r.r, vid: r.vid, t: r.t, ch: r.ch, st: r.st, code: r.code || '', cat: inCat(r), ts: r.ts, by: r.by.map(b => ({ name: b.name, note: b.note, ts: b.ts })) })) };
  }
  async persistR() { await this.state.storage.put('reqs', this.reqs); this.all().forEach(ws => { const a = this.att(ws); if (a.role) this.send(ws, this.reqView(a)); }); }
  async req(ws, a, m) {
    const id = cut(m.id, 24); const vid = cut(m.vid, 11);
    const rep = (ok, why, extra) => this.send(ws, Object.assign({ t: 'reqok', id, ok, why }, extra || {}));
    if (!/^[A-Za-z0-9_-]{11}$/.test(vid)) return rep(false, 'invalido');
    const inx = this.ix.find(x => x.v === vid);
    if (inx) return rep(false, 'nocatalogo', { code: inx.c });
    let r = this.reqs.find(x => x.vid === vid);
    if (r && r.by.some(b => b.dev === a.dev)) return rep(false, 'repetido');
    if (this.reqs.filter(x => x.st === 'p' && x.by.some(b => b.dev === a.dev)).length >= 5) return rep(false, 'limite');
    if (!r && this.reqs.length >= 200) return rep(false, 'cheio');
    const b = { dev: a.dev, name: a.name || 'Convidado', note: cut(m.note, 80).trim(), ts: Date.now() };
    if (r) { r.by.push(b); if (!r.t && m.title) { r.t = cut(m.title, 120); r.ch = cut(m.ch, 60); } }
    else this.reqs.push({ r: Math.random().toString(36).slice(2, 10), vid, t: cut(m.title, 120), ch: cut(m.ch, 60), ts: Date.now(), st: 'p', code: '', by: [b] });
    rep(true, 'enviado'); await this.persistR();
  }
  async rdone(m) {       // dono/moderador viu o vídeo no catálogo: marca como cadastrado
    const r = this.reqs.find(x => x.r === m.r); if (!r || (r.st === 'd' && r.code === cut(m.code, 10))) return;
    r.st = 'd'; r.code = okMusic(String(m.code)) ? String(m.code) : ''; await this.persistR();
  }
  async rdis(ws, a, m) {  // dispensar: dono/moderador apaga para todos; convidado só o dele, e só depois de cadastrado
    const i = this.reqs.findIndex(x => x.r === m.r); if (i < 0) return;
    const r = this.reqs[i];
    if (a.role === 'guest') { if (r.st !== 'd') return this.deny(ws); r.by = r.by.filter(b => b.dev !== a.dev); if (!r.by.length) this.reqs.splice(i, 1); }
    else this.reqs.splice(i, 1);
    await this.persistR();
  }
  // o índice do catálogo mudou: pedidos cujo vídeo agora está no catálogo viram "cadastrado"
  async reqSweep() {
    let ch = false;
    this.reqs.forEach(r => { if (r.st === 'p') { const x = this.ix.find(y => y.v === r.vid); if (x) { r.st = 'd'; r.code = x.c; ch = true; } } });
    if (ch) await this.persistR(); else this.all().forEach(ws => { const a = this.att(ws); if (a.role === 'guest') this.send(ws, this.reqView(a)); });
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
    const gl = this.meta.limit == null ? GUEST_LIMIT : this.meta.limit;
    if (a.role === 'guest' && gl > 0 && this.q.filter(e => e.dev === a.dev).length >= gl) return rep(false, 'limite');
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
    const items = (Array.isArray(m.items) ? m.items : []).map(x => ({ c: cut(x.c, 10), t: cut(x.t, 120), s: cut(x.s, 80), v: cut(x.v, 12), k: cut(x.k, 8), o: cut(x.o, 30), n: cut(x.n, 60), l: cut(x.l, 20), y: cut(x.y, 12), og: cut(x.og, 60), p: cut(x.p, 30), a: /^https?:/.test(String(x.a || '')) ? cut(x.a, 220) : '', u: Math.max(0, x.u | 0), g: (Array.isArray(x.g) ? x.g : []).slice(0, 8).map(z => cut(z, 24)), x: cut(x.x, 400) })).filter(x => okMusic(x.c));
    this.ixBuf.parts[i] = items; this.ixBuf.size += items.length;
    if (this.ixBuf.size > MAX_IX) { this.ixBuf = null; return this.send(ws, { t: 'err', code: 'big' }); }
    if (this.ixBuf.parts.filter(Boolean).length < n) return;
    const st = this.state.storage; const old = (await st.get('ixmeta')) || { n: 0 };
    for (let k = 0; k < n; k++) await st.put('ix:' + k, this.ixBuf.parts[k]);
    for (let k = n; k < old.n; k++) await st.delete('ix:' + k);
    await st.put('ixmeta', { n, ts: this.ixBuf.ts });
    this.ix = [].concat(...this.ixBuf.parts); this.sorted = {}; this._g = null; this.sg = {}; this.ixTs = this.ixBuf.ts; this.ixBuf = null;
    this.bcast({ t: 'indexed', n: this.ix.length, ts: this.ixTs });
    await this.reqSweep();
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
  // músicas agrupadas (uma por código de 6 dígitos), com as versões dentro
  groups() {
    if (this._g) return this._g;
    const m = new Map();
    for (const x of this.ix) {
      const id = x.c.slice(0, 6); let s = m.get(id);
      if (!s) { s = { id, t: x.t, s: x.s, l: x.l || '', y: x.y || '', og: x.og || '', a: '', u: 0, vs: [], hay: [], g: new Set() }; m.set(id, s); }
      s.vs.push(x); s.u += x.u || 0; s.hay.push(x.x || ''); if (!s.a && x.a) s.a = x.a; (x.g || []).forEach(z => s.g.add(z));
    }
    this._g = [...m.values()].map(s => { s.g = [...s.g]; s.vs.sort((p, q) => (p.c < q.c ? -1 : 1)); s.dec = /^\d{4}/.test(s.y) ? s.y.slice(0, 3) + '0' : ''; return s; });
    return this._g;
  }
  // navegação paginada: q = termos, f = filtros, sort = t|s|u, off = posição (em músicas)
  list(ws, a, m) {
    const id = cut(m.id, 24); const off = Math.max(0, m.off | 0);
    const reply = o => this.send(ws, Object.assign({ t: 'list', id, off }, o));
    const toks = (Array.isArray(m.q) ? m.q : []).slice(0, 6).map(x => tok(x)).filter(Boolean);
    const joined = toks.join('');
    if (a.role === 'guest') {
      const canB = !!this.meta.browse, canS = this.meta.search !== false;
      if (!canB && !canS) return reply({ items: [], total: 0, dis: true });
      if (!canB && !toks.length) return reply({ items: [], total: 0, dis: !canS });
    }
    const r = this.rate.get(a.dev) || { until: 0, miss: 0, s: [] }; this.rate.set(a.dev, r);
    const t = Date.now(); r.s = r.s.filter(x => t - x < 60000);
    if (r.s.length >= 90) return reply({ items: [], total: 0, wait: 10 });
    r.s.push(t);
    if (toks.length && joined.length < 2 && !/[^\x00-\x7f]/.test(joined)) return reply({ items: [], total: 0 });
    const f = m.f && typeof m.f === 'object' ? m.f : {};
    const arr = (v, n) => (Array.isArray(v) ? v : []).slice(0, 12).map(z => cut(z, n));
    const fl = arr(f.l, 20), fd = arr(f.d, 4), fog = cut(f.og, 60), fo = cut(f.o, 30), fp = cut(f.p, 30), fg = arr(f.g, 24);
    const sort = toks.length ? 'r' : (['t', 's', 'u'].includes(m.sort) ? m.sort : 't');
    let src = this.groups();
    if (sort !== 'r') {
      this.sg = this.sg || {};
      if (!this.sg[sort]) {
        const kt = x => tok(x.t), ks = x => tok(x.s) + ' ' + tok(x.t);
        this.sg[sort] = src.slice().sort(sort === 'u' ? (p, q) => (q.u || 0) - (p.u || 0) || (kt(p) < kt(q) ? -1 : 1) : (p, q) => { const a1 = (sort === 't' ? kt : ks)(p), b1 = (sort === 't' ? kt : ks)(q); return a1 < b1 ? -1 : a1 > b1 ? 1 : 0; });
      }
      src = this.sg[sort];
    }
    const vfilter = fo || fp || fg.length;
    const hit = [];
    for (const s of src) {
      if (fl.length && !fl.includes(s.l)) continue;
      if (fd.length && !fd.includes(s.dec)) continue;
      if (fog && s.og !== fog) continue;
      let vs = s.vs;
      if (vfilter) { vs = vs.filter(v => (!fo || v.o === fo) && (!fp || v.p === fp) && fg.every(z => (v.g || []).includes(z))); if (!vs.length) continue; }
      let sc = 0;
      if (toks.length) {
        let best = -1;
        for (const hay of s.hay) {
          let ok = true, p0 = 0;
          for (const tk of toks) { const p = hay.indexOf(tk); if (p < 0) { ok = false; break; } p0 += p === 0 ? 3 : (hay[p - 1] === ' ' ? 2 : 1); }
          if (ok && p0 > best) best = p0;
        }
        if (best < 0) continue; sc = best;
      }
      hit.push([sc, s, vs]);
    }
    if (sort === 'r') hit.sort((p, q) => q[0] - p[0] || (p[1].id < q[1].id ? -1 : 1));
    const page = hit.slice(off, off + (toks.length ? SEARCH_MAX : PAGE)).map(([, s, vs]) => ({
      id: s.id, t: s.t, s: s.s, l: s.l, y: s.y, og: s.og, a: s.a, v: s.vs[0] ? s.vs[0].v : '', g: s.g.slice(0, 10),
      vs: vs.map(v => ({ c: v.c, v: v.v, k: v.k, o: v.o, n: v.n, p: v.p || '' }))
    }));
    const out = { items: page, total: hit.length };
    if (off === 0 && this.meta.browse && a.role === 'guest') out.fac = this.facets();
    reply(out);
  }
  facets() {
    const G = this.groups();
    const c = (get, n) => { const m = new Map(); G.forEach(s => new Set(get(s)).forEach(v => { if (v) m.set(v, (m.get(v) || 0) + 1); })); return [...m].sort((p, q) => q[1] - p[1]).slice(0, n); };
    const vv = k => s => s.vs.map(v => v[k]);
    return { l: c(s => [s.l], 30), d: c(s => [s.dec], 20).sort((p, q) => (q[0] < p[0] ? -1 : 1)), og: c(s => [s.og], 8), o: c(vv('o'), 12), p: c(vv('p'), 12), g: c(s => s.g, 30) };
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
