-- ============================================================================
-- WESTSIDE OBJECTIVE 1: Student Achievement & Well-being
-- Source: OnStrategy CSV Export (January 2025)
-- ============================================================================
--
-- IMPORTANT: Run delete-objective1.sql FIRST to remove incorrect data
--
-- This file contains:
-- - 1 Objective (Level 0)
-- - 8 Goals (Level 1): 1.1 through 1.8
-- - 8 Metrics (one per goal)
-- - 32 Time Series records (4 years x 8 metrics)
-- ============================================================================

-- District ID for Westside
-- a0000000-0000-0000-0000-000000000002

-- ============================================================================
-- LEVEL 0: OBJECTIVE
-- ============================================================================

INSERT INTO spb_goals (id, district_id, goal_number, title, description, level, status, parent_id)
VALUES (
    'b1000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    '1',
    'Student Achievement & Well-being',
    'Ensure all students achieve academic success through high-quality instruction, personalized learning, social-emotional support, and career readiness preparation.',
    0,
    'on-target',
    NULL
);

SELECT 'Objective 1 created!' as step;

-- ============================================================================
-- LEVEL 1: GOALS (1.1 - 1.8)
-- ============================================================================

INSERT INTO spb_goals (id, district_id, goal_number, title, description, level, status, parent_id) VALUES
-- Goal 1.1: Sense of Belonging
('b1100000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.1',
 'Grow and nurture a district culture that values, demonstrates, and promotes a sense of belonging',
 'Foster an inclusive environment where all students, staff, families, and community members feel valued and connected.',
 1, 'on-target', 'b1000000-0000-0000-0000-000000000001'),

-- Goal 1.2: NDE Academic Classification
('b1200000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.2',
 'NDE Academic Classification',
 'Achieve and maintain excellent academic classification ratings from the Nebraska Department of Education.',
 1, 'on-target', 'b1000000-0000-0000-0000-000000000001'),

-- Goal 1.3: Teacher Instructional Model
('b1300000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.3',
 'Average Score of Teachers on the Instructional Model Self-Assessment Rubric',
 'Ensure teachers demonstrate proficiency in research-based instructional practices through ongoing self-assessment and professional development.',
 1, 'on-target', 'b1000000-0000-0000-0000-000000000001'),

-- Goal 1.4: Personalized Learning
('b1400000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.4',
 'Student learning is personalized with intervention and enrichment opportunities',
 'Provide differentiated instruction and targeted support to meet individual student needs through MTSS framework.',
 1, 'on-target', 'b1000000-0000-0000-0000-000000000001'),

-- Goal 1.5: Curriculum Review
('b1500000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.5',
 'Curriculum is regularly reviewed and updated',
 'Maintain current, standards-aligned curriculum through systematic review and continuous improvement processes.',
 1, 'on-target', 'b1000000-0000-0000-0000-000000000001'),

-- Goal 1.6: Social-Emotional Learning
('b1600000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.6',
 'All students learn and practice social-emotional skills',
 'Implement comprehensive SEL programming and monitor student well-being through universal screening.',
 1, 'on-target', 'b1000000-0000-0000-0000-000000000001'),

-- Goal 1.7: Career Readiness
('b1700000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.7',
 'Career readiness skills are integrated throughout K-12 curriculum',
 'Prepare students for college and career success through embedded career exploration and skill development.',
 1, 'on-target', 'b1000000-0000-0000-0000-000000000001'),

-- Goal 1.8: Dual Enrollment & Career Academies
('b1800000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1.8',
 'Dual enrollment coursework, career academies, and work-based learning opportunities',
 'Expand access to advanced coursework and real-world learning experiences for all students.',
 1, 'on-target', 'b1000000-0000-0000-0000-000000000001')

ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    status = EXCLUDED.status;

SELECT 'Goals 1.1-1.8 created!' as step;

-- ============================================================================
-- METRICS (one per goal)
-- ============================================================================

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type) VALUES

-- Metric for 1.1: Sense of Belonging (Rating 1-5)
('c1100000-0000-0000-0000-000000000001', 'b1100000-0000-0000-0000-000000000001',
 'Overall average of responses (1-5 rating)', 'rating',
 3.83, 3.66, 'rating', true,
 'Average rating from student, staff, and family surveys on sense of belonging',
 'gauge'),

