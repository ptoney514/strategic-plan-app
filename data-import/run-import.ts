/**
 * Westside Objective 1 Data Import Script
 * Run with: npx tsx data-import/run-import.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://scpluslhcastrobigkfb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjcGx1c2xoY2FzdHJvYmlna2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjE4OTEsImV4cCI6MjA2ODkzNzg5MX0.rJEXZH-Bnnc-B09ysG6c9Irjmvbol0UGjmU5vWiAG0Q';
const DISTRICT_ID = 'a0000000-0000-0000-0000-000000000002';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Goal {
  id: string;
  district_id: string;
  parent_id: string | null;
  goal_number: string;
  title: string;
  level: number;
  order_position: number;
}

interface Metric {
  id: string;
  goal_id: string;
  name: string;
  metric_type: string;
  current_value: number;
  target_value: number;
  unit: string;
  is_higher_better: boolean;
  description: string;
  baseline_value?: number;
}

interface TimeSeries {
  metric_id: string;
  district_id: string;
  period: string;
  period_type: string;
  target_value: number;
  actual_value: number;
  status: string;
}

// Goal data
const goals: Goal[] = [
  // Objective 1 (Level 0)
  { id: 'b1000000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: null, goal_number: '1', title: 'Student Achievement & Well-being', level: 0, order_position: 1 },

  // Goal 1.1 and sub-goals
  { id: 'b1100000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1000000-0000-0000-0000-000000000001', goal_number: '1.1', title: 'Grow and nurture a district culture that values, demonstrates, and promotes a sense of belonging', level: 1, order_position: 1 },
  { id: 'b1110000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1100000-0000-0000-0000-000000000001', goal_number: '1.1.1', title: 'Proportional enrollment of non-white students in Honors / AP classes mirroring the student population', level: 2, order_position: 1 },
  { id: 'b1120000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1100000-0000-0000-0000-000000000001', goal_number: '1.1.2', title: 'Discipline disproportionality - Risk Ratio for Students who are OSS / Expulsion and Black/AA', level: 2, order_position: 2 },
  { id: 'b1130000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1100000-0000-0000-0000-000000000001', goal_number: '1.1.3', title: 'Special Education disproportionality', level: 2, order_position: 3 },

  // Goal 1.2 and sub-goals
  { id: 'b1200000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1000000-0000-0000-0000-000000000001', goal_number: '1.2', title: 'NDE Academic Classification', level: 1, order_position: 2 },
  { id: 'b1210000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1200000-0000-0000-0000-000000000001', goal_number: '1.2.1', title: 'NSCAS 3 ELA', level: 2, order_position: 1 },
  { id: 'b1220000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1200000-0000-0000-0000-000000000001', goal_number: '1.2.2', title: 'NSCAS 3 Math', level: 2, order_position: 2 },
  { id: 'b1230000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1200000-0000-0000-0000-000000000001', goal_number: '1.2.3', title: 'NSCAS 4 ELA', level: 2, order_position: 3 },

  // Goal 1.3
  { id: 'b1300000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1000000-0000-0000-0000-000000000001', goal_number: '1.3', title: 'Average Score of Teachers on the Instructional Model Self-Assessment Rubric', level: 1, order_position: 3 },

  // Goal 1.4 and sub-goals
  { id: 'b1400000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1000000-0000-0000-0000-000000000001', goal_number: '1.4', title: 'Student learning is personalized, with intervention and enrichment opportunities included', level: 1, order_position: 4 },
  { id: 'b1410000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1400000-0000-0000-0000-000000000001', goal_number: '1.4.1', title: 'Instructors personalize learning by offering intervention opportunities', level: 2, order_position: 1 },
  { id: 'b1420000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1400000-0000-0000-0000-000000000001', goal_number: '1.4.2', title: 'Instructors use data to determine students who struggle with course content', level: 2, order_position: 2 },
  { id: 'b1430000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1400000-0000-0000-0000-000000000001', goal_number: '1.4.3', title: 'When teachers can tell a student doesnt know the material, students feel like they are offered help', level: 2, order_position: 3 },
  { id: 'b1440000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1400000-0000-0000-0000-000000000001', goal_number: '1.4.4', title: 'Instructors use data to determine which students excel', level: 2, order_position: 4 },
  { id: 'b1450000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1400000-0000-0000-0000-000000000001', goal_number: '1.4.5', title: 'Instructors personalized learning by offering extension', level: 2, order_position: 5 },
  { id: 'b1460000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1400000-0000-0000-0000-000000000001', goal_number: '1.4.6', title: 'When teachers can tell a student knows the material, they are given opportunities to extend', level: 2, order_position: 6 },

  // Goal 1.5
  { id: 'b1500000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1000000-0000-0000-0000-000000000001', goal_number: '1.5', title: 'Curriculum is regularly reviewed and updated to reflect that the highest materials and assessments', level: 1, order_position: 5 },

  // Goal 1.6 and sub-goals
  { id: 'b1600000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1000000-0000-0000-0000-000000000001', goal_number: '1.6', title: 'All students learn and practice social-emotional skills, including how to manage emotions, set goals', level: 1, order_position: 6 },
  { id: 'b1610000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1600000-0000-0000-0000-000000000001', goal_number: '1.6.1', title: 'Office referral data', level: 2, order_position: 1 },
  { id: 'b1620000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1600000-0000-0000-0000-000000000001', goal_number: '1.6.2', title: 'Percent of students with 0-1 office referrals', level: 2, order_position: 2 },

  // Goal 1.7
  { id: 'b1700000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1000000-0000-0000-0000-000000000001', goal_number: '1.7', title: 'Career readiness skills are integrated throughout the K-12 curriculum across all content areas', level: 1, order_position: 7 },

  // Goal 1.8 and sub-goals
  { id: 'b1800000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1000000-0000-0000-0000-000000000001', goal_number: '1.8', title: 'Dual enrollment coursework, career academies, and work-based learning opportunities are available to all', level: 1, order_position: 8 },
  { id: 'b1810000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1800000-0000-0000-0000-000000000001', goal_number: '1.8.1', title: '# of AP course registrations', level: 2, order_position: 1 },
  { id: 'b1820000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1800000-0000-0000-0000-000000000001', goal_number: '1.8.2', title: '# in MCC, UNMC, zoo Career Academies', level: 2, order_position: 2 },
  { id: 'b1830000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1800000-0000-0000-0000-000000000001', goal_number: '1.8.3', title: 'Avenue Scholars Participants', level: 2, order_position: 3 },
  { id: 'b1840000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1800000-0000-0000-0000-000000000001', goal_number: '1.8.4', title: '# UNO and Wesleyan Dual Enrollments', level: 2, order_position: 4 },
  { id: 'b1850000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, parent_id: 'b1800000-0000-0000-0000-000000000001', goal_number: '1.8.5', title: 'MCC Total Hours', level: 2, order_position: 5 },
];

// Metric data
const metrics: Metric[] = [
  // 1.1 metrics
  { id: 'c1100000-0000-0000-0000-000000000001', goal_id: 'b1100000-0000-0000-0000-000000000001', name: 'Sense of Belonging Rating', metric_type: 'rating', current_value: 3.74, target_value: 3.66, unit: 'rating (1-5)', is_higher_better: true, description: 'Overall average of responses (1-5 rating) on sense of belonging' },
  { id: 'c1110000-0000-0000-0000-000000000001', goal_id: 'b1110000-0000-0000-0000-000000000001', name: '% non-white students in Honors/AP', metric_type: 'percent', current_value: 0.85, target_value: 0.9, unit: 'ratio', is_higher_better: true, description: '% non-white students involved in Honors/AP courses' },
  { id: 'c1120000-0000-0000-0000-000000000001', goal_id: 'b1120000-0000-0000-0000-000000000001', name: 'Risk Ratio (Black/AA OSS/Expulsion)', metric_type: 'number', current_value: 4.1, target_value: 1.8, unit: 'risk ratio', is_higher_better: false, description: 'Risk ratio as compared to 1 white student - LOWER is better', baseline_value: 2.0 },
  { id: 'c1130000-0000-0000-0000-000000000001', goal_id: 'b1130000-0000-0000-0000-000000000001', name: 'SpEd Disproportionality Risk Ratio', metric_type: 'number', current_value: 3.1, target_value: 1.0, unit: 'risk ratio', is_higher_better: false, description: 'Risk ratio as compared to 1 white student - LOWER is better' },

  // 1.2 metrics
  { id: 'c1200000-0000-0000-0000-000000000001', goal_id: 'b1200000-0000-0000-0000-000000000001', name: 'NDE Academic Classification Score', metric_type: 'percent', current_value: 90, target_value: 100, unit: 'score', is_higher_better: true, description: 'Excellent: 100%; Great: 90%; Good: 80%; Needs Improvement: 70%' },
  { id: 'c1210000-0000-0000-0000-000000000001', goal_id: 'b1210000-0000-0000-0000-000000000001', name: 'NSCAS 3 ELA vs State Average', metric_type: 'percent', current_value: 8, target_value: 0, unit: 'percent difference', is_higher_better: true, description: 'Percent higher or lower than the state average' },
  { id: 'c1220000-0000-0000-0000-000000000001', goal_id: 'b1220000-0000-0000-0000-000000000001', name: 'NSCAS 3 Math vs State Average', metric_type: 'percent', current_value: 5, target_value: 0, unit: 'percent difference', is_higher_better: true, description: 'Percent higher or lower than the state average' },
  { id: 'c1230000-0000-0000-0000-000000000001', goal_id: 'b1230000-0000-0000-0000-000000000001', name: 'NSCAS 4 ELA vs State Average', metric_type: 'percent', current_value: 12, target_value: 0, unit: 'percent difference', is_higher_better: true, description: 'Percent higher or lower than the state average' },

  // 1.3 metrics
  { id: 'c1300000-0000-0000-0000-000000000001', goal_id: 'b1300000-0000-0000-0000-000000000001', name: 'Instructional Model Self-Assessment Score', metric_type: 'rating', current_value: 3.65, target_value: 3.7, unit: 'rating', is_higher_better: true, description: '% meeting expectations' },

  // 1.4 metrics
  { id: 'c1400000-0000-0000-0000-000000000001', goal_id: 'b1400000-0000-0000-0000-000000000001', name: 'Status of Supporting Items', metric_type: 'percent', current_value: 100, target_value: 100, unit: '%', is_higher_better: true, description: 'Status of Supporting Items' },
  { id: 'c1410000-0000-0000-0000-000000000001', goal_id: 'b1410000-0000-0000-0000-000000000001', name: 'Instructors offering intervention', metric_type: 'percent', current_value: 96, target_value: 90, unit: '%', is_higher_better: true, description: 'Percent of instructors who personalize learning by offering intervention' },
  { id: 'c1420000-0000-0000-0000-000000000001', goal_id: 'b1420000-0000-0000-0000-000000000001', name: 'Instructors using data for struggling students', metric_type: 'percent', current_value: 96, target_value: 90, unit: '%', is_higher_better: true, description: 'Percent of instructors who use data to determine students who struggle' },
  { id: 'c1430000-0000-0000-0000-000000000001', goal_id: 'b1430000-0000-0000-0000-000000000001', name: 'Students feel offered help', metric_type: 'percent', current_value: 82, target_value: 80, unit: '%', is_higher_better: true, description: 'Percent of students who indicate teachers offer help' },
  { id: 'c1440000-0000-0000-0000-000000000001', goal_id: 'b1440000-0000-0000-0000-000000000001', name: 'Instructors using data for excelling students', metric_type: 'percent', current_value: 95, target_value: 90, unit: '%', is_higher_better: true, description: 'Percent of instructors who use data to determine which students excel' },
  { id: 'c1450000-0000-0000-0000-000000000001', goal_id: 'b1450000-0000-0000-0000-000000000001', name: 'Instructors offering extension', metric_type: 'percent', current_value: 87, target_value: 85, unit: '%', is_higher_better: true, description: 'Percent of instructors who offer extension' },
  { id: 'c1460000-0000-0000-0000-000000000001', goal_id: 'b1460000-0000-0000-0000-000000000001', name: 'Students given extension opportunities', metric_type: 'percent', current_value: 69, target_value: 70, unit: '%', is_higher_better: true, description: 'Percent of students given extension opportunities' },

  // 1.5 metrics
  { id: 'c1500000-0000-0000-0000-000000000001', goal_id: 'b1500000-0000-0000-0000-000000000001', name: '% complete audit of curriculum maps', metric_type: 'percent', current_value: 90, target_value: 90, unit: '%', is_higher_better: true, description: '% complete audit of curriculum maps' },

  // 1.6 metrics
  { id: 'c1600000-0000-0000-0000-000000000001', goal_id: 'b1600000-0000-0000-0000-000000000001', name: '% not at risk on SAEBRS PBiS screener', metric_type: 'percent', current_value: 69.8, target_value: 70, unit: '%', is_higher_better: true, description: '% not at risk on SAEBRS PBiS screener' },
  { id: 'c1610000-0000-0000-0000-000000000001', goal_id: 'b1610000-0000-0000-0000-000000000001', name: '# total major office referrals', metric_type: 'number', current_value: 5600, target_value: 6500, unit: 'count', is_higher_better: false, description: '# total major office referrals - LOWER is better' },
  { id: 'c1620000-0000-0000-0000-000000000001', goal_id: 'b1620000-0000-0000-0000-000000000001', name: '% of Students with 0-1 referrals', metric_type: 'percent', current_value: 85.22, target_value: 87, unit: '%', is_higher_better: true, description: '% of Students with 0-1 office referrals' },

  // 1.7 metrics
  { id: 'c1700000-0000-0000-0000-000000000001', goal_id: 'b1700000-0000-0000-0000-000000000001', name: '% complete integration of career readiness skills', metric_type: 'percent', current_value: 90, target_value: 90, unit: '%', is_higher_better: true, description: '% complete integration of career readiness skills to curriculum maps' },

  // 1.8 metrics
  { id: 'c1800000-0000-0000-0000-000000000001', goal_id: 'b1800000-0000-0000-0000-000000000001', name: 'Status of Supporting Items', metric_type: 'percent', current_value: 89, target_value: 100, unit: '%', is_higher_better: true, description: 'Status of Supporting Items' },
  { id: 'c1810000-0000-0000-0000-000000000001', goal_id: 'b1810000-0000-0000-0000-000000000001', name: '# of AP course registrations', metric_type: 'number', current_value: 985, target_value: 950, unit: 'count', is_higher_better: true, description: '# of AP course registrations' },
  { id: 'c1820000-0000-0000-0000-000000000001', goal_id: 'b1820000-0000-0000-0000-000000000001', name: '# in MCC, UNMC, zoo Career Academies', metric_type: 'number', current_value: 19, target_value: 15, unit: 'count', is_higher_better: true, description: '# in MCC, UNMC, zoo Career Academies' },
  { id: 'c1830000-0000-0000-0000-000000000001', goal_id: 'b1830000-0000-0000-0000-000000000001', name: '# Intern Omaha accepted offers', metric_type: 'number', current_value: 42, target_value: 35, unit: 'count', is_higher_better: true, description: '# Intern Omaha accepted offers' },
  { id: 'c1840000-0000-0000-0000-000000000001', goal_id: 'b1840000-0000-0000-0000-000000000001', name: '# UNO Dual Enrollments', metric_type: 'number', current_value: 503, target_value: 470, unit: 'count', is_higher_better: true, description: '# UNO Dual Enrollments' },
  { id: 'c1850000-0000-0000-0000-000000000001', goal_id: 'b1850000-0000-0000-0000-000000000001', name: '# MCC total hours', metric_type: 'number', current_value: 6200, target_value: 2500, unit: 'hours', is_higher_better: true, description: '# MCC total hours' },
];

// Time series data
const timeSeries: TimeSeries[] = [
  // 1.6.1 Office referrals
  { metric_id: 'c1610000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, period: '2021', period_type: 'annual', target_value: 7800, actual_value: 8200, status: 'off-target' },
  { metric_id: 'c1610000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, period: '2022', period_type: 'annual', target_value: 6800, actual_value: 6400, status: 'on-target' },
  { metric_id: 'c1610000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, period: '2023', period_type: 'annual', target_value: 6200, actual_value: 6200, status: 'on-target' },
  { metric_id: 'c1610000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, period: '2024', period_type: 'annual', target_value: 7400, actual_value: 5600, status: 'on-target' },

  // 1.6.2 Students with 0-1 referrals
  { metric_id: 'c1620000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, period: '2021', period_type: 'annual', target_value: 84, actual_value: 85, status: 'on-target' },
  { metric_id: 'c1620000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, period: '2022', period_type: 'annual', target_value: 85, actual_value: 91, status: 'on-target' },
  { metric_id: 'c1620000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, period: '2023', period_type: 'annual', target_value: 86, actual_value: 86, status: 'on-target' },
  { metric_id: 'c1620000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, period: '2024', period_type: 'annual', target_value: 87, actual_value: 89, status: 'on-target' },

  // 1.8.3 Avenue Scholars
  { metric_id: 'c1830000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, period: '2021', period_type: 'annual', target_value: 3, actual_value: 3, status: 'on-target' },
  { metric_id: 'c1830000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, period: '2022', period_type: 'annual', target_value: 25, actual_value: 25, status: 'on-target' },
  { metric_id: 'c1830000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, period: '2023', period_type: 'annual', target_value: 34, actual_value: 42, status: 'on-target' },
  { metric_id: 'c1830000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, period: '2024', period_type: 'annual', target_value: 34, actual_value: 25, status: 'off-target' },

  // 1.8.5 MCC Hours
  { metric_id: 'c1850000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, period: '2021', period_type: 'annual', target_value: 1500, actual_value: 2000, status: 'on-target' },
  { metric_id: 'c1850000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, period: '2022', period_type: 'annual', target_value: 2000, actual_value: 5000, status: 'on-target' },
  { metric_id: 'c1850000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, period: '2023', period_type: 'annual', target_value: 2500, actual_value: 6000, status: 'on-target' },
  { metric_id: 'c1850000-0000-0000-0000-000000000001', district_id: DISTRICT_ID, period: '2024', period_type: 'annual', target_value: 1000, actual_value: 6500, status: 'on-target' },
];

async function cleanup() {
  console.log('🧹 Cleaning up existing Objective 1 data...');

  // Delete time series first (references metrics)
  const { error: tsError } = await supabase
    .from('spb_metric_time_series')
    .delete()
    .in('metric_id', metrics.map(m => m.id));
  if (tsError) console.log('Time series cleanup:', tsError.message);

  // Delete metrics (references goals)
  const { error: metricsError } = await supabase
    .from('spb_metrics')
    .delete()
    .in('id', metrics.map(m => m.id));
  if (metricsError) console.log('Metrics cleanup:', metricsError.message);

  // Delete goals by level (children first)
  for (const level of [2, 1, 0]) {
    const goalsAtLevel = goals.filter(g => g.level === level);
    const { error } = await supabase
      .from('spb_goals')
      .delete()
      .in('id', goalsAtLevel.map(g => g.id));
    if (error) console.log(`Level ${level} goals cleanup:`, error.message);
  }

  console.log('✅ Cleanup complete');
}

async function importGoals() {
  console.log('📥 Importing goals...');

  // Insert by level (parents first)
  for (const level of [0, 1, 2]) {
    const goalsAtLevel = goals.filter(g => g.level === level);
    const { error, data } = await supabase
      .from('spb_goals')
      .insert(goalsAtLevel)
      .select();

    if (error) {
      console.error(`❌ Error inserting level ${level} goals:`, error);
      throw error;
    }
    console.log(`  Level ${level}: ${data.length} goals inserted`);
  }

  console.log('✅ Goals import complete');
}

async function importMetrics() {
  console.log('📥 Importing metrics...');

  const { error, data } = await supabase
    .from('spb_metrics')
    .insert(metrics)
    .select();

  if (error) {
    console.error('❌ Error inserting metrics:', error);
    throw error;
  }

  console.log(`✅ ${data.length} metrics imported`);
}

async function importTimeSeries() {
  console.log('📥 Importing time series data...');

  const { error, data } = await supabase
    .from('spb_metric_time_series')
    .insert(timeSeries)
    .select();

  if (error) {
    console.error('❌ Error inserting time series:', error);
    throw error;
  }

  console.log(`✅ ${data.length} time series records imported`);
}

async function verify() {
  console.log('\n📊 Verification:');

  const { data: goalsData } = await supabase
    .from('spb_goals')
    .select('goal_number, title, level')
    .eq('district_id', DISTRICT_ID)
    .like('goal_number', '1%')
    .order('goal_number');

  console.log(`  Goals: ${goalsData?.length || 0}`);

  const { data: metricsData } = await supabase
    .from('spb_metrics')
    .select('id')
    .in('goal_id', goals.map(g => g.id));

  console.log(`  Metrics: ${metricsData?.length || 0}`);

  const { data: tsData } = await supabase
    .from('spb_metric_time_series')
    .select('id')
    .eq('district_id', DISTRICT_ID);

  console.log(`  Time Series Records: ${tsData?.length || 0}`);

  console.log('\n🎉 Import complete! Visit the app to verify.');
}

async function main() {
  console.log('='.repeat(60));
  console.log('Westside Community Schools - Objective 1 Data Import');
  console.log('='.repeat(60));
  console.log(`Target: ${SUPABASE_URL}`);
  console.log(`District ID: ${DISTRICT_ID}\n`);

  try {
    // Verify district exists
    const { data: district, error: districtError } = await supabase
      .from('spb_districts')
      .select('name, slug')
      .eq('id', DISTRICT_ID)
      .single();

    if (districtError || !district) {
      throw new Error('Westside district not found. Please run setup first.');
    }
    console.log(`Found district: ${district.name} (${district.slug})\n`);

    await cleanup();
    await importGoals();
    await importMetrics();
    await importTimeSeries();
    await verify();

  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

main();
