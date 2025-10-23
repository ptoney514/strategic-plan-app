#!/bin/bash

# Script to fix goal numbering in local Supabase database
# Removes incorrect ".0" suffix from strategic objectives and renumbers children

set -e

echo "🔧 Fixing Goal Numbering in Local Database"
echo "==========================================="
echo ""

# Apply the migration
docker exec supabase_db_strategic-plan-vite psql -U postgres -d postgres << 'EOF'

BEGIN;

-- Step 1: Fix level 0 strategic objectives
-- Change "1.0" → "1", "2.0" → "2", etc.
UPDATE spb_goals
SET goal_number = REGEXP_REPLACE(goal_number, '\.0$', '')
WHERE level = 0
  AND goal_number ~ '^\d+\.0$';

-- Step 2: Fix level 1 goals
-- Change "1.0.1" → "1.1", "2.0.3" → "2.3", etc.
UPDATE spb_goals g
SET goal_number = CONCAT(
  p.goal_number,
  '.',
  SUBSTRING(g.goal_number FROM '\.(\d+)$')
)
FROM spb_goals p
WHERE g.level = 1
  AND g.parent_id = p.id
  AND g.goal_number ~ '^\d+\.0\.\d+$';

-- Step 3: Fix level 2 sub-goals
-- Change "1.0.1.1" → "1.1.1", etc.
UPDATE spb_goals g
SET goal_number = CONCAT(
  p.goal_number,
  '.',
  SUBSTRING(g.goal_number FROM '\.(\d+)$')
)
FROM spb_goals p
WHERE g.level = 2
  AND g.parent_id = p.id
  AND g.goal_number ~ '^\d+\.0\.\d+\.\d+$';

COMMIT;

-- Verify the fix
SELECT 'Fixed goal numbers:' as status;
SELECT goal_number, title, level
FROM spb_goals
ORDER BY level, order_position
LIMIT 20;

-- Check for any remaining issues
SELECT COUNT(*) as remaining_issues
FROM spb_goals
WHERE goal_number LIKE '%.0.%' OR goal_number ~ '^\d+\.0$';

EOF

echo ""
echo "✅ Goal numbering fix completed!"
echo ""
echo "To verify, run:"
echo "  docker exec supabase_db_strategic-plan-vite psql -U postgres -d postgres -c \"SELECT goal_number, title, level FROM spb_goals ORDER BY level, order_position;\""
