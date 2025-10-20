#!/bin/bash
# Supabase Migration Renumbering Script
# Renumbers all migration files sequentially

echo "🔢 Renumbering Supabase Migrations..."

# Check if migrations directory exists
if [ ! -d "supabase/migrations" ]; then
  echo "❌ supabase/migrations directory not found"
  echo "   Run this script from project root"
  exit 1
fi

cd supabase/migrations || exit 1

# Count migration files
migration_count=$(ls -1 *.sql 2>/dev/null | wc -l)

if [ "$migration_count" -eq 0 ]; then
  echo "ℹ️  No migration files found in supabase/migrations/"
  exit 0
fi

echo "Found $migration_count migration file(s)"
echo ""

# Safety prompt
echo "⚠️  WARNING: This will rename all migration files"
echo "   Make sure you have committed your changes first!"
echo ""
read -p "Continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  echo "Cancelled."
  exit 0
fi

echo ""
echo "Renumbering migrations..."

counter=1
declare -A renames

# First pass: Determine new names
for file in $(ls -1 *.sql 2>/dev/null | sort); do
  # Skip if it's not a migration file
  if [[ ! "$file" =~ \.sql$ ]]; then
    continue
  fi

  # Extract description from filename
  # Remove leading numbers and underscores
  desc=$(echo "$file" | sed 's/^[0-9_]*//; s/\.sql$//')

  # If description is empty, use original filename
  if [ -z "$desc" ]; then
    desc=$(echo "$file" | sed 's/\.sql$//')
  fi

  # Create new numbered name (3-digit padding)
  new_name=$(printf "%03d_%s.sql" "$counter" "$desc")

  # Store the rename pair
  renames["$file"]="$new_name"

  if [ "$file" != "$new_name" ]; then
    echo "  $file → $new_name"
  else
    echo "  $file (no change)"
  fi

  counter=$((counter + 1))
done

echo ""
read -p "Proceed with renaming? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  echo "Cancelled."
  exit 0
fi

# Second pass: Perform renames using temp directory to avoid conflicts
echo ""
echo "Creating temporary directory..."
temp_dir="../migrations_temp_$$"
mkdir -p "$temp_dir"

for file in "${!renames[@]}"; do
  new_name="${renames[$file]}"

  if [ "$file" != "$new_name" ]; then
    # Move to temp directory first
    mv "$file" "$temp_dir/$new_name"
  else
    # Copy to temp (no rename needed)
    cp "$file" "$temp_dir/$file"
  fi
done

# Remove old migrations
rm -f *.sql

# Move renamed files back
mv "$temp_dir"/* .

# Cleanup temp directory
rmdir "$temp_dir"

echo ""
echo "✅ Migration renumbering complete!"
echo ""
echo "Next steps:"
echo "1. Review the changes: git status"
echo "2. Test migrations: supabase db reset"
echo "3. Commit changes: git add supabase/migrations/ && git commit -m 'refactor: renumber migrations'"
