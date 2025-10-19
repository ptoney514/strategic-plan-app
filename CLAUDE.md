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
│   └── config.json          # Agent configuration
└── STATUS.md                # Current project status
```

## Development Commands

### Essential commands
```bash
npm run dev              # Start dev server (http://localhost:5173)
npm test                # Run tests
npm run build           # Production build
npm run preview         # Preview production build
```

### Less common but important
```bash
npm run lint            # Lint code with ESLint
npm run type-check      # TypeScript checking
supabase start          # Start local Supabase
supabase stop           # Stop local Supabase
supabase db reset       # Reset local DB with migrations
```

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

## Current Phase

**Phase**: Production Ready with Auth & Security

**Active Focus**: Feature enhancements and user feedback incorporation

**Recently Completed**:
- ✅ Authentication system (Supabase Auth)
- ✅ Row Level Security (RLS) policies
- ✅ Modern login UI
- ✅ TypeScript strict mode
- ✅ Claude Code v2.0 setup

**Next Priorities**:
1. Zod validation for all forms
2. Excel template download
3. Bundle size optimization
4. Code cleanup (lint errors)

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
1. Verify build succeeded
2. Test login flow
3. Check admin route protection
4. After migrations: **Reload Supabase schema cache!**

## Quick Reference

### Key Files
- [STATUS.md](STATUS.md) - Current project status
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
- ✅ Document significant changes in STATUS.md
- ✅ Test locally before committing
- ✅ Run pr-prep agent before creating PRs
- ✅ Update STATUS.md weekly

---

*For detailed project status, see [STATUS.md](STATUS.md)*
