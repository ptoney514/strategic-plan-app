# Database Migrations

This directory contains all Supabase database migrations for the Strategic Plan Builder.

## Naming Convention

Migrations use sequential numbering: `NNN_description.sql`

- `001_initial_schema.sql`
- `002_add_metric_time_series.sql`
- etc.

## Migration Naming Change (January 2025)

**Important for existing development environments:**

Migrations were renamed from timestamp-based naming to sequential naming:

| Old Name                                | New Name                     |
| --------------------------------------- | ---------------------------- |
| `20251023020000_fix_goal_numbering.sql` | `020_fix_goal_numbering.sql` |
| `20251024000000_add_goal_color.sql`     | `021_add_goal_color.sql`     |

### Why This Matters

Supabase tracks applied migrations by filename in the `supabase_migrations.schema_migrations` table. If your environment applied migrations under the old filenames, the database won't recognize the renamed files as already applied.

### Upgrade Path for Existing Environments

**Local Development (Recommended):**

```bash
npm run db:reset
```

This resets the database and applies all migrations fresh with the new naming.

**Production Environments:**

If you have a production environment that applied migrations with the old timestamp-based names, you have two options:

1. **Full Reset** (if data loss is acceptable):

   ```bash
   supabase db reset --linked
   ```

2. **Manual Migration Table Repair** (to preserve data):

   ```sql
   -- Update the migration names in the tracking table
   UPDATE supabase_migrations.schema_migrations
   SET name = '020_fix_goal_numbering'
   WHERE name = '20251023020000_fix_goal_numbering';

   UPDATE supabase_migrations.schema_migrations
   SET name = '021_add_goal_color'
   WHERE name = '20251024000000_add_goal_color';
   ```

   Run this in the Supabase SQL Editor before deploying new migrations.

## Creating New Migrations

See [CLAUDE.md](../../CLAUDE.md) for the full migration workflow. Quick reference:

1. Make schema changes in Supabase Studio
2. Generate migration: `supabase db diff -f descriptive_name`
3. Review the generated SQL
4. Test locally: `npm run db:reset`
5. Commit and push

## Testing Migrations

```bash
npm run db:test          # Full migration test suite
npm run db:reset         # Reset and apply all migrations
./scripts/test-migrations.sh  # Run smoke tests
```
