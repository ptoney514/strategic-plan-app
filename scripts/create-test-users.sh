#!/bin/bash

# Create Test Users for Local Development
# This script creates test users and assigns them district admin permissions

set -e  # Exit on error

echo "🔐 Creating test users for local Supabase..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

CONTAINER="supabase_db_strategic-plan-vite"

echo -e "${BLUE}Creating test users...${NC}"

# Execute SQL to create users
docker exec -i $CONTAINER psql -U postgres -d postgres << 'EOF'

-- First, delete existing test users if they exist (for clean slate)
DELETE FROM spb_district_admins WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('admin@westside66.org', 'admin@eastside.edu')
);
DELETE FROM auth.identities WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('admin@westside66.org', 'admin@eastside.edu')
);
DELETE FROM auth.users WHERE email IN ('admin@westside66.org', 'admin@eastside.edu');

-- Now create fresh test users
DO $$
DECLARE
  westside_user_id uuid := gen_random_uuid();
  eastside_user_id uuid := gen_random_uuid();
  westside_district_id uuid;
  eastside_district_id uuid;
BEGIN
  -- Get district IDs
  SELECT id INTO westside_district_id FROM spb_districts WHERE slug = 'westside';
  SELECT id INTO eastside_district_id FROM spb_districts WHERE slug = 'eastside';

  -- Create Westside Admin
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    westside_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@westside66.org',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"district_admin"}',
    NOW(),
    NOW(),
    '',
    ''
  );

  -- Create Eastside Admin
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    eastside_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@eastside.edu',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"district_admin"}',
    NOW(),
    NOW(),
    '',
    ''
  );

  -- Assign Westside Admin to Westside District
  INSERT INTO spb_district_admins (user_id, district_id, district_slug)
  VALUES (westside_user_id, westside_district_id, 'westside');

  -- Assign Eastside Admin to Eastside District
  INSERT INTO spb_district_admins (user_id, district_id, district_slug)
  VALUES (eastside_user_id, eastside_district_id, 'eastside');

  -- Create identities for email auth (Supabase requires provider_id = user_id for email provider)
  INSERT INTO auth.identities (
    provider_id,
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    westside_user_id::text,  -- provider_id is the user_id as string for email provider
    gen_random_uuid(),
    westside_user_id,
    jsonb_build_object('sub', westside_user_id::text, 'email', 'admin@westside66.org', 'email_verified', true, 'provider', 'email'),
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  INSERT INTO auth.identities (
    provider_id,
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    eastside_user_id::text,
    gen_random_uuid(),
    eastside_user_id,
    jsonb_build_object('sub', eastside_user_id::text, 'email', 'admin@eastside.edu', 'email_verified', true, 'provider', 'email'),
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Test users created successfully!';
  RAISE NOTICE 'Westside Admin: admin@westside66.org / password123';
  RAISE NOTICE 'Eastside Admin: admin@eastside.edu / password123';
END $$;

-- Verify users were created
\echo ''
\echo '✅ Verification:'
SELECT
  u.email,
  CASE WHEN u.email_confirmed_at IS NOT NULL THEN 'Yes' ELSE 'No' END as confirmed,
  da.district_slug as "assigned_district"
FROM auth.users u
LEFT JOIN spb_district_admins da ON u.id = da.user_id
WHERE u.email IN ('admin@westside66.org', 'admin@eastside.edu')
ORDER BY u.email;

EOF

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ Test users created successfully!${NC}"
  echo ""
  echo -e "${YELLOW}📋 Test Credentials:${NC}"
  echo -e "  ${GREEN}Westside Admin:${NC}"
  echo -e "    Email:    ${BLUE}admin@westside66.org${NC}"
  echo -e "    Password: ${BLUE}password123${NC}"
  echo ""
  echo -e "  ${GREEN}Eastside Admin:${NC}"
  echo -e "    Email:    ${BLUE}admin@eastside.edu${NC}"
  echo -e "    Password: ${BLUE}password123${NC}"
  echo ""
  echo -e "${BLUE}🔗 Login at: http://localhost:5173/login${NC}"
else
  echo -e "${RED}❌ Error creating test users${NC}"
  exit 1
fi
