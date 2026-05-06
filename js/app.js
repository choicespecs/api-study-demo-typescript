/* ═══════════════════════════════════════════════════════════
   REST API Study Guide — Static Reference (GitHub Pages)
   Interactive reference ported from java-api-study-demo.
   No backend required — simulations run in the browser.
   ═══════════════════════════════════════════════════════════ */

// ── MOCK DATA ─────────────────────────────────────────────────
const MOCK_PRODUCTS = [
  { id: 1,  name: 'Wireless Headphones',      category: 'Electronics', price: 79.99,  stock: 143 },
  { id: 2,  name: 'Python Cookbook',           category: 'Books',       price: 39.99,  stock: 67  },
  { id: 3,  name: 'Running Shoes',             category: 'Sports',      price: 89.99,  stock: 34  },
  { id: 4,  name: 'Coffee Maker',              category: 'Kitchen',     price: 49.99,  stock: 89  },
  { id: 5,  name: 'Bluetooth Speaker',         category: 'Electronics', price: 59.99,  stock: 211 },
  { id: 6,  name: 'Design Patterns',           category: 'Books',       price: 44.99,  stock: 45  },
  { id: 7,  name: 'Yoga Mat',                  category: 'Sports',      price: 29.99,  stock: 178 },
  { id: 8,  name: 'Air Fryer',                 category: 'Kitchen',     price: 89.99,  stock: 56  },
  { id: 9,  name: 'USB-C Hub',                 category: 'Electronics', price: 34.99,  stock: 324 },
  { id: 10, name: 'Clean Code',                category: 'Books',       price: 34.99,  stock: 93  },
  { id: 11, name: 'Resistance Bands',          category: 'Sports',      price: 19.99,  stock: 267 },
  { id: 12, name: 'Instant Pot',               category: 'Kitchen',     price: 99.99,  stock: 42  },
  { id: 13, name: 'Mechanical Keyboard',       category: 'Electronics', price: 129.99, stock: 87  },
  { id: 14, name: 'The Pragmatic Programmer',  category: 'Books',       price: 49.99,  stock: 38  },
  { id: 15, name: 'Tennis Racket',             category: 'Sports',      price: 59.99,  stock: 23  },
  { id: 16, name: 'Blender',                   category: 'Kitchen',     price: 69.99,  stock: 61  },
  { id: 17, name: 'Smart Watch',               category: 'Electronics', price: 199.99, stock: 156 },
  { id: 18, name: 'Refactoring',               category: 'Books',       price: 44.99,  stock: 54  },
  { id: 19, name: 'Foam Roller',               category: 'Sports',      price: 24.99,  stock: 143 },
  { id: 20, name: 'Cast Iron Pan',             category: 'Kitchen',     price: 44.99,  stock: 78  },
  { id: 21, name: 'Webcam 4K',                 category: 'Electronics', price: 89.99,  stock: 204 },
  { id: 22, name: 'System Design Interview',   category: 'Books',       price: 39.99,  stock: 127 },
  { id: 23, name: 'Dumbbells Set',             category: 'Sports',      price: 79.99,  stock: 31  },
  { id: 24, name: 'Electric Kettle',           category: 'Kitchen',     price: 39.99,  stock: 92  },
];

// ── DEMO JWT (valid base64url, fake signature) ─────────────────
function _makeB64url(obj) {
  return btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
const DEMO_JWT = [
  _makeB64url({ alg: 'HS256', typ: 'JWT' }),
  _makeB64url({ sub: 'user', username: 'user', roles: ['ROLE_USER'], iat: 1704067200, exp: 1704068100 }),
  'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
].join('.');

// ── COPY CLIPS & SIM REGISTRY ─────────────────────────────────
let _clipIdx = 0;
const _clips = {};
let _simIdx = 0;
const _sims = {};

// ── STATE ────────────────────────────────────────────────────
const State = {
  page: 'home',
  rateBuckets:    { standard: 20, strict: 5, tiered: 10 },
  rateBucketMax:  { standard: 20, strict: 5, tiered: 10 },
  cbFailures: 0, cbSuccesses: 0, cbState: 'CLOSED', cbLog: [],
  paginationPage: 0, paginationSize: 6,
  paginationCategory: '', paginationSearch: '',
  woProducts: [
    { id: 1, name: 'iPhone 15', price: 999.99, category: 'Electronics', stock: 50 },
    { id: 2, name: 'The Pragmatic Programmer', price: 49.99, category: 'Books', stock: 30 },
    { id: 3, name: 'Running Shoes', price: 89.99, category: 'Sports', stock: 120 },
  ],
  woNextId: 4,
};

// ── UTILITIES ─────────────────────────────────────────────────
function syntaxHighlight(obj) {
  const json = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      m => {
        let c = 'json-number';
        if (/^"/.test(m)) c = /:$/.test(m) ? 'json-key' : 'json-string';
        else if (/true|false/.test(m)) c = 'json-bool';
        else if (/null/.test(m)) c = 'json-null';
        return `<span class="${c}">${m}</span>`;
      });
}

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function statusBadge(status) {
  if (!status) return '';
  const cls = status >= 500 ? 'status-5xx'
    : status === 429 ? 'status-429'
    : status >= 400 ? 'status-4xx'
    : 'status-2xx';
  return `<span class="status-badge ${cls}">HTTP ${status}</span>`;
}

// ── DISPLAY HELPERS ───────────────────────────────────────────
function responseViewer(res, label = 'Response') {
  const body = res
    ? syntaxHighlight(res.body)
    : '<span class="response-placeholder">Example response will appear here</span>';
  return `
    <div class="response-viewer">
      <div class="response-header">
        <span class="response-label">${label}</span>
        ${res ? statusBadge(res.status) : ''}
      </div>
      <div class="response-body">${body}</div>
    </div>`;
}

function requestViewer(method, url, headers = {}, body = null) {
  if (!method) {
    return `<div class="response-viewer">
      <div class="response-header"><span class="response-label">Request</span></div>
      <div class="response-body"><span class="response-placeholder">Example request will appear here</span></div>
    </div>`;
  }
  const lines = [];
  lines.push(`<span class="method-${method.toLowerCase()}">${method}</span> <span class="json-string">${escHtml(url)}</span>`);
  for (const [k, v] of Object.entries(headers)) {
    const disp = (k === 'Authorization' && String(v).length > 52) ? String(v).slice(0, 42) + '…' : v;
    lines.push(`<span class="req-key">${escHtml(k)}:</span> <span class="req-val">${escHtml(String(disp))}</span>`);
  }
  if (body !== null) {
    lines.push('');
    try {
      const p = typeof body === 'string' ? JSON.parse(body) : body;
      lines.push(syntaxHighlight(p));
    } catch { lines.push(escHtml(String(body))); }
  }
  return `<div class="response-viewer">
    <div class="response-header">
      <span class="response-label">Request</span>
      <span class="method-badge method-${method.toLowerCase()}">${method}</span>
    </div>
    <div class="response-body">${lines.join('\n')}</div>
  </div>`;
}

function curlBlock(cmd) {
  const id = 'clip-' + (++_clipIdx);
  _clips[id] = cmd;
  return `
    <div class="response-viewer">
      <div class="response-header">
        <span class="response-label">Shell</span>
        <button class="btn btn-secondary btn-sm" onclick="_clip('${id}',this)">Copy</button>
      </div>
      <div class="response-body" style="white-space:pre">${escHtml(cmd)}</div>
    </div>`;
}

function exampleExchange(method, url, reqHeaders, reqBody, respStatus, respBody) {
  return `
    <div class="http-exchange">
      <div>${requestViewer(method, url, reqHeaders, reqBody)}</div>
      <div>${responseViewer({ status: respStatus, body: respBody })}</div>
    </div>`;
}

window._clip = function(id, btn) {
  navigator.clipboard.writeText(_clips[id]).then(() => {
    const t = btn.textContent;
    btn.textContent = '✓ Copied';
    btn.classList.add('btn-success');
    setTimeout(() => { btn.textContent = t; btn.classList.remove('btn-success'); }, 1500);
  }).catch(() => {});
};

// ── INTERACTIVE SIMULATION BLOCK ──────────────────────────────
function simBlock(curlCmd, method, url, reqHeaders, reqBody, status, respBody, opts = {}) {
  const id = 'sim-' + (++_simIdx);
  const curlId = 'scurl-' + id;
  _sims[id] = { method, url, reqHeaders: reqHeaders || {}, reqBody, status, respBody, delay: opts.delay || 450 };
  _clips[curlId] = curlCmd;
  return `
    <div class="sim-block">
      <div class="response-viewer">
        <div class="response-header">
          <span class="response-label">Shell</span>
          <div style="display:flex;gap:8px">
            <button class="btn btn-primary btn-sm" onclick="_runSim('${id}',this)">▶ Run</button>
            <button class="btn btn-secondary btn-sm" onclick="_clip('${curlId}',this)">Copy</button>
          </div>
        </div>
        <div class="response-body" style="white-space:pre-wrap;word-break:break-all">${escHtml(curlCmd)}</div>
      </div>
      <div id="${id}"></div>
    </div>`;
}

window._runSim = async function(id, btn) {
  const sim = _sims[id];
  if (!sim) return;
  const el = document.getElementById(id);
  if (!el) return;
  if (btn) btn.disabled = true;
  el.innerHTML = `
    <div class="http-exchange">
      <div>${requestViewer(sim.method, sim.url, sim.reqHeaders, sim.reqBody)}</div>
      <div class="response-viewer">
        <div class="response-header"><span class="response-label">Response</span></div>
        <div class="response-body sim-sending">⏳ Sending request…</div>
      </div>
    </div>`;
  await sleep(sim.delay);
  el.innerHTML = `<div class="http-exchange">
    <div>${requestViewer(sim.method, sim.url, sim.reqHeaders, sim.reqBody)}</div>
    <div>${responseViewer({ status: sim.status, body: sim.respBody })}</div>
  </div>`;
  if (btn) btn.disabled = false;
};

// ── JWT UTILITIES ─────────────────────────────────────────────
function b64decode(str) {
  try { return JSON.parse(atob(str.replace(/-/g, '+').replace(/_/g, '/'))); } catch { return null; }
}

function parseJwt(token) {
  const parts = token.trim().split('.');
  if (parts.length !== 3) return null;
  return { header: b64decode(parts[0]), payload: b64decode(parts[1]), raw: parts };
}

function jwtVisualizer(token) {
  if (!token) return `<div class="text-muted text-sm">Paste a JWT above to decode it</div>`;
  const parsed = parseJwt(token);
  if (!parsed) return `<div class="alert alert-error text-sm">Invalid JWT — must have 3 base64url parts separated by dots</div>`;
  const [h, p, s] = parsed.raw;
  return `
    <div class="jwt-parts">
      <span class="jwt-part jwt-header" title="Header">${h.substring(0, 20)}…</span>
      <span class="jwt-dot">.</span>
      <span class="jwt-part jwt-payload" title="Payload">${p.substring(0, 20)}…</span>
      <span class="jwt-dot">.</span>
      <span class="jwt-part jwt-sig" title="Signature">${s.substring(0, 14)}…</span>
    </div>
    <div class="jwt-decoded">
      <div>
        <div class="jwt-section-label jwt-header-label">🔴 Header</div>
        <div class="response-viewer" style="font-size:11px">
          <div class="response-body">${syntaxHighlight(parsed.header)}</div>
        </div>
      </div>
      <div>
        <div class="jwt-section-label jwt-payload-label">🟢 Payload (readable!)</div>
        <div class="response-viewer" style="font-size:11px">
          <div class="response-body">${syntaxHighlight(parsed.payload)}</div>
        </div>
      </div>
      <div>
        <div class="jwt-section-label jwt-sig-label">🔵 Signature</div>
        <div class="response-viewer" style="font-size:11px">
          <div class="response-body"><span class="json-string">"${s.substring(0, 24)}…"</span>
<span class="response-placeholder" style="display:block;margin-top:4px">HMAC-SHA256 of header+payload.
Cannot be decoded — only verified.</span></div>
        </div>
      </div>
    </div>`;
}

// ── TOKEN METER ───────────────────────────────────────────────
function tokenMeter(current, max, label) {
  const pct = max > 0 ? (current / max) * 100 : 0;
  const cls = pct > 60 ? 'high' : pct > 20 ? 'medium' : 'low';
  return `
    <div class="token-meter">
      <div class="token-count"><span>${label}</span><span>${current} / ${max} tokens</span></div>
      <div class="token-track"><div class="token-fill token-fill--${cls}" style="width:${pct}%"></div></div>
    </div>`;
}

// ── ROUTER ────────────────────────────────────────────────────
function navigate(page) {
  State.page = page;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  render();
}
window.navigate = navigate;

window.addEventListener('hashchange', () => {
  const page = location.hash.slice(1) || 'home';
  navigate(page);
});

// ── RENDER ────────────────────────────────────────────────────
const pages = {
  home, 'auth-jwt': authJwt, 'auth-basic': authBasic, 'auth-apikey': authApiKey,
  oauth2: oauthPage, rbac: rbacPage, 'rate-limit': rateLimitPage,
  'circuit-breaker': circuitBreakerPage, 'hanging-apis': hangingApisPage,
  'third-party': thirdPartyPage, 'partner-api': partnerApiPage,
  pagination: paginationPage, versioning: versioningPage,
  errors: errorsPage, 'common-problems': commonProblemsPage,
  'write-ops': writeOpsPage,
};

function render() {
  const fn = pages[State.page] || home;
  document.getElementById('content').innerHTML = `<div>${fn()}</div>`;
  if (State.page === 'pagination') handlers.paginationLoad();
  if (State.page === 'auth-jwt') {
    // Pre-populate decoder with the demo JWT
    const ta = document.getElementById('jwt-input');
    if (ta && !ta.value) { ta.value = DEMO_JWT; handlers.jwtDecode(); }
  }
}

// ── EVENT DELEGATION ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('main').addEventListener('click', async e => {
    const btn = e.target.closest('[data-action]');
    if (!btn || btn.disabled) return;
    const action = btn.dataset.action;
    if (handlers[action]) await handlers[action](btn);
  });

  document.getElementById('main').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.matches('[data-enter]')) {
      const action = e.target.dataset.enter;
      if (handlers[action]) handlers[action](e.target);
    }
  });

  document.getElementById('sidebar').addEventListener('click', e => {
    const item = e.target.closest('[data-page]');
    if (item) {
      e.preventDefault();
      navigate(item.dataset.page);
      location.hash = item.dataset.page;
    }
  });

  const page = location.hash.slice(1) || 'home';
  State.page = page;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  render();
});

