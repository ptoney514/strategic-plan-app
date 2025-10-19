-- Migration 018: Add District Admins Table and Production RLS Policies
-- Purpose: Implement proper authentication and authorization for admin access
-- Date: 2025-10-18

-- ============================================================================
-- PART 1: Create District Admins Junction Table
-- ============================================================================

-- Create district admins table for managing who can administer which districts
CREATE TABLE IF NOT EXISTS public.spb_district_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  district_id UUID NOT NULL REFERENCES public.spb_districts(id) ON DELETE CASCADE,
  district_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, district_id)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_district_admins_user_id ON public.spb_district_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_district_admins_district_id ON public.spb_district_admins(district_id);
CREATE INDEX IF NOT EXISTS idx_district_admins_district_slug ON public.spb_district_admins(district_slug);

-- Add comments
COMMENT ON TABLE public.spb_district_admins IS 'Junction table managing which users can administer which districts';
COMMENT ON COLUMN public.spb_district_admins.user_id IS 'User who has admin access';
COMMENT ON COLUMN public.spb_district_admins.district_id IS 'District the user can administer';
COMMENT ON COLUMN public.spb_district_admins.district_slug IS 'Denormalized district slug for faster lookups';

-- ============================================================================
-- PART 2: Drop Development RLS Policies
-- ============================================================================

-- Drop overly permissive development policies
DROP POLICY IF EXISTS "Enable all access for development" ON public.spb_districts;
DROP POLICY IF EXISTS "Enable all access for development" ON public.spb_goals;
DROP POLICY IF EXISTS "Enable all access for development" ON public.spb_metrics;

-- ============================================================================
-- PART 3: Create Production RLS Policies
-- ============================================================================

-- Districts Table Policies
-- -----------------------

-- Public read access to public districts
CREATE POLICY "Public districts are viewable by everyone"
  ON public.spb_districts FOR SELECT
  USING (is_public = true);

-- System admins have full access
CREATE POLICY "System admins have full access to districts"
  ON public.spb_districts FOR ALL
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'system_admin'
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'system_admin'
  );

-- District admins can view and update their districts
CREATE POLICY "District admins can view their districts"
  ON public.spb_districts FOR SELECT
  USING (
    id IN (
      SELECT district_id FROM public.spb_district_admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "District admins can update their districts"
  ON public.spb_districts FOR UPDATE
  USING (
    id IN (
      SELECT district_id FROM public.spb_district_admins
      WHERE user_id = auth.uid()
    )
  );

-- Goals Table Policies
-- --------------------

-- Public read access to goals from public districts
CREATE POLICY "Public district goals are viewable"
  ON public.spb_goals FOR SELECT
  USING (
    district_id IN (
      SELECT id FROM public.spb_districts WHERE is_public = true
    )
  );

-- System admins have full access
CREATE POLICY "System admins have full access to goals"
  ON public.spb_goals FOR ALL
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'system_admin'
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'system_admin'
  );

-- District admins can manage goals in their districts
CREATE POLICY "District admins can view their district goals"
  ON public.spb_goals FOR SELECT
  USING (
    district_id IN (
      SELECT district_id FROM public.spb_district_admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "District admins can insert goals in their districts"
  ON public.spb_goals FOR INSERT
  WITH CHECK (
    district_id IN (
      SELECT district_id FROM public.spb_district_admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "District admins can update goals in their districts"
  ON public.spb_goals FOR UPDATE
  USING (
    district_id IN (
      SELECT district_id FROM public.spb_district_admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "District admins can delete goals in their districts"
  ON public.spb_goals FOR DELETE
  USING (
    district_id IN (
      SELECT district_id FROM public.spb_district_admins
      WHERE user_id = auth.uid()
    )
  );

-- Metrics Table Policies
-- ----------------------

-- Public read access to metrics from public district goals
CREATE POLICY "Public district metrics are viewable"
  ON public.spb_metrics FOR SELECT
  USING (
    goal_id IN (
      SELECT id FROM public.spb_goals
      WHERE district_id IN (
        SELECT id FROM public.spb_districts WHERE is_public = true
      )
    )
  );

-- System admins have full access
CREATE POLICY "System admins have full access to metrics"
  ON public.spb_metrics FOR ALL
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'system_admin'
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'system_admin'
  );

-- District admins can manage metrics in their districts
CREATE POLICY "District admins can view metrics in their districts"
  ON public.spb_metrics FOR SELECT
  USING (
    goal_id IN (
      SELECT id FROM public.spb_goals
      WHERE district_id IN (
        SELECT district_id FROM public.spb_district_admins
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "District admins can insert metrics in their districts"
  ON public.spb_metrics FOR INSERT
  WITH CHECK (
    goal_id IN (
      SELECT id FROM public.spb_goals
      WHERE district_id IN (
        SELECT district_id FROM public.spb_district_admins
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "District admins can update metrics in their districts"
  ON public.spb_metrics FOR UPDATE
  USING (
    goal_id IN (
      SELECT id FROM public.spb_goals
      WHERE district_id IN (
        SELECT district_id FROM public.spb_district_admins
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "District admins can delete metrics in their districts"
  ON public.spb_metrics FOR DELETE
  USING (
    goal_id IN (
      SELECT id FROM public.spb_goals
      WHERE district_id IN (
        SELECT district_id FROM public.spb_district_admins
        WHERE user_id = auth.uid()
      )
    )
  );

-- District Admins Table Policies
-- ------------------------------

-- Only system admins can manage district admins
CREATE POLICY "System admins can manage district admins"
  ON public.spb_district_admins FOR ALL
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'system_admin'
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'system_admin'
  );

-- Users can view their own admin assignments
CREATE POLICY "Users can view their own admin assignments"
  ON public.spb_district_admins FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================================
-- PART 4: Revoke Excessive Anonymous Grants
-- ============================================================================

-- Revoke all access from anonymous users
REVOKE ALL ON public.spb_districts FROM anon;
REVOKE ALL ON public.spb_goals FROM anon;
REVOKE ALL ON public.spb_metrics FROM anon;
REVOKE ALL ON public.spb_district_admins FROM anon;

-- Grant read-only access to anon (handled by RLS policies above)
GRANT SELECT ON public.spb_districts TO anon;
GRANT SELECT ON public.spb_goals TO anon;
GRANT SELECT ON public.spb_metrics TO anon;

-- Authenticated users need read/write (controlled by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spb_districts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spb_goals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spb_metrics TO authenticated;
GRANT SELECT ON public.spb_district_admins TO authenticated;

-- ============================================================================
-- PART 5: Helper Function for Admin Check
-- ============================================================================

-- Function to check if a user is a district admin
CREATE OR REPLACE FUNCTION public.is_district_admin(district_slug_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.spb_district_admins
    WHERE user_id = auth.uid()
      AND district_slug = district_slug_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is a system admin
CREATE OR REPLACE FUNCTION public.is_system_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'system_admin'
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'system_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 6: Sample Data (for development/testing)
-- ============================================================================

-- Add a test system admin user mapping (update with real user_id from auth.users)
-- UNCOMMENT AND UPDATE AFTER CREATING YOUR FIRST USER:
-- INSERT INTO public.spb_district_admins (user_id, district_id, district_slug)
-- SELECT
--   'YOUR_USER_ID_HERE'::uuid,
--   id,
--   slug
-- FROM public.spb_districts
-- WHERE slug = 'westside'
-- ON CONFLICT (user_id, district_id) DO NOTHING;

-- Migration 018: Add district admins table and production RLS policies
-- Replaces development "USING (true)" policies with proper auth checks
