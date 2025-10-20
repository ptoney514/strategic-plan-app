-- Migration 021: Grant anon SELECT on spb_district_admins for RLS evaluation
-- Fixes "permission denied" error when anonymous users access districts

-- The RLS policies on spb_districts reference spb_district_admins in their
-- USING clauses. For these policies to evaluate correctly for anonymous users,
-- the anon role needs SELECT permission on spb_district_admins.

-- Grant SELECT permission to anon role
GRANT SELECT ON public.spb_district_admins TO anon;

-- Verify the grant
SELECT
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants
WHERE table_name = 'spb_district_admins'
  AND grantee IN ('anon', 'authenticated')
ORDER BY grantee;

SELECT 'anon can now query spb_district_admins for RLS evaluation' as status;
