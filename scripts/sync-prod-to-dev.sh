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
DUMP_FILE="/tmp/prod-backup-$(date +%Y%m%d-%H%M%S).dump"

echo "→ Dumping production database..."
pg_dump "$PROD_URL" --format=custom --no-acl --no-owner -f "$DUMP_FILE"

echo "→ Restoring to dev branch (this will overwrite dev data)..."
pg_restore --dbname "$DEV_URL" --format=custom --no-acl --no-owner --clean --if-exists "$DUMP_FILE"

echo "→ Cleaning up dump file..."
rm "$DUMP_FILE"

echo "✓ Done. Dev branch now has production data."
echo "  Reminder: this is real user data. Treat it with care."
