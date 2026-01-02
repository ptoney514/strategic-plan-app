-- Migration: Add color field to spb_goals for objective theming
-- This allows districts to assign theme colors to top-level objectives

ALTER TABLE spb_goals
ADD COLUMN IF NOT EXISTS color VARCHAR(20);

-- Add comment for documentation
COMMENT ON COLUMN spb_goals.color IS 'Theme color for objective cards: red, blue, amber, green';

-- Set default colors for existing Level 0 goals based on their order
-- This is a one-time setup; future goals will have color set explicitly
UPDATE spb_goals
SET color = CASE
  WHEN goal_number = '1' THEN 'red'
  WHEN goal_number = '2' THEN 'blue'
  WHEN goal_number = '3' THEN 'amber'
  WHEN goal_number = '4' THEN 'green'
  ELSE 'red'
END
WHERE level = 0 AND color IS NULL;
