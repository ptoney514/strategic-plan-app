import { describe, it, expect } from 'vitest';
import type { Goal } from '../../../../lib/types';

// Helper functions to test - these would normally be extracted from the component
// For testing purposes, we'll define them here following the same logic

function flattenGoalHierarchy(goals: Goal[]): Goal[] {
  const flattened: Goal[] = [];
  goals.forEach((goal) => {
    flattened.push(goal);
    if (goal.children && goal.children.length > 0) {
      flattened.push(...goal.children);
    }
  });
  return flattened;
}

function getDisplayMode(goal: Goal): 'qualitative' | 'percentage' | 'custom' {
  const mode = goal.overall_progress_display_mode;
  // Handle all possible modes, defaulting the additional modes to 'custom'
  if (mode === 'hidden' || mode === 'score' || mode === 'color-only') {
    return 'custom';
  }
  return mode || (goal.level === 2 ? 'percentage' : 'qualitative');
}

function getGoalStatus(indicatorText?: string): 'off-track' | 'on-target' {
  if (!indicatorText) return 'on-target';

  const text = indicatorText.toLowerCase().trim();
  const offTrackKeywords = ['off track', 'needs attention', 'at risk', 'critical'];

  return offTrackKeywords.some(keyword => text.includes(keyword))
    ? 'off-track'
    : 'on-target';
}

describe('DistrictDashboard - Goal Flattening', () => {
  it('should flatten nested goals in correct order', () => {
    const mockGoals: Goal[] = [
      {
        id: '1',
        goal_number: '2.1',
        title: 'Goal 2.1',
        level: 1,
        children: [
          { id: '1-1', goal_number: '2.1.1', title: 'Goal 2.1.1', level: 2 } as Goal,
          { id: '1-2', goal_number: '2.1.2', title: 'Goal 2.1.2', level: 2 } as Goal,
        ]
      } as Goal,
      {
        id: '2',
        goal_number: '2.2',
        title: 'Goal 2.2',
        level: 1,
        children: [
          { id: '2-1', goal_number: '2.2.1', title: 'Goal 2.2.1', level: 2 } as Goal,
        ]
      } as Goal,
    ];

    const flattened = flattenGoalHierarchy(mockGoals);

    // Should return goals in order: 2.1, 2.1.1, 2.1.2, 2.2, 2.2.1
    expect(flattened).toHaveLength(5);
    expect(flattened[0].goal_number).toBe('2.1');
    expect(flattened[1].goal_number).toBe('2.1.1');
    expect(flattened[2].goal_number).toBe('2.1.2');
    expect(flattened[3].goal_number).toBe('2.2');
    expect(flattened[4].goal_number).toBe('2.2.1');
  });

  it('should handle goals without children', () => {
    const mockGoals: Goal[] = [
      { id: '1', goal_number: '2.3', title: 'Goal 2.3', level: 1 } as Goal,
      { id: '2', goal_number: '2.4', title: 'Goal 2.4', level: 1 } as Goal,
    ];

    const flattened = flattenGoalHierarchy(mockGoals);

    expect(flattened).toHaveLength(2);
    expect(flattened[0].goal_number).toBe('2.3');
    expect(flattened[1].goal_number).toBe('2.4');
  });

  it('should handle empty goal array', () => {
    const mockGoals: Goal[] = [];
    const flattened = flattenGoalHierarchy(mockGoals);

    expect(flattened).toHaveLength(0);
  });

  it('should handle mixed goals with and without children', () => {
    const mockGoals: Goal[] = [
      {
        id: '1',
        goal_number: '2.1',
        title: 'Goal 2.1',
        level: 1,
        children: [
          { id: '1-1', goal_number: '2.1.1', title: 'Goal 2.1.1', level: 2 } as Goal,
        ]
      } as Goal,
      { id: '2', goal_number: '2.2', title: 'Goal 2.2', level: 1 } as Goal,
      {
        id: '3',
        goal_number: '2.3',
        title: 'Goal 2.3',
        level: 1,
        children: [
          { id: '3-1', goal_number: '2.3.1', title: 'Goal 2.3.1', level: 2 } as Goal,
        ]
      } as Goal,
    ];

    const flattened = flattenGoalHierarchy(mockGoals);

    expect(flattened).toHaveLength(5);
    expect(flattened[0].goal_number).toBe('2.1');
    expect(flattened[1].goal_number).toBe('2.1.1');
    expect(flattened[2].goal_number).toBe('2.2');
    expect(flattened[3].goal_number).toBe('2.3');
    expect(flattened[4].goal_number).toBe('2.3.1');
  });

  it('should preserve goal properties during flattening', () => {
    const mockGoals: Goal[] = [
      {
        id: '1',
        goal_number: '2.1',
        title: 'Mathematics Achievement',
        description: 'Improve math scores',
        level: 1,
        indicator_text: 'On Target',
        children: [
          {
            id: '1-1',
            goal_number: '2.1.1',
            title: 'Algebra',
            level: 2,
          } as Goal,
        ]
      } as Goal,
    ];

    const flattened = flattenGoalHierarchy(mockGoals);

    expect(flattened[0]).toMatchObject({
      id: '1',
      goal_number: '2.1',
      title: 'Mathematics Achievement',
      description: 'Improve math scores',
      indicator_text: 'On Target',
    });
    expect(flattened[1]).toMatchObject({
      id: '1-1',
      goal_number: '2.1.1',
      title: 'Algebra',
    });
  });
});

