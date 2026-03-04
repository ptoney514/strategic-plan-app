# StrataDash V2 Migration Plan — Parallel Build

## Context

The current StrataDash app is over-engineered for what customers actually need: 61 pages, 187 components, 88 API endpoints, 19 database tables. The `metrics` table alone has ~50 columns. The `goals` table has ~40. There's no self-serve signup. Schools are a separate entity layer that adds complexity without value.

A wireframe (`wireframe.html`) has been approved with 12 screens showing the simplified v2 vision. This plan implements that wireframe using a **parallel build** strategy — v2 pages live alongside v1 at `/v2` routes, sharing the same database, auth, and infrastructure. When v2 is ready, we swap routing and delete v1.

## Strategy: Parallel Build with `/v2` Route Prefix

- V2 pages mount under `/v2/*` in the existing routers (RootRouter, DistrictRouter)
- V2 API endpoints go in `api/v2/`
- V2 components go in `src/components/v2/`, pages in `src/pages/v2/`
- Database changes are **additive only** until cutover (no drops, no renames)
- At cutover: remove `/v2` prefix, delete v1 code, run cleanup migration

## What Gets Reused (no changes needed)

| Layer            | File                                     | Notes                                             |
| ---------------- | ---------------------------------------- | ------------------------------------------------- |
| Fetch helper     | `src/lib/api.ts`                         | apiFetch, apiGet, apiPost, apiPut, apiDelete      |
| Auth context     | `src/contexts/AuthContext.tsx`           | useAuth hook, session state                       |
| Auth client      | `src/lib/auth-client.ts`                 | Better Auth signUp/signIn/signOut                 |
| Theme            | `src/contexts/ThemeContext.tsx`          | Light/dark mode                                   |
| Subdomain        | `src/contexts/SubdomainContext.tsx`      | District slug detection                           |
| UI primitives    | `src/components/ui/*`                    | Button, Input, Badge, Progress, etc.              |
| Auth middleware  | `api/lib/middleware/auth.ts`             | requireAuth, requireOrgMember, requireSystemAdmin |
| DB client        | `api/lib/db.ts`                          | Drizzle + Neon                                    |
| Response helpers | `api/lib/response.ts`                    | jsonOk, jsonError, parsePagination                |
| Services         | `src/lib/services/goals.service.ts`      | Goal CRUD, hierarchy                              |
| Services         | `src/lib/services/plans.service.ts`      | Plan CRUD                                         |
| Services         | `src/lib/services/district.service.ts`   | Org CRUD                                          |
| Services         | `src/lib/services/member.service.ts`     | Team management                                   |
| Services         | `src/lib/services/invitation.service.ts` | Invite flow                                       |
| Services         | `src/lib/services/import.service.ts`     | CSV/Excel import                                  |
| Appearance       | `src/hooks/useAppearanceState.ts`        | Color/logo reducer                                |
| Logo upload      | `src/components/admin/LogoUpload.tsx`    | Drag-drop logo                                    |
| Admin guard      | `src/middleware/ClientAdminGuard.tsx`    | Route protection                                  |
| Goal utilities   | `src/lib/types.ts`                       | buildGoalHierarchy, getNextGoalNumber             |

---

## Phase 0: Foundation (1-2 days)

Set up v2 directory structure, routing namespace, and shared types.

### Create directory structure

```
src/pages/v2/marketing/        # Landing, Pricing
src/pages/v2/onboarding/       # Signup wizard
src/pages/v2/admin/            # Dashboard, PlanEditor, Appearance, Team, Widgets, Import
src/pages/v2/public/           # GoalsOverview, GoalDrillDown, LaunchTraction
src/components/v2/layout/      # V2AdminLayout, V2PublicLayout
src/components/v2/widgets/     # Widget renderers (donut, bar, etc.)
src/components/v2/tree/        # Goal tree editor
src/components/v2/onboarding/  # Wizard steps
src/hooks/v2/                  # V2-specific React Query hooks
src/lib/services/v2/           # V2-specific services
api/v2/                        # V2 API endpoints
```

### Add v2 routes to existing routers

**`src/routers/RootRouter.tsx`** — add inside existing `<Routes>`:

```tsx
<Route path="/v2" element={<V2MarketingLayout />}>
  <Route index element={<V2Landing />} />
  <Route path="pricing" element={<V2Pricing />} />
  <Route path="onboard/*" element={<V2OnboardingWizard />} />
</Route>
```

**`src/routers/DistrictRouter.tsx`** — add inside existing `<Routes>`:

```tsx
<Route path="/v2" element={<V2PublicLayout />}>
  <Route index element={<V2GoalsOverview />} />
  <Route path="goal/:goalId" element={<V2GoalDrillDown />} />
  <Route path="traction" element={<V2LaunchTraction />} />
</Route>
<Route path="/v2/admin" element={<ClientAdminGuard><V2AdminLayout /></ClientAdminGuard>}>
  <Route index element={<V2AdminDashboard />} />
  <Route path="plan/:planId" element={<V2PlanEditor />} />
  <Route path="appearance" element={<V2Appearance />} />
  <Route path="team" element={<V2Team />} />
  <Route path="widgets" element={<V2WidgetBuilder />} />
  <Route path="import" element={<V2Import />} />
</Route>
```

### Create v2 types (`src/lib/types/v2.ts`)

- `WidgetType` = 'donut' | 'big-number' | 'bar-chart' | 'area-line' | 'progress-bar' | 'pie-breakdown'
- `TemplateMode` = 'hierarchical' | 'launch-traction'
- `Widget` interface (id, orgId, type, title, subtitle, config JSON, position)
- `WidgetConfig` interface (value, target, unit, trend, dataPoints, breakdownItems)
- `V2Goal` interface (~15 fields: id, planId, parentId, title, level, status dropdown, progress manual %)
- `OnboardingState` interface (step, orgName, slug, templateMode)

### Verify

- `/v2` shows placeholder landing page
- `westside.lvh.me:5174/v2/admin` shows placeholder (after login)
- All v1 routes unchanged

---

## Phase 1: Auth & Onboarding (3-5 days)

Build self-serve signup: landing -> pricing -> signup -> create org -> pick template -> customize.

### Database migration

Add columns to `organizations` table in `api/lib/schema/organizations.ts`:

- `onboardingCompleted` (boolean, default false)
- `templateMode` (varchar, default 'hierarchical')
- `createdBy` (uuid FK to user)

### New API endpoints

- `api/v2/onboarding/create-org.ts` — POST: create org + member (owner) + default plan
- `api/v2/onboarding/complete.ts` — POST: mark onboarding done, save template/colors/logo

### Pages to build

| Page                                             | Wireframe | Description         |
| ------------------------------------------------ | --------- | ------------------- |
| `src/pages/v2/marketing/V2Landing.tsx`           | Screen 1  | Hero, features, CTA |
| `src/pages/v2/marketing/V2Pricing.tsx`           | Screen 2  | 3-tier pricing grid |
| `src/pages/v2/onboarding/V2OnboardingWizard.tsx` | Screen 3  | 5-step wizard       |

### Components to build

- `src/components/v2/onboarding/WizardStepIndicator.tsx` — step progress bar
- `src/components/v2/onboarding/OrgCreationStep.tsx` — name, slug, type
- `src/components/v2/onboarding/TemplatePicker.tsx` — hierarchical vs launch-traction

### Reuses

- `authClient.signUp.email()` for account creation
- `useAppearanceState` reducer for color/logo step
- `LogoUpload` component for logo step
- `Button`, `Input`, `Select` from `src/components/ui/`

### Verify

- Full flow: `/v2` -> "Start Free" -> create account -> name org -> pick template -> set colors -> arrive at `/v2/admin`
- Org exists in DB with correct templateMode, colors, owner membership

---

## Phase 2: Admin Core (5-8 days)

Build admin dashboard, plan editor (tree view), and team management.

### Pages to build

| Page                                      | Wireframe | Description                   |
| ----------------------------------------- | --------- | ----------------------------- |
| `src/pages/v2/admin/V2AdminDashboard.tsx` | Screen 4  | Stats cards, plan list        |
| `src/pages/v2/admin/V2PlanEditor.tsx`     | Screen 5  | Goal tree with inline editing |
| `src/pages/v2/admin/V2Team.tsx`           | Screen 7  | Member list, invite           |

### Layout to build

- `src/components/v2/layout/V2AdminLayout.tsx` — dark sidebar with: Dashboard, Plans & Goals, Appearance, Team, Widgets, Import, Account

### Tree editor components

- `src/components/v2/tree/GoalTreeView.tsx` — recursive tree renderer
- `src/components/v2/tree/GoalTreeItem.tsx` — single node: title (inline edit), status dropdown (manual: Not Started / In Progress / On Track / At Risk / Completed), add child, delete
- `src/components/v2/tree/AddGoalInline.tsx` — inline form for new goal at any level

### No new API endpoints needed

