# Maintenance Mode

A toggle that shows a "We'll be right back" page to every visitor on production while you keep working normally on preview deployments and local dev. Useful when you want to polish public pages without clients viewing them mid-change.

## How it works

- `src/middleware.ts` checks `MAINTENANCE_MODE` on every page request. When `true`, it rewrites the response to `/maintenance` with HTTP status `503`.
- `src/app/maintenance/page.tsx` is the holding page that visitors see.
- `src/app/maintenance-bypass/route.ts` sets a cookie that lets you skip the gate — so you can still view the real site on production.
- API routes (`/api/*`), Next.js internals (`/_next/*`), and static assets pass through unchanged, so the maintenance page itself loads correctly.

The gate runs **before** subdomain routing, so it covers `stratadash.org`, `westside.stratadash.org`, `admin.stratadash.org`, and every other subdomain with a single flag.

## Environment variables

| Variable                 | Scope      | Value                                        |
| ------------------------ | ---------- | -------------------------------------------- |
| `MAINTENANCE_MODE`       | Production | `true` to enable, unset/`false` to disable   |
| `MAINTENANCE_BYPASS_KEY` | Production | A long random string (treat like a password) |

Leave both unset on Preview and Development scopes. That way PR previews and `npm run dev` are never gated.

## Turning maintenance mode ON

```bash
# From the project root, with Vercel CLI installed and linked
printf 'true' | vercel env add MAINTENANCE_MODE production
printf '%s' "$(openssl rand -hex 24)" | vercel env add MAINTENANCE_BYPASS_KEY production

# Save the bypass key somewhere you can find it — you'll need it to view prod.
vercel env pull .env.vercel-production --environment production
grep MAINTENANCE_BYPASS_KEY .env.vercel-production
```

Trigger a redeploy so the new env vars take effect:

```bash
git commit --allow-empty -m "chore: enable maintenance mode"
git push origin main
```

(Or redeploy from the Vercel dashboard.)

Verify: visit `https://www.stratadash.org` in an incognito window — you should see the maintenance page and a `503` status in devtools.

## Viewing production while maintenance is on

Visit this URL once (replace `YOUR_KEY` with the value of `MAINTENANCE_BYPASS_KEY`):

```
https://www.stratadash.org/maintenance-bypass?key=YOUR_KEY
```

You'll be redirected to `/` and a `maintenance_bypass` cookie is set for 30 days on the registrable domain (e.g. `.stratadash.org`). That means **one visit unlocks every subdomain** — `www.stratadash.org`, `westside.stratadash.org`, `admin.stratadash.org`, etc. — from the same browser.

To revoke: clear cookies for `stratadash.org`, or rotate `MAINTENANCE_BYPASS_KEY` and redeploy (the old cookie stops matching).

## Turning maintenance mode OFF

```bash
vercel env rm MAINTENANCE_MODE production
# Optionally remove the bypass key too:
vercel env rm MAINTENANCE_BYPASS_KEY production
```

Redeploy:

```bash
git commit --allow-empty -m "chore: disable maintenance mode"
git push origin main
```

## Testing locally

```bash
# .env.local
MAINTENANCE_MODE=true
MAINTENANCE_BYPASS_KEY=local-dev-key
```

```bash
npm run dev
```

- `http://localhost:5174` → maintenance page (503)
- `http://localhost:5174/maintenance-bypass?key=local-dev-key` → sets cookie, redirects home
- Remove the env vars from `.env.local` when you're done.

## Why this design

- **Single env var toggle** — flip one value, no code changes, no branch swaps.
- **Preview deploys unaffected** — env var is only set on Production scope, so every PR preview shows the real app for you and stakeholders you share links with.
- **Gates everything** — public pages, admin, and district subdomains all covered by one middleware check that runs before any subdomain routing.
- **Bypass cookie** — lets you keep working on production (testing, QA, sharing with specific people) without flipping the flag off.
- **HTTP 503 + `noindex`** — tells search engines and uptime monitors this is temporary, not a real outage or removal.

## Files

- `src/middleware.ts` — the gate logic (search for "Maintenance gate")
- `src/app/maintenance/page.tsx` — the holding page
- `src/app/maintenance-bypass/route.ts` — the bypass cookie setter
