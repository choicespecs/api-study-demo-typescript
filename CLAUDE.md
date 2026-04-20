# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A static GitHub Pages site that serves as an **interactive** reference guide for REST API concepts. It's a port of [java-api-study-demo](https://github.com/christophermlee2/java-api-study-demo) — same topics and educational content, but **no backend required**. All API calls are simulated in the browser.

The site is purely for study purposes — it teaches REST API concepts (auth, rate limiting, circuit breakers, etc.) through interactive request/response demonstrations, not a real running server.

## Structure

```
/
├── index.html                        # App shell: sidebar + main content area
├── css/app.css                       # Design system (tokens, layout, components)
├── js/app.js                         # All routing, pages, and simulations in one file
├── .nojekyll                         # Tells GitHub Pages not to use Jekyll
└── .github/workflows/deploy.yml     # GitHub Actions → GitHub Pages deployment
```

## Architecture

**Single-file SPA** with hash-based routing (`#auth-jwt`, `#rate-limit`, etc.). No build step, no npm, no dependencies.

`js/app.js` is organized into sections (in order):

1. **Mock data** — 24 products (`MOCK_PRODUCTS`) for the pagination demo
2. **Demo JWT** — a pre-built JWT (`DEMO_JWT`) for the decoder
3. **Copy clips & sim registry** — `_clips` for copy buttons, `_sims` for simulation data
4. **State** — global `State` object: rate bucket tokens, circuit breaker state, pagination position
5. **Utilities** — `syntaxHighlight()`, `escHtml()`, `statusBadge()`
6. **Display helpers** — `responseViewer()`, `requestViewer()`, `curlBlock()`, `exampleExchange()`
7. **Simulation block** — `simBlock()` + `window._runSim()` (see below)
8. **JWT utilities** — `parseJwt()` / `jwtVisualizer()`
9. **Token meter** — `tokenMeter()` for rate limit visualizations
10. **Router** — `navigate(page)`, hash-change listener, `render()`
11. **Handlers** — `handlers` object: `rateSend`, `rateRapidFire`, `rateReset`, `cbSend`, `cbReset`, `paginationLoad`, `paginationFilter`, `paginationPrev`, `paginationNext`, `jwtDecode`, `jwtUseDemoToken`
12. **Page functions** — one function per topic returning an HTML string
13. **DOM helpers** — `val(id)`, `setHtml(id, html)`, `sleep(ms)`

## Interactive Simulation System

Every "Try It" section uses `simBlock()` instead of static curl examples. There is **no real HTTP request** — everything is mocked.

### `simBlock(curlCmd, method, url, reqHeaders, reqBody, status, respBody, opts)`

Renders a shell block with **▶ Run** and **Copy** buttons. Clicking Run:
1. Shows the request viewer immediately
2. Displays a pulsing "Sending request…" state
3. After `opts.delay` ms (default 450), replaces with the full request + response exchange

```js
simBlock(
  'curl /api/auth/login \\\n  -d \'{"username":"user"}\'',  // curl command shown in shell block
  'POST', '/api/auth/login',                                 // method + URL for requestViewer
  { 'Content-Type': 'application/json' },                   // request headers
  { username: 'user', password: '●●●●●●●●' },               // request body (null for none)
  200,                                                       // response status
  { accessToken: 'eyJ...', tokenType: 'Bearer' },           // response body
  { delay: 600 }                                             // optional: delay in ms
)
```

Each call registers its data in `_sims[id]` at render time. IDs auto-increment (`sim-1`, `sim-2`, …) and are stable within a page render. Because `_simIdx` never resets, IDs are always unique across navigations.

### `curlBlock(cmd)` — still available

Use for code snippets that aren't HTTP calls (e.g. Java config snippets, shell loops). Renders a copy-able code block without a Run button.

### `exampleExchange(method, url, reqHeaders, reqBody, status, respBody)` — still available

Use for static (always-visible) request/response pairs. `simBlock` is preferred for "Try It" sections.

## Pages (14 topics)

