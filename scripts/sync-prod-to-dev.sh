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

# Extract the Neon endpoint ID from a connection string.
# Neon hostnames are like ep-cool-darkness-123456.us-east-1.aws.neon.tech
# or ep-cool-darkness-123456-pooler.us-east-1.aws.neon.tech.
# We extract the ep-* slug and strip the "-pooler" suffix so both direct
# and pooler URLs for the same branch produce the same identifier.
neon_endpoint() {
  echo "$1" | sed -E 's|^.*@||; s|[:/].*||; s|-pooler||'
}

PROD_EP=$(neon_endpoint "$PROD_URL")
DEV_EP=$(neon_endpoint "$DEV_URL")

# Guard: ensure DEV_URL endpoint is different from PROD_URL endpoint
if [ "$DEV_EP" = "$PROD_EP" ]; then
  echo "🛑 ABORT: DATABASE_URL resolves to the same Neon endpoint as DATABASE_URL_PROD ($PROD_EP)."
  echo "   This would restore production data back onto itself with --clean."
  echo "   Set DATABASE_URL to a Neon dev branch and try again."
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
