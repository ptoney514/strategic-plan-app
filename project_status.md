# Strategic Plan Builder - Project Status

<!-- Preview DB smoke test -->

## Tracking

**GitHub Repo**: [ptoney514/strategic-plan-app](https://github.com/ptoney514/strategic-plan-app)
**Production**: Auto-deploys from `main` via Vercel

> This file is a high-level overview. For detailed task tracking, use GitHub Issues.

---

## Current Phase

**MVP Development** - Admin interface refactor and feature completion

---

## Status Overview

### Production Ready

- Authentication (Better Auth with session cookies)
- API-level authorization middleware (requireAuth, requireOrgMember, requireSystemAdmin)
- Metric builder (Likert scale, charts)
- Public dashboard views
- Excel import wizard
- Neon PostgreSQL database with Drizzle ORM (19 tables, 2 migrations applied)
- ~40 API routes (Vercel Serverless Functions)

### In Progress

| Feature           | Notes                                              |
| ----------------- | -------------------------------------------------- |
| Admin UX redesign | Current interface functional but needs better flow |
| Form validation   | Zod schemas pending                                |

### Up Next

- Bundle size optimization (current: 480KB, target: <400KB)
- Code cleanup during admin refactor
- E2E tests for critical flows

---

## Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm test                 # Run tests

# Database (Drizzle Kit)
npx drizzle-kit generate  # Generate migration from schema changes
npx drizzle-kit migrate   # Apply migrations to Neon
npx drizzle-kit studio    # Open Drizzle Studio

# GitHub workflow
gh issue list --state open
gh issue view {number}
```

---

## Branch Naming

```
feat/{issue}-{description}   # New features
fix/{issue}-{description}    # Bug fixes
chore/{description}          # Maintenance
```

---

## Production Info

| Item      | Value                           |
| --------- | ------------------------------- |
| URL       | Vercel auto-generated           |
| Database  | Neon (small-salad-72814952)     |
| Test User | pernell+westsideadmin@gmail.com |

---

_Last updated: February 2026_