// ── HANDLERS ─────────────────────────────────────────────────
const handlers = {

  jwtDecode() {
    const token = val('jwt-input');
    setHtml('jwt-visualizer', jwtVisualizer(token));
  },

  jwtUseDemoToken() {
    const ta = document.getElementById('jwt-input');
    if (ta) { ta.value = DEMO_JWT; handlers.jwtDecode(); }
  },

  async rateSend(btn) {
    const key = btn.dataset.key || 'standard';
    const max = State.rateBucketMax[key];
    if (State.rateBuckets[key] <= 0) {
      setHtml(`rate-${key}-response`,
        responseViewer({ status: 429, body: { error: 'Too Many Requests', retryAfter: 60, message: 'Rate limit exceeded. Bucket is empty.' } }));
      return;
    }
    State.rateBuckets[key]--;
    setHtml(`rate-${key}-meter`, tokenMeter(State.rateBuckets[key], max, 'Token bucket'));
    const remaining = State.rateBuckets[key];
    setHtml(`rate-${key}-response`, responseViewer({
      status: 200,
      body: { message: 'OK', remaining, limit: max, 'X-Rate-Limit-Remaining': remaining },
    }));
  },

  async rateRapidFire(btn) {
    const key = btn.dataset.key || 'standard';
    const max = State.rateBucketMax[key];
    btn.disabled = true;
    for (let i = 0; i < 10; i++) {
      if (State.rateBuckets[key] > 0) State.rateBuckets[key]--;
      const remaining = State.rateBuckets[key];
      const is429 = remaining === 0;
      setHtml(`rate-${key}-meter`, tokenMeter(remaining, max, `Token bucket (request ${i + 1}/10)`));
      setHtml(`rate-${key}-response`, responseViewer({
        status: is429 ? 429 : 200,
        body: is429
          ? { error: 'Too Many Requests', retryAfter: 60 }
          : { message: 'OK', remaining, limit: max },
      }));
      await sleep(140);
    }
    btn.disabled = false;
  },

  rateReset() {
    State.rateBuckets = { ...State.rateBucketMax };
    ['standard', 'strict', 'tiered'].forEach(key => {
      setHtml(`rate-${key}-meter`, tokenMeter(State.rateBuckets[key], State.rateBucketMax[key], 'Token bucket'));
      setHtml(`rate-${key}-response`, responseViewer(null));
    });
  },

  async cbSend(btn) {
    const fail = btn.dataset.fail === 'true';
    const isFallback = State.cbState === 'OPEN';

    if (!isFallback) {
      if (fail) State.cbFailures++;
      else State.cbSuccesses++;
    }

    const logEntry = { time: new Date().toLocaleTimeString(), fail, isFallback };
    State.cbLog.unshift(logEntry);
    if (State.cbLog.length > 8) State.cbLog.pop();

    const total = State.cbFailures + State.cbSuccesses;
    if (total >= 5 && State.cbFailures / total >= 0.5) State.cbState = 'OPEN';
    else if (State.cbState === 'OPEN' && !fail) State.cbState = 'HALF_OPEN';
    else if (State.cbState === 'HALF_OPEN' && !fail) State.cbState = 'CLOSED';

    const status = isFallback ? 503 : (fail ? 500 : 200);
    const body = isFallback
      ? { result: 'FALLBACK — circuit is OPEN, call bypassed', state: 'OPEN' }
      : fail
        ? { error: 'Internal Server Error', detail: 'Simulated failure' }
        : { result: 'success', message: 'Downstream call succeeded' };

    refreshCb();
    setHtml('cb-response', responseViewer({ status, body }));
  },

  cbReset() {
    State.cbFailures = 0; State.cbSuccesses = 0;
    State.cbState = 'CLOSED'; State.cbLog = [];
    refreshCb();
    setHtml('cb-response', responseViewer(null));
  },

  paginationLoad() {
    let products = MOCK_PRODUCTS;
    if (State.paginationCategory) {
      products = products.filter(p => p.category === State.paginationCategory);
    }
    if (State.paginationSearch) {
      const q = State.paginationSearch.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q));
    }
    const total = products.length;
    const totalPages = Math.ceil(total / State.paginationSize);
    if (State.paginationPage >= totalPages) State.paginationPage = Math.max(0, totalPages - 1);
    const start = State.paginationPage * State.paginationSize;
    const pageItems = products.slice(start, start + State.paginationSize);

    setHtml('product-grid', renderProductGrid(pageItems));
    setHtml('pagination-meta',
      `<div class="pagination-info">Page ${State.paginationPage + 1} of ${totalPages || 1} (${total} total)</div>`);
    renderPaginationButtons(State.paginationPage, totalPages);
  },

  paginationFilter() {
    State.paginationCategory = val('filter-category') || '';
    State.paginationSearch   = val('filter-search') || '';
    State.paginationPage = 0;
    handlers.paginationLoad();
  },

  paginationPrev() {
    if (State.paginationPage > 0) { State.paginationPage--; handlers.paginationLoad(); }
  },
  paginationNext() {
    State.paginationPage++;
    handlers.paginationLoad();
  },

  // ── Write Operations handlers ─────────────────────────────────────────────

  woPost(btn) {
    const name     = val('wo-name');
    const priceRaw = val('wo-price');
    const category = val('wo-category');
    const stockRaw = val('wo-stock');
    const body     = { name, price: priceRaw ? parseFloat(priceRaw) : undefined, category, stock: stockRaw ? parseInt(stockRaw) : 0 };

    setHtml('wo-request', requestViewer('POST', '/api/products', { 'Content-Type': 'application/json' }, body));

    if (!name || !priceRaw || !category) {
      setHtml('wo-response', responseViewer({ status: 422, body: { type: '/errors/validation', title: 'Validation Failed', status: 422, fieldErrors: { name: name ? null : 'must not be blank', price: priceRaw ? null : 'must not be null' } } }, 'POST /api/products → 422'));
      return;
    }
    const exists = State.woProducts.find(p => p.name === name);
    if (exists) {
      setHtml('wo-response', responseViewer({ status: 409, body: { type: '/errors/conflict', title: 'Conflict', status: 409, detail: `Product with name '${name}' already exists. GET /api/products/${exists.id} or PUT to update it.` } }, 'POST /api/products → 409'));
      return;
    }
    const product = { id: State.woNextId++, name, price: parseFloat(priceRaw), category, stock: parseInt(stockRaw) || 0 };
    State.woProducts.push(product);
    setHtml('wo-response', responseViewer({ status: 201, headers: { 'Location': `/api/products/${product.id}` }, body: product }, 'POST /api/products → 201 Created'));
    const idEl = document.getElementById('wo-id');
    if (idEl) idEl.value = product.id;
  },

  woPostInvalid() {
    const body = {};
    setHtml('wo-request', requestViewer('POST', '/api/products', { 'Content-Type': 'application/json' }, body));
    setHtml('wo-response', responseViewer({ status: 422, body: { type: '/errors/validation', title: 'Validation Failed', status: 422, fieldErrors: { name: 'must not be blank', price: 'must not be null', category: 'must not be blank' } } }, 'POST /api/products → 422 Validation Failed'));
  },

  woPostDuplicate() {
    const body = { name: 'iPhone 15', price: 999.99, category: 'Electronics', stock: 50 };
    setHtml('wo-request', requestViewer('POST', '/api/products', { 'Content-Type': 'application/json' }, body));
    setHtml('wo-response', responseViewer({ status: 409, body: { type: '/errors/conflict', title: 'Conflict', status: 409, detail: "Product with name 'iPhone 15' already exists. GET /api/products/1 or PUT to update it." } }, 'POST /api/products → 409 Conflict'));
  },

  woPut() {
    const id       = val('wo-id');
    const name     = val('wo-name');
    const priceRaw = val('wo-price');
    const category = val('wo-category');
    const stock    = parseInt(val('wo-stock')) || 0;
    const body     = { name, price: parseFloat(priceRaw) || null, category, stock };
    setHtml('wo-request', requestViewer('PUT', `/api/products/${id}`, { 'Content-Type': 'application/json' }, body));
    if (!id) { setHtml('wo-response', responseViewer({ status: 400, body: { detail: 'Enter a product ID first (use POST to create one).' } })); return; }
    const idx = State.woProducts.findIndex(p => p.id === parseInt(id));
    if (idx === -1) {
      setHtml('wo-response', responseViewer({ status: 404, body: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: `Product ${id} not found.` } }, `PUT /api/products/${id} → 404`));
      return;
    }
    const conflict = State.woProducts.find((p, i) => p.name === name && i !== idx);
    if (conflict) {
      setHtml('wo-response', responseViewer({ status: 409, body: { detail: `Name '${name}' is already taken by product ${conflict.id}.` } }, `PUT /api/products/${id} → 409`));
      return;
    }
    State.woProducts[idx] = { ...State.woProducts[idx], name, price: parseFloat(priceRaw) || State.woProducts[idx].price, category, stock };
    setHtml('wo-response', responseViewer({ status: 200, body: State.woProducts[idx] }, `PUT /api/products/${id} → 200 OK`));
  },

  woPutMissing() {
    const body = { name: 'Ghost Product', price: 1.00, category: 'Test', stock: 0 };
    setHtml('wo-request', requestViewer('PUT', '/api/products/99999', { 'Content-Type': 'application/json' }, body));
    setHtml('wo-response', responseViewer({ status: 404, body: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Product 99999 not found.' } }, 'PUT /api/products/99999 → 404 Not Found'));
  },

  woPatch() {
    const id    = val('wo-id');
    const name  = val('wo-name');
    const price = val('wo-price');
    const patch = {};
    if (name)  patch.name  = name;
    if (price) patch.price = parseFloat(price);
    setHtml('wo-request', requestViewer('PATCH', `/api/products/${id}`, { 'Content-Type': 'application/json' }, patch));
    if (!id) { setHtml('wo-response', responseViewer({ status: 400, body: { detail: 'Enter a product ID first.' } })); return; }
    const idx = State.woProducts.findIndex(p => p.id === parseInt(id));
    if (idx === -1) {
      setHtml('wo-response', responseViewer({ status: 404, body: { detail: `Product ${id} not found.` } }, `PATCH /api/products/${id} → 404`));
      return;
    }
    if (name)  State.woProducts[idx].name  = name;
    if (price) State.woProducts[idx].price = parseFloat(price);
    setHtml('wo-response', responseViewer({ status: 200, body: State.woProducts[idx] }, `PATCH /api/products/${id} — only provided fields changed`));
  },

  woDelete() {
    const id  = val('wo-id');
    setHtml('wo-request', requestViewer('DELETE', `/api/products/${id}`, {}));
    if (!id) { setHtml('wo-response', responseViewer({ status: 400, body: { detail: 'Enter a product ID first.' } })); return; }
    const idx = State.woProducts.findIndex(p => p.id === parseInt(id));
    if (idx === -1) {
      setHtml('wo-response', responseViewer({ status: 404, body: { detail: `Product ${id} not found.` } }, `DELETE /api/products/${id} → 404`));
      return;
    }
    State.woProducts.splice(idx, 1);
    setHtml('wo-response', responseViewer({ status: 204, body: null }, `DELETE /api/products/${id} → 204 No Content`));
    const idEl = document.getElementById('wo-id');
    if (idEl) idEl.value = '';
  },

  woDeleteMissing() {
    setHtml('wo-request', requestViewer('DELETE', '/api/products/99999', {}));
    setHtml('wo-response', responseViewer({ status: 404, body: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Product 99999 not found.' } }, 'DELETE /api/products/99999 → 404 Not Found'));
  },

  woUpsertExisting() {
    const body = { name: 'iPhone 15', price: 799.99, category: 'Electronics', stock: 999 };
    setHtml('strategy-request', requestViewer('POST', '/api/products/upsert', { 'Content-Type': 'application/json' }, body));
    const idx = State.woProducts.findIndex(p => p.name === 'iPhone 15');
    if (idx !== -1) {
      State.woProducts[idx] = { ...State.woProducts[idx], ...body };
      setHtml('strategy-response', responseViewer({ status: 200, body: State.woProducts[idx] }, 'POST /upsert → 200 (existed, replaced)'));
    } else {
      const p = { id: State.woNextId++, ...body };
      State.woProducts.push(p);
      setHtml('strategy-response', responseViewer({ status: 201, body: p }, 'POST /upsert → 201 Created'));
    }
  },

  woUpsertNew() {
    const ts   = Date.now();
    const body = { name: `New Gadget ${ts}`, price: 49.99, category: 'Electronics', stock: 10 };
    setHtml('strategy-request', requestViewer('POST', '/api/products/upsert', { 'Content-Type': 'application/json' }, body));
    const p = { id: State.woNextId++, ...body };
    State.woProducts.push(p);
    setHtml('strategy-response', responseViewer({ status: 201, body: p }, 'POST /upsert → 201 Created (did not exist)'));
  },

  woMergeExisting() {
    const body = { name: 'iPhone 15', price: 1099.99, stock: 25 };
    setHtml('strategy-request', requestViewer('POST', '/api/products/merge', { 'Content-Type': 'application/json' }, body));
    const idx = State.woProducts.findIndex(p => p.name === 'iPhone 15');
    if (idx !== -1) {
      if (body.price !== undefined) State.woProducts[idx].price = body.price;
      if (body.stock !== undefined) State.woProducts[idx].stock = body.stock;
      setHtml('strategy-response', responseViewer({ status: 200, body: State.woProducts[idx] }, 'POST /merge → 200 (existed, only price+stock changed)'));
    } else {
      setHtml('strategy-response', responseViewer({ status: 404, body: { detail: 'iPhone 15 not found — try resetting by reloading.' } }));
    }
  },

  woMergeNew() {
    const ts   = Date.now();
    const body = { name: `Merged Product ${ts}`, price: 19.99, category: 'Books', stock: 5 };
    setHtml('strategy-request', requestViewer('POST', '/api/products/merge', { 'Content-Type': 'application/json' }, body));
    const p = { id: State.woNextId++, ...body };
    State.woProducts.push(p);
    setHtml('strategy-response', responseViewer({ status: 201, body: p }, 'POST /merge → 201 Created (did not exist)'));
  },

  woMergeMissingRequired() {
    const body = { name: `Incomplete Product ${Date.now()}` };
    setHtml('strategy-request', requestViewer('POST', '/api/products/merge', { 'Content-Type': 'application/json' }, body));
    setHtml('strategy-response', responseViewer({ status: 422, body: { type: '/errors/validation', title: 'Validation Failed', status: 422, fieldErrors: { price: 'required when creating a new product', category: 'required when creating a new product' } } }, 'POST /merge → 422 (new product, price required)'));
  },
};

// ── PAGE: HOME ────────────────────────────────────────────────
function home() {
  return `
    <div class="page-title">REST API Study Guide</div>
    <div class="page-sub">A comprehensive reference for learning REST API design patterns, with interactive examples.</div>

    <div class="concept-grid">
      ${card('🎫', 'JWT Authentication', 'Stateless tokens — sign, decode, and use Bearer auth.', 'auth-jwt')}
      ${card('🔐', 'Basic Auth', 'HTTP Basic — credentials on every request.', 'auth-basic')}
      ${card('🗝️', 'API Keys', 'Opaque keys — instantly revocable, DB-backed.', 'auth-apikey')}
      ${card('🔑', 'OAuth2', 'Authorization Code & Client Credentials flows.', 'oauth2')}
      ${card('🛡️', 'RBAC', 'Role-based access: ADMIN, USER, VIEWER.', 'rbac')}
      ${card('⚡', 'Rate Limiting', 'Token bucket — simulate exhaustion and 429 responses.', 'rate-limit')}
      ${card('🔄', 'Circuit Breaker', 'Fail-fast pattern — simulate failures and state transitions.', 'circuit-breaker')}
      ${card('⏳', 'Hanging APIs', 'Thread exhaustion, deadlines, and HTTP client timeouts.', 'hanging-apis')}
      ${card('🔌', 'Consuming APIs', 'Webhook security, outbound error handling, credential management.', 'third-party')}
      ${card('🤝', 'Partner Integration', 'B2B API design: partner keys, tenant isolation, tiered limits.', 'partner-api')}
      ${card('📄', 'Pagination', 'Browse mock products with client-side filtering and pages.', 'pagination')}
      ${card('📦', 'Versioning', 'URI, header, query param, and Accept header strategies.', 'versioning')}
      ${card('⚠️', 'Error Handling', 'RFC 7807 Problem Details — consistent, safe errors.', 'errors')}
      ${card('🔧', 'Common Problems', 'CORS, N+1 queries, idempotency, and other pitfalls.', 'common-problems')}
      ${card('✏️', 'Write Operations', 'POST/PUT/PATCH/DELETE design, idempotency, and failure handling.', 'write-ops')}
    </div>

    <div class="card">
      <div class="card-title">🔑 Demo Credentials</div>
      <div class="text-sm text-muted" style="margin-bottom:10px">These are the identities used in the simulations throughout this guide.</div>
      <table class="cred-table">
        <thead><tr><th>Type</th><th>Identifier</th><th>Secret</th><th>Roles / Scopes</th></tr></thead>
        <tbody>
          <tr><td>User</td><td><code>admin</code></td><td><code>password</code></td><td><span class="tag tag-red">ADMIN</span> <span class="tag tag-blue">USER</span></td></tr>
          <tr><td>User</td><td><code>user</code></td><td><code>password</code></td><td><span class="tag tag-blue">USER</span></td></tr>
          <tr><td>User</td><td><code>viewer</code></td><td><code>password</code></td><td><span class="tag tag-green">VIEWER</span></td></tr>
          <tr><td>API Key (Admin)</td><td colspan="2"><code>demo-api-key-admin-12345</code></td><td><span class="tag tag-red">ADMIN</span></td></tr>
          <tr><td>API Key (User)</td><td colspan="2"><code>demo-api-key-user-12345</code></td><td><span class="tag tag-blue">USER</span></td></tr>
          <tr><td>API Key (Expired)</td><td colspan="2"><code>demo-api-key-expired-12345</code></td><td><span class="tag tag-yellow">EXPIRED</span></td></tr>
          <tr><td>OAuth2 Client</td><td><code>machine-client</code></td><td><code>machine-secret</code></td><td><span class="tag tag-purple">client_credentials</span></td></tr>
          <tr><td>OAuth2 Client</td><td><code>web-client</code></td><td><code>web-secret</code></td><td><span class="tag tag-purple">authorization_code</span></td></tr>
          <tr><td>Partner Key</td><td colspan="2"><code>partner-alpha-key-12345</code></td><td><span class="tag tag-red">PREMIUM</span></td></tr>
          <tr><td>Partner Key</td><td colspan="2"><code>partner-beta-key-12345</code></td><td><span class="tag tag-blue">STANDARD</span></td></tr>
          <tr><td>Partner Key</td><td colspan="2"><code>partner-gamma-key-12345</code></td><td><span class="tag tag-green">FREE</span></td></tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card-title">💡 How to Use This Guide</div>
      <div class="text-sm" style="line-height:2">
        Each topic has <strong>interactive simulations</strong> — no server required.<br>
        Click <strong>▶ Run</strong> on any Shell block to simulate the API call and see the request + response.<br>
        Use <strong>Copy</strong> to grab the curl command for reference alongside the
        <a href="https://github.com/christophermlee2/java-api-study-demo" target="_blank">Java backend demo ↗</a>.
      </div>
    </div>`;
}

function card(icon, title, desc, page) {
  return `<div class="concept-card" onclick="navigate('${page}'); location.hash='${page}'">
    <span class="concept-card-icon">${icon}</span>
    <div class="concept-card-title">${title}</div>
    <div class="concept-card-desc">${desc}</div>
  </div>`;
}

// ── PAGE: JWT AUTH ────────────────────────────────────────────
function authJwt() {
  return `
    <div class="page-title">🎫 JWT Authentication</div>
    <div class="page-sub">JSON Web Tokens — stateless, self-contained, signed credentials.</div>

    <div class="concept-box">
      A JWT has 3 Base64URL-encoded parts: <strong>HEADER</strong> <code>.</code> <strong>PAYLOAD</strong> <code>.</code> <strong>SIGNATURE</strong><br>
      The payload is readable by anyone — it is <strong>signed, not encrypted</strong>. Never put secrets in a JWT.<br>
      Access tokens are short-lived (15 min). Refresh tokens are long-lived (24 hr) and stored securely.
    </div>

    <div class="demo-grid">
      <div class="card">
        <div class="card-title">JWT Decoder</div>
        <div class="form-row">
          <label class="form-label">Paste any JWT</label>
          <textarea class="jwt-input-area" id="jwt-input" rows="3" oninput="handlers.jwtDecode()" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."></textarea>
        </div>
        <div class="btn-group mt-8">
          <button class="btn btn-primary btn-sm" data-action="jwtUseDemoToken">Load Demo Token</button>
          <button class="btn btn-secondary btn-sm" data-action="jwtDecode">Decode</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">How JWT Works</div>
        <table class="comparison-table">
          <tr><td>Sign algorithm</td><td>HMAC-SHA256 (symmetric secret)</td></tr>
          <tr><td>Access token TTL</td><td>15 minutes</td></tr>
          <tr><td>Refresh token TTL</td><td>24 hours</td></tr>
          <tr><td>Revocable?</td><td><span class="con">✗ Not without a token blocklist</span></td></tr>
          <tr><td>DB lookup per request?</td><td><span class="pro">✓ No — signature check only</span></td></tr>
          <tr><td>Payload private?</td><td><span class="con">✗ Base64 encoded, not encrypted</span></td></tr>
          <tr><td>Stateless?</td><td><span class="pro">✓ Server holds no session state</span></td></tr>
        </table>
      </div>
    </div>

    <div id="jwt-visualizer" class="card">
      <div class="text-muted text-sm">Paste a JWT above or click "Load Demo Token" to decode it here</div>
    </div>

    <div class="section-heading">Try It — Step 1: Login</div>
    ${simBlock(
      'curl -X POST /api/auth/login \\\n  -H "Content-Type: application/json" \\\n  -d \'{"username":"user","password":"password"}\'',
      'POST', '/api/auth/login',
      { 'Content-Type': 'application/json' },
      { username: 'user', password: '●●●●●●●●' },
      200,
      { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIiwicm9sZXMiOlsiUk9MRV9VU0VSIl0sImlhdCI6MTcwNDA2NzIwMCwiZXhwIjoxNzA0MDY4MTAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c', refreshToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIiwiZXhwIjoxNzA0MTUzNjAwfQ.refresh_sig', tokenType: 'Bearer', expiresIn: 900 }
    )}

    <div class="section-heading">Try It — Step 2: Call a Protected Endpoint</div>
    ${simBlock(
      'curl /api/jwt/protected \\\n  -H "Authorization: Bearer <accessToken>"',
      'GET', '/api/jwt/protected',
      { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…' },
      null,
      200,
      { message: 'You accessed a JWT-protected endpoint', user: 'user', roles: ['ROLE_USER'] }
    )}

    <div class="section-heading">Try It — Step 3: Expired / Invalid Token (401)</div>
    ${simBlock(
      'curl /api/jwt/protected \\\n  -H "Authorization: Bearer eyJhbGci...expiredToken"',
      'GET', '/api/jwt/protected',
      { 'Authorization': 'Bearer eyJhbGci...expiredToken' },
      null,
      401,
      { type: '/errors/unauthorized', title: 'Unauthorized', status: 401, detail: 'JWT token has expired' }
    )}

    <div class="section-heading">Try It — Step 4: Refresh Token</div>
    ${simBlock(
      'curl -X POST /api/auth/refresh \\\n  -H "Content-Type: application/json" \\\n  -d \'{"refreshToken":"<refreshToken>"}\'',
      'POST', '/api/auth/refresh',
      { 'Content-Type': 'application/json' },
      { refreshToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIiwiZXhwIjoxNzA0MTUzNjAwfQ.refresh_sig' },
      200,
      { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIiwicm9sZXMiOlsiUk9MRV9VU0VSIl0sImlhdCI6MTcwNDA2OTAwMCwiZXhwIjoxNzA0MDY5OTAwfQ.newSig', tokenType: 'Bearer', expiresIn: 900 }
    )}`;
}

// ── PAGE: BASIC AUTH ──────────────────────────────────────────
function authBasic() {
  return `
    <div class="page-title">🔐 HTTP Basic Authentication</div>
    <div class="page-sub">Credentials sent as Base64(username:password) on every request.</div>

    <div class="concept-box">
      Header sent: <code>Authorization: Basic base64("username:password")</code><br>
      Simple, but credentials travel on every request — always use HTTPS.<br>
      No expiry — "logout" only works by changing the password.
    </div>

    <div class="demo-grid">
      <div class="card">
        <div class="card-title">Basic Auth vs JWT</div>
        <table class="comparison-table">
          <thead><tr><th></th><th>Basic Auth</th><th>JWT</th></tr></thead>
          <tbody>
            <tr><td>Credentials sent</td><td>Every request</td><td>Only on login</td></tr>
            <tr><td>Expiry</td><td class="con">None</td><td class="pro">15 min access token</td></tr>
            <tr><td>Revoke?</td><td>Change password</td><td>Blocklist or wait</td></tr>
            <tr><td>DB lookup per request</td><td>Yes</td><td>No — signature only</td></tr>
            <tr><td>Suitable for</td><td>Internal tools, simple scripts</td><td>User-facing APIs</td></tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-title">How It Works</div>
        <ol class="text-sm" style="padding-left:18px;line-height:2.2">
          <li>Client encodes <code>username:password</code> in Base64</li>
          <li>Sends <code>Authorization: Basic &lt;base64&gt;</code> header</li>
          <li>Server decodes and verifies against DB on <em>every</em> request</li>
          <li>No token issued — no concept of "session"</li>
        </ol>
        <div class="alert alert-warning text-sm mt-12">
          <strong>Common mistake:</strong> Basic Auth is not encryption. Base64 is trivially reversible.<br>
          Always enforce HTTPS. Anyone sniffing the wire can decode <code>Authorization: Basic dXNlcjpwYXNzd29yZA==</code>.
        </div>
      </div>
    </div>

    <div class="section-heading">Try It — Any Role Endpoint (200 OK)</div>
    ${simBlock(
      'curl /api/basic/protected \\\n  -H "Authorization: Basic $(echo -n user:password | base64)"',
      'GET', '/api/basic/protected',
      { Authorization: 'Basic dXNlcjpwYXNzd29yZA==' },
      null, 200,
      { message: 'Basic auth successful', user: 'user', roles: ['ROLE_USER'] }
    )}

    <div class="section-heading">Try It — Admin Only (403 with user credentials)</div>
    ${simBlock(
      'curl /api/basic/admin \\\n  -H "Authorization: Basic $(echo -n user:password | base64)"',
      'GET', '/api/basic/admin',
      { Authorization: 'Basic dXNlcjpwYXNzd29yZA==' },
      null, 403,
      { type: '/errors/forbidden', title: 'Forbidden', status: 403, detail: 'Access denied — ADMIN role required' }
    )}

    <div class="section-heading">Try It — Wrong Password (401)</div>
    ${simBlock(
      'curl /api/basic/protected \\\n  -H "Authorization: Basic $(echo -n user:wrongpassword | base64)"',
      'GET', '/api/basic/protected',
      { Authorization: 'Basic dXNlcjp3cm9uZ3Bhc3N3b3Jk' },
      null, 401,
      { type: '/errors/unauthorized', title: 'Unauthorized', status: 401, detail: 'Bad credentials' }
    )}`;
}

// ── PAGE: API KEY ─────────────────────────────────────────────
function authApiKey() {
  return `
    <div class="page-title">🗝️ API Key Authentication</div>
    <div class="page-sub">Opaque tokens sent in a header — validated via database lookup.</div>

    <div class="concept-box">
      Header sent: <code>X-API-Key: &lt;key&gt;</code><br>
      Unlike JWT, the server looks up the key in the database on <strong>every request</strong>.<br>
      Key advantage: <strong>instantly revocable</strong> — flip <code>active=false</code> in the DB.
    </div>

    <div class="demo-grid">
      <div class="card">
        <div class="card-title">API Key vs JWT</div>
        <table class="comparison-table">
          <thead><tr><th></th><th>API Key</th><th>JWT</th></tr></thead>
          <tbody>
            <tr><td>DB lookup per request</td><td>Yes</td><td>No</td></tr>
            <tr><td>Revocable?</td><td class="pro">✓ Instantly</td><td class="con">✗ Must wait for expiry</td></tr>
            <tr><td>Expiry</td><td>Configurable</td><td>15 min (access)</td></tr>
            <tr><td>Best for</td><td>M2M, scripts, integrations</td><td>User sessions</td></tr>
            <tr><td>Rotation</td><td>Issue new, overlap, revoke old</td><td>Wait for expiry</td></tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-title">Production Security Notes</div>
        <ul class="text-sm text-muted" style="padding-left:18px;line-height:2">
          <li>Store only a <strong>SHA-256 hash</strong> of the key (like password hashing)</li>
          <li>Show the plain key <strong>once</strong> on creation — never again</li>
          <li>Add <strong>per-key rate limiting</strong> independently</li>
          <li>Support key <strong>rotation</strong> with overlap period</li>
          <li>Add <strong>caching</strong> (Redis) to avoid DB hit per request</li>
          <li>Add key <strong>scopes</strong> to limit what each key can access</li>
        </ul>
      </div>
    </div>

    <div class="section-heading">Try It — User Key (200 OK)</div>
    ${simBlock(
      'curl /api/apikey/data \\\n  -H "X-API-Key: demo-api-key-user-12345"',
      'GET', '/api/apikey/data',
      { 'X-API-Key': 'demo-api-key-user-12345' },
      null, 200,
      { message: 'API key authenticated', keyId: 'key-user-001', owner: 'user@example.com', roles: ['USER'] }
    )}

    <div class="section-heading">Try It — Admin Key (200 OK)</div>
    ${simBlock(
      'curl /api/apikey/admin \\\n  -H "X-API-Key: demo-api-key-admin-12345"',
      'GET', '/api/apikey/admin',
      { 'X-API-Key': 'demo-api-key-admin-12345' },
      null, 200,
      { message: 'Admin access granted', keyId: 'key-admin-001', owner: 'admin@example.com', roles: ['ADMIN', 'USER'] }
    )}

    <div class="section-heading">Try It — Expired Key (401)</div>
    ${simBlock(
      'curl /api/apikey/data \\\n  -H "X-API-Key: demo-api-key-expired-12345"',
      'GET', '/api/apikey/data',
      { 'X-API-Key': 'demo-api-key-expired-12345' },
      null, 401,
      { type: '/errors/unauthorized', title: 'Unauthorized', status: 401, detail: 'API key has expired' }
    )}`;
}

// ── PAGE: OAUTH2 ──────────────────────────────────────────────
function oauthPage() {
  return `
    <div class="page-title">🔑 OAuth2 & OpenID Connect</div>
    <div class="page-sub">Delegated authorization — clients access resources on behalf of users.</div>

    <div class="concept-box">
      <strong>Problem OAuth2 solves:</strong> How does App B access your data on App A <em>without your password?</em><br>
      The user grants permission → the Authorization Server issues a token → App B uses the token.<br>
      The Java demo is both the <strong>Authorization Server</strong> (issues tokens) and the <strong>Resource Server</strong> (validates them).
    </div>

    <div class="demo-grid">
      <div class="card">
        <div class="card-title">OAuth2 Roles</div>
        <table class="comparison-table">
          <thead><tr><th>Role</th><th>What it does</th><th>In the demo</th></tr></thead>
          <tbody>
            <tr><td>Authorization Server</td><td>Issues tokens after user consent</td><td>App at <code>/oauth2/**</code></td></tr>
            <tr><td>Resource Server</td><td>Validates tokens, serves data</td><td>App at <code>/api/oauth/**</code></td></tr>
            <tr><td>Client</td><td>App requesting access</td><td><code>machine-client</code> or <code>web-client</code></td></tr>
            <tr><td>Resource Owner</td><td>User who owns the data</td><td>admin / user / viewer</td></tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-title">Key Endpoints</div>
        <table class="cred-table">
          <tr><td><code>GET /.well-known/openid-configuration</code></td><td>OIDC discovery document</td></tr>
          <tr><td><code>GET /oauth2/jwks</code></td><td>Public keys for token verification</td></tr>
          <tr><td><code>POST /oauth2/token</code></td><td>Exchange credentials/code for tokens</td></tr>
          <tr><td><code>GET /oauth2/authorize</code></td><td>Start authorization code flow</td></tr>
          <tr><td><code>POST /oauth2/revoke</code></td><td>Revoke a token</td></tr>
        </table>
      </div>
    </div>

    <div class="section-heading">Flow 1 — Client Credentials (Machine-to-Machine)</div>
    <div class="alert alert-info text-sm">No user involved — the client authenticates directly with its own credentials.</div>

    <div class="text-sm text-muted mb-8" style="margin-top:8px"><strong>Step 1:</strong> Get a token</div>
    ${simBlock(
      'curl -X POST /oauth2/token \\\n  -H "Authorization: Basic $(echo -n machine-client:machine-secret | base64)" \\\n  -H "Content-Type: application/x-www-form-urlencoded" \\\n  -d "grant_type=client_credentials&scope=read"',
      'POST', '/oauth2/token',
      { Authorization: 'Basic bWFjaGluZS1jbGllbnQ6bWFjaGluZS1zZWNyZXQ=', 'Content-Type': 'application/x-www-form-urlencoded' },
      'grant_type=client_credentials&scope=read',
      200,
      { access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYWNoaW5lLWNsaWVudCIsInNjb3BlIjoicmVhZCIsImV4cCI6MTcwNDA2NzUwMH0.m2m_sig', token_type: 'Bearer', expires_in: 300, scope: 'read' }
    )}

    <div class="text-sm text-muted mb-8" style="margin-top:8px"><strong>Step 2:</strong> Call the resource server with the token</div>
    ${simBlock(
      'curl /api/oauth/data \\\n  -H "Authorization: Bearer <access_token>"',
      'GET', '/api/oauth/data',
      { Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9…' },
      null,
      200,
      { message: 'OAuth2-protected data', client: 'machine-client', scope: 'read', data: [{ id: 1, value: 'secret-item-1' }] }
    )}

    <div class="section-heading">Flow 2 — Authorization Code (User Login)</div>
    <div class="alert alert-info text-sm">User-facing flow — the user approves the application's access in a browser.</div>

    <div class="text-sm text-muted mb-8" style="margin-top:8px"><strong>Step 1:</strong> Redirect user to the authorization endpoint (browser redirect)</div>
    ${simBlock(
      'GET /oauth2/authorize\n  ?client_id=web-client\n  &response_type=code\n  &redirect_uri=/api/oauth/callback\n  &scope=openid+read',
      'GET', '/oauth2/authorize?client_id=web-client&response_type=code&scope=openid+read',
      {},
      null,
      302,
      { location: '/login', note: 'Browser is redirected to login page. After user approves, redirected to: /api/oauth/callback?code=AUTH_CODE' }
    )}

    <div class="text-sm text-muted mb-8" style="margin-top:8px"><strong>Step 2:</strong> Exchange auth code for tokens</div>
    ${simBlock(
      'curl -X POST /oauth2/token \\\n  -H "Authorization: Basic $(echo -n web-client:web-secret | base64)" \\\n  -H "Content-Type: application/x-www-form-urlencoded" \\\n  -d "grant_type=authorization_code&code=AUTH_CODE&redirect_uri=/api/oauth/callback"',
      'POST', '/oauth2/token',
      { Authorization: 'Basic d2ViLWNsaWVudDp3ZWItc2VjcmV0', 'Content-Type': 'application/x-www-form-urlencoded' },
      'grant_type=authorization_code&code=AUTH_CODE&redirect_uri=/api/oauth/callback',
      200,
      { access_token: 'eyJhbGciOiJSUzI1NiJ9.user_claims.sig', id_token: 'eyJhbGciOiJSUzI1NiJ9.oidc_claims.sig', token_type: 'Bearer', expires_in: 300, scope: 'openid read' }
    )}

    <div class="card">
      <div class="card-title">Grant Type Comparison</div>
      <table class="comparison-table">
        <thead><tr><th>Grant Type</th><th>When to use</th><th>User involved?</th></tr></thead>
        <tbody>
          <tr><td>Client Credentials</td><td>Server-to-server (M2M)</td><td class="con">✗ No</td></tr>
          <tr><td>Authorization Code + PKCE</td><td>Web apps, mobile apps</td><td class="pro">✓ Yes</td></tr>
          <tr><td>Refresh Token</td><td>Exchange refresh for new access token</td><td>N/A</td></tr>
          <tr><td>Password (deprecated)</td><td>Don't use — use Auth Code instead</td><td>N/A</td></tr>
        </tbody>
      </table>
    </div>`;
}

// ── PAGE: RBAC ────────────────────────────────────────────────
function rbacPage() {
  return `
    <div class="page-title">🛡️ Role-Based Access Control</div>
    <div class="page-sub">Permissions assigned to roles, roles assigned to users.</div>

    <div class="concept-box">
      RBAC asks: <strong>"What role does this user have?"</strong> then grants access accordingly.<br>
      Role hierarchy in the demo: <strong>ADMIN &gt; USER &gt; VIEWER</strong><br>
      Two enforcement points: URL rules in <code>SecurityConfig</code> + method-level <code>@PreAuthorize</code>.
    </div>

    <div class="demo-grid">
      <div class="card">
        <div class="card-title">Role Matrix</div>
        <table class="comparison-table">
          <thead><tr><th>Endpoint</th><th>VIEWER</th><th>USER</th><th>ADMIN</th></tr></thead>
          <tbody>
            <tr><td><code>/api/rbac/viewer</code></td><td class="pro">✓ 200</td><td class="pro">✓ 200</td><td class="pro">✓ 200</td></tr>
            <tr><td><code>/api/rbac/user</code></td><td class="con">✗ 403</td><td class="pro">✓ 200</td><td class="pro">✓ 200</td></tr>
            <tr><td><code>/api/rbac/admin</code></td><td class="con">✗ 403</td><td class="con">✗ 403</td><td class="pro">✓ 200</td></tr>
            <tr><td><code>/api/rbac/method-security/admin-only</code></td><td class="con">✗ 403</td><td class="con">✗ 403</td><td class="pro">✓ 200</td></tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-title">Two Ways to Enforce Roles</div>
        <div class="text-sm" style="line-height:1.8">
          <strong>1. URL rules in SecurityConfig</strong> — coarse-grained:<br>
          <code style="font-size:11px">.requestMatchers("/api/rbac/admin/**").hasRole("ADMIN")</code>
          <br><br>
          <strong>2. @PreAuthorize on methods</strong> — fine-grained + ownership:<br>
          <code style="font-size:11px">@PreAuthorize("hasRole('USER') and #userId == authentication.name")</code>
          <br><br>
          <strong>401 vs 403:</strong><br>
          <code>401 Unauthorized</code> — not authenticated (who are you?)<br>
          <code>403 Forbidden</code> — authenticated but not authorized (I know who you are, but no)
        </div>
      </div>
    </div>

    <div class="section-heading">Try It — Viewer accessing user endpoint (403)</div>
    ${simBlock(
      'curl /api/rbac/user \\\n  -H "Authorization: Bearer <viewer_token>"',
      'GET', '/api/rbac/user',
      { Authorization: 'Bearer eyJhbGci... (viewer token — roles: [ROLE_VIEWER])' },
      null, 403,
      { type: '/errors/forbidden', title: 'Forbidden', status: 403, detail: 'Access denied — USER role required' }
    )}

    <div class="section-heading">Try It — User accessing viewer endpoint (200)</div>
    ${simBlock(
      'curl /api/rbac/viewer \\\n  -H "Authorization: Bearer <user_token>"',
      'GET', '/api/rbac/viewer',
      { Authorization: 'Bearer eyJhbGci... (user token — roles: [ROLE_USER])' },
      null, 200,
      { message: 'Viewer endpoint — accessible by VIEWER, USER, and ADMIN', user: 'user', roles: ['ROLE_USER'] }
    )}

    <div class="section-heading">Try It — Admin accessing any endpoint (200)</div>
    ${simBlock(
      'curl /api/rbac/admin \\\n  -H "Authorization: Bearer <admin_token>"',
      'GET', '/api/rbac/admin',
      { Authorization: 'Bearer eyJhbGci... (admin token — roles: [ROLE_ADMIN, ROLE_USER])' },
      null, 200,
      { message: 'Admin endpoint — ADMIN role required', user: 'admin', roles: ['ROLE_ADMIN', 'ROLE_USER'] }
    )}`;
}

// ── PAGE: RATE LIMITING ───────────────────────────────────────
function rateLimitPage() {
  return `
    <div class="page-title">⚡ Rate Limiting</div>
    <div class="page-sub">Token bucket algorithm — exhaust tokens to trigger 429 Too Many Requests.</div>

    <div class="concept-box">
      Each client gets a <strong>bucket of tokens</strong>. Each request consumes 1 token. Tokens refill at a fixed rate.<br>
      If the bucket is empty → <code>429 Too Many Requests</code>.<br>
      Response headers tell clients how many tokens remain: <code>X-Rate-Limit-Remaining</code>, <code>Retry-After</code>
    </div>

    <div class="alert alert-info text-sm">
      <strong>Interactive simulation below</strong> — click "Send 1" or "Rapid Fire" to drain buckets, then "Reset All" to refill.
    </div>

    <div class="triple-grid">
      ${rateLimitCard('standard', 'Standard', '/api/rate/standard', 20, 'Per-IP: 20 requests per minute')}
      ${rateLimitCard('strict', 'Strict', '/api/rate/strict', 5, 'Shared: 5 requests per minute — models login endpoints')}
      ${rateLimitCard('tiered', 'Tiered', '/api/rate/tiered', 10, 'Burst: 10 per 10s AND Sustained: 100/hr — both must pass')}
    </div>

    <div style="text-align:center;margin-bottom:24px">
      <button class="btn btn-secondary" data-action="rateReset">Reset All Buckets</button>
    </div>

    <div class="card">
      <div class="card-title">What to Send in Responses</div>
      <table class="comparison-table">
        <thead><tr><th>Header</th><th>Value</th><th>Purpose</th></tr></thead>
        <tbody>
          <tr><td><code>X-Rate-Limit-Limit</code></td><td><code>20</code></td><td>Max requests per window</td></tr>
          <tr><td><code>X-Rate-Limit-Remaining</code></td><td><code>14</code></td><td>Tokens left in current window</td></tr>
          <tr><td><code>X-Rate-Limit-Reset</code></td><td>Unix timestamp</td><td>When bucket refills</td></tr>
          <tr><td><code>Retry-After</code></td><td><code>60</code></td><td>Seconds to wait (429 response only)</td></tr>
        </tbody>
      </table>
    </div>

    <div class="section-heading">Try It — Normal Request (200 OK)</div>
    ${simBlock(
      'curl /api/rate/standard \\\n  -H "X-Forwarded-For: 203.0.113.42"',
      'GET', '/api/rate/standard',
      { 'X-Forwarded-For': '203.0.113.42' },
      null, 200,
      { message: 'OK', remaining: 19, limit: 20, 'X-Rate-Limit-Remaining': 19, 'X-Rate-Limit-Reset': 1704067260 }
    )}

    <div class="section-heading">Try It — Bucket Exhausted (429)</div>
    ${simBlock(
      '# After exhausting all tokens:\ncurl /api/rate/strict',
      'GET', '/api/rate/strict',
      {},
      null, 429,
      { type: '/errors/rate-limited', title: 'Too Many Requests', status: 429, detail: 'Rate limit exceeded. Bucket is empty.', retryAfter: 60 }
    )}
    <div class="alert alert-info text-sm">Use the interactive buckets above to simulate exhaustion — click "Rapid Fire ×10" on the Strict bucket, then click Run above.</div>`;
}

function rateLimitCard(key, label, endpoint, max, desc) {
  return `
    <div class="card">
      <div class="card-title">${label} Limit</div>
      <div class="text-sm text-muted mb-8">${desc}</div>
      <div id="rate-${key}-meter">${tokenMeter(State.rateBuckets[key] ?? max, max, 'Token bucket')}</div>
      <div class="btn-group mt-8">
        <button class="btn btn-primary btn-sm" data-action="rateSend" data-key="${key}">Send 1</button>
        <button class="btn btn-danger btn-sm" data-action="rateRapidFire" data-key="${key}">Rapid Fire ×10</button>
      </div>
      <div id="rate-${key}-response" class="mt-8">${responseViewer(null)}</div>
      <div class="text-xs text-muted mt-8">Backend: <code>${endpoint}</code></div>
    </div>`;
}

// ── PAGE: CIRCUIT BREAKER ─────────────────────────────────────
function circuitBreakerPage() {
  const state = State.cbState;
  const logHtml = State.cbLog.map(e => `
    <div class="cb-log-entry">
      <span class="cb-log-time">${e.time}</span>
      <span class="${e.isFallback ? 'cb-log-fallback' : e.fail ? 'cb-log-failure' : 'cb-log-success'}">
        ${e.isFallback ? '⚡ FALLBACK (circuit open)' : e.fail ? '✗ FAILURE' : '✓ SUCCESS'}
      </span>
    </div>`).join('');

  return `
    <div class="page-title">🔄 Circuit Breaker</div>
    <div class="page-sub">Fail fast to prevent cascading failures when a downstream service is broken.</div>

    <div class="concept-box">
      Like an electrical circuit breaker: too many failures → circuit <strong>OPENS</strong> → requests fail immediately without trying the service.<br>
      After a cooldown, the circuit goes <strong>HALF-OPEN</strong> to test recovery.<br>
      Demo config: opens after <strong>50% failure rate</strong> over last 5 calls.
    </div>

    <div class="alert alert-info text-sm">
      <strong>Interactive simulation</strong> — send successes and failures. After 3+ failures the circuit opens and all calls get a fallback immediately.
    </div>

    <div class="demo-grid">
      <div class="card">
        <div class="card-title">Circuit State (Simulated)</div>
        <div class="cb-diagram">
          <div class="cb-state cb-state-closed ${state === 'CLOSED' ? 'active' : ''}">
            <span class="cb-state-icon">✅</span>
            <span class="cb-state-name">Closed</span>
            <span class="cb-state-desc">Normal — requests flow through</span>
          </div>
          <span class="cb-arrow">→</span>
          <div class="cb-state cb-state-open ${state === 'OPEN' ? 'active' : ''}">
            <span class="cb-state-icon">🚫</span>
            <span class="cb-state-name">Open</span>
            <span class="cb-state-desc">Failing — immediate fallback</span>
          </div>
          <span class="cb-arrow">→</span>
          <div class="cb-state cb-state-half ${state === 'HALF_OPEN' ? 'active' : ''}">
            <span class="cb-state-icon">🔶</span>
            <span class="cb-state-name">Half-Open</span>
            <span class="cb-state-desc">Testing recovery</span>
          </div>
        </div>
        <div class="cb-stats">
          <div class="cb-stat">
            <div class="cb-stat-value" id="cb-successes" style="color:var(--success)">${State.cbSuccesses}</div>
            <div class="cb-stat-label">Successes</div>
          </div>
          <div class="cb-stat">
            <div class="cb-stat-value" id="cb-failures" style="color:var(--error)">${State.cbFailures}</div>
            <div class="cb-stat-label">Failures</div>
          </div>
          <div class="cb-stat">
            <div class="cb-stat-value" id="cb-state-val"
              style="color:${state === 'CLOSED' ? 'var(--success)' : state === 'OPEN' ? 'var(--error)' : 'var(--warning)'}">${state}</div>
            <div class="cb-stat-label">Circuit State</div>
          </div>
        </div>
        <div class="card-title text-sm mt-12">Event Log</div>
        <div class="cb-log" id="cb-log">${logHtml || '<span style="color:#475569">No events yet</span>'}</div>
      </div>

      <div class="card">
        <div class="card-title">Send Requests</div>
        <div class="btn-group">
          <button class="btn btn-success" data-action="cbSend" data-fail="false">✓ Success Request</button>
          <button class="btn btn-danger"  data-action="cbSend" data-fail="true">✗ Fail Request</button>
          <button class="btn btn-secondary" data-action="cbReset">Reset</button>
        </div>
        <div class="text-xs text-muted mt-8">
          Tip: send 4+ fail requests to open the circuit. Then send a success — notice the immediate fallback response.
        </div>
        <div id="cb-response" class="mt-12">${responseViewer(null)}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Strategy Comparison</div>
      <table class="comparison-table">
        <thead><tr><th>Pattern</th><th>Frees thread?</th><th>Cancels work?</th><th>Best for</th></tr></thead>
        <tbody>
          <tr><td>No protection</td><td class="con">✗ Never</td><td class="con">✗ N/A</td><td>⚠ Don't use</td></tr>
          <tr><td>HTTP client timeout</td><td class="pro">✓ At timeout</td><td class="con">✗ Server runs on</td><td>Calling external services</td></tr>
          <tr><td><code>@TimeLimiter</code> (Resilience4j)</td><td class="pro">✓ At timeout</td><td class="pro">✓ Future cancelled</td><td>Service calls with fallback</td></tr>
          <tr><td><code>@CircuitBreaker</code> (Resilience4j)</td><td class="pro">✓ Immediately</td><td class="pro">✓ No call made</td><td>Repeatedly failing downstream</td></tr>
        </tbody>
      </table>
    </div>

    <div class="section-heading">Try It — Success Request (CLOSED circuit)</div>
    ${simBlock(
      'curl /api/timeout/unreliable?fail=false',
      'GET', '/api/timeout/unreliable?fail=false',
      {},
      null, 200,
      { result: 'success', message: 'Downstream call succeeded', circuitState: 'CLOSED' }
    )}

    <div class="section-heading">Try It — Failure Request (toward OPEN)</div>
    ${simBlock(
      'curl /api/timeout/unreliable?fail=true',
      'GET', '/api/timeout/unreliable?fail=true',
      {},
      null, 500,
      { error: 'Internal Server Error', detail: 'Simulated downstream failure', circuitState: 'CLOSED', failureRate: '60%' }
    )}

    <div class="section-heading">Try It — Circuit OPEN → Fallback (503)</div>
    ${simBlock(
      '# After too many failures — circuit opens:\ncurl /api/timeout/unreliable?fail=false',
      'GET', '/api/timeout/unreliable?fail=false',
      {},
      null, 503,
      { result: 'FALLBACK — circuit is OPEN, call bypassed', state: 'OPEN', detail: 'Downstream service is unhealthy. Returning cached fallback.' }
    )}
    <div class="alert alert-info text-sm">Use the interactive simulation above to drive the circuit through states, then observe the 503 fallback.</div>`;
}

function refreshCb() {
  const state = State.cbState;
  const states = [
    { key: 'CLOSED', cls: 'cb-state-closed' },
    { key: 'OPEN',   cls: 'cb-state-open' },
    { key: 'HALF_OPEN', cls: 'cb-state-half' },
  ];
  document.querySelectorAll('.cb-state').forEach((el, i) => {
    el.classList.toggle('active', states[i]?.key === state);
  });
  const sEl = document.getElementById('cb-successes');
  const fEl = document.getElementById('cb-failures');
  const stEl = document.getElementById('cb-state-val');
  if (sEl) sEl.textContent = State.cbSuccesses;
  if (fEl) fEl.textContent = State.cbFailures;
  if (stEl) {
    stEl.textContent = state;
    stEl.style.color = state === 'CLOSED' ? 'var(--success)' : state === 'OPEN' ? 'var(--error)' : 'var(--warning)';
  }
  const logEl = document.getElementById('cb-log');
  if (logEl) {
    const html = State.cbLog.map(e => `
      <div class="cb-log-entry">
        <span class="cb-log-time">${e.time}</span>
        <span class="${e.isFallback ? 'cb-log-fallback' : e.fail ? 'cb-log-failure' : 'cb-log-success'}">
          ${e.isFallback ? '⚡ FALLBACK (circuit open)' : e.fail ? '✗ FAILURE' : '✓ SUCCESS'}
        </span>
      </div>`).join('');
    logEl.innerHTML = html || '<span style="color:#475569">No events yet</span>';
  }
}

// ── PAGE: HANGING APIS ────────────────────────────────────────
function hangingApisPage() {
  return `
    <div class="page-title">⏳ Handling Hanging API Calls</div>
    <div class="page-sub">What happens when a downstream service stops responding — and how to protect against it.</div>

    <div class="concept-box">
      A hanging API call holds a server thread for its entire duration. Tomcat's default thread pool is
      <strong>200 threads</strong>. With 200 concurrent hanging calls your server stops responding to
      <em>everything</em> — not just requests to the slow service.<br><br>
      <strong>Two levels of protection you always need:</strong><br>
      &nbsp;1. <strong>Caller-side</strong> — HTTP client timeouts (connect + read)<br>
      &nbsp;2. <strong>Server-side</strong> — deadline on the async work itself (so threads are freed)
    </div>

    <div class="triple-grid">
      <div class="card">
        <div class="card-title">❌ Approach 1 — No Protection</div>
        <div class="text-sm text-muted mb-8">
          <code>Thread.sleep(delay)</code> blocks the Tomcat request thread for the full duration.
        </div>
        <div class="alert alert-error text-sm">
          200 concurrent hangs = thread pool exhausted = server freeze.
        </div>
        <div class="text-sm text-muted mt-8">
          <strong>Endpoint:</strong> <code>/api/hanging/no-timeout?delay=N</code><br>
          <strong>Thread impact:</strong> 1 thread blocked for N seconds<br>
          <strong>Response time:</strong> always N seconds
        </div>
        ${simBlock(
          'curl /api/hanging/no-timeout?delay=5',
          'GET', '/api/hanging/no-timeout?delay=5',
          {},
          null, 200,
          { message: 'Completed after full delay', delayMs: 5000, threadBlocked: true, warning: '1 Tomcat thread was held for 5 seconds' },
          { delay: 1200 }
        )}
      </div>

      <div class="card">
        <div class="card-title">✅ Approach 2 — CompletableFuture Deadline</div>
        <div class="text-sm text-muted mb-8">
          Java 9+: <code>CompletableFuture.orTimeout(deadline, SECONDS)</code>.
          Work runs in an executor thread; if the deadline passes, caller gets a fast 504.
        </div>
        <div class="alert alert-success text-sm">
          Caller freed after deadline seconds regardless of how slow downstream is.
        </div>
        <div class="text-sm text-muted mt-8">
          <strong>Endpoint:</strong> <code>/api/hanging/with-deadline?delay=N&deadline=N</code><br>
          <strong>Thread impact:</strong> request thread freed at deadline<br>
          <strong>Response time:</strong> min(delay, deadline)
        </div>
        ${simBlock(
          '# delay=8 but deadline=3 → responds in 3s with 504\ncurl "/api/hanging/with-deadline?delay=8&deadline=3"',
          'GET', '/api/hanging/with-deadline?delay=8&deadline=3',
          {},
          null, 504,
          { type: '/errors/timeout', title: 'Gateway Timeout', status: 504, detail: 'Downstream call exceeded 3s deadline', deadlineMs: 3000, actualDelayMs: 8000 },
          { delay: 900 }
        )}
      </div>

      <div class="card">
        <div class="card-title">✅ Approach 3 — HTTP Client Timeouts</div>
        <div class="text-sm text-muted mb-8">
          Configure <code>connectTimeout</code> and per-request <code>timeout</code> on the HTTP client.
        </div>
        <div class="alert alert-warning text-sm">
          ⚠ Client timeout cancels <em>the caller's wait</em> — the server-side thread keeps running.
        </div>
        <div class="text-sm text-muted mt-8">
          <strong>Endpoint:</strong> <code>/api/hanging/http-client?delay=N&timeout=N</code><br>
          <strong>Connect timeout:</strong> 2s (hardcoded)<br>
          <strong>Request timeout:</strong> configurable
        </div>
        ${simBlock(
          'curl "/api/hanging/http-client?delay=8&timeout=3"',
          'GET', '/api/hanging/http-client?delay=8&timeout=3',
          {},
          null, 504,
          { type: '/errors/timeout', title: 'Client Timeout', status: 504, detail: 'HTTP client read timeout after 3000ms. Note: server-side thread continues running.', clientTimeout: 3000, serverDelayMs: 8000 },
          { delay: 900 }
        )}
      </div>
    </div>

    <div class="card">
      <div class="card-title">The Two-Timeout Rule</div>
      <div class="text-sm" style="line-height:1.8">
        <strong>Connect timeout</strong> — guards against unreachable hosts (DNS failure, firewall drop).<br>
        <strong>Read/request timeout</strong> — guards against a host that accepts the connection but then hangs.<br><br>
        Both must be set. A read timeout without a connect timeout leaves you vulnerable to dead hosts.
        A connect timeout without a read timeout leaves you vulnerable to slow responses.
      </div>
      <div class="divider"></div>
      <table class="comparison-table">
        <thead><tr><th>Strategy</th><th>Frees thread?</th><th>Cancels server work?</th><th>Complexity</th></tr></thead>
        <tbody>
          <tr><td>No protection</td><td class="con">✗</td><td class="con">✗</td><td>None</td></tr>
          <tr><td><code>CompletableFuture.orTimeout()</code></td><td class="pro">✓ at deadline</td><td class="con">✗ task may linger</td><td>Low</td></tr>
          <tr><td>HTTP client timeouts</td><td class="pro">✓ at timeout</td><td class="con">✗ server runs on</td><td>Low</td></tr>
          <tr><td><code>@TimeLimiter</code></td><td class="pro">✓</td><td class="pro">✓</td><td>Medium</td></tr>
          <tr><td><code>@CircuitBreaker</code></td><td class="pro">✓ immediately</td><td class="pro">✓ no call made</td><td>Medium</td></tr>
        </tbody>
      </table>
    </div>`;
}

// ── PAGE: THIRD-PARTY APIS ────────────────────────────────────
function thirdPartyPage() {
  return `
    <div class="page-title">🔌 Third-Party API Integration</div>
    <div class="page-sub">Design patterns when your service consumes external providers — not just serves users.</div>

    <div class="concept-box">
      Integrating with providers inverts the usual model. <strong>You are the client</strong>, not the server.<br>
      Authentication, error handling, rate limits, and availability are all controlled by someone else.
    </div>

    <div class="card">
      <div class="card-title">Inbound vs Outbound</div>
      <table class="comparison-table">
        <thead><tr><th></th><th>User-Facing API</th><th>Third-Party Integration</th></tr></thead>
        <tbody>
          <tr><td>Auth direction</td><td>Client → your API</td><td>You → provider (outbound)<br>Provider → your webhook (inbound)</td></tr>
          <tr><td>Auth mechanism</td><td>JWT / session / API key</td><td>HMAC signature verify (inbound)<br>API key / OAuth2 (outbound)</td></tr>
          <tr><td>Rate limits</td><td>You set them</td><td>Provider sets them — you obey</td></tr>
          <tr><td>Availability SLA</td><td>You control</td><td>Provider controls — design for their outages</td></tr>
          <tr><td>Error format</td><td>You standardize</td><td>Map provider errors → your domain</td></tr>
          <tr><td>Schema changes</td><td>You control</td><td>Provider can change anytime — parse defensively</td></tr>
        </tbody>
      </table>
    </div>

    <div class="demo-grid">
      <div class="card">
        <div class="card-title">Pattern 1 — Webhook Receiver</div>
        <div class="text-sm text-muted mb-8">
          Providers POST events to your URL. You must <strong>verify the HMAC signature</strong> on every request.
        </div>
        <div class="alert alert-info text-sm">
          Signature format: <code>X-Webhook-Signature: sha256=&lt;HMAC-SHA256(secret, timestamp.body)&gt;</code><br>
          Demo secret: <code>whsec_demo_secret_12345</code>
        </div>
        ${simBlock(
          'curl -X POST /api/third-party/webhook/receive \\\n  -H "Content-Type: application/json" \\\n  -H "X-Webhook-Signature: sha256=a7f3d9e2c1b4..." \\\n  -H "X-Webhook-Timestamp: 1704067200" \\\n  -d \'{"type":"payment.completed","data":{"amount":99.99}}\'',
          'POST', '/api/third-party/webhook/receive',
          { 'Content-Type': 'application/json', 'X-Webhook-Signature': 'sha256=a7f3d9e2c1b4f8e6...', 'X-Webhook-Timestamp': '1704067200' },
          { type: 'payment.completed', data: { amount: 99.99 } },
          200,
          { received: true, eventId: 'evt_abc123', message: 'Webhook accepted and queued for processing' }
        )}

        <div class="text-sm text-muted mt-8" style="font-weight:600">Tampered payload — signature mismatch (401):</div>
        ${simBlock(
          'curl -X POST /api/third-party/webhook/receive \\\n  -H "X-Webhook-Signature: sha256=tampered_bad_sig" \\\n  -H "X-Webhook-Timestamp: 1704067200" \\\n  -d \'{"type":"payment.completed","data":{"amount":0}}\'',
          'POST', '/api/third-party/webhook/receive',
          { 'Content-Type': 'application/json', 'X-Webhook-Signature': 'sha256=tampered_bad_sig', 'X-Webhook-Timestamp': '1704067200' },
          { type: 'payment.completed', data: { amount: 0 } },
          401,
          { type: '/errors/unauthorized', title: 'Unauthorized', status: 401, detail: 'Webhook signature verification failed' }
        )}
      </div>

      <div class="card">
        <div class="card-title">Webhook Processing Pattern</div>
        <ol class="text-sm" style="padding-left:18px;line-height:2.2">
          <li>Verify HMAC signature → reject immediately if invalid</li>
          <li>Check event ID → skip if already processed (idempotency)</li>
          <li>Store raw event to DB</li>
          <li>Return <code>200 OK</code> immediately</li>
          <li>Process event async (background job / queue)</li>
        </ol>
        <div class="alert alert-warning text-sm mt-8">
          Never do heavy processing before the 200 — providers mark delivery as failed if you take &gt;5s and will retry, causing duplicates.
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Pattern 2 — Outbound Call Scenarios</div>
      <table class="comparison-table">
        <thead><tr><th>Scenario</th><th>Correct Handling</th></tr></thead>
        <tbody>
          <tr><td><span class="tag tag-red">429 Rate Limited</span></td><td>Read <code>Retry-After</code>, back off, retry with exponential jitter. Alert if sustained.</td></tr>
          <tr><td><span class="tag tag-red">401 Auth Failed</span></td><td>Alert ops immediately — key may be expired or revoked. Do not retry silently.</td></tr>
          <tr><td><span class="tag tag-red">503 Server Error</span></td><td>Circuit breaker + retry with backoff. Fallback to cached data if available.</td></tr>
          <tr><td><span class="tag tag-yellow">Schema Drift</span></td><td>Parse defensively — use optional fields. Log unexpected shapes. Never crash.</td></tr>
          <tr><td><span class="tag tag-green">Success</span></td><td>Map to your domain types. Strip provider-internal fields before passing to callers.</td></tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card-title">Credential Management</div>
      <table class="comparison-table">
        <thead><tr><th>Practice</th><th>Bad</th><th>Good</th></tr></thead>
        <tbody>
          <tr><td>Storage</td><td class="con">Hardcoded in source code</td><td class="pro">Environment variable or secrets manager (Vault, AWS)</td></tr>
          <tr><td>Rotation</td><td class="con">Delete old key → downtime</td><td class="pro">Activate new → migrate → revoke old (overlap)</td></tr>
          <tr><td>Scope</td><td class="con">One key with all permissions</td><td class="pro">Per-service keys with minimum permissions</td></tr>
          <tr><td>Environments</td><td class="con">Same key in dev and prod</td><td class="pro">Separate keys per environment</td></tr>
          <tr><td>Logging</td><td class="con">Log full Authorization header</td><td class="pro">Redact Authorization headers in logs</td></tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card-title">Webhook Security Checklist</div>
      <div class="triple-grid" style="gap:12px">
        <div>
          <div class="text-sm" style="font-weight:600;margin-bottom:6px">Signature Verification</div>
          <ul class="text-sm text-muted" style="padding-left:18px;line-height:2">
            <li>Verify HMAC on <em>every</em> request, no exceptions</li>
            <li>Use constant-time comparison (not <code>===</code>)</li>
            <li>Include timestamp in signed payload</li>
            <li>Reject if timestamp is &gt; 5 min old</li>
          </ul>
        </div>
        <div>
          <div class="text-sm" style="font-weight:600;margin-bottom:6px">Idempotency</div>
          <ul class="text-sm text-muted" style="padding-left:18px;line-height:2">
            <li>Store event ID before processing</li>
            <li>Check for duplicate event ID on arrival</li>
            <li>Make all event handlers idempotent</li>
            <li>Providers retry — expect duplicates</li>
          </ul>
        </div>
        <div>
          <div class="text-sm" style="font-weight:600;margin-bottom:6px">Reliability</div>
          <ul class="text-sm text-muted" style="padding-left:18px;line-height:2">
            <li>ACK with 200 in &lt;5s always</li>
            <li>Process async — never block the ACK</li>
            <li>Handle out-of-order delivery</li>
            <li>Expose a manual replay endpoint</li>
          </ul>
        </div>
      </div>
    </div>`;
}

// ── PAGE: PARTNER INTEGRATION ─────────────────────────────────
function partnerApiPage() {
  return `
    <div class="page-title">🤝 Partner Integration (B2B)</div>
    <div class="page-sub">Designing your API to be consumed by third-party companies — not just end users.</div>

    <div class="concept-box">
      Opening your API to external companies introduces a fundamentally different set of concerns.
      <strong>A partner integration is a contractual relationship</strong>, not a user session.
    </div>

    <div class="card">
      <div class="card-title">User API vs B2B Partner API</div>
      <table class="comparison-table">
        <thead><tr><th></th><th>User-Facing API</th><th>B2B Partner API</th></tr></thead>
        <tbody>
          <tr><td>Identity unit</td><td>Individual user (JWT per session)</td><td>Organization (long-lived API key)</td></tr>
          <tr><td>Rate limits</td><td>Per IP or per user</td><td>Per partner, tiered by contract</td></tr>
          <tr><td>Data access</td><td>Own records only</td><td>Tenant-scoped subset</td></tr>
          <tr><td>Breaking changes</td><td>Notify users, soft-launch</td><td>6–12 month deprecation period</td></tr>
          <tr><td>Audit trail</td><td>Session logs</td><td>Immutable, per-partner, compliance-grade</td></tr>
          <tr><td>Event delivery</td><td>Optional webhooks</td><td>You push signed events to partner URLs</td></tr>
        </tbody>
      </table>
    </div>

    <div class="alert alert-warning">
      <strong>⚠ API Keys Alone Are Not Enough</strong><br>
      An API key in a header proves the caller <em>knows the key</em> — it does not prove the request was not tampered with, is not a replay, or came from an authorized source. Real B2B integrations layer multiple mechanisms on top of the API key.
      <table class="comparison-table" style="margin-top:10px">
        <thead><tr><th>Risk</th><th>What Happens</th><th>Mitigation</th></tr></thead>
        <tbody>
          <tr><td><strong>Key leakage</strong></td><td>Partner embeds key in source code or CI/CD logs — compromised without a breach of your system</td><td>HMAC signing: knowing the key alone is not enough without the signing secret</td></tr>
          <tr><td><strong>Replay attack</strong></td><td>Attacker captures a valid request and resends it unchanged — the API key is still valid</td><td>HMAC + timestamp: server rejects any request older than 5 minutes</td></tr>
          <tr><td><strong>Body tampering</strong></td><td>Body is modified in transit; the key header is preserved — the API key covers identity, not payload integrity</td><td>HMAC signs the full request body — any modification invalidates the signature</td></tr>
          <tr><td><strong>Impersonation</strong></td><td>Any client that learns the key can call your API — the key proves knowledge of a secret, not caller identity</td><td>mTLS: client must present a certificate at the TLS handshake level</td></tr>
        </tbody>
      </table>
    </div>

    <div class="demo-grid">
      <div class="card">
        <div class="card-title">Partner Tiers &amp; Scopes</div>
        <table class="cred-table">
          <thead><tr><th>Partner</th><th>Tier</th><th>Rate Limit</th><th>Scopes</th></tr></thead>
          <tbody>
            <tr>
              <td><code>partner-alpha-key-12345</code></td>
              <td><span class="tag tag-red">PREMIUM</span></td>
              <td>10,000/min</td>
              <td>catalog:read, orders:read, orders:write, catalog:write, analytics:read</td>
            </tr>
            <tr>
              <td><code>partner-beta-key-12345</code></td>
              <td><span class="tag tag-blue">STANDARD</span></td>
              <td>1,000/min</td>
              <td>catalog:read, orders:read, orders:write</td>
            </tr>
            <tr>
              <td><code>partner-gamma-key-12345</code></td>
              <td><span class="tag tag-green">FREE</span></td>
              <td>100/min</td>
              <td>catalog:read</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-title">Key Concepts</div>
        <div class="text-sm" style="line-height:2">
          <strong>Tenant Isolation:</strong> Same endpoint, different data per partner.<br>
          Alpha sees 3 catalog items, Beta sees 2, Gamma sees 1.<br><br>
          <strong>Scope Enforcement:</strong> Only PREMIUM (Alpha) has <code>analytics:read</code>.<br>
          Beta + Gamma get <code>403 INSUFFICIENT_SCOPE</code> on audit endpoints.<br><br>
          <strong>Deprecation Headers:</strong> When retiring a version, add:<br>
          <code>Deprecation: Sat, 01 Jan 2026 00:00:00 GMT</code><br>
          <code>Sunset: Sat, 01 Jul 2026 00:00:00 GMT</code><br>
          <code>Link: &lt;/api/v2/items&gt;; rel="successor-version"</code>
        </div>
      </div>
    </div>

    <div class="section-heading">Try It — PREMIUM Partner Auth Info</div>
    ${simBlock(
      'curl /api/partner/auth-info \\\n  -H "X-Partner-Key: partner-alpha-key-12345"',
      'GET', '/api/partner/auth-info',
      { 'X-Partner-Key': 'partner-alpha-key-12345' },
      null, 200,
      { partnerId: 'alpha-corp', organizationName: 'Alpha Corp', tier: 'PREMIUM', scopes: ['catalog:read', 'orders:read', 'orders:write', 'catalog:write', 'analytics:read'], rateLimit: 10000 }
    )}

    <div class="section-heading">Try It — FREE Partner Auth Info (fewer scopes)</div>
    ${simBlock(
      'curl /api/partner/auth-info \\\n  -H "X-Partner-Key: partner-gamma-key-12345"',
      'GET', '/api/partner/auth-info',
      { 'X-Partner-Key': 'partner-gamma-key-12345' },
      null, 200,
      { partnerId: 'gamma-corp', organizationName: 'Gamma Corp', tier: 'FREE', scopes: ['catalog:read'], rateLimit: 100 }
    )}

    <div class="section-heading">Try It — Audit Log: PREMIUM (200 OK)</div>
    ${simBlock(
      'curl /api/partner/audit \\\n  -H "X-Partner-Key: partner-alpha-key-12345"',
      'GET', '/api/partner/audit',
      { 'X-Partner-Key': 'partner-alpha-key-12345' },
      null, 200,
      { events: [{ id: 'evt_001', action: 'catalog.read', timestamp: '2024-01-01T10:00:00Z' }, { id: 'evt_002', action: 'orders.write', timestamp: '2024-01-01T10:01:00Z' }], total: 2 }
    )}

    <div class="section-heading">Try It — Audit Log: FREE Partner (403 Insufficient Scope)</div>
    ${simBlock(
      'curl /api/partner/audit \\\n  -H "X-Partner-Key: partner-gamma-key-12345"',
      'GET', '/api/partner/audit',
      { 'X-Partner-Key': 'partner-gamma-key-12345' },
      null, 403,
      { type: '/errors/forbidden', title: 'Forbidden', status: 403, detail: 'Insufficient scope — analytics:read required', requiredScope: 'analytics:read', partnerTier: 'FREE' }
    )}

    <div class="divider"></div>
    <div class="section-heading">HMAC Request Signing</div>

    <div class="card">
      <div class="card-title">How It Works</div>
      <div class="text-sm" style="line-height:1.9">
        Partners sign every inbound request with <strong>HMAC-SHA256</strong> using a shared signing secret (separate from the API key itself). The server recomputes the signature independently and rejects any mismatch — without the secret, the signature cannot be forged.<br><br>
        <strong>Canonical string that gets signed:</strong><br>
        <code>METHOD + "\\n" + PATH + "\\n" + TIMESTAMP + "\\n" + SHA256(body)</code><br><br>
        <strong>Why include a timestamp?</strong> Limits the replay window to 5 minutes. Even if an attacker captures a valid signed request, it becomes useless after 300 seconds — the server rejects <code>|now &minus; timestamp| &gt; 300</code>.<br><br>
        <strong>Why include the body hash?</strong> Any modification to the request body changes its SHA-256 hash, which changes the HMAC output. A man-in-the-middle cannot tamper with the body without also regenerating the HMAC — which requires the secret.
      </div>
    </div>

    <div class="demo-grid">
      <div class="card">
        <div class="card-title">Client: Generating the Signature (Java)</div>
        ${curlBlock('// Before sending each signed request:\nInstant now = Instant.now();\nString rawBody = requestBodyJson; // raw JSON, before any parsing\nString bodyHash = sha256Hex(rawBody);\nString canonical = "POST\\n/api/partner/orders\\n"\n    + now.getEpochSecond() + "\\n" + bodyHash;\nString signature = "sha256=" + hmacSha256(signingSecret, canonical);\n\nHttpRequest.newBuilder()\n    .header("X-Partner-Key", partnerKey)\n    .header("X-Timestamp", String.valueOf(now.getEpochSecond()))\n    .header("X-Signature", signature)\n    .header("Content-Type", "application/json")\n    .POST(BodyPublishers.ofString(rawBody))\n    .build();')}
      </div>
      <div class="card">
        <div class="card-title">Server: Verifying the Signature (Java)</div>
        ${curlBlock('// 1. Reject stale requests — replay protection\nlong now = Instant.now().getEpochSecond();\nif (Math.abs(now - timestamp) > 300) {\n    return ResponseEntity.status(401)\n        .body(Map.of("error", "Request expired"));\n}\n// 2. Recompute expected signature\nString bodyHash = sha256Hex(rawBody);\nString canonical = method + "\\n" + path + "\\n"\n    + timestamp + "\\n" + bodyHash;\nString expected = "sha256=" + hmacSha256(\n    partner.getSigningSecret(), canonical);\n// 3. Constant-time compare — never String.equals()\n//    String.equals() is vulnerable to timing attacks\nif (!MessageDigest.isEqual(\n        expected.getBytes(), incoming.getBytes())) {\n    return ResponseEntity.status(401)\n        .body(Map.of("error", "Invalid signature"));\n}')}
      </div>
    </div>

    <div class="section-heading">Try It — Valid HMAC-Signed Request (201 Created)</div>
    ${simBlock(
      'curl -X POST /api/partner/orders \\\n  -H "X-Partner-Key: partner-alpha-key-12345" \\\n  -H "X-Timestamp: 1704067200" \\\n  -H "X-Signature: sha256=a7f3d2b1c9e4f8a2..." \\\n  -H "Content-Type: application/json" \\\n  -d \'{"orderId":"ord-001","amount":99.99}\'',
      'POST', '/api/partner/orders',
      { 'X-Partner-Key': 'partner-alpha-key-12345', 'X-Timestamp': '1704067200', 'X-Signature': 'sha256=a7f3d2b1c9e4f8a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6' },
      { orderId: 'ord-001', amount: 99.99 },
      201,
      { orderId: 'ord-001', status: 'created', partnerId: 'alpha-corp', signatureVerified: true }
    )}

    <div class="section-heading">Try It — Tampered Body: Signature Mismatch (401)</div>
    ${simBlock(
      'curl -X POST /api/partner/orders \\\n  -H "X-Partner-Key: partner-alpha-key-12345" \\\n  -H "X-Timestamp: 1704067200" \\\n  -H "X-Signature: sha256=a7f3d2b1c9e4f8a2..." \\\n  -d \'{"orderId":"ord-001","amount":9999.99}\'',
      'POST', '/api/partner/orders',
      { 'X-Partner-Key': 'partner-alpha-key-12345', 'X-Timestamp': '1704067200', 'X-Signature': 'sha256=a7f3d2b1c9e4f8a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6' },
      { orderId: 'ord-001', amount: 9999.99 },
      401,
      { type: '/errors/unauthorized', title: 'Unauthorized', status: 401, detail: 'Signature verification failed — request body may have been tampered with' }
    )}

    <div class="section-heading">Try It — Replay Attack: Stale Timestamp (401)</div>
    ${simBlock(
      'curl -X POST /api/partner/orders \\\n  -H "X-Partner-Key: partner-alpha-key-12345" \\\n  -H "X-Timestamp: 1609459200" \\\n  -H "X-Signature: sha256=valid-but-old..." \\\n  -d \'{"orderId":"ord-001","amount":99.99}\'',
      'POST', '/api/partner/orders',
      { 'X-Partner-Key': 'partner-alpha-key-12345', 'X-Timestamp': '1609459200', 'X-Signature': 'sha256=valid-but-old1234567890abcdef1234567890abcdef12345678' },
      { orderId: 'ord-001', amount: 99.99 },
      401,
      { type: '/errors/unauthorized', title: 'Unauthorized', status: 401, detail: 'Request expired — timestamp is outside the 5-minute replay window', serverTime: 1704067200, requestTime: 1609459200, deltaSeconds: 94608000 }
    )}

    <div class="divider"></div>
    <div class="section-heading">Mutual TLS (mTLS)</div>

    <div class="card">
      <div class="card-title">Standard TLS vs Mutual TLS</div>
      <table class="comparison-table">
        <thead><tr><th></th><th>Standard TLS</th><th>Mutual TLS (mTLS)</th></tr></thead>
        <tbody>
          <tr><td>Server presents certificate</td><td>✓</td><td>✓</td></tr>
          <tr><td>Client presents certificate</td><td>✗</td><td>✓ — signed by your CA</td></tr>
          <tr><td>Authentication enforced at</td><td>TLS handshake (server only)</td><td>TLS handshake — before your application code runs</td></tr>
          <tr><td>What it stops</td><td>Eavesdropping</td><td>Eavesdropping + unauthorized connections</td></tr>
          <tr><td>Revocation</td><td>N/A</td><td>CRL / OCSP — immediate, no code deploy needed</td></tr>
          <tr><td>Onboarding cost</td><td>None</td><td>Certificate issuance + lifecycle management</td></tr>
        </tbody>
      </table>
    </div>

    <div class="demo-grid">
      <div class="card">
        <div class="card-title">How mTLS Works</div>
        <div class="text-sm" style="line-height:2">
          <strong>Onboarding:</strong><br>
          1. You issue a client certificate signed by your internal CA (or sign a CSR the partner generates)<br>
          2. Partner configures their HTTP client to present the cert on every outbound request<br>
          3. Your API gateway rejects connections without a valid cert at the TLS layer — before a single HTTP byte is read<br>
          4. Gateway injects <code>X-Client-Cert-DN</code> (Distinguished Name) into the upstream request<br>
          5. Your application maps the DN to a partner identity — no client self-reporting is trusted<br><br>
          <strong>Revocation:</strong> Revoke the cert via CRL/OCSP — takes effect immediately across all load balancer nodes with no code deploy.
        </div>
      </div>
      <div class="card">
        <div class="card-title">Gateway + Spring Configuration</div>
        ${curlBlock('# nginx: enforce client cert at TLS layer, inject DN\nssl_client_certificate /etc/ssl/partner-ca.crt;\nssl_verify_client       on;\nproxy_set_header X-Client-Cert-DN $ssl_client_s_dn;\n\n// Spring: read the DN injected by the gateway\n// Never trust a client-supplied X-Client-Cert-DN header\n@GetMapping("/orders")\npublic ResponseEntity getOrders(\n    @RequestHeader("X-Client-Cert-DN") String certDn) {\n  // certDn example: "CN=alpha-corp,O=Alpha Corp,C=US"\n  Partner p = partnerService.resolveByDn(certDn);\n  return ResponseEntity.ok(partnerService.getOrders(p));\n}')}
      </div>
    </div>

    <div class="concept-box">
      <strong>Use mTLS when:</strong> partners are enterprises with dedicated IT teams who can manage certificate rotation, compliance requirements mandate cryptographic proof of client identity (PCI-DSS, HIPAA), or you need defense-in-depth against stolen API keys.<br>
      <strong>Skip mTLS when:</strong> partners are small teams who cannot manage cert lifecycle, or when HMAC request signing already satisfies your threat model. mTLS adds real onboarding friction.
    </div>

    <div class="divider"></div>
    <div class="section-heading">IP Allowlisting</div>

    <div class="card">
      <div class="card-title">Network-Level Restriction</div>
      <div class="text-sm" style="line-height:1.9">
        Partners register their egress IP ranges at onboarding. Requests from non-allowlisted IPs are rejected at the load balancer — before reaching your application code.<br><br>
        <strong>Rules:</strong>
        <ul style="padding-left:18px;line-height:2">
          <li>Reject at the <strong>load balancer / API gateway</strong>, not in application code — reduces attack surface and avoids wasting compute on unauthorized traffic</li>
          <li>Require partners to use <strong>static egress IPs</strong> (NAT gateway), not developer workstation IPs that change daily</li>
          <li>Treat IP range updates as a <strong>change request</strong>: partner contacts you, you approve and update — never self-service</li>
          <li>Combine with API key + HMAC: a stolen key from an unregistered IP returns <code>403</code> before authentication is even attempted</li>
          <li><strong>Limitation:</strong> does not protect against an attacker who has compromised a server inside the partner's allowlisted range</li>
        </ul>
      </div>
    </div>

    <div class="divider"></div>
    <div class="section-heading">Defense in Depth — Layered Security</div>

    <div class="card">
      <div class="card-title">No Single Layer Is Sufficient</div>
      <table class="comparison-table">
        <thead><tr><th>Layer</th><th>Mechanism</th><th>What It Prevents</th></tr></thead>
        <tbody>
          <tr><td><strong>Network</strong></td><td>IP allowlisting at load balancer</td><td>Connections from unknown sources</td></tr>
          <tr><td><strong>Transport</strong></td><td>TLS 1.3 + mTLS client certificate</td><td>Eavesdropping, unauthorized TLS connections</td></tr>
          <tr><td><strong>Request integrity</strong></td><td>HMAC signing + 5-min timestamp window</td><td>Replay attacks, request body tampering</td></tr>
          <tr><td><strong>Identity</strong></td><td>Partner API key (HMAC-SHA256 hashed in DB)</td><td>Unauthorized API access</td></tr>
          <tr><td><strong>Authorization</strong></td><td>Scopes + tenant isolation per partner</td><td>Cross-partner data leakage, privilege escalation</td></tr>
          <tr><td><strong>Audit</strong></td><td>Immutable append-only logs</td><td>Undetected misuse, compliance gaps</td></tr>
        </tbody>
      </table>
      <div class="text-sm text-muted" style="margin-top:10px">
        <strong>Minimum viable B2B security:</strong> TLS + API key + HMAC request signing + audit logs.<br>
        <strong>Full enterprise security:</strong> all of the above + mTLS + IP allowlisting.
      </div>
    </div>

    <div class="card">
      <div class="card-title">Partner Onboarding Checklist</div>
      <div class="triple-grid" style="gap:12px">
        <div>
          <div class="text-sm" style="font-weight:600;margin-bottom:6px">Authentication &amp; Signing</div>
          <ul class="text-sm text-muted" style="padding-left:18px;line-height:2">
            <li>Issue per-partner API keys (not shared)</li>
            <li>Hash keys in DB — never store plaintext</li>
            <li>Support 2 active keys per partner (rotation)</li>
            <li>Issue a separate HMAC signing secret per partner</li>
            <li>Enforce 5-minute timestamp window on signed requests</li>
            <li>Use constant-time comparison for signature verification</li>
            <li>Alert ops on sustained 401s from any partner</li>
          </ul>
        </div>
        <div>
          <div class="text-sm" style="font-weight:600;margin-bottom:6px">Transport &amp; Network</div>
          <ul class="text-sm text-muted" style="padding-left:18px;line-height:2">
            <li>Enforce TLS 1.2+ on all endpoints (prefer 1.3)</li>
            <li>mTLS for high-compliance partners (HIPAA, PCI-DSS)</li>
            <li>Collect partner egress IP ranges at onboarding</li>
            <li>Enforce IP allowlist at the load balancer layer</li>
            <li>Treat IP range updates as approved change requests</li>
          </ul>
        </div>
        <div>
          <div class="text-sm" style="font-weight:600;margin-bottom:6px">Data, Contracts &amp; Reliability</div>
          <ul class="text-sm text-muted" style="padding-left:18px;line-height:2">
            <li>Enforce tenant isolation on every DB query</li>
            <li>Assign scopes at provisioning, not per-request</li>
            <li>Provide a sandbox with separate keys and test data</li>
            <li>Deprecation header on every old-version response</li>
            <li>Sunset date ≥ 6 months out (12 for enterprise)</li>
            <li>Sign outbound webhooks with per-partner secret</li>
            <li>Retry webhook delivery with exponential backoff</li>
          </ul>
        </div>
      </div>
    </div>`;
}

// ── PAGE: PAGINATION ──────────────────────────────────────────
function paginationPage() {
  return `
    <div class="page-title">📄 Pagination</div>
    <div class="page-sub">Always paginate — returning all records is a memory and performance anti-pattern.</div>

    <div class="concept-box">
      Spring Data's <code>Pageable</code>: <code>?page=0&size=6&sort=price,asc</code><br>
      Always return pagination metadata: <code>currentPage, totalPages, totalElements, hasNext, hasPrevious</code><br>
      Cap the <code>size</code> parameter server-side (max 100) to prevent abuse.
    </div>

    <div class="card">
      <div class="filter-bar">
        <div class="form-row">
          <label class="form-label">Category</label>
          <select class="form-select" id="filter-category">
            <option value="">All categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Books">Books</option>
            <option value="Sports">Sports</option>
            <option value="Kitchen">Kitchen</option>
          </select>
        </div>
        <div class="form-row">
          <label class="form-label">Search</label>
          <input class="form-input" id="filter-search" placeholder="Product name..." data-enter="paginationFilter">
        </div>
        <button class="btn btn-primary" data-action="paginationFilter" style="margin-top:18px">Filter</button>
      </div>

      <div id="product-grid" class="product-grid">
        <div class="text-muted text-sm">Loading…</div>
      </div>

      <div id="pagination-meta" class="pagination-info text-center"></div>
      <div class="pagination-controls">
        <button class="page-btn" data-action="paginationPrev">‹ Prev</button>
        <div id="pagination-pages" style="display:flex;gap:6px"></div>
        <button class="page-btn" data-action="paginationNext">Next ›</button>
      </div>
    </div>

    <div class="demo-grid">
      <div class="card">
        <div class="card-title">Offset vs Cursor Pagination</div>
        <table class="comparison-table">
          <thead><tr><th></th><th>Offset (<code>?page=2</code>)</th><th>Cursor (<code>?after=xyz</code>)</th></tr></thead>
          <tbody>
            <tr><td>Implementation</td><td>Simple</td><td>Complex</td></tr>
            <tr><td>Performance at scale</td><td class="con">Slow (DB scans all rows)</td><td class="pro">Fast (index seek)</td></tr>
            <tr><td>Stable pages during writes</td><td class="con">✗ Items shift</td><td class="pro">✓ Stable cursor</td></tr>
            <tr><td>Random page access</td><td class="pro">✓ Jump to any page</td><td class="con">✗ Must traverse</td></tr>
            <tr><td>Best for</td><td>Admin dashboards, small datasets</td><td>Feeds, large datasets, infinite scroll</td></tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-title">Example API Response</div>
        ${responseViewer({ status: 200, body: { content: [{ id: 1, name: 'Product A', price: 29.99 }], currentPage: 0, totalPages: 4, totalElements: 24, size: 6, hasNext: true, hasPrevious: false } })}
      </div>
    </div>

    <div class="section-heading">Try It — First Page</div>
    ${simBlock(
      'curl "/api/products?page=0&size=6&sort=name,asc"',
      'GET', '/api/products?page=0&size=6&sort=name,asc',
      {},
      null, 200,
      { content: [{ id: 8, name: 'Air Fryer', category: 'Kitchen', price: 89.99 }, { id: 5, name: 'Bluetooth Speaker', category: 'Electronics', price: 59.99 }, { id: 20, name: 'Cast Iron Pan', category: 'Kitchen', price: 44.99 }, { id: 10, name: 'Clean Code', category: 'Books', price: 34.99 }, { id: 4, name: 'Coffee Maker', category: 'Kitchen', price: 49.99 }, { id: 6, name: 'Design Patterns', category: 'Books', price: 44.99 }], currentPage: 0, totalPages: 4, totalElements: 24, size: 6, hasNext: true, hasPrevious: false }
    )}

    <div class="section-heading">Try It — Filter by Category</div>
    ${simBlock(
      'curl "/api/products?page=0&size=6&category=Electronics"',
      'GET', '/api/products?page=0&size=6&category=Electronics',
      {},
      null, 200,
      { content: [{ id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 79.99 }, { id: 5, name: 'Bluetooth Speaker', category: 'Electronics', price: 59.99 }, { id: 9, name: 'USB-C Hub', category: 'Electronics', price: 34.99 }], currentPage: 0, totalPages: 2, totalElements: 7, size: 6, hasNext: true, hasPrevious: false }
    )}`;
}

function renderProductGrid(products) {
  if (!products || products.length === 0) {
    return '<div class="text-muted text-sm">No products found.</div>';
  }
  return products.map(p => `
    <div class="product-card">
      <span class="product-category">${p.category}</span>
      <div class="product-name">${p.name}</div>
      <div class="product-price">$${p.price.toFixed(2)}</div>
      <div class="product-stock">${p.stock} in stock</div>
    </div>`).join('');
}

function renderPaginationButtons(currentPage, totalPages) {
  const container = document.getElementById('pagination-pages');
  if (!container) return;
  const count = Math.min(totalPages, 7);
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `<button class="page-btn${i === currentPage ? ' current' : ''}"
      onclick="State.paginationPage=${i};handlers.paginationLoad()">${i + 1}</button>`;
  }
  container.innerHTML = html;
}

// ── PAGE: VERSIONING ──────────────────────────────────────────
function versioningPage() {
  const v1Body = { items: [{ id: 1, name: 'Widget', price: 9.99, inStock: true }] };
  const v2Body = { items: [{ id: 1, name: 'Widget', price: { amount: 9.99, currency: 'USD' }, availability: { inStock: true, quantity: 42 } }], version: 'v2' };
  return `
    <div class="page-title">📦 API Versioning</div>
    <div class="page-sub">Four strategies for evolving APIs without breaking existing clients.</div>

    <div class="concept-box">
      When you change field names, types, or remove endpoints, existing clients break.<br>
      Versioning lets you introduce breaking changes under a new version while old clients keep working.<br>
      <strong>Breaking change example:</strong> <code>price: 9.99</code> → <code>price: {"amount": 9.99, "currency": "USD"}</code>
    </div>

    <div class="version-compare">
      <div class="card">
        <div class="card-title"><span class="version-badge version-v1">V1</span> — Original shape</div>
        ${responseViewer({ status: 200, body: v1Body }, 'GET /api/v1/items')}
        ${simBlock(
          'curl /api/v1/items\n# or: -H "X-API-Version: 1"\n# or: ?version=1\n# or: -H "Accept: application/vnd.demo.v1+json"',
          'GET', '/api/v1/items',
          { 'Accept': 'application/json' },
          null, 200,
          v1Body
        )}
      </div>
      <div class="card">
        <div class="card-title"><span class="version-badge version-v2">V2</span> — Breaking change: price is now an object</div>
        <div class="alert alert-warning text-sm">
          V1 clients parsing <code>res.price * 1.1</code> would break on V2 — <code>price</code> is now an object, not a number.
        </div>
        ${simBlock(
          'curl /api/v2/items',
          'GET', '/api/v2/items',
          { 'Accept': 'application/json' },
          null, 200,
          v2Body
        )}
      </div>
    </div>

    <div class="card">
      <div class="card-title">Strategy Comparison</div>
      <table class="comparison-table">
        <thead><tr><th>Strategy</th><th>Example</th><th>Pros</th><th>Cons</th></tr></thead>
        <tbody>
          <tr>
            <td>URI Path</td>
            <td><code>/api/v2/items</code></td>
            <td><span class="pro">✓</span> Visible, cacheable, easy to test</td>
            <td><span class="con">✗</span> Version in URL violates REST</td>
          </tr>
          <tr>
            <td>Query Param</td>
            <td><code>?version=2</code></td>
            <td><span class="pro">✓</span> Backward-compatible default</td>
            <td><span class="con">✗</span> Easy to forget, cache complications</td>
          </tr>
          <tr>
            <td>Request Header</td>
            <td><code>X-API-Version: 2</code></td>
            <td><span class="pro">✓</span> Clean URLs</td>
            <td><span class="con">✗</span> Not visible in browser, hard to bookmark</td>
          </tr>
          <tr>
            <td>Accept Header</td>
            <td><code>application/vnd.demo.v2+json</code></td>
            <td><span class="pro">✓</span> Most RESTful (content negotiation)</td>
            <td><span class="con">✗</span> Complex, hard to test manually</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card-title">Non-Breaking vs Breaking Changes</div>
      <div class="demo-grid">
        <div>
          <div class="text-sm" style="font-weight:600;color:var(--success);margin-bottom:6px">✓ Non-Breaking (additive)</div>
          <ul class="text-sm text-muted" style="padding-left:18px;line-height:2">
            <li>Adding a new optional field</li>
            <li>Adding a new endpoint</li>
            <li>Adding a new enum value</li>
            <li>Making a required field optional</li>
          </ul>
        </div>
        <div>
          <div class="text-sm" style="font-weight:600;color:var(--error);margin-bottom:6px">✗ Breaking (requires new version)</div>
          <ul class="text-sm text-muted" style="padding-left:18px;line-height:2">
            <li>Renaming or removing a field</li>
            <li>Changing a field's type</li>
            <li>Removing an endpoint</li>
            <li>Making an optional field required</li>
          </ul>
        </div>
      </div>
    </div>`;
}

// ── PAGE: ERRORS ──────────────────────────────────────────────
function errorsPage() {
  return `
    <div class="page-title">⚠️ Error Handling</div>
    <div class="page-sub">RFC 7807 Problem Details — consistent, safe, structured error responses.</div>

    <div class="concept-box">
      Good errors: <strong>correct HTTP status</strong> + <strong>consistent format</strong> + <strong>no internal details leaked</strong>.<br>
      Spring Boot 3 supports <code>ProblemDetail</code> natively.<br>
      <code>{"type":"/errors/not-found","title":"Not Found","status":404,"detail":"Product with ID 999 not found"}</code>
    </div>

    <div class="demo-grid">
      <div class="card">
        <div class="card-title">RFC 7807 Problem Detail Fields</div>
        <table class="comparison-table">
          <thead><tr><th>Field</th><th>Required</th><th>Description</th></tr></thead>
          <tbody>
            <tr><td><code>type</code></td><td class="pro">Yes</td><td>URI identifying the error type</td></tr>
            <tr><td><code>title</code></td><td class="pro">Yes</td><td>Short human-readable summary</td></tr>
            <tr><td><code>status</code></td><td class="pro">Yes</td><td>HTTP status code</td></tr>
            <tr><td><code>detail</code></td><td>No</td><td>Human-readable explanation for this specific occurrence</td></tr>
            <tr><td><code>instance</code></td><td>No</td><td>URI of the specific occurrence (useful for support)</td></tr>
            <tr><td>Custom fields</td><td>No</td><td>Anything helpful: <code>invalidParams</code>, <code>retryAfter</code></td></tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-title">Security: Never Leak Internals</div>
        <div class="alert alert-error text-sm">
          <strong>BAD:</strong> <code>PSQLException: duplicate key violates constraint on table users at jdbc:mysql://prod-db:3306</code><br>
          Reveals DB type, hostname, schema details.
        </div>
        <div class="alert alert-success text-sm">
          <strong>GOOD:</strong> <code>An account with this email already exists.</code><br>
          Client gets actionable info; internals stay server-side in logs.
        </div>
        <div class="divider"></div>
        <div class="text-sm text-muted">
          <strong>Stack traces:</strong> log them server-side; never send in response body.<br>
          <strong>SQL errors:</strong> catch at repository layer; map to domain exception.<br>
          <strong>Environment details:</strong> never expose server version, framework, or hostnames.
        </div>
      </div>
    </div>

    <div class="section-heading">Error Scenarios</div>
    ${exampleExchange('GET', '/api/errors/404?id=999', {}, null, 404,
      { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Product with ID 999 was not found', instance: '/api/products/999' }
    )}
    ${exampleExchange('POST', '/api/errors/validate', { 'Content-Type': 'application/json' }, {},
      422,
      { type: '/errors/validation-failed', title: 'Validation Failed', status: 422, invalidParams: [{ field: 'name', reason: 'must not be blank' }, { field: 'price', reason: 'must be greater than 0' }] }
    )}
    ${exampleExchange('GET', '/api/errors/500', {}, null, 500,
      { type: '/errors/internal', title: 'Internal Server Error', status: 500, detail: 'An unexpected error occurred. Please contact support.' }
    )}

    <div class="card">
      <div class="card-title">HTTP Status Code Reference</div>
      <table class="comparison-table">
        <thead><tr><th>Code</th><th>Name</th><th>When to use</th></tr></thead>
        <tbody>
          <tr><td><span class="tag tag-green">200</span></td><td>OK</td><td>Successful GET, PUT, PATCH</td></tr>
          <tr><td><span class="tag tag-green">201</span></td><td>Created</td><td>Successful POST — include <code>Location</code> header pointing to the new resource</td></tr>
          <tr><td><span class="tag tag-green">204</span></td><td>No Content</td><td>Successful DELETE or action with no response body</td></tr>
          <tr><td><span class="tag tag-red">400</span></td><td>Bad Request</td><td>Invalid input, malformed JSON, missing required fields</td></tr>
          <tr><td><span class="tag tag-red">401</span></td><td>Unauthorized</td><td>Not authenticated (no credentials or invalid credentials)</td></tr>
          <tr><td><span class="tag tag-red">403</span></td><td>Forbidden</td><td>Authenticated but not authorized for this resource</td></tr>
          <tr><td><span class="tag tag-red">404</span></td><td>Not Found</td><td>Resource doesn't exist (or hidden for security)</td></tr>
          <tr><td><span class="tag tag-red">409</span></td><td>Conflict</td><td>Duplicate, version mismatch, or state conflict</td></tr>
          <tr><td><span class="tag tag-red">422</span></td><td>Unprocessable Entity</td><td>Request understood but validation failed</td></tr>
          <tr><td><span class="tag tag-yellow">429</span></td><td>Too Many Requests</td><td>Rate limit exceeded — always include <code>Retry-After</code></td></tr>
          <tr><td><span class="tag tag-red">500</span></td><td>Internal Server Error</td><td>Unhandled server bug — log internally, return generic message</td></tr>
          <tr><td><span class="tag tag-red">503</span></td><td>Service Unavailable</td><td>Circuit open, maintenance — include <code>Retry-After</code></td></tr>
        </tbody>
      </table>
    </div>

    <div class="section-heading">Try It — 404 Not Found</div>
    ${simBlock(
      'curl /api/errors/404?id=999',
      'GET', '/api/errors/404?id=999',
      {},
      null, 404,
      { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Product with ID 999 was not found', instance: '/api/products/999' }
    )}

    <div class="section-heading">Try It — 422 Validation Failed</div>
    ${simBlock(
      'curl -X POST /api/errors/validate \\\n  -H "Content-Type: application/json" \\\n  -d \'{}\'',
      'POST', '/api/errors/validate',
      { 'Content-Type': 'application/json' },
      {},
      422,
      { type: '/errors/validation-failed', title: 'Validation Failed', status: 422, invalidParams: [{ field: 'name', reason: 'must not be blank' }, { field: 'price', reason: 'must be greater than 0' }] }
    )}

    <div class="section-heading">Try It — 500 Internal Server Error</div>
    ${simBlock(
      'curl /api/errors/500',
      'GET', '/api/errors/500',
      {},
      null, 500,
      { type: '/errors/internal', title: 'Internal Server Error', status: 500, detail: 'An unexpected error occurred. Please contact support.' }
    )}`;
}

// ── PAGE: COMMON PROBLEMS ─────────────────────────────────────
function commonProblemsPage() {
  return `
    <div class="page-title">🔧 Common API Problems</div>
    <div class="page-sub">Practical patterns for CORS, N+1 queries, idempotency, and other common pitfalls.</div>

    <div class="card">
      <div class="card-title">1. CORS (Cross-Origin Resource Sharing)</div>
      <div class="concept-box">
        Browsers block requests to a different origin (protocol + hostname + port) unless the server sends
        <code>Access-Control-Allow-Origin</code>. CORS is a <strong>browser security policy</strong> — curl and server-to-server calls are unaffected.
      </div>
      <div class="demo-grid">
        <div>
          <div class="section-heading">Common CORS Headers</div>
          <table class="cred-table">
            <tr><td><code>Access-Control-Allow-Origin</code></td><td><code>https://yourapp.com</code> or <code>*</code></td></tr>
            <tr><td><code>Access-Control-Allow-Methods</code></td><td><code>GET, POST, PUT, DELETE</code></td></tr>
            <tr><td><code>Access-Control-Allow-Headers</code></td><td><code>Authorization, Content-Type</code></td></tr>
            <tr><td><code>Access-Control-Max-Age</code></td><td><code>3600</code> (cache preflight for 1hr)</td></tr>
          </table>
        </div>
        <div>
          <div class="section-heading">Spring Boot Config</div>
          ${curlBlock('@Configuration\npublic class CorsConfig {\n  @Bean\n  public CorsFilter corsFilter() {\n    CorsConfiguration cfg = new CorsConfiguration();\n    cfg.setAllowedOrigins(List.of("https://yourapp.com"));\n    cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE"));\n    cfg.setAllowedHeaders(List.of("*"));\n    cfg.setAllowCredentials(true);\n    // ...\n  }\n}')}
        </div>
      </div>
      <div class="alert alert-warning text-sm">
        <strong>Never use <code>*</code> with <code>allowCredentials: true</code></strong> — browsers reject this combination.
        Use a specific origin allowlist in production.
      </div>
    </div>

    <div class="card">
      <div class="card-title">2. N+1 Query Problem</div>
      <div class="concept-box">
        Load N orders → then for each order, load its customer → <strong>N+1 database queries</strong> instead of 2.
        Performance collapses at scale: 100 orders = 101 queries; 10,000 orders = 10,001 queries.
      </div>
      <div class="demo-grid">
        <div>
          <div class="alert alert-error text-sm">
            <strong>BAD — N+1 queries:</strong>
          </div>
          ${curlBlock('// 1 query for orders\nList<Order> orders = orderRepo.findAll();\n// + N queries for customers\norders.forEach(o -> {\n  Customer c = customerRepo.findById(o.getCustomerId());\n  // ...\n});')}
        </div>
        <div>
          <div class="alert alert-success text-sm">
            <strong>GOOD — 2 queries total:</strong>
          </div>
          ${curlBlock('// Use JOIN FETCH in JPQL\n@Query("SELECT o FROM Order o JOIN FETCH o.customer")\nList<Order> findAllWithCustomer();\n\n// Or: Spring Data projection with @EntityGraph\n@EntityGraph(attributePaths = {"customer"})\nList<Order> findAll();')}
        </div>
      </div>
      <div class="text-sm text-muted">
        <strong>Detection:</strong> Enable SQL logging in dev (<code>spring.jpa.show-sql=true</code>) and count queries per request.
        Tools: Hibernate Statistics, Datadog APM, p6spy.
      </div>
    </div>

    <div class="card">
      <div class="card-title">3. Idempotency</div>
      <div class="concept-box">
        An operation is <strong>idempotent</strong> if applying it multiple times produces the same result as applying it once.
        Network timeouts cause clients to retry — your API must handle duplicate requests safely.
      </div>
      <table class="comparison-table">
        <thead><tr><th>Method</th><th>Idempotent?</th><th>Why</th></tr></thead>
        <tbody>
          <tr><td><code>GET</code></td><td class="pro">✓ Yes</td><td>Read-only, no side effects</td></tr>
          <tr><td><code>PUT</code></td><td class="pro">✓ Yes</td><td>Replaces the resource — same result every time</td></tr>
          <tr><td><code>DELETE</code></td><td class="pro">✓ Yes</td><td>Deleting an already-deleted resource → still "not there"</td></tr>
          <tr><td><code>POST</code></td><td class="con">✗ No (by default)</td><td>Creates a new resource each time</td></tr>
          <tr><td><code>PATCH</code></td><td class="con">✗ Depends</td><td>Idempotent if absolute values; not if incremental (+1)</td></tr>
        </tbody>
      </table>
      <div class="divider"></div>
      <div class="text-sm" style="font-weight:600;margin-bottom:8px">Making POST idempotent with an Idempotency Key</div>
      <div class="text-sm text-muted mb-8" style="margin-top:8px"><strong>First call</strong> — creates the payment:</div>
      ${simBlock(
        'curl -X POST /api/payments \\\n  -H "Idempotency-Key: pay-2024-abc123" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"amount":99.99,"currency":"USD"}\'',
        'POST', '/api/payments',
        { 'Idempotency-Key': 'pay-2024-abc123', 'Content-Type': 'application/json' },
        { amount: 99.99, currency: 'USD' },
        201,
        { paymentId: 'pmt_xyz789', amount: 99.99, currency: 'USD', status: 'completed', idempotencyKey: 'pay-2024-abc123', createdAt: '2024-01-01T10:00:00Z' }
      )}

      <div class="text-sm text-muted mb-8" style="margin-top:8px"><strong>Retry with same key</strong> — server returns the SAME response, no double-charge:</div>
      ${simBlock(
        '# Network timed out — client retries with the same key:\ncurl -X POST /api/payments \\\n  -H "Idempotency-Key: pay-2024-abc123" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"amount":99.99,"currency":"USD"}\'',
        'POST', '/api/payments',
        { 'Idempotency-Key': 'pay-2024-abc123', 'Content-Type': 'application/json', 'X-Idempotent-Replay': 'true' },
        { amount: 99.99, currency: 'USD' },
        200,
        { paymentId: 'pmt_xyz789', amount: 99.99, currency: 'USD', status: 'completed', idempotencyKey: 'pay-2024-abc123', createdAt: '2024-01-01T10:00:00Z', note: 'Idempotent replay — original response returned, no new charge' }
      )}
    </div>

    <div class="card">
      <div class="card-title">4. Security Checklist</div>
      <div class="triple-grid" style="gap:12px">
        <div>
          <div class="text-sm" style="font-weight:600;margin-bottom:6px">Input Validation</div>
          <ul class="text-sm text-muted" style="padding-left:18px;line-height:2">
            <li>Validate at the API boundary</li>
            <li>Use <code>@Valid</code> + JSR-380 annotations</li>
            <li>Whitelist allowed characters</li>
            <li>Limit string lengths</li>
            <li>Reject unknown fields</li>
          </ul>
        </div>
        <div>
          <div class="text-sm" style="font-weight:600;margin-bottom:6px">Output Safety</div>
          <ul class="text-sm text-muted" style="padding-left:18px;line-height:2">
            <li>Never return stack traces</li>
            <li>Scrub internal hostnames/IPs</li>
            <li>Use generic error messages for 500s</li>
            <li>Log details; respond generically</li>
            <li>Return 404 instead of 403 when hiding resources</li>
          </ul>
        </div>
        <div>
          <div class="text-sm" style="font-weight:600;margin-bottom:6px">Headers</div>
          <ul class="text-sm text-muted" style="padding-left:18px;line-height:2">
            <li><code>X-Content-Type-Options: nosniff</code></li>
            <li><code>X-Frame-Options: DENY</code></li>
            <li><code>Strict-Transport-Security</code> (HSTS)</li>
            <li>Remove <code>X-Powered-By</code> header</li>
            <li><code>Content-Security-Policy</code> for web</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">5. API Design Checklist</div>
      <div class="demo-grid">
        <ul class="text-sm" style="padding-left:18px;line-height:2.2">
          <li>Use nouns for resources, not verbs (<code>/orders</code> not <code>/getOrders</code>)</li>
          <li>Use HTTP methods correctly (GET=read, POST=create, PUT=replace, PATCH=update, DELETE=remove)</li>
          <li>Return correct status codes (201 for create, 204 for delete)</li>
          <li>Use plural resource names (<code>/products</code> not <code>/product</code>)</li>
          <li>Nest resources sparingly — max 2 levels deep</li>
          <li>Version your API from day one</li>
        </ul>
        <ul class="text-sm" style="padding-left:18px;line-height:2.2">
          <li>Always paginate list endpoints</li>
          <li>Return <code>Location</code> header on 201 Created</li>
          <li>Use ISO 8601 for dates (<code>2024-01-15T10:30:00Z</code>)</li>
          <li>Use snake_case or camelCase consistently</li>
          <li>Document with OpenAPI / Swagger</li>
          <li>Provide a sandbox / test environment</li>
        </ul>
      </div>
    </div>`;
}

// ── PAGE: WRITE OPERATIONS ────────────────────────────────────
function writeOpsPage() {
  return `
    <div class="page-title">✏️ Write Operations & Error Design</div>
    <div class="page-sub">POST, PUT, PATCH, DELETE — architectural decisions, failure modes, and what clients should do.</div>

    <div class="concept-box">
      <strong>Core principle:</strong> The HTTP status code IS the error notification — clients must read and act on it.
      Always return the updated resource in the body (200/201) so clients never need a follow-up GET to confirm success.
      The key question is not "did it work?" but "is it safe to retry if I don't know?"
    </div>

    <div class="card">
      <div class="card-title">Method Semantics at a Glance</div>
      <table class="comparison-table">
        <thead>
          <tr><th>Method</th><th>Purpose</th><th>Idempotent?</th><th>Success code</th><th>Response body</th><th>Safe to retry on timeout?</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="tag tag-blue">POST</span></td>
            <td>Create new resource</td><td>No</td><td>201 Created</td><td>Return the created resource</td><td>Only with Idempotency-Key</td>
          </tr>
          <tr>
            <td><span class="tag tag-green">PUT</span></td>
            <td>Full replace (all fields)</td><td>Yes</td><td>200 OK</td><td>Return the updated resource</td><td>Yes — same result every time</td>
          </tr>
          <tr>
            <td><span class="tag tag-green">PATCH</span></td>
            <td>Partial update (only sent fields)</td><td>Usually yes*</td><td>200 OK</td><td>Return the updated resource</td><td>Yes for "set", No for "increment"</td>
          </tr>
          <tr>
            <td><span class="tag tag-red">DELETE</span></td>
            <td>Remove resource</td><td>Yes</td><td>204 No Content</td><td>No body</td><td>Yes — 404 on retry means it already worked</td>
          </tr>
        </tbody>
      </table>
      <div class="text-muted text-sm" style="margin-top:8px">
        * PATCH "set name to X" is idempotent. PATCH "add 10 to stock" is <em>not</em> — retrying doubles the increment.
      </div>
    </div>

    <div class="demo-grid">

      <div class="card">
        <div class="card-title">POST — Create</div>
        <div class="alert alert-info text-sm" style="margin-bottom:12px">
          <strong>Not idempotent.</strong> Two identical POSTs create two resources (without an Idempotency-Key).
          On success, the <code>Location</code> header and response body give you the new resource — no extra GET needed.
        </div>
        <div class="form-row">
          <label class="form-label">Name</label>
          <input class="form-input" id="wo-name" placeholder="e.g. Widget Pro" value="Widget Pro">
        </div>
        <div class="form-row">
          <label class="form-label">Price</label>
          <input class="form-input" id="wo-price" placeholder="e.g. 29.99" value="29.99">
        </div>
        <div class="form-row">
          <label class="form-label">Category</label>
          <select class="form-select" id="wo-category">
            <option value="Electronics">Electronics</option>
            <option value="Books">Books</option>
            <option value="Clothing">Clothing</option>
            <option value="Sports">Sports</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Toys">Toys</option>
          </select>
        </div>
        <div class="form-row">
          <label class="form-label">Stock</label>
          <input class="form-input" id="wo-stock" placeholder="e.g. 50" value="50">
        </div>
        <div class="btn-group" style="flex-direction:column;gap:8px;margin-top:12px">
          <button class="btn btn-primary" data-action="woPost">POST valid data → 201 Created + Location</button>
          <button class="btn btn-secondary" data-action="woPostInvalid">POST empty body → 422 Validation Failed</button>
          <button class="btn btn-secondary" data-action="woPostDuplicate">POST duplicate "iPhone 15" → 409 Conflict</button>
        </div>
        <div class="concept-box text-sm" style="margin-top:14px">
          <strong>422</strong> → Fix the request. Do not retry the same body.<br>
          <strong>409</strong> → Already exists. GET it, or PUT to update it.<br>
          <strong>201</strong> → ID auto-fills below so you can immediately PUT/PATCH/DELETE it.
        </div>
      </div>

      <div class="card">
        <div class="card-title">PUT / PATCH / DELETE — Modify</div>
        <div class="alert alert-info text-sm" style="margin-bottom:12px">
          <strong>All idempotent</strong> (for "set" operations). Safe to retry on timeout.
          Response body (200) always contains the current state — no follow-up GET required.
        </div>
        <div class="form-row">
          <label class="form-label">Product ID</label>
          <input class="form-input" id="wo-id" placeholder="ID from POST above" style="font-weight:600">
        </div>
        <div class="concept-box text-sm" style="margin-bottom:10px">
          <strong>PUT requires all fields</strong> (full replace). <strong>PATCH only sends what changes</strong> — leave name/price blank to skip them.
        </div>
        <div class="btn-group" style="flex-direction:column;gap:8px">
          <button class="btn btn-primary" data-action="woPut">PUT (full replace) → 200 OK</button>
          <button class="btn btn-secondary" data-action="woPutMissing">PUT to missing ID 99999 → 404 Not Found</button>
          <button class="btn btn-primary" data-action="woPatch">PATCH (partial — only name/price) → 200 OK</button>
          <button class="btn btn-danger" data-action="woDelete">DELETE → 204 No Content</button>
          <button class="btn btn-secondary" data-action="woDeleteMissing">DELETE missing ID 99999 → 404 Not Found</button>
        </div>
        <div class="concept-box text-sm" style="margin-top:14px">
          <strong>PUT timeout?</strong> Retry freely — same body = same result.<br>
          <strong>PATCH "set" timeout?</strong> Retry freely.<br>
          <strong>DELETE timeout?</strong> Retry — a 404 on retry means it already worked.<br>
          <strong>After DELETE</strong> the ID field clears; POST again to create a new product.
        </div>
      </div>
    </div>

    <div class="http-exchange">
      <div id="wo-request">${requestViewer(null)}</div>
      <div id="wo-response">${responseViewer(null)}</div>
    </div>

    <div style="margin-top:32px">
      <div class="card-title" style="font-size:1.1rem;margin-bottom:4px">POST Strategies: Insert vs Upsert vs Merge</div>
      <div class="page-sub" style="margin-bottom:16px">Three different things POST can do — each with different trade-offs.</div>

      <div class="card" style="margin-bottom:16px">
        <div class="card-title">Strategy Comparison</div>
        <table class="comparison-table">
          <thead>
            <tr><th>Strategy</th><th>If resource exists</th><th>If resource missing</th><th>Idempotent?</th><th>409 possible?</th><th>Best for</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>POST + Insert</strong><br><code style="font-size:11px">POST /api/products</code></td>
              <td><span class="tag tag-red">409 Conflict</span> — fail loudly</td>
              <td><span class="tag tag-green">201 Created</span></td>
              <td>No — always needs Idempotency-Key</td><td>Yes</td>
              <td>Strict create-only; audit trail; user-facing forms</td>
            </tr>
            <tr>
              <td><strong>POST + Upsert</strong><br><code style="font-size:11px">POST /api/products/upsert</code></td>
              <td><span class="tag tag-green">200 OK</span> — full replace</td>
              <td><span class="tag tag-green">201 Created</span></td>
              <td>Yes — safe to retry</td><td>No</td>
              <td>Sync jobs; config management; bulk import</td>
            </tr>
            <tr>
              <td><strong>POST + Merge</strong><br><code style="font-size:11px">POST /api/products/merge</code></td>
              <td><span class="tag tag-green">200 OK</span> — patch in place</td>
              <td><span class="tag tag-green">201 Created</span></td>
              <td>Yes (for set ops)</td><td>No</td>
              <td>Event-driven pipelines; partial ownership; incremental sync</td>
            </tr>
          </tbody>
        </table>
        <div class="text-muted text-sm" style="margin-top:8px">
          All three use <strong>name</strong> as the natural key for upsert/merge (no ID needed). Insert uses server-assigned ID.
        </div>
      </div>

      <div class="demo-grid">
        <div class="card">
          <div class="card-title">Upsert Demo</div>
          <div class="concept-box text-sm" style="margin-bottom:12px">
            <strong>Upsert = create or replace.</strong> The client doesn't need to know if the resource exists.
            Same call, same body, always converges to the same state.<br><br>
            <strong>Key trade-off:</strong> silently overwrites. No 409 means stale clients can overwrite newer data with no warning.
          </div>
          <div class="btn-group" style="flex-direction:column;gap:8px">
            <button class="btn btn-primary" data-action="woUpsertExisting">Upsert "iPhone 15" (exists) → 200 full replace</button>
            <button class="btn btn-primary" data-action="woUpsertNew">Upsert new unique name → 201 Created</button>
          </div>
          <div class="concept-box text-sm" style="margin-top:12px">
            <strong>Advantages</strong>
            <ul style="margin:6px 0 0 16px;line-height:1.8">
              <li>Idempotent — retry on timeout is always safe</li>
              <li>No client-side existence check needed</li>
              <li>Natural for sync: "make the server match this state"</li>
            </ul>
            <strong style="margin-top:8px;display:block">Disadvantages</strong>
            <ul style="margin:6px 0 0 16px;line-height:1.8">
              <li>Silently overwrites — stale data can overwrite fresh data</li>
              <li>No 409 signal — duplicate-name bugs go undetected</li>
              <li>Audit trail blurred — can't distinguish first-create from re-sync</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Merge Demo</div>
          <div class="concept-box text-sm" style="margin-bottom:12px">
            <strong>Merge = create or patch.</strong> Only the fields you send are applied.
            Omitted fields are untouched — each service can own a different subset of fields.<br><br>
            <strong>Key trade-off:</strong> can't explicitly null a field. Omitting price means "leave it alone", not "set it to null".
          </div>
          <div class="btn-group" style="flex-direction:column;gap:8px">
            <button class="btn btn-primary" data-action="woMergeExisting">Merge price+stock into "iPhone 15" → 200 (name/category unchanged)</button>
            <button class="btn btn-primary" data-action="woMergeNew">Merge new product (all fields) → 201 Created</button>
            <button class="btn btn-secondary" data-action="woMergeMissingRequired">Merge new product, missing price → 422</button>
          </div>
          <div class="concept-box text-sm" style="margin-top:12px">
            <strong>Advantages</strong>
            <ul style="margin:6px 0 0 16px;line-height:1.8">
              <li>Services can own different fields without stepping on each other</li>
              <li>Small payloads: only send what changed</li>
              <li>Event-driven: each event is "apply this change"</li>
            </ul>
            <strong style="margin-top:8px;display:block">Disadvantages</strong>
            <ul style="margin:6px 0 0 16px;line-height:1.8">
              <li>Intentional null is impossible (omit = leave alone)</li>
              <li>Dual-mode validation: required fields differ for create vs update</li>
              <li>Field ownership conflicts still possible on shared fields</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="http-exchange" style="margin-top:16px">
        <div id="strategy-request">${requestViewer(null)}</div>
        <div id="strategy-response">${responseViewer(null)}</div>
      </div>

      <div class="demo-grid" style="margin-top:16px">
        <div class="card">
          <div class="card-title">When to Choose Insert (strict POST)</div>
          <ul class="text-sm" style="margin:8px 0 0 16px;line-height:1.9">
            <li>User submits a form — they expect to know if a duplicate exists</li>
            <li>You need a clear create event for auditing / event sourcing</li>
            <li>Duplicate names are a real bug that should surface as an error</li>
            <li>Financial records, orders, invoices — accidental overwrites are dangerous</li>
          </ul>
          <div class="alert alert-error text-sm" style="margin-top:10px">
            <strong>Use Idempotency-Key</strong> to make POST + Insert safe to retry. Without it, a network timeout can create duplicates.
          </div>
        </div>

        <div class="card">
          <div class="card-title">When to Choose Upsert</div>
          <ul class="text-sm" style="margin:8px 0 0 16px;line-height:1.9">
            <li>Sync / reconciliation job: "make the server match this snapshot"</li>
            <li>Config management: "ensure this setting has this value"</li>
            <li>Bulk operations: sending 1000 records, can't check each one first</li>
            <li>The client always has the full current state it wants to apply</li>
          </ul>
          <div class="alert alert-info text-sm" style="margin-top:10px">
            Consider adding <strong>a version field</strong> so the server can reject upserts older than the current data.
          </div>
        </div>

        <div class="card">
          <div class="card-title">When to Choose Merge</div>
          <ul class="text-sm" style="margin:8px 0 0 16px;line-height:1.9">
            <li>Multiple services co-own different fields on the same resource</li>
            <li>Event-driven: each event applies one kind of change ("price updated")</li>
            <li>Mobile / low-bandwidth: only send the delta, not the full resource</li>
            <li>Progressive data collection: fill in fields as they become available</li>
          </ul>
          <div class="alert alert-info text-sm" style="margin-top:10px">
            If you need to <strong>clear a field</strong> to null, merge can't do it. Use a full PUT or a dedicated "clear" endpoint.
          </div>
        </div>

        <div class="card">
          <div class="card-title">Stale-Write Problem (All Three)</div>
          <p class="text-sm">All write strategies share one vulnerability: a client with stale data can overwrite newer data.</p>
          <table class="comparison-table" style="margin-top:10px">
            <thead><tr><th>Strategy</th><th>Protection</th></tr></thead>
            <tbody>
              <tr><td>Insert</td><td>409 fires if it already exists — but gives no version info</td></tr>
              <tr><td>Upsert</td><td>No protection — last writer wins unconditionally</td></tr>
              <tr><td>Merge</td><td>No protection on shared fields — last writer wins</td></tr>
            </tbody>
          </table>
          <p class="text-sm" style="margin-top:10px"><strong>Solution: optimistic locking.</strong> Add a <code>version</code> field. Client sends the version it last read; server rejects if version has moved on → <strong>409 Conflict</strong>.</p>
          <pre class="concept-box text-sm" style="white-space:pre-wrap;margin-top:8px">POST /api/products/upsert
{ "name": "iPhone 15", "price": 799.99, "version": 3 }

→ current version still 3: apply + increment to 4
→ current version is 4+: 409 Conflict ("version mismatch")</pre>
        </div>
      </div>
    </div>

    <div style="margin-top:32px">
      <div class="card-title" style="font-size:1.1rem;margin-bottom:16px">Architectural Decision Guide</div>
      <div class="demo-grid">
        <div class="card">
          <div class="card-title">When POST (Insert) Fails</div>
          <table class="comparison-table">
            <thead><tr><th>Status</th><th>Meaning</th><th>Client should</th></tr></thead>
            <tbody>
              <tr><td><span class="tag tag-red">422</span></td><td>Validation failed</td><td>Show <code>fieldErrors</code>. Fix and resubmit. Do not retry the same body.</td></tr>
              <tr><td><span class="tag tag-red">409</span></td><td>Already exists</td><td>Decide: GET the existing resource? PUT to update it? Show "already exists" to user.</td></tr>
              <tr><td><span class="tag tag-red">400</span></td><td>Malformed request</td><td>Fix the request structure (bad JSON, wrong Content-Type). Do not retry.</td></tr>
              <tr><td><span class="tag tag-red">500</span></td><td>Server error</td><td>Retry with backoff. <strong>Risk:</strong> insert may have already succeeded — check for the resource first, or use an Idempotency-Key.</td></tr>
              <tr><td><span class="tag tag-yellow">timeout</span></td><td>Outcome unknown</td><td>Do not blindly retry. GET first to see if the resource was created. If not, retry with an Idempotency-Key.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <div class="card-title">When PUT / PATCH (Update) Fails</div>
          <table class="comparison-table">
            <thead><tr><th>Status</th><th>Meaning</th><th>Client should</th></tr></thead>
            <tbody>
              <tr><td><span class="tag tag-red">404</span></td><td>Resource deleted</td><td>Decide: re-create via POST? Show "no longer exists" to user?</td></tr>
              <tr><td><span class="tag tag-red">409</span></td><td>Name conflict or optimistic lock mismatch</td><td>GET the fresh resource, re-apply changes, retry PUT with updated version/name.</td></tr>
              <tr><td><span class="tag tag-red">422</span></td><td>Validation failed</td><td>Show <code>fieldErrors</code>. Fix and resubmit.</td></tr>
              <tr><td><span class="tag tag-yellow">timeout (PUT)</span></td><td>Outcome unknown</td><td>Retry freely — PUT is idempotent. Same body produces same result.</td></tr>
              <tr><td><span class="tag tag-yellow">timeout (PATCH "set")</span></td><td>Outcome unknown</td><td>Retry freely — "set" operations are idempotent.</td></tr>
              <tr><td><span class="tag tag-yellow">timeout (PATCH "increment")</span></td><td>Outcome unknown</td><td>GET first. If the increment already applied, skip. Otherwise retry with an Idempotency-Key.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <div class="card-title">Idempotency Keys — Safe POST Retries</div>
          <p class="text-sm">POST is the only method that can create duplicates on retry. An <strong>Idempotency-Key</strong> header solves this:</p>
          <pre class="concept-box text-sm" style="white-space:pre-wrap;margin:10px 0">POST /api/products
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{ "name": "Widget Pro", "price": 29.99 }</pre>
          <p class="text-sm">The server:</p>
          <ol class="text-sm" style="margin:8px 0 0 16px;line-height:1.8">
            <li>Checks if this key was seen before</li>
            <li>If yes → return the stored response (no DB write)</li>
            <li>If no → execute normally, store result keyed by the UUID</li>
          </ol>
          <div class="alert alert-info text-sm" style="margin-top:10px">
            <strong>Rule of thumb:</strong> Generate the UUID before the first attempt. Reuse it on every retry for the same operation until you get a definitive response.
          </div>
        </div>

        <div class="card">
          <div class="card-title">Do I Need a GET After PUT/PATCH?</div>
          <div class="alert alert-success text-sm">
            <strong>No.</strong> If your API returns the full resource on 200, the response body IS the current state.
          </div>
          <table class="comparison-table" style="margin-top:12px">
            <thead><tr><th>Pattern</th><th>Round trips</th><th>Verdict</th></tr></thead>
            <tbody>
              <tr><td>PUT → 200 (full body)</td><td>1</td><td><span class="tag tag-green">Best</span></td></tr>
              <tr><td>PUT → 204 (no body) → GET</td><td>2</td><td><span class="tag tag-yellow">Avoid</span></td></tr>
              <tr><td>PUT → 200 (empty {}) → GET</td><td>2</td><td><span class="tag tag-red">Wrong</span></td></tr>
            </tbody>
          </table>
          <p class="text-sm" style="margin-top:12px"><strong>Exception:</strong> If the server applies side effects (computed fields, timestamps, version increments), always return the post-write state so clients see exactly what was stored.</p>
        </div>
      </div>
    </div>`;
}

// ── DOM HELPERS ───────────────────────────────────────────────
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}
function setHtml(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
