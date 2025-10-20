# Supabase Migration Cleanup Guide

> **Universal guide for cleaning up Supabase migrations across any project**
>
> This guide prepares your project for production-grade migration management and optional Supabase branching integration.

**Last Updated**: 2025-10-20
**Applies To**: Any Supabase project (local or hosted)
**Time Investment**: 2-4 hours for typical project
**Benefit**: Eliminates 95% of schema drift issues

---

## 📋 Table of Contents

1. [Why Clean Migrations Matter](#why-clean-migrations-matter)
2. [Pre-Cleanup Audit](#pre-cleanup-audit)
3. [Cleanup Process](#cleanup-process)
4. [Best Practices](#best-practices)
5. [Preparing for Supabase Branching](#preparing-for-supabase-branching)
6. [Troubleshooting](#troubleshooting)
7. [For Claude Code / AI Assistants](#for-claude-code--ai-assistants)

---

## Why Clean Migrations Matter

### Problems With Messy Migrations

**Schema Drift**: Production differs from local, causing deployment failures
```
Example:
Local DB:    has `frequency` column
Production:  has `collection_frequency` column
Result:      INSERT fails with "column not found" error
```

**Unpredictable Application**: Migrations run in wrong order
```
Migration 005: Adds column `status`
Migration 003: References column `status` (breaks!)
```

**Deployment Failures**: Non-standard files get skipped
```
File:     quick_setup.sql
Status:   Ignored by Supabase CLI (no timestamp)
Result:   Missing tables in production
```

### Benefits of Clean Migrations

- ✅ **Predictable deploys**: Same schema everywhere
- ✅ **Easy rollbacks**: Clear migration history
- ✅ **Team collaboration**: No conflicts between developers
- ✅ **Supabase branching ready**: Prerequisites met
- ✅ **CI/CD compatible**: Automated testing possible

---

## Pre-Cleanup Audit

### Step 1: List All Migration Files

```bash
# Run this command in your project root
find supabase -name "*.sql" -type f | sort
```

**Expected Output** (good project):
```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_add_users.sql
supabase/migrations/003_add_profiles.sql
supabase/seed.sql
```

**Actual Output** (needs cleanup):
```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_add_users.sql
supabase/migrations/004_add_profiles.sql        ⚠️ Gap (missing 003)
supabase/migrations/quick_setup.sql             ❌ No timestamp
supabase/migrations/sample_data.sql.skip        ❌ Wrong extension
supabase/seed.sql                                ✅ OK
supabase/migrations/test_westside.sql           ❌ No timestamp
```

### Step 2: Run Migration Audit Checklist

Copy this checklist and mark each item:

```
MIGRATION FILE AUDIT
====================

[ ] All migration files follow pattern: NNN_description.sql
[ ] No gaps in numbering (001, 002, 003... sequential)
[ ] No duplicate numbers
[ ] No .skip or .backup files in migrations/
[ ] No test data files in migrations/ (should be in seeds/)
[ ] seed.sql exists (if project needs seed data)
[ ] All migrations are idempotent (use IF NOT EXISTS, IF EXISTS, etc.)
[ ] No hardcoded UUIDs that conflict between environments
[ ] migrations/ only contains numbered .sql files
[ ] seed.sql is separate from migrations/
```

### Step 3: Check Migration Content

Run this for each migration file:

```bash
# Check if migration is idempotent
grep -E "IF (NOT )?EXISTS|CREATE.*IF NOT EXISTS|DROP.*IF EXISTS" supabase/migrations/*.sql

# Check for hardcoded UUIDs (potential conflicts)
grep -E "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}" supabase/migrations/*.sql

# Check for missing table prefixes
grep -E "CREATE TABLE [^p]" supabase/migrations/*.sql
```

**Red Flags**:
- ❌ `CREATE TABLE users` (no IF NOT EXISTS)
- ❌ `INSERT INTO ... VALUES ('fixed-uuid-here')` (conflicts)
- ❌ `DROP TABLE important_table;` (no IF EXISTS)

---

## Cleanup Process

### Phase 1: Categorize Files

Create three categories:

#### A. **Valid Migrations** (Keep)
Files that follow `NNN_description.sql` pattern and belong in migrations/

**Keep if**:
- Defines schema (tables, columns, indexes, functions)
- Has timestamp/number prefix
- Is idempotent (uses IF NOT EXISTS)

**Example**: `001_initial_schema.sql`

#### B. **Seed Data** (Move)
Files that insert test/sample data

**Move to seeds/ if**:
- Contains INSERT statements for sample data
- Named like: `sample_data.sql`, `test_users.sql`, `quick_setup.sql`
- Used only for development/testing

**Example**: `westside_sample_data.sql` → Move to `supabase/seeds/01_westside_data.sql`

#### C. **Duplicates/Backups** (Archive)
Files that are redundant or temporary

**Archive if**:
- Ends with `.skip`, `.backup`, `.old`
- Duplicate of existing migration
- One-off test script

**Example**: `schema_backup.sql` → Move to `archive/` folder

### Phase 2: File Organization

#### Create Directory Structure

```bash
# Create directories (run from project root)
mkdir -p supabase/seeds
mkdir -p supabase/archive
mkdir -p supabase/migrations
```

#### Move Files According to Category

```bash
# Example: Move seed data files
mv supabase/migrations/quick_westside.sql supabase/seeds/01_westside_district.sql
mv supabase/migrations/sample_data.sql supabase/seeds/02_sample_metrics.sql

# Example: Archive non-migration files
mv supabase/migrations/*.backup supabase/archive/
mv supabase/migrations/*.skip supabase/archive/
```

### Phase 3: Renumber Migrations

**Goal**: Ensure migrations are numbered sequentially without gaps.

#### Option A: Manual Renumbering

```bash
# List current migrations
ls -1 supabase/migrations/*.sql

# Rename to sequential numbers
mv supabase/migrations/001_initial.sql supabase/migrations/20241020_001_initial.sql
mv supabase/migrations/002_users.sql supabase/migrations/20241020_002_users.sql
# ... continue for all files
```

#### Option B: Automated Renumbering Script

```bash
# Save this as: scripts/renumber-migrations.sh
#!/bin/bash

cd supabase/migrations || exit
counter=1

for file in $(ls -1 *.sql 2>/dev/null | sort); do
  # Extract description from filename
  desc=$(echo "$file" | sed 's/^[0-9_]*//; s/\.sql$//')

  # Create new numbered name
  new_name=$(printf "%03d_%s.sql" "$counter" "$desc")

  if [ "$file" != "$new_name" ]; then
    echo "Renaming: $file -> $new_name"
    mv "$file" "$new_name"
  fi

  counter=$((counter + 1))
done

echo "✓ Migration renumbering complete!"
```

**Usage**:
```bash
chmod +x scripts/renumber-migrations.sh
./scripts/renumber-migrations.sh
```

### Phase 4: Update config.toml

Ensure seed configuration is correct:

```toml
# supabase/config.toml

[db.seed]
# If enabled, seeds the database after migrations during a db reset
enabled = true
# Specify seed files in order
sql_paths = [
  "./seeds/01_districts.sql",
  "./seeds/02_goals.sql",
  "./seeds/03_metrics.sql"
]
```

### Phase 5: Test Migrations

**Critical**: Test before pushing to production!

```bash
# 1. Stop Supabase
supabase stop

# 2. Remove old data (BE CAREFUL - local only!)
docker volume ls | grep supabase
docker volume rm <volume-name>  # Only if you want fresh start

# 3. Start fresh
supabase start

# 4. Verify all migrations applied
supabase migration list

# 5. Check tables exist
docker exec supabase_db_<project> psql -U postgres -d postgres -c "\dt public.*"

# 6. Verify seed data loaded
docker exec supabase_db_<project> psql -U postgres -d postgres -c "SELECT COUNT(*) FROM <your_table>;"
```

**Expected Output**:
```
✓ All migrations applied successfully
✓ All tables created
✓ Seed data loaded (if enabled)
✓ No errors in logs
```

---

## Best Practices

### Migration Naming Convention

**Format**: `<timestamp>_<description>.sql`

**Good Examples**:
```
20241020120000_initial_schema.sql
20241020130000_add_user_profiles.sql
20241020140000_add_notifications.sql
```

**Bad Examples**:
```
001_schema.sql                    ❌ No timestamp
add_users.sql                     ❌ No number
quick_fix.sql                     ❌ Not descriptive
20241020_final_FINAL_v3.sql       ❌ Messy naming
```

### Migration Template

Use this template for all new migrations:

```sql
-- Migration: <NNN>_<description>
-- Description: Brief explanation of what this migration does
-- Created: YYYY-MM-DD
-- Author: <optional>

-- =============================================================================
-- PART 1: Schema Changes
-- =============================================================================

-- Create tables
CREATE TABLE IF NOT EXISTS public.table_name (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_table_name_field
  ON public.table_name(field);

-- =============================================================================
-- PART 2: Enable RLS
-- =============================================================================

ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PART 3: RLS Policies
-- =============================================================================

CREATE POLICY "Policy name"
  ON public.table_name FOR SELECT
  USING (true);  -- Adjust condition

-- =============================================================================
-- PART 4: Grants
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.table_name TO authenticated;
GRANT SELECT ON public.table_name TO anon;

-- =============================================================================
-- PART 5: Verification
-- =============================================================================

-- Verify table created
SELECT
  tablename,
  schemaname
FROM pg_tables
WHERE tablename = 'table_name';

-- Success message
SELECT 'Migration NNN completed successfully!' as status;
```

### Idempotency Patterns

**Always use**:
- `CREATE TABLE IF NOT EXISTS`
- `CREATE INDEX IF NOT EXISTS`
- `DROP TABLE IF EXISTS` (for down migrations)
- `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` (Postgres 9.6+)

**Safe modification pattern**:
```sql
-- Add column safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
  END IF;
END $$;
```

### Seed Data vs Migrations

**Decision Tree**:

```
Is this adding/modifying database STRUCTURE?
├─ YES → Put in migrations/
│   Examples: CREATE TABLE, ADD COLUMN, CREATE INDEX
│
└─ NO → Is this adding DATA?
    ├─ Production data → Add via application, not migrations
    ├─ Reference data (always needed) → migrations/ (carefully!)
    └─ Test/sample data → seeds/
```

**Reference Data Example** (in migrations):
```sql
-- OK in migrations: Always needed
INSERT INTO public.user_roles (id, name) VALUES
  ('admin', 'Administrator'),
  ('editor', 'Editor'),
  ('viewer', 'Viewer')
ON CONFLICT (id) DO NOTHING;
```

**Sample Data Example** (in seeds):
```sql
-- In seeds only: Development/testing
INSERT INTO public.users (email, name) VALUES
  ('test@example.com', 'Test User'),
  ('admin@example.com', 'Admin User');
```

---

## Preparing for Supabase Branching

### Prerequisites Checklist

Before enabling Supabase branching, ensure:

```
BRANCHING READINESS CHECKLIST
==============================

Migration Hygiene:
[ ] All migrations numbered sequentially
[ ] No gaps in migration numbers
[ ] All files follow naming convention
[ ] No .skip or test files in migrations/
[ ] All migrations are idempotent

Seed Data:
[ ] seed.sql exists and works
[ ] Seeds are separated from migrations
[ ] Seeds are in correct order in config.toml
[ ] Seeds can run multiple times safely

Project Setup:
[ ] supabase link completed (linked to production)
[ ] .env.local configured correctly
[ ] config.toml has [db.seed] configured
[ ] GitHub repo exists and connected

Testing:
[ ] `supabase db reset` works without errors
[ ] All tables created correctly
[ ] All indexes present
[ ] RLS policies active
[ ] Seed data loads properly
```

### Link to Production

```bash
# Link local project to Supabase project
supabase link --project-ref your-project-ref

# Verify link
supabase projects list

# Test connection
supabase db remote inspect
```

### GitHub Integration Setup

1. **In Supabase Dashboard**:
   - Go to Project Settings → Integrations
   - Connect to GitHub
   - Select repository
   - Configure branch matching rules

2. **Enable Preview Branches**:
   - Requires Pro plan or higher
   - Set branch matching pattern (e.g., `feature/*`)
   - Configure auto-deletion after PR merge

3. **Add GitHub Actions Workflow**:

Create `.github/workflows/supabase-migrations.yml`:

```yaml
name: Supabase Migrations

on:
  pull_request:
    paths:
      - 'supabase/migrations/**'
  push:
    branches:
      - main

jobs:
  lint-migrations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1

      - name: Lint migrations
        run: supabase db lint

      - name: Check migration naming
        run: |
          cd supabase/migrations
          for file in *.sql; do
            if [[ ! "$file" =~ ^[0-9]{14,}_.*\.sql$ ]]; then
              echo "❌ Invalid migration name: $file"
              exit 1
            fi
          done
          echo "✅ All migration names valid"
```

---

## Troubleshooting

### Issue: Migration 019 Fails

**Error**: `column "frequency" of relation "spb_metrics" already exists`

**Cause**: Migration tries to rename column that doesn't exist

**Fix**:
```sql
-- Before (fails):
ALTER TABLE spb_metrics RENAME COLUMN collection_frequency TO frequency;

-- After (safe):
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'spb_metrics' AND column_name = 'collection_frequency'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'spb_metrics' AND column_name = 'frequency'
  ) THEN
    ALTER TABLE spb_metrics RENAME COLUMN collection_frequency TO frequency;
  END IF;
END $$;
```

### Issue: Gaps in Migration Numbers

**Error**: Migrations 001, 002, 004, 006 (missing 003, 005)

**Impact**: Not critical but confusing for debugging

**Fix**: Renumber all migrations sequentially
```bash
# Use renumbering script from Phase 3
./scripts/renumber-migrations.sh
```

### Issue: Non-Timestamped Files Ignored

**Error**: Files like `quick_setup.sql` not running

**Cause**: Supabase CLI requires specific naming

**Fix**: Rename or move to seeds
```bash
# Option 1: Rename to valid migration
mv supabase/migrations/quick_setup.sql supabase/migrations/020_quick_setup.sql

# Option 2: Move to seeds (if it's sample data)
mv supabase/migrations/quick_setup.sql supabase/seeds/01_quick_setup.sql
```

### Issue: Constraint Violation After Migration

**Error**: `new row violates check constraint "table_status_check"`

**Cause**: Migration inserted data with invalid enum value

**Example**:
```sql
-- Migration added:
status VARCHAR CHECK (status IN ('active', 'inactive'))

-- But seed data has:
INSERT INTO users (status) VALUES ('pending');  -- ❌ Not in enum
```

**Fix**:
```sql
-- Update constraint in migration:
status VARCHAR CHECK (status IN ('active', 'inactive', 'pending'))

-- Or fix seed data:
INSERT INTO users (status) VALUES ('active');  -- ✅ Valid
```

### Issue: Production Out of Sync

**Error**: Local works, production fails

**Diagnosis**:
```bash
# 1. Check what's in production
supabase db remote inspect

# 2. Compare schemas
supabase db diff --linked

# 3. See missing migrations
supabase migration list --remote
```

**Fix**:
```bash
# Push missing migrations carefully
supabase db push

# If that fails, review diff first
supabase db diff --linked > schema_diff.sql
# Review schema_diff.sql manually
```

---

## For Claude Code / AI Assistants

### Prompts for Migration Cleanup

Use these prompts with Claude Code or other AI coding assistants:

#### 1. Audit Existing Migrations
```
Audit all SQL files in supabase/migrations/ and provide:
1. List of files that don't follow NNN_description.sql pattern
2. List of gaps in numbering sequence
3. Files that contain sample data (should be seeds)
4. Files with .skip or .backup extensions
5. Summary of issues found
```

#### 2. Categorize Files
```
Analyze each .sql file in supabase/migrations/ and categorize as:
- MIGRATION: Schema definition (keep in migrations/)
- SEED: Sample/test data (move to seeds/)
- ARCHIVE: Backup/duplicate (move to archive/)

For each file, explain your reasoning.
```

#### 3. Generate Cleanup Plan
```
Based on the migration audit, create a step-by-step cleanup plan:
1. Files to move to seeds/
2. Files to archive
3. Migrations to renumber
4. Migrations that need fixing (not idempotent)
5. Shell commands to execute the cleanup
```

#### 4. Verify Cleanup
```
After cleanup, verify:
1. All migrations numbered sequentially
2. All migrations use IF NOT EXISTS patterns
3. seed.sql loads without errors
4. `supabase db reset` completes successfully
5. Report any remaining issues
```

### Expected Assistant Output Format

```markdown
## Migration Audit Report

### Issues Found
1. **Non-Standard Names** (3 files):
   - quick_westside.sql
   - sample_data.sql
   - test_setup.sql

2. **Numbering Gaps**:
   - Missing: 003, 010

3. **Non-Idempotent Migrations** (2 files):
   - 007_metric_calculations.sql (line 45: CREATE TABLE without IF NOT EXISTS)
   - 012_add_progress.sql (line 23: ALTER TABLE without check)

### Recommended Actions
[Specific commands and fixes here]
```

### Automated Checks

Create a validation script AI assistants can reference:

```bash
#!/bin/bash
# scripts/validate-migrations.sh

echo "🔍 Validating Supabase Migrations..."

errors=0

# Check 1: Migration naming
echo ""
echo "📋 Checking migration file names..."
cd supabase/migrations || exit 1

for file in *.sql; do
  if [[ ! "$file" =~ ^[0-9]{3,}_.*\.sql$ ]] && [[ "$file" != "seed.sql" ]]; then
    echo "❌ Invalid name: $file"
    ((errors++))
  fi
done

# Check 2: Sequential numbering
echo ""
echo "📋 Checking sequential numbering..."
last_num=0
for file in $(ls -1 *.sql 2>/dev/null | grep -E '^[0-9]{3}' | sort); do
  num=$(echo "$file" | grep -oE '^[0-9]+')
  expected=$((last_num + 1))

  if [ "$num" -ne "$expected" ]; then
    echo "❌ Gap detected: expected $expected, found $num ($file)"
    ((errors++))
  fi

  last_num=$num
done

# Check 3: Idempotency
echo ""
echo "📋 Checking idempotency..."
for file in *.sql; do
  if grep -q "CREATE TABLE" "$file" && ! grep -q "IF NOT EXISTS" "$file"; then
    echo "⚠️  Non-idempotent CREATE TABLE in: $file"
    ((errors++))
  fi
done

# Results
echo ""
if [ $errors -eq 0 ]; then
  echo "✅ All validation checks passed!"
  exit 0
else
  echo "❌ Found $errors issue(s). Please review and fix."
  exit 1
fi
```

Usage:
```bash
chmod +x scripts/validate-migrations.sh
./scripts/validate-migrations.sh
```

---

## Summary Checklist

### Quick Reference: Is My Project Ready?

```
FINAL CHECKLIST
================

Organization:
[ ] migrations/ contains only NNN_description.sql files
[ ] seeds/ contains test data files (if needed)
[ ] archive/ contains old/backup files
[ ] No .skip or .backup files in migrations/

Naming:
[ ] All migrations follow NNN_description.sql format
[ ] Numbers are sequential (no gaps)
[ ] Descriptions are clear and descriptive

Content:
[ ] All migrations use IF NOT EXISTS patterns
[ ] No hardcoded UUIDs in migrations
[ ] RLS policies defined for all tables
[ ] Indexes created on foreign keys

Testing:
[ ] `supabase db reset` works without errors
[ ] seed.sql loads successfully
[ ] All tables created
[ ] No constraint violations

Production Ready:
[ ] Linked to production with `supabase link`
[ ] Tested migration push with `supabase db push --dry-run`
[ ] GitHub Actions workflow added (optional)
[ ] Team aware of new migration process
```

---

## Next Steps

After cleanup:

1. **Document Migration Process**: Update team docs with new workflow
2. **Set Up CI/CD**: Add GitHub Actions to validate migrations
3. **Consider Branching**: Evaluate Supabase branching (Pro plan required)
4. **Regular Audits**: Run validation monthly

**Questions?** Check Supabase docs: https://supabase.com/docs/guides/cli

---

## Real-World Case Study: Production Hotfix

### Scenario: Strategic Plan Builder (Oct 2025)

**Problem**: Metric builder failing to save in production with schema errors

**Discovery Process**:
1. **Initial Error**: `Could not find the 'frequency' column in schema cache`
2. **Ran validation**: `./scripts/validate-migrations.sh`
3. **Found**: 6 naming errors, 2 gaps, 9 misplaced files
4. **Checked production**: Only migration 001 applied (missing 002-016!)

**Root Causes**:
- Production database never had migrations 002-016 applied
- Code expected columns from later migrations
- Incorrect constraints in production
- Existing data had invalid values

**Resolution Steps**:

**Step 1: Migration Cleanup (Local)**
```bash
# Created directories
mkdir -p supabase/seeds supabase/archive

# Archived non-migration files
mv supabase/migrations/*.backup supabase/archive/
mv supabase/migrations/*.skip supabase/archive/

# Moved seed data
mv supabase/migrations/quick_westside.sql supabase/seeds/01_westside_district.sql
# ... (5 more seed files)

# Renumbered to fill gaps
mv 004_enhance_metrics.sql 003_enhance_metrics.sql
# ... (filled all gaps to get 001-016 sequential)

# Validated
./scripts/validate-migrations.sh  # ✅ All checks passed
```

**Step 2: Applied to Production**
```bash
# Linked to production
supabase link --project-ref scpluslhcastrobigkfb

# Checked current state
supabase migration list --linked  # Showed only 001 in remote

# Pushed migrations (fixed issues as they appeared)
supabase db push --linked

# Fixed migration issues:
# - 002: Added safe district_id column handling
# - 003: Drop view before recreating
# - 010: Disabled auto-calculation
# - 016: Drop existing policies first
```

**Step 3: Constraint Normalization**
```sql
-- Temporary migration to fix production data
-- 1. Drop incorrect constraint
ALTER TABLE spb_metrics DROP CONSTRAINT spb_metrics_visualization_type_check;

-- 2. Update all existing metrics
UPDATE spb_metrics
SET visualization_type = CASE
  WHEN visualization_type = 'percentage' THEN 'progress'
  WHEN visualization_type LIKE '%chart%' THEN 'bar'
  ELSE 'auto'
END;

-- 3. Add correct constraint
ALTER TABLE spb_metrics
ADD CONSTRAINT spb_metrics_visualization_type_check
CHECK (visualization_type IN ('auto', 'line', 'bar', 'gauge', 'donut',
  'timeline', 'blog', 'number', 'progress'));

-- 4. Reload schema
NOTIFY pgrst, 'reload schema';
```

**Results**:
- ✅ All 16 migrations in production
- ✅ Metric builder working perfectly
- ✅ Schema synchronized local ↔ production
- ✅ Validation tools prevent future issues

**Time Investment**:
- Problem identification: 15 minutes
- Migration cleanup: 45 minutes
- Production application: 60 minutes
- Constraint fixes: 30 minutes
- Documentation: 30 minutes
**Total**: ~3 hours

**Value Created**:
- ✅ Production issue resolved
- ✅ Universal cleanup guide (reusable)
- ✅ Automated validation tooling
- ✅ Clean migration base for future
- ✅ Prepared for Supabase branching

### Key Takeaways

**What We Learned**:
1. **Always check production state first** - Don't assume migrations are applied
2. **Validate locally before pushing** - Use validation scripts
3. **Production data can have invalid values** - Normalize before adding constraints
4. **Schema cache must be reloaded** - Use `NOTIFY pgrst, 'reload schema'`
5. **Clean migrations save hours** - Worth the upfront investment

**Commands That Saved Us**:
```bash
# Check production migration status
supabase migration list --linked

# Validate migrations before deploying
./scripts/validate-migrations.sh

# Apply migrations to production
supabase db push --linked

# Reload schema cache (in SQL Editor)
NOTIFY pgrst, 'reload schema';
```

**Prevention Going Forward**:
- Run `./scripts/validate-migrations.sh` before every deployment
- Check `supabase migration list --linked` before assuming schema state
- Use `supabase db push --dry-run` to preview changes
- Keep STATUS.md updated with production migration status

---

**Last Updated**: 2025-10-20
**Version**: 1.1 (Added case study from production hotfix)
**License**: MIT (copy to any project)
