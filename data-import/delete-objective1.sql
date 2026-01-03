-- ============================================================================
-- DELETE EXISTING OBJECTIVE 1 DATA (Educational Equity - INCORRECT)
-- Run this BEFORE importing the correct data
-- ============================================================================

-- Delete time series data for Objective 1 metrics
DELETE FROM spb_metric_time_series
WHERE metric_id IN (
    SELECT m.id FROM spb_metrics m
    JOIN spb_goals g ON m.goal_id = g.id
    WHERE g.district_id = 'a0000000-0000-0000-0000-000000000002'
      AND g.goal_number LIKE '1%'
);

SELECT 'Deleted time series data for Objective 1' as step;

-- Delete metrics for Objective 1 goals
DELETE FROM spb_metrics
WHERE goal_id IN (
    SELECT id FROM spb_goals
    WHERE district_id = 'a0000000-0000-0000-0000-000000000002'
      AND goal_number LIKE '1%'
);

SELECT 'Deleted metrics for Objective 1' as step;

-- Delete all goals under Objective 1 (including the objective itself)
-- Start with sub-goals (level 2), then goals (level 1), then objective (level 0)
DELETE FROM spb_goals
WHERE district_id = 'a0000000-0000-0000-0000-000000000002'
  AND goal_number LIKE '1.%.%';

SELECT 'Deleted sub-goals (1.x.x)' as step;

DELETE FROM spb_goals
WHERE district_id = 'a0000000-0000-0000-0000-000000000002'
  AND goal_number LIKE '1.%'
  AND goal_number NOT LIKE '1.%.%';

SELECT 'Deleted goals (1.x)' as step;

DELETE FROM spb_goals
WHERE district_id = 'a0000000-0000-0000-0000-000000000002'
  AND goal_number = '1';

SELECT 'Deleted Objective 1' as step;

-- Verify deletion
SELECT 'VERIFICATION - Should be 0 rows:' as status;
SELECT COUNT(*) as remaining_goals
FROM spb_goals
WHERE district_id = 'a0000000-0000-0000-0000-000000000002'
  AND goal_number LIKE '1%';
