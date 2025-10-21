-- Migration 017: Add Schools and School Admins
-- Purpose: Enable multi-school functionality with independent goals per school
-- Date: 2025-10-21

-- ============================================================================
-- PART 1: Create Schools Table
-- ============================================================================

-- Create schools table as sub-entities under districts
CREATE TABLE IF NOT EXISTS public.spb_schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES public.spb_districts(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL,  -- e.g., 'hillside-elementary'
  logo_url TEXT,
  primary_color VARCHAR(7),  -- Can inherit from district if NULL
  secondary_color VARCHAR(7),  -- Can inherit from district if NULL
  description TEXT,
  address TEXT,
  phone VARCHAR,
  principal_name VARCHAR,
  principal_email VARCHAR,
  is_public BOOLEAN DEFAULT true,
  student_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(district_id, slug)  -- slug must be unique within district
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_schools_district_id ON public.spb_schools(district_id);
CREATE INDEX IF NOT EXISTS idx_schools_slug ON public.spb_schools(slug);
CREATE INDEX IF NOT EXISTS idx_schools_is_public ON public.spb_schools(is_public);

-- Add comments
COMMENT ON TABLE public.spb_schools IS 'Schools belonging to districts with independent strategic plans';
COMMENT ON COLUMN public.spb_schools.district_id IS 'Parent district';
COMMENT ON COLUMN public.spb_schools.slug IS 'URL-friendly identifier (unique within district)';
COMMENT ON COLUMN public.spb_schools.is_public IS 'Whether school strategic plan is publicly viewable';

-- ============================================================================
-- PART 2: Create School Admins Table
-- ============================================================================

-- Create school admins table for managing who can administer which schools
CREATE TABLE IF NOT EXISTS public.spb_school_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.spb_schools(id) ON DELETE CASCADE,
  school_slug TEXT NOT NULL,  -- Denormalized for faster lookups
  district_slug TEXT NOT NULL,  -- Denormalized for routing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, school_id)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_school_admins_user_id ON public.spb_school_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_school_admins_school_id ON public.spb_school_admins(school_id);
CREATE INDEX IF NOT EXISTS idx_school_admins_school_slug ON public.spb_school_admins(school_slug);
CREATE INDEX IF NOT EXISTS idx_school_admins_district_slug ON public.spb_school_admins(district_slug);

-- Add comments
COMMENT ON TABLE public.spb_school_admins IS 'Junction table managing which users can administer which schools';
COMMENT ON COLUMN public.spb_school_admins.user_id IS 'User who has admin access to the school';
COMMENT ON COLUMN public.spb_school_admins.school_id IS 'School the user can administer';
COMMENT ON COLUMN public.spb_school_admins.school_slug IS 'Denormalized school slug for faster lookups';
COMMENT ON COLUMN public.spb_school_admins.district_slug IS 'Denormalized district slug for routing';

-- ============================================================================
-- PART 3: Modify Goals Table to Support Schools
-- ============================================================================

-- Add school_id column to goals (nullable for backward compatibility)
ALTER TABLE public.spb_goals
  ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.spb_schools(id) ON DELETE CASCADE;

-- Add constraint: goal belongs to EITHER district OR school (not both)
ALTER TABLE public.spb_goals
  DROP CONSTRAINT IF EXISTS goals_owner_check;

ALTER TABLE public.spb_goals
  ADD CONSTRAINT goals_owner_check
  CHECK (
    (district_id IS NOT NULL AND school_id IS NULL) OR
    (district_id IS NULL AND school_id IS NOT NULL)
  );

-- Create index for school goals
CREATE INDEX IF NOT EXISTS idx_goals_school_id ON public.spb_goals(school_id);

-- Add comment
COMMENT ON COLUMN public.spb_goals.school_id IS 'School that owns this goal (mutually exclusive with district_id)';

-- ============================================================================
-- PART 4: Enable RLS on New Tables
-- ============================================================================

ALTER TABLE public.spb_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spb_school_admins ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 5: Create RLS Policies for Schools
-- ============================================================================

-- Public read access to public schools
CREATE POLICY "Public schools are viewable by everyone"
  ON public.spb_schools FOR SELECT
  USING (is_public = true);

-- System admins have full access
CREATE POLICY "System admins have full access to schools"
  ON public.spb_schools FOR ALL
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'system_admin'
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'system_admin'
  );

