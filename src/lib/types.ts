// Dashboard Template Types
export type DashboardTemplate = 'hierarchical' | 'metrics-grid' | 'launch-traction';

export interface DashboardConfig {
  showSidebar?: boolean;
  showNarrativeHero?: boolean;
  gridColumns?: 2 | 3 | 4;
  enableAnimations?: boolean;
  cardVariant?: 'default' | 'compact' | 'rich';
}

export interface District {
  id: string;
  name: string;
  slug: string;
  entity_type?: string;
  entity_label?: string;
  tagline?: string;
  primary_color: string;
  secondary_color?: string;
  logo_url?: string;
  admin_email: string;
  is_public: boolean;
  is_active?: boolean;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Dashboard template configuration
  dashboard_template?: DashboardTemplate;
  dashboard_config?: DashboardConfig;
  // Onboarding fields
  onboarding_completed?: boolean;
  template_mode?: string;
  created_by?: string;
  // Computed fields (populated by service layer)
  goals_count?: number;
  admins_count?: number;
  district_id?: string;
}

export interface DistrictWithSummary extends District {
  goalCount?: number;
  strategyCount?: number;
  subGoalCount?: number;
  lastActivity?: string;
}

export interface Plan {
  id: string;
  district_id: string | null;
  name: string;
  slug: string;
  type_label?: string;          // Free-form: "Strategic", "Functional", "Annual", etc.
  description?: string;
  is_public: boolean;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  order_position: number;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PlanWithSummary extends Plan {
  objectiveCount?: number;
  goalCount?: number;
  overallProgress?: number;
}

export interface Goal {
  id: string;
  district_id: string | null;
  plan_id?: string | null;      // Plan this objective belongs to (only for level 0 goals)
  parent_id: string | null;
  goal_number: string;
  title: string;
  description?: string;
  level: 0 | 1 | 2 | 3;
  order_position: number;
  created_at: string;
  updated_at: string;
  owner_name?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  status?: string;
  children?: Goal[];
  overall_progress?: number;
  overall_progress_display_mode?: 'percentage' | 'qualitative' | 'score' | 'color-only' | 'hidden' | 'custom';
}

export interface HierarchicalGoal extends Goal {
  children: HierarchicalGoal[];
}

export function buildGoalHierarchy(goals: Goal[]): HierarchicalGoal[] {
  const goalMap = new Map<string, HierarchicalGoal>();
  const rootGoals: HierarchicalGoal[] = [];

  goals.forEach(goal => {
    goalMap.set(goal.id, { ...goal, children: [] });
  });

  goals.forEach(goal => {
    const hierarchicalGoal = goalMap.get(goal.id)!;
    if (!goal.parent_id) {
      rootGoals.push(hierarchicalGoal);
    } else {
      const parent = goalMap.get(goal.parent_id);
      if (parent) {
        parent.children.push(hierarchicalGoal);
      } else {
        rootGoals.push(hierarchicalGoal);
      }
    }
  });

  const sortGoals = (goals: HierarchicalGoal[]) => {
    goals.sort((a, b) => {
      const aParts = a.goal_number.split('.').map(Number);
      const bParts = b.goal_number.split('.').map(Number);
      
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = aParts[i] || 0;
        const bPart = bParts[i] || 0;
        if (aPart !== bPart) {
          return aPart - bPart;
        }
      }
      return 0;
    });

    goals.forEach(goal => {
      if (goal.children && goal.children.length > 0) {
        sortGoals(goal.children);
      }
    });
  };

  sortGoals(rootGoals);
  return rootGoals;
}

export function getNextGoalNumber(
  goals: Goal[],
  parentId: string | null,
  level: 0 | 1 | 2 | 3
): string {
  const siblingGoals = goals.filter(
    g => g.parent_id === parentId && g.level === level
  );

  if (siblingGoals.length === 0) {
    if (!parentId || level === 0) {
      return '1';
    }
    const parent = goals.find(g => g.id === parentId);
    if (parent) {
      return `${parent.goal_number}.1`;
    }
    return '1';
  }

  const numbers = siblingGoals
    .map(g => {
      const parts = g.goal_number.split('.');
      return parseInt(parts[parts.length - 1], 10);
    })
    .filter(n => !isNaN(n));

  const maxNumber = Math.max(...numbers, 0);
  
  if (!parentId || level === 0) {
    return String(maxNumber + 1);
  }
  
  const parent = goals.find(g => g.id === parentId);
  if (parent) {
    return `${parent.goal_number}.${maxNumber + 1}`;
  }
  
  return String(maxNumber + 1);
}

