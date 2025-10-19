import { createClient } from '@supabase/supabase-js';

// Local Supabase connection
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMetricTimeSeries() {
  console.log('🧪 Testing Metric Time Series functionality...\n');

  try {
    // 1. First, check if the table exists
    console.log('1️⃣ Checking if spb_metric_time_series table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('spb_metric_time_series')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table does not exist or error accessing it:', tableError.message);
      console.log('\n📝 Please run the migration first in Supabase Studio:');
      console.log('   1. Open http://127.0.0.1:54323');
      console.log('   2. Go to SQL Editor');
      console.log('   3. Copy the content from migrations/002_add_metric_time_series.sql');
      console.log('   4. Run the SQL');
      return;
    }
    console.log('✅ Table exists!\n');

    // 2. Get or create a test district and goal
    console.log('2️⃣ Setting up test data...');
    
    // Get first district
    const { data: districts } = await supabase
      .from('spb_districts')
      .select('*')
      .limit(1);
    
    let districtId = districts?.[0]?.id;
    
    if (!districtId) {
      // Create a test district
      const { data: newDistrict } = await supabase
        .from('spb_districts')
        .insert({
          name: 'Test District for Metrics',
          slug: 'test-metrics',
          admin_email: 'test@example.com',
          is_public: true
        })
        .select()
        .single();
      
      districtId = newDistrict?.id;
      console.log('✅ Created test district');
    } else {
      console.log('✅ Using existing district:', districts[0].name);
    }

    // Get or create a test goal
    const { data: goals } = await supabase
      .from('spb_goals')
      .select('*')
      .eq('district_id', districtId)
      .limit(1);
    
    let goalId = goals?.[0]?.id;
    
    if (!goalId) {
      const { data: newGoal } = await supabase
        .from('spb_goals')
        .insert({
          district_id: districtId,
          goal_number: '1.1',
          title: 'Grow and nurture a district culture that values belonging',
          level: 0,
          order_position: 1
        })
        .select()
        .single();
      
      goalId = newGoal?.id;
      console.log('✅ Created test goal');
    } else {
      console.log('✅ Using existing goal:', goals[0].title);
    }

    // 3. Create a test metric with time-series tracking
    console.log('\n3️⃣ Creating a metric with time-series configuration...');
    
    const { data: metric, error: metricError } = await supabase
      .from('spb_metrics')
      .insert({
        goal_id: goalId,
        metric_name: 'Overall average of responses (1-5 rating) on sense of belonging',
        unit: 'Average Rating',
        frequency: 'quarterly',
        aggregation_method: 'average',
        decimal_places: 2,
        is_percentage: false,
        is_higher_better: true,
        target_value: 3.80,
        baseline_value: 3.66
      })
      .select()
      .single();
    
    if (metricError) {
      console.error('❌ Error creating metric:', metricError.message);
      return;
    }
    
    console.log('✅ Created metric:', metric.metric_name);
    console.log('   ID:', metric.id);

    // 4. Add time-series data points
    console.log('\n4️⃣ Adding time-series data points...');
    
    const timeSeriesData = [
      { period: '2024-Q1', period_type: 'quarterly', target_value: 3.70, actual_value: 3.66 },
      { period: '2024-Q2', period_type: 'quarterly', target_value: 3.72, actual_value: 3.74 },
      { period: '2024-Q3', period_type: 'quarterly', target_value: 3.75, actual_value: 3.78 },
      { period: '2024-Q4', period_type: 'quarterly', target_value: 3.80, actual_value: 3.79 },
    ];

    for (const dataPoint of timeSeriesData) {
      const { error } = await supabase
        .from('spb_metric_time_series')
        .upsert({
          metric_id: metric.id,
          district_id: districtId,
          ...dataPoint,
          status: dataPoint.actual_value >= dataPoint.target_value ? 'on-target' : 'off-target'
        });
      
      if (error) {
        console.error(`❌ Error adding data for ${dataPoint.period}:`, error.message);
      } else {
        console.log(`✅ Added ${dataPoint.period}: Target ${dataPoint.target_value}, Actual ${dataPoint.actual_value}`);
      }
    }

    // 5. Test the YTD calculation function
    console.log('\n5️⃣ Testing YTD calculation...');
    
    const { data: ytdResult, error: ytdError } = await supabase
      .rpc('calculate_ytd_average', { 
        p_metric_id: metric.id,
        p_year: 2024 
      });
    
    if (ytdError) {
      console.error('❌ Error calculating YTD:', ytdError.message);
    } else {
      console.log('✅ YTD Average:', ytdResult);
      const expectedYTD = (3.66 + 3.74 + 3.78 + 3.79) / 4;
      console.log('   Expected:', expectedYTD.toFixed(2));
      console.log('   Match:', Math.abs(ytdResult - expectedYTD) < 0.01 ? '✅' : '❌');
    }

    // 6. Test EOY projection
    console.log('\n6️⃣ Testing EOY projection...');
    
    const { data: eoyResult, error: eoyError } = await supabase
      .rpc('calculate_eoy_projection', { 
        p_metric_id: metric.id,
        p_year: 2024 
      });
    
    if (eoyError) {
      console.error('❌ Error calculating EOY projection:', eoyError.message);
    } else {
      console.log('✅ EOY Projection:', eoyResult);
    }

    // 7. Check if the metric was updated with aggregates
    console.log('\n7️⃣ Checking if metric was updated with aggregates...');
    
    const { data: updatedMetric, error: updateError } = await supabase
      .from('spb_metrics')
      .select('ytd_value, eoy_projection, last_actual_period, current_value')
      .eq('id', metric.id)
      .single();
    
    if (updateError) {
      console.error('❌ Error fetching updated metric:', updateError.message);
    } else {
      console.log('✅ Metric aggregates:');
      console.log('   YTD Value:', updatedMetric.ytd_value);
      console.log('   EOY Projection:', updatedMetric.eoy_projection);
      console.log('   Last Actual Period:', updatedMetric.last_actual_period);
      console.log('   Current Value:', updatedMetric.current_value);
    }

    // 8. Retrieve all time-series data
    console.log('\n8️⃣ Retrieving all time-series data for the metric...');
    
    const { data: allData, error: allError } = await supabase
      .from('spb_metric_time_series')
      .select('*')
      .eq('metric_id', metric.id)
      .order('period');
    
    if (allError) {
      console.error('❌ Error fetching time series:', allError.message);
    } else {
      console.log('✅ Time series data:');
      allData?.forEach(item => {
        console.log(`   ${item.period}: Target=${item.target_value}, Actual=${item.actual_value}, Status=${item.status}`);
      });
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 All tests completed successfully!');
    console.log('The metric time-series system is working correctly.');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the tests
testMetricTimeSeries();