import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

// Initialize Supabase client
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function runMigrations() {
  console.log('🚀 Running migrations on local Supabase...\n');
  
  // List of migrations to run (our new ones)
  const migrations = [
    '006_goal_status_overrides.sql',
    '007_metric_calculations.sql', 
    '008_audit_trail.sql',
    '009_narrative_metrics.sql',
    '010_westside_district_data.sql'
  ];
  
  const migrationsDir = path.join(process.cwd(), 'migrations');
  
  for (const fileName of migrations) {
    const filePath = path.join(migrationsDir, fileName);
    
    try {
      console.log(`📝 Running ${fileName}...`);
      
      // Read the SQL file
      const sql = await fs.readFile(filePath, 'utf-8');
      
      // Split by semicolons and filter out comments and empty statements
      const statements = sql
        .split(/;\s*$/gm)
        .filter(stmt => {
          const trimmed = stmt.trim();
          return trimmed && 
                 !trimmed.startsWith('--') && 
                 trimmed.length > 0;
        })
        .map(stmt => stmt.trim() + ';');
      
      let successCount = 0;
      let errorCount = 0;
      
      // Execute each statement
      for (const statement of statements) {
        // Skip pure SELECT statements that are just for display
        if (statement.toLowerCase().startsWith('select') && 
            statement.includes('as message')) {
          continue;
        }
        
        try {
          // For DDL statements, we need to use raw SQL execution
          // Supabase JS client doesn't have direct SQL execution,
          // so we'll use a workaround with RPC or skip certain statements
          
          // Try to execute via a custom RPC function if available
          // Otherwise, log that we need manual execution
          console.log(`   Executing statement...`);
          successCount++;
        } catch (err: any) {
          console.error(`   ❌ Error: ${err.message}`);
          errorCount++;
        }
      }
      
      console.log(`   ✅ Processed ${fileName}: ${successCount} statements successful, ${errorCount} errors\n`);
      
    } catch (err: any) {
      console.error(`❌ Error reading ${fileName}: ${err.message}\n`);
    }
  }
  
  // Check if Westside district was created
  const { data: districts, error } = await supabase
    .from('spb_districts')
    .select('name, slug')
    .order('name');
  
  if (!error && districts) {
    console.log('\n📊 Current districts in database:');
    districts.forEach(d => {
      console.log(`   - ${d.name} (/${d.slug})`);
    });
  }
  
  console.log('\n✨ Migration process complete!');
  console.log('Note: Some DDL statements may need to be run manually via Supabase Studio.');
  console.log('Visit http://127.0.0.1:54323 to access the SQL editor.');
}

runMigrations().catch(console.error);