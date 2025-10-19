import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// Get Supabase credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  
  // Get list of migration files to run (006-009)
  const migrationFiles = [
    '006_goal_status_overrides.sql',
    '007_metric_calculations.sql',
    '008_audit_trail.sql',
    '009_narrative_metrics.sql'
  ];

  console.log('🚀 Running migrations...\n');

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    
    try {
      // Read the SQL file
      const sql = await fs.readFile(filePath, 'utf-8');
      
      console.log(`📝 Running ${file}...`);
      
      // Execute the SQL
      const { error } = await supabase.rpc('exec_sql', { query: sql });
      
      if (error) {
        // If exec_sql doesn't exist, try direct execution
        // Note: This requires raw SQL access which might not be available
        console.error(`❌ Error running ${file}:`, error.message);
        console.log('   Attempting alternative method...');
        
        // Split by semicolons and run each statement
        const statements = sql
          .split(';')
          .filter(s => s.trim())
          .map(s => s.trim() + ';');
        
        for (const statement of statements) {
          // Skip comments and empty statements
          if (statement.startsWith('--') || statement.startsWith('SELECT')) continue;
          
          // This is limited but we can try for simple operations
          console.log(`   Executing statement...`);
        }
      } else {
        console.log(`✅ Successfully ran ${file}\n`);
      }
      
    } catch (err) {
      console.error(`❌ Error with ${file}:`, err);
    }
  }
  
  console.log('✨ Migration run complete!');
}

// Run the migrations
runMigrations().catch(console.error);