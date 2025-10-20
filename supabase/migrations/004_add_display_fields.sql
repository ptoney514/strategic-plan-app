-- Add missing display fields to metrics table
-- These fields are being used in the application but don't exist in production

-- Add display_width column for controlling metric card width in UI
ALTER TABLE public.spb_metrics
ADD COLUMN IF NOT EXISTS display_width text DEFAULT 'full';

-- Add description column for metric descriptions
ALTER TABLE public.spb_metrics
ADD COLUMN IF NOT EXISTS description text;

-- Add visualization_type column for chart type selection
ALTER TABLE public.spb_metrics
ADD COLUMN IF NOT EXISTS visualization_type text DEFAULT 'progress';

-- Add visualization_config column for storing chart configuration
ALTER TABLE public.spb_metrics
ADD COLUMN IF NOT EXISTS visualization_config jsonb;

-- Add constraint for display_width values if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'spb_metrics_display_width_check'
    ) THEN
        ALTER TABLE public.spb_metrics
        ADD CONSTRAINT spb_metrics_display_width_check 
        CHECK (display_width IN ('full', 'half', 'third', 'quarter'));
    END IF;
END $$;