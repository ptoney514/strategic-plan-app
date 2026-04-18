# Subdomain Link Routing Fix — Design

**Status:** Approved by user, ready for implementation-plan authoring
**Branch target:** `feat/chart-design` (or a new branch cut from it)
**Scope:** Bug fix only. No schema changes, no admin work, no UI redesign.

## Context

On any district subdomain host (`westside.lvh.me:5174` in dev, `westside.stratadash.org` in prod), clicking an internal link produces a 404 at URLs like `/district/westside/objectives/<id>`.

### Why

`src/middleware.ts` rewrites requests on a district subdomain with `pathname = /district/${slug}${pathname}`. Seven public-view components independently build their hrefs with `const basePath = \`/district/${slug}\``. When the browser visits the resulting href on the subdomain, the middleware prepends the prefix *again*, producing `/district/westside/district/westside/objectives/<id>` — a route that doesn't exist.

A helper already exists for this exact problem: `useDistrictLink()` in `src/contexts/SubdomainContext.tsx:65`. Two components use it (`V2GoalsOverview`, `V2GoalDrillDown`); seven do not.

### Secondary issue

The hook's path-based branch is _also_ wrong. `buildDistrictPathWithQueryParam` in `src/lib/subdomain.ts:218` returns `/${slug}${basePath}` for root-domain access, but the Next.js App Router has no `/[slug]/...` route — the canonical path-based URL is `/district/${slug}/...`. This branch is currently unexercised (all real traffic comes in via subdomain), but fixing it now removes a footgun.

### Intended outcome

- Clicking any link on a district subdomain lands on a valid page.
- One helper (`useDistrictLink`) is the single source of truth for public district URLs and produces correct hrefs for both subdomain and path-based routing.
- A regression guard prevents the old pattern from coming back.

## Non-goals

- Middleware changes.
- Any change to data fetching, schemas, admin UI, or styling.
- Work on the separate, larger initiative to load real Westside FY25 content and add depth-4 sub-goals + narrative authoring. **That is a follow-up, separate branch.**

## Architecture

`useDistrictLink()` becomes the single source of truth. After this change:

- **`useDistrictLink`** — one job: turn a relative public path into a host-appropriate href. Tested in isolation.
- **The seven public views** — no longer know URL structure; they ask the hook.
- **Middleware** — unchanged; still the only thing that knows host → slug mapping.

### The invariant

An href produced by `useDistrictLink` must, when clicked, be middleware-rewritten into the canonical `/district/[slug]/...` route **exactly once**, regardless of host.

| Host                                                  | `link('/goals/abc')` returns    | Middleware rewrites to         | Final route                                          |
| ----------------------------------------------------- | ------------------------------- | ------------------------------ | ---------------------------------------------------- |
| `westside.lvh.me:5174` (real subdomain)               | `/goals/abc`                    | `/district/westside/goals/abc` | `/district/[slug]/(sidebar)/goals/[goalId]/page.tsx` |
| `localhost:5174?subdomain=westside` (query-param sim) | `/goals/abc?subdomain=westside` | same                           | same                                                 |
| `lvh.me:5174/district/westside` (path-based)          | `/district/westside/goals/abc`  | n/a (pass-through)             | same                                                 |

## Changes

### Change 1 — fix `src/lib/subdomain.ts`

In `buildDistrictPathWithQueryParam` (line 218), change the root-domain branch return from:

```ts
return `/${slug}${basePath}`;
```

to:

```ts
return `/district/${slug}${basePath}`;
```

Apply the same correction to `buildDistrictPath` (line 200) for consistency. Keep the subdomain and query-param branches as-is.

### Change 2 — migrate 7 call sites

Replace `const basePath = \`/district/${slug}\``-style literals with `const link = useDistrictLink()`, and every `\`${basePath}/…\``template with`link('/…')`.

