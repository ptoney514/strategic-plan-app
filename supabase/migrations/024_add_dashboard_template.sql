-- Migration 024: Add Dashboard Template Support
-- Purpose: Allow districts to choose different dashboard layouts (hierarchical, metrics-grid, launch-traction)
-- Date: 2026-01-27

-- ============================================================================
-- PART 1: Add Dashboard Template Columns to Districts Table
-- ============================================================================

-- Add dashboard_template column for selecting the layout type
ALTER TABLE public.spb_districts
  ADD COLUMN IF NOT EXISTS dashboard_template VARCHAR(50) DEFAULT 'hierarchical';

-- Add dashboard_config column for template-specific configuration
ALTER TABLE public.spb_districts
  ADD COLUMN IF NOT EXISTS dashboard_config JSONB DEFAULT '{}'::jsonb;

-- Add constraint to validate dashboard_template values
ALTER TABLE public.spb_districts
  ADD CONSTRAINT valid_dashboard_template CHECK (
    dashboard_template IS NULL OR
    dashboard_template IN ('hierarchical', 'metrics-grid', 'launch-traction')
  );

-- Add comments for documentation
COMMENT ON COLUMN public.spb_districts.dashboard_template IS
  'Dashboard layout template: hierarchical (default), metrics-grid, or launch-traction';
COMMENT ON COLUMN public.spb_districts.dashboard_config IS
  'JSONB configuration for dashboard template (showSidebar, gridColumns, enableAnimations, etc.)';

-- ============================================================================
-- PART 2: Create Index for Template Filtering
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_districts_dashboard_template
  ON public.spb_districts(dashboard_template);

-- ============================================================================
-- PART 3: Update Existing Districts with Defaults
-- ============================================================================

-- Ensure all existing districts have the default template
UPDATE public.spb_districts
SET
  dashboard_template = COALESCE(dashboard_template, 'hierarchical'),
  dashboard_config = COALESCE(dashboard_config, '{}'::jsonb)
WHERE dashboard_template IS NULL OR dashboard_config IS NULL;

-- ============================================================================
-- PART 4: Helper Function to Get Dashboard Config
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_config(district_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT
    jsonb_build_object(
      'template', COALESCE(dashboard_template, 'hierarchical'),
      'config', COALESCE(dashboard_config, '{}'::jsonb)
    )
  INTO result
  FROM public.spb_districts
  WHERE id = district_id_param;

  RETURN COALESCE(result, jsonb_build_object('template', 'hierarchical', 'config', '{}'::jsonb));
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_dashboard_config(UUID) TO anon, authenticated;

-- ============================================================================
-- PART 5: Log Success
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 024: Dashboard template columns added successfully';
  RAISE NOTICE 'Available templates: hierarchical (default), metrics-grid, launch-traction';
END $$;
