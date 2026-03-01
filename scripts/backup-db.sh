#!/usr/bin/env bash
set -e

# Usage: bash scripts/backup-db.sh [output-dir]
# Default output dir: ~/backups/stratadash
#
# Requires:
#   - DATABASE_URL_PROD env var (production Neon connection string)
#   - pg_dump installed locally (brew install postgresql@16)
#
# Example:
#   DATABASE_URL_PROD=<prod-url> bash scripts/backup-db.sh
#   DATABASE_URL_PROD=<prod-url> bash scripts/backup-db.sh /Volumes/NAS/stratadash-backups

PROD_URL="${DATABASE_URL_PROD:?Set DATABASE_URL_PROD to the production connection string}"
OUTPUT_DIR="${1:-$HOME/backups/stratadash}"
FILENAME="backup-$(date +%Y%m%d-%H%M%S).dump"

mkdir -p "$OUTPUT_DIR"

echo "→ Dumping production database..."
pg_dump "$PROD_URL" --format=custom --no-acl --no-owner -f "$OUTPUT_DIR/$FILENAME"

echo "✓ Saved to: $OUTPUT_DIR/$FILENAME"
echo ""
echo "To verify: pg_restore --list $OUTPUT_DIR/$FILENAME | head -20"

# Clean up backups older than 30 days
DELETED=$(find "$OUTPUT_DIR" -name "backup-*.dump" -mtime +30 -print -delete | wc -l | tr -d ' ')
if [ "$DELETED" -gt 0 ]; then
  echo "♻ Cleaned up $DELETED backup(s) older than 30 days"
fi
