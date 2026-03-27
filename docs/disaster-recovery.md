# Disaster Recovery Runbook

## StrataDash — Database Recovery Procedures

**Last reviewed:** 2026-03-13

---

## Database Setup

| Item           | Value                                                |
| -------------- | ---------------------------------------------------- |
| Provider       | Neon (serverless PostgreSQL)                         |
| Project        | `small-salad-72814952` (stratadash, us-east-1)       |
| Database       | `strategic-plan-db`                                  |
| PITR window    | 7 days (free tier) / 30 days (Launch plan)           |
| Manual backups | Local pg_dump via `npm run db:backup`, stored on NAS |

**Access:** Neon dashboard credentials are stored in the team password vault. Vercel dashboard (env vars, deployment logs) access likewise.

---

## Infrastructure Overview

| Service        | Purpose                                            | Dashboard                                                                                                  |
| -------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Vercel**     | Hosting, serverless functions, preview deployments | [vercel.com/pernells-projects/strategic-plan-app](https://vercel.com/pernells-projects/strategic-plan-app) |
| **Neon**       | PostgreSQL database (serverless)                   | [console.neon.tech](https://console.neon.tech) — project `small-salad-72814952`                            |
| **GitHub**     | Source code, CI/CD, weekly backup artifacts        | [github.com/ptoney514/strategic-plan-app](https://github.com/ptoney514/strategic-plan-app)                 |
| **Sentry**     | Error monitoring (API + frontend)                  | [sentry.io](https://sentry.io) — org `ptcs`, project `javascript-nextjs`                                   |
| **Resend**     | Transactional email (password reset)               | [resend.com](https://resend.com)                                                                           |
| **Cloudflare** | DNS for stratadash.org                             | [dash.cloudflare.com](https://dash.cloudflare.com)                                                         |

## Database Branches

| Branch | Purpose                    |
| ------ | -------------------------- |
| `main` | Production                 |
| `dev`  | Development / preview base |

---

## RTO / RPO Targets

| Scenario                         | RTO     | RPO                          |
| -------------------------------- | ------- | ---------------------------- |
| Bad deploy (Vercel rollback)     | <5 min  | 0                            |
| DB corruption within PITR window | <15 min | Up to 7 days (free tier)     |
| DB corruption outside PITR       | <30 min | Up to 7 days (weekly backup) |
| Full infrastructure rebuild      | <1 hour | Up to 7 days                 |

**Definitions:** RTO = Recovery Time Objective (how fast we restore service). RPO = Recovery Point Objective (maximum acceptable data loss).

---

## Backup Strategy

Four layers of protection:

1. **Neon PITR (Point-in-Time Recovery)** — Automatic, 7-day window (free tier). Fastest restore for recent data accidents.
2. **GitHub Actions weekly backup** — `pg_dump` runs every Sunday 3 AM UTC, stored as a 30-day artifact. See `.github/workflows/backup.yml`.
3. **Local macOS backup (launchd)** — `pg_dump` runs every Sunday 3 AM local time via `com.stratadash.db-backup.plist`. Stored in `~/backups/stratadash/`, auto-cleaned after 30 days.
4. **Claude scheduled task** — `stratadash-db-backup` runs every Sunday 3:10 AM local time. Runs `npm run db:backup`, checks for `[SUCCESS]`/`[FAILED]` markers, retries on failure.

The backup script retries up to 3 times on transient failures (DNS, timeout) and logs structured `[SUCCESS]`/`[FAILED]` markers for automated monitoring.

### What's Backed Up

| Data                     | Backup method                      | Retention               |
| ------------------------ | ---------------------------------- | ----------------------- |
| Database (schema + data) | Neon PITR                          | 7 days rolling          |
| Database (full dump)     | Weekly local pg_dump               | 30 days                 |
| Database (full dump)     | Weekly GitHub Actions pg_dump      | 30 days (artifact)      |
| Source code              | GitHub                             | Permanent (git history) |
| Deployments              | Vercel                             | Rollback to any deploy  |
| Environment variables    | Documented in `.env.local.example` | Manual recovery         |

### Launchd monitoring

**Log file**: `~/backups/stratadash/backup.log`

```bash
# Quick health check — scan for pass/fail
grep -E '\[SUCCESS\]|\[FAILED\]' ~/backups/stratadash/backup.log | tail -5

# Check if the agent is loaded
launchctl list | grep stratadash

# View recent backup log
tail -20 ~/backups/stratadash/backup.log

# Manually trigger a backup
launchctl start com.stratadash.db-backup

# Install/reinstall the agent
npm run db:backup:install

# On-demand backup via npm
DATABASE_URL_PROD=<prod-url> npm run db:backup

# List recent backups
ls -lh ~/backups/stratadash/backup-*.dump
```

### Always-on machine backup (cron) — optional redundancy

If you have an always-on Mac (e.g., Mac Mini server), set up a cron job as a fallback in case the primary Mac is asleep or powered off during the launchd window.

Prerequisites:

```bash
brew install libpq && brew link --force libpq
```

Setup:

1. Clone the repo (or copy `scripts/backup-db.sh` + `.env.local` to a working directory)
2. Add a cron job:

```bash
crontab -e
# Add this line (adjust path to match repo location):
15 3 * * 0 cd /path/to/strategic-plan-app && DATABASE_URL_PROD="$(grep DATABASE_URL_PROD .env.local | cut -d= -f2-)" bash scripts/backup-db.sh >> ~/backups/stratadash/backup.log 2>&1
```

3. Verify cron is scheduled: `crontab -l`

---

## Step 1 — Assess the Damage

Before restoring, determine what happened:

- **Accidental row deletion or bad data update** → PITR restore to a point before the bad query
- **Schema corruption / bad migration** → restore from Git-based schema + `drizzle-kit migrate`
- **Total data loss (table dropped, DB wiped)** → full restore from weekly pg_dump artifact
- **App returning errors but data intact** → check Vercel logs, not a DR situation

---

## Step 2 — Neon PITR Restore (fastest for data accidents)

1. Open [Neon Console](https://console.neon.tech) → Project `small-salad-72814952`
2. Click **Branches** → select `main`
3. Click **Restore** → pick a timestamp **before** the incident
4. Neon creates a restore branch (e.g., `main_restore_20260301`)
5. **Verify data on the restore branch:**
   - Update `.env.local` with the restore branch connection string
   - Run `npm run dev:api` and spot-check org/goal/metric counts
6. **Promote restore branch to production:**
   - In Neon Console: set the restore branch as the new primary (`main`)
   - Or: update `DATABASE_URL` in Vercel env vars to point to the restore branch URL
   - Trigger a Vercel redeployment to pick up the new env var

> **Note:** Promoting a branch replaces the old main. The old main data is gone after promotion. Take a manual pg_dump first if unsure.

---

## Step 3 — Schema-Only Restore from Git

If only schema is lost (data is intact on a fresh Neon branch):

```bash
# 1. Create a fresh Neon branch (or use the damaged one if tables just need recreating)
neonctl branches create --name recovery --project-id small-salad-72814952

# 2. Get the connection string
neonctl connection-string --branch recovery \
  --database-name strategic-plan-db \
  --project-id small-salad-72814952

# 3. Set DATABASE_URL and replay all migrations
DATABASE_URL=<recovery-connection-string> npx drizzle-kit migrate

# 4. Apply custom triggers
DATABASE_URL=<recovery-connection-string> psql -f drizzle/custom/triggers.sql
```

---

## Step 4 — Full Restore from pg_dump

Use this when PITR is unavailable (> 7 days ago) or you need a specific snapshot.

### Get the backup file

Backups are stored locally on NAS. Retrieve the relevant `backup-YYYYMMDD-HHMMSS.dump` file.

To create a fresh backup first: `DATABASE_URL_PROD=<prod-url> npm run db:backup`

### Restore to a fresh Neon branch

```bash
# Create a fresh branch for the restore
neonctl branches create --name recovery --project-id small-salad-72814952
RECOVERY_URL=$(neonctl connection-string --branch recovery \
  --database-name strategic-plan-db --project-id small-salad-72814952)

# Restore the dump
pg_restore --dbname "$RECOVERY_URL" \
  --format=custom --no-acl --no-owner \
  --clean --if-exists \
  backup-YYYYMMDD.dump
```

---

## Step 5 — Verify Restored Data

```bash
# Smoke-test the API
curl https://www.stratadash.org/api/health

# Check record counts via Drizzle Studio
DATABASE_URL=<recovery-url> npx drizzle-kit studio
```

Verify:

- [ ] Organizations table has expected districts
- [ ] Goals, metrics, plans exist for each org
- [ ] Login works with test credentials

---

## Step 6 — Promote to Production

**Option A — Neon branch swap (recommended):**

1. Neon Console → Branches → set recovery branch as primary
2. Vercel redeployment picks up the same `DATABASE_URL` (if Neon-Vercel integration is active)

**Option B — Update env var:**

1. `vercel env rm DATABASE_URL production`
2. `printf '<recovery-url>' | vercel env add DATABASE_URL production`
3. Trigger redeploy: `vercel --prod`

---

## Step 7 — Notify Users

```
Subject: StrataDash — Resolved: Service disruption on [DATE]

We experienced a data issue on [DATE] between [TIME] and [TIME] UTC.
Your strategic plan data has been fully restored to [RESTORE POINT].
Any changes made during this window may need to be re-entered.

We apologize for the disruption. Please contact support if you notice any missing data.
```

---

## Production Migration Procedure

> Run migrations **before** deploying code that requires the new schema.

```bash
# 1. Pull current production env vars
vercel env pull .env.production --environment production

# 2. Preview the migration SQL
npx drizzle-kit generate  # if new migration needed

# 3. Apply to production
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d= -f2) \
  npx drizzle-kit migrate

# 4. Verify in Drizzle Studio
DATABASE_URL=<prod-url> npx drizzle-kit studio

# 5. Deploy new code
git push origin main  # Vercel auto-deploys
```

**Rule:** Migrations must be backwards-compatible — old code + new schema must work. This allows zero-downtime deploys (migrate → deploy, not deploy → migrate).

---

## Backup Procedure

Run manually before risky migrations, or on a regular schedule (monthly minimum):

```bash
DATABASE_URL_PROD=<prod-url> npm run db:backup
# Saves to ~/backups/stratadash/ by default
# Or specify a path: DATABASE_URL_PROD=<prod-url> bash scripts/backup-db.sh /Volumes/NAS/stratadash
```

Verify the dump is valid: `pg_restore --list ~/backups/stratadash/backup-YYYYMMDD.dump | head -20`

Log each backup below:

## Maintenance Schedule

| Task                            | Frequency             | How                                                                                         |
| ------------------------------- | --------------------- | ------------------------------------------------------------------------------------------- |
| Verify weekly backup runs       | Weekly                | `grep -E '\[SUCCESS\]\|\[FAILED\]' ~/backups/stratadash/backup.log` or check GitHub Actions |
| Copy backup to NAS/Google Drive | Weekly (after backup) | Copy latest `.dump` from `~/backups/stratadash/`                                            |
| Test backup restore             | Monthly               | Restore dump to a Neon test branch, verify data                                             |
| Review Neon PITR window         | Quarterly             | Neon Console → Settings → Instant restore                                                   |
| Rotate Sentry auth token        | Every 6 months        | Sentry → Settings → Auth Tokens                                                             |

---

## Contacts

| Role                   | Contact           |
| ---------------------- | ----------------- |
| Site admin / developer | pernell@gmail.com |

---

## Backup Log

| Date | Verified By | Notes |
| ---- | ----------- | ----- |
| —    | —           | —     |
