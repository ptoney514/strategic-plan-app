# Strategic Plan Builder

A strategic planning application for educational districts to manage goals, metrics, and outcomes. Districts create hierarchical goals, track measurable metrics, and monitor progress toward strategic objectives.

**Production**: Auto-deploys from `main` via Vercel

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite 6.x, Tailwind CSS 3.x
- **Data**: React Query (server state), Zustand (client state)
- **Database**: Neon (PostgreSQL) + Drizzle ORM
- **Auth**: Better Auth (session cookies)
- **API**: Vercel Serverless Functions (Node.js runtime)
- **Testing**: Vitest + Testing Library

## Quick Start

```bash
# Clone and install
git clone https://github.com/ptoney514/strategic-plan-app.git
cd strategic-plan-app
npm install

# Configure environment
cp .env.local.example .env.local
# Set DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL in .env.local

# Start development
npm run dev
# Open http://localhost:5174
```

## Commands

```bash
npm run dev              # Dev server (port 5174)
npm run build            # Production build
npm run test:run         # Run tests once
npm run lint             # Lint with ESLint
npm run type-check       # TypeScript type checking
npx drizzle-kit generate # Generate DB migration
npx drizzle-kit migrate  # Apply DB migration
npx drizzle-kit studio   # Browse database
```

## Documentation

See [CLAUDE.md](CLAUDE.md) for detailed documentation including architecture, conventions, testing strategy, and development workflow.

## License

Private repository - All rights reserved
