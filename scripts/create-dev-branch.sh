#!/usr/bin/env bash
set -e

PROJECT_ID="small-salad-72814952"
BRANCH="dev"
DB="strategic-plan-db"

echo "→ Checking for existing '$BRANCH' branch..."
if neonctl branches get "$BRANCH" --project-id "$PROJECT_ID" &>/dev/null; then
  echo "✓ Branch already exists"
else
  echo "→ Creating '$BRANCH' branch..."
  neonctl branches create --name "$BRANCH" --project-id "$PROJECT_ID"
fi

echo ""
echo "→ Your DATABASE_URL for .env.local:"
neonctl connection-string --branch "$BRANCH" \
  --database-name "$DB" --project-id "$PROJECT_ID"

echo ""
echo "Next steps:"
echo "  1. Copy the connection string above into .env.local as DATABASE_URL"
echo "  2. Run: npm run db:dev:migrate && npm run db:dev:reset"
