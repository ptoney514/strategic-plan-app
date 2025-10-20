-- Add Overall Progress Tracking to Strategic Objectives
-- Based on real client data analysis (41 metrics across 6 objectives)
-- Handles ratio metrics, "Roll up" types, and hierarchical aggregation

-- ============================================================================
-- PART 1: Add Overall Progress Columns to Goals Table
-- ============================================================================

ALTER TABLE public.spb_goals
ADD COLUMN IF NOT EXISTS overall_progress DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS overall_progress_override DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS overall_progress_display_mode VARCHAR(20) DEFAULT 'percentage'
  CHECK (overall_progress_display_mode IN ('percentage', 'qualitative', 'score', 'color-only', 'hidden')),
ADD COLUMN IF NOT EXISTS overall_progress_source VARCHAR(20) DEFAULT 'calculated'
  CHECK (overall_progress_source IN ('calculated', 'manual')),
ADD COLUMN IF NOT EXISTS overall_progress_last_calculated TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS overall_progress_override_by UUID,
ADD COLUMN IF NOT EXISTS overall_progress_override_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS overall_progress_override_reason TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_goals_overall_progress_source
  ON public.spb_goals(overall_progress_source);
CREATE INDEX IF NOT EXISTS idx_goals_overall_progress_display_mode
  ON public.spb_goals(overall_progress_display_mode);

COMMENT ON COLUMN public.spb_goals.overall_progress IS 'Calculated overall progress 0-100 from metrics and child goals';
COMMENT ON COLUMN public.spb_goals.overall_progress_override IS 'Manual override value set by admin';
COMMENT ON COLUMN public.spb_goals.overall_progress_display_mode IS 'How to display: percentage (75%), qualitative (Great), score (3.75/5.00), color-only, hidden';
COMMENT ON COLUMN public.spb_goals.overall_progress_source IS 'Whether progress is calculated or manually overridden';

-- ============================================================================
-- PART 2: Add Metric Calculation Type Columns to Metrics Table
-- ============================================================================

ALTER TABLE public.spb_metrics
ADD COLUMN IF NOT EXISTS is_higher_better BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS metric_calculation_type VARCHAR(50) DEFAULT 'numeric'
  CHECK (metric_calculation_type IN ('numeric', 'ratio', 'qualitative', 'percentage', 'count', 'rollup')),
ADD COLUMN IF NOT EXISTS qualitative_mapping JSONB,
ADD COLUMN IF NOT EXISTS baseline_value DECIMAL(15,4);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_metrics_calculation_type
  ON public.spb_metrics(metric_calculation_type);
CREATE INDEX IF NOT EXISTS idx_metrics_is_higher_better
  ON public.spb_metrics(is_higher_better);

COMMENT ON COLUMN public.spb_metrics.is_higher_better IS 'For ratio metrics: true = higher is better, false = lower is better (e.g., risk ratios)';
COMMENT ON COLUMN public.spb_metrics.metric_calculation_type IS 'Type of metric for calculation: numeric, ratio, qualitative, percentage, count, or rollup';
COMMENT ON COLUMN public.spb_metrics.qualitative_mapping IS 'For qualitative metrics: {"Great": 100, "Good": 75, "Fair": 50, "Poor": 25}';
COMMENT ON COLUMN public.spb_metrics.baseline_value IS 'Starting/baseline value for calculating improvement (especially for ratio metrics)';

