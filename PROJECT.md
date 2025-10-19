# PROJECT.md - Strategic Plan Vite

## Project Overview

**Name**: Strategic Plan Vite  
**Type**: Single Page Application (SPA)  
**Purpose**: Fast, modern rebuild of the strategic planning system using Vite  
**Status**: Active Development - Phase 2 Complete  
**Repository**: https://github.com/ptoney514/strategic-plan-vite

## Technology Stack

### Core
- **Build Tool**: Vite 6.3.6
- **Framework**: React 19.1.1
- **Language**: TypeScript 5.8.3
- **Styling**: Tailwind CSS 3.4.17
- **Package Manager**: npm

### Data & State
- **Database**: Supabase (PostgreSQL)
- **Data Fetching**: Tanstack Query v5
- **Client**: @supabase/supabase-js
- **State Management**: React Query cache

### UI & UX
- **Routing**: React Router DOM v7
- **Components**: Radix UI primitives
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge

## Project Structure

```
strategic-plan-vite/
├── src/
│   ├── components/      # Reusable UI components
│   │   └── ui/          # Radix-based components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Core utilities
│   │   ├── services/    # Data service layers
│   │   ├── supabase.ts  # Supabase client
│   │   └── types.ts     # TypeScript interfaces
│   ├── pages/           # Route components
│   ├── App.tsx          # Main app with routing
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── .env.local           # Environment variables
└── vite.config.ts       # Vite configuration
```

## Development Setup

### Prerequisites
- Node.js 20.9.0+
- npm 10.1.0+
- Docker (for local Supabase)

### Environment Variables
```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key
```

### Commands
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Features Implemented

### Phase 1 ✅
- Project initialization
- TypeScript configuration
- Tailwind CSS setup
- Supabase client configuration
- Data service layers (District, Goals, Metrics)
- Type definitions ported from original

### Phase 2 ✅
- React Query integration
- Custom hooks for data fetching
- React Router with 3 routes
- HomePage (Districts list)
- DistrictDashboard (Goals overview)
- GoalDetail (Individual goal view)
- Loading states and error handling

### Phase 3 ✅
- CRUD operations with inline editing
- Data visualizations with recharts (bar, pie, line, area charts)
- Drag-and-drop reordering with @dnd-kit
- Advanced form management with react-hook-form & zod validation
- Modal dialogs for forms and confirmations

## Database Schema

Uses same schema as strategic-plan-builder:
- `spb_districts` - Organizations
- `spb_goals` - Hierarchical goals (3 levels)
- `spb_metrics` - Performance metrics

## Key Differences from Original

| Aspect | Original (Next.js) | This (Vite) |
|--------|-------------------|-------------|
| Build Tool | Next.js/Webpack | Vite |
| Dev Speed | ~3s HMR | <100ms HMR |
| Rendering | SSR/SSG capable | SPA only |
| Routing | File-based | Component-based |
| Env Vars | NEXT_PUBLIC_* | VITE_* |
| API Routes | Built-in | External only |

## Performance Metrics

- **Dev Server Start**: ~150ms
- **HMR Update**: <100ms
- **Production Build**: ~10s
- **Bundle Size**: ~250KB (gzipped)

## Deployment

### Development
```bash
npm run dev
# Access at http://localhost:5173
```

### Production Build
```bash
npm run build
npm run preview
```

### Hosting Options
- Netlify (recommended)
- Vercel
- GitHub Pages
- Any static host

## API Integration

Connects to Supabase for all data:
- **Local**: http://127.0.0.1:54321
- **Production**: Configure in .env.production

## Testing Strategy

- Unit tests: Vitest (planned)
- Component tests: React Testing Library (planned)
- E2E tests: Playwright (planned)

## Security Considerations

- Environment variables for sensitive data
- Row Level Security (RLS) in Supabase
- No sensitive data in client bundle
- API keys use public (anon) role only

## Contributing

1. Work on `develop` branch
2. Create feature branches from develop
3. Test with local Supabase
4. Commit with conventional commits
5. Push to GitHub for review

## License

Private repository - All rights reserved

## Contact

- **Admin**: pernellg@proton.me
- **GitHub**: @ptoney514

---

*This project is a modern rebuild of strategic-plan-builder using Vite for improved developer experience and performance.*