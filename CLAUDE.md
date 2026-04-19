# CLAUDE.md - Strategic Plan Builder

A comprehensive strategic planning system for educational districts to manage goals, metrics, and outcomes effectively.

## Project Overview

Modern web application built with Next.js + React for educational district strategic planning. Enables districts to create hierarchical goals, track metrics, and monitor progress toward strategic objectives.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack/Webpack)
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4.x
- **State Management**: Zustand (client state), React Query (server state)
- **Routing**: Next.js App Router (file-system based) + middleware for subdomain detection
- **Database**: Neon (PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth
- **API**: Next.js Route Handlers (in src/app/api/)
- **Charts**: Recharts
- **Testing**: Vitest + Testing Library
- **Legacy Fallback**: Vite 6.x (dev:vite, build:vite scripts preserved)

## Architecture Overview

### Key Design Decisions

- **Vite over Next.js**: 50% faster builds, better DX, simpler configuration
- **React Query for data fetching**: Better caching, reduced complexity, automatic refetching
- **Zustand for state**: Simpler than Redux for this scale, less boilerplate
- **Tailwind CSS**: Utility-first, consistent design system, rapid development
- **Better Auth**: Session-based authentication with cookie management, flexible adapter system
- **Drizzle ORM**: Type-safe SQL with schema-driven migrations
- **Neon**: Serverless PostgreSQL with HTTP driver, no connection pooling needed

### Accepted Trade-offs

- **No SSR**: Vite doesn't have built-in SSR (acceptable - admin app, SEO not critical)
- **Client-side routing**: Requires server rewrites (handled via vercel.json)
- **Bundle size**: ~1.68MB (target: reduce to <1MB with code splitting)

## Project Structure

```
strategic-plan-app/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/               # Route-level page components
│   │   ├── client/public/   # Public-facing district views
│   │   └── client/admin/    # Admin interface
│   ├── layouts/             # Layout wrappers
│   ├── hooks/               # Custom React hooks
│   ├── lib/
│   │   ├── api.ts           # Shared fetch helper (apiFetch, apiGet, apiPost, etc.)
│   │   ├── auth-client.ts   # Better Auth client
│   │   ├── services/        # Business logic & API calls
│   │   └── types/           # TypeScript interfaces
│   ├── middleware/          # Route guards
│   └── test/                # Test utilities
├── api/                     # Vercel Serverless Functions (Node.js runtime)
│   └── lib/
│       ├── auth.ts          # Better Auth server config
│       ├── db.ts            # Drizzle + Neon client
│       ├── response.ts      # Response helpers (jsonOk, jsonError, parsePagination)
│       └── schema/          # Drizzle ORM table schemas
├── drizzle/
│   ├── migrations/          # SQL migration files
│   └── custom/              # Custom trigger SQL
├── .claude/
│   ├── agents/              # Sub-agents
│   ├── commands/            # Slash commands (/pre-commit)
│   └── config.json          # Agent configuration
└── project_status.md        # Current project status
```

## Development Commands

### Essential commands

```bash
npm run dev              # Frontend only (Vite on port 5174) — no API routes
npm run dev:api          # Full-stack: frontend + API routes (vercel dev on port 5174)
npm test                 # Run tests in watch mode
npm run test:run         # Run tests once
npm run build            # Production build
npm run preview          # Preview production build
```

> **`dev` vs `dev:api`:** Use `npm run dev` for frontend-only work (faster startup). Use `npm run dev:api` when you need login/auth or any API route — it runs `vercel dev` which serves both the Vite frontend and the `api/` serverless functions. Requires the Vercel CLI (`npm i -g vercel`).

> **Note for AI agents:** Use `npm run test:run` (single run) instead of `npm test` (watch mode) to avoid spawning multiple background processes.
>
> **CRITICAL:** Never pipe test commands through `head`, `tail`, or other truncating commands (e.g., `npm run test:run | head -100`). This kills the parent process while leaving vitest worker processes orphaned, causing memory exhaustion that can crash the system. Always let test commands run to completion.

### Quality checks

```bash
npm run lint             # Lint code with ESLint
npm run lint:fix         # Lint and auto-fix issues
npm run type-check       # TypeScript type checking
```

### Database (Drizzle Kit)

```bash
npx drizzle-kit generate   # Generate migration from schema changes
npx drizzle-kit migrate    # Apply pending migrations to Neon
npx drizzle-kit studio     # Open Drizzle Studio (database browser)
```

## Database

### Neon PostgreSQL

The application uses [Neon](https://neon.tech) serverless PostgreSQL for production and cloud development.

- **Project**: `small-salad-72814952` (stratadash, us-east-1)
- **Database**: `strategic-plan-db`
- **Driver**: `@neondatabase/serverless` (HTTP-based, works in both Edge and Node.js runtimes)

### Neon Dev Branch (Local Development)

For local development, use a `dev` branch in the Neon project. This uses the same `@neondatabase/serverless` HTTP driver as production — no dual-driver complexity.

**One-time setup** (requires [neonctl](https://neon.tech/docs/reference/neon-cli)):

```bash
neonctl branches create --name dev --project-id small-salad-72814952
neonctl connection-string --branch dev --database-name strategic-plan-db --project-id small-salad-72814952
```

Copy the connection string into `.env.local` as `DATABASE_URL`, then:

```bash
cp .env.local.example .env.local     # Fill in DATABASE_URL, BETTER_AUTH_SECRET
npm run db:seed:fresh                 # Run migrations + seed
npm run dev:api                       # Full-stack dev server
```

**Reset dev data:** `npm run db:seed` (truncates + re-seeds)
**Sync schema:** `npm run db:seed:fresh` (runs migrations then seeds)

### Prerequisites

- Node.js 20+
- A Neon `DATABASE_URL` connection string (from Neon dashboard or `neonctl`)

### First-Time Setup

1. Copy environment template: `cp .env.local.example .env.local`
2. Set `DATABASE_URL` to your Neon connection string
3. Set `BETTER_AUTH_SECRET` to a random secret
4. Set `BETTER_AUTH_URL` to `http://localhost:5174`
5. Start development: `npm run dev`

### Cross-Subdomain Testing with lvh.me

For testing multi-district features (district switching, cross-subdomain authentication), use `lvh.me` which resolves to `127.0.0.1`:

| URL                           | Purpose                                 |
| ----------------------------- | --------------------------------------- |
| `http://lvh.me:5174`          | Root domain (marketing, user dashboard) |
| `http://westside.lvh.me:5174` | Westside district                       |
| `http://eastside.lvh.me:5174` | Eastside district                       |
| `http://admin.lvh.me:5174`    | System admin console                    |

**Key benefits:**

- Cookies with `.lvh.me` domain are shared across all subdomains
- Authentication sessions persist when switching between districts
- Mirrors production subdomain behavior exactly

**How it works:**

1. Start dev server: `npm run dev`
2. Navigate to `http://lvh.me:5174/login`
3. Login with test credentials
4. Navigate to `http://westside.lvh.me:5174/admin` - session persists!
5. Use district switcher to navigate between districts

**Fallback for localhost:**
If lvh.me doesn't work (some corporate networks block it), use query params:

- `http://localhost:5174?subdomain=westside`
- `http://localhost:5174?subdomain=admin`

Note: Query param mode doesn't support cross-subdomain cookie sharing.

### Test Credentials

Test users are created via the seed script (`scripts/seed.ts`) using Better Auth.

| Account        | Email                     | Password         | Access Level  |
| -------------- | ------------------------- | ---------------- | ------------- |
| System Admin   | `sysadmin@stratadash.com` | `Stratadash123!` | All districts |
| Westside Admin | `admin@westside66.org`    | `Westside123!`   | Westside only |
| Eastside Admin | `admin@eastside.edu`      | `Eastside123!`   | Eastside only |

**Login at:** http://localhost:5174/login

## Database Migration Workflow

### Creating a New Migration

1. **Modify Schema**
   - Edit the relevant Drizzle schema file in `api/lib/schema/`
   - Drizzle schemas are TypeScript -- changes are type-checked

2. **Generate Migration**

   ```bash
   npx drizzle-kit generate
   ```

   This diffs your schema files against the current migration state and generates a new SQL file in `drizzle/migrations/`.

3. **Review Generated SQL**
   - Check `drizzle/migrations/<number>_<name>.sql`
   - Verify correctness and check for destructive operations

4. **Apply Migration**

   ```bash
   npx drizzle-kit migrate
   ```

   This runs the migration against your Neon database.

5. **Commit and Push**

   ```bash
   git add drizzle/migrations/ api/lib/schema/
   git commit -m "feat(db): add user preferences table"
   ```

### Migration Checklist

- [ ] Schema changes type-check cleanly
- [ ] Migration generated and reviewed
- [ ] Migration applied to Neon database
- [ ] All tests passing
- [ ] No destructive operations without backup plan

### Journal Drift (known issue, 2026-04)

Prod Neon `main`'s Drizzle journal records all 10 migrations as applied, but `0009_v4_dashboard_schema.sql` was applied out-of-band via `psql` (Issue #166 incident) without updating the journal-writer's state. **Future `drizzle-kit migrate` runs against prod will skip `0009` because the journal says it's done.** This is safe today because every migration uses `IF NOT EXISTS` / `DROP CONSTRAINT IF EXISTS` — replay is a no-op.

**When this becomes unsafe:** the first migration that uses a non-idempotent statement (e.g. `INSERT` of seed data, `UPDATE` of existing rows). Before merging such a migration, reconcile via `drizzle-kit introspect` against prod and produce a baseline migration.

## CI Pipeline

Pull requests are validated via GitHub Actions.

### CI Job Flow

```
lint-typecheck
    ├──> unit-tests (parallel)
    └──> build (parallel)
```

**What's tested:**

1. **Linting & Type checking** - ESLint + TypeScript compiler
2. **Unit tests** - Vitest test suite
3. **Build** - Production build completes successfully

### CI Invariant

**If `main` CI is green, prod Neon is at HEAD's migration state.**

The `prod-db.yml` workflow runs on every push to `main` that touches `drizzle/migrations/`, `drizzle/custom/`, `_api/lib/schema/`, or the workflow itself. It applies pending migrations to prod Neon via `drizzle-kit migrate` before signaling success. If migrations fail, the workflow opens a `prod-incident` labeled issue and the commit shows a red X — the operator must reconcile prod Neon before users hit the broken Vercel deploy.

**This invariant only holds for paths the workflow watches.** Out-of-band schema changes (manual `psql` against prod, schema edits not accompanied by a generated migration) bypass the gate. Always run `npx drizzle-kit generate` after editing files in `_api/lib/schema/`.

This invariant exists because of [Issue #166](https://github.com/ptoney514/strategic-plan-app/issues/166): PR #162 shipped code referencing columns that didn't exist in prod, taking every public district page dark for ~a week.

## Preview/Staging Workflow

Every PR gets an isolated preview environment with its own database branch, enabling full-stack testing before merge.

### How It Works

```
PR opened/updated
  ├── Vercel creates Preview Deployment (automatic)
  ├── Neon-Vercel integration creates database branch + injects DATABASE_URL (automatic)
  └── GitHub Action (preview-db.yml) runs migrations + triggers + seed on that branch

PR closed/merged
  └── GitHub Action deletes Neon branch (cleanup)
```

**Full workflow:** Neon dev branch → Push PR → Vercel preview + Neon branch (auto-migrated, seeded) → Merge to main → Production

### Preview Environment Variables

| Variable             | Source                                  | Notes                             |
| -------------------- | --------------------------------------- | --------------------------------- |
| `DATABASE_URL`       | Neon-Vercel integration (auto-injected) | Points to PR-specific Neon branch |
| `BETTER_AUTH_SECRET` | Vercel env vars (Preview scope)         | Must match GitHub secret          |
| `BETTER_AUTH_URL`    | Auto-derived from `VERCEL_URL`          | Falls back in `api/lib/auth.ts`   |
| `VITE_ENVIRONMENT`   | Vercel env vars (Preview scope)         | Set to `preview`                  |

### Verifying a Preview Deployment

1. Open the Vercel preview URL from the PR
2. Login with test credentials (see Test Credentials section)
3. Verify data exists (goals, metrics, districts)
4. Check PR comments for "Preview Database Ready" confirmation

### Setup Requirements

The Neon-Vercel integration must be installed (one-time setup):

1. Install from https://vercel.com/marketplace/neon
2. Link to Neon project `small-salad-72814952`, database `strategic-plan-db`
3. Enable "Create a branch for each preview deployment"
4. Add `NEON_API_KEY` and `BETTER_AUTH_SECRET` as GitHub Actions secrets
5. Add `NEON_PROJECT_ID` as a GitHub Actions variable

### Branch Limits

Neon free tier allows 10 branches. The `preview-db.yml` workflow automatically deletes branches when PRs close. Keep PR count manageable.

## Critical Constraints

### What TO Do

- Use functional components only
- Write tests for utility functions and services
- Use async/await over .then()
- Comment complex business logic
- Keep components under 200 lines
- Use React Query for all server data fetching
- Use API-level middleware for authorization (requireAuth, requireOrgMember, requireSystemAdmin)
- Use Zod for form validation

### What NOT To Do

- Don't use class components
- Don't commit .env.local files
- Don't bypass TypeScript with `any`
- Don't skip error handling
- Don't mutate state directly
- Don't make direct database calls from frontend code
- Don't create components over 200 lines without refactoring

## Testing Philosophy

Our testing strategy prioritizes **confidence over coverage**. Write tests that give you confidence to ship.

### Testing Pyramid

1. **Unit Tests (60%)** - Services, utilities, calculations
2. **Integration Tests (30%)** - Components with React Query
3. **E2E Tests (10%)** - Critical user flows

### Coverage Targets

- Critical paths: 100%
- Components: >80%
- Utilities: >90%
- Custom hooks: >85%

### Testing Framework

- **Vitest** for unit tests
- **Testing Library** for component tests
- **ResizeObserver** mocked for Recharts
- Tests mirror `src/` structure in `__tests__/`

## Development Pattern: Tests-as-You-Go (Encouraged)

When building features or fixing bugs, consider:

1. Writing a test that specifies the behavior
2. Implementing minimum code to pass
3. Refactoring while keeping tests green

### What to Test (When Practical)

- User-facing behavior, not implementation details
- Edge cases and error states
- Integration points (API calls, database operations)

Note: Tests encouraged but not strictly required for MVP pace. Focus on critical paths first.

## Performance Budgets

### Build Performance

- Vite build time: <15s (currently ~12s)
- TypeScript compilation: <5s

### Runtime Performance

- Bundle Size (gzipped): <600KB (currently ~480KB)
- Time to Interactive: <2s
- Lighthouse Score: >90 (currently 92)

### Database Performance

- Query Response: <500ms for 90th percentile
- Goal Hierarchy Fetch: <300ms for 3-level deep
- Dashboard Load: <1s with 100+ goals

### Optimization Checklist

- [ ] Images optimized and lazy-loaded
- [ ] Route-based code splitting
- [ ] React Query caching configured
- [ ] Database indexes on frequently queried columns
- [ ] Pagination for large lists (>50 items)
- [ ] Debounced search inputs
- [ ] Memoized expensive calculations

## Accessibility Standards

All features must meet **WCAG 2.1 Level AA** standards.

### Core Requirements

- Semantic HTML (proper headings, landmarks)
- Keyboard navigation (all interactive elements)
- Screen reader support (ARIA labels, alt text)
- Color contrast (4.5:1 for text, 3:1 for large text)
- Focus indicators (never removed)
- Form labels (every input labeled)

### Common Pitfalls to Avoid

- `<div>` or `<span>` as buttons (use `<button>`)
- Removing focus outlines
- Poor color contrast in status indicators
- Missing alt text on images
- Non-descriptive link text ("click here")

## Database Conventions

### Table Naming

- Hierarchical data uses `parent_id` self-referencing
- UUIDs for all primary keys
- Soft deletes where appropriate
- Drizzle schema files in `api/lib/schema/` define all tables

### Authorization

Authorization is enforced at the API level via middleware in each Vercel Serverless Function:

- **`requireAuth`** - Validates the Better Auth session cookie
- **`requireOrgMember`** - Validates the user belongs to the requested organization
- **`requireSystemAdmin`** - Validates the user has the system_admin role

### Key Tables

- `organizations` - District organizations
- `goals` - Hierarchical goals (3 levels: 0, 1, 2)
- `metrics` - Measurable outcomes
- `school_admins` - Admin access control
- `plans` - Strategic plans per organization
- `metric_time_series` - Time-series metric data

## Authentication & Authorization

### Authentication Flow

1. User logs in via `/login` (Better Auth)
2. Session managed via HTTP-only cookies (`credentials: 'include'`)
3. `useAuth` hook provides auth state (backed by Better Auth client)
4. Guards protect admin routes

### Route Protection

- **Public routes**: No auth required (`/`, `/:slug`, `/:slug/goals`)
- **Admin routes**: Require auth + district access (`/:slug/admin/*`)
- **System admin**: Require system_admin role (`/admin/*`)

### Guards

- `ClientAdminGuard` - Protects district admin routes
- `SystemAdminGuard` - Protects system admin routes
- Both show loading states and redirect properly

### API Authentication

All API routes in `api/` use middleware to validate the Better Auth session cookie. The frontend fetch helper (`src/lib/api.ts`) automatically includes `credentials: 'include'` on all requests.

## Current Focus

See [project_status.md](project_status.md) for current work and GitHub Issues for task tracking.

## Development Workflow

### GitHub Flow

- `main` is always deployable
- Create feature branches: `feature/issue-{number}-description`
- Open PRs early (draft mode for WIP)
- Reference issues: "Closes #123"
- Merge after CI passes + review
- Vercel auto-deploys from main

### Branch Naming

- Features: `feature/issue-123-add-excel-template`
- Bugs: `fix/issue-456-schema-cache`
- Docs: `docs/issue-789-deployment-guide`
- Refactor: `refactor/simplify-auth`
- Chore: `chore/update-dependencies`

### Commit Messages (Conventional Commits)

```
feat: add Excel template download
fix: resolve schema cache issue
docs: update deployment guide
refactor: simplify auth middleware
test: add unit tests for template service
chore: update dependencies
```

## Environment Variables

```bash
# Database (Neon)
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/strategic-plan-db

# Authentication (Better Auth)
BETTER_AUTH_SECRET=your-random-secret
BETTER_AUTH_URL=http://localhost:5174

# Optional
VITE_API_BASE_URL=http://localhost:5174  # Defaults to window.location.origin
```

**Setup:**

1. Copy `.env.example` to `.env.local`
2. Never commit `.env.local`
3. Vite requires `VITE_` prefix to expose variables to client-side code

## Deployment

**Platform**: Vercel

**Auto-Deploy**:

- Push to `main` -> Vercel builds & deploys
- Requires `vercel.json` for client-side routing and API function configuration

**Post-Deployment Checklist**:

1. Verify build succeeded in Vercel
2. Test login flow
3. Check admin route protection
4. If database migrations were included, verify they were applied to Neon

## Quick Reference

### Key Files

- [project_status.md](project_status.md) - Current project status
- [src/lib/types.ts](src/lib/types.ts) - TypeScript interfaces
- [src/lib/api.ts](src/lib/api.ts) - Shared fetch helper
- [src/lib/auth-client.ts](src/lib/auth-client.ts) - Better Auth client
- [src/lib/services/](src/lib/services/) - Business logic
- [src/hooks/useAuth.ts](src/hooks/useAuth.ts) - Authentication hook
- [api/lib/auth.ts](api/lib/auth.ts) - Better Auth server config
- [api/lib/db.ts](api/lib/db.ts) - Drizzle + Neon database client
- [api/lib/schema/](api/lib/schema/) - Drizzle table schemas
- [drizzle/migrations/](drizzle/migrations/) - Database migrations

### Important Patterns

- Service layer: All API calls go through services via the fetch helper (no direct DB calls in components)
- React Query: All server state managed with React Query hooks
- Type safety: No `any` types (strict mode enabled)
- Error handling: Always wrap async operations in try/catch

## What NOT to Do

### Avoid These Patterns

- Direct database queries from components
- Mixing business logic with UI components
- Hardcoding environment-specific values
- Creating files without checking existing patterns
- Skipping TypeScript type definitions
- Bypassing authentication guards

### Always Remember

- Follow established patterns
- Use `/pre-commit` before committing
- Test locally before committing
- Run pr-prep agent before creating PRs

---

_For detailed project status, see [project_status.md](project_status.md)_
