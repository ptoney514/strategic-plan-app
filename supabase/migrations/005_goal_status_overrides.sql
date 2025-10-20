-- Goal Status Override Support
-- Adds fields for manual status overrides and calculation tracking

-- Add status-related columns to goals table
ALTER TABLE public.spb_goals
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'not-started' 
  CHECK (status IN ('on-target', 'off-target', 'critical', 'at-risk', 'not-started')),
ADD COLUMN IF NOT EXISTS calculated_status VARCHAR(20),
ADD COLUMN IF NOT EXISTS status_source VARCHAR(20) DEFAULT 'calculated'
  CHECK (status_source IN ('calculated', 'manual', 'hybrid')),
ADD COLUMN IF NOT EXISTS status_override_reason TEXT,
ADD COLUMN IF NOT EXISTS status_override_by UUID,
ADD COLUMN IF NOT EXISTS status_override_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status_override_expires TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status_calculation_confidence DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS status_last_calculated TIMESTAMP WITH TIME ZONE;

-- Create status override history table
CREATE TABLE IF NOT EXISTS public.spb_status_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.spb_goals(id) ON DELETE CASCADE,
  previous_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  calculated_status VARCHAR(20),
  override_reason TEXT NOT NULL,
  override_category VARCHAR(50) CHECK (override_category IN 
    ('strategic', 'contextual', 'external_factors', 'data_quality', 'other')),
  evidence_urls TEXT[],
  created_by UUID NOT NULL,
  created_by_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_outcome VARCHAR(50) CHECK (review_outcome IN 
    ('approved', 'rejected', 'expired', 'superseded')),
  review_notes TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.spb_goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_calculated_status ON public.spb_goals(calculated_status);
CREATE INDEX IF NOT EXISTS idx_goals_status_source ON public.spb_goals(status_source);
CREATE INDEX IF NOT EXISTS idx_overrides_goal ON public.spb_status_overrides(goal_id);
CREATE INDEX IF NOT EXISTS idx_overrides_created_by ON public.spb_status_overrides(created_by);
CREATE INDEX IF NOT EXISTS idx_overrides_created_at ON public.spb_status_overrides(created_at);

-- Create function to track status changes
CREATE OR REPLACE FUNCTION track_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- If this is a manual override
    IF NEW.status_source = 'manual' THEN
      INSERT INTO spb_status_overrides (
        goal_id,
        previous_status,
        new_status,
        calculated_status,
        override_reason,
        created_by,
        created_at,
        expires_at
      ) VALUES (
        NEW.id,
        OLD.status,
        NEW.status,
        NEW.calculated_status,
        NEW.status_override_reason,
        NEW.status_override_by,
        NOW(),
        NEW.status_override_expires
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status changes
DROP TRIGGER IF EXISTS trigger_track_status_change ON public.spb_goals;
CREATE TRIGGER trigger_track_status_change
AFTER UPDATE ON public.spb_goals
FOR EACH ROW
EXECUTE FUNCTION track_status_change();

-- Add comment documentation
COMMENT ON COLUMN public.spb_goals.status IS 'Current status of the goal (can be manually overridden)';
COMMENT ON COLUMN public.spb_goals.calculated_status IS 'System-calculated status based on metrics and child goals';
COMMENT ON COLUMN public.spb_goals.status_source IS 'Whether status is calculated, manually set, or hybrid';
COMMENT ON COLUMN public.spb_goals.status_override_reason IS 'Justification for manual status override';
COMMENT ON TABLE public.spb_status_overrides IS 'History of all manual status overrides for audit trail';

-- Grant permissions
GRANT ALL ON public.spb_status_overrides TO anon, authenticated;

SELECT 'Goal status override support added successfully!' as message;