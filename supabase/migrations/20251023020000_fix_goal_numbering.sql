-- Fix goal numbering: Remove incorrect .0 suffix from strategic objectives
-- and renumber all descendants correctly
--
-- Problem: Production has goals numbered "1.0", "2.0", "3.0", "4.0" at level 0
-- This causes child goals to be numbered "1.0.1", "1.0.2" instead of "1.1", "1.2"
--
-- Solution:
-- 1. Remove .0 suffix from level 0 goals
-- 2. Renumber all child goals to match correct pattern

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

-- Verify the fix
DO $$
DECLARE
  bad_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO bad_count
  FROM spb_goals
  WHERE goal_number LIKE '%.0.%' OR goal_number ~ '^\d+\.0$';

  IF bad_count > 0 THEN
    RAISE EXCEPTION 'Still have % goals with .0 in numbering', bad_count;
  END IF;

  RAISE NOTICE 'Goal numbering fixed successfully!';
END $$;

COMMIT;
