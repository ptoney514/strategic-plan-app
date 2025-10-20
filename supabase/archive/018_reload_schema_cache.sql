-- Temporary Migration: Reload schema cache after constraint fix
-- This will be removed after execution

-- Verify the constraint is correct
SELECT
  con.conname as constraint_name,
  pg_get_constraintdef(con.oid) as definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'spb_metrics'
  AND con.conname = 'spb_metrics_visualization_type_check';

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

-- Success
SELECT 'Schema cache reloaded!' as status;
