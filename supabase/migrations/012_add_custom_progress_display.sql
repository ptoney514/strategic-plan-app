-- Add Custom Value Support for Progress Display
-- Allows showing custom text or numbers (e.g., "3.71", "Proficient") instead of percentages

-- ============================================================================
-- PART 1: Add Custom Value Field
-- ============================================================================

ALTER TABLE public.spb_goals
ADD COLUMN IF NOT EXISTS overall_progress_custom_value VARCHAR(50);

COMMENT ON COLUMN public.spb_goals.overall_progress_custom_value IS 'Custom display value for progress (e.g., "3.71", "Proficient"). Used when display_mode is "custom".';

-- ============================================================================
-- PART 2: Update Display Mode Check Constraint
-- ============================================================================

-- Drop the old constraint
ALTER TABLE public.spb_goals
DROP CONSTRAINT IF EXISTS spb_goals_overall_progress_display_mode_check;

-- Add the new constraint with 'custom' option
ALTER TABLE public.spb_goals
ADD CONSTRAINT spb_goals_overall_progress_display_mode_check
CHECK (overall_progress_display_mode IN ('percentage', 'qualitative', 'score', 'color-only', 'hidden', 'custom'));

-- ============================================================================
-- Success Message
-- ============================================================================

SELECT
  'Custom progress display value support added successfully!' as message,
  COUNT(*) as total_goals,
  COUNT(CASE WHEN overall_progress_display_mode = 'custom' THEN 1 END) as goals_with_custom_display
FROM spb_goals;
