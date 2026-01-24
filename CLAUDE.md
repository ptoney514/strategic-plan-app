# CLAUDE.md - Strategic Plan Builder

A comprehensive strategic planning system for educational districts to manage goals, metrics, and outcomes effectively.

## Project Overview

Modern web application built with Vite + React for educational district strategic planning. Enables districts to create hierarchical goals, track metrics, and monitor progress toward strategic objectives.

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 6.x
- **Styling**: Tailwind CSS 3.x
- **State Management**: Zustand (client state), React Query (server state)
- **Routing**: React Router v6
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Testing**: Vitest + Testing Library

## Architecture Overview

### Key Design Decisions

- **Vite over Next.js**: 50% faster builds, better DX, simpler configuration
- **React Query for data fetching**: Better caching, reduced complexity, automatic refetching
- **Zustand for state**: Simpler than Redux for this scale, less boilerplate
- **Tailwind CSS**: Utility-first, consistent design system, rapid development
- **Supabase Auth**: Built-in authentication, RLS integration, scalable

### Accepted Trade-offs

- **No SSR**: Vite doesn't have built-in SSR (acceptable - admin app, SEO not critical)
- **Client-side routing**: Requires server rewrites (handled via vercel.json)
- **Bundle size**: ~1.68MB (target: reduce to <1MB with code splitting)

## Project Structure

```
strategic-plan-vite/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/               # Route-level page components
│   │   ├── client/public/   # Public-facing district views
│   │   └── client/admin/    # Admin interface
│   ├── layouts/             # Layout wrappers
│   ├── hooks/               # Custom React hooks
│   ├── lib/
│   │   ├── services/        # Business logic & API calls
│   │   └── types/           # TypeScript interfaces
│   ├── middleware/          # Route guards
│   └── test/                # Test utilities
├── supabase/
│   └── migrations/          # Database migrations
├── .claude/
│   ├── agents/              # Sub-agents
│   ├── commands/            # Slash commands (/pre-commit)
│   └── config.json          # Agent configuration
└── project_status.md        # Current project status
```

## Development Commands

### Essential commands

```bash
npm run dev              # Start dev server (http://localhost:5173)
npm test                 # Run tests in watch mode
npm run test:run         # Run tests once
npm run build            # Production build
npm run preview          # Preview production build
```

> **Note for AI agents:** Use `npm run test:run` (single run) instead of `npm test` (watch mode) to avoid spawning multiple background processes.
>
> **CRITICAL:** Never pipe test commands through `head`, `tail`, or other truncating commands (e.g., `npm run test:run | head -100`). This kills the parent process while leaving vitest worker processes orphaned, causing memory exhaustion that can crash the system. Always let test commands run to completion.

### Quality checks

```bash
npm run lint             # Lint code with ESLint
npm run lint:fix         # Lint and auto-fix issues
npm run type-check       # TypeScript type checking
```

### Local Supabase (Docker)

```bash
npm run db:start         # Start local Supabase containers
npm run db:stop          # Stop local Supabase
npm run db:reset         # Reset DB with migrations + seed data
npm run db:reset:dev     # Reset DB + create test users (recommended for dev)
npm run db:status        # Show connection info and keys
npm run db:studio        # Open Supabase Studio UI
npm run db:diff          # Show uncommitted schema changes
npm run dev:local        # Start Supabase + Vite together
```

### Migration testing

```bash
npm run db:test          # Run full migration test suite
./scripts/test-migrations.sh      # Run smoke tests only (requires running DB)
./scripts/validate-migrations.sh  # Lint migrations only
```

**Full Local Test Workflow:**

```bash
# 1. Reset database (applies all migrations + seed)
npm run db:reset

# 2. Run smoke tests
./scripts/test-migrations.sh

# 3. (Optional) Run app tests against fresh DB
npm run test:run
```

## Local Supabase Development

### Prerequisites

1. Docker Desktop installed and running
2. Supabase CLI: `brew install supabase/tap/supabase`
3. Node.js 20+

### First-Time Setup

1. Copy environment template: `cp .env.local.example .env.local`
2. Start local Supabase: `npm run db:start`
3. Get local keys: `npm run db:status`
4. Update `.env.local` with the anon key
5. Start development: `npm run dev`

### Daily Workflow

```bash
npm run dev:local        # Start everything (Supabase + Vite)
npm run db:studio        # Open Supabase Studio at localhost:54323
```

### Local Test Credentials

Local development uses test users that are **different from production**.

| Account        | Email                     | Password         | Access Level  |
| -------------- | ------------------------- | ---------------- | ------------- |
| System Admin   | `sysadmin@stratadash.com` | `Stratadash123!` | All districts |
| Westside Admin | `admin@westside66.org`    | `Westside123!`   | Westside only |
| Eastside Admin | `admin@eastside.edu`      | `Eastside123!`   | Eastside only |

**Create test users:**

```bash
npm run db:reset:dev     # Reset DB + create test users
# OR
./scripts/create-test-users.sh  # Create users only
```

**Login at:** http://localhost:5173/login

## Database Migration Workflow

### Creating a New Migration

1. **Develop Locally**
   - Make schema changes in Supabase Studio (localhost:54323)
   - Test thoroughly with your application

2. **Generate Migration File**

   ```bash
   supabase db diff -f <descriptive_name>
   # Example: supabase db diff -f add_user_preferences
   ```

3. **Review Generated SQL**
   - Check `supabase/migrations/<timestamp>_<name>.sql`
   - Verify RLS policies are included
   - Check for destructive operations

4. **Test Migration Locally**

   ```bash
   npm run db:reset        # Reset and re-run all migrations
   npm test -- --run       # Run unit tests
   ```

5. **Commit and Push**

   ```bash
   git add supabase/migrations/
   git commit -m "feat(db): add user preferences table"
   ```

6. **Deploy to Production**
   After PR merge:
   ```bash
   supabase db push --linked
   ```
   **CRITICAL**: Reload schema cache in Supabase Dashboard!
   - Go to: Project → Settings → API
   - Click "Reload Schema"
   - Verify changes in API documentation

### Migration Checklist

- [ ] Migration tested locally with `db:reset`
- [ ] All tests passing
- [ ] No destructive operations without backup plan
- [ ] RLS policies reviewed
- [ ] Schema cache reloaded after production deploy

## Migration Testing in CI

All pull requests automatically test database migrations via GitHub Actions.

### What's Tested

1. **Migration Linting** - File naming, sequential numbering, idempotency patterns
2. **Migration Execution** - All migrations apply cleanly from scratch (fresh database)
3. **Seed Data Loading** - Test data loads without errors
4. **Database State** - Tables, indexes, RLS policies, helper functions all verified
5. **Access Control** - Anonymous users can read public data only (RLS validation)
6. **Data Integrity** - Row counts match expectations from seed data

### CI Job Flow

```
lint-typecheck
    ├──> unit-tests (parallel)
    ├──> build (parallel)
    └──> migration-tests (parallel)
            ├──> validate-migrations.sh (linting)
            ├──> supabase db reset (apply all migrations + seed)
            └──> test-migrations.sh (smoke tests)
```

**Job Runtime:** ~2-3 minutes

### Debugging Failed Migration Tests

1. Check CI logs for specific error section (tests organized in 6 sections)
2. Reproduce locally: `npm run db:test`
3. Fix migration or seed data
4. Re-test locally before pushing
5. Verify CI passes on your PR

### What the Smoke Tests Check

**Section 1: Table Existence** - Verifies all 10 core `spb_*` tables exist
**Section 2: Seed Data** - Validates row counts (2 districts, 3 objectives, 10-12 goals, etc.)
**Section 3: Database Structure** - Confirms indexes and constraints are created
**Section 4: RLS Policies** - Counts policies per table, verifies RLS is enabled
**Section 5: Helper Functions** - Checks that database functions exist
**Section 6: Anonymous Access** - Tests public data is readable, private data protected

## Critical Constraints

### What TO Do

- Use functional components only
- Write tests for utility functions and services
- Use async/await over .then()
- Comment complex business logic
- Keep components under 200 lines
- Use React Query for all server data fetching
- Implement RLS policies for all tables
- Use Zod for form validation

### What NOT To Do

- ❌ Don't use class components
- ❌ Don't commit .env.local files
- ❌ Don't bypass TypeScript with `any`
- ❌ Don't skip error handling
- ❌ Don't mutate state directly
- ❌ Don't bypass RLS policies with service role key on client
- ❌ Don't create components over 200 lines without refactoring

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

- Vite build time: <15s (currently ~12s) ✅
- TypeScript compilation: <5s ✅

