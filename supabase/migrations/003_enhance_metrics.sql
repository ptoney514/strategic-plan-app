-- Enhanced Metrics Schema Migration
-- Adds support for descriptions, categories, risk thresholds, and enhanced time-series data

-- Add new columns to spb_metrics table
ALTER TABLE public.spb_metrics 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS metric_category VARCHAR(50) DEFAULT 'other',
ADD COLUMN IF NOT EXISTS risk_threshold_critical DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS risk_threshold_off_target DECIMAL(10,4), 
ADD COLUMN IF NOT EXISTS is_higher_better BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS collection_frequency VARCHAR(20) DEFAULT 'quarterly',
ADD COLUMN IF NOT EXISTS baseline_value DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS trend_direction VARCHAR(20) DEFAULT 'stable',
ADD COLUMN IF NOT EXISTS data_source_details TEXT,
ADD COLUMN IF NOT EXISTS last_collected TIMESTAMP WITH TIME ZONE;

-- Add constraint for metric_category enum if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'spb_metrics_category_check'
    ) THEN
        ALTER TABLE public.spb_metrics 
        ADD CONSTRAINT spb_metrics_category_check 
        CHECK (metric_category IN ('enrollment', 'achievement', 'discipline', 'attendance', 'culture', 'other'));
    END IF;
END $$;

-- Add constraint for trend_direction enum if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'spb_metrics_trend_direction_check'
    ) THEN
        ALTER TABLE public.spb_metrics
        ADD CONSTRAINT spb_metrics_trend_direction_check
        CHECK (trend_direction IN ('improving', 'stable', 'declining'));
    END IF;
END $$;

-- Add constraint for collection_frequency enum if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'spb_metrics_collection_frequency_check'
    ) THEN
        ALTER TABLE public.spb_metrics
        ADD CONSTRAINT spb_metrics_collection_frequency_check  
        CHECK (collection_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually'));
    END IF;
END $$;

-- Create index on metric_category for better filtering performance
CREATE INDEX IF NOT EXISTS idx_spb_metrics_category ON public.spb_metrics(metric_category);

-- Create index on collection_frequency 
CREATE INDEX IF NOT EXISTS idx_spb_metrics_frequency ON public.spb_metrics(collection_frequency);

-- Update existing metrics with default values
UPDATE public.spb_metrics 
SET 
  metric_category = 'achievement',
  is_higher_better = true,
  collection_frequency = 'quarterly',
  trend_direction = 'stable'
WHERE metric_category IS NULL;

-- Add sample enhanced data to demonstrate new structure
-- Update some existing metrics with realistic descriptions and categories

-- Example: Update metrics to have proper categories and descriptions
UPDATE public.spb_metrics 
SET 
  description = 'Overall average of responses (1-5 rating) on sense of belonging from district-wide surveys',
  metric_category = 'culture',
  is_higher_better = true,
  risk_threshold_critical = 0.7,
  risk_threshold_off_target = 0.9,
  collection_frequency = 'annually'
WHERE name ILIKE '%belonging%' OR name ILIKE '%culture%';

UPDATE public.spb_metrics 
SET 
  description = 'Proportional enrollment of non-white students in advanced coursework compared to district demographics',
  metric_category = 'enrollment', 
  is_higher_better = true,
  risk_threshold_critical = 0.6,
  risk_threshold_off_target = 0.8,
  collection_frequency = 'quarterly'
WHERE name ILIKE '%enrollment%' OR name ILIKE '%proportion%';

UPDATE public.spb_metrics 
SET 
  description = 'Risk ratio comparing discipline rates between student groups',
  metric_category = 'discipline',
  is_higher_better = false,  -- Lower ratios are better for discipline metrics
  risk_threshold_critical = 2.0,
  risk_threshold_off_target = 1.5,
  collection_frequency = 'quarterly'  
WHERE name ILIKE '%discipline%' OR name ILIKE '%disproportion%';

UPDATE public.spb_metrics 
SET 
  description = 'Achievement outcomes in special education services',
  metric_category = 'achievement',
  is_higher_better = true,
  risk_threshold_critical = 0.7,
  risk_threshold_off_target = 0.85,
  collection_frequency = 'quarterly'
WHERE name ILIKE '%special education%';

-- Create a view for easier metric status calculation
CREATE OR REPLACE VIEW public.metrics_with_status AS
SELECT 
  m.*,
  CASE 
    WHEN m.current_value IS NULL OR m.target_value IS NULL THEN 'no-data'
    WHEN m.is_higher_better THEN
      CASE 
        WHEN (m.current_value / m.target_value) >= COALESCE(m.risk_threshold_off_target, 0.9) THEN 'on-target'
        WHEN (m.current_value / m.target_value) >= COALESCE(m.risk_threshold_critical, 0.7) THEN 'off-target'
        ELSE 'critical'
      END
    ELSE 
      CASE 
        WHEN (m.current_value / m.target_value) <= COALESCE(m.risk_threshold_off_target, 1.1) THEN 'on-target'
        WHEN (m.current_value / m.target_value) <= COALESCE(m.risk_threshold_critical, 1.3) THEN 'off-target'
        ELSE 'critical'
      END
  END as calculated_status
FROM public.spb_metrics m;

-- Add comment explaining the view
COMMENT ON VIEW public.metrics_with_status IS 'Metrics with automatically calculated status based on current vs target values and risk thresholds';

-- Verify the migration
SELECT 'Enhanced metrics schema migration completed successfully!' as message;

-- Show updated structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'spb_metrics' 
  AND table_schema = 'public'
ORDER BY ordinal_position;