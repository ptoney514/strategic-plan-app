-- Migration 023: Add Plans Entity
-- Purpose: Allow grouping objectives under named plans (e.g., "2025 Strategic Plan")
-- Date: 2026-01-19

-- ============================================================================
-- PART 1: Create Plans Table
-- ============================================================================

-- Create plans table as top-level containers for objectives
CREATE TABLE IF NOT EXISTS public.spb_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership (mutually exclusive: district OR school)
  district_id UUID REFERENCES public.spb_districts(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.spb_schools(id) ON DELETE CASCADE,

  -- Plan details
  name VARCHAR NOT NULL,                    -- e.g., "2025 Strategic Plan"
  slug VARCHAR NOT NULL,                    -- e.g., "2025-strategic-plan"
  type_label VARCHAR,                       -- Free-form: "Strategic", "Functional", "Annual", etc.
  description TEXT,

  -- Visibility and status
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,           -- Allow archiving old plans

  -- Date range (optional)
  start_date DATE,
  end_date DATE,

  -- Display options
  order_position INTEGER DEFAULT 0,
  cover_image_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT plans_owner_check CHECK (
    (district_id IS NOT NULL AND school_id IS NULL) OR
    (district_id IS NULL AND school_id IS NOT NULL)
  )
);

-- Unique constraint: slug must be unique within district
CREATE UNIQUE INDEX IF NOT EXISTS idx_plans_district_slug
  ON public.spb_plans(district_id, slug)
  WHERE district_id IS NOT NULL;

-- Unique constraint: slug must be unique within school
CREATE UNIQUE INDEX IF NOT EXISTS idx_plans_school_slug
  ON public.spb_plans(school_id, slug)
  WHERE school_id IS NOT NULL;

-- ============================================================================
-- PART 2: Add plan_id to Goals Table
-- ============================================================================

-- Add plan_id column to goals (nullable for backward compatibility)
ALTER TABLE public.spb_goals
  ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.spb_plans(id) ON DELETE CASCADE;

-- Create index for plan filtering
CREATE INDEX IF NOT EXISTS idx_goals_plan_id ON public.spb_goals(plan_id);

-- Add comment
COMMENT ON COLUMN public.spb_goals.plan_id IS 'Plan this objective belongs to (only used for level 0 goals)';

-- ============================================================================
-- PART 3: Create Indexes for Plans Table
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_plans_district_id ON public.spb_plans(district_id);
CREATE INDEX IF NOT EXISTS idx_plans_school_id ON public.spb_plans(school_id);
CREATE INDEX IF NOT EXISTS idx_plans_is_public ON public.spb_plans(is_public);
CREATE INDEX IF NOT EXISTS idx_plans_is_active ON public.spb_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_plans_order_position ON public.spb_plans(order_position);

-- Add comments
COMMENT ON TABLE public.spb_plans IS 'Strategic plans that group objectives (e.g., 2025 Strategic Plan)';
COMMENT ON COLUMN public.spb_plans.district_id IS 'District that owns this plan (mutually exclusive with school_id)';
COMMENT ON COLUMN public.spb_plans.school_id IS 'School that owns this plan (mutually exclusive with district_id)';
COMMENT ON COLUMN public.spb_plans.type_label IS 'Free-form plan type label (Strategic, Functional, Annual, etc.)';
COMMENT ON COLUMN public.spb_plans.is_active IS 'Active plans are shown by default; inactive plans are archived';

-- ============================================================================
-- PART 4: Enable RLS on Plans Table
-- ============================================================================

ALTER TABLE public.spb_plans ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 5: Create RLS Policies for Plans
-- ============================================================================

-- Public read access to public plans in public districts
CREATE POLICY "Public district plans are viewable by everyone"
  ON public.spb_plans FOR SELECT
  USING (
    is_public = true
    AND district_id IS NOT NULL
    AND district_id IN (SELECT id FROM public.spb_districts WHERE is_public = true)
  );

-- Public read access to public plans in public schools
CREATE POLICY "Public school plans are viewable by everyone"
  ON public.spb_plans FOR SELECT
  USING (
    is_public = true
    AND school_id IS NOT NULL
    AND school_id IN (SELECT id FROM public.spb_schools WHERE is_public = true)
  );

