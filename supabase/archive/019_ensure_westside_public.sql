-- Migration 019: Ensure Westside district exists and is public
-- Fixes issue where anonymous users can't see Westside district

-- Create Westside district if it doesn't exist
INSERT INTO public.spb_districts (
  id,
  name,
  slug,
  primary_color,
  secondary_color,
  admin_email,
  is_public
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'Westside Community Schools',
  'westside',
  '#1e3a5f',
  '#f7941d',
  'admin@westside66.org',
  true  -- CRITICAL: Must be true for public access
)
ON CONFLICT (id) DO UPDATE SET
  is_public = true,  -- Ensure it's public
  updated_at = NOW();

-- Verify Westside is public
SELECT
  slug,
  name,
  is_public,
  'Should be true for public access' as note
FROM spb_districts
WHERE slug = 'westside';