| #   | File                                               | Line                                      |
| --- | -------------------------------------------------- | ----------------------------------------- |
| 1   | `src/views/v2/public/PlanLandingView.tsx`          | 43                                        |
| 2   | `src/components/v2/layout/PublicSidebarTree.tsx`   | 38 _(the file triggering the user's 404)_ |
| 3   | `src/components/v2/layout/PublicSidebarLayout.tsx` | 66                                        |
| 4   | `src/views/v2/public/ObjectivesOverviewView.tsx`   | 27                                        |
| 5   | `src/views/v2/public/ObjectiveDetailView.tsx`      | 26                                        |
| 6   | `src/views/v2/public/GoalDetailView.tsx`           | 47                                        |

Out of scope: `src/app/(root)/page.tsx:19` does `router.replace(\`/district/${subdomain.slug}\`)`but runs on the **root** domain redirecting the user *to* the subdomain URL via`buildSubdomainUrlWithPath` higher in the tree, not producing an internal subdomain link. Leave it alone.

### Change 3 — regression guard

New test file: `src/lib/__tests__/no-hardcoded-district-paths.test.ts`.

Reads each `.tsx` file under `src/views/v2/public/` and `src/components/v2/layout/` (excluding `__tests__` dirs). Asserts none contain the literal pattern `` `/district/${ `` or a line matching ``/const\s+basePath\s*=\s*`\/district\//``. Fail message should direct the developer to `useDistrictLink()` in `src/contexts/SubdomainContext.tsx`.

### Opportunistic cleanups

Allowed only inside the 6 migrated files. Each must be justifiable in one line in the PR description (e.g. "remove now-unused `slug` destructure since `link` alone is used"). Nothing that touches unrelated logic, styling, or data flow. If an edit feels debatable, split to a follow-up.

## Testing strategy (TDD)

Strict red-green-refactor, one cycle per item.

### Cycle 1 — helper correctness

- Red: new test in `src/lib/__tests__/subdomain.test.ts` (or create one). `buildDistrictPathWithQueryParam('/goals', 'westside', false)` → expect `'/district/westside/goals'`. Currently returns `/westside/goals` → fails.
- Green: apply Change 1.
- Refactor: add same test for `buildDistrictPath`, apply same fix. Keep the two helpers consistent.

### Cycle 2 — lock in `useDistrictLink` behavior (regression net, not a true red-green cycle)

This isn't a TDD cycle — it's a characterization test. The hook already behaves correctly on a real subdomain; this cycle pins the contract so Change 2 can't silently drift it.

- Write: render a minimal test component inside `SubdomainOverrideProvider slug="westside"` that renders `useDistrictLink()('/goals/abc')`. Assert output is `'/goals/abc'`.
- Write a companion test with the path-based context shape that would produce the root-domain branch, asserting output is `'/district/westside/goals/abc'` (this one _is_ a true red-green — it fails before Change 1, passes after).

### Cycles 3a–3f — migrate each call site

Generic shape, one cycle per file in the Change 2 order:

- Red: render the view inside `SubdomainOverrideProvider slug="westside"` with mocked React Query data (mirror the `V2GoalDrillDown.test.tsx` / `V2GoalsOverview.test.tsx` mock shape). `screen.getAllByRole('link')` → assert no href matches `/^\/district\//`. Currently fails.
- Green: swap `basePath` for `useDistrictLink()` in that file. Test passes.
- Refactor: any in-file cleanup justifiable in one line. Run full suite.

### Cycle 4 — regression guard

- Red: add `src/lib/__tests__/no-hardcoded-district-paths.test.ts` per Change 3. Should pass after cycles 3a–3f; if it fails, a call site was missed.
- Green: n/a (purpose is to lock behavior in).

### Cycle 5 — manual E2E via Playwright MCP

Not a unit test; run after the Vitest suite is green.

1. Start dev server if not running.
2. Navigate to `http://westside.lvh.me:5174/`. Confirm home renders. Inspect anchor hrefs — none should start with `/district/`.
3. Click into an objective → URL becomes `/objectives/<id>`, page renders.
4. Click a goal in the sidebar → URL becomes `/goals/<id>`, page renders.
5. Breadcrumb/back to plan → URL becomes `/`, home renders.
6. Navigate directly to `http://lvh.me:5174/district/westside` → home renders; clicking a goal produces `/district/westside/goals/<id>`, page renders.
7. Capture four screenshots (subdomain home, subdomain objective detail, subdomain goal detail, path-based home). Attach to PR.

## Risks

| Risk                                                                    | Mitigation                                                                                                                                                                   |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A missed call site still hardcodes the bad path                         | The Cycle 4 guard test greps both relevant directories and fails CI.                                                                                                         |
| Opportunistic cleanups balloon the diff                                 | One-line justification budget; split debatable ones to follow-ups.                                                                                                           |
| `buildDistrictPath(WithQueryParam)` change breaks an unaudited consumer | Grep shows 2 callers total, both via `useDistrictLink`. Path-based branch currently unexercised (no `/[slug]/...` route). Net effect: a correct helper returns correct URLs. |
| Existing test files mock `useDistrictLink` as identity                  | Those mocks stay — they test unrelated concerns. New tests mount the real hook under `SubdomainOverrideProvider`. Guard test is mock-independent.                            |

## Verification (exit criteria)

- No `` `/district/${slug}` `` literal in `src/views/v2/public/` or `src/components/v2/layout/`.
- Vitest green, with ≥6 new render tests, ≥2 new helper tests, and the guard test.
- `npm run lint` and `npm run type-check` clean.
- Playwright MCP smoke passes on subdomain and path-based hosts locally.
- Vercel preview smoke passes on the preview URL (subdomain simulated via `?subdomain=westside`).

## Not in this branch

Queued for the next brainstorm → plan → branch cycle, to be started after this ships:

- Depth-4 goal support (sub-goals like `1.1.1`).
- Manually-authored status + narrative fields on goals (replacing any assumption of computed status).
- Admin authoring UI for the above.
- Excel bulk-import path.
- Loading real Westside FY25 content through that authoring UI.
