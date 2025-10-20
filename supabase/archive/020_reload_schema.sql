-- Reload schema cache after Westside public fix
NOTIFY pgrst, 'reload schema';

SELECT 'Schema reloaded after Westside public fix' as status;