-- Metric for 1.2: NDE Academic Classification (Score out of 100)
('c1200000-0000-0000-0000-000000000001', 'b1200000-0000-0000-0000-000000000001',
 'NDE Classification Score', 'number',
 100, 100, 'score', true,
 'Nebraska Department of Education academic classification score (Excellent=100, Great=90, Good=80)',
 'progress'),

-- Metric for 1.3: Teacher Instructional Model (Rating)
('c1300000-0000-0000-0000-000000000001', 'b1300000-0000-0000-0000-000000000001',
 'Instructional Model Self-Assessment Score', 'rating',
 3.67, 3.70, 'rating', true,
 'Average teacher self-assessment score on instructional model rubric',
 'gauge'),

-- Metric for 1.4: Personalized Learning (Percent)
('c1400000-0000-0000-0000-000000000001', 'b1400000-0000-0000-0000-000000000001',
 'Status of Supporting Items', 'percent',
 100, 100, '%', true,
 'Percentage of intervention and enrichment program elements fully implemented',
 'progress'),

-- Metric for 1.5: Curriculum Review (Percent)
('c1500000-0000-0000-0000-000000000001', 'b1500000-0000-0000-0000-000000000001',
 'Curriculum Maps Audit Completion', 'percent',
 100, 100, '%', true,
 'Percentage of curriculum maps reviewed and updated',
 'progress'),

-- Metric for 1.6: Social-Emotional Skills (Percent)
('c1600000-0000-0000-0000-000000000001', 'b1600000-0000-0000-0000-000000000001',
 'Students Not At Risk on SAEBRS', 'percent',
 52, 52, '%', true,
 'Percentage of students not identified as at-risk on SAEBRS PBiS universal screener',
 'progress'),

-- Metric for 1.7: Career Readiness (Percent)
('c1700000-0000-0000-0000-000000000001', 'b1700000-0000-0000-0000-000000000001',
 'Career Readiness Integration', 'percent',
 100, 100, '%', true,
 'Percentage of K-12 curriculum with integrated career readiness skills',
 'progress'),

-- Metric for 1.8: Dual Enrollment (Percent)
('c1800000-0000-0000-0000-000000000001', 'b1800000-0000-0000-0000-000000000001',
 'Dual Enrollment & Career Academy Status', 'percent',
 89, 100, '%', true,
 'Percentage of dual enrollment, career academy, and work-based learning program elements implemented',
 'progress')

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    current_value = EXCLUDED.current_value,
    target_value = EXCLUDED.target_value,
    description = EXCLUDED.description;

SELECT 'Metrics created!' as step;

-- ============================================================================
-- TIME SERIES DATA (4 years: 2021-2024)
-- ============================================================================

INSERT INTO spb_metric_time_series (id, metric_id, district_id, period, period_type, target_value, actual_value, status) VALUES

-- Goal 1.1: Sense of Belonging (Rating)
('d1100001-0000-0000-0000-000000000001', 'c1100000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2021', 'annual', 3.66, 3.66, 'on-target'),
('d1100002-0000-0000-0000-000000000001', 'c1100000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2022', 'annual', 3.66, 3.75, 'on-target'),
('d1100003-0000-0000-0000-000000000001', 'c1100000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2023', 'annual', 3.66, 3.74, 'on-target'),
('d1100004-0000-0000-0000-000000000001', 'c1100000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2024', 'annual', 3.66, 3.83, 'on-target'),

-- Goal 1.2: NDE Academic Classification
('d1200001-0000-0000-0000-000000000001', 'c1200000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2021', 'annual', 100, 90, 'off-target'),
('d1200002-0000-0000-0000-000000000001', 'c1200000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2022', 'annual', 100, NULL, 'no-data'),
('d1200003-0000-0000-0000-000000000001', 'c1200000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2023', 'annual', 100, NULL, 'no-data'),
('d1200004-0000-0000-0000-000000000001', 'c1200000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2024', 'annual', 100, 100, 'on-target'),

-- Goal 1.3: Teacher Instructional Model (Rating)
('d1300001-0000-0000-0000-000000000001', 'c1300000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2021', 'annual', 3.50, 3.59, 'on-target'),
('d1300002-0000-0000-0000-000000000001', 'c1300000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2022', 'annual', 3.60, 3.65, 'on-target'),
('d1300003-0000-0000-0000-000000000001', 'c1300000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2023', 'annual', 3.70, 3.65, 'off-target'),
('d1300004-0000-0000-0000-000000000001', 'c1300000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2024', 'annual', 3.70, 3.67, 'off-target'),

