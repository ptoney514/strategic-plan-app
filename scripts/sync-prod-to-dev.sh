#!/usr/bin/env bash
set -e

echo "⚠️  WARNING: This will overwrite your dev branch with REAL production data."
echo "   Production data contains real user emails and admin names (PII)."
echo "   The dump file is created at /tmp/prod-backup.dump and deleted after restore."
echo "   Do NOT share or commit this file."
echo ""
read -p "Continue? (y/N): " confirm
[[ $confirm == [yY] ]] || exit 0

PROD_URL="${DATABASE_URL_PROD:?Set DATABASE_URL_PROD env var to the production connection string}"
DEV_URL="${DATABASE_URL:?Set DATABASE_URL in .env.local to the dev branch connection string}"

# Guard: ensure DEV_URL is not the same as PROD_URL
if [ "$DEV_URL" = "$PROD_URL" ]; then
  echo "🛑 ABORT: DATABASE_URL and DATABASE_URL_PROD are identical."
  echo "   This would restore production data back onto itself with --clean."
  echo "   Set DATABASE_URL to a Neon dev branch and try again."
  exit 1
fi

# Guard: ensure DEV_URL doesn't point to the production endpoint
PROD_ENDPOINT="${NEON_PRODUCTION_ENDPOINT:-}"
if [ -n "$PROD_ENDPOINT" ] && echo "$DEV_URL" | grep -q "$PROD_ENDPOINT"; then
  echo "🛑 ABORT: DATABASE_URL contains the production endpoint ($PROD_ENDPOINT)."
  echo "   This script should only restore to a dev branch."
  exit 1
fi
DUMP_FILE="/tmp/prod-backup-$(date +%Y%m%d-%H%M%S).dump"

echo "→ Dumping production database..."
pg_dump "$PROD_URL" --format=custom --no-acl --no-owner -f "$DUMP_FILE"

echo "→ Restoring to dev branch (this will overwrite dev data)..."
pg_restore --dbname "$DEV_URL" --format=custom --no-acl --no-owner --clean --if-exists "$DUMP_FILE"

echo "→ Cleaning up dump file..."
rm "$DUMP_FILE"

echo "✓ Done. Dev branch now has production data."
echo "  Reminder: this is real user data. Treat it with care."