-- System admins have full access
CREATE POLICY "System admins have full access to plans"
  ON public.spb_plans FOR ALL
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'system_admin'
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'system_admin'
  );

-- District admins can view their district plans
CREATE POLICY "District admins can view their district plans"
  ON public.spb_plans FOR SELECT
  USING (
    district_id IN (
      SELECT district_id FROM public.spb_district_admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "District admins can insert plans in their district"
  ON public.spb_plans FOR INSERT
  WITH CHECK (
    district_id IN (
      SELECT district_id FROM public.spb_district_admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "District admins can update plans in their district"
  ON public.spb_plans FOR UPDATE
  USING (
    district_id IN (
      SELECT district_id FROM public.spb_district_admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "District admins can delete plans in their district"
  ON public.spb_plans FOR DELETE
  USING (
    district_id IN (
      SELECT district_id FROM public.spb_district_admins
      WHERE user_id = auth.uid()
    )
  );

-- School admins can manage their school's plans
CREATE POLICY "School admins can view their school plans"
  ON public.spb_plans FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM public.spb_school_admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "School admins can insert plans in their school"
  ON public.spb_plans FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM public.spb_school_admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "School admins can update plans in their school"
  ON public.spb_plans FOR UPDATE
  USING (
    school_id IN (
      SELECT school_id FROM public.spb_school_admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "School admins can delete plans in their school"
  ON public.spb_plans FOR DELETE
  USING (
    school_id IN (
      SELECT school_id FROM public.spb_school_admins
      WHERE user_id = auth.uid()
    )
  );

-- District admins can view and manage school plans in their district
CREATE POLICY "District admins can view school plans in their district"
  ON public.spb_plans FOR SELECT
  USING (
    school_id IN (
      SELECT id FROM public.spb_schools
      WHERE district_id IN (
        SELECT district_id FROM public.spb_district_admins
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "District admins can insert school plans in their district"
  ON public.spb_plans FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT id FROM public.spb_schools
      WHERE district_id IN (
        SELECT district_id FROM public.spb_district_admins
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "District admins can update school plans in their district"
  ON public.spb_plans FOR UPDATE
  USING (
    school_id IN (
      SELECT id FROM public.spb_schools
      WHERE district_id IN (
        SELECT district_id FROM public.spb_district_admins
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "District admins can delete school plans in their district"
  ON public.spb_plans FOR DELETE
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
-- PART 6: Grant Permissions
-- ============================================================================

GRANT SELECT ON public.spb_plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spb_plans TO authenticated;

-- ============================================================================
-- PART 7: Auto-Migration - Create Default Plans for Existing Data
-- ============================================================================

-- Create default plan for each district that has objectives
INSERT INTO public.spb_plans (district_id, name, slug, type_label, description, is_public, is_active)
SELECT DISTINCT
  g.district_id,
  'Strategic Plan',
  'strategic-plan',
  'Strategic',
  'Default strategic plan (auto-generated during migration)',
  true,
  true
FROM public.spb_goals g
WHERE g.district_id IS NOT NULL
  AND g.level = 0
  AND g.school_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.spb_plans p
    WHERE p.district_id = g.district_id AND p.slug = 'strategic-plan'
  );

-- Create default plan for each school that has objectives
INSERT INTO public.spb_plans (school_id, name, slug, type_label, description, is_public, is_active)
SELECT DISTINCT
  g.school_id,
  'Strategic Plan',
  'strategic-plan',
  'Strategic',
  'Default strategic plan (auto-generated during migration)',
  true,
  true
FROM public.spb_goals g
WHERE g.school_id IS NOT NULL
  AND g.level = 0
  AND NOT EXISTS (
    SELECT 1 FROM public.spb_plans p
    WHERE p.school_id = g.school_id AND p.slug = 'strategic-plan'
  );

-- Assign existing district objectives to default plans
UPDATE public.spb_goals g
SET plan_id = p.id
FROM public.spb_plans p
WHERE g.district_id = p.district_id
  AND g.level = 0
  AND g.school_id IS NULL
  AND g.plan_id IS NULL
  AND p.slug = 'strategic-plan';

-- Assign existing school objectives to default plans
UPDATE public.spb_goals g
SET plan_id = p.id
FROM public.spb_plans p
WHERE g.school_id = p.school_id
  AND g.level = 0
  AND g.plan_id IS NULL
  AND p.slug = 'strategic-plan';

-- ============================================================================
-- PART 8: Helper Functions
-- ============================================================================

-- Function to generate unique plan slug
CREATE OR REPLACE FUNCTION public.generate_plan_slug(
  plan_name TEXT,
  owner_district_id UUID DEFAULT NULL,
  owner_school_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug from name
  base_slug := lower(regexp_replace(plan_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;

  -- Check for uniqueness and increment if needed
  LOOP
    IF owner_district_id IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.spb_plans
        WHERE district_id = owner_district_id AND slug = final_slug
      ) THEN
        RETURN final_slug;
      END IF;
    ELSIF owner_school_id IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.spb_plans
        WHERE school_id = owner_school_id AND slug = final_slug
      ) THEN
        RETURN final_slug;
      END IF;
    ELSE
      -- No owner specified, just return base slug
      RETURN final_slug;
    END IF;

    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can access a plan
CREATE OR REPLACE FUNCTION public.can_access_plan(plan_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  plan_record RECORD;
BEGIN
  -- Get the plan
  SELECT district_id, school_id, is_public INTO plan_record
  FROM public.spb_plans WHERE id = plan_id_param;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check if system admin
  IF (auth.jwt() -> 'user_metadata' ->> 'role' = 'system_admin' OR
      auth.jwt() -> 'app_metadata' ->> 'role' = 'system_admin') THEN
    RETURN TRUE;
  END IF;

  -- Check if plan is public
  IF plan_record.is_public THEN
    IF plan_record.district_id IS NOT NULL THEN
      IF EXISTS (SELECT 1 FROM public.spb_districts WHERE id = plan_record.district_id AND is_public = true) THEN
        RETURN TRUE;
      END IF;
    ELSIF plan_record.school_id IS NOT NULL THEN
      IF EXISTS (SELECT 1 FROM public.spb_schools WHERE id = plan_record.school_id AND is_public = true) THEN
        RETURN TRUE;
      END IF;
    END IF;
  END IF;

  -- Check if district admin
  IF plan_record.district_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.spb_district_admins
      WHERE user_id = auth.uid() AND district_id = plan_record.district_id
    ) THEN
      RETURN TRUE;
    END IF;
  END IF;

  -- Check if school admin
  IF plan_record.school_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.spb_school_admins
      WHERE user_id = auth.uid() AND school_id = plan_record.school_id
    ) THEN
      RETURN TRUE;
    END IF;

    -- District admins can also access school plans
    IF EXISTS (
      SELECT 1 FROM public.spb_district_admins da
      JOIN public.spb_schools s ON s.district_id = da.district_id
      WHERE da.user_id = auth.uid() AND s.id = plan_record.school_id
    ) THEN
      RETURN TRUE;
    END IF;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get plans for a district by slug
CREATE OR REPLACE FUNCTION public.get_district_plans(district_slug_param TEXT)
RETURNS SETOF public.spb_plans AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM public.spb_plans p
  JOIN public.spb_districts d ON d.id = p.district_id
  WHERE d.slug = district_slug_param
    AND p.is_active = true
    AND (p.is_public = true OR EXISTS (
      SELECT 1 FROM public.spb_district_admins da
      WHERE da.district_id = p.district_id AND da.user_id = auth.uid()
    ))
  ORDER BY p.order_position, p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to count objectives in a plan
CREATE OR REPLACE FUNCTION public.get_plan_objective_count(plan_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.spb_goals
    WHERE plan_id = plan_id_param AND level = 0
  );
END;
$$ LANGUAGE plpgsql;

-- Log success message
DO $$
BEGIN
  RAISE NOTICE 'Migration 023: Plans entity created successfully';
  RAISE NOTICE 'Default plans created for existing objectives';
END $$;

-- Migration 023: Add plans entity
-- Enables grouping objectives under named strategic plans
