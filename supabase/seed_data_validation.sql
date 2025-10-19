-- ============================================================================
-- Seed Data Validation Script
-- ============================================================================
-- Purpose: Verify seed data loaded correctly with expected counts and structure
-- Usage: Run after `supabase db reset` to validate seed data integrity
-- ============================================================================

DO $$
DECLARE
  v_district_count INTEGER;
  v_westside_goal_count INTEGER;
  v_eastside_goal_count INTEGER;
  v_metric_count INTEGER;
  v_narrative_count INTEGER;
  v_stock_photo_count INTEGER;
  v_westside_id UUID;
  v_eastside_id UUID;
BEGIN
  -- Get district IDs
  SELECT id INTO v_westside_id FROM spb_districts WHERE slug = 'westside';
  SELECT id INTO v_eastside_id FROM spb_districts WHERE slug = 'eastside';

  -- ============================================================================
  -- Test 1: Verify Districts
  -- ============================================================================
  SELECT COUNT(*) INTO v_district_count FROM spb_districts;
  ASSERT v_district_count = 2,
    FORMAT('Expected 2 districts, found %s', v_district_count);

  ASSERT v_westside_id IS NOT NULL,
    'Westside district not found - check slug';

  ASSERT v_eastside_id IS NOT NULL,
    'Eastside district not found - check slug';

  RAISE NOTICE '✓ Districts: % found (expected 2)', v_district_count;

  -- ============================================================================
  -- Test 2: Verify Westside Goals (Comprehensive Dataset)
  -- ============================================================================
  SELECT COUNT(*) INTO v_westside_goal_count
  FROM spb_goals
  WHERE district_id = v_westside_id;

  ASSERT v_westside_goal_count = 16,
    FORMAT('Expected 16 Westside goals, found %s', v_westside_goal_count);

  -- Verify hierarchy levels
  ASSERT (SELECT COUNT(*) FROM spb_goals WHERE district_id = v_westside_id AND level = 0) = 2,
    'Expected 2 strategic objectives (level 0) for Westside';

  ASSERT (SELECT COUNT(*) FROM spb_goals WHERE district_id = v_westside_id AND level = 1) = 9,
    'Expected 9 goals (level 1) for Westside';

  ASSERT (SELECT COUNT(*) FROM spb_goals WHERE district_id = v_westside_id AND level = 2) = 5,
    'Expected 5 sub-goals (level 2) for Westside';

  RAISE NOTICE '✓ Westside Goals: % found (2 objectives, 9 goals, 5 sub-goals)', v_westside_goal_count;

  -- ============================================================================
  -- Test 3: Verify Eastside Goals (Minimal Dataset)
  -- ============================================================================
  SELECT COUNT(*) INTO v_eastside_goal_count
  FROM spb_goals
  WHERE district_id = v_eastside_id;

  ASSERT v_eastside_goal_count = 3,
    FORMAT('Expected 3 Eastside goals, found %s', v_eastside_goal_count);

  RAISE NOTICE '✓ Eastside Goals: % found (minimal test dataset)', v_eastside_goal_count;

  -- ============================================================================
  -- Test 4: Verify Metrics
  -- ============================================================================
  SELECT COUNT(*) INTO v_metric_count FROM spb_metrics;

  ASSERT v_metric_count >= 9,
    FORMAT('Expected at least 9 metrics, found %s', v_metric_count);

  -- Verify metric types
  ASSERT (SELECT COUNT(*) FROM spb_metrics WHERE metric_type = 'percent') >= 4,
    'Expected at least 4 percentage metrics';

  ASSERT (SELECT COUNT(*) FROM spb_metrics WHERE metric_type = 'rating') >= 2,
    'Expected at least 2 rating metrics';

  ASSERT (SELECT COUNT(*) FROM spb_metrics WHERE metric_type = 'narrative') = 1,
    'Expected exactly 1 narrative metric';

  -- Verify baseline values
  ASSERT (SELECT COUNT(*) FROM spb_metrics WHERE baseline_value IS NOT NULL) >= 1,
    'Expected at least 1 metric with baseline_value set';

  RAISE NOTICE '✓ Metrics: % found (various types)', v_metric_count;

  -- ============================================================================
  -- Test 5: Verify Narrative Content
  -- ============================================================================
  SELECT COUNT(*) INTO v_narrative_count FROM spb_metric_narratives;

  ASSERT v_narrative_count >= 1,
    FORMAT('Expected at least 1 narrative entry, found %s', v_narrative_count);

  RAISE NOTICE '✓ Narratives: % found', v_narrative_count;

  -- ============================================================================
  -- Test 6: Verify Stock Photos
  -- ============================================================================
  SELECT COUNT(*) INTO v_stock_photo_count FROM spb_stock_photos;

  ASSERT v_stock_photo_count >= 10,
    FORMAT('Expected at least 10 stock photos, found %s', v_stock_photo_count);

  RAISE NOTICE '✓ Stock Photos: % found', v_stock_photo_count;

  -- ============================================================================
  -- Test 7: Verify Cover Photos
  -- ============================================================================
  ASSERT (SELECT COUNT(*) FROM spb_goals
          WHERE cover_photo_url IS NOT NULL
          AND district_id = v_westside_id) >= 2,
    'Expected at least 2 Westside goals with cover photos';

  RAISE NOTICE '✓ Cover Photos: Assigned to strategic objectives';

  -- ============================================================================
  -- Test 8: Verify Status Values
  -- ============================================================================
  -- Check for valid goal statuses
  ASSERT (SELECT COUNT(*) FROM spb_goals
          WHERE status NOT IN ('on-target', 'off-target', 'at-risk', 'critical', 'not-started')) = 0,
    'Found goals with invalid status values';

  -- Check for valid metric statuses
  ASSERT (SELECT COUNT(*) FROM spb_metrics
          WHERE status IS NOT NULL
          AND status NOT IN ('on-target', 'near-target', 'off-target')) = 0,
    'Found metrics with invalid status values';

  RAISE NOTICE '✓ Status Values: All valid';

  -- ============================================================================
  -- Test 9: Verify Hierarchical Relationships
  -- ============================================================================
  -- Check parent-child relationships
  ASSERT (SELECT COUNT(*) FROM spb_goals g1
          JOIN spb_goals g2 ON g1.parent_id = g2.id
          WHERE g1.district_id != g2.district_id) = 0,
    'Found cross-district parent-child relationships (should not exist)';

  RAISE NOTICE '✓ Hierarchy: Parent-child relationships valid';

  -- ============================================================================
  -- Test 10: Verify Foreign Key Integrity
  -- ============================================================================
  -- All goals should have valid district_id
  ASSERT (SELECT COUNT(*) FROM spb_goals
          WHERE district_id NOT IN (SELECT id FROM spb_districts)) = 0,
    'Found goals with invalid district_id';

  -- All metrics should have valid goal_id
  ASSERT (SELECT COUNT(*) FROM spb_metrics
          WHERE goal_id NOT IN (SELECT id FROM spb_goals)) = 0,
    'Found metrics with invalid goal_id';

  RAISE NOTICE '✓ Foreign Keys: All relationships valid';

  -- ============================================================================
  -- Summary
  -- ============================================================================
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ SEED DATA VALIDATION PASSED!';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Districts:        %', v_district_count;
  RAISE NOTICE 'Westside Goals:   % (comprehensive)', v_westside_goal_count;
  RAISE NOTICE 'Eastside Goals:   % (minimal)', v_eastside_goal_count;
  RAISE NOTICE 'Metrics:          %', v_metric_count;
  RAISE NOTICE 'Narratives:       %', v_narrative_count;
  RAISE NOTICE 'Stock Photos:     %', v_stock_photo_count;
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Access URLs:';
  RAISE NOTICE '  Westside: http://localhost:5173/westside';
  RAISE NOTICE '  Eastside: http://localhost:5173/eastside';
  RAISE NOTICE '  Database: http://127.0.0.1:54323';
  RAISE NOTICE '';

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '❌ SEED DATA VALIDATION FAILED: %', SQLERRM;
END $$;
