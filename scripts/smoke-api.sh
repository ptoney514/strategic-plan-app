#!/bin/bash
# API Smoke Tests — validates key endpoints without a browser
# Usage: ./scripts/smoke-api.sh [BASE_URL]
# Example: ./scripts/smoke-api.sh https://your-prod-url.vercel.app

set -euo pipefail

BASE_URL="${1:-http://localhost:5174}"
PASSED=0
FAILED=0

pass() { PASSED=$((PASSED + 1)); echo "  PASS: $1"; }
fail() { FAILED=$((FAILED + 1)); echo "  FAIL: $1"; }

echo "API Smoke Tests"
echo "Base URL: $BASE_URL"
echo "---"

# 1. Health endpoint
STATUS=$(curl -so /dev/null -w "%{http_code}" "$BASE_URL/api/health" 2>/dev/null || echo "000")
if [ "$STATUS" = "200" ]; then
  pass "GET /api/health -> 200"
else
  fail "GET /api/health -> $STATUS (expected 200)"
fi

# 2. Public organizations
STATUS=$(curl -so /dev/null -w "%{http_code}" "$BASE_URL/api/organizations?public=true" 2>/dev/null || echo "000")
if [ "$STATUS" = "200" ]; then
  pass "GET /api/organizations?public=true -> 200"
else
  fail "GET /api/organizations?public=true -> $STATUS (expected 200)"
fi

# 3. Stock photos
STATUS=$(curl -so /dev/null -w "%{http_code}" "$BASE_URL/api/stock-photos" 2>/dev/null || echo "000")
if [ "$STATUS" = "200" ]; then
  pass "GET /api/stock-photos -> 200"
else
  fail "GET /api/stock-photos -> $STATUS (expected 200)"
fi

# 4. Unauthenticated memberships should return 401
STATUS=$(curl -so /dev/null -w "%{http_code}" "$BASE_URL/api/user/memberships" 2>/dev/null || echo "000")
if [ "$STATUS" = "401" ]; then
  pass "GET /api/user/memberships (no auth) -> 401"
else
  fail "GET /api/user/memberships (no auth) -> $STATUS (expected 401)"
fi

# 5. Auth session endpoint (should be accessible)
STATUS=$(curl -so /dev/null -w "%{http_code}" "$BASE_URL/api/auth/get-session" 2>/dev/null || echo "000")
if [ "$STATUS" = "200" ] || [ "$STATUS" = "401" ]; then
  pass "GET /api/auth/get-session -> $STATUS"
else
  fail "GET /api/auth/get-session -> $STATUS (expected 200 or 401)"
fi

echo "---"
echo "Results: $PASSED passed, $FAILED failed"

if [ "$FAILED" -gt 0 ]; then
  echo "API smoke tests FAILED"
  exit 1
fi

echo "All API smoke tests passed"
