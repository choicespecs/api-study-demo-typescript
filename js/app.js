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

// ── COPY CLIPS ────────────────────────────────────────────────
let _clipIdx = 0;
const _clips = {};

// ── STATE ────────────────────────────────────────────────────
const State = {
  page: 'home',
  rateBuckets:    { standard: 20, strict: 5, tiered: 10 },
  rateBucketMax:  { standard: 20, strict: 5, tiered: 10 },
  cbFailures: 0, cbSuccesses: 0, cbState: 'CLOSED', cbLog: [],
  paginationPage: 0, paginationSize: 6,
  paginationCategory: '', paginationSearch: '',
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
    </div>

    <div class="card">
      <div class="card-title">🔑 Demo Credentials (for the Java backend)</div>
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
      <div class="card-title">🚀 Quick Start (Java Backend)</div>
      <div class="text-sm text-muted" style="margin-bottom:12px">Run the Spring Boot backend to make the curl examples live:</div>
      ${curlBlock('git clone https://github.com/christophermlee2/java-api-study-demo\ncd java-api-study-demo\nmvn spring-boot:run\n# Then visit http://localhost:8080')}
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
    ${curlBlock('curl -X POST http://localhost:8080/api/auth/login \\\n  -H "Content-Type: application/json" \\\n  -d \'{"username":"user","password":"password"}\'')}
    ${exampleExchange('POST', '/api/auth/login',
      { 'Content-Type': 'application/json' },
      { username: 'user', password: '●●●●●●●●' },
      200,
      { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIi4uLn0.sig', refreshToken: 'eyJhbGci...', tokenType: 'Bearer', expiresIn: 900 }
    )}

    <div class="section-heading">Try It — Step 2: Call a Protected Endpoint</div>
    ${curlBlock('curl http://localhost:8080/api/jwt/protected \\\n  -H "Authorization: Bearer <accessToken>"')}
    ${exampleExchange('GET', '/api/jwt/protected',
      { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…' },
      null,
      200,
      { message: 'You accessed a JWT-protected endpoint', user: 'user', roles: ['ROLE_USER'] }
    )}

    <div class="section-heading">Try It — Step 3: Refresh Token</div>
    ${curlBlock('curl -X POST http://localhost:8080/api/auth/refresh \\\n  -H "Content-Type: application/json" \\\n  -d \'{"refreshToken":"<refreshToken>"}\'')}`;
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

    <div class="section-heading">Try It — Any Role Endpoint</div>
    ${curlBlock('curl http://localhost:8080/api/basic/protected \\\n  -H "Authorization: Basic $(echo -n user:password | base64)"')}
    ${exampleExchange('GET', '/api/basic/protected',
      { Authorization: 'Basic dXNlcjpwYXNzd29yZA==' },
      null, 200,
      { message: 'Basic auth successful', user: 'user', roles: ['ROLE_USER'] }
    )}

    <div class="section-heading">Try It — Admin Only (403 with user)</div>
    ${curlBlock('curl http://localhost:8080/api/basic/admin \\\n  -H "Authorization: Basic $(echo -n user:password | base64)"')}
    ${exampleExchange('GET', '/api/basic/admin',
      { Authorization: 'Basic dXNlcjpwYXNzd29yZA==' },
      null, 403,
      { type: '/errors/forbidden', title: 'Forbidden', status: 403, detail: 'Access denied — ADMIN role required' }
    )}

    <div class="section-heading">Try It — Wrong Password (401)</div>
    ${curlBlock('curl http://localhost:8080/api/basic/protected \\\n  -H "Authorization: Basic $(echo -n user:wrongpassword | base64)"')}`;
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

    <div class="section-heading">Try It — User Key</div>
    ${curlBlock('curl http://localhost:8080/api/apikey/data \\\n  -H "X-API-Key: demo-api-key-user-12345"')}
    ${exampleExchange('GET', '/api/apikey/data',
      { 'X-API-Key': 'demo-api-key-user-12345' },
      null, 200,
      { message: 'API key authenticated', keyId: 'key-user-001', owner: 'user@example.com', roles: ['USER'] }
    )}

    <div class="section-heading">Try It — Admin Key</div>
    ${curlBlock('curl http://localhost:8080/api/apikey/admin \\\n  -H "X-API-Key: demo-api-key-admin-12345"')}

    <div class="section-heading">Try It — Expired Key (401)</div>
    ${curlBlock('curl http://localhost:8080/api/apikey/data \\\n  -H "X-API-Key: demo-api-key-expired-12345"')}
    ${exampleExchange('GET', '/api/apikey/data',
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
    ${curlBlock('# Step 1: Get a token\ncurl -X POST http://localhost:8080/oauth2/token \\\n  -H "Authorization: Basic $(echo -n machine-client:machine-secret | base64)" \\\n  -H "Content-Type: application/x-www-form-urlencoded" \\\n  -d "grant_type=client_credentials&scope=read"')}
    ${exampleExchange('POST', '/oauth2/token',
      { Authorization: 'Basic bWFjaGluZS1jbGllbnQ6bWFjaGluZS1zZWNyZXQ=', 'Content-Type': 'application/x-www-form-urlencoded' },
      'grant_type=client_credentials&scope=read',
      200,
      { access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...', token_type: 'Bearer', expires_in: 300, scope: 'read' }
    )}
    ${curlBlock('# Step 2: Call the resource server with the token\ncurl http://localhost:8080/api/oauth/data \\\n  -H "Authorization: Bearer <access_token>"')}

    <div class="section-heading">Flow 2 — Authorization Code (User Login)</div>
    ${curlBlock('# Step 1: Redirect user to authorization endpoint\nGET http://localhost:8080/oauth2/authorize\n  ?client_id=web-client\n  &response_type=code\n  &redirect_uri=http://localhost:8080/api/oauth/callback\n  &scope=openid+read\n\n# Step 2: User logs in and approves\n# Browser redirects to: /api/oauth/callback?code=AUTH_CODE\n\n# Step 3: Exchange code for tokens\ncurl -X POST http://localhost:8080/oauth2/token \\\n  -H "Authorization: Basic $(echo -n web-client:web-secret | base64)" \\\n  -H "Content-Type: application/x-www-form-urlencoded" \\\n  -d "grant_type=authorization_code&code=AUTH_CODE&redirect_uri=http://localhost:8080/api/oauth/callback"')}

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
    ${curlBlock('# Login as viewer to get a token\nVIEWER_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \\\n  -H "Content-Type: application/json" \\\n  -d \'{"username":"viewer","password":"password"}\' | jq -r .accessToken)\n\n# Try to access user-level endpoint\ncurl http://localhost:8080/api/rbac/user \\\n  -H "Authorization: Bearer $VIEWER_TOKEN"')}
    ${exampleExchange('GET', '/api/rbac/user',
      { Authorization: 'Bearer eyJhbGci... (viewer token)' },
      null, 403,
      { type: '/errors/forbidden', title: 'Forbidden', status: 403, detail: 'Access denied — USER role required' }
    )}

    <div class="section-heading">Try It — Admin accessing any endpoint (200)</div>
    ${curlBlock('ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \\\n  -H "Content-Type: application/json" \\\n  -d \'{"username":"admin","password":"password"}\' | jq -r .accessToken)\n\ncurl http://localhost:8080/api/rbac/admin \\\n  -H "Authorization: Bearer $ADMIN_TOKEN"')}`;
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

    <div class="section-heading">Try It — Trigger a 429</div>
    ${curlBlock('# Hit the strict endpoint 6 times to exhaust the 5-token bucket\nfor i in {1..6}; do\n  echo "Request $i:"\n  curl -s -o /dev/null -w "%{http_code}\\n" http://localhost:8080/api/rate/strict\ndone')}`;
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

    <div class="section-heading">Try It — Against the Java Backend</div>
    ${curlBlock('# Send success requests\ncurl http://localhost:8080/api/timeout/unreliable?fail=false\n\n# Send failure requests (opens circuit after 5+ at 50% failure rate)\ncurl http://localhost:8080/api/timeout/unreliable?fail=true\n\n# Check circuit breaker state via Actuator\ncurl http://localhost:8080/actuator/circuitbreakers')}`;
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
        ${curlBlock('# This will hang for 5 seconds — holding a thread\ncurl http://localhost:8080/api/hanging/no-timeout?delay=5')}
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
        ${curlBlock('# delay=8 but deadline=3 → responds in 3s with 504\ncurl "http://localhost:8080/api/hanging/with-deadline?delay=8&deadline=3"')}
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
        ${curlBlock('curl "http://localhost:8080/api/hanging/http-client?delay=8&timeout=3"')}
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
        ${curlBlock('# Send a valid signed webhook\ncurl -X POST http://localhost:8080/api/third-party/webhook/send-test \\\n  -H "Content-Type: application/json" \\\n  -d \'{"tamper":false,"replay_attack":false,"type":"payment.completed"}\'\n\n# Send a tampered payload (signature will fail)\ncurl -X POST http://localhost:8080/api/third-party/webhook/send-test \\\n  -H "Content-Type: application/json" \\\n  -d \'{"tamper":true,"replay_attack":false,"type":"payment.completed"}\'')}
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

    <div class="demo-grid">
      <div class="card">
        <div class="card-title">Partner Tiers & Scopes</div>
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

    <div class="section-heading">Try It — Partner Auth Info</div>
    ${curlBlock('# PREMIUM partner (Alpha)\ncurl http://localhost:8080/api/partner/auth-info \\\n  -H "X-Partner-Key: partner-alpha-key-12345"\n\n# FREE partner (Gamma) — fewer scopes\ncurl http://localhost:8080/api/partner/auth-info \\\n  -H "X-Partner-Key: partner-gamma-key-12345"')}
    ${exampleExchange('GET', '/api/partner/auth-info',
      { 'X-Partner-Key': 'partner-alpha-key-12345' },
      null, 200,
      { partnerId: 'alpha-corp', organizationName: 'Alpha Corp', tier: 'PREMIUM', scopes: ['catalog:read', 'orders:read', 'orders:write', 'catalog:write', 'analytics:read'], rateLimit: 10000 }
    )}

    <div class="section-heading">Try It — Audit Log (PREMIUM only)</div>
    ${curlBlock('# Works for Alpha (has analytics:read)\ncurl http://localhost:8080/api/partner/audit \\\n  -H "X-Partner-Key: partner-alpha-key-12345"\n\n# Fails for Gamma (no analytics:read scope)\ncurl http://localhost:8080/api/partner/audit \\\n  -H "X-Partner-Key: partner-gamma-key-12345"')}
    ${exampleExchange('GET', '/api/partner/audit',
      { 'X-Partner-Key': 'partner-gamma-key-12345' },
      null, 403,
      { type: '/errors/forbidden', title: 'Forbidden', status: 403, detail: 'Insufficient scope — analytics:read required', requiredScope: 'analytics:read', partnerTier: 'FREE' }
    )}

    <div class="card">
      <div class="card-title">Partner Onboarding Checklist</div>
      <div class="triple-grid" style="gap:12px">
        <div>
          <div class="text-sm" style="font-weight:600;margin-bottom:6px">Authentication</div>
          <ul class="text-sm text-muted" style="padding-left:18px;line-height:2">
            <li>Issue per-partner API keys (not shared)</li>
            <li>Hash keys in DB — never store plaintext</li>
            <li>Support 2 active keys per partner (rotation)</li>
            <li>Alert ops on sustained 401s from a partner</li>
          </ul>
        </div>
        <div>
          <div class="text-sm" style="font-weight:600;margin-bottom:6px">Data &amp; Access</div>
          <ul class="text-sm text-muted" style="padding-left:18px;line-height:2">
            <li>Enforce tenant isolation on every query</li>
            <li>Assign scopes at provisioning, not per-request</li>
            <li>Provide a sandbox with test data</li>
            <li>Separate prod and sandbox keys</li>
          </ul>
        </div>
        <div>
          <div class="text-sm" style="font-weight:600;margin-bottom:6px">Contracts &amp; Reliability</div>
          <ul class="text-sm text-muted" style="padding-left:18px;line-height:2">
            <li>Deprecation header on every old-version response</li>
            <li>Sunset date ≥ 6 months out (12 for enterprise)</li>
            <li>Sign outbound webhooks with per-partner secret</li>
            <li>Retry delivery with exponential backoff</li>
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

    <div class="section-heading">Try It — Against the Java Backend</div>
    ${curlBlock('# First page\ncurl "http://localhost:8080/api/products?page=0&size=6&sort=name,asc"\n\n# Filter by category\ncurl "http://localhost:8080/api/products?page=0&size=6&category=Electronics"\n\n# Search\ncurl "http://localhost:8080/api/products?page=0&size=6&search=keyboard"')}`;
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
        ${curlBlock('curl http://localhost:8080/api/v1/items\n# or with header: -H "X-API-Version: 1"\n# or with query:  ?version=1\n# or with Accept: application/vnd.demo.v1+json')}
      </div>
      <div class="card">
        <div class="card-title"><span class="version-badge version-v2">V2</span> — Breaking change: price is now an object</div>
        ${responseViewer({ status: 200, body: v2Body }, 'GET /api/v2/items')}
        <div class="alert alert-warning text-sm mt-8">
          V1 clients parsing <code>res.price * 1.1</code> would break on V2 — <code>price</code> is now an object, not a number.
        </div>
        ${curlBlock('curl http://localhost:8080/api/v2/items')}
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

    <div class="section-heading">Try It</div>
    ${curlBlock('# 404 Not Found\ncurl http://localhost:8080/api/errors/404?id=999\n\n# 422 Validation Error\ncurl -X POST http://localhost:8080/api/errors/validate \\\n  -H "Content-Type: application/json" \\\n  -d \'{}\'\n\n# 403 Forbidden — user trying to access admin endpoint\ncurl http://localhost:8080/api/basic/admin \\\n  -H "Authorization: Basic $(echo -n user:password | base64)"')}`;
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
      ${curlBlock('# Client generates a unique key per logical operation\ncurl -X POST http://localhost:8080/api/payments \\\n  -H "Idempotency-Key: pay-2024-abc123" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"amount":99.99,"currency":"USD"}\'\n\n# If the request times out and client retries with the same key,\n# server returns the SAME response as the first call — no double-charge.')}
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
