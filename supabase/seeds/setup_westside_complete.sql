-- Complete Setup for Westside District
-- This script ensures all tables exist and then creates Westside district
-- Run this in Supabase Studio SQL Editor at http://127.0.0.1:54323

-- Step 1: Create spb_metric_values table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.spb_metric_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  value DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Clean up any existing Westside data (safe even if tables don't exist)
DO $$
BEGIN
  -- Delete metric values if table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'spb_metric_values') THEN
    DELETE FROM public.spb_metric_values WHERE metric_id IN (
      SELECT id FROM public.spb_metrics WHERE goal_id IN (
        SELECT id FROM public.spb_goals WHERE district_id = 'a0000000-0000-0000-0000-000000000002'
      )
    );
  END IF;
  
  -- Delete metrics if table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'spb_metrics') THEN
    DELETE FROM public.spb_metrics WHERE goal_id IN (
      SELECT id FROM public.spb_goals WHERE district_id = 'a0000000-0000-0000-0000-000000000002'
    );
  END IF;
  
  -- Delete goals if table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'spb_goals') THEN
    DELETE FROM public.spb_goals WHERE district_id = 'a0000000-0000-0000-0000-000000000002';
  END IF;
  
  -- Delete district if table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'spb_districts') THEN
    DELETE FROM public.spb_districts WHERE id = 'a0000000-0000-0000-0000-000000000002';
  END IF;
END $$;

-- Step 3: Create Westside District
INSERT INTO public.spb_districts (
  id,
  name,
  slug,
  primary_color,
  secondary_color,
  admin_email,
  is_public,
  created_at,
  updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'Westside Community Schools',
  'westside',
  '#1e3a5f',
  '#f7941d',
  'admin@westside66.org',
  true,
  NOW(),
  NOW()
);

-- Step 4: Verify it was created
SELECT 'Success! Westside district created.' as message;
SELECT name, slug, primary_color, secondary_color FROM spb_districts WHERE slug = 'westside';