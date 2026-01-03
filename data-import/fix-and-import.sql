-- ============================================================================
-- FIX AMBIGUOUS COLUMN REFERENCE IN get_latest_actual FUNCTION
-- Then import Westside Objective 1 data
-- ============================================================================

-- STEP 1: Fix the get_latest_actual function (ambiguous 'period' column reference)
CREATE OR REPLACE FUNCTION get_latest_actual(
    p_metric_id UUID
) RETURNS TABLE(value DECIMAL, period VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT ts.actual_value, ts.period
    FROM spb_metric_time_series ts
    WHERE ts.metric_id = p_metric_id
    AND ts.actual_value IS NOT NULL
    ORDER BY
        CASE
            WHEN ts.period_type = 'annual' THEN ts.period || '-12-31'
            WHEN ts.period_type = 'quarterly' THEN
                CASE
                    WHEN ts.period LIKE '%-Q1' THEN SUBSTRING(ts.period, 1, 4) || '-03-31'
                    WHEN ts.period LIKE '%-Q2' THEN SUBSTRING(ts.period, 1, 4) || '-06-30'
                    WHEN ts.period LIKE '%-Q3' THEN SUBSTRING(ts.period, 1, 4) || '-09-30'
                    WHEN ts.period LIKE '%-Q4' THEN SUBSTRING(ts.period, 1, 4) || '-12-31'
                END
            WHEN ts.period_type = 'monthly' THEN ts.period || '-01'
        END::DATE DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

SELECT 'Function fixed!' as step;

-- ============================================================================
-- STEP 2: IMPORT WESTSIDE OBJECTIVE 1 DATA
-- ============================================================================

-- District ID for Westside
-- a0000000-0000-0000-0000-000000000002

-- ============================================================================
-- GOALS HIERARCHY (Levels: 0=Objective, 1=Goals, 2=Sub-goals)
-- ============================================================================

-- Level 0: OBJECTIVE 1 (already exists - let's check first)
INSERT INTO spb_goals (id, district_id, goal_number, title, description, level, status, parent_id)
VALUES ('b1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1',
        'Educational Equity',
        'Westside will ensure that all students in the district experience a fair and impartial educational system that provides access to opportunities and resources based on their unique needs, and a diverse representation of perspectives and contributions.',
        0, 'on-target', NULL)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

SELECT 'Objective 1 inserted/updated!' as step;

-- Level 1: Goals 1.1 - 1.8
INSERT INTO spb_goals (id, district_id, goal_number, title, description, level, status, parent_id) VALUES
-- Goal 1.1
('b1100000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.1',
 'Support a culture and climate that creates a "Sense of Belonging" for all students, staff, families, and the community.',
 NULL, 1, 'on-target', 'b1000000-0000-0000-0000-000000000001'),

-- Goal 1.2
('b1200000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.2',
 'Ensure all students who are eligible for and interested in coursework that leads to advanced or extended learning opportunities, have access to programs and supports to meet their needs.',
 NULL, 1, 'on-target', 'b1000000-0000-0000-0000-000000000001'),

-- Goal 1.3
('b1300000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.3',
 'Establish district-wide, multi-tiered systems of supports to meet the unique learning needs of students.',
 NULL, 1, 'on-target', 'b1000000-0000-0000-0000-000000000001'),

-- Goal 1.4
('b1400000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.4',
 'Establish a hiring process that includes enhanced strategies to help attract, hire, and retain staff members who reflect the demographics of the students they serve and the community.',
 NULL, 1, 'on-target', 'b1000000-0000-0000-0000-000000000001'),

-- Goal 1.5
('b1500000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.5',
 'Establish a student discipline system that includes positive behavior interventions and supports and ensures that discipline is equitable, restorative, and keeps students in school.',
 NULL, 1, 'on-target', 'b1000000-0000-0000-0000-000000000001'),

-- Goal 1.6
('b1600000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.6',
 'Strengthen the District curriculum to ensure all students have access to a high-quality and diverse curriculum that prepares students for the world in which they will work, live, and lead.',
 NULL, 1, 'on-target', 'b1000000-0000-0000-0000-000000000001'),

-- Goal 1.7
('b1700000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.7',
 'Develop a robust system to monitor resources for all students, specifically SPED students.',
 NULL, 1, 'on-target', 'b1000000-0000-0000-0000-000000000001'),

-- Goal 1.8
('b1800000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.8',
 'Increase student access to social-emotional learning opportunities and mental health resources.',
 NULL, 1, 'on-target', 'b1000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

SELECT 'Goals 1.1-1.8 inserted!' as step;

-- Level 2: Sub-goals
INSERT INTO spb_goals (id, district_id, goal_number, title, description, level, status, parent_id) VALUES
-- Sub-goals under 1.2
('b1210000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.2.1',
 'Increase proportionate representation in Advanced Placement (AP) courses to within +/- 5% of the district''s overall demographics.',
 NULL, 2, 'on-target', 'b1200000-0000-0000-0000-000000000001'),

('b1220000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.2.2',
 'Increase proportionate representation in Accelerated and Honors courses (secondary) to within +/- 5% of the district''s overall demographics.',
 NULL, 2, 'on-target', 'b1200000-0000-0000-0000-000000000001'),

('b1230000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.2.3',
 'Increase proportionate representation in Extended Learning (elementary) to within +/- 5% of the district''s overall demographics.',
 NULL, 2, 'on-target', 'b1200000-0000-0000-0000-000000000001'),

-- Sub-goals under 1.3
('b1310000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.3.1',
 'Increase the number of students exiting Special Education (Elementary).',
 NULL, 2, 'on-target', 'b1300000-0000-0000-0000-000000000001'),

('b1320000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.3.2',
 'Increase the number of students exiting Special Education (Secondary).',
 NULL, 2, 'on-target', 'b1300000-0000-0000-0000-000000000001'),

-- Sub-goals under 1.4
('b1410000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.4.1',
 'Increase the number of "non-white" applicants for teaching and administrative positions.',
 NULL, 2, 'on-target', 'b1400000-0000-0000-0000-000000000001'),

('b1420000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.4.2',
 'Increase the number of "non-white" teachers hired in the District.',
 NULL, 2, 'on-target', 'b1400000-0000-0000-0000-000000000001'),

('b1430000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.4.3',
 'Increase the number of "non-white" administrators hired in the District.',
 NULL, 2, 'on-target', 'b1400000-0000-0000-0000-000000000001'),

-- Sub-goals under 1.5
('b1510000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.5.1',
 'Decrease the discipline disproportionality in the District.',
 NULL, 2, 'on-target', 'b1500000-0000-0000-0000-000000000001'),

('b1520000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.5.2',
 'Reduce the number of overall office referrals leading to out-of-school consequences in the District.',
 NULL, 2, 'on-target', 'b1500000-0000-0000-0000-000000000001'),

-- Sub-goals under 1.6
('b1610000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.6.1',
 'Develop a well-rounded curriculum.',
 NULL, 2, 'on-target', 'b1600000-0000-0000-0000-000000000001'),

('b1620000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.6.2',
 'Ensure that the District and building libraries contain a diverse, balanced and inclusive range of resources.',
 NULL, 2, 'on-target', 'b1600000-0000-0000-0000-000000000001'),

-- Sub-goals under 1.7
('b1710000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.7.1',
 'Reduce the time to complete a special education evaluation and achieve full compliance with federal regulation timelines.',
 NULL, 2, 'on-target', 'b1700000-0000-0000-0000-000000000001'),

-- Sub-goals under 1.8
('b1810000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.8.1',
 'Continue to provide opportunities for student engagement with mental health and coping strategies.',
 NULL, 2, 'on-target', 'b1800000-0000-0000-0000-000000000001'),

('b1820000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.8.2',
 'Increase the number of staff trained in Youth Mental Health First Aid.',
 NULL, 2, 'on-target', 'b1800000-0000-0000-0000-000000000001'),

('b1830000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.8.3',
 'Increase the number of staff with additional training to support student mental health.',
 NULL, 2, 'on-target', 'b1800000-0000-0000-0000-000000000001'),

('b1840000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.8.4',
 'Increase the counselor to student ratio.',
 NULL, 2, 'on-target', 'b1800000-0000-0000-0000-000000000001'),

('b1850000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.8.5',
 'Reduce barriers to accessing mental health services.',
 NULL, 2, 'on-target', 'b1800000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

SELECT 'Sub-goals inserted!' as step;

-- ============================================================================
-- METRICS (with visualization_type)
-- ============================================================================

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type) VALUES
-- Goal 1.1: Sense of Belonging
('c1100000-0000-0000-0000-000000000001', 'b1100000-0000-0000-0000-000000000001',
 'Sense of Belonging Rating', 'rating', 3.74, 3.66, 'rating (1-5)', true,
 'Overall average of responses (1-5 rating) on sense of belonging', 'gauge'),

-- Goal 1.2.1: AP Proportionate Representation
('c1210000-0000-0000-0000-000000000001', 'b1210000-0000-0000-0000-000000000001',
 'Non-White AP Enrollment Ratio', 'percent', 0.44, 0.95, 'ratio to demographics', true,
 'Proportionate representation of non-white students in AP courses', 'progress'),

-- Goal 1.2.2: Accelerated/Honors Representation
('c1220000-0000-0000-0000-000000000001', 'b1220000-0000-0000-0000-000000000001',
 'Non-White Accelerated/Honors Enrollment Ratio', 'percent', 0.60, 0.95, 'ratio to demographics', true,
 'Proportionate representation of non-white students in Accelerated/Honors courses', 'progress'),

-- Goal 1.2.3: Extended Learning Representation
('c1230000-0000-0000-0000-000000000001', 'b1230000-0000-0000-0000-000000000001',
 'Non-White Extended Learning Enrollment Ratio', 'percent', 0.52, 0.95, 'ratio to demographics', true,
 'Proportionate representation of non-white students in Extended Learning', 'progress'),

-- Goal 1.3.1: SPED Exits Elementary
('c1310000-0000-0000-0000-000000000001', 'b1310000-0000-0000-0000-000000000001',
 'Elementary SPED Exits', 'number', 19.00, 55.00, 'students', true,
 'Number of students exiting Special Education at elementary level', 'bar'),

-- Goal 1.3.2: SPED Exits Secondary
('c1320000-0000-0000-0000-000000000001', 'b1320000-0000-0000-0000-000000000001',
 'Secondary SPED Exits', 'number', 4.00, 28.00, 'students', true,
 'Number of students exiting Special Education at secondary level', 'bar'),

-- Goal 1.4.1: Non-White Applicants
('c1410000-0000-0000-0000-000000000001', 'b1410000-0000-0000-0000-000000000001',
 'Non-White Applicants Percentage', 'percent', 7.37, 25.00, 'percent', true,
 'Percentage of non-white applicants for teaching and administrative positions', 'progress'),

-- Goal 1.4.2: Non-White Teachers Hired
('c1420000-0000-0000-0000-000000000001', 'b1420000-0000-0000-0000-000000000001',
 'Non-White Teachers Hired Percentage', 'percent', 5.50, 25.00, 'percent', true,
 'Percentage of non-white teachers hired in the District', 'progress'),

-- Goal 1.4.3: Non-White Administrators Hired
('c1430000-0000-0000-0000-000000000001', 'b1430000-0000-0000-0000-000000000001',
 'Non-White Administrators Hired Percentage', 'percent', 0.00, 25.00, 'percent', true,
 'Percentage of non-white administrators hired in the District', 'progress'),

-- Goal 1.5.1: Discipline Disproportionality
('c1510000-0000-0000-0000-000000000001', 'b1510000-0000-0000-0000-000000000001',
 'Discipline Risk Ratio', 'number', 2.27, 2.00, 'risk ratio', false,
 'Discipline disproportionality risk ratio (lower is better)', 'gauge'),

-- Goal 1.5.2: Office Referrals
('c1520000-0000-0000-0000-000000000001', 'b1520000-0000-0000-0000-000000000001',
 'Out-of-School Consequences', 'number', 382.00, 344.00, 'referrals', false,
 'Number of office referrals leading to out-of-school consequences', 'bar'),

-- Goal 1.6.1: Well-Rounded Curriculum
('c1610000-0000-0000-0000-000000000001', 'b1610000-0000-0000-0000-000000000001',
 'Well-Rounded Curriculum', 'rating', NULL, NULL, 'n/a', true,
 'Well-rounded curriculum development (Roll up metric)', 'number'),

-- Goal 1.6.2: Diverse Library Resources
('c1620000-0000-0000-0000-000000000001', 'b1620000-0000-0000-0000-000000000001',
 'Diverse Library Resources', 'rating', NULL, NULL, 'n/a', true,
 'Diverse, balanced and inclusive library resources (Roll up metric)', 'number'),

-- Goal 1.7.1: SPED Evaluation Timeline Compliance
('c1710000-0000-0000-0000-000000000001', 'b1710000-0000-0000-0000-000000000001',
 'SPED Evaluation Timeline Compliance', 'percent', 97.00, 100.00, 'percent', true,
 'Percentage of SPED evaluations completed within federal timelines', 'gauge'),

-- Goal 1.8.1: Student SEL Engagement
('c1810000-0000-0000-0000-000000000001', 'b1810000-0000-0000-0000-000000000001',
 'Student SEL Engagement', 'rating', NULL, NULL, 'n/a', true,
 'Student engagement with mental health and coping strategies (Roll up metric)', 'number'),

-- Goal 1.8.2: Youth Mental Health First Aid Training
('c1820000-0000-0000-0000-000000000001', 'b1820000-0000-0000-0000-000000000001',
 'Staff YMHFA Trained', 'number', 216.00, 150.00, 'staff members', true,
 'Number of staff trained in Youth Mental Health First Aid', 'progress'),

-- Goal 1.8.3: Additional Mental Health Training
('c1830000-0000-0000-0000-000000000001', 'b1830000-0000-0000-0000-000000000001',
 'Staff Additional MH Training', 'number', 75.00, 25.00, 'staff members', true,
 'Number of staff with additional training to support student mental health', 'progress'),

-- Goal 1.8.4: Counselor to Student Ratio
('c1840000-0000-0000-0000-000000000001', 'b1840000-0000-0000-0000-000000000001',
 'Counselor to Student Ratio', 'rating', NULL, NULL, 'ratio', true,
 'Counselor to student ratio (Roll up metric)', 'number'),

-- Goal 1.8.5: Mental Health Access Barriers
('c1850000-0000-0000-0000-000000000001', 'b1850000-0000-0000-0000-000000000001',
 'Mental Health Access Barriers', 'rating', NULL, NULL, 'n/a', true,
 'Barriers to accessing mental health services (Roll up metric)', 'number')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  current_value = EXCLUDED.current_value,
  target_value = EXCLUDED.target_value,
  description = EXCLUDED.description;

SELECT 'Metrics inserted!' as step;

-- ============================================================================
-- TIME SERIES DATA (Historical values)
-- ============================================================================

INSERT INTO spb_metric_time_series (id, metric_id, district_id, period, period_type, target_value, actual_value, status) VALUES
-- Goal 1.1: Sense of Belonging (Annual)
('d1100000-0000-0000-0000-000000000001', 'c1100000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2021', 'annual', 3.50, 3.74, 'on-target'),
('d1100000-0000-0000-0000-000000000002', 'c1100000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2022', 'annual', 3.57, 3.76, 'on-target'),
('d1100000-0000-0000-0000-000000000003', 'c1100000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2023', 'annual', 3.62, 3.65, 'on-target'),
('d1100000-0000-0000-0000-000000000004', 'c1100000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2024', 'annual', 3.66, 3.74, 'on-target'),

-- Goal 1.2.1: AP Representation (Annual)
('d1210000-0000-0000-0000-000000000001', 'c1210000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2021', 'annual', 0.95, 0.22, 'critical'),
('d1210000-0000-0000-0000-000000000002', 'c1210000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2022', 'annual', 0.95, 0.40, 'off-target'),
('d1210000-0000-0000-0000-000000000003', 'c1210000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2023', 'annual', 0.95, 0.40, 'off-target'),
('d1210000-0000-0000-0000-000000000004', 'c1210000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2024', 'annual', 0.95, 0.44, 'off-target'),

-- Goal 1.5.1: Discipline Risk Ratio (Annual)
('d1510000-0000-0000-0000-000000000001', 'c1510000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2021', 'annual', 2.40, 2.61, 'off-target'),
('d1510000-0000-0000-0000-000000000002', 'c1510000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2022', 'annual', 2.20, 2.49, 'off-target'),
('d1510000-0000-0000-0000-000000000003', 'c1510000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2023', 'annual', 2.10, 2.56, 'off-target'),
('d1510000-0000-0000-0000-000000000004', 'c1510000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2024', 'annual', 2.00, 2.27, 'off-target'),

-- Goal 1.5.2: Out-of-School Consequences (Annual)
('d1520000-0000-0000-0000-000000000001', 'c1520000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2021', 'annual', 430.00, 430.00, 'on-target'),
('d1520000-0000-0000-0000-000000000002', 'c1520000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2022', 'annual', 401.00, 534.00, 'critical'),
('d1520000-0000-0000-0000-000000000003', 'c1520000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2023', 'annual', 373.00, 580.00, 'critical'),
('d1520000-0000-0000-0000-000000000004', 'c1520000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2024', 'annual', 344.00, 382.00, 'off-target')
ON CONFLICT (metric_id, period) DO UPDATE SET
  target_value = EXCLUDED.target_value,
  actual_value = EXCLUDED.actual_value,
  status = EXCLUDED.status;

SELECT 'Time series data inserted!' as step;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'IMPORT COMPLETE!' as status;

SELECT
  'Goals' as type,
  COUNT(*) as count
FROM spb_goals
WHERE district_id = 'a0000000-0000-0000-0000-000000000002'
  AND goal_number LIKE '1%'

UNION ALL

SELECT
  'Metrics' as type,
  COUNT(*) as count
FROM spb_metrics m
JOIN spb_goals g ON m.goal_id = g.id
WHERE g.district_id = 'a0000000-0000-0000-0000-000000000002'
  AND g.goal_number LIKE '1%'

UNION ALL

SELECT
  'Time Series' as type,
  COUNT(*) as count
FROM spb_metric_time_series ts
WHERE ts.district_id = 'a0000000-0000-0000-0000-000000000002';