-- District admins can view and manage schools in their district
CREATE POLICY "District admins can view their district schools"
  ON public.spb_schools FOR SELECT
  USING (
    district_id IN (
      SELECT district_id FROM public.spb_district_admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "District admins can insert schools in their district"
  ON public.spb_schools FOR INSERT
  WITH CHECK (
    district_id IN (
      SELECT district_id FROM public.spb_district_admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "District admins can update schools in their district"
  ON public.spb_schools FOR UPDATE
  USING (
    district_id IN (
      SELECT district_id FROM public.spb_district_admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "District admins can delete schools in their district"
  ON public.spb_schools FOR DELETE
  USING (
    district_id IN (
      SELECT district_id FROM public.spb_district_admins
      WHERE user_id = auth.uid()
    )
  );

-- School admins can view and update their own school
CREATE POLICY "School admins can view their school"
  ON public.spb_schools FOR SELECT
  USING (
    id IN (
      SELECT school_id FROM public.spb_school_admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "School admins can update their school"
  ON public.spb_schools FOR UPDATE
  USING (
    id IN (
      SELECT school_id FROM public.spb_school_admins
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- PART 6: Create RLS Policies for School Admins
-- ============================================================================

-- Only system admins and district admins can manage school admins
CREATE POLICY "System admins can manage school admins"
  ON public.spb_school_admins FOR ALL
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'system_admin'
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'system_admin'
  );

CREATE POLICY "District admins can manage school admins in their district"
  ON public.spb_school_admins FOR ALL
  USING (
    school_id IN (
      SELECT id FROM public.spb_schools
      WHERE district_id IN (
        SELECT district_id FROM public.spb_district_admins
        WHERE user_id = auth.uid()
      )
    )
  );

-- Users can view their own school admin assignments
CREATE POLICY "Users can view their own school admin assignments"
  ON public.spb_school_admins FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================================
-- PART 7: Update Goals RLS Policies for Schools
-- ============================================================================

-- Drop and recreate public goals policy to include schools
DROP POLICY IF EXISTS "Public district goals are viewable" ON public.spb_goals;
DROP POLICY IF EXISTS "Public goals are viewable" ON public.spb_goals;

CREATE POLICY "Public goals are viewable"
  ON public.spb_goals FOR SELECT
  USING (
    -- District goals from public districts
    (district_id IN (SELECT id FROM public.spb_districts WHERE is_public = true))
    OR
    -- School goals from public schools
    (school_id IN (SELECT id FROM public.spb_schools WHERE is_public = true))
  );

-- School admins can manage their school's goals
CREATE POLICY "School admins can view their school goals"
  ON public.spb_goals FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM public.spb_school_admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "School admins can insert goals in their school"
  ON public.spb_goals FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM public.spb_school_admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "School admins can update goals in their school"
  ON public.spb_goals FOR UPDATE
  USING (
    school_id IN (
      SELECT school_id FROM public.spb_school_admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "School admins can delete goals in their school"
  ON public.spb_goals FOR DELETE
  USING (
    school_id IN (
      SELECT school_id FROM public.spb_school_admins
      WHERE user_id = auth.uid()
    )
  );

-- District admins can view all school goals in their district
CREATE POLICY "District admins can view school goals in their district"
  ON public.spb_goals FOR SELECT
  USING (
    school_id IN (
      SELECT id FROM public.spb_schools
      WHERE district_id IN (
        SELECT district_id FROM public.spb_district_admins
        WHERE user_id = auth.uid()
      )
    )
  );

-- District admins can manage school goals in their district
CREATE POLICY "District admins can insert school goals in their district"
  ON public.spb_goals FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT id FROM public.spb_schools
      WHERE district_id IN (
        SELECT district_id FROM public.spb_district_admins
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "District admins can update school goals in their district"
  ON public.spb_goals FOR UPDATE
  USING (
    school_id IN (
      SELECT id FROM public.spb_schools
      WHERE district_id IN (
        SELECT district_id FROM public.spb_district_admins
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "District admins can delete school goals in their district"
  ON public.spb_goals FOR DELETE
  USING (
    school_id IN (
      SELECT id FROM public.spb_schools
      WHERE district_id IN (
        SELECT district_id FROM public.spb_district_admins
        WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- PART 8: Grant Permissions
-- ============================================================================

-- Grant read-only access to anon for schools
GRANT SELECT ON public.spb_schools TO anon;
GRANT SELECT ON public.spb_school_admins TO anon;
GRANT SELECT ON public.spb_district_admins TO anon;  -- Needed for RLS policy evaluation

-- Authenticated users need read/write (controlled by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spb_schools TO authenticated;
GRANT SELECT ON public.spb_school_admins TO authenticated;

-- ============================================================================
-- PART 9: Helper Functions
-- ============================================================================

-- Function to check if a user is a school admin for a specific school
CREATE OR REPLACE FUNCTION public.is_school_admin(school_slug_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.spb_school_admins
    WHERE user_id = auth.uid()
      AND school_slug = school_slug_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user can access a school (school admin OR district admin)
CREATE OR REPLACE FUNCTION public.can_access_school(school_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if system admin
  IF (auth.jwt() -> 'user_metadata' ->> 'role' = 'system_admin' OR
      auth.jwt() -> 'app_metadata' ->> 'role' = 'system_admin') THEN
    RETURN TRUE;
  END IF;

  -- Check if school admin
  IF EXISTS (
    SELECT 1 FROM public.spb_school_admins
    WHERE user_id = auth.uid() AND school_id = school_id_param
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check if district admin
  IF EXISTS (
    SELECT 1 FROM public.spb_district_admins da
    JOIN public.spb_schools s ON s.district_id = da.district_id
    WHERE da.user_id = auth.uid() AND s.id = school_id_param
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get schools for a district
CREATE OR REPLACE FUNCTION public.get_district_schools(district_slug_param TEXT)
RETURNS SETOF public.spb_schools AS $$
BEGIN
  RETURN QUERY
  SELECT s.*
  FROM public.spb_schools s
  JOIN public.spb_districts d ON d.id = s.district_id
  WHERE d.slug = district_slug_param
    AND (s.is_public = true OR can_access_school(s.id))
  ORDER BY s.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 10: Seed Westside Schools (13 schools)
-- ============================================================================

-- Insert Westside's 13 schools
INSERT INTO public.spb_schools (district_id, name, slug, is_public, description)
SELECT
  id,
  'Hillside Elementary School',
  'hillside-elementary',
  true,
  'Serving students in grades K-5'
FROM public.spb_districts WHERE slug = 'westside'
ON CONFLICT (district_id, slug) DO NOTHING;

INSERT INTO public.spb_schools (district_id, name, slug, is_public, description)
SELECT
  id,
  'Loveland Elementary School',
  'loveland-elementary',
  true,
  'Serving students in grades K-5'
FROM public.spb_districts WHERE slug = 'westside'
ON CONFLICT (district_id, slug) DO NOTHING;

INSERT INTO public.spb_schools (district_id, name, slug, is_public, description)
SELECT
  id,
  'Oakdale Elementary School',
  'oakdale-elementary',
  true,
  'Serving students in grades K-5'
FROM public.spb_districts WHERE slug = 'westside'
ON CONFLICT (district_id, slug) DO NOTHING;

INSERT INTO public.spb_schools (district_id, name, slug, is_public, description)
SELECT
  id,
  'Paddock Road Elementary School',
  'paddock-road-elementary',
  true,
  'Serving students in grades K-5'
FROM public.spb_districts WHERE slug = 'westside'
ON CONFLICT (district_id, slug) DO NOTHING;

INSERT INTO public.spb_schools (district_id, name, slug, is_public, description)
SELECT
  id,
  'Rockbrook Elementary School',
  'rockbrook-elementary',
  true,
  'Serving students in grades K-5'
FROM public.spb_districts WHERE slug = 'westside'
ON CONFLICT (district_id, slug) DO NOTHING;

INSERT INTO public.spb_schools (district_id, name, slug, is_public, description)
SELECT
  id,
  'Sunset Hills Elementary School',
  'sunset-hills-elementary',
  true,
  'Serving students in grades K-5'
FROM public.spb_districts WHERE slug = 'westside'
ON CONFLICT (district_id, slug) DO NOTHING;

INSERT INTO public.spb_schools (district_id, name, slug, is_public, description)
SELECT
  id,
  'Westbrook Elementary School',
  'westbrook-elementary',
  true,
  'Serving students in grades K-5'
FROM public.spb_districts WHERE slug = 'westside'
ON CONFLICT (district_id, slug) DO NOTHING;

INSERT INTO public.spb_schools (district_id, name, slug, is_public, description)
SELECT
  id,
  'Western Hills Elementary School',
  'western-hills-elementary',
  true,
  'Serving students in grades K-5'
FROM public.spb_districts WHERE slug = 'westside'
ON CONFLICT (district_id, slug) DO NOTHING;

INSERT INTO public.spb_schools (district_id, name, slug, is_public, description)
SELECT
  id,
  'Westside Middle School',
  'westside-middle-school',
  true,
  'Serving students in grades 6-8'
FROM public.spb_districts WHERE slug = 'westside'
ON CONFLICT (district_id, slug) DO NOTHING;

INSERT INTO public.spb_schools (district_id, name, slug, is_public, description)
SELECT
  id,
  'Westside High School',
  'westside-high-school',
  true,
  'Serving students in grades 9-12'
FROM public.spb_districts WHERE slug = 'westside'
ON CONFLICT (district_id, slug) DO NOTHING;

INSERT INTO public.spb_schools (district_id, name, slug, is_public, description)
SELECT
  id,
  'Westside High School West Campus',
  'westside-high-school-west-campus',
  true,
  'Alternative high school campus'
FROM public.spb_districts WHERE slug = 'westside'
ON CONFLICT (district_id, slug) DO NOTHING;

INSERT INTO public.spb_schools (district_id, name, slug, is_public, description)
SELECT
  id,
  'Westwood Elementary School',
  'westwood-elementary',
  true,
  'Serving students in grades K-5'
FROM public.spb_districts WHERE slug = 'westside'
ON CONFLICT (district_id, slug) DO NOTHING;

INSERT INTO public.spb_schools (district_id, name, slug, is_public, description)
SELECT
  id,
  'Willowdale Elementary School',
  'willowdale-elementary',
  true,
  'Serving students in grades K-5'
FROM public.spb_districts WHERE slug = 'westside'
ON CONFLICT (district_id, slug) DO NOTHING;

-- Migration 017: Add schools and school admins functionality
-- Enables multi-school support with independent goals per school
