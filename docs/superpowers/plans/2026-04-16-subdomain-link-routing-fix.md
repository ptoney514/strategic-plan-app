# Subdomain Link Routing Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 404 that occurs on any public district subdomain (e.g. `westside.lvh.me:5174`, `westside.stratadash.org`) when users click any internal goal/objective link, by centralizing public district URL construction on the existing `useDistrictLink()` hook and adding a regression guard.

**Architecture:** Seven public-view components each hardcode `` `/district/${slug}` `` when building internal hrefs. On a subdomain, middleware prepends `/district/<slug>` to every incoming path, so the hardcoded prefix gets applied twice → 404. The fix migrates those call sites to the existing `useDistrictLink()` hook (a single source of truth), fixes a latent bug in the hook's root-domain branch, and adds a grep-based unit test that fails CI if the old pattern reappears.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Vitest + React Testing Library · Playwright MCP for E2E smoke.

**Spec:** [docs/superpowers/specs/2026-04-16-subdomain-link-routing-fix-design.md](../specs/2026-04-16-subdomain-link-routing-fix-design.md)

---

## Preconditions

- Working directory: repo root (`/Users/pernelltoney/Projects/strategic-plan-app`).
- Current branch: `feat/chart-design`. Cut a fresh feature branch off it.
- Dev server NOT required until Task 9 (Playwright MCP smoke).
- Never pipe `npm run test:run` output through `head`/`tail` — it orphans vitest workers (see CLAUDE.md).

---

### Task 0: Branch + baseline

**Files:**

- None

- [ ] **Step 1: Cut the branch**

```bash
git checkout -b fix/subdomain-link-routing
```

- [ ] **Step 2: Verify baseline is green before we start**

Run: `npm run test:run`
Expected: exit 0. Record the passing-test count from the summary line (should be ≈852 per MEMORY.md). If it's red on main, stop and investigate — this plan assumes a green baseline.

- [ ] **Step 3: Verify lint + type-check are clean**

Run (both):

```bash
npm run lint
npm run type-check
```

Expected: exit 0 on both.

---

### Task 1: Fix `buildDistrictPathWithQueryParam` root-domain branch (Cycle 1 red→green)

**Files:**

- Modify: `src/lib/subdomain.ts` (lines 200 and 218)
- Test: `src/lib/__tests__/subdomain.test.ts` (create new)

- [ ] **Step 1: Check whether the test file already exists**

Run: `ls src/lib/__tests__/subdomain.test.ts 2>/dev/null || echo "create new"`
If it exists, append the describe block from Step 2 to the end of it. Otherwise create it fresh with the content from Step 2.

- [ ] **Step 2: Write the failing test**

Write (or append) to `src/lib/__tests__/subdomain.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  buildDistrictPath,
  buildDistrictPathWithQueryParam,
} from "../subdomain";

describe("buildDistrictPathWithQueryParam — root-domain branch", () => {
  it("returns /district/<slug><basePath> when isSubdomain=false", () => {
    expect(buildDistrictPathWithQueryParam("/goals", "westside", false)).toBe(
      "/district/westside/goals",
    );
  });

  it("returns /district/<slug><basePath> when isSubdomain=false and basePath has deep segments", () => {
    expect(
      buildDistrictPathWithQueryParam("/goals/abc-123", "westside", false),
    ).toBe("/district/westside/goals/abc-123");
  });

  it("returns basePath unchanged on a real subdomain", () => {
    // Note: on a real (non-query-param) subdomain, isQueryParamSubdomain() is false
    // in jsdom because window.location.hostname is 'localhost', which IS a
    // query-param host — so the query-param branch fires. We assert the
    // query-param branch instead to document the real behavior in jsdom.
    expect(buildDistrictPathWithQueryParam("/goals", "westside", true)).toBe(
      "/goals?subdomain=westside",
    );
  });
});

describe("buildDistrictPath — root-domain branch", () => {
  it("returns /district/<slug><basePath> when isSubdomain=false", () => {
    expect(buildDistrictPath("/goals", "westside", false)).toBe(
      "/district/westside/goals",
    );
  });

  it("returns basePath unchanged when isSubdomain=true", () => {
    expect(buildDistrictPath("/goals", "westside", true)).toBe("/goals");
  });
});
```

- [ ] **Step 3: Run the test to confirm it fails**

Run: `npx vitest run src/lib/__tests__/subdomain.test.ts`
Expected: the two "returns /district/<slug>..." expectations fail with received `/westside/goals` and `/westside/goals/abc-123`. The subdomain expectations pass.

- [ ] **Step 4: Apply the minimal fix**

In `src/lib/subdomain.ts`, change the root-domain return on **line 206** inside `buildDistrictPath` from:

```ts
return `/${slug}${basePath}`;
```

to:

```ts
return `/district/${slug}${basePath}`;
```

Then change the root-domain return on **line 233** inside `buildDistrictPathWithQueryParam` from:

```ts
return `/${slug}${basePath}`;
```

to:

```ts
return `/district/${slug}${basePath}`;
```

Leave the subdomain and query-param branches in both functions untouched.

- [ ] **Step 5: Run the test to confirm it passes**

Run: `npx vitest run src/lib/__tests__/subdomain.test.ts`
Expected: all 5 tests PASS.

- [ ] **Step 6: Run the full suite**

Run: `npm run test:run`
Expected: no new failures. Passing count = baseline + 5.

- [ ] **Step 7: Commit**

```bash
git add src/lib/subdomain.ts src/lib/__tests__/subdomain.test.ts
git commit -m "$(cat <<'EOF'
fix(routing): correct root-domain branch in buildDistrictPath helpers

Both buildDistrictPath and buildDistrictPathWithQueryParam returned
/<slug><basePath> for path-based access, but the canonical route tree
is /district/<slug>/... — the /<slug>/... form points at a nonexistent
route. Returning the correct prefix unblocks path-based navigation and
prepares the helper for use by all public district views.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Lock `useDistrictLink` contract (Cycle 2)

**Files:**

- Test: `src/contexts/__tests__/SubdomainContext.test.tsx` (create new)

- [ ] **Step 1: Write the characterization + red tests**

Create `src/contexts/__tests__/SubdomainContext.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  SubdomainOverrideProvider,
  useDistrictLink,
} from "../SubdomainContext";

describe("useDistrictLink", () => {
  it("returns bare basePath on a district subdomain context", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SubdomainOverrideProvider slug="westside">
        {children}
      </SubdomainOverrideProvider>
    );

    const { result } = renderHook(() => useDistrictLink(), { wrapper });
    // In jsdom, window.location.hostname is 'localhost' which is treated
    // as a query-param subdomain host — so the query-param gets appended.
    expect(result.current("/goals/abc")).toBe("/goals/abc?subdomain=westside");
  });

  it("returns /district/<slug><basePath> when no district context is set (root)", () => {
    // With no SubdomainOverrideProvider wrapping, the hook falls through to
    // the real getSubdomainInfo() which returns {type: 'root', slug: null}
    // in jsdom. An empty slug still exercises the path-based branch:
    // buildDistrictPathWithQueryParam('/goals', '', false) → '/district//goals'.
    // This is ugly but documents the root-context fallback, and the render
    // tests in Task 3+ cover the realistic case.
    const { result } = renderHook(() => useDistrictLink("westside"));
    expect(result.current("/goals/abc")).toBe("/district/westside/goals/abc");
  });
});
```

- [ ] **Step 2: Run the tests**

Run: `npx vitest run src/contexts/__tests__/SubdomainContext.test.tsx`
Expected: both PASS. (Task 1 is what made the second one pass; if the second one fails with `/westside/goals/abc`, Task 1 wasn't applied correctly.)

- [ ] **Step 3: Commit**

```bash
git add src/contexts/__tests__/SubdomainContext.test.tsx
git commit -m "$(cat <<'EOF'
test(routing): lock useDistrictLink contract across subdomain/root contexts

Characterization + regression tests pinning the hook's behavior in both
the district-subdomain context (via SubdomainOverrideProvider) and the
root fallback. Guards against silent drift as we migrate call sites.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Migrate `PlanLandingView.tsx` (Cycle 3a)

**Files:**

- Modify: `src/views/v2/public/PlanLandingView.tsx` (line 43 and line 163)
- Test: `src/views/v2/public/__tests__/PlanLandingView.test.tsx` (create new)

- [ ] **Step 1: Write the failing render test**