-- ============================================================================
-- PART 3: Create Recursive Progress Calculation Function
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_goal_overall_progress(p_goal_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_override_value DECIMAL(5,2);
  v_metric_progress DECIMAL(5,2);
  v_child_progress DECIMAL(5,2);
  v_metric_count INT;
  v_child_count INT;
  v_combined_progress DECIMAL(5,2);
BEGIN
  -- STEP 1: Check for manual override first (highest priority)
  SELECT overall_progress_override INTO v_override_value
  FROM spb_goals
  WHERE id = p_goal_id;

  IF v_override_value IS NOT NULL THEN
    RETURN v_override_value;
  END IF;

  -- STEP 2: Calculate average progress from direct metrics
  -- Handles different metric types and directions
  SELECT
    AVG(
      CASE
        -- Handle ratio metrics where LOWER is better (e.g., risk ratios like 2.6/1 -> 2.2/1)
        WHEN is_higher_better = false AND baseline_value IS NOT NULL THEN
          CASE
            WHEN baseline_value - target_value = 0 THEN 100  -- Already at target
            ELSE LEAST(
              GREATEST(
                ((baseline_value - COALESCE(current_value, baseline_value)) /
                 NULLIF(baseline_value - target_value, 0)) * 100,
                0  -- Don't allow negative progress
              ),
              100  -- Cap at 100%
            )
          END

        -- Handle normal metrics where HIGHER is better (most common)
        WHEN target_value > 0 THEN
          LEAST(
            (COALESCE(current_value, 0) / NULLIF(target_value, 0)) * 100,
            100
          )

        ELSE NULL
      END
    ),
    COUNT(*)
  INTO v_metric_progress, v_metric_count
  FROM spb_metrics
  WHERE goal_id = p_goal_id
    AND current_value IS NOT NULL
    AND target_value IS NOT NULL
    AND target_value <> 0
    AND metric_calculation_type != 'rollup';  -- Exclude "Roll up" type metrics

  -- STEP 3: Calculate average progress from child goals (RECURSIVE)
  SELECT
    AVG(calculate_goal_overall_progress(id)),
    COUNT(*)
  INTO v_child_progress, v_child_count
  FROM spb_goals
  WHERE parent_id = p_goal_id;

  -- STEP 4: Combine metrics and children (simple average, no weighting)
  IF v_metric_count > 0 AND v_child_count > 0 THEN
    -- Goal has both direct metrics AND child goals
    v_combined_progress := (COALESCE(v_metric_progress, 0) + COALESCE(v_child_progress, 0)) / 2;
  ELSIF v_metric_count > 0 THEN
    -- Goal has only direct metrics
    v_combined_progress := v_metric_progress;
  ELSIF v_child_count > 0 THEN
    -- Goal has only child goals (common for high-level objectives)
    v_combined_progress := v_child_progress;
  ELSE
    -- Goal has no data at all
    v_combined_progress := NULL;
  END IF;

  RETURN v_combined_progress;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_goal_overall_progress IS 'Recursively calculates overall progress for a goal from metrics and children. Handles ratio metrics, rollup types, and hierarchical aggregation.';

-- ============================================================================
-- PART 4: Create Batch Recalculation Function for Admins
-- ============================================================================

CREATE OR REPLACE FUNCTION recalculate_district_progress(p_district_id UUID)
RETURNS TABLE(
  updated_count INT,
  skipped_count INT,
  calculation_time INTERVAL
) AS $$
DECLARE
  v_start_time TIMESTAMP;
  v_updated_count INT := 0;
  v_skipped_count INT := 0;
BEGIN
  v_start_time := clock_timestamp();

  -- Update all goals that don't have manual overrides
  UPDATE spb_goals
  SET
    overall_progress = calculate_goal_overall_progress(id),
    overall_progress_last_calculated = NOW()
  WHERE district_id = p_district_id
    AND overall_progress_source = 'calculated'
  RETURNING 1 INTO v_updated_count;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  -- Count goals with manual overrides that were skipped
  SELECT COUNT(*) INTO v_skipped_count
  FROM spb_goals
  WHERE district_id = p_district_id
    AND overall_progress_source = 'manual';

  RETURN QUERY SELECT
    v_updated_count,
    v_skipped_count,
    clock_timestamp() - v_start_time;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION recalculate_district_progress IS 'Batch recalculates overall progress for all goals in a district. Skips manually overridden goals. Returns count of updated/skipped goals and calculation time.';

-- ============================================================================
-- PART 5: Create View for Progress Breakdown (Admin Debugging)
-- ============================================================================

CREATE OR REPLACE VIEW spb_goals_progress_breakdown AS
SELECT
  g.id,
  g.district_id,
  g.goal_number,
  g.title,
  g.level,

  -- Calculated progress
  calculate_goal_overall_progress(g.id) as calculated_progress,

  -- Manual override (if any)
  g.overall_progress_override as manual_override,

  -- Final displayed progress (override takes precedence)
  COALESCE(g.overall_progress_override, g.overall_progress) as final_progress,

  -- Display settings
  g.overall_progress_display_mode,
  g.overall_progress_source,

  -- Data availability
  (SELECT COUNT(*)
   FROM spb_goals
   WHERE parent_id = g.id) as child_count,

  (SELECT COUNT(*)
   FROM spb_metrics
   WHERE goal_id = g.id
     AND metric_calculation_type != 'rollup') as direct_metric_count,

  (SELECT COUNT(*)
   FROM spb_metrics
   WHERE goal_id = g.id
     AND metric_calculation_type = 'rollup') as rollup_metric_count,

  -- Override metadata
  g.overall_progress_override_reason,
  g.overall_progress_override_by,
  g.overall_progress_override_at,
  g.overall_progress_last_calculated

FROM spb_goals g
ORDER BY g.goal_number;

COMMENT ON VIEW spb_goals_progress_breakdown IS 'Admin view showing calculated vs manual progress for all goals with data breakdown. Useful for debugging calculation issues.';

-- ============================================================================
-- PART 6: Grant Permissions
-- ============================================================================

GRANT ALL ON spb_goals_progress_breakdown TO anon, authenticated;

-- ============================================================================
-- PART 7: Initial Calculation for Existing Goals
-- ============================================================================

-- Calculate initial progress for all existing goals
DO $$
DECLARE
  v_district_record RECORD;
  v_result RECORD;
BEGIN
  FOR v_district_record IN SELECT id, name FROM spb_districts LOOP
    SELECT * INTO v_result FROM recalculate_district_progress(v_district_record.id);
    RAISE NOTICE 'District %: Updated % goals, Skipped % manual overrides, Time: %',
      v_district_record.name, v_result.updated_count, v_result.skipped_count, v_result.calculation_time;
  END LOOP;
END $$;

-- ============================================================================
-- Success Message
-- ============================================================================

SELECT
  'Overall progress tracking added successfully!' as message,
  COUNT(*) as total_goals,
  COUNT(CASE WHEN overall_progress IS NOT NULL THEN 1 END) as goals_with_progress,
  COUNT(CASE WHEN overall_progress_source = 'manual' THEN 1 END) as manual_overrides
FROM spb_goals;
