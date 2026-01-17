# Production Readiness Checklist

A comprehensive guide for preparing the Strategic Plan Builder for production with thousands of users.

---

## Table of Contents

1. [Current State Assessment](#current-state-assessment)
2. [Critical Gaps](#critical-gaps)
3. [Monitoring & Observability](#1-monitoring--observability)
4. [CI/CD Improvements](#2-cicd-improvements)
5. [Security Hardening](#3-security-hardening)
6. [Database & Infrastructure](#4-database--infrastructure)
7. [Operational Readiness](#5-operational-readiness)
8. [Docker Considerations](#6-docker-considerations)
9. [Pre-Launch Checklist](#7-pre-launch-checklist)
10. [Cost Estimates](#8-cost-estimates)
11. [Action Plan](#9-action-plan)

---

## Current State Assessment

### What We Have ✅

| Component      | Status        | Notes                          |
| -------------- | ------------- | ------------------------------ |
| Deployment     | ✅ Configured | Vercel auto-deploy from main   |
| Database       | ✅ Configured | Supabase with 16 migrations    |
| Authentication | ✅ Configured | Supabase Auth + RLS policies   |
| CI Pipeline    | ✅ Configured | Lint, tests, build, E2E        |
| Local Dev      | ✅ Configured | Docker-based Supabase          |
| Multi-env Docs | ✅ Documented | See MULTI_ENVIRONMENT_SETUP.md |

### What's Missing 🔴

| Component           | Status            | Priority     |
| ------------------- | ----------------- | ------------ |
| Error tracking      | ❌ Not configured | **Critical** |
| Uptime monitoring   | ❌ Not configured | **Critical** |
| Analytics           | ❌ Not enabled    | High         |
| Staging environment | ❌ Not configured | High         |
| Security scanning   | ❌ Not configured | High         |
| Incident runbook    | ❌ Not created    | Medium       |
| Status page         | ❌ Not configured | Medium       |

---

## Critical Gaps

When thousands of users hit your app, you need visibility into:

1. **Errors** - What's breaking and for whom?
2. **Performance** - Is the app slow? Where?
3. **Availability** - Is the site up?
4. **Security** - Are we vulnerable?

Without these, you're flying blind.

---

## 1. Monitoring & Observability

### Error Tracking - Sentry (Recommended)

**Why**: Real-time error alerts with full context (user, browser, stack trace)

**Setup**:

```bash
npm install @sentry/react
```

**Configuration** (`src/main.tsx`):

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT || "development",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0, // 100% on errors
});
```

**Environment Variables**:

```bash
# Add to Vercel environment variables
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_ENVIRONMENT=production  # or staging
```

**Error Boundary** (`src/components/ErrorBoundary.tsx`):

```typescript
import * as Sentry from "@sentry/react";

export const ErrorBoundary = Sentry.withErrorBoundary(
  ({ children }) => children,
  {
    fallback: ({ error }) => (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
        <p className="mt-2 text-gray-600">We've been notified and are working on it.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Reload Page
        </button>
      </div>
    ),
  }
);
```

**Checklist**:

- [ ] Create Sentry account at https://sentry.io
- [ ] Create new React project
- [ ] Install @sentry/react package
- [ ] Add Sentry.init() to main.tsx
- [ ] Add VITE_SENTRY_DSN to Vercel env vars
- [ ] Configure source maps upload in build
- [ ] Test error reporting in staging

---

### Uptime Monitoring

**Options**:

| Service     | Free Tier                 | Paid   | Recommendation      |
| ----------- | ------------------------- | ------ | ------------------- |
| BetterStack | 5 monitors, 3-min checks  | $24/mo | Best free tier      |
| UptimeRobot | 50 monitors, 5-min checks | $7/mo  | Good budget option  |
| Pingdom     | None                      | $15/mo | Enterprise standard |

**Setup (BetterStack)**:

1. Create account at https://betterstack.com/uptime
2. Add monitor for your production URL
3. Add monitor for Supabase API endpoint
4. Configure alert channels (email, Slack, SMS)

**Monitors to Create**:

| Endpoint                       | Check Interval | Alert After |
| ------------------------------ | -------------- | ----------- |
| https://yourapp.com            | 1 min          | 2 failures  |
| https://yourapp.com/api/health | 1 min          | 2 failures  |
| Supabase API URL               | 5 min          | 3 failures  |

**Checklist**:

- [ ] Sign up for uptime monitoring service
- [ ] Add production URL monitor
- [ ] Add API health check monitor
- [ ] Configure Slack/email alerts
- [ ] Test alerting works

---

### Analytics

**Vercel Analytics** (Recommended - Easy):

1. Go to Vercel Dashboard → Your Project → Analytics
2. Click "Enable"
3. Done!

Provides:

- Page views
- Unique visitors
- Web Vitals (LCP, FID, CLS)
- Top pages
- Geographic data

**PostHog** (Optional - More Features):

If you need session recordings, feature flags, A/B testing:

```bash
npm install posthog-js
```

**Checklist**:

- [ ] Enable Vercel Analytics in dashboard
- [ ] Verify data appears after deployment
- [ ] (Optional) Set up PostHog for advanced analytics

---

## 2. CI/CD Improvements

### Current Pipeline

```
lint-typecheck
    ├── unit-tests (parallel)
    ├── build (parallel)
    ├── migration-tests (parallel)
    └── e2e-tests (after build)
```

### Recommended Additions

#### Security Scanning Job

Add to `.github/workflows/ci.yml`:

```yaml
security-scan:
  name: Security Scan
  runs-on: ubuntu-latest
  needs: lint-typecheck
  steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: "npm"

    - name: Install dependencies
      run: npm ci

    - name: Run npm audit
      run: npm audit --audit-level=high
      continue-on-error: true

    - name: Check for known vulnerabilities
      run: npx audit-ci --high
```

#### Deployment Notifications

Add to deployment jobs:

```yaml
- name: Notify Slack on deployment
  if: success()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    payload: |
      {
        "text": "✅ Deployed to ${{ github.ref_name }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Deployment Successful*\nBranch: `${{ github.ref_name }}`\nCommit: `${{ github.sha }}`"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Enable Dependabot

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 5
    groups:
      minor-and-patch:
        patterns:
          - "*"
        update-types:
          - "minor"
          - "patch"
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]
```

### Branch Protection Rules

Configure in GitHub → Settings → Branches → Add rule:

**For `main` branch**:

- [x] Require pull request before merging
- [x] Require approvals: 1
- [x] Require status checks to pass:
  - `Lint & Type Check`
  - `Unit Tests`
  - `Build`
  - `Migration Tests`
- [x] Require branches to be up to date
- [x] Do not allow bypassing

**Checklist**:

- [ ] Add security-scan job to CI
- [ ] Create .github/dependabot.yml
- [ ] Configure branch protection for main
- [ ] Set up Slack webhook for notifications
- [ ] Add SLACK_WEBHOOK_URL secret

---

## 3. Security Hardening

### Security Headers

Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

### Rate Limiting (Supabase)

Supabase has built-in rate limiting. Configure in Dashboard:

1. Go to Project Settings → API
2. Set rate limits per endpoint
3. Recommended: 100 requests/minute for authenticated users

### Input Validation

Ensure all forms use Zod validation (per CLAUDE.md requirements).

**Checklist**:

- [ ] Add security headers to vercel.json
- [ ] Review Supabase rate limiting settings
- [ ] Audit all forms for Zod validation
- [ ] Review RLS policies for completeness
- [ ] Check for exposed secrets in codebase

---

## 4. Database & Infrastructure

### Supabase Production Requirements

| Requirement            | Free Tier | Pro Tier | Status       |
| ---------------------- | --------- | -------- | ------------ |
| Daily backups          | ❌        | ✅       | Required     |
| Point-in-time recovery | ❌        | ✅       | Required     |
| No project pausing     | ❌        | ✅       | Required     |
| SLA                    | ❌        | ✅       | Required     |
| Email support          | ❌        | ✅       | Nice to have |

**Action**: Upgrade to Supabase Pro before launch ($25/month)

### Backup Verification

**Monthly task**: Verify backups work

1. Go to Supabase Dashboard → Database → Backups
2. Download a recent backup
3. Restore to local Supabase
4. Verify data integrity

### Connection Pooling

Supabase uses PgBouncer by default. Verify settings:

1. Dashboard → Project Settings → Database
2. Check "Connection Pooling" is enabled
3. Use pooled connection string for high-traffic scenarios

**Checklist**:

- [ ] Upgrade Supabase to Pro tier
- [ ] Verify daily backups are enabled
- [ ] Test backup restoration process
- [ ] Document database connection strings
- [ ] Set up usage alerts in Supabase

---

## 5. Operational Readiness

### Incident Runbook Template

Create `docs/INCIDENT_RUNBOOK.md`:

```markdown
# Incident Response Runbook

## Severity Levels

| Level | Description       | Response Time | Examples                          |
| ----- | ----------------- | ------------- | --------------------------------- |
| SEV-1 | Complete outage   | 15 min        | Site down, data loss              |
| SEV-2 | Major degradation | 1 hour        | Login broken, slow performance    |
| SEV-3 | Minor issue       | 4 hours       | UI bug, non-critical feature down |

## First Response Checklist

1. [ ] Acknowledge alert
2. [ ] Check Vercel deployment status
3. [ ] Check Supabase status page
4. [ ] Check Sentry for recent errors
5. [ ] Check recent deployments

## Common Issues

### Site completely down

1. Check Vercel status: https://www.vercel-status.com/
2. Check Supabase status: https://status.supabase.com/
3. Try Vercel instant rollback if recent deployment

### Login not working

1. Check Supabase Auth dashboard
2. Check RLS policies weren't changed
3. Verify environment variables

### Database errors

1. Check Supabase connection pooling
2. Check for slow queries in dashboard
3. Review recent migrations

## Rollback Procedure

### Vercel Instant Rollback

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

### Database Rollback

1. Create new migration to reverse changes
2. Never delete migration files
3. Test locally first, then push

## Contact List

| Role             | Name | Contact             |
| ---------------- | ---- | ------------------- |
| Primary On-Call  | TBD  | TBD                 |
| Backup On-Call   | TBD  | TBD                 |
| Supabase Support | -    | support@supabase.io |
| Vercel Support   | -    | support@vercel.com  |
```

### Status Page

**Options**:

| Service                | Free Tier | Notes               |
| ---------------------- | --------- | ------------------- |
| Instatus               | Yes       | Best free option    |
| Statuspage (Atlassian) | No        | Enterprise standard |
| BetterStack Status     | Yes       | Bundled with uptime |

**Setup**:

1. Create status page at chosen provider
2. Add components: Website, API, Database
3. Share URL with users
4. Update during incidents

**Checklist**:

- [ ] Create incident runbook
- [ ] Set up status page
- [ ] Define on-call rotation (if team)
- [ ] Practice incident response
- [ ] Document rollback procedures

---

## 6. Docker Considerations

### Do You Need Docker for Production?

| Use Case                | Need Docker? | Why                         |
| ----------------------- | ------------ | --------------------------- |
| Production deployment   | **No**       | Vercel handles it           |
| Local development       | **Partial**  | Already using for Supabase  |
| Preview environments    | **No**       | Vercel + Supabase branching |
| Multi-cloud portability | **Yes**      | If leaving Vercel later     |
| Custom backend services | **Yes**      | If adding workers/APIs      |

### When to Add Docker

Add Docker if you need:

- **Kubernetes deployment** (outgrowing Vercel)
- **Custom server-side processing** (image processing, PDF generation)
- **Self-hosted services** (analytics, search)
- **Consistent team environments** (beyond Supabase)

### If You Add Docker Later

Basic `Dockerfile` for the React app:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Recommendation**: Skip Docker for now. Vercel + Supabase handles your needs.

---

## 7. Pre-Launch Checklist

### Critical (Before Any Users) 🔴

- [ ] **Monitoring**: Sentry error tracking configured
- [ ] **Monitoring**: Uptime monitoring active
- [ ] **Database**: Supabase Pro tier active
- [ ] **Database**: Daily backups verified
- [ ] **Security**: Security headers added
- [ ] **CI/CD**: Branch protection enabled

### Important (Before Scaling) 🟡

- [ ] **Monitoring**: Vercel Analytics enabled
- [ ] **CI/CD**: Staging environment configured
- [ ] **CI/CD**: Security scanning in pipeline
- [ ] **CI/CD**: Dependabot enabled
- [ ] **Ops**: Incident runbook created
- [ ] **Ops**: Status page set up

### Nice to Have (Ongoing) 🟢

- [ ] **Monitoring**: Session replay configured
- [ ] **Performance**: Load testing completed
- [ ] **Ops**: On-call rotation defined
- [ ] **Docs**: User-facing documentation
- [ ] **Compliance**: Privacy policy updated

---

## 8. Cost Estimates

### Monthly Costs (Thousands of Users)

| Service     | Tier | Monthly Cost | Notes                         |
| ----------- | ---- | ------------ | ----------------------------- |
| Vercel      | Pro  | $20          | Team features, more bandwidth |
| Supabase    | Pro  | $25          | Required for backups/SLA      |
| Sentry      | Team | $26          | 50K errors, 100K transactions |
| BetterStack | Free | $0           | 5 monitors                    |
| **Total**   |      | **~$71**     |                               |

### Scaling Costs

| Users/Month      | Estimated Cost | Notes                       |
| ---------------- | -------------- | --------------------------- |
| < 5,000          | ~$45           | Vercel Hobby + Supabase Pro |
| 5,000 - 50,000   | ~$71           | Full stack above            |
| 50,000 - 200,000 | ~$150          | Increased Supabase usage    |
| 200,000+         | ~$300+         | Enterprise considerations   |

---

## 9. Action Plan

### Phase 1: Critical (This Week)

| Task                    | Time    | Owner |
| ----------------------- | ------- | ----- |
| Set up Sentry           | 2 hours |       |
| Enable Vercel Analytics | 15 min  |       |
| Confirm Supabase Pro    | 30 min  |       |
| Add uptime monitoring   | 1 hour  |       |
| Add security headers    | 30 min  |       |

### Phase 2: Important (Next 2 Weeks)

| Task                          | Time    | Owner |
| ----------------------------- | ------- | ----- |
| Configure staging environment | 4 hours |       |
| Add security scanning to CI   | 2 hours |       |
| Enable Dependabot             | 30 min  |       |
| Create incident runbook       | 2 hours |       |
| Set up branch protection      | 1 hour  |       |

### Phase 3: Optimization (First Month)

| Task                  | Time    | Owner |
| --------------------- | ------- | ----- |
| Set up status page    | 2 hours |       |
| Load test application | 4 hours |       |
| Configure cost alerts | 1 hour  |       |
| Document runbooks     | 4 hours |       |

---

## Quick Reference

### Key URLs (Update After Setup)

| Service            | URL                                                         |
| ------------------ | ----------------------------------------------------------- |
| Production         | https://yourapp.com                                         |
| Staging            | https://staging.yourapp.com                                 |
| Vercel Dashboard   | https://vercel.com/your-team/strategic-plan-app             |
| Supabase Dashboard | https://supabase.com/dashboard/project/scpluslhcastrobigkfb |
| Sentry Dashboard   | TBD                                                         |
| Status Page        | TBD                                                         |
| Uptime Dashboard   | TBD                                                         |

### Emergency Contacts

| Role             | Contact             |
| ---------------- | ------------------- |
| Vercel Support   | support@vercel.com  |
| Supabase Support | support@supabase.io |
| Primary On-Call  | TBD                 |

---

## Progress Tracker

### Last Updated: January 2026

| Category    | Complete | Total  | Progress |
| ----------- | -------- | ------ | -------- |
| Monitoring  | 0        | 4      | 0%       |
| CI/CD       | 2        | 6      | 33%      |
| Security    | 1        | 5      | 20%      |
| Database    | 2        | 5      | 40%      |
| Operations  | 0        | 4      | 0%       |
| **Overall** | **5**    | **24** | **21%**  |

---

_Document Owner: Development Team_
_Review Frequency: Before each major release_
