#!/usr/bin/env bash
#
# API Endpoint Audit Script
# Tests every endpoint group against a running dev server (npm run dev:api).
#
# Usage:
#   npm run dev:api  # in another terminal
#   bash scripts/api-audit.sh [BASE_URL]
#
# Defaults to http://localhost:5174 if no BASE_URL is provided.
# For production: bash scripts/api-audit.sh https://www.stratadash.org

set -euo pipefail

BASE="${1:-http://localhost:5174}"
PASS=0
FAIL=0
WARN=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check() {
  local label="$1"
  local expected_status="$2"
  local method="${3:-GET}"
  local url="$4"
  local body="${5:-}"

  local curl_args=(-s -o /dev/null -w "%{http_code}" -X "$method")
  curl_args+=(-H "Content-Type: application/json")

  if [ -n "$COOKIE" ]; then
    curl_args+=(-b "$COOKIE")
  fi

  if [ -n "$body" ]; then
    curl_args+=(-d "$body")
  fi

  local status
  status=$(curl "${curl_args[@]}" "$url" 2>/dev/null || echo "000")

  if [ "$status" = "$expected_status" ]; then
    echo -e "  ${GREEN}PASS${NC} [$status] $label"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}FAIL${NC} [$status expected $expected_status] $label"
    FAIL=$((FAIL + 1))
  fi
}

check_json() {
  local label="$1"
  local url="$2"

  local curl_args=(-s -X GET -H "Content-Type: application/json")
  if [ -n "$COOKIE" ]; then
    curl_args+=(-b "$COOKIE")
  fi

  local response
  response=$(curl "${curl_args[@]}" "$url" 2>/dev/null || echo '{"error":"curl failed"}')
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" -X GET -H "Content-Type: application/json" ${COOKIE:+-b "$COOKIE"} "$url" 2>/dev/null || echo "000")

  if [ "$status" = "200" ]; then
    echo -e "  ${GREEN}PASS${NC} [$status] $label"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}FAIL${NC} [$status] $label"
    FAIL=$((FAIL + 1))
  fi
  echo "$response"
}

COOKIE=""

echo "========================================"
echo " API Endpoint Audit"
echo " Base URL: $BASE"
echo " $(date)"
echo "========================================"
echo ""

# ── Group 1: Health & Public (no auth) ──────────────────────
echo "── Group 1: Health & Public (no auth) ──"

check "GET /api/health" "200" "GET" "$BASE/api/health"
check "GET /api/organizations?public=true" "200" "GET" "$BASE/api/organizations?public=true"
check "GET /api/organizations/westside (slug)" "200" "GET" "$BASE/api/organizations/westside"
check "GET /api/organizations/westside/goals" "200" "GET" "$BASE/api/organizations/westside/goals"
check "GET /api/organizations/westside/plans" "200" "GET" "$BASE/api/organizations/westside/plans"
check "GET /api/organizations/nonexistent (404)" "404" "GET" "$BASE/api/organizations/nonexistent"
echo ""

# ── Group 2: Auth flow ─────────────────────────────────────
echo "── Group 2: Auth flow ──"

# Sign in and capture session cookie
COOKIE_JAR=$(mktemp)
LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -c "$COOKIE_JAR" \
  -d '{"email":"sysadmin@stratadash.com","password":"Stratadash123!"}' \
  "$BASE/api/auth/sign-in/email" 2>/dev/null || echo "000")

if [ "$LOGIN_STATUS" = "200" ]; then
  echo -e "  ${GREEN}PASS${NC} [$LOGIN_STATUS] POST /api/auth/sign-in/email"
  PASS=$((PASS + 1))
  COOKIE="$COOKIE_JAR"
else
  echo -e "  ${RED}FAIL${NC} [$LOGIN_STATUS] POST /api/auth/sign-in/email"
  FAIL=$((FAIL + 1))
  echo -e "  ${YELLOW}WARN${NC} Skipping authenticated tests (login failed)"
  WARN=$((WARN + 1))
  COOKIE=""
fi

# Verify session
if [ -n "$COOKIE" ]; then
  check "GET /api/auth/get-session" "200" "GET" "$BASE/api/auth/get-session"
fi
echo ""

# ── Group 3: User endpoints (authenticated) ────────────────
echo "── Group 3: User endpoints (authenticated) ──"

if [ -n "$COOKIE" ]; then
  check "GET /api/user/dashboard" "200" "GET" "$BASE/api/user/dashboard"
  check "GET /api/user/districts" "200" "GET" "$BASE/api/user/districts"
  check "GET /api/user/memberships" "200" "GET" "$BASE/api/user/memberships"
  check "GET /api/user/plans-with-counts" "200" "GET" "$BASE/api/user/plans-with-counts"
else
  echo -e "  ${YELLOW}SKIP${NC} (not authenticated)"
fi
echo ""

# ── Group 4: Org-scoped endpoints (authenticated) ──────────
echo "── Group 4: Org-scoped endpoints (authenticated) ──"

if [ -n "$COOKIE" ]; then
  check "GET /api/organizations (user's orgs)" "200" "GET" "$BASE/api/organizations"
  check "GET /api/organizations/westside/members" "200" "GET" "$BASE/api/organizations/westside/members"
  check "GET /api/organizations/westside/invitations" "200" "GET" "$BASE/api/organizations/westside/invitations"
else
  echo -e "  ${YELLOW}SKIP${NC} (not authenticated)"
fi
echo ""

# ── Group 5: System admin endpoints ────────────────────────
echo "── Group 5: System admin endpoints ──"

if [ -n "$COOKIE" ]; then
  check "GET /api/admin/stats" "200" "GET" "$BASE/api/admin/stats"
  check "GET /api/admin/recent-users" "200" "GET" "$BASE/api/admin/recent-users"
  check "GET /api/admin/users" "200" "GET" "$BASE/api/admin/users"
else
  echo -e "  ${YELLOW}SKIP${NC} (not authenticated)"
fi
echo ""

# ── Group 6: Auth-gated endpoints without auth (should 401) ─
echo "── Group 6: Unauthenticated access to protected endpoints ──"
SAVED_COOKIE="$COOKIE"
COOKIE=""

check "GET /api/organizations (no auth -> 401)" "401" "GET" "$BASE/api/organizations"
check "GET /api/user/dashboard (no auth -> 401)" "401" "GET" "$BASE/api/user/dashboard"
check "GET /api/admin/stats (no auth -> 401)" "401" "GET" "$BASE/api/admin/stats"

COOKIE="$SAVED_COOKIE"
echo ""

# ── Cleanup ─────────────────────────────────────────────────
if [ -f "$COOKIE_JAR" ]; then
  rm -f "$COOKIE_JAR"
fi

echo "========================================"
echo " Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}, ${YELLOW}$WARN warnings${NC}"
echo "========================================"

exit $FAIL
