-- Quick Westside District Setup
-- Run this in Supabase Studio SQL Editor at http://127.0.0.1:54323

-- First, check and remove any existing Westside data
DELETE FROM public.spb_metric_values WHERE metric_id IN (
  SELECT id FROM public.spb_metrics WHERE goal_id IN (
    SELECT id FROM public.spb_goals WHERE district_id = 'a0000000-0000-0000-0000-000000000002'
  )
);
DELETE FROM public.spb_metrics WHERE goal_id IN (
  SELECT id FROM public.spb_goals WHERE district_id = 'a0000000-0000-0000-0000-000000000002'
);
DELETE FROM public.spb_goals WHERE district_id = 'a0000000-0000-0000-0000-000000000002';
DELETE FROM public.spb_districts WHERE id = 'a0000000-0000-0000-0000-000000000002';

-- Create Westside District
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
  true
);

-- Verify it was created
SELECT name, slug, primary_color FROM spb_districts WHERE slug = 'westside';