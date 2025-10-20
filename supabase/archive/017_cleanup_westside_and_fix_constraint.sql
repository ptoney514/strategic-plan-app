-- Temporary Migration: Fix visualization_type constraint across ALL districts
-- This will be removed after execution

-- ============================================================================
-- PART 1: Drop the incorrect constraint FIRST
-- ============================================================================

ALTER TABLE public.spb_metrics
DROP CONSTRAINT IF EXISTS spb_metrics_visualization_type_check;

-- ============================================================================
-- PART 2: Update ALL metrics to have valid visualization_type values
-- ============================================================================

-- Now we can safely update without constraint violations
UPDATE spb_metrics
SET visualization_type = CASE
  -- Keep valid values as-is
  WHEN visualization_type IN ('auto', 'line', 'bar', 'gauge', 'donut', 'timeline', 'blog', 'number', 'progress')
    THEN visualization_type
  -- Map common invalid values
  WHEN visualization_type = 'percentage' THEN 'progress'
  WHEN visualization_type LIKE '%chart%' THEN 'bar'
  WHEN visualization_type LIKE '%line%' THEN 'line'
  WHEN visualization_type IS NULL THEN 'auto'
  -- Default fallback
  ELSE 'auto'
END;

-- ============================================================================
-- PART 3: Delete Westside metrics (clean slate for testing)
-- ============================================================================

DELETE FROM spb_metrics
WHERE goal_id IN (
  SELECT id FROM spb_goals WHERE district_id = 'a0000000-0000-0000-0000-000000000002'
);

-- ============================================================================
-- PART 4: Add the CORRECT constraint
-- ============================================================================

ALTER TABLE public.spb_metrics
ADD CONSTRAINT spb_metrics_visualization_type_check
CHECK (visualization_type IN ('auto', 'line', 'bar', 'gauge', 'donut', 'timeline', 'blog', 'number', 'progress'));

-- ============================================================================
-- Success Message
-- ============================================================================

SELECT 'All metrics normalized, Westside cleaned, constraint fixed!' as status;
