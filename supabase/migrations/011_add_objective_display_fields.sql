-- Add display fields for Objective Builder
-- These fields support the visual customization features in the Objective Builder UI

ALTER TABLE public.spb_goals
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS header_color VARCHAR(7),
ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS department VARCHAR(255),
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) CHECK (priority IN ('critical', 'high', 'medium', 'low')),
ADD COLUMN IF NOT EXISTS executive_summary TEXT,
ADD COLUMN IF NOT EXISTS indicator_text VARCHAR(50),
ADD COLUMN IF NOT EXISTS indicator_color VARCHAR(7) DEFAULT '#10b981';

COMMENT ON COLUMN public.spb_goals.image_url IS 'Header image URL for the goal card';
COMMENT ON COLUMN public.spb_goals.header_color IS 'Header background color (hex format) - alternative to image_url';
COMMENT ON COLUMN public.spb_goals.owner_name IS 'Person or team responsible for this goal';
COMMENT ON COLUMN public.spb_goals.department IS 'Department owning this goal';
COMMENT ON COLUMN public.spb_goals.start_date IS 'Goal start date';
COMMENT ON COLUMN public.spb_goals.end_date IS 'Goal target completion date';
COMMENT ON COLUMN public.spb_goals.priority IS 'Goal priority level';
COMMENT ON COLUMN public.spb_goals.executive_summary IS 'Executive-level summary of the goal';
COMMENT ON COLUMN public.spb_goals.indicator_text IS 'Visual badge text (e.g., "Priority", "Featured")';
COMMENT ON COLUMN public.spb_goals.indicator_color IS 'Color for the visual badge (hex format)';

SELECT 'Objective Builder display fields added successfully!' as message;