-- Goal 1.4: Personalized Learning (Percent)
('d1400001-0000-0000-0000-000000000001', 'c1400000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2021', 'annual', NULL, NULL, 'no-data'),
('d1400002-0000-0000-0000-000000000001', 'c1400000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2022', 'annual', 100, 97, 'off-target'),
('d1400003-0000-0000-0000-000000000001', 'c1400000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2023', 'annual', 100, 100, 'on-target'),
('d1400004-0000-0000-0000-000000000001', 'c1400000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2024', 'annual', 100, 100, 'on-target'),

-- Goal 1.5: Curriculum Review (Percent)
('d1500001-0000-0000-0000-000000000001', 'c1500000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2021', 'annual', 85, 85, 'on-target'),
('d1500002-0000-0000-0000-000000000001', 'c1500000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2022', 'annual', 85, 85, 'on-target'),
('d1500003-0000-0000-0000-000000000001', 'c1500000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2023', 'annual', 90, 90, 'on-target'),
('d1500004-0000-0000-0000-000000000001', 'c1500000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2024', 'annual', 100, 100, 'on-target'),

-- Goal 1.6: Social-Emotional Skills (Percent)
('d1600001-0000-0000-0000-000000000001', 'c1600000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2021', 'annual', 68, 69, 'on-target'),
('d1600002-0000-0000-0000-000000000001', 'c1600000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2022', 'annual', 69, 69.7, 'on-target'),
('d1600003-0000-0000-0000-000000000001', 'c1600000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2023', 'annual', 70, 69.8, 'off-target'),
('d1600004-0000-0000-0000-000000000001', 'c1600000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2024', 'annual', 52, 52, 'on-target'),

-- Goal 1.7: Career Readiness (Percent)
('d1700001-0000-0000-0000-000000000001', 'c1700000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2021', 'annual', 85, 85, 'on-target'),
('d1700002-0000-0000-0000-000000000001', 'c1700000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2022', 'annual', 85, 85, 'on-target'),
('d1700003-0000-0000-0000-000000000001', 'c1700000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2023', 'annual', 90, 90, 'on-target'),
('d1700004-0000-0000-0000-000000000001', 'c1700000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2024', 'annual', 100, 100, 'on-target'),

-- Goal 1.8: Dual Enrollment (Percent)
('d1800001-0000-0000-0000-000000000001', 'c1800000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2021', 'annual', 100, 100, 'on-target'),
('d1800002-0000-0000-0000-000000000001', 'c1800000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2022', 'annual', 100, 86, 'off-target'),
('d1800003-0000-0000-0000-000000000001', 'c1800000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2023', 'annual', 100, 89, 'off-target'),
('d1800004-0000-0000-0000-000000000001', 'c1800000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2024', 'annual', 100, 89, 'off-target')

ON CONFLICT (metric_id, period) DO UPDATE SET
    target_value = EXCLUDED.target_value,
    actual_value = EXCLUDED.actual_value,
    status = EXCLUDED.status;

SELECT 'Time series data created!' as step;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'IMPORT COMPLETE!' as status;

-- Summary counts
SELECT 'Goals' as type, COUNT(*) as count
FROM spb_goals
WHERE district_id = 'a0000000-0000-0000-0000-000000000002'
  AND goal_number LIKE '1%'

UNION ALL

SELECT 'Metrics' as type, COUNT(*) as count
FROM spb_metrics m
JOIN spb_goals g ON m.goal_id = g.id
WHERE g.district_id = 'a0000000-0000-0000-0000-000000000002'
  AND g.goal_number LIKE '1%'

UNION ALL

SELECT 'Time Series' as type, COUNT(*) as count
FROM spb_metric_time_series ts
JOIN spb_metrics m ON ts.metric_id = m.id
JOIN spb_goals g ON m.goal_id = g.id
WHERE g.district_id = 'a0000000-0000-0000-0000-000000000002'
  AND g.goal_number LIKE '1%';

-- Detailed goal list
SELECT goal_number, title, status
FROM spb_goals
WHERE district_id = 'a0000000-0000-0000-0000-000000000002'
  AND goal_number LIKE '1%'
ORDER BY goal_number;
