#!/bin/bash
# Database Migration Smoke Tests
# Verifies database state after migrations + seed data have been applied
# Usage: ./scripts/test-migrations.sh
# Requires: Supabase running locally (npm run db:start)

set -e  # Exit on first error

# Database connection URL
SUPABASE_DB_URL=${SUPABASE_DB_URL:-"postgresql://postgres:postgres@127.0.0.1:54322/postgres"}

# Counters for summary
errors=0
warnings=0
checks_passed=0

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function to run SQL query and return result
run_query() {
  local query="$1"
  psql "$SUPABASE_DB_URL" -t -A -c "$query" 2>&1
}

# Helper function to check if query succeeds (returns 0 for success)
check_query_succeeds() {
  local query="$1"
  if psql "$SUPABASE_DB_URL" -t -A -c "$query" >/dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

# Helper function to print section header
print_section() {
  echo -e "\n${BLUE}📋 $1${NC}"
}

# Helper function to print success
print_success() {
  echo -e "   ${GREEN}✅${NC} $1"
  ((checks_passed++))
}

# Helper function to print error
print_error() {
  echo -e "   ${RED}❌${NC} $1"
  ((errors++))
}

# Helper function to print warning
print_warning() {
  echo -e "   ${YELLOW}⚠️${NC}  $1"
  ((warnings++))
}

# Check if PostgreSQL is accessible
if ! check_query_succeeds "SELECT 1;"; then
  echo -e "${RED}❌ Cannot connect to database at $SUPABASE_DB_URL${NC}"
  echo "   Make sure Supabase is running: npm run db:start"
  exit 1
fi

echo "🔍 Running Database Migration Smoke Tests..."
echo "   Database: $SUPABASE_DB_URL"

# ============================================================================
# SECTION 1: Table Existence (CRITICAL)
# ============================================================================
print_section "Section 1: Verifying critical tables exist..."

tables=(
  "spb_districts"
  "spb_goals"
  "spb_metrics"
  "spb_metric_time_series"
  "spb_metric_narratives"
  "spb_status_overrides"
  "spb_stock_photos"
  "spb_district_admins"
  "spb_schools"
  "spb_school_admins"
)

for table in "${tables[@]}"; do
  if check_query_succeeds "SELECT 1 FROM public.$table LIMIT 1;"; then
    print_success "$table exists"
  else
    print_error "$table does not exist or is not accessible"
  fi
done

# ============================================================================
# SECTION 2: Seed Data Verification (HIGH)
# ============================================================================
print_section "Section 2: Verifying seed data loaded..."

# Helper function to check row count
check_row_count() {
  local table="$1"
  local condition="${2:-1=1}"  # Default to no condition
  local min_expected="$3"
  local max_expected="${4:-$min_expected}"
  local description="$5"

  count=$(run_query "SELECT COUNT(*) FROM public.$table WHERE $condition;")

  if [[ ! "$count" =~ ^[0-9]+$ ]]; then
    print_error "$description - Query failed: $count"
    return 1
  fi

  if [ "$count" -ge "$min_expected" ] && [ "$count" -le "$max_expected" ]; then
    if [ "$min_expected" -eq "$max_expected" ]; then
      print_success "$description: $count (expected $min_expected)"
    else
      print_success "$description: $count (expected $min_expected-$max_expected)"
    fi
  else
    if [ "$min_expected" -eq "$max_expected" ]; then
      print_error "$description: $count (expected $min_expected)"
    else
      print_error "$description: $count (expected $min_expected-$max_expected)"
    fi
  fi
}

# Check districts
check_row_count "spb_districts" "1=1" 2 2 "Districts"

# Check Westside district exists
westside_exists=$(run_query "SELECT COUNT(*) FROM public.spb_districts WHERE slug = 'westside';")
if [ "$westside_exists" -eq 1 ]; then
  print_success "Westside district exists"
else
  print_error "Westside district not found in seed data"
fi

# Check Eastside district exists
eastside_exists=$(run_query "SELECT COUNT(*) FROM public.spb_districts WHERE slug = 'eastside';")
if [ "$eastside_exists" -eq 1 ]; then
  print_success "Eastside district exists"
else
  print_error "Eastside district not found in seed data"
fi

# Check goals by level
check_row_count "spb_goals" "level = 0" 3 3 "Goals Level 0 (Objectives)"
check_row_count "spb_goals" "level = 1" 10 12 "Goals Level 1 (Goals)"
check_row_count "spb_goals" "level = 2" 4 6 "Goals Level 2 (Sub-goals)"

# Check stock photos
check_row_count "spb_stock_photos" "1=1" 10 10 "Stock photos"

# Check schools
check_row_count "spb_schools" "1=1" 13 13 "Schools"

# Check metrics exist
check_row_count "spb_metrics" "1=1" 1 999 "Metrics (at least 1)"

# ============================================================================
# SECTION 3: Database Structure (MEDIUM)
# ============================================================================
print_section "Section 3: Verifying indexes and constraints..."

# Helper function to check if index exists
check_index_exists() {
  local index_name="$1"
  local description="${2:-$index_name}"

  if check_query_succeeds "SELECT 1 FROM pg_indexes WHERE indexname = '$index_name';"; then
    print_success "Index exists: $description"
  else
    print_warning "Index missing: $description"
  fi
}

# Check critical indexes (sample from migrations)
check_index_exists "idx_goals_district_id" "Goals by district"
check_index_exists "idx_goals_parent_id" "Goals by parent (hierarchy)"
check_index_exists "idx_metrics_goal_id" "Metrics by goal"
check_index_exists "idx_metric_time_series_metric_id" "Time series by metric"

# Check unique constraints
unique_constraints=$(run_query "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'UNIQUE' AND table_schema = 'public' AND table_name LIKE 'spb_%';")
if [[ "$unique_constraints" =~ ^[0-9]+$ ]] && [ "$unique_constraints" -ge 5 ]; then
  print_success "Unique constraints: $unique_constraints (expected >= 5)"
else
  print_warning "Unique constraints: $unique_constraints (expected >= 5)"
fi

# Check foreign key constraints
fk_constraints=$(run_query "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public' AND table_name LIKE 'spb_%';")
if [[ "$fk_constraints" =~ ^[0-9]+$ ]] && [ "$fk_constraints" -ge 10 ]; then
  print_success "Foreign key constraints: $fk_constraints (expected >= 10)"
else
  print_warning "Foreign key constraints: $fk_constraints (expected >= 10)"
fi

# ============================================================================
# SECTION 4: RLS Policies (HIGH)
# ============================================================================
print_section "Section 4: Verifying RLS policies..."

# Helper function to check RLS enabled
check_rls_enabled() {
  local table="$1"

  rls_enabled=$(run_query "SELECT relrowsecurity FROM pg_class WHERE relname = '$table' AND relnamespace = 'public'::regnamespace;")

  if [ "$rls_enabled" = "t" ]; then
    print_success "RLS enabled on $table"
  else
    print_error "RLS NOT enabled on $table"
  fi
}

# Check RLS enabled on critical tables
check_rls_enabled "spb_districts"
check_rls_enabled "spb_goals"
check_rls_enabled "spb_metrics"
check_rls_enabled "spb_district_admins"
check_rls_enabled "spb_schools"

# Count policies on critical tables
check_policy_count() {
  local table="$1"
  local min_expected="$2"

  policy_count=$(run_query "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = '$table';")

  if [[ "$policy_count" =~ ^[0-9]+$ ]] && [ "$policy_count" -ge "$min_expected" ]; then
    print_success "Policies on $table: $policy_count (expected >= $min_expected)"
  else
    print_error "Policies on $table: $policy_count (expected >= $min_expected)"
  fi
}

check_policy_count "spb_districts" 3
check_policy_count "spb_goals" 3
check_policy_count "spb_metrics" 3

# ============================================================================
# SECTION 5: Helper Functions (MEDIUM)
# ============================================================================
print_section "Section 5: Verifying helper functions..."

# Helper function to check if function exists
check_function_exists() {
  local function_name="$1"
  local description="${2:-$function_name}"

  if check_query_succeeds "SELECT 1 FROM pg_proc WHERE proname = '$function_name';"; then
    print_success "Function exists: $description"
  else
    print_warning "Function missing: $description (may not be critical)"
  fi
}

check_function_exists "is_district_admin" "is_district_admin()"
check_function_exists "is_system_admin" "is_system_admin()"
check_function_exists "recalculate_goal_progress" "recalculate_goal_progress()"

# ============================================================================
# SECTION 6: Anonymous Access Test (HIGH)
# ============================================================================
print_section "Section 6: Testing anonymous read access..."

# Create a temporary role to simulate anonymous access
ANON_ROLE="anon"

# Test 1: Public districts should be readable by anonymous users
public_district_count=$(run_query "SET ROLE $ANON_ROLE; SELECT COUNT(*) FROM public.spb_districts WHERE is_public = true;")
if [[ "$public_district_count" =~ ^[0-9]+$ ]] && [ "$public_district_count" -ge 1 ]; then
  print_success "Anonymous users can read public districts ($public_district_count found)"
else
  print_error "Anonymous users cannot read public districts (RLS may be too restrictive)"
fi

# Test 2: Goals from public districts should be readable
public_goals_query="SET ROLE $ANON_ROLE; SELECT COUNT(*) FROM public.spb_goals g JOIN public.spb_districts d ON g.district_id = d.id WHERE d.is_public = true;"
if check_query_succeeds "$public_goals_query"; then
  public_goals_count=$(run_query "$public_goals_query")
  if [[ "$public_goals_count" =~ ^[0-9]+$ ]]; then
    print_success "Anonymous users can read goals from public districts ($public_goals_count found)"
  else
    print_warning "Goals query returned non-numeric result"
  fi
else
  print_error "Anonymous users cannot read goals from public districts"
fi

# Test 3: Stock photos should be readable (used for cover images)
stock_photos_count=$(run_query "SET ROLE $ANON_ROLE; SELECT COUNT(*) FROM public.spb_stock_photos;")
if [[ "$stock_photos_count" =~ ^[0-9]+$ ]] && [ "$stock_photos_count" -ge 10 ]; then
  print_success "Anonymous users can read stock photos ($stock_photos_count found)"
else
  print_warning "Anonymous users may not be able to read stock photos"
fi

# Test 4: Admin tables should NOT be readable by anonymous users
admin_check=$(run_query "SET ROLE $ANON_ROLE; SELECT COUNT(*) FROM public.spb_district_admins;" 2>&1)
if [[ "$admin_check" =~ "permission denied" ]] || [[ "$admin_check" == "0" ]]; then
  print_success "Anonymous users cannot read admin tables (correct)"
else
  print_error "Anonymous users can read admin tables (security issue!)"
fi

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "═══════════════════════════════════════"
echo "Summary:"
echo "═══════════════════════════════════════"

total_checks=$((checks_passed + errors + warnings))
echo -e "${GREEN}✅ Checks passed: $checks_passed${NC}"

if [ $errors -gt 0 ]; then
  echo -e "${RED}❌ Errors: $errors${NC}"
fi

if [ $warnings -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Warnings: $warnings${NC}"
fi

echo ""

if [ $errors -eq 0 ]; then
  echo -e "${GREEN}✅ All critical checks passed!${NC}"
  echo "   Database migrations and seed data are valid."
  exit 0
else
  echo -e "${RED}❌ Found $errors critical error(s).${NC}"
  echo "   Please fix errors before deploying to production."
  exit 1
fi
