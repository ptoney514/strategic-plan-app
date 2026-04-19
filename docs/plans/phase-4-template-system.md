# Phase 4: Public Template System + Editorial One-Pager

> **Status:** Approved plan, ready to execute.
> **Branch:** `feat/phase-4-template-system` (renamed from `feat/phase-3`)
> **Predecessor commit:** `af6e657` — Phase 3 per-objective narrative-left/data-right view
> **Successor of PR #164** — which will be closed without merging in favor of a fresh PR opened from this branch once Phase 4 is complete.

---

## Context

### What we shipped so far

- **Phase 2 (merged, PR #163):** 6 public-dashboard primitives at `src/components/public-dashboard/` — `SignatureMetricCard`, `StatTile`, `TrendChip`, `StatusChip`, `AccordionGoalRow`, `NestedSubGoal`. Each fixture-tested and visually verified.
- **Phase 3 (committed `af6e657`, PR #164 draft):** Rewrote `src/views/v2/public/ObjectiveDetailView.tsx` (route: `/district/[slug]/objectives/[objectiveId]`) to the design.md §6.2 narrative-left / data-right layout with hardcoded fixtures keyed by `goal_number`. Works end-to-end on the preview.

### The gap Phase 4 closes

The per-objective drill-in page is correct in isolation but renders **inside the sidebar-chrome shell** (`src/app/district/[slug]/(sidebar)/`). That chrome — left sidebar with district identity + objective tree — is fine for power-user drill-in, but the public **landing surface** for districts like Westside is supposed to be the **v4 editorial one-pager**: top-nav, long-scroll, all four objectives stacked, hero + pull-quote + CTA bands. See `community-dashboard-v4.html` for the canonical mockup (1786 lines).

Pernell's product direction (2026-04-19): two templates should coexist so each district admin can pick which surface fits their content depth.

- **`sidebar-tree` (existing):** current left-sidebar + drill-down pages. Good default for districts without hand-written narrative content.
- **`editorial-onepager` (new in Phase 4):** v4 one-pager. Good for districts with narrative, pull quotes, and 3-up stat callouts ready.

This is the **foundation for an admin-selectable template system**. A later phase adds a dropdown in the district admin's Appearance settings to flip between templates. Phase 4 builds the registry + migration + first new template, so the admin dropdown is a small follow-up.

### Why `feat/phase-3` was renamed

Pernell's feedback (paraphrased): shipping just Phase 3 now means the public surface is in a "half state" — the per-objective view is improved, but the landing page still looks like the old admin dashboard, which is a worse overall UX than the current state because it's incoherent. Merge-gating the whole template system behind a single PR avoids that middle state.

---

## Scope lock

### Allowed paths

- `drizzle/migrations/0010_plans_public_template.sql` — NEW migration
- `_api/lib/schema/plans.ts` — add column
- `src/lib/types.ts` — add `public_template` to Plan type
- `src/lib/public-templates/` — NEW: registry, template-id type, dispatcher
- `src/views/v2/public/templates/` — NEW: one subdirectory per template
  - `sidebar-tree/` — move existing `V2PublicSidebarLayout` + landing content here
  - `editorial-onepager/` — NEW template: layout + sections
- `src/app/district/[slug]/page.tsx` — dispatch via registry instead of always loading `PlanLandingView`
- `src/app/district/[slug]/(sidebar)/*` — existing sidebar routes; may need path moves (see §Routing notes)
- `src/app/district/[slug]/objectives/[objectiveId]/page.tsx` — add editorial-template redirect
- `scripts/seed.ts` — set Westside's active plan's `public_template = 'editorial-onepager'`
- Test files for every new component + updated test for `ObjectiveDetailView` if its host route changes
- `docs/plans/phase-4-template-system.md` — this file
- `docs/screenshots/` — new Playwright screenshots

### Stop and ask before touching

- Any file in `src/components/public-dashboard/*` (Phase 2 primitives are frozen — modifications require a separate PR)
- Any admin surface (`src/app/district/[slug]/admin/*`, `src/views/v2/admin/*`) — admin dropdown is out of scope
- Routing for subdomain middleware, auth, or middleware.ts
- Any new runtime dependency in `package.json`

---

## Architecture

### The registry pattern

```
src/lib/public-templates/
├── types.ts              — PublicTemplateId union, PublicTemplateDefinition interface
├── registry.ts           — Map of id → definition
└── index.ts              — Re-exports
```

Each template definition contains:

- `id: PublicTemplateId` (`'sidebar-tree' | 'editorial-onepager'`)
- `label: string` (for future admin UI)
- `description: string` (for future admin UI)
- `LandingView: React.ComponentType` (what renders at `/district/[slug]`)
- `supportsObjectiveDetailPage: boolean` (true for sidebar, false for editorial — editorial redirects to a hash anchor on the landing page)

Each template's `LandingView` owns its entire layout chrome. Templates do NOT share a wrapper — the whole point is that the sidebar template has a sidebar and the editorial template doesn't. Each template's subdirectory contains its layout component + all its content sections.

### Data flow

Neither template introduces new queries. Both compose the same hooks:

```ts
const { data: plan } = usePlansBySlug(slug); // plan + public_template
const { data: goals } = useGoalsByPlan(plan.id); // level-0 objectives with nested children
const { data: widgets } = useWidgetsByGoals(slug, childIds);
```

The `public_template` field comes back from `usePlansBySlug` (via the existing API endpoint — we extend the select list). The route dispatcher reads `plan.public_template`, looks up the registry entry, and renders `definition.LandingView`. That view owns its own layout, nav, and all sections. No conditionals at the route level beyond the one lookup.

### Schema addition

```sql
-- 0010_plans_public_template.sql
ALTER TABLE "plans"
  ADD COLUMN IF NOT EXISTS "public_template" varchar(64) DEFAULT 'sidebar-tree' NOT NULL;

-- Lock to known templates via CHECK so unknown values can't leak in.
-- Future templates: add to the CHECK when a new template lands.
ALTER TABLE "plans" DROP CONSTRAINT IF EXISTS "plans_public_template_check";
ALTER TABLE "plans"
  ADD CONSTRAINT "plans_public_template_check"
  CHECK ("public_template" IN ('sidebar-tree', 'editorial-onepager'));
```

**On the `plans` table, not `organizations`.** Same district can publish an older strategic cycle with one template and the current cycle with another.

---

## The editorial template

### Content outline (from `community-dashboard-v4.html`)

Full one-page layout, stacked sections top to bottom:

1. **Sticky top nav** (`<EditorialNav>`): district logo + tagline (left), anchor links `Overview · Students · Staff · Community · Operations` (center), `See progress` CTA (right). Sticky on scroll.
2. **Hero** (`<EditorialHero>`): dot-grid bg, aurora blob, eyebrow chip (`2025–26 Progress Report`), 60–112px Crimson Pro display headline with italic emphasis word (`<em>promises</em>`), 20–26px supporting line.
3. **Four Commitments Overview** (`<FourCommitmentsOverview>`): section heading `Four areas. *One plan.*` + single card containing a 4-column mini-chart grid, one column per objective. Each column is a clickable link to that objective's anchor (`#obj-{goal_number}`). Uses widget data where available.
4. **Mid pull-quote band** (`<PullQuoteBand>`): dark contrast section on `--dark-bg`, one large Crimson-Pro italic quote (district's signature parent/staff quote), 3 big stats underneath. Content comes from the district's configured editorial content (for Phase 4: hardcoded fixture at the plan level — see §Fixtures).
5. **Per-objective sections (×4)** (`<ObjectiveSection>` rendered once per level-0 goal): This **is Phase 3's `ObjectiveDetailView` body, lifted into a reusable section component**. Each section has an anchor id `#obj-{goal_number}`, the narrative-left / data-right grid, watermark, honest-framing band (Obj 04 only). Design.md §6.2 — same code path, new container.
6. **Quarterly CTA** (`<QuarterlyCTABand>`): review schedule + signup. One card, off-white bg, editorial tone.
7. **Editorial footer** (`<EditorialFooter>`): dark, 3-column, district info + links.

### File layout

```
src/views/v2/public/templates/editorial-onepager/
├── EditorialLandingView.tsx      — the top-level LandingView for this template
├── EditorialNav.tsx              — sticky top nav with anchor links
├── EditorialHero.tsx             — hero section
├── FourCommitmentsOverview.tsx   — the 4-up overview card
├── PullQuoteBand.tsx             — dark mid-page pull quote + 3 stats
├── ObjectiveSection.tsx          — PER-OBJECTIVE section (from Phase 3)
├── QuarterlyCTABand.tsx          — CTA
├── EditorialFooter.tsx           — footer
├── fixtures/
│   └── editorial-fixtures.ts     — hardcoded district-level editorial content for Phase 4
│                                   (hero copy, mid pull quote, CTA copy). Per-objective
│                                   content reuses src/lib/utils/objectiveFixtures.ts from Phase 3.
└── __tests__/
    ├── EditorialLandingView.test.tsx
    ├── EditorialNav.test.tsx
    ├── FourCommitmentsOverview.test.tsx
    ├── PullQuoteBand.test.tsx
    ├── ObjectiveSection.test.tsx
    └── (one test per public component)
```

### Reuse from Phase 3

- `src/lib/utils/objectiveFixtures.ts` — per-objective narrative keyed by `goal_number`. **No changes.**
- `src/views/v2/public/ObjectiveDetailView/ObjectiveHeader.tsx` — used by `ObjectiveSection` for the left column. **No changes.**
- `src/views/v2/public/ObjectiveDetailView/ObjectiveDataColumn.tsx` — used by `ObjectiveSection` for the right column. **No changes.**
- `src/views/v2/public/ObjectiveDetailView/HonestFramingBand.tsx` — **No changes.**

`ObjectiveSection` is basically Phase 3's `ObjectiveDetailView` body MINUS the breadcrumb and page wrapper, PLUS an `id="obj-{goal_number}"` anchor and the watermark repositioned to work inside a section instead of a page.

### Fixtures for Phase 4

The editorial template needs content that doesn't yet have schema:

- **Hero copy:** district-level (same for every objective). Hardcoded in `editorial-fixtures.ts` keyed by `plan.id` or `organization.slug`, with a generic fallback.
- **Mid pull quote + 3 stats:** same — district-level fixture.
- **CTA copy + quarterly review schedule:** district-level fixture.
- **Per-objective narrative:** Phase 3's `getObjectiveNarrative(goalNumber)` already covers this. Reuse.

**All fixtures marked as Phase 4 placeholder.** Schema work to move this to the DB is a later phase, unblocked once we have the admin UI to edit it.

---

## The sidebar template

Existing code kept but moved under the registry so it's explicit it's a template, not a default.

```
src/views/v2/public/templates/sidebar-tree/
├── SidebarLandingView.tsx        — moved from current PlanLandingView.tsx
└── (no sub-components — existing V2PublicSidebarLayout and friends stay in src/components/v2/layout/)
```

The current `PlanLandingView` at `src/views/v2/public/PlanLandingView.tsx` moves into the template folder verbatim. One-line change in the export path. Its host route `src/app/district/[slug]/(sidebar)/page.tsx` becomes irrelevant _if_ we go to per-template routing (see below).

### Routing notes

Two options here:

**Option R1: Template-owned layout, template-owned routes.** The sidebar template's `LandingView` renders the full `<V2PublicSidebarLayout>` chrome internally (not in the Next `(sidebar)` layout group). Every sidebar-child page (`/objectives`, `/objectives/[id]`, `/goals/[id]`) is under `/district/[slug]/...` and their page.tsx files each wrap themselves in the sidebar layout inline. Editorial template has no child routes — just the one landing. **Net effect: drop the Next.js `(sidebar)` route group.** Cleanest long-term.

**Option R2: Keep `(sidebar)` group, editorial template gets its own top-level route.** Sidebar districts use `/district/[slug]/(sidebar)/...`. Editorial districts use `/district/[slug]` only (no sub-routes). Less refactor, but creates two route trees with an invisible conditional gate. Over time this gets ugly.

**Recommendation: R1.** It's a bigger diff but honest — the template owns its layout. The `(sidebar)` group is a Next.js convention that ties chrome to URL shape, which is exactly what we DON'T want once templates can vary.

**Caveat on R1:** Moving routes out of the `(sidebar)` group is a physical file move that breaks nothing externally (URLs don't change) but shows up as "deleted + created" in git. Review-wise fine, just visually noisy.

### Editorial template deep-link handling

For editorial-template districts, the route `/district/[slug]/objectives/[objectiveId]` doesn't render a separate page (the whole content is on `/district/[slug]#obj-{goal_number}`). To keep bookmarks alive, the page component at that route checks the plan's `public_template`:

- If `sidebar-tree`: render `ObjectiveDetailView` (Phase 3 work — unchanged).
- If `editorial-onepager`: issue a redirect (`redirect(\`/district/${slug}#obj-${goal_number}\`)`) so old links land on the right section.

This keeps Phase 3's drill-in view alive for sidebar districts AND satisfies "bookmarks don't die" for editorial districts.

---

## Step-by-step task list

### Stage 0 — plan housekeeping (this file)

- [x] Rename branch `feat/phase-3` → `feat/phase-4-template-system` (local + remote)
- [x] Write this plan at `docs/plans/phase-4-template-system.md`
- [ ] Commit this plan to the branch
- [ ] Close PR #164 as "superseded by Phase 4 — see upcoming PR"

### Stage 1 — schema + type plumbing

- [ ] Create `drizzle/migrations/0010_plans_public_template.sql` with `public_template` column + CHECK constraint. Idempotent (`IF NOT EXISTS`).
- [ ] Update `_api/lib/schema/plans.ts` to include the column (enum type or `varchar` — match the SQL).
- [ ] Run `npx drizzle-kit generate` locally to verify the snapshot matches. **Don't** apply to production — the preview-db workflow will handle preview branches; main will need a separate coordinated migration push (flag as TODO at the end).
- [ ] Apply the migration to the existing Neon preview branch `preview/feat/phase-3` so the preview keeps working. (Branch can be renamed to `preview/feat/phase-4-template-system` or left as-is — low priority cleanup.)
- [ ] Update `src/lib/types.ts` `Plan` interface to include `public_template: 'sidebar-tree' | 'editorial-onepager'`.
- [ ] Update `scripts/seed.ts` to set Westside's active plan's `public_template = 'editorial-onepager'`. All other seeded districts default to `sidebar-tree`.
- [ ] Run seed against the preview branch; verify `/api/plans?slug=westside` returns the field.
- [ ] Write a unit test: `plans` service layer returns the new field.

### Stage 2 — template registry

- [ ] Create `src/lib/public-templates/types.ts` with `PublicTemplateId` union and `PublicTemplateDefinition` interface.
- [ ] Create `src/lib/public-templates/registry.ts` exporting a `PUBLIC_TEMPLATES: Record<PublicTemplateId, PublicTemplateDefinition>` map. Entries are **lazy** (use `dynamic(() => import(...))` or `React.lazy`) so each template only ships its code to clients whose district uses it.
- [ ] Create `src/lib/public-templates/index.ts` with re-exports.
- [ ] Write a test: registry has exactly the documented templates; each definition has required fields.

### Stage 3 — move sidebar template under the registry (no visual change)

- [ ] Create `src/views/v2/public/templates/sidebar-tree/` directory.
- [ ] Move `src/views/v2/public/PlanLandingView.tsx` → `src/views/v2/public/templates/sidebar-tree/SidebarLandingView.tsx`. Update imports that referenced the old path (there should be exactly one: the current `(sidebar)/page.tsx`).
- [ ] Register `sidebar-tree` in the registry pointing at the new component.
- [ ] Run the full test suite — it should still be green. Nothing about this district's rendering changes.

### Stage 4 — route dispatcher

- [ ] Rewrite `src/app/district/[slug]/page.tsx` to:
  1. Fetch the plan for the slug (server component OR client component with `usePlansBySlug`).
  2. Read `plan.public_template`.
  3. Look up `PUBLIC_TEMPLATES[plan.public_template]`.
  4. Render `<definition.LandingView />`.
  5. Fallback to `sidebar-tree` if the template id is unknown (belt-and-suspenders for schema drift).
- [ ] Add editorial-template redirect at `src/app/district/[slug]/objectives/[objectiveId]/page.tsx`: if plan's template is `editorial-onepager`, `redirect(/district/${slug}#obj-${goal_number})`. Else render `ObjectiveDetailView` (Phase 3, unchanged).
- [ ] Decide R1 vs R2 (recommendation: R1 — drop `(sidebar)` group, each sidebar child page wraps itself inline). If R1: move `(sidebar)/objectives/page.tsx` → `objectives/page.tsx`, etc. Each of those files imports `SidebarLayout` internally.
- [ ] Verify a sidebar-template district (Eastside seed) still renders every page correctly.

### Stage 5 — editorial template: scaffold + nav + hero

- [ ] TDD each component. For every sub-component below: write failing test → build → green → render on `/dev/components` with fixtures → Playwright screenshot.
- [ ] `EditorialNav.tsx`: sticky top nav, logo + tagline left, 5 anchor links center, CTA right. Anchors point to `#overview`, `#obj-1`, `#obj-2`, `#obj-3`, `#obj-4`, `#cta`.
- [ ] `EditorialHero.tsx`: dot-grid bg, aurora blob, eyebrow chip, Crimson Pro headline with italic emphasis, supporting paragraph. Props drive copy.
- [ ] `editorial-fixtures.ts`: district-level fixtures — hero copy, mid pull quote, 3 stats, CTA copy. Keyed by `organization.slug` with a generic fallback. Westside fixture is hand-crafted from v4.html.
- [ ] `EditorialLandingView.tsx` scaffold: renders `<EditorialNav />`, `<EditorialHero />`, TODO markers for the rest.

### Stage 6 — editorial template: four commitments + objective sections

- [ ] `FourCommitmentsOverview.tsx`: card with 4-column mini bar-chart grid. Each column is an anchor link to `#obj-{goal_number}`. Reads `goals` + `widgets` to build the mini charts.
- [ ] `ObjectiveSection.tsx`: Phase 3's `ObjectiveDetailView` body lifted. Adds `id="obj-{goal_number}"` anchor. Reuses `ObjectiveHeader` + `ObjectiveDataColumn` + `HonestFramingBand` from Phase 3. Watermark re-positioned to be section-scoped (`position: absolute; top: 40px; right: -10px`) relative to the section not the page.
- [ ] `EditorialLandingView.tsx`: wire `FourCommitmentsOverview` after hero; then loop over level-0 goals and render `<ObjectiveSection>` for each.
- [ ] Test: all four objective sections render with correct anchors; clicking a FourCommitments column scrolls to the matching section.

### Stage 7 — editorial template: pull-quote band + CTA + footer

- [ ] `PullQuoteBand.tsx`: dark-bg section, one big Crimson-Pro italic quote, 3 big stats. Props drive copy (from `editorial-fixtures`).
- [ ] `QuarterlyCTABand.tsx`: review schedule + signup form (form is a TODO — render disabled for Phase 4 with "coming soon" label). Uses CTA copy from fixtures.
- [ ] `EditorialFooter.tsx`: dark 3-column footer with district info + plan version.
- [ ] Wire into `EditorialLandingView.tsx` at the bottom.

### Stage 8 — integration smoke tests + screenshots

- [ ] Visit `http://westside.lvh.me:5174/` in dev — should render the editorial one-pager.
- [ ] Visit `http://eastside.lvh.me:5174/` in dev — should render the sidebar template unchanged.
- [ ] Visit `/objectives/{b0000001-...}` on Westside — should redirect to `/#obj-1`.
- [ ] Visit `/objectives/{b0000001-...}` on Eastside — should render `ObjectiveDetailView` (Phase 3).
- [ ] Playwright screenshots: `09-editorial-westside-hero.png`, `10-editorial-westside-four-commitments.png`, `11-editorial-westside-obj-01.png`, `12-editorial-westside-obj-04.png`, `13-editorial-westside-pullquote.png`, `14-sidebar-eastside-unchanged.png`.

### Stage 9 — preview provisioning

- [ ] Apply migration 0010 + re-seed the existing Neon preview branch (or create a new one named `preview/feat/phase-4-template-system`).
- [ ] Update Vercel preview env overrides to point at the right branch name (the existing override is scoped to `feat/phase-3` — need a new one scoped to `feat/phase-4-template-system`).
- [ ] `vercel redeploy`.
- [ ] Smoke-test the preview URL.

### Stage 10 — final gates + PR

- [ ] `npm run lint` → 0 errors (max-warnings 250 is CI cap)
- [ ] `npm run type-check` → clean
- [ ] `npm run test:run` → full suite green
- [ ] `npm run build` → succeeds
- [ ] Close PR #164 with a comment linking to the new PR
- [ ] `gh pr create --draft` on `feat/phase-4-template-system`, title `feat(public-dashboard): Phase 4 template system + editorial one-pager`, body references this plan file
- [ ] Wait for CI + preview URL
- [ ] Walk preview (Westside editorial + Eastside sidebar)
- [ ] Report preview URL; flip to ready-for-review on user approval

### Stage 11 — follow-up ticket (out of scope for this PR)

- [ ] Admin dropdown at `/district/[slug]/admin/appearance` to flip `public_template` per-plan. Lives in its own follow-up PR.
- [ ] Schema for district-level editorial content (hero copy, mid pull quote, CTA copy, quarterly review schedule) — right now it's fixtures. Next phase.
- [ ] Apply migration 0010 to production Neon main (coordinated separately since main has known drift from the checked-in migrations).

---

## Verification

At plan-complete (Stage 10 gates):

1. `npm run test:run` — full suite green, includes new editorial-template tests + updated sidebar-template tests.
2. `npm run build` — `/district/[slug]` prerenders (or is dynamic as appropriate); template lazy-loading works.
3. Westside preview (`/district/westside`) renders the editorial one-pager end-to-end: hero → four-commitments → Obj 01 → Obj 02 → Obj 03 → Obj 04 (with honest framing) → pull quote → CTA → footer.
4. Eastside preview (`/district/eastside`) still renders the sidebar template unchanged.
5. Both preview walks screenshotted and committed.

---

## Risks + open questions

- **R1 route restructure visual diff size.** Moving files out of `(sidebar)` is a physical move. Review will show lots of "deleted + created". Acceptable but flag it in the PR description.
- **Lazy-loading templates.** Using `dynamic(() => import(...))` per template keeps bundles small but introduces an SSR consideration. Need to verify with `npm run build` that the editorial template doesn't accidentally get shipped to sidebar districts.
- **Crimson Pro font not loaded in Next.js yet.** Phase 2 noted this; still not resolved. Editorial template falls back to Instrument Serif, which is close but not identical. Flag as follow-up but don't block this PR on it.
- **Sparkline data is still fixture-based.** Widgets don't store time-series. Same Phase 3 follow-up.
- **Production Neon main has schema drift.** Applying migration 0010 to main is out of scope; flagged for a coordinated follow-up.
- **PR #164 needs to close.** No code review in flight; closing loses nothing but the preview walkthrough discussion. I'll leave a comment pointing at the new PR when it opens.

---

## File-level summary (for quick reference when starting to code)

**NEW files:**

- `drizzle/migrations/0010_plans_public_template.sql`
- `src/lib/public-templates/types.ts`
- `src/lib/public-templates/registry.ts`
- `src/lib/public-templates/index.ts`
- `src/lib/public-templates/__tests__/registry.test.ts`
- `src/views/v2/public/templates/sidebar-tree/SidebarLandingView.tsx` (moved from `src/views/v2/public/PlanLandingView.tsx`)
- `src/views/v2/public/templates/editorial-onepager/EditorialLandingView.tsx`
- `src/views/v2/public/templates/editorial-onepager/EditorialNav.tsx`
- `src/views/v2/public/templates/editorial-onepager/EditorialHero.tsx`
- `src/views/v2/public/templates/editorial-onepager/FourCommitmentsOverview.tsx`
- `src/views/v2/public/templates/editorial-onepager/PullQuoteBand.tsx`
- `src/views/v2/public/templates/editorial-onepager/ObjectiveSection.tsx`
- `src/views/v2/public/templates/editorial-onepager/QuarterlyCTABand.tsx`
- `src/views/v2/public/templates/editorial-onepager/EditorialFooter.tsx`
- `src/views/v2/public/templates/editorial-onepager/fixtures/editorial-fixtures.ts`
- One `__tests__/*.test.tsx` per editorial component
- 6+ new `docs/screenshots/` entries

**MODIFIED files:**

- `_api/lib/schema/plans.ts` — add column
- `src/lib/types.ts` — add field to `Plan`
- `src/app/district/[slug]/page.tsx` — dispatch via registry
- `src/app/district/[slug]/objectives/[objectiveId]/page.tsx` — editorial redirect
- `scripts/seed.ts` — flip Westside to editorial
- Possibly every `src/app/district/[slug]/(sidebar)/*/page.tsx` if going R1 — they move out of the `(sidebar)` group

**UNCHANGED (explicitly):**

- All Phase 2 primitives in `src/components/public-dashboard/*`
- All Phase 3 extractions in `src/views/v2/public/ObjectiveDetailView/*`
- `src/lib/utils/objectiveFixtures.ts`
- Admin views, auth, middleware, routing plumbing outside `/district/[slug]`