Create `src/views/v2/public/__tests__/PlanLandingView.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/setup";
import { SubdomainOverrideProvider } from "@/contexts/SubdomainContext";
import { PlanLandingView } from "../PlanLandingView";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({}),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
    toString: vi.fn().mockReturnValue(""),
  }),
  usePathname: () => "/",
}));

vi.mock("@/hooks/useDistricts", () => ({
  useDistrict: () => ({
    data: { id: "org-1", name: "Westside", primary_color: "#1e3a5f" },
    isLoading: false,
  }),
}));

const mockUsePlansBySlug = vi.fn();
vi.mock("@/hooks/v2/usePlans", () => ({
  usePlansBySlug: (...args: unknown[]) => mockUsePlansBySlug(...args),
}));

const mockUseGoalsByPlan = vi.fn();
vi.mock("@/hooks/v2/useGoals", () => ({
  useGoalsByPlan: (...args: unknown[]) => mockUseGoalsByPlan(...args),
}));

const mockObjectives = [
  {
    id: "obj-1",
    goal_number: "1",
    title: "Student Achievement & Well-being",
    description: "Objective 1",
    overall_progress: 72,
    level: 0,
    status: "on_target",
    children: [
      {
        id: "g-1a",
        goal_number: "1.1",
        title: "Goal 1.1",
        level: 1,
        status: "on_target",
      },
      {
        id: "g-1b",
        goal_number: "1.2",
        title: "Goal 1.2",
        level: 1,
        status: "at_risk",
      },
    ],
  },
];

describe("PlanLandingView — link construction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePlansBySlug.mockReturnValue({
      data: [
        {
          id: "plan-1",
          name: "Strategic Plan 2025",
          is_active: true,
          is_public: true,
          start_date: "2021-09-01",
          end_date: "2026-08-31",
          updated_at: "2026-04-01",
          description: "Plan description",
        },
      ],
      isLoading: false,
    });
    mockUseGoalsByPlan.mockReturnValue({
      data: mockObjectives,
      isLoading: false,
    });
  });

  it("does not render any anchor href prefixed with /district/", () => {
    render(
      <SubdomainOverrideProvider slug="westside">
        <PlanLandingView />
      </SubdomainOverrideProvider>,
    );

    const links = screen.queryAllByRole("link");
    const badLinks = links
      .map((a) => a.getAttribute("href"))
      .filter(
        (href): href is string => !!href && href.startsWith("/district/"),
      );

    expect(badLinks).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `npx vitest run src/views/v2/public/__tests__/PlanLandingView.test.tsx`
Expected: FAIL — the view still navigates via `router.push(\`${basePath}/objectives/...\`)`(not a rendered anchor) but the objective-card click handler uses the hardcoded prefix. The test currently asserts against rendered`<a>`hrefs only;`PlanLandingView`uses a`<button>`+`router.push`, not `<Link>`. That means **the link-href assertion may incorrectly pass** as-is. To make the test truly red, add the following assertion below the first one inside the same `it` block:

```tsx
// The objective card's onClick routes via router.push — assert the
// computed path it would push, captured via the mocked router.
const card = screen.getByTestId("objective-card-1");
card.click();
expect(mockPush).toHaveBeenCalledWith("/objectives/obj-1");
```

Re-run. Expected: FAIL with `mockPush` called with `'/district/westside/objectives/obj-1'`.

- [ ] **Step 3: Apply the migration**

In `src/views/v2/public/PlanLandingView.tsx`:

Replace line 3 import:

```ts
import { useSubdomain } from "@/contexts/SubdomainContext";
```

with:

```ts
import { useSubdomain, useDistrictLink } from "@/contexts/SubdomainContext";
```

Replace lines 41–43:

```ts
const router = useRouter();
const { slug } = useSubdomain();
const { data: district } = useDistrict(slug || "");
const basePath = `/district/${slug}`;
```

with:

```ts
const router = useRouter();
const { slug } = useSubdomain();
const { data: district } = useDistrict(slug || "");
const link = useDistrictLink();
```

Replace line 163:

```ts
                onClick={() => router.push(`${basePath}/objectives/${obj.id}`)}
```

with:

```ts
                onClick={() => router.push(link(`/objectives/${obj.id}`))}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run src/views/v2/public/__tests__/PlanLandingView.test.tsx`
Expected: PASS.

- [ ] **Step 5: Run the full suite**

Run: `npm run test:run`
Expected: still green.

- [ ] **Step 6: Commit**

```bash
git add src/views/v2/public/PlanLandingView.tsx src/views/v2/public/__tests__/PlanLandingView.test.tsx
git commit -m "$(cat <<'EOF'
fix(routing): use useDistrictLink in PlanLandingView

Replaces the hardcoded /district/<slug> basePath with useDistrictLink()
so the objective-card navigation produces a bare /objectives/<id> href
on a subdomain (avoiding middleware double-prefix → 404) and a correct
/district/<slug>/objectives/<id> href on path-based access.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Migrate `PublicSidebarTree.tsx` (Cycle 3b — the reported bug)

**Files:**

- Modify: `src/components/v2/layout/PublicSidebarTree.tsx` (lines 5, 37–38, 76–78)
- Test: `src/components/v2/layout/__tests__/PublicSidebarTree.test.tsx` (create new)

- [ ] **Step 1: Write the failing render test**

Create `src/components/v2/layout/__tests__/PublicSidebarTree.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/setup";
import { SubdomainOverrideProvider } from "@/contexts/SubdomainContext";
import { PublicSidebarProvider } from "../PublicSidebarContext";
import { PublicSidebarTree } from "../PublicSidebarTree";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

const objectives = [
  {
    id: "obj-1",
    goal_number: "1",
    title: "Student Achievement & Well-being",
    level: 0,
    status: "on_target",
    overall_progress: 72,
    children: [
      {
        id: "g-1a",
        goal_number: "1.1",
        title: "Sense of belonging",
        level: 1,
        status: "on_target",
        overall_progress: 80,
        children: [],
      },
    ],
  },
];

describe("PublicSidebarTree — link construction", () => {
  it("does not render any anchor href prefixed with /district/", () => {
    render(
      <SubdomainOverrideProvider slug="westside">
        <PublicSidebarProvider>
          <PublicSidebarTree objectives={objectives} />
        </PublicSidebarProvider>
      </SubdomainOverrideProvider>,
    );

    const links = screen.getAllByRole("link");
    const badLinks = links
      .map((a) => a.getAttribute("href"))
      .filter(
        (href): href is string => !!href && href.startsWith("/district/"),
      );

    expect(badLinks).toEqual([]);
    // Positive assertion: the objective link should be a bare /objectives/<id>.
    expect(
      links.some((a) => a.getAttribute("href") === "/objectives/obj-1"),
    ).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `npx vitest run src/components/v2/layout/__tests__/PublicSidebarTree.test.tsx`
Expected: FAIL — `badLinks` contains `/district/westside/objectives/obj-1` (and the child goal).

- [ ] **Step 3: Apply the migration**

In `src/components/v2/layout/PublicSidebarTree.tsx`:

Replace line 5:

```ts
import { useSubdomain } from "@/contexts/SubdomainContext";
```

with:

```ts
import { useDistrictLink } from "@/contexts/SubdomainContext";
```

Replace lines 36–38:

```ts
const pathname = usePathname();
const { slug } = useSubdomain();
const basePath = `/district/${slug}`;
```

with:

```ts
const pathname = usePathname();
const link = useDistrictLink();
```

Replace lines 76–78:

```ts
const href = isObjective
  ? `${basePath}/objectives/${node.id}`
  : `${basePath}/goals/${node.id}`;
```

with:

```ts
const href = isObjective
  ? link(`/objectives/${node.id}`)
  : link(`/goals/${node.id}`);
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run src/components/v2/layout/__tests__/PublicSidebarTree.test.tsx`
Expected: PASS.

- [ ] **Step 5: Run the full suite**

Run: `npm run test:run`
Expected: still green.

- [ ] **Step 6: Commit**

```bash
git add src/components/v2/layout/PublicSidebarTree.tsx src/components/v2/layout/__tests__/PublicSidebarTree.test.tsx
git commit -m "$(cat <<'EOF'
fix(routing): use useDistrictLink in PublicSidebarTree

Fixes the user-reported 404 on westside.lvh.me:5174 when clicking a
sidebar tree node. The tree built hrefs as /district/<slug>/... which,
after middleware rewrite on the subdomain, produced
/district/<slug>/district/<slug>/... → 404.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Migrate `PublicSidebarLayout.tsx` (Cycle 3c)

**Files:**

- Modify: `src/components/v2/layout/PublicSidebarLayout.tsx` (lines 5, 64–66, 106, 112, 118)
- Test: `src/components/v2/layout/__tests__/PublicSidebarLayout.test.tsx` (create new)

- [ ] **Step 1: Write the failing render test**

Create `src/components/v2/layout/__tests__/PublicSidebarLayout.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/setup";
import { SubdomainOverrideProvider } from "@/contexts/SubdomainContext";
import { PublicSidebarLayout } from "../PublicSidebarLayout";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/hooks/useDistricts", () => ({
  useDistrict: () => ({
    data: { id: "org-1", name: "Westside", primary_color: "#1e3a5f" },
    isLoading: false,
  }),
}));

const mockUsePlansBySlug = vi.fn();
vi.mock("@/hooks/v2/usePlans", () => ({
  usePlansBySlug: (...args: unknown[]) => mockUsePlansBySlug(...args),
}));

const mockUseGoalsByPlan = vi.fn();
vi.mock("@/hooks/v2/useGoals", () => ({
  useGoalsByPlan: (...args: unknown[]) => mockUseGoalsByPlan(...args),
}));

describe("PublicSidebarLayout — nav link construction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePlansBySlug.mockReturnValue({
      data: [
        {
          id: "plan-1",
          is_active: true,
          is_public: true,
          start_date: "2021-09-01",
          end_date: "2026-08-31",
          updated_at: "2026-04-01",
        },
      ],
      isLoading: false,
    });
    mockUseGoalsByPlan.mockReturnValue({ data: [], isLoading: false });
  });

  it("renders nav items with bare hrefs, never prefixed with /district/", () => {
    render(
      <SubdomainOverrideProvider slug="westside">
        <PublicSidebarLayout>
          <div>content</div>
        </PublicSidebarLayout>
      </SubdomainOverrideProvider>,
    );

    const links = screen.getAllByRole("link");
    const badLinks = links
      .map((a) => a.getAttribute("href"))
      .filter(
        (href): href is string => !!href && href.startsWith("/district/"),
      );

    expect(badLinks).toEqual([]);
    expect(links.some((a) => a.getAttribute("href") === "/objectives")).toBe(
      true,
    );
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `npx vitest run src/components/v2/layout/__tests__/PublicSidebarLayout.test.tsx`
Expected: FAIL — nav items render as `/district/westside/objectives` etc.

- [ ] **Step 3: Apply the migration**

In `src/components/v2/layout/PublicSidebarLayout.tsx`:

Replace line 5:

```ts
import { useSubdomain } from "@/contexts/SubdomainContext";
```

with:

```ts
import { useSubdomain, useDistrictLink } from "@/contexts/SubdomainContext";
```

Replace lines 63–66:

```ts
const pathname = usePathname();
const { slug } = useSubdomain();
const { data: district } = useDistrict(slug || "");
const basePath = `/district/${slug}`;
```

with:

```ts
const pathname = usePathname();
const { slug } = useSubdomain();
const { data: district } = useDistrict(slug || "");
const link = useDistrictLink();
const homeHref = link("/");
```

Then update the three nav-item `href` fields (lines ~106, 112, 118). The third one (`/objectives`) is a simple swap; the first two use hash fragments and must preserve them. Replace:

```ts
      href: `${basePath}#district-identity`,
      ...
      href: `${basePath}#plan-health`,
      ...
      href: `${basePath}/objectives`,
      ...
```

with:

```ts
      href: `${homeHref}#district-identity`,
      ...
      href: `${homeHref}#plan-health`,
      ...
      href: link('/objectives'),
      ...
```

Also update the `isActive` checks that compare against `basePath` (line 107 and 113) to use `homeHref` instead:

```ts
      isActive: pathname === basePath && currentHash !== '#plan-health',
      ...
      isActive: pathname === basePath && currentHash === '#plan-health',
```

becomes:

```ts
      isActive: pathname === homeHref && currentHash !== '#plan-health',
      ...
      isActive: pathname === homeHref && currentHash === '#plan-health',
```

**Note about `homeHref` on a subdomain:** `link('/')` returns `'/'` on a real subdomain and `'/?subdomain=westside'` in the localhost query-param case. When used in a template string like `` `${homeHref}#district-identity` `` on a subdomain, that produces `/#district-identity` — correct. On query-param localhost the query gets concatenated before the hash, which is technically malformed (`/?subdomain=westside#district-identity` is fine, but `/objectives?subdomain=westside` is what `link('/objectives')` returns). This is consistent with the pre-existing behavior of other query-param hrefs in the codebase; no regression.

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run src/components/v2/layout/__tests__/PublicSidebarLayout.test.tsx`
Expected: PASS.

- [ ] **Step 5: Run the full suite**

Run: `npm run test:run`
Expected: still green. If `PublicSidebarLayout.test.tsx` (pre-existing) fails because the pathname `'/'` no longer matches `basePath`, update that test's expectations to use `link('/')` semantics.

- [ ] **Step 6: Commit**

```bash
git add src/components/v2/layout/PublicSidebarLayout.tsx src/components/v2/layout/__tests__/PublicSidebarLayout.test.tsx
git commit -m "$(cat <<'EOF'
fix(routing): use useDistrictLink in PublicSidebarLayout nav items

District overview, plan health, and objectives nav items now build hrefs
via the shared hook, so they produce bare paths on a subdomain and avoid
the middleware double-prefix 404.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Migrate `ObjectivesOverviewView.tsx` (Cycle 3d)

**Files:**

- Modify: `src/views/v2/public/ObjectivesOverviewView.tsx` (lines 3, 25–27, 49, 99)
- Test: `src/views/v2/public/__tests__/ObjectivesOverviewView.test.tsx` (create new)

- [ ] **Step 1: Write the failing render test**

Create `src/views/v2/public/__tests__/ObjectivesOverviewView.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/setup";
import { SubdomainOverrideProvider } from "@/contexts/SubdomainContext";
import { ObjectivesOverviewView } from "../ObjectivesOverviewView";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({}),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
    toString: vi.fn().mockReturnValue(""),
  }),
  usePathname: () => "/objectives",
}));

const mockUsePlansBySlug = vi.fn();
vi.mock("@/hooks/v2/usePlans", () => ({
  usePlansBySlug: (...args: unknown[]) => mockUsePlansBySlug(...args),
}));

const mockUseGoalsByPlan = vi.fn();
vi.mock("@/hooks/v2/useGoals", () => ({
  useGoalsByPlan: (...args: unknown[]) => mockUseGoalsByPlan(...args),
}));

const objectives = [
  {
    id: "obj-1",
    goal_number: "1",
    title: "Obj 1",
    level: 0,
    status: "on_target",
    children: [],
  },
];

describe("ObjectivesOverviewView — link construction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePlansBySlug.mockReturnValue({
      data: [
        {
          id: "plan-1",
          is_active: true,
          is_public: true,
          updated_at: "2026-04-01",
        },
      ],
      isLoading: false,
    });
    mockUseGoalsByPlan.mockReturnValue({ data: objectives, isLoading: false });
  });

  it("breadcrumb Plan href is bare (not /district/...)", () => {
    render(
      <SubdomainOverrideProvider slug="westside">
        <ObjectivesOverviewView />
      </SubdomainOverrideProvider>,
    );

    const links = screen.getAllByRole("link");
    const badLinks = links
      .map((a) => a.getAttribute("href"))
      .filter(
        (href): href is string => !!href && href.startsWith("/district/"),
      );

    expect(badLinks).toEqual([]);
  });

  it("card click navigates to /objectives/<id>, not /district/...", () => {
    render(
      <SubdomainOverrideProvider slug="westside">
        <ObjectivesOverviewView />
      </SubdomainOverrideProvider>,
    );

    screen.getByTestId("objectives-overview-card-1").click();
    expect(mockPush).toHaveBeenCalledWith("/objectives/obj-1");
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `npx vitest run src/views/v2/public/__tests__/ObjectivesOverviewView.test.tsx`
Expected: FAIL — `mockPush` called with `/district/westside/objectives/obj-1`.

- [ ] **Step 3: Apply the migration**

In `src/views/v2/public/ObjectivesOverviewView.tsx`:

Replace line 3:

```ts
import { useSubdomain } from "@/contexts/SubdomainContext";
```

with:

```ts
import { useDistrictLink } from "@/contexts/SubdomainContext";
```

Replace lines 25–27:

```ts
const router = useRouter();
const { slug } = useSubdomain();
const basePath = `/district/${slug}`;
```

with:

```ts
const router = useRouter();
const link = useDistrictLink();
const homeHref = link("/");
```

Also replace line 28 — the `slug` variable is still used inside the same function (check usage):

Run a grep to verify:

```bash
grep -n "slug" src/views/v2/public/ObjectivesOverviewView.tsx
```

If `slug` is still referenced in `usePlansBySlug(slug || '')` and `useGoalsByPlan(...)`, keep `useSubdomain` alongside `useDistrictLink`. The correct replacement for line 3 is then:

```ts
import { useSubdomain, useDistrictLink } from "@/contexts/SubdomainContext";
```

and lines 25–27 become:

```ts
const router = useRouter();
const { slug } = useSubdomain();
const link = useDistrictLink();
const homeHref = link("/");
```

Replace line 49:

```ts
            { label: 'Plan', href: basePath },
```

with:

```ts
            { label: 'Plan', href: homeHref },
```

Replace line 99:

```ts
              onClick={() => router.push(`${basePath}/objectives/${obj.id}`)}
```

with:

```ts
              onClick={() => router.push(link(`/objectives/${obj.id}`))}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run src/views/v2/public/__tests__/ObjectivesOverviewView.test.tsx`
Expected: PASS.

- [ ] **Step 5: Run the full suite**

Run: `npm run test:run`
Expected: still green.

- [ ] **Step 6: Commit**

```bash
git add src/views/v2/public/ObjectivesOverviewView.tsx src/views/v2/public/__tests__/ObjectivesOverviewView.test.tsx
git commit -m "$(cat <<'EOF'
fix(routing): use useDistrictLink in ObjectivesOverviewView

Card navigation and breadcrumb now use the shared hook; bare paths on
subdomain, correct path-based form on root.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Migrate `ObjectiveDetailView.tsx` (Cycle 3e)

**Files:**

- Modify: `src/views/v2/public/ObjectiveDetailView.tsx` (lines 3, 24–26, 65, 148)
- Test: `src/views/v2/public/__tests__/ObjectiveDetailView.test.tsx` (exists — add new describe block)

- [ ] **Step 1: Inspect the existing test file to understand its mock setup**

Run: `ls src/views/v2/public/__tests__/ObjectiveDetailView.test.tsx && head -60 src/views/v2/public/__tests__/ObjectiveDetailView.test.tsx`
Reuse whatever mocks the existing test already has — don't duplicate them.

- [ ] **Step 2: Add the failing describe block**

Append this describe block to the existing test file (don't overwrite it):

```tsx
import { SubdomainOverrideProvider } from "@/contexts/SubdomainContext";

describe("ObjectiveDetailView — link construction", () => {
  // Reuse the beforeEach data setup from the existing describe — if the
  // existing file mocks useSubdomain directly, use SubdomainOverrideProvider
  // only after removing that vi.mock for this describe.
  it("does not render any href prefixed with /district/", () => {
    // Arrange: the same plan + objective + children data the existing tests use.
    // (Copy-paste the beforeEach body here if isolation is needed.)

    render(
      <SubdomainOverrideProvider slug="westside">
        <ObjectiveDetailView />
      </SubdomainOverrideProvider>,
    );

    const links = screen.queryAllByRole("link");
    const badLinks = links
      .map((a) => a.getAttribute("href"))
      .filter(
        (href): href is string => !!href && href.startsWith("/district/"),
      );

    expect(badLinks).toEqual([]);
  });
});
```

If the existing file uses `vi.mock('@/contexts/SubdomainContext', ...)` at the module level, the `SubdomainOverrideProvider` wrapper won't do anything — instead update the existing mock to return `useDistrictLink: () => (path: string) => path` (the identity pattern used in `V2GoalsOverview.test.tsx:25`) and assert `mockPush` received bare paths like `/goals/obj-1-child-1`.

- [ ] **Step 3: Run the test to confirm it fails**

Run: `npx vitest run src/views/v2/public/__tests__/ObjectiveDetailView.test.tsx`
Expected: FAIL — existing source still uses `basePath`.

- [ ] **Step 4: Apply the migration**

In `src/views/v2/public/ObjectiveDetailView.tsx`:

Replace line 3:

```ts
import { useSubdomain } from "@/contexts/SubdomainContext";
```

with:

```ts
import { useSubdomain, useDistrictLink } from "@/contexts/SubdomainContext";
```

Replace lines 24–26:

```ts
const router = useRouter();
const { slug } = useSubdomain();
const basePath = `/district/${slug}`;
```

with:

```ts
const router = useRouter();
const { slug } = useSubdomain();
const link = useDistrictLink();
const homeHref = link("/");
```

Replace line 65:

```ts
          { label: 'Plan', href: basePath },
```

with:

```ts
          { label: 'Plan', href: homeHref },
```

Replace line 148:

```ts
              onClick={() => router.push(`${basePath}/goals/${child.id}`)}
```

with:

```ts
              onClick={() => router.push(link(`/goals/${child.id}`))}
```

- [ ] **Step 5: Run the test to confirm it passes**

Run: `npx vitest run src/views/v2/public/__tests__/ObjectiveDetailView.test.tsx`
Expected: PASS.

- [ ] **Step 6: Run the full suite**

Run: `npm run test:run`
Expected: still green.

- [ ] **Step 7: Commit**

```bash
git add src/views/v2/public/ObjectiveDetailView.tsx src/views/v2/public/__tests__/ObjectiveDetailView.test.tsx
git commit -m "$(cat <<'EOF'
fix(routing): use useDistrictLink in ObjectiveDetailView

Goal-card click and breadcrumb Plan link go through the shared hook.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Migrate `GoalDetailView.tsx` (Cycle 3f)

**Files:**

- Modify: `src/views/v2/public/GoalDetailView.tsx` (lines 5, 45–47, 137, 148, 154, 155, 163, 164, 167)
- Test: `src/views/v2/public/__tests__/GoalDetailView.test.tsx` (exists — add new describe block)

- [ ] **Step 1: Inspect the existing test**

Run: `head -80 src/views/v2/public/__tests__/GoalDetailView.test.tsx`
Note its mock setup.

- [ ] **Step 2: Add the failing describe block**

Append:

```tsx
import { SubdomainOverrideProvider } from "@/contexts/SubdomainContext";

describe("GoalDetailView — link construction", () => {
  it("produces bare hrefs (not prefixed with /district/) for all links", () => {
    // Reuse the existing test's lineage mock data. If the existing file
    // mocks useSubdomain/useDistrictLink at the module level, switch its
    // useDistrictLink mock to identity: `useDistrictLink: () => (p: string) => p`
    // and drop the SubdomainOverrideProvider wrapper.
    render(
      <SubdomainOverrideProvider slug="westside">
        <GoalDetailView />
      </SubdomainOverrideProvider>,
    );

    const links = screen.queryAllByRole("link");
    const badLinks = links
      .map((a) => a.getAttribute("href"))
      .filter(
        (href): href is string => !!href && href.startsWith("/district/"),
      );

    expect(badLinks).toEqual([]);
  });
});
```

- [ ] **Step 3: Run to confirm FAIL**

Run: `npx vitest run src/views/v2/public/__tests__/GoalDetailView.test.tsx`
Expected: FAIL.

- [ ] **Step 4: Apply the migration**

In `src/views/v2/public/GoalDetailView.tsx`:

Replace line 5:

```ts
import { useSubdomain } from "@/contexts/SubdomainContext";
```

with:

```ts
import { useSubdomain, useDistrictLink } from "@/contexts/SubdomainContext";
```

Replace lines 45–47:

```ts
const { slug } = useSubdomain();
const basePath = `/district/${slug}`;
```

with:

```ts
const { slug } = useSubdomain();
const link = useDistrictLink();
const homeHref = link("/");
```

Replace line 137:

```ts
      href: `${basePath}/goals/${child.id}`,
```

with:

```ts
      href: link(`/goals/${child.id}`),
```

Replace line 148:

```ts
    { label: 'Plan', href: basePath },
```

with:

```ts
    { label: 'Plan', href: homeHref },
```

Replace lines 153–155:

```ts
const href = isLast
  ? undefined
  : node.level === 0
    ? `${basePath}/objectives/${node.id}`
    : `${basePath}/goals/${node.id}`;
```

with:

```ts
const href = isLast
  ? undefined
  : node.level === 0
    ? link(`/objectives/${node.id}`)
    : link(`/goals/${node.id}`);
```

Replace lines 161–167:

```ts
const backHref = parentNode
  ? parentNode.level === 0
    ? `${basePath}/objectives/${parentNode.id}`
    : `${basePath}/goals/${parentNode.id}`
  : objective
    ? `${basePath}/objectives/${objective.id}`
    : `${basePath}/objectives`;
```

with:

```ts
const backHref = parentNode
  ? parentNode.level === 0
    ? link(`/objectives/${parentNode.id}`)
    : link(`/goals/${parentNode.id}`)
  : objective
    ? link(`/objectives/${objective.id}`)
    : link("/objectives");
```

- [ ] **Step 5: Run to confirm PASS**

Run: `npx vitest run src/views/v2/public/__tests__/GoalDetailView.test.tsx`
Expected: PASS.

- [ ] **Step 6: Run the full suite**

Run: `npm run test:run`
Expected: still green.

- [ ] **Step 7: Commit**

```bash
git add src/views/v2/public/GoalDetailView.tsx src/views/v2/public/__tests__/GoalDetailView.test.tsx
git commit -m "$(cat <<'EOF'
fix(routing): use useDistrictLink throughout GoalDetailView

Breadcrumb, back link, sub-goal accordion links, and per-child hrefs all
go through the shared hook. Last of the seven public call sites; the
regression guard (next task) locks the pattern in.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Regression guard (Cycle 4)

**Files:**

- Test: `src/lib/__tests__/no-hardcoded-district-paths.test.ts` (create new)

- [ ] **Step 1: Write the guard test**

Create `src/lib/__tests__/no-hardcoded-district-paths.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(__dirname, "..", "..");
const SCANNED_DIRS = [
  join(ROOT, "views", "v2", "public"),
  join(ROOT, "components", "v2", "layout"),
];

const FORBIDDEN_PATTERNS = [
  { pattern: /`\/district\/\$\{/, label: "template literal `/district/${...}" },
  {
    pattern: /const\s+basePath\s*=\s*`\/district\//,
    label: "const basePath = `/district/...`",
  },
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) {
      if (entry === "__tests__") continue; // tests may legitimately reference the pattern
      out.push(...walk(full));
    } else if (
      s.isFile() &&
      (entry.endsWith(".ts") || entry.endsWith(".tsx"))
    ) {
      out.push(full);
    }
  }
  return out;
}

describe("no hardcoded /district/ paths in public views/layouts", () => {
  it("all files under views/v2/public and components/v2/layout use useDistrictLink()", () => {
    const files = SCANNED_DIRS.flatMap(walk);
    const offenders: Array<{ file: string; line: number; pattern: string }> =
      [];

    for (const file of files) {
      const content = readFileSync(file, "utf8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        for (const { pattern, label } of FORBIDDEN_PATTERNS) {
          if (pattern.test(line)) {
            offenders.push({
              file: relative(ROOT, file),
              line: idx + 1,
              pattern: label,
            });
          }
        }
      });
    }

    if (offenders.length > 0) {
      const msg = offenders
        .map((o) => `  ${o.file}:${o.line} — ${o.pattern}`)
        .join("\n");
      throw new Error(
        `Hardcoded /district/ path literals found. Use useDistrictLink() from src/contexts/SubdomainContext.tsx instead:\n${msg}`,
      );
    }

    expect(offenders).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the guard test**

Run: `npx vitest run src/lib/__tests__/no-hardcoded-district-paths.test.ts`
Expected: PASS. If it fails, a migration task missed a site — grep the reported file/line and replace with `link(...)`.

- [ ] **Step 3: Run the full suite one more time**

Run: `npm run test:run`
Expected: green. Passing count = baseline + new tests (~14 added across all tasks).

- [ ] **Step 4: Commit**

```bash
git add src/lib/__tests__/no-hardcoded-district-paths.test.ts
git commit -m "$(cat <<'EOF'
test(routing): guard test prevents hardcoded /district/<slug> paths

Walks src/views/v2/public/ and src/components/v2/layout/ and asserts no
source file contains a template-literal /district/\${...} path or a
const basePath = \`/district/ declaration. Failure message points
developers at useDistrictLink().

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Lint + type-check + final suite

**Files:** none

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: exit 0. If any ESLint warning appeared in files we touched, fix it before moving on.

- [ ] **Step 2: Type-check**

Run: `npm run type-check`
Expected: exit 0.

- [ ] **Step 3: Full suite (no piping)**

Run: `npm run test:run`
Expected: green. Record passing count for PR description.

---

### Task 11: Playwright MCP smoke (Cycle 5)

**Files:** none; screenshots saved to working dir for PR attachment.

- [ ] **Step 1: Start dev server**

Run: `npm run dev:api` in background (required for auth + data fetch). Wait for "Ready on http://localhost:5174" in the log.

- [ ] **Step 2: Subdomain home**

Use Playwright MCP `browser_navigate` to `http://westside.lvh.me:5174/`. Then `browser_snapshot`. Confirm the plan landing renders.

- [ ] **Step 3: Inspect rendered hrefs**

`browser_evaluate` with this snippet:

```js
Array.from(document.querySelectorAll("a"))
  .map((a) => a.getAttribute("href"))
  .filter((h) => h && h.startsWith("/district/"));
```

Expected result: `[]`.

- [ ] **Step 4: Click into an objective card**

`browser_click` the first objective card. Expected: URL becomes `/objectives/<uuid>`, objective detail renders. Take screenshot: `browser_take_screenshot` → save as `/tmp/routing-fix-objective-detail.png`.

- [ ] **Step 5: Click a goal from the sidebar**

`browser_click` a sidebar goal node. Expected: URL becomes `/goals/<uuid>`, goal detail renders. Screenshot → `/tmp/routing-fix-goal-detail.png`.

- [ ] **Step 6: Breadcrumb back to plan**

`browser_click` the breadcrumb `Plan`. Expected: URL becomes `/`. Screenshot → `/tmp/routing-fix-home.png`.

- [ ] **Step 7: Path-based fallback**

`browser_navigate` to `http://lvh.me:5174/district/westside`. Expected: home renders. Click into an objective — expected URL `/district/westside/objectives/<uuid>`. Screenshot → `/tmp/routing-fix-path-based.png`.

- [ ] **Step 8: Stop dev server**

Kill the background server.

---

### Task 12: Push + PR

**Files:** none

- [ ] **Step 1: Review the diff**

Run: `git log --oneline feat/chart-design..HEAD`
Confirm 10 commits in the expected order. Run `git diff feat/chart-design..HEAD --stat` for a quick size sanity check.

- [ ] **Step 2: Push**

```bash
git push -u origin fix/subdomain-link-routing
```

- [ ] **Step 3: Open PR**

Base branch: `feat/chart-design` (or `main` if the user prefers; ask first).

```bash
gh pr create --base feat/chart-design --title "fix(routing): resolve subdomain 404 on goal/objective links" --body "$(cat <<'EOF'
## Summary
- Fixes 404 on `westside.lvh.me:5174` (and prod subdomains) when clicking any internal goal/objective link, caused by double-prefixing `/district/<slug>` in both middleware and hardcoded component hrefs.
- Migrates 6 public views/layouts to the existing `useDistrictLink()` hook (single source of truth).
- Corrects a latent bug in `buildDistrictPath(WithQueryParam)` where the root-domain branch returned `/<slug>/...` instead of `/district/<slug>/...`.
- Adds a grep-based regression guard that fails CI if the old pattern reappears.

Spec: `docs/superpowers/specs/2026-04-16-subdomain-link-routing-fix-design.md`
Plan: `docs/superpowers/plans/2026-04-16-subdomain-link-routing-fix.md`

## Test plan
- [x] Vitest green (baseline + ≈14 new tests)
- [x] `npm run lint`, `npm run type-check` clean
- [x] Playwright MCP smoke on `westside.lvh.me:5174` — no `/district/` hrefs; objective & goal clicks land on the right pages
- [x] Path-based fallback via `http://lvh.me:5174/district/westside` still works
- [ ] Vercel preview smoke (verify on PR preview URL using `?subdomain=westside`)

Screenshots attached: subdomain home, objective detail, goal detail, path-based home.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 4: Attach screenshots**

After the PR is created, attach the four screenshots from `/tmp/routing-fix-*.png` as comments or drag-drop in the GitHub UI.

- [ ] **Step 5: Verify preview deploy + smoke**

Wait for Vercel to post the preview URL in the PR. Visit `https://<preview-url>?subdomain=westside`. Confirm home renders and a goal click keeps the URL under the preview host without the `/district/` double prefix.

---

## Self-Review (post-plan)

**Spec coverage.** Each numbered item in the spec maps to a task:

- Spec §"Change 1" → Task 1.
- Spec §"Change 2" (6 migrations) → Tasks 3, 4, 5, 6, 7, 8 (exact same order as the spec's Change 2 table).
- Spec §"Change 3" regression guard → Task 9.
- Spec §"Testing strategy" Cycle 1 → Task 1. Cycle 2 → Task 2. Cycles 3a–3f → Tasks 3–8. Cycle 4 → Task 9. Cycle 5 → Task 11.
- Spec §"Verification (exit criteria)" → Tasks 10, 11, 12.

No gaps.

**Placeholder scan.** No TBD/TODO/"implement later" anywhere. Every code change shows concrete before/after. Every command has an expected result. ✓

**Type consistency.** The new hook usage pattern is uniform across all 6 migration tasks: `const link = useDistrictLink(); const homeHref = link('/');` when both are needed, `const link = useDistrictLink();` when only relative paths are used. All six migration tasks call `link('/…')` with identical shape. ✓

**One soft spot flagged for the implementer:** Tasks 5, 6, 7, and 8 each introduce `homeHref = link('/')`. On query-param localhost this renders `'/?subdomain=westside'`, which then gets concatenated in hash-href templates (`${homeHref}#plan-health` → `/?subdomain=westside#plan-health`). That's URL-valid and functionally correct. If a test asserts exact hash-href strings, mock `useDistrictLink` to identity (`() => (p: string) => p`) in that test, matching the pattern already used in `src/views/v2/public/__tests__/V2GoalsOverview.test.tsx:25`.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-16-subdomain-link-routing-fix.md`.