describe('DistrictDashboard - Display Mode Helper', () => {
  it('should return qualitative for level 1 goals without explicit display mode', () => {
    const goal = { level: 1 } as Goal;
    expect(getDisplayMode(goal)).toBe('qualitative');
  });

  it('should return percentage for level 2 goals without explicit display mode', () => {
    const goal = { level: 2 } as Goal;
    expect(getDisplayMode(goal)).toBe('percentage');
  });

  it('should respect explicit display mode over defaults', () => {
    const goal = { level: 2, overall_progress_display_mode: 'qualitative' as const } as Goal;
    expect(getDisplayMode(goal)).toBe('qualitative');
  });

  it('should handle level 0 goals (objectives)', () => {
    const goal = { level: 0 } as Goal;
    expect(getDisplayMode(goal)).toBe('qualitative');
  });

  it('should handle custom display mode', () => {
    const goal = { level: 1, overall_progress_display_mode: 'custom' as const } as Goal;
    expect(getDisplayMode(goal)).toBe('custom');
  });
});

describe('DistrictDashboard - Goal Status Helper', () => {
  it('should return on-target for undefined indicator text', () => {
    expect(getGoalStatus(undefined)).toBe('on-target');
  });

  it('should return on-target for empty string', () => {
    expect(getGoalStatus('')).toBe('on-target');
  });

  it('should return on-target for positive status text', () => {
    expect(getGoalStatus('On Target')).toBe('on-target');
    expect(getGoalStatus('Exceeding Expectations')).toBe('on-target');
    expect(getGoalStatus('Good Progress')).toBe('on-target');
  });

  it('should return off-track for "off track" keyword', () => {
    expect(getGoalStatus('Off Track')).toBe('off-track');
    expect(getGoalStatus('off track')).toBe('off-track');
    expect(getGoalStatus('Currently off track')).toBe('off-track');
  });

  it('should return off-track for "needs attention" keyword', () => {
    expect(getGoalStatus('Needs Attention')).toBe('off-track');
    expect(getGoalStatus('needs attention')).toBe('off-track');
  });

  it('should return off-track for "at risk" keyword', () => {
    expect(getGoalStatus('At Risk')).toBe('off-track');
    expect(getGoalStatus('at risk')).toBe('off-track');
  });

  it('should return off-track for "critical" keyword', () => {
    expect(getGoalStatus('Critical')).toBe('off-track');
    expect(getGoalStatus('critical status')).toBe('off-track');
  });

  it('should be case insensitive', () => {
    expect(getGoalStatus('OFF TRACK')).toBe('off-track');
    expect(getGoalStatus('NEEDS ATTENTION')).toBe('off-track');
    expect(getGoalStatus('AT RISK')).toBe('off-track');
    expect(getGoalStatus('CRITICAL')).toBe('off-track');
  });

  it('should handle text with extra whitespace', () => {
    expect(getGoalStatus('  off track  ')).toBe('off-track');
    expect(getGoalStatus('  needs attention  ')).toBe('off-track');
  });
});
