# Supabase CLI Workflow Guide

**Project**: strategic-plan-vite
**Last Updated**: 2025-09-30

---

## 🎯 Quick Reference

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# View status and connection info
supabase status

# Open Supabase Studio in browser
open http://127.0.0.1:54323

# Reset database to current migrations
supabase db reset

# Create a new migration
supabase migration new <migration_name>

# Apply migrations
supabase db push

# Dump current schema
supabase db dump --local -f supabase/migrations/schema.sql
```

---

## 📁 Directory Structure

```
strategic-plan-vite/
├── supabase/
│   ├── config.toml              # Supabase configuration
│   ├── migrations/              # All SQL migrations (timestamped)
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_metric_time_series.sql
│   │   └── ...
│   ├── seed.sql                 # Optional seed data
│   └── functions/               # Edge functions (if needed)
├── migrations/                  # LEGACY - kept for reference
└── .env.local                   # Environment variables
```

---

## 🚀 Setup (Already Done)

✅ Supabase CLI installed
✅ `supabase init` run
✅ Migrations copied to `supabase/migrations/`
✅ Local instance running
✅ All migrations applied

---

## 📝 Common Workflows

### 1. Starting a Development Session

```bash
# Start local Supabase (if not running)
supabase start

# Start dev server
npm run dev

# Open Studio to view database
open http://127.0.0.1:54323
```

### 2. Creating a New Migration

**Option A: Using CLI (Recommended)**
```bash
# Create a new empty migration file
supabase migration new add_user_profiles

# Edit the generated file in supabase/migrations/
# Example: supabase/migrations/20250930123456_add_user_profiles.sql
```

**Option B: Manual Creation**
```bash
# Create file with timestamp
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_description.sql

# Write your SQL in the file
```

**Migration Template**:
```sql
-- Description: Add user profiles table
-- Created: 2025-09-30

-- Create table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id
  ON public.user_profiles(user_id);

-- Add RLS policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.user_profiles TO anon, authenticated;

-- Success message
SELECT 'User profiles table created successfully!' as message;
```

### 3. Applying Migrations

```bash
# Apply all new migrations to local database
supabase db reset

# Or manually apply a specific migration
cat supabase/migrations/20250930_new_migration.sql | \
  docker exec -i supabase_db_strategic-plan-vite \
  psql -U postgres -d postgres
```

### 4. Checking Database State

```bash
# List all tables
docker exec supabase_db_strategic-plan-vite \
  psql -U postgres -d postgres -c "\dt public.spb_*"

# Describe a specific table
docker exec supabase_db_strategic-plan-vite \
  psql -U postgres -d postgres -c "\d public.spb_goals"

# Run a query
docker exec supabase_db_strategic-plan-vite \
  psql -U postgres -d postgres -c "SELECT COUNT(*) FROM spb_goals;"
```

### 5. Resetting Database

**⚠️ Warning: This will delete all data!**

```bash
# Reset to migrations (loses all data not in migrations)
supabase db reset

# Reset and reload with seed data
supabase db reset --with-seed
```

### 6. Syncing with Production

**Push local migrations to production:**
```bash
# Link to production project
supabase link --project-ref <your-project-ref>

# Push migrations
supabase db push

# Or push specific migration
supabase db push <migration-file>
```

**Pull production schema:**
```bash
# Dump production schema
supabase db pull

# This creates a new migration file with production schema
```

---

## 🔧 Current Database Status

### Existing Tables
- `spb_districts` - District/organization data
- `spb_goals` - Hierarchical goals (objectives, goals, actions)
- `spb_metrics` - Performance metrics
- `spb_metric_time_series` - Historical metric values
- `spb_metric_values` - Metric value tracking
- `spb_status_overrides` - Manual status override history
- `spb_stock_photos` - Cover photo library

### Key Features Implemented
- ✅ Hierarchical goal structure (3 levels)
- ✅ Status override system with audit trail
- ✅ Cover photo support
- ✅ Metric time series tracking
- ✅ Row Level Security policies

### Sample Data
- ✅ Lincoln Public Schools district
- ✅ Westside Community Schools district (with 10 goals)

---

## 🐛 Troubleshooting

### Issue: Port Already in Use
```bash
# Stop the current project
supabase stop

# Or stop specific project
supabase stop --project-id <project-id>

# Then restart
supabase start
```

### Issue: Migrations Out of Sync
```bash
# Reset database completely
supabase db reset

# If that fails, stop and remove containers
supabase stop --no-backup
docker volume ls | grep strategic-plan-vite
docker volume rm <volume-name>
supabase start
```

### Issue: Connection Refused
```bash
# Check if containers are running
docker ps | grep supabase

# Check logs
docker logs supabase_db_strategic-plan-vite

# Restart Supabase
supabase stop && supabase start
```

### Issue: Migration Fails
```bash
# Check migration syntax
cat supabase/migrations/<migration-file>.sql

# Test migration manually
docker exec -i supabase_db_strategic-plan-vite \
  psql -U postgres -d postgres < supabase/migrations/<migration-file>.sql

# Check error logs
docker logs supabase_db_strategic-plan-vite | tail -50
```

---

## 📊 Environment Variables

### Development (`.env.local`)
```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<from-supabase-start>
```

### Production (Vercel/Netlify)
```bash
VITE_SUPABASE_URL=https://scpluslhcastrobigkfb.supabase.co
VITE_SUPABASE_ANON_KEY=<production-anon-key>
```

---

## 🔐 Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use RLS policies** - Enable on all tables
3. **Validate input** - Always validate on server side
4. **Use service role key carefully** - Only for admin operations, never expose to client
5. **Review policies** - Regularly audit RLS policies

---

## 📈 Performance Tips

1. **Add indexes** - For frequently queried columns
2. **Use materialized views** - For complex aggregations
3. **Enable PostgREST caching** - For read-heavy operations
4. **Optimize queries** - Use `EXPLAIN ANALYZE`
5. **Monitor logs** - Check slow queries in Studio

---

## 🔄 Migration Naming Convention

Use descriptive names with timestamps:

```
YYYYMMDDHHMMSS_description.sql

Examples:
20250930120000_add_user_profiles.sql
20250930130000_add_notification_system.sql
20250930140000_update_goals_add_priority.sql
```

---

## 📚 Useful Commands

### Database Inspection
```bash
# List all schemas
\dn

# List all tables in public schema
\dt public.*

# Describe table structure
\d public.spb_goals

# Show table size
SELECT pg_size_pretty(pg_total_relation_size('public.spb_goals'));

# Show all indexes
\di public.*

# Show all functions
\df public.*
```

### Data Operations
```bash
# Export data to CSV
\copy (SELECT * FROM spb_goals) TO '/tmp/goals.csv' CSV HEADER

# Import data from CSV
\copy spb_goals FROM '/tmp/goals.csv' CSV HEADER

# Backup database
pg_dump -U postgres -d postgres > backup.sql

# Restore database
psql -U postgres -d postgres < backup.sql
```

---

## 🎓 Learning Resources

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Database Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## ✅ Next Steps for Admin Feature Development

Now that the database and migration workflow are set up:

1. **Create service layer files**:
   - `src/lib/services/goalService.ts`
   - `src/lib/services/metricService.ts`
   - `src/lib/services/auditService.ts`

2. **Connect admin UI to database**:
   - StatusManager save functionality
   - BulkDataEntry save functionality
   - Form validation and error handling

3. **Test complete data flow**:
   - Create test cases
   - Verify RLS policies work correctly
   - Check audit trail captures all changes

---

**Status**: ✅ Workflow Setup Complete
**Ready For**: Service layer development and admin feature connection