| Hash | Topic | Interactive Features |
|------|-------|---------------------|
| `#home` | Dashboard | — |
| `#auth-jwt` | JWT Tokens | JWT decoder + 4 simBlocks (login, protected, expired, refresh) |
| `#auth-basic` | Basic Auth | 3 simBlocks (200, 403, 401) |
| `#auth-apikey` | API Keys | 3 simBlocks (user key, admin key, expired key) |
| `#oauth2` | OAuth2 | 4 simBlocks (client_credentials token, resource call, auth code redirect, code exchange) |
| `#rbac` | RBAC | 3 simBlocks (viewer 403, user 200, admin 200) |
| `#rate-limit` | Rate Limiting | Token bucket simulation + 2 simBlocks (200, 429) |
| `#circuit-breaker` | Circuit Breaker | State machine simulation + 3 simBlocks (success, failure, open/fallback) |
| `#hanging-apis` | Hanging APIs | 3 simBlocks embedded in comparison cards (no-timeout 200, deadline 504, client-timeout 504) |
| `#third-party` | Consuming APIs | 2 simBlocks (valid webhook 200, tampered 401) |
| `#partner-api` | Partner Integration | 4 simBlocks (Alpha auth-info, Gamma auth-info, Alpha audit 200, Gamma audit 403) |
| `#pagination` | Pagination | Client-side product browser + 2 simBlocks (first page, category filter) |
| `#versioning` | Versioning | 2 simBlocks (v1 items, v2 items) |
| `#errors` | Error Handling | 3 simBlocks (404, 422, 500) |
| `#common-problems` | Common Problems | 2 simBlocks (idempotency first call, idempotent retry) |

## Demo Credentials

These are used in the simulations throughout the guide.

| Type | Identifier | Secret | Roles / Scopes |
|------|-----------|--------|---------------|
| User | `admin` | `password` | ADMIN, USER |
| User | `user` | `password` | USER |
| User | `viewer` | `password` | VIEWER |
| API Key | `demo-api-key-admin-12345` | — | ADMIN |
| API Key | `demo-api-key-user-12345` | — | USER |
| API Key | `demo-api-key-expired-12345` | — | EXPIRED |
| OAuth2 Client | `machine-client` | `machine-secret` | client_credentials |
| OAuth2 Client | `web-client` | `web-secret` | authorization_code |
| Partner Key | `partner-alpha-key-12345` | — | PREMIUM (all scopes) |
| Partner Key | `partner-beta-key-12345` | — | STANDARD |
| Partner Key | `partner-gamma-key-12345` | — | FREE (catalog:read only) |

## Deployment

GitHub Actions workflow at `.github/workflows/deploy.yml` deploys on every push to `main`.

**Required one-time GitHub setup:**
1. Settings → Pages → Source: **GitHub Actions** (not "Deploy from a branch")

The workflow uploads the repo root as the Pages artifact — no build step needed. The live URL will be `https://christophermlee2.github.io/api-study-demo-typescript/`.

## Adding a New Topic Page

1. Add a nav item to `index.html` sidebar with `data-page="my-topic"`
2. Write `function myTopicPage()` in `js/app.js` returning an HTML string
3. Register it in the `pages` map near the top of `js/app.js`
4. Use `simBlock(...)` for any "Try It" sections
5. Use `curlBlock(cmd)` only for non-HTTP code snippets (Java config, shell scripts, etc.)

### Page function pattern

```js
function myTopicPage() {
  return `
    <div class="page-title">🔧 My Topic</div>
    <div class="page-sub">One-line description.</div>

    <div class="concept-box">
      Key insight here.
    </div>

    <div class="section-heading">Try It — Success Case</div>
    ${simBlock(
      'curl /api/my-topic',
      'GET', '/api/my-topic',
      { 'Authorization': 'Bearer token' },
      null,
      200,
      { message: 'OK', data: 'example' }
    )}
  `;
}
```

## CSS Design System

All styles are in `css/app.css`. Key utility classes:

- **Layout**: `.demo-grid` (2-col), `.triple-grid` (3-col), `.concept-grid` (card grid)
- **Cards**: `.card`, `.card-title`
- **Alerts**: `.alert .alert-info`, `.alert-warning`, `.alert-error`, `.alert-success`
- **Tags**: `.tag .tag-red`, `.tag-blue`, `.tag-green`, `.tag-yellow`, `.tag-purple`
- **Text**: `.text-sm`, `.text-muted`, `.text-xs`
- **Tables**: `.comparison-table`, `.cred-table`
- **Buttons**: `.btn .btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-success`, `.btn-sm`
- **Code**: `.response-viewer`, `.response-body`, `.response-header`, `.http-exchange`
- **Sim**: `.sim-block`, `.sim-sending` (pulsing loading state)
- **Spacing**: `.mt-8`, `.mt-12`, `.mb-8`, `.divider`
