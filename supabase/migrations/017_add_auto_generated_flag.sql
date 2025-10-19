-- Migration: Add auto-generated flag and auto-fix suggestions to staged goals
-- Purpose: Track which goals were auto-created vs uploaded from Excel and store fix suggestions

ALTER TABLE public.spb_staged_goals
ADD COLUMN IF NOT EXISTS is_auto_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_fix_suggestions JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.spb_staged_goals.is_auto_generated IS 'Whether this goal was auto-generated (e.g., missing parent placeholder)';
COMMENT ON COLUMN public.spb_staged_goals.auto_fix_suggestions IS 'Array of auto-fix suggestions for validation issues';
