const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Local Supabase connection
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Starting metric time-series migration...');
  
  // Read the migration file
  const migrationPath = path.join(__dirname, '..', 'migrations', '002_add_metric_time_series.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
  
  // Split the SQL into individual statements (separated by semicolon + newline)
  const statements = migrationSQL
    .split(/;\s*\n/)
    .filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'))
    .map(stmt => stmt.trim() + ';');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Skip comments and empty statements
    if (!statement || statement.startsWith('--') || statement === ';') {
      continue;
    }
    
    // Extract a meaningful name from the statement
    let statementName = 'Statement ' + (i + 1);
    if (statement.includes('CREATE TABLE')) {
      statementName = 'Creating table spb_metric_time_series';
    } else if (statement.includes('ALTER TABLE')) {
      statementName = 'Adding columns to spb_metrics';
    } else if (statement.includes('CREATE INDEX')) {
      const match = statement.match(/CREATE INDEX.*?(\w+)/);
      if (match) statementName = `Creating index ${match[1]}`;
    } else if (statement.includes('CREATE POLICY')) {
      statementName = 'Creating RLS policy';
    } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
      const match = statement.match(/FUNCTION\s+(\w+)/);
      if (match) statementName = `Creating function ${match[1]}`;
    } else if (statement.includes('CREATE TRIGGER')) {
      const match = statement.match(/TRIGGER\s+(\w+)/);
      if (match) statementName = `Creating trigger ${match[1]}`;
    } else if (statement.includes('GRANT')) {
      statementName = 'Granting permissions';
    } else if (statement.includes('COMMENT ON')) {
      statementName = 'Adding comments';
    }
    
    try {
      console.log(`\n📝 ${statementName}...`);
      
      // Use raw SQL execution through Supabase
      const { data, error } = await supabase.rpc('query', { query: statement });
      
      if (error) {
        // Try alternative approach - direct database connection
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ query: statement })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
      }
      
      console.log(`✅ ${statementName} - Success`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${statementName} - Error:`, error.message);
      errorCount++;
      
      // Continue with other statements even if one fails
      if (!statement.includes('CREATE TABLE') && !statement.includes('ALTER TABLE')) {
        console.log('   ⚠️  Non-critical error, continuing...');
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Migration Summary:`);
  console.log(`   ✅ Successful statements: ${successCount}`);
  console.log(`   ❌ Failed statements: ${errorCount}`);
  console.log('='.repeat(50));
  
  if (errorCount === 0) {
    console.log('\n🎉 Migration completed successfully!');
  } else {
    console.log('\n⚠️  Migration completed with some errors. Please review the output above.');
  }
}

// Run the migration
runMigration().catch(console.error);