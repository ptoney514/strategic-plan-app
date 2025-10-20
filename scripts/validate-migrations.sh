#!/bin/bash
# Supabase Migration Validation Script
# Checks migrations for common issues

echo "🔍 Validating Supabase Migrations..."

errors=0
warnings=0

# Navigate to migrations directory
if [ ! -d "supabase/migrations" ]; then
  echo "❌ supabase/migrations directory not found"
  echo "   Run this script from project root"
  exit 1
fi

cd supabase/migrations || exit 1

# Check 1: Migration file naming
echo ""
echo "📋 Check 1: Migration file naming..."
shopt -s nullglob
files=(*.sql)
if [ ${#files[@]} -eq 0 ]; then
  echo "ℹ️  No migration files found"
else
  for file in "${files[@]}"; do
    # Check if file matches pattern NNN_description.sql
    if [[ ! "$file" =~ ^[0-9]{3,}_.*\.sql$ ]]; then
      echo "❌ Invalid name: $file"
      echo "   Expected format: NNN_description.sql (e.g., 001_initial_schema.sql)"
      ((errors++))
    fi
  done
fi
shopt -u nullglob

if [ $errors -eq 0 ]; then
  echo "   ✅ All migration files properly named"
fi

# Check 2: Sequential numbering
echo ""
echo "📋 Check 2: Sequential numbering..."
last_num=0
shopt -s nullglob
migration_files=(*.sql)
for file in $(printf "%s\n" "${migration_files[@]}" | grep -E '^[0-9]{3}' | sort); do
  num=$(echo "$file" | grep -oE '^[0-9]+' | sed 's/^0*//')  # Remove leading zeros to avoid octal interpretation
  num=${num:-0}  # Handle case where all digits are zero
  expected=$((last_num + 1))

  if [ "$num" -ne "$expected" ] && [ "$last_num" -ne 0 ]; then
    echo "⚠️  Gap detected: expected $expected, found $num ($file)"
    ((warnings++))
  fi

  last_num=$num
done
shopt -u nullglob

if [ $warnings -eq 0 ]; then
  echo "   ✅ Migration numbers are sequential"
else
  echo "   ⚠️  Found $warnings gap(s) in numbering (not critical, but recommended to fix)"
fi

# Check 3: Idempotency (CREATE statements)
echo ""
echo "📋 Check 3: Idempotency checks..."
non_idempotent=0

shopt -s nullglob
for file in *.sql; do
  # Check CREATE TABLE without IF NOT EXISTS
  if grep -qi "CREATE TABLE" "$file" && ! grep -qi "IF NOT EXISTS" "$file"; then
    echo "⚠️  Potentially non-idempotent CREATE TABLE in: $file"
    echo "   Recommendation: Use 'CREATE TABLE IF NOT EXISTS'"
    ((non_idempotent++))
  fi

  # Check CREATE INDEX without IF NOT EXISTS
  if grep -qi "CREATE INDEX" "$file" && ! grep -qi "IF NOT EXISTS" "$file"; then
    echo "⚠️  Potentially non-idempotent CREATE INDEX in: $file"
    echo "   Recommendation: Use 'CREATE INDEX IF NOT EXISTS'"
    ((non_idempotent++))
  fi
done
shopt -u nullglob

if [ $non_idempotent -eq 0 ]; then
  echo "   ✅ All CREATE statements appear idempotent"
else
  echo "   ⚠️  Found $non_idempotent potentially non-idempotent statement(s)"
fi

# Check 4: Non-migration files in migrations directory
echo ""
echo "📋 Check 4: Non-migration files..."
found_non_migration=0

for file in *; do
  # Check for .skip, .backup, .old files
  if [[ "$file" =~ \.(skip|backup|old|bak)$ ]]; then
    echo "⚠️  Found non-migration file: $file"
    echo "   Recommendation: Move to archive/ directory"
    ((found_non_migration++))
  fi

  # Check for files without numeric prefix
  if [[ "$file" =~ \.sql$ ]] && [[ ! "$file" =~ ^[0-9] ]]; then
    echo "⚠️  Found non-timestamped file: $file"
    echo "   Recommendation: Rename with number prefix or move to seeds/"
    ((found_non_migration++))
  fi
done

if [ $found_non_migration -eq 0 ]; then
  echo "   ✅ No non-migration files found"
else
  echo "   ⚠️  Found $found_non_migration non-migration file(s)"
fi

# Check 5: Seed file configuration
echo ""
echo "📋 Check 5: Seed file configuration..."
cd ../.. || exit 1

if [ -f "supabase/seed.sql" ]; then
  echo "   ✅ seed.sql exists"

  # Check if seed is configured in config.toml
  if grep -q "sql_paths.*seed\.sql" supabase/config.toml 2>/dev/null; then
    echo "   ✅ seed.sql configured in config.toml"
  else
    echo "   ⚠️  seed.sql not referenced in config.toml"
    echo "   Add to [db.seed] section: sql_paths = [\"./seed.sql\"]"
    ((warnings++))
  fi
else
  echo "   ℹ️  No seed.sql found (optional)"
fi

# Summary
echo ""
echo "═══════════════════════════════════════"
echo "Summary:"
echo "═══════════════════════════════════════"

total_issues=$((errors + warnings + non_idempotent + found_non_migration))

if [ $errors -gt 0 ]; then
  echo "❌ Errors: $errors"
fi

if [ $warnings -gt 0 ]; then
  echo "⚠️  Warnings: $warnings"
fi

if [ $non_idempotent -gt 0 ]; then
  echo "⚠️  Non-idempotent statements: $non_idempotent"
fi

if [ $found_non_migration -gt 0 ]; then
  echo "⚠️  Non-migration files: $found_non_migration"
fi

echo ""

if [ $total_issues -eq 0 ]; then
  echo "✅ All validation checks passed!"
  echo "   Your migrations are clean and ready for production."
  exit 0
else
  if [ $errors -eq 0 ]; then
    echo "⚠️  Found $total_issues issue(s), but no critical errors."
    echo "   Review warnings and address when convenient."
    exit 0
  else
    echo "❌ Found $errors critical error(s)."
    echo "   Please fix errors before deploying to production."
    exit 1
  fi
fi