Reuses existing: goals CRUD, plans CRUD, members CRUD, invitations

### Reuses

- `GoalsService`, `PlansService`, `DistrictService`, `MemberService`
- `InviteUserModal` from `src/components/admin/InviteUserModal.tsx`
- `ClientAdminGuard` for route protection
- `buildGoalHierarchy()` from `src/lib/types.ts`

### Verify

- Dashboard shows real stats from existing seed data
- Tree view renders 3-level goal hierarchy
- Inline edit: click title -> edit -> blur saves
- Status dropdown changes persist
- Add goal at each level works
- Delete goal cascades children
- Invite team member sends invitation

---

## Phase 3: Widget System (5-8 days)

New widget table, catalog, builder admin screen. This replaces the 50-column metrics table.

### Database migration

New schema file: `api/lib/schema/widgets.ts`

**`widgets` table:**

- `id` (uuid PK)
- `organizationId` (uuid FK -> organizations, cascade)
- `planId` (uuid FK -> plans, nullable)
- `type` (varchar: donut, big-number, bar-chart, area-line, progress-bar, pie-breakdown)
- `title` (varchar)
- `subtitle` (varchar, nullable)
- `config` (jsonb — stores all type-specific data, ~5 fields per widget)
- `position` (integer)
- `isActive` (boolean, default true)
- `createdAt`, `updatedAt`

Config JSONB examples:

- Donut: `{ value: 324, target: 500, label: "Earned to Date" }`
- Big Number: `{ value: 480, trend: "+12%", trendDirection: "up" }`
- Bar Chart: `{ dataPoints: [{ label: "Q1", values: [45, 14] }], legend: ["Involved", "Placed"] }`

### New API endpoints

- `api/v2/widgets/index.ts` — GET (list by org), POST (create)
- `api/v2/widgets/[id].ts` — GET, PUT, DELETE
- `api/v2/widgets/reorder.ts` — PUT (reorder positions)

### New service

- `src/lib/services/v2/widget.service.ts` — WidgetService (CRUD, reorder)

### Pages to build

| Page                                     | Wireframe | Description                             |
| ---------------------------------------- | --------- | --------------------------------------- |
| `src/pages/v2/admin/V2WidgetBuilder.tsx` | Screen 10 | Dashboard grid + catalog + config panel |

### Widget components (6 renderers + scaffolding)

- `src/components/v2/widgets/WidgetGrid.tsx` — 3-column responsive grid
- `src/components/v2/widgets/WidgetCard.tsx` — dispatches to type renderer
- `src/components/v2/widgets/WidgetCatalog.tsx` — 6 type cards with previews
- `src/components/v2/widgets/WidgetConfigPanel.tsx` — dynamic form by type + live preview
- `src/components/v2/widgets/renderers/DonutWidget.tsx`
- `src/components/v2/widgets/renderers/BigNumberWidget.tsx`
- `src/components/v2/widgets/renderers/BarChartWidget.tsx`
- `src/components/v2/widgets/renderers/AreaLineWidget.tsx`
- `src/components/v2/widgets/renderers/ProgressBarWidget.tsx`
- `src/components/v2/widgets/renderers/PieBreakdownWidget.tsx`

### Verify

- `/v2/admin/widgets` shows empty grid with "Add Widget"
- Pick widget type from catalog -> config panel appears
- Fill in 5 fields -> live preview updates
- Save -> widget appears in grid
- Edit/delete works
- Widgets persist across page refresh

---

## Phase 4: Public Views (3-5 days)

Goals overview, drill-down, and Launch Traction dashboard.

### Layout to build

- `src/components/v2/layout/V2PublicLayout.tsx` — branded header (org logo, name, colors), full-width, no sidebar. Conditionally renders hierarchical or launch-traction based on `templateMode`.

### Pages to build

| Page                                       | Wireframe | Description                           |
| ------------------------------------------ | --------- | ------------------------------------- |
| `src/pages/v2/public/V2GoalsOverview.tsx`  | Screen 8  | Objective cards grid                  |
| `src/pages/v2/public/V2GoalDrillDown.tsx`  | Screen 9  | Objective + strategies + action items |
| `src/pages/v2/public/V2LaunchTraction.tsx` | Screen 11 | Widget dashboard (dark theme)         |

### Components to build

- `src/components/v2/public/ObjectiveCard.tsx` — card for overview grid
- `src/components/v2/public/StrategyList.tsx` — expandable strategy items in drill-down
- `src/components/v2/public/BrandedHeader.tsx` — org logo + name + plan title

### No new API endpoints

