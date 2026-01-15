# Multi-Environment Development Guide

A comprehensive guide for setting up development, staging, and production environments for the Strategic Plan Builder application.

## Table of Contents

1. [Overview](#overview)
2. [Environment Architecture](#environment-architecture)
3. [Choosing Your Approach](#choosing-your-approach)
4. [Option A: Supabase Branching](#option-a-supabase-branching-recommended)
5. [Option B: Separate Staging Project](#option-b-separate-staging-project)
6. [Phase 2: Vercel Environment Configuration](#phase-2-vercel-environment-configuration)
7. [Phase 3: Local Development Setup](#phase-3-local-development-setup)
8. [Phase 4: CI/CD Pipeline](#phase-4-cicd-pipeline)
9. [Phase 5: Git Branching Strategy](#phase-5-git-branching-strategy)
10. [Database Migration Workflow](#database-migration-workflow)
11. [Team Workflows](#team-workflows)
12. [Troubleshooting](#troubleshooting)
13. [Security Considerations](#security-considerations)
14. [Cost Considerations](#cost-considerations)

---

## Overview

### Why Multi-Environment?

When your application is live with real users, you need isolated environments to:

- **Develop safely**: Make changes without affecting production data
- **Test thoroughly**: Validate features before users see them
- **Review changes**: Allow stakeholders to preview before release
- **Debug issues**: Reproduce production bugs without risk

### Current State

| Component               | Status                   |
| ----------------------- | ------------------------ |
| Local Supabase (Docker) | ✅ Configured            |
| GitHub Actions CI       | ✅ Running               |
| Vercel Deployment       | ✅ Auto-deploy from main |
| Staging Environment     | ❌ Not configured        |
| Production Protection   | ❌ Not configured        |

### Target State

| Environment | Purpose     | Database            | URL                 |
| ----------- | ----------- | ------------------- | ------------------- |
| Local       | Development | Docker Supabase     | localhost:5173      |
| Preview     | PR Review   | Staging Supabase    | pr-123.vercel.app   |
| Staging     | QA/Demo     | Staging Supabase    | staging.yourapp.com |
| Production  | Live Users  | Production Supabase | yourapp.com         |

---

## Environment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DEVELOPMENT FLOW                              │
└─────────────────────────────────────────────────────────────────────┘

  Developer Laptop          GitHub               Vercel
  ┌──────────────┐      ┌──────────────┐     ┌──────────────┐
  │              │      │              │     │              │
  │  Local Dev   │─────▶│  Pull Request│────▶│   Preview    │
  │  (Docker)    │      │              │     │  Deployment  │
  │              │      │              │     │              │
  └──────────────┘      └──────────────┘     └──────────────┘
         │                     │                    │
         ▼                     ▼                    ▼
  ┌──────────────┐      ┌──────────────┐     ┌──────────────┐
  │   Local      │      │   GitHub     │     │   Staging    │
  │   Supabase   │      │   Actions    │     │   Supabase   │
  │   (Docker)   │      │   (CI/CD)    │     │   Project    │
  └──────────────┘      └──────────────┘     └──────────────┘

                               │
                               ▼ (merge to main)
                        ┌──────────────┐
                        │  Production  │
                        │  Deployment  │
                        └──────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  Production  │
                        │   Supabase   │
                        │   Project    │
                        └──────────────┘
```

### Data Flow

| Environment     | Database                           | Data Type      | Who Uses It            |
| --------------- | ---------------------------------- | -------------- | ---------------------- |
| Local           | Docker                             | Seed data only | Individual developer   |
| Preview/Staging | Supabase Branch or Staging Project | Test data      | Team, QA, stakeholders |
| Production      | Production Supabase                | Real user data | End users              |

---

## Choosing Your Approach

You have two options for managing staging/preview environments. Choose based on your team's needs:

| Approach                               | Best For                                              | Cost Model                 |
| -------------------------------------- | ----------------------------------------------------- | -------------------------- |
| **Option A: Supabase Branching**       | Teams wanting automated PR previews, simpler workflow | Pay-per-use (~$1-2 per PR) |
| **Option B: Separate Staging Project** | Teams wanting persistent staging, predictable costs   | Fixed ($0-25/month)        |

### Quick Comparison

| Feature                   | Supabase Branching         | Separate Project       |
| ------------------------- | -------------------------- | ---------------------- |
| Setup complexity          | Lower (GitHub integration) | Higher (manual setup)  |
| Auto-created per PR       | ✅ Yes                     | ❌ No                  |
| Persistent staging URL    | ❌ No (temporary)          | ✅ Yes                 |
| Cost predictability       | Variable                   | Fixed                  |
| Compute credits apply     | ❌ No                      | ✅ Yes                 |
| Spend cap protection      | ❌ No                      | ✅ Yes                 |
| Production data isolation | ✅ Schema-only copy        | ✅ Completely separate |

### Recommendation

- **Choose Branching** if you want automated, per-PR preview environments with minimal setup
- **Choose Separate Project** if you need a persistent staging environment for QA/demos or want predictable costs

You can also use **both**: Branching for PR previews + Separate Project for persistent staging.

---

## Option A: Supabase Branching (Recommended)

Supabase Branching creates isolated, temporary database environments automatically for each pull request.

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    BRANCHING FLOW                            │
└─────────────────────────────────────────────────────────────┘

  Create PR              Supabase                  Vercel
  ┌──────────┐         ┌──────────┐            ┌──────────┐
  │ feature/ │────────▶│ Creates  │───────────▶│ Preview  │
  │ branch   │         │ DB Branch│            │ Deploy   │
  └──────────┘         └──────────┘            └──────────┘
       │                    │                       │
       │              ┌─────┴─────┐                 │
       │              │           │                 │
       │              ▼           ▼                 ▼
       │         ┌────────┐ ┌─────────┐      ┌──────────┐
       │         │ Runs   │ │ Seeds   │      │ Uses     │
       │         │ Migra- │ │ Test    │      │ Branch   │
       │         │ tions  │ │ Data    │      │ API Keys │
       │         └────────┘ └─────────┘      └──────────┘
       │
  Merge PR ─────────────▶ Branch Deleted
```

### What Gets Created Per Branch

Each preview branch is a **complete, isolated Supabase instance**:

- Own PostgreSQL database (schema copied, NOT data)
- Own API endpoints and credentials
- Own Auth configuration
- Migrations automatically applied
- Seed data loaded from `./supabase/seed.sql`

### Pricing

| Resource | Cost                               |
| -------- | ---------------------------------- |
| Base Fee | None                               |
| Compute  | $0.01344/hour (~$10/month if 24/7) |
| Disk     | Counts toward plan quota           |
| Egress   | Counts toward plan quota           |
| Storage  | Counts toward plan quota           |

**Important limitations:**

- ❌ Compute Credits do NOT apply to branches
- ❌ Spend Cap does NOT protect branches
- Branches appear as "Branching Compute Hours" on invoice

### Typical Cost Per PR

| PR Duration         | Estimated Cost |
| ------------------- | -------------- |
| 8 hours (1 day)     | ~$0.15         |
| 30 hours (few days) | ~$1.40         |
| 168 hours (1 week)  | ~$2.50         |

### Setup Steps

#### Step 1: Enable GitHub Integration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your production project
3. Navigate to **Settings** → **Integrations**
4. Click **GitHub** → **Connect**
5. Authorize Supabase to access your repository
6. Select the repository for this project

#### Step 2: Configure Branch Settings

1. In Supabase Dashboard, go to **Settings** → **Branching**
2. Enable **Preview Branching**
3. Configure:
   - **Production Branch**: `main`
   - **Preview Branches**: All other branches (or specific patterns)

#### Step 3: Verify Migrations Directory

Ensure your migrations are in the correct location:

```
supabase/
├── migrations/
│   ├── 20240101000000_initial.sql
│   ├── 20240102000000_add_users.sql
│   └── ...
└── seed.sql  ← Used to populate preview branches
```

#### Step 4: Configure Vercel Integration

1. In Supabase Dashboard, go to **Settings** → **Integrations**
2. Click **Vercel** → **Connect**
3. Link your Vercel project
4. Supabase will automatically inject environment variables for preview deployments

#### Step 5: Test the Integration

1. Create a test branch:

   ```bash
   git checkout -b test/branching-setup
   echo "-- test" >> supabase/migrations/test.sql
   git add . && git commit -m "test: verify branching"
   git push -u origin test/branching-setup
   ```

2. Create a PR in GitHub

3. Verify in Supabase Dashboard:
   - New branch appears under **Branches**
   - Migrations applied successfully
   - API credentials generated

4. Verify Vercel preview uses branch credentials

5. Clean up:
   ```bash
   git checkout main
   git branch -D test/branching-setup
   git push origin --delete test/branching-setup
   ```

### Working with Branches

#### View Active Branches

```bash
# Via Supabase Dashboard
# Settings → Branching → Active Branches
```

#### Connect to Branch Database

Each branch has unique credentials shown in the dashboard. Use these for debugging:

```bash
# Get connection string from branch dashboard
psql "postgresql://postgres:[PASSWORD]@[BRANCH-HOST]:5432/postgres"
```

#### Manual Branch Creation (Beta)

You can also create branches directly from the dashboard without GitHub:

1. Go to **Branching** → **Create Branch**
2. Name your branch
3. Select base (usually production)

### Limitations to Know

1. **Schema-only**: Production data is NOT copied (by design - protects sensitive data)
2. **Public schema only**: Custom roles from dashboard aren't captured
3. **Extensions**: Not included in branch diff
4. **Merge direction**: Can only merge to main, not between branches
5. **Edge Functions**: Overwritten when pulling from production

---

## Option B: Separate Staging Project

Create a dedicated Supabase project for staging. Better for persistent staging environments.

### When to Choose This

- You need a persistent staging URL for stakeholder demos
- You want predictable monthly costs
- You need staging to stay running 24/7
- Your QA team needs a stable environment

### Step 1.1: Create Staging Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Configure:
   - **Organization**: Same as production
   - **Name**: `strategic-plan-staging`
   - **Database Password**: Generate strong password (save securely!)
   - **Region**: Same as production (for consistency)
   - **Pricing Plan**: Free tier works for staging

4. Wait for project to initialize (~2 minutes)

### Step 1.2: Link Staging Project Locally

```bash
# List your projects to get the project ref
supabase projects list

# Link to staging (you'll be prompted to select)
supabase link --project-ref <staging-project-ref>

# Verify link
supabase status
```

> **Note**: You can only have one project linked at a time. Use `supabase link` to switch between staging and production.

### Step 1.3: Apply Migrations to Staging

```bash
# Ensure you're linked to staging
supabase link --project-ref <staging-project-ref>

# Push all migrations
supabase db push

# Verify tables exist
supabase db reset --dry-run
```

### Step 1.4: Seed Staging Data

You have two options:

**Option A: Use existing seed file**

```bash
# Apply seed data
psql <staging-connection-string> -f supabase/seed.sql
```

**Option B: Create staging-specific seed data**

```bash
# Create a staging seed file with more realistic test data
cp supabase/seed.sql supabase/seed.staging.sql
# Edit with staging-specific test accounts
```

### Step 1.5: Document Staging Credentials

Create a secure document (NOT in git) with:

```
Staging Supabase Project
========================
Project Ref: xxxxxxxxxxxxxxxxxxxx
Project URL: https://xxxxxxxxxxxx.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Database Password: <stored in password manager>

Test Accounts:
- admin@staging.test / TestPassword123!
- viewer@staging.test / TestPassword123!
```

---

## Phase 2: Vercel Environment Configuration

### Step 2.1: Access Vercel Settings

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**

### Step 2.2: Configure Environment Variables

Add the following variables with appropriate scopes:

| Variable                 | Production                 | Preview                       | Development              |
| ------------------------ | -------------------------- | ----------------------------- | ------------------------ |
| `VITE_SUPABASE_URL`      | `https://prod.supabase.co` | `https://staging.supabase.co` | `http://127.0.0.1:54321` |
| `VITE_SUPABASE_ANON_KEY` | `<prod-anon-key>`          | `<staging-anon-key>`          | `<local-anon-key>`       |

**How to set scopes:**

1. Click "Add New"
2. Enter variable name: `VITE_SUPABASE_URL`
3. Enter production value
4. Under "Environment", select only "Production"
5. Click "Save"
6. Repeat for "Preview" with staging value

### Step 2.3: Configure Preview Deployments

In **Settings** → **Git**:

1. **Automatic Deployments**: Enabled for all branches
2. **Preview Deployment Comments**: Enable GitHub comments

In **Settings** → **Deployment Protection**:

1. Enable "Vercel Authentication" for Preview (optional - restricts access)
2. Set password protection if needed for stakeholder previews

### Step 2.4: Set Up Custom Staging Domain (Optional)

If you want a permanent staging URL instead of random preview URLs:

1. Go to **Settings** → **Domains**
2. Add domain: `staging.yourapp.com`
3. Configure DNS with your provider
4. In **Settings** → **Git**, create a "Production Branch" rule:
   - Branch: `develop`
   - Domain: `staging.yourapp.com`

---

## Phase 3: Local Development Setup

### Step 3.1: Environment File Structure

Your project should have:

```
strategic-plan-app/
├── .env.example          # Template (committed)
├── .env.local            # Local overrides (gitignored)
├── .env.staging          # Staging reference (optional, gitignored)
└── .env.production       # Production reference (optional, gitignored)
```

### Step 3.2: Update .env.example

```bash
# .env.example - Template for all environments
# Copy to .env.local and fill in values

# Supabase Configuration
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key_here

# Optional: Feature flags
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=false

# Optional: Environment indicator
VITE_ENVIRONMENT=development
```

### Step 3.3: Create Environment Indicator Component

Add a visual indicator so developers know which environment they're in:

```typescript
// src/components/EnvironmentBadge.tsx
const EnvironmentBadge = () => {
  const env = import.meta.env.VITE_ENVIRONMENT || 'development';

  if (env === 'production') return null;

  const colors = {
    development: 'bg-green-500',
    staging: 'bg-yellow-500',
    preview: 'bg-blue-500',
  };

  return (
    <div className={`fixed bottom-4 right-4 ${colors[env]} text-white px-3 py-1 rounded-full text-sm font-medium z-50`}>
      {env.toUpperCase()}
    </div>
  );
};
```

### Step 3.4: Local Test Credentials

Local Supabase requires test users for authentication. These are **different from production credentials**.

#### Test User Accounts

| Account        | Email                  | Password       | District Access   |
| -------------- | ---------------------- | -------------- | ----------------- |
| Westside Admin | `admin@westside66.org` | `Westside123!` | Westside district |
| Eastside Admin | `admin@eastside.edu`   | `Eastside123!` | Eastside district |

#### Creating Test Users

Test users are created by running:

```bash
# Option 1: Reset database AND create test users (recommended)
npm run db:reset:dev

# Option 2: Create test users only (if database already has data)
./scripts/create-test-users.sh
```

#### Important Notes

- **These credentials only work locally** - they don't exist in production
- Each admin can only access their assigned district
- After `npm run db:reset`, you must run `./scripts/create-test-users.sh` OR use `npm run db:reset:dev`
- Test users have `district_admin` role in their metadata

#### Login URL

```
http://localhost:5173/login
```

### Step 3.5: Daily Development Workflow

```bash
# Start of day: Ensure Docker is running
docker info

# Start local Supabase + Vite
npm run dev:local

# If you need fresh data
npm run db:reset

# Before committing
npm run lint && npm run type-check && npm test
```

---

## Phase 4: CI/CD Pipeline

### Step 4.1: Current GitHub Actions

Your current workflow runs on PRs:

- Lint and type-check
- Unit tests
- Build verification
- Migration tests

### Step 4.2: Enhanced Workflow (Recommended)

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

jobs:
  # ============================================
  # Quality Checks (runs on all PRs and pushes)
  # ============================================
  quality:
    name: Quality Checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type Check
        run: npm run type-check

      - name: Unit Tests
        run: npm run test:run

  # ============================================
  # Build Verification
  # ============================================
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.STAGING_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.STAGING_SUPABASE_ANON_KEY }}

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/

  # ============================================
  # Migration Tests
  # ============================================
  migration-tests:
    name: Migration Tests
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Start Supabase
        run: supabase start

      - name: Validate Migrations
        run: ./scripts/validate-migrations.sh

      - name: Run Migration Smoke Tests
        run: ./scripts/test-migrations.sh

  # ============================================
  # Deploy Staging (on develop branch)
  # ============================================
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build, migration-tests]
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    environment:
      name: staging
      url: https://staging.yourapp.com
    steps:
      - uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1

      - name: Push migrations to staging
        run: |
          supabase link --project-ref ${{ secrets.STAGING_PROJECT_REF }}
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Notify deployment
        run: echo "Deployed to staging"

  # ============================================
  # Deploy Production (on main branch)
  # ============================================
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, migration-tests]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment:
      name: production
      url: https://yourapp.com
    steps:
      - uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1

      - name: Push migrations to production
        run: |
          supabase link --project-ref ${{ secrets.PRODUCTION_PROJECT_REF }}
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Notify deployment
        run: echo "Deployed to production"
```

### Step 4.3: Required GitHub Secrets

Add these in **Repository Settings** → **Secrets and variables** → **Actions**:

| Secret                      | Description                                   |
| --------------------------- | --------------------------------------------- |
| `SUPABASE_ACCESS_TOKEN`     | Personal access token from Supabase dashboard |
| `STAGING_PROJECT_REF`       | Staging project reference ID                  |
| `STAGING_SUPABASE_URL`      | Staging Supabase URL                          |
| `STAGING_SUPABASE_ANON_KEY` | Staging anon key                              |
| `PRODUCTION_PROJECT_REF`    | Production project reference ID               |

### Step 4.4: GitHub Environments

Set up environments for deployment protection:

1. Go to **Repository Settings** → **Environments**
2. Create `staging` environment
3. Create `production` environment with:
   - Required reviewers (optional)
   - Wait timer (optional)
   - Deployment branch rule: `main` only

---

## Phase 5: Git Branching Strategy

### Recommended: GitHub Flow with Develop Branch

```
main (production)
├── Always deployable
├── Protected branch
├── Requires PR approval
└── Auto-deploys to production

develop (staging)
├── Integration branch
├── Auto-deploys to staging
└── Merge from feature branches

feature/* (development)
├── Created from develop
├── PR preview deployments
└── Merged to develop after review
```

### Branch Protection Rules

Configure in **Repository Settings** → **Branches**:

**main branch:**

- ✅ Require pull request before merging
- ✅ Require approvals (1-2 reviewers)
- ✅ Require status checks (quality, build, migration-tests)
- ✅ Require branches to be up to date
- ✅ Do not allow bypassing

**develop branch:**

- ✅ Require pull request before merging
- ✅ Require status checks
- ⬜ Approvals optional (team preference)

### Workflow Example

```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/issue-123-add-export

# ... develop locally ...

# Push and create PR to develop
git push -u origin feature/issue-123-add-export
# Create PR: feature/issue-123-add-export → develop

# After PR approval and merge to develop
# → Staging deployment happens automatically
# → QA tests on staging

# When ready for production
# Create PR: develop → main
# → After approval, production deployment
```

---

## Database Migration Workflow

### Migration Promotion Flow

```
Local Development
      │
      ▼ (supabase db diff)
┌─────────────────┐
│ Migration File  │  supabase/migrations/TIMESTAMP_name.sql
└─────────────────┘
      │
      ▼ (git push → PR merged to develop)
┌─────────────────┐
│ Staging DB      │  supabase db push (CI/CD)
└─────────────────┘
      │
      ▼ (PR merged to main)
┌─────────────────┐
│ Production DB   │  supabase db push (CI/CD)
└─────────────────┘
```

### Migration Development Checklist

```markdown
## Before Creating Migration

- [ ] Make schema changes in local Supabase Studio
- [ ] Test thoroughly with application locally
- [ ] Generate migration: `supabase db diff -f descriptive_name`

## Review Migration

- [ ] Check generated SQL is correct
- [ ] Verify RLS policies included
- [ ] Check for destructive operations
- [ ] Add any necessary data migrations

## Test Migration

- [ ] Reset local DB: `npm run db:reset`
- [ ] Run application tests: `npm test`
- [ ] Manual testing of affected features

## After Staging Deploy

- [ ] Verify migration applied: check Supabase Studio
- [ ] Test affected features on staging
- [ ] Reload schema cache in Supabase Dashboard

## After Production Deploy

- [ ] Verify migration applied
- [ ] Monitor for errors
- [ ] Reload schema cache in Supabase Dashboard
```

### Rollback Strategy

**Prevention is better than rollback:**

1. Always test migrations locally first
2. Use staging to catch issues
3. Review destructive operations carefully

**If rollback needed:**

```bash
# Create a new migration that reverses the changes
supabase db diff -f rollback_previous_change

# Example: If you added a column, create migration to drop it
# Never delete migration files from history
```

---

## Team Workflows

### Developer Daily Workflow

```bash
# Morning routine
git checkout develop
git pull origin develop
npm run dev:local

# Start feature
git checkout -b feature/issue-XXX-description

# Development cycle
# ... code changes ...
npm run lint:fix
npm run type-check
npm test

# Commit and push
git add .
git commit -m "feat: add feature description"
git push -u origin feature/issue-XXX-description

# Create PR → develop
# Wait for CI checks
# Request review
```

### Code Review Checklist

```markdown
## PR Review Checklist

### Code Quality

- [ ] Follows project coding standards
- [ ] No TypeScript errors or warnings
- [ ] No ESLint errors or warnings
- [ ] Tests added for new functionality

### Functionality

- [ ] Tested on preview deployment
- [ ] Edge cases handled
- [ ] Error states handled

### Database (if applicable)

- [ ] Migration tested locally
- [ ] RLS policies reviewed
- [ ] No destructive operations without plan

### Security

- [ ] No secrets in code
- [ ] Input validation present
- [ ] Auth checks in place
```

### Release Process

```markdown
## Release to Production

### Pre-Release (on develop/staging)

1. [ ] All features for release merged to develop
2. [ ] Staging tested by QA
3. [ ] Stakeholder approval obtained
4. [ ] All CI checks passing

### Release

1. [ ] Create PR: develop → main
2. [ ] Final review of changes
3. [ ] Merge PR (triggers production deploy)

### Post-Release

1. [ ] Verify production deployment succeeded
2. [ ] Reload Supabase schema cache (if migrations)
3. [ ] Smoke test critical paths
4. [ ] Monitor error tracking
5. [ ] Announce release to team
```

---

## Troubleshooting

### Common Issues

#### "Migration failed on staging but works locally"

**Cause**: Schema drift between environments

**Solution**:

```bash
# Check current schema on staging
supabase link --project-ref <staging-ref>
supabase db diff

# If drift exists, create corrective migration
supabase db diff -f fix_schema_drift
```

#### "Preview deployment shows old data"

**Cause**: Preview using cached data or wrong environment

**Solution**:

1. Check Vercel environment variables
2. Verify Preview scope has staging Supabase URL
3. Hard refresh browser (Cmd+Shift+R)

#### "Can't connect to staging Supabase locally"

**Cause**: Still linked to local or production

**Solution**:

```bash
# Check current link
supabase status

# Relink to staging
supabase link --project-ref <staging-ref>
```

#### "Tests fail in CI but pass locally"

**Cause**: Environment differences

**Solution**:

1. Check Node version matches
2. Verify all dependencies installed
3. Check for hardcoded localhost URLs
4. Run `npm ci` locally to match CI install

### Debug Commands

```bash
# Check Supabase link status
supabase status

# View migration history
supabase migration list

# Check remote schema
supabase db diff

# Validate migrations without running
./scripts/validate-migrations.sh

# Full migration test
npm run db:test
```

---

## Security Considerations

### Secrets Management

| Secret                | Where to Store              | Never Store In          |
| --------------------- | --------------------------- | ----------------------- |
| Supabase Anon Key     | Vercel env vars, .env.local | Git repository          |
| Supabase Service Role | GitHub Secrets only         | Client code, .env files |
| Database Password     | Password manager            | Anywhere in code        |
| API Keys              | Vercel/GitHub Secrets       | .env.example            |

### Environment Isolation

- **Production data**: Never copy to staging or local
- **Test accounts**: Use dedicated test email domains
- **RLS policies**: Test in all environments
- **Service role**: Never expose in client code

### Access Control

| Environment               | Who Has Access       |
| ------------------------- | -------------------- |
| Local                     | Individual developer |
| Staging                   | Development team, QA |
| Production                | Limited team members |
| Supabase Dashboard (Prod) | Admin only           |

---

## Cost Considerations

### Supabase Pricing (as of 2025)

| Plan | Monthly          | Suitable For                         |
| ---- | ---------------- | ------------------------------------ |
| Free | $0               | Local dev, small staging, MVPs       |
| Pro  | $25 base + usage | Production with paying customers     |
| Team | $599             | Enterprise features, SSO, audit logs |

### Free vs Pro Comparison

| Resource         | Free      | Pro          |
| ---------------- | --------- | ------------ |
| Database Size    | 500 MB    | 8 GB         |
| File Storage     | 1 GB      | 100 GB       |
| Auth Users (MAU) | 50K       | 100K         |
| Compute Credits  | None      | $10 included |
| Projects         | 2 per org | Unlimited    |

### Performance & Reliability (Why Pro Matters)

| Feature                | Free                         | Pro               |
| ---------------------- | ---------------------------- | ----------------- |
| Project Pausing        | Pauses after 7 days inactive | **Never pauses**  |
| Backups                | None                         | **Daily backups** |
| Point-in-Time Recovery | No                           | **Yes**           |
| Log Retention          | 1 day                        | 7 days            |
| Support                | Community only               | Email support     |
| Uptime SLA             | None                         | **Yes**           |

### Real-World Monthly Costs

| App Size              | Expected Cost | Notes                    |
| --------------------- | ------------- | ------------------------ |
| Small (< 10K users)   | $25-35        | Base + minimal overages  |
| Medium (10-50K users) | $35-75        | Moderate usage           |
| Large (200K+ users)   | $100-200      | Higher compute/bandwidth |

### Recommended Setup

| Environment | Plan   | Monthly Cost | Notes                             |
| ----------- | ------ | ------------ | --------------------------------- |
| Local       | Docker | $0           | No Supabase cost                  |
| Staging     | Free   | $0           | Acceptable for testing            |
| Production  | Pro    | $25+         | **Required** for paying customers |

### Why Pro is Required for Production

With paying customers, you **must** use Pro because:

- **No backups on Free** = unacceptable data loss risk
- **Project pausing** = terrible UX for customers
- **No SLA** = no accountability for downtime
- **Community support only** = slow issue resolution

### Cost Optimization Tips

1. **Staging on Free tier**: Acceptable for most teams (it may pause, but that's fine for staging)
2. **Enable spend caps**: Prevent surprise bills from traffic spikes
3. **Monitor usage**: Check Supabase dashboard weekly for limits
4. **Clean test data**: Periodically purge old staging data
5. **Right-size compute**: Start with base, upgrade only when needed

---

## Quick Reference

### Environment URLs

| Environment | App URL                     | Supabase Dashboard                                 |
| ----------- | --------------------------- | -------------------------------------------------- |
| Local       | http://localhost:5173       | http://localhost:54323                             |
| Staging     | https://staging.yourapp.com | https://supabase.com/dashboard/project/STAGING_REF |
| Production  | https://yourapp.com         | https://supabase.com/dashboard/project/PROD_REF    |

### Key Commands

```bash
# Local development
npm run dev:local          # Start everything
npm run db:reset           # Reset local database
npm run db:studio          # Open local Supabase Studio

# Testing
npm test                   # Run tests in watch mode
npm run test:run           # Run tests once
npm run db:test            # Full migration test

# Quality
npm run lint               # Check linting
npm run lint:fix           # Fix linting issues
npm run type-check         # TypeScript check

# Deployment
supabase link --project-ref <ref>  # Switch Supabase project
supabase db push           # Push migrations to linked project
supabase db diff -f name   # Generate new migration
```

### Team Contacts

| Role           | Responsibility                      |
| -------------- | ----------------------------------- |
| DevOps Lead    | CI/CD, environment setup            |
| Database Admin | Migration review, production access |
| QA Lead        | Staging testing, release approval   |
| Tech Lead      | Architecture decisions              |

---

## Next Steps

### If Using Supabase Branching (Recommended)

1. [ ] **Step 1**: Enable Supabase GitHub integration
2. [ ] **Step 2**: Configure preview branching settings
3. [ ] **Step 3**: Set up Supabase-Vercel integration
4. [ ] **Step 4**: Test with a sample PR
5. [ ] **Step 5**: Update team's local development setup
6. [ ] **Step 6**: Train team on new workflow

### If Using Separate Staging Project

1. [ ] **Step 1**: Create staging Supabase project
2. [ ] **Step 2**: Configure Vercel environment variables
3. [ ] **Step 3**: Set up GitHub Actions for migration deployment
4. [ ] **Step 4**: Update team's local development setup
5. [ ] **Step 5**: Implement git branching strategy
6. [ ] **Step 6**: Train team on new processes

### If Using Both (Branching + Persistent Staging)

1. [ ] **Step 1**: Set up Supabase Branching (for PR previews)
2. [ ] **Step 2**: Create separate staging project (for QA/demos)
3. [ ] **Step 3**: Configure Vercel for both
4. [ ] **Step 4**: Document which environment to use when
5. [ ] **Step 5**: Train team on dual workflow

---

_Last Updated: January 2025_
_Document Owner: Development Team_
