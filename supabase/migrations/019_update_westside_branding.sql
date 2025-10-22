-- Migration 019: Update Westside District Branding
-- Updates the Westside district with correct colors and logo from their actual site

-- Add tagline column to districts table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'spb_districts'
    AND column_name = 'tagline'
  ) THEN
    ALTER TABLE public.spb_districts ADD COLUMN tagline TEXT;
  END IF;
END $$;

-- Update Westside district with correct branding
UPDATE public.spb_districts
SET
  primary_color = '#C03537',  -- Westside red color
  secondary_color = '#000000', -- Black for top nav
  logo_url = 'https://www.westside66.org/cms/lib/NE50000555/Centricity/Template/GlobalAssets/images//logos/Westside District STAR BOX.png',
  tagline = 'Community. Innovation. Excellence.',
  name = 'Westside Community Schools'
WHERE slug = 'westside';