### Runtime Performance

- Bundle Size (gzipped): <600KB (currently ~480KB) ✅
- Time to Interactive: <2s ✅
- Lighthouse Score: >90 (currently 92) ✅

### Database Performance

- Query Response: <500ms for 90th percentile
- Goal Hierarchy Fetch: <300ms for 3-level deep
- Dashboard Load: <1s with 100+ goals

### Optimization Checklist

- [ ] Images optimized and lazy-loaded
- [ ] Route-based code splitting
- [ ] React Query caching configured ✅
- [ ] Database indexes on frequently queried columns ✅
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

- ❌ `<div>` or `<span>` as buttons (use `<button>`)
- ❌ Removing focus outlines
- ❌ Poor color contrast in status indicators
- ❌ Missing alt text on images
- ❌ Non-descriptive link text ("click here")

## Database Conventions

### Table Naming

- All tables use `spb_` prefix (strategic plan builder)
- Hierarchical data uses `parent_id` self-referencing
- UUIDs for all primary keys
- Soft deletes where appropriate

### Row Level Security (RLS)

- **Public read** for `is_public = true` districts
- **District admins** can manage their assigned districts only
- **System admins** have full access
- **Anonymous users**: SELECT only (no INSERT/UPDATE/DELETE)

### Key Tables

- `spb_districts` - District organizations
- `spb_goals` - Hierarchical goals (3 levels: 0, 1, 2)
- `spb_metrics` - Measurable outcomes
- `spb_district_admins` - Admin access control

## Authentication & Authorization

### Authentication Flow

1. User logs in via `/login` (Supabase Auth)
2. Session stored in localStorage
3. `useAuth` hook provides auth state
4. Guards protect admin routes

### Route Protection

- **Public routes**: No auth required (`/`, `/:slug`, `/:slug/goals`)
- **Admin routes**: Require auth + district access (`/:slug/admin/*`)
- **System admin**: Require system_admin role (`/admin/*`)

### Guards

- `ClientAdminGuard` - Protects district admin routes
- `SystemAdminGuard` - Protects system admin routes
- Both show loading states and redirect properly

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
# Local Development
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key

# Production
VITE_SUPABASE_URL=https://scpluslhcastrobigkfb.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

**Setup:**

1. Copy `.env.example` to `.env.local`
2. Never commit `.env.local`
3. Vite requires `VITE_` prefix to expose to client

## Deployment

**Platform**: Vercel

**Auto-Deploy**:

- Push to `main` → Vercel builds & deploys
- Requires `vercel.json` for client-side routing

**Post-Deployment Checklist**:

1. **Before merging PR:** Verify migration tests pass in CI (check GitHub Actions)
2. **Before deploying:** Run migration tests locally: `npm run db:test`
3. Verify build succeeded in Vercel
4. Test login flow
5. Check admin route protection
6. After database migrations: **Reload Supabase schema cache!**
   - Go to Supabase Dashboard
   - Navigate to: Project → Settings → API
   - Click "Reload Schema" button
   - **CRITICAL**: Skipping this step will cause API errors if schema changed
   - Verify changes appear in auto-generated API documentation

## Quick Reference

### Key Files

- [project_status.md](project_status.md) - Current project status
- [src/lib/types.ts](src/lib/types.ts) - TypeScript interfaces
- [src/lib/services/](src/lib/services/) - Business logic
- [src/hooks/useAuth.ts](src/hooks/useAuth.ts) - Authentication hook
- [supabase/migrations/](supabase/migrations/) - Database migrations

### Important Patterns

- Service layer: All API calls go through services (no direct Supabase calls in components)
- React Query: All server state managed with React Query hooks
- Type safety: No `any` types (strict mode enabled)
- Error handling: Always wrap async operations in try/catch

## What NOT to Do

### Avoid These Patterns

- ❌ Direct database queries from components
- ❌ Mixing business logic with UI components
- ❌ Hardcoding environment-specific values
- ❌ Creating files without checking existing patterns
- ❌ Skipping TypeScript type definitions
- ❌ Bypassing authentication guards

### Always Remember

- ✅ Follow established patterns
- ✅ Use `/pre-commit` before committing
- ✅ Test locally before committing
- ✅ Run pr-prep agent before creating PRs

---

_For detailed project status, see [project_status.md](project_status.md)_
