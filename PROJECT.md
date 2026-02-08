# PROJECT.md - Strategic Plan Builder

## Project Overview

**Name**: Strategic Plan Builder
**Type**: Single Page Application (SPA) with Vercel Serverless API
**Purpose**: Strategic planning system for educational districts
**Status**: Active Development
**Repository**: https://github.com/ptoney514/strategic-plan-app

## Technology Stack

### Core

- **Build Tool**: Vite 6.x
- **Framework**: React 18
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **Package Manager**: npm

### Data & State

- **Database**: Neon (PostgreSQL)
- **ORM**: Drizzle ORM
- **Data Fetching**: TanStack Query v5
- **API**: Vercel Serverless Functions (Node.js runtime)
- **Fetch Helper**: `src/lib/api.ts` (apiFetch, apiGet, apiPost, apiPut, apiDelete)
- **State Management**: React Query cache + Zustand

### Authentication

- **Library**: Better Auth
- **Server Config**: `api/lib/auth.ts`
- **Client Config**: `src/lib/auth-client.ts`
- **Session**: HTTP-only cookies (`credentials: 'include'`)

### UI & UX

- **Routing**: React Router DOM v7
- **Components**: Radix UI primitives
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge

## Project Structure

```
strategic-plan-app/
├── src/
│   ├── components/      # Reusable UI components
│   │   └── ui/          # Radix-based components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Core utilities
│   │   ├── api.ts       # Shared fetch helper
│   │   ├── auth-client.ts # Better Auth client
│   │   ├── services/    # Data service layers
│   │   └── types.ts     # TypeScript interfaces
│   ├── pages/           # Route components
│   ├── App.tsx          # Main app with routing
│   └── main.tsx         # Entry point
├── api/                 # Vercel Serverless Functions
│   └── lib/
│       ├── auth.ts      # Better Auth server config
│       ├── db.ts        # Drizzle + Neon client
│       ├── response.ts  # Response helpers
│       └── schema/      # Drizzle table schemas
├── drizzle/
│   ├── migrations/      # SQL migration files
│   └── custom/          # Custom trigger SQL
├── public/              # Static assets
└── vite.config.ts       # Vite configuration
```

## Development Setup

### Prerequisites

- Node.js 20.9.0+
- npm 10.1.0+
- Neon database (no local database required)

### Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/strategic-plan-db
BETTER_AUTH_SECRET=your-random-secret
BETTER_AUTH_URL=http://localhost:5174
```

### Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (port 5174)
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
npx drizzle-kit generate # Generate migration
npx drizzle-kit migrate  # Apply migration
npx drizzle-kit studio   # Browse database
```

## Features Implemented

### Phase 1 - Foundation

- Project initialization with Vite + TypeScript
- Tailwind CSS setup
- Neon database connection with Drizzle ORM
- Data service layers (District, Goals, Metrics)
- Type definitions

### Phase 2 - Data Layer

- React Query integration
- Custom hooks for data fetching
- React Router with multi-level routing
- Loading states and error handling

### Phase 3 - CRUD & Visualization

- CRUD operations with inline editing
- Data visualizations with Recharts (bar, pie, line, area charts)
- Drag-and-drop reordering with @dnd-kit
- Advanced form management with react-hook-form & Zod validation
- Modal dialogs for forms and confirmations

### Phase 4 - API & Schema Extension

- ~40 Vercel Serverless Function API routes
- Extended goals table (+33 columns), metrics table (+43 columns)
- 7 new tables (metric_time_series, school_admins, import_sessions, etc.)
- 19 total tables in Neon database
- API-level authorization middleware (requireAuth, requireOrgMember, requireSystemAdmin)

### Phase 5 - Auth & Frontend Migration

- Better Auth server + client setup
- Frontend services migrated to use fetch helper (removed direct DB calls)
- Session-based auth with HTTP-only cookies

## Database Schema

Drizzle ORM schema files in `api/lib/schema/`:

- `organizations` - District organizations
- `goals` - Hierarchical goals (3 levels)
- `metrics` - Performance metrics
- `plans` - Strategic plans
- `schools` - Schools within districts
- `school_admins` - Admin access control
- `metric_time_series` - Time-series data
- `imports` - Import session tracking
- `stock_photos` - Photo library
- `contact` - Contact information
- `progress` - Progress tracking

## Performance Metrics

- **Dev Server Start**: ~150ms
- **HMR Update**: <100ms
- **Production Build**: ~12s
- **Bundle Size**: ~480KB (gzipped)

## Deployment

**Platform**: Vercel (auto-deploys from `main`)

```bash
npm run build
npm run preview    # Local preview
```

### Environment Variables (Vercel)

- `DATABASE_URL` - Neon connection string
- `BETTER_AUTH_SECRET` - Auth secret
- `BETTER_AUTH_URL` - Production URL

## Security

- Environment variables for sensitive data
- API-level authorization middleware on all routes
- No sensitive data in client bundle
- HTTP-only session cookies for authentication

## Testing Strategy

- Unit tests: Vitest
- Component tests: React Testing Library
- Tests mock `fetch` for API calls

## Contributing

1. Create feature branch from `main`
2. Follow conventional commits
3. Run tests and type-check before pushing
4. Submit PR for review

## License

Private repository - All rights reserved

## Contact

- **Admin**: pernellg@proton.me
- **GitHub**: @ptoney514

---

_Strategic planning platform for educational districts, built with Vite + React + Neon + Drizzle ORM._
