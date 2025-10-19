-- Add progress bar visibility control for objectives
-- This allows admins to show/hide the progress bar on the public view

ALTER TABLE public.spb_goals
ADD COLUMN IF NOT EXISTS show_progress_bar BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.spb_goals.show_progress_bar IS 'Controls visibility of progress bar on public view (level 0 objectives only)';

SELECT 'Progress bar visibility control added successfully!' as message;
