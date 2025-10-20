#!/bin/bash
# List all users who are district admins
# Usage: ./scripts/list-district-admins.sh

echo "=== District Admins Report ==="
echo ""

docker exec -i supabase_db_strategic-plan-vite psql -U postgres -d postgres <<'EOF'
-- Show all district admins with their details
SELECT
  u.email,
  u.created_at::date as user_created,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  d.name as district_name,
  d.slug as district_slug,
  da.created_at::date as admin_since
FROM auth.users u
JOIN public.spb_district_admins da ON u.id = da.user_id
JOIN public.spb_districts d ON da.district_id = d.id
ORDER BY d.slug, u.email;
EOF

echo ""
echo "=== Summary by District ==="
echo ""

docker exec -i supabase_db_strategic-plan-vite psql -U postgres -d postgres <<'EOF'
-- Count admins per district
SELECT
  d.slug as district_slug,
  d.name as district_name,
  COUNT(da.user_id) as admin_count
FROM public.spb_districts d
LEFT JOIN public.spb_district_admins da ON d.id = da.district_id
GROUP BY d.id, d.slug, d.name
ORDER BY d.slug;
EOF

echo ""
echo "=== Users Without District Access ==="
echo ""

docker exec -i supabase_db_strategic-plan-vite psql -U postgres -d postgres <<'EOF'
-- Show users who don't have any district admin access
SELECT
  u.email,
  u.created_at::date as created,
  u.email_confirmed_at IS NOT NULL as confirmed
FROM auth.users u
LEFT JOIN public.spb_district_admins da ON u.id = da.user_id
WHERE da.user_id IS NULL
ORDER BY u.created_at DESC;
EOF
