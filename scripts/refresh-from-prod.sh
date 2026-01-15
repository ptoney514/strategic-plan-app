#!/bin/bash
# refresh-from-prod.sh
# Refreshes local Supabase database with anonymized production data
#
# Prerequisites:
#   - Docker running with local Supabase (npm run db:start)
#   - Supabase CLI linked to production project (supabase link --project-ref <ref>)
#
# Usage:
#   ./scripts/refresh-from-prod.sh
#
# This script will:
#   1. Dump production database (data only)
#   2. Reset local database (applies all migrations)
#   3. Restore production data to local
#   4. Anonymize sensitive data (emails, passwords)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_FILE="/tmp/prod_backup_$(date +%Y%m%d_%H%M%S).sql"
LOCAL_DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

echo -e "${YELLOW}=== Refreshing local DB from production ===${NC}"
echo ""

# Check if local Supabase is running
if ! docker ps | grep -q "supabase"; then
    echo -e "${RED}Error: Local Supabase is not running.${NC}"
    echo "Please start it with: npm run db:start"
    exit 1
fi

# Check if supabase CLI is linked
if ! supabase status --linked 2>/dev/null | grep -q "Project ref"; then
    echo -e "${YELLOW}Warning: Supabase CLI may not be linked to production.${NC}"
    echo "If this fails, run: supabase link --project-ref <your-project-ref>"
    echo ""
fi

# Step 1: Dump production database
echo -e "${GREEN}Step 1/4: Dumping production database...${NC}"
supabase db dump -f "$BACKUP_FILE" --data-only
echo "  Backup saved to: $BACKUP_FILE"
echo ""

# Step 2: Reset local database (applies migrations)
echo -e "${GREEN}Step 2/4: Resetting local database (applying migrations)...${NC}"
npm run db:reset --silent
echo ""

# Step 3: Restore production data
echo -e "${GREEN}Step 3/4: Restoring production data to local...${NC}"
psql "$LOCAL_DB_URL" < "$BACKUP_FILE" 2>/dev/null || {
    echo -e "${YELLOW}Note: Some errors during restore are normal (duplicate keys, etc.)${NC}"
}
echo ""

# Step 4: Anonymize sensitive data
echo -e "${GREEN}Step 4/4: Anonymizing sensitive data...${NC}"
psql "$LOCAL_DB_URL" << 'EOF'
-- Anonymize auth.users table
UPDATE auth.users SET
  email = 'user_' || SUBSTRING(id::text, 1, 8) || '@test.local',
  encrypted_password = crypt('testpassword123', gen_salt('bf')),
  raw_user_meta_data = '{}',
  raw_app_meta_data = jsonb_set(COALESCE(raw_app_meta_data, '{}'), '{provider}', '"email"')
WHERE email IS NOT NULL;

-- Anonymize any PII in spb_districts if contact_email exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'spb_districts'
    AND column_name = 'contact_email'
  ) THEN
    EXECUTE 'UPDATE spb_districts SET contact_email = ''contact_'' || id || ''@test.local'' WHERE contact_email IS NOT NULL';
  END IF;
END $$;

-- Report anonymization stats
SELECT 'Anonymized ' || COUNT(*) || ' user records' AS result FROM auth.users;
EOF

echo ""
echo -e "${GREEN}=== Done! Local DB now mirrors production (anonymized) ===${NC}"
echo ""
echo "Local credentials:"
echo "  - All users can now login with password: testpassword123"
echo "  - Email format: user_XXXXXXXX@test.local"
echo ""
echo "To verify, open Supabase Studio: http://localhost:54323"

# Cleanup old backups (keep last 5)
echo ""
echo -e "${YELLOW}Cleaning up old backups...${NC}"
ls -t /tmp/prod_backup_*.sql 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
echo "Done."
