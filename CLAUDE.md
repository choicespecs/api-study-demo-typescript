# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A static GitHub Pages site that serves as a reference guide for REST API concepts. It's a port of [java-api-study-demo](https://github.com/christophermlee2/java-api-study-demo) — the same layout, pages, and educational content, but with no backend required.

## Structure

```
/
├── index.html          # App shell: sidebar + main content area
├── css/app.css         # Design system (tokens, layout, components)
├── js/app.js           # All routing, pages, and simulations in one file
└── .nojekyll           # Tells GitHub Pages not to use Jekyll
```

## Architecture

**Single-file SPA** with hash-based routing (`#auth-jwt`, `#rate-limit`, etc.). No build step needed.

`js/app.js` is organized into sections:
- **Mock data** — 24 products for the pagination demo
- **State** — global object for rate bucket tokens, circuit breaker state, pagination position
- **Utilities** — `syntaxHighlight()`, `escHtml()`, `statusBadge()`, `curlBlock()`, `exampleExchange()`
- **JWT utilities** — client-side `parseJwt()` / `jwtVisualizer()` (works with any pasted JWT)
- **Router** — `navigate(page)`, hash-change listener, `render()`
- **Handlers** — interactive simulation handlers (`rateSend`, `cbSend`, `paginationLoad`, etc.)
- **Page functions** — one function per topic returning HTML strings
- **DOM helpers** — `val(id)`, `setHtml(id, html)`, `sleep(ms)`

## Pages (14 topics)

| Hash | Topic | Interactive? |
|------|-------|-------------|
| `#home` | Dashboard | — |
| `#auth-jwt` | JWT Tokens | JWT decoder (paste any token) |
| `#auth-basic` | Basic Auth | Static curl examples |
| `#auth-apikey` | API Keys | Static curl examples |
| `#oauth2` | OAuth2 | Static curl examples |
| `#rbac` | RBAC | Static curl examples |
| `#rate-limit` | Rate Limiting | Token bucket simulation |
| `#circuit-breaker` | Circuit Breaker | State machine simulation |
| `#hanging-apis` | Hanging APIs | Static comparison tables |
| `#third-party` | Consuming APIs | Static checklists |
| `#partner-api` | Partner Integration | Static curl examples |
| `#pagination` | Pagination | Client-side filtering + pagination |
| `#versioning` | Versioning | Static V1 vs V2 diff |
| `#errors` | Error Handling | Static status code reference |
| `#common-problems` | Common Problems | CORS, N+1, idempotency |

## Deploying to GitHub Pages

1. Push this repo to GitHub
2. Go to Settings → Pages → Source: "Deploy from a branch"
3. Select `main` branch, root (`/`) directory
4. The site will be live at `https://<username>.github.io/<repo-name>/`

No build step, no CI needed.

## Adding a New Topic Page

1. Add a nav item to `index.html` sidebar
2. Write a `function myNewPage()` in `js/app.js` that returns an HTML string
3. Register it in the `pages` map near the top of `js/app.js`

Use `curlBlock(cmd)` for copy-able shell commands and `exampleExchange(method, url, headers, body, status, responseBody)` for request/response pairs.
