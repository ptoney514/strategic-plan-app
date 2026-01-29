#!/bin/bash
# Setup staging Supabase project
# Usage: ./scripts/setup-staging.sh <project-ref>

set -e

PROJECT_REF=$1

if [ -z "$PROJECT_REF" ]; then
  echo "Usage: ./scripts/setup-staging.sh <project-ref>"
  echo ""
  echo "Get your project ref from the Supabase dashboard URL:"
  echo "  supabase.com/dashboard/project/<PROJECT_REF>"
  echo ""
  exit 1
fi

echo "=== Setting up Staging Environment ==="
echo ""

# Step 1: Link to staging project
echo "Step 1: Linking to staging project..."
supabase link --project-ref "$PROJECT_REF"

# Step 2: Push migrations
echo ""
echo "Step 2: Pushing migrations to staging..."
supabase db push

# Step 3: Get project info
echo ""
echo "Step 3: Getting project credentials..."
echo ""
echo "=== STAGING SETUP COMPLETE ==="
echo ""
echo "Next steps:"
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/settings/api"
echo "2. Copy the 'anon public' key"
echo "3. Create .env.staging with:"
echo ""
echo "   VITE_SUPABASE_URL=https://$PROJECT_REF.supabase.co"
echo "   VITE_SUPABASE_ANON_KEY=<paste-anon-key-here>"
echo ""
echo "4. To seed staging data, run:"
echo "   supabase db seed --linked"
echo ""
echo "5. To create test users on staging, use Supabase Dashboard:"
echo "   https://supabase.com/dashboard/project/$PROJECT_REF/auth/users"
echo ""
