-- V2 Cutover: Drop v1 tables and columns
-- This migration removes schools, metrics, and related tables that are no longer used in v2.

-- Drop v1 tables (CASCADE to handle any remaining FK references)
DROP TABLE IF EXISTS "metric_time_series" CASCADE;
DROP TABLE IF EXISTS "metrics" CASCADE;
DROP TABLE IF EXISTS "school_admins" CASCADE;
DROP TABLE IF EXISTS "schools" CASCADE;
DROP TABLE IF EXISTS "staged_metrics" CASCADE;
DROP TABLE IF EXISTS "status_overrides" CASCADE;
DROP TABLE IF EXISTS "stock_photos" CASCADE;

-- Drop school_id from plans
ALTER TABLE "plans" DROP COLUMN IF EXISTS "school_id";

-- Drop indexes related to school_id on plans
DROP INDEX IF EXISTS "plans_school_slug_idx";
DROP INDEX IF EXISTS "plans_school_id_idx";

-- Drop columns from goals (v1 fields no longer used)
ALTER TABLE "goals" DROP COLUMN IF EXISTS "school_id";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "calculated_status";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "status_source";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "status_override_reason";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "status_override_by";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "status_override_at";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "status_override_expires";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "status_calculation_confidence";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "status_last_calculated";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "overall_progress_override";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "overall_progress_custom_value";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "overall_progress_source";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "overall_progress_last_calculated";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "overall_progress_override_by";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "overall_progress_override_at";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "overall_progress_override_reason";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "image_url";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "header_color";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "cover_photo_url";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "cover_photo_alt";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "color";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "show_progress_bar";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "department";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "start_date";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "end_date";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "executive_summary";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "indicator_text";
ALTER TABLE "goals" DROP COLUMN IF EXISTS "indicator_color";

-- Drop school_id index on goals
DROP INDEX IF EXISTS "goals_school_id_idx";
