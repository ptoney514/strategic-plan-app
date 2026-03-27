#!/bin/bash
#
# Local Database Backup Script
#
# Creates a timestamped pg_dump of the production database.
# Retries up to 3 times on transient failures (DNS, timeout).
# Outputs [SUCCESS] or [FAILED] markers for automated monitoring.
#
# Usage:
#   DATABASE_URL_PROD=<prod-url> bash scripts/backup-db.sh [output-dir]
#
# Default output dir: ~/backups/stratadash
#
# Prerequisites:
#   - PostgreSQL client (pg_dump): brew install postgresql@16
#   - DATABASE_URL_PROD env var (production Neon connection string)

set -euo pipefail

PROD_URL="${DATABASE_URL_PROD:?Set DATABASE_URL_PROD to the production connection string}"
OUTPUT_DIR="${1:-$HOME/backups/stratadash}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
FILENAME="backup-${TIMESTAMP}.dump"
FILEPATH=""

# On exit: if non-zero, delete any partial dump file and print [FAILED]
cleanup() {
  local exit_code=$?
  if [ $exit_code -ne 0 ]; then
    if [ -n "$FILEPATH" ] && [ -f "$FILEPATH" ]; then
      rm -f "$FILEPATH"
    fi
    echo ""
    echo "[FAILED] $(date) — backup failed (exit $exit_code). No dump file saved."
  fi
}
trap cleanup EXIT

# Create backup directory
mkdir -p "$OUTPUT_DIR"

FILEPATH="$OUTPUT_DIR/$FILENAME"

echo "Dumping production database..."
echo "Output: $FILEPATH"
echo ""

# Run pg_dump with retries (handles transient DNS/timeout failures)
MAX_ATTEMPTS=3
RETRY_DELAY=30
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  if [ $ATTEMPT -gt 1 ]; then
    echo "Retrying in ${RETRY_DELAY}s... (attempt $ATTEMPT of $MAX_ATTEMPTS)"
    sleep $RETRY_DELAY
  fi

  pg_dump_exit=0
  pg_dump "$PROD_URL" \
    --format=custom \
    --no-owner \
    --no-acl \
    --verbose \
    -f "$FILEPATH" 2>&1 || pg_dump_exit=$?

  if [ $pg_dump_exit -eq 0 ] && [ -s "$FILEPATH" ]; then
    # Success: zero exit code and non-empty file
    break
  fi

  # Failure: clean up partial file before retry
  [ -f "$FILEPATH" ] && rm -f "$FILEPATH"

  if [ $pg_dump_exit -ne 0 ]; then
    echo "pg_dump exited with code $pg_dump_exit"
  else
    echo "pg_dump produced an empty file — treating as failure"
  fi

  if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "All $MAX_ATTEMPTS attempts failed."
    exit 1
  fi

  ATTEMPT=$((ATTEMPT + 1))
done

SIZE=$(du -h "$FILEPATH" | cut -f1)
echo ""

# Clean up backups older than 30 days
DELETED=$(find "$OUTPUT_DIR" -name "backup-*.dump" -mtime +30 -print -delete | wc -l | tr -d ' ')
if [ "$DELETED" -gt 0 ]; then
  echo "Cleaned up $DELETED backup(s) older than 30 days."
fi

# Show recent backups
echo "Recent backups:"
ls -lh "$OUTPUT_DIR"/backup-*.dump 2>/dev/null | tail -5
echo ""

echo "[SUCCESS] $(date) — $FILEPATH ($SIZE)"