Reuses: plans/active, goals by plan, goals by id, goals children, widgets by org

### Verify

- `westside.lvh.me:5174/v2/` shows goals overview with real data
- Click objective -> drill-down shows strategies and action items
- Back navigation works
- `westside.lvh.me:5174/v2/traction` shows widget dashboard (if org has widgets)
- Different orgs show different branding

---

## Phase 5: Appearance & Import (3-5 days)

### Pages to build

| Page                                  | Wireframe | Description                     |
| ------------------------------------- | --------- | ------------------------------- |
| `src/pages/v2/admin/V2Appearance.tsx` | Screen 6  | Colors + logo + template mode   |
| `src/pages/v2/admin/V2Import.tsx`     | —         | File upload + preview + confirm |

### Appearance reuses

- `useAppearanceState` hook (reducer already built)
- `LogoUpload` component
- Color picker pattern from `BrandColorsSection.tsx`
- Existing `PUT /api/organizations/[slug]` to save

### Import reuses

- `import.service.ts`, `excelParser.service.ts`
- Existing import API endpoints (`api/imports/sessions/*`)
- V2 skips staged_metrics (uses widgets instead), keeps staged_goals

### Verify

- Change colors -> live preview updates -> save persists
- Upload logo -> appears in preview and public header
- Switch template mode -> public view changes between goals and traction
- Upload CSV -> goals auto-detected -> confirm -> appear in plan editor

---

## Phase 6: Cutover (3-5 days)

### Pre-cutover checklist

- [ ] All v2 screens functional with real data
- [ ] Existing org data renders correctly in v2
- [ ] Mobile responsive
- [ ] WCAG 2.1 AA accessibility
- [ ] Bundle size acceptable (lazy-load v2 pages)

### Step 1: Swap routers

Update `App.tsx` to use v2 routers. Remove `/v2` prefix from all route paths.

### Step 2: Metrics-to-widgets migration

Run a one-time script to convert existing `metrics` rows into `widgets` for each org that wants the launch-traction template. Most orgs keep hierarchical mode and don't need widgets.

### Step 3: Database cleanup migration

Drop tables: `schools`, `school_admins`, `stock_photos`, `status_overrides`, `staged_metrics`, `metric_time_series`, `metrics`
Drop ~25 columns from `goals` (status/progress override/calculation columns)
Drop `school_id` from `goals` and `plans`

### Step 4: Delete v1 code

- `src/pages/client/` (all v1 pages)
- `src/components/admin/` (v1 admin components, except LogoUpload)
- `src/components/homepage/` (v1 homepage)
- `src/layouts/ClientAdmin*`, `ClientPublic*`
- `src/middleware/SchoolAdminGuard.tsx`
- `src/hooks/useSchools.ts`, `useMetrics.ts`
- `src/lib/services/school*.service.ts`, `progressService.ts`, `metricTimeSeries.service.ts`
- `api/progress/`, `api/stock-photos.ts`, `api/metrics/`, `api/schools/`, `api/school-admins/`
- `api/lib/schema/schools.ts`, `stockPhotos.ts`, `progress.ts`, `metricTimeSeries.ts`

### Step 5: Rename v2 -> primary

Move `src/pages/v2/` -> `src/pages/`, merge `src/components/v2/` into `src/components/`, etc.

### Final table count: 13 (down from 19 + 1 new)

---

## Risk Mitigation

| Risk                         | Mitigation                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------- |
| V2 routes conflict with v1   | `/v2` prefix guarantees no collisions                                         |
| DB migration breaks v1       | Additive only until cutover — no drops                                        |
| Widget model too simple      | JSONB config is infinitely extensible                                         |
| Customer data loss           | No data deleted. Goals/plans untouched. Metrics kept until explicit migration |
| Bundle bloat during parallel | V2 pages lazy-loaded via React.lazy()                                         |
| Auth breaks                  | V2 uses identical auth (same Better Auth, same cookies, same guards)          |

## Timeline

| Phase                  | Duration | Running Total |
| ---------------------- | -------- | ------------- |
| 0: Foundation          | 1-2 days | 1-2 days      |
| 1: Auth & Onboarding   | 3-5 days | 4-7 days      |
| 2: Admin Core          | 5-8 days | 9-15 days     |
| 3: Widget System       | 5-8 days | 14-23 days    |
| 4: Public Views        | 3-5 days | 17-28 days    |
| 5: Appearance & Import | 3-5 days | 20-33 days    |
| 6: Cutover             | 3-5 days | 23-38 days    |

**Total: 4-8 weeks**
