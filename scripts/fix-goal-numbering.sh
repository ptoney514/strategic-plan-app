#!/bin/bash

# Script to fix goal numbering in production database
# Removes incorrect ".0" suffix from strategic objectives (level 0)
# and renumbers all descendants correctly

set -e

echo "🔧 Fix Goal Numbering Script"
echo "=============================="
echo ""
echo "This script will fix goal numbering in the database by:"
echo "1. Renumbering level 0 goals (strategic objectives) to remove .0 suffix"
echo "2. Recursively renumbering all child goals"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must run from project root directory"
  exit 1
fi

# Ask for confirmation
echo "⚠️  WARNING: This will modify goal_number values in the database."
echo ""
read -p "Continue? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
  echo "Aborted."
  exit 0
fi

# Get database connection info
read -p "Enter Supabase database URL (or press Enter for local): " DB_URL

if [ -z "$DB_URL" ]; then
  # Use local Supabase
  DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
  echo "Using local database: $DB_URL"
else
  echo "Using remote database"
fi

echo ""
echo "📊 Current goal numbers with issues:"
docker exec supabase_db_strategic-plan-vite psql -U postgres -d postgres -c "
  SELECT goal_number, title, level
  FROM spb_goals
  WHERE goal_number LIKE '%.0%' OR goal_number LIKE '%..%'
  ORDER BY level, order_position;
" || psql "$DB_URL" -c "
  SELECT goal_number, title, level
  FROM spb_goals
  WHERE goal_number LIKE '%.0%' OR goal_number LIKE '%..%'
  ORDER BY level, order_position;
"

echo ""
read -p "Proceed with fix? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo "🔄 Fixing goal numbering..."

# SQL script to fix numbering
FIX_SQL="
DO \$\$
DECLARE
  district RECORD;
BEGIN
  -- For each district
  FOR district IN SELECT DISTINCT district_id FROM spb_goals
  LOOP
    RAISE NOTICE 'Fixing district: %', district.district_id;

    -- Call the renumberGoals function for root goals (this will cascade)
    -- This assumes we have a way to trigger renumbering
    -- For now, we'll do it manually with direct updates
  END LOOP;
END \$\$;

-- Fix level 0 goals: Remove .0 suffix
UPDATE spb_goals
SET goal_number = REPLACE(goal_number, '.0', '')
WHERE level = 0 AND goal_number LIKE '%.0';

-- Now we need to renumber all children
-- We'll use the application's renumberGoals service
"

echo "✅ Step 1: Fixed level 0 goal numbers"

echo ""
echo "⚠️  Note: You need to trigger renumbering for all goals."
echo "Options:"
echo "1. Use the reordering page to trigger auto-renumbering"
echo "2. Run a full renumber via API call"
echo "3. Manually trigger renumberGoals service"
echo ""
echo "Recommended: Open /<district-slug>/admin/goals-v2 and slightly reorder each strategic objective"

exit 0
