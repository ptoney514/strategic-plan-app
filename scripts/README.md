# Migration Management Scripts

Utility scripts for managing Supabase migrations.

## Available Scripts

### 1. validate-migrations.sh

**Purpose**: Audits migration files for common issues

**Usage**:
```bash
./scripts/validate-migrations.sh
```

**What it checks**:
- ✅ Migration file naming (NNN_description.sql format)
- ✅ Sequential numbering (no gaps)
- ✅ Idempotency (IF NOT EXISTS patterns)
- ✅ Non-migration files in migrations/ directory
- ✅ Seed file configuration

**Example Output**:
```
🔍 Validating Supabase Migrations...

📋 Check 1: Migration file naming...
❌ Invalid name: quick_setup.sql
   Expected format: NNN_description.sql

📋 Check 2: Sequential numbering...
⚠️  Gap detected: expected 3, found 4

Summary:
❌ Errors: 6
⚠️  Warnings: 2
```

---

### 2. renumber-migrations.sh

**Purpose**: Renumbers all migrations sequentially

**⚠️ WARNING**: This renames files! Commit your changes first.

**Usage**:
```bash
./scripts/renumber-migrations.sh
```

**What it does**:
1. Scans all .sql files in migrations/
2. Extracts descriptions from filenames
3. Renumbers sequentially (001, 002, 003...)
4. Uses temporary directory to avoid conflicts

**Example**:
```
Before:
  001_initial.sql
  004_users.sql
  010_profiles.sql

After:
  001_initial.sql
  002_users.sql
  003_profiles.sql
```

---

## Workflow

### Initial Migration Cleanup

```bash
# 1. Run validation to see issues
./scripts/validate-migrations.sh

# 2. Manually move seed files
mv supabase/migrations/sample_data.sql supabase/seeds/01_sample_data.sql

# 3. Archive non-migration files
mkdir -p supabase/archive
mv supabase/migrations/*.backup supabase/archive/
mv supabase/migrations/*.skip supabase/archive/

# 4. Renumber remaining migrations
./scripts/renumber-migrations.sh

# 5. Validate again
./scripts/validate-migrations.sh

# 6. Test
supabase db reset
```

### Regular Maintenance

```bash
# Before creating PR
./scripts/validate-migrations.sh

# Should see:
# ✅ All validation checks passed!
```

---

## Integration with CI/CD

Add to `.github/workflows/validate-migrations.yml`:

```yaml
name: Validate Migrations

on:
  pull_request:
    paths:
      - 'supabase/migrations/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate migrations
        run: ./scripts/validate-migrations.sh
```

---

## Troubleshooting

### Script Not Executable

```bash
chmod +x scripts/validate-migrations.sh
chmod +x scripts/renumber-migrations.sh
```

### Permission Denied

```bash
# Run from project root
cd /path/to/project
./scripts/validate-migrations.sh
```

### Unexpected Results

```bash
# Enable debug mode
bash -x scripts/validate-migrations.sh
```

---

## Related Documentation

- Main Guide: [`docs/SUPABASE_MIGRATION_CLEANUP_GUIDE.md`](../docs/SUPABASE_MIGRATION_CLEANUP_GUIDE.md)
- Workflow: [`SUPABASE_WORKFLOW.md`](../SUPABASE_WORKFLOW.md)
