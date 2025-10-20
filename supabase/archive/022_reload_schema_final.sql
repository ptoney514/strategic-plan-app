-- Reload schema cache after granting anon permissions
NOTIFY pgrst, 'reload schema';

SELECT 'Schema reloaded - anonymous users can now access public districts' as status;
