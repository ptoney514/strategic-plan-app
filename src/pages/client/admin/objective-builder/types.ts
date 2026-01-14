import type { Goal, Metric } from '../../../../lib/types';
import type { ReactNode } from 'react';

export interface ComponentItem {
  id: string;
  type: 'goal' | 'metric' | 'property';
  icon: ReactNode;
  label: string;
  description: string;
  category: string;
}

export type GoalWithChildren = Partial<Goal> & {
  children?: GoalWithChildren[];
}

export interface BuilderState {
  objective: Partial<Goal>;
  goals: GoalWithChildren[];
  activeSlot: 'basic' | 'visual' | 'goals' | 'metrics' | 'properties' | null;
  visibleComponents: {
    title: boolean;
    description: boolean;
    cardColor: boolean;
    cardImage: boolean;
    progressBar: boolean;
    visualBadge: boolean;
  };
}

export interface GoalFormState {
  title: string;
  description: string;
  indicator_text: string;
  indicator_color: string;
  metrics: Metric[];
  show_progress_bar: boolean;
  overall_progress_display_mode: 'percentage' | 'qualitative' | 'custom';
  overall_progress_custom_value: string;
  overall_progress_override: number | undefined;
}

export interface ValidationErrors {
  objectiveTitle?: string;
  objectiveDescription?: string;
  goals?: { [key: number]: string };
}

export const INITIAL_BUILDER_STATE: BuilderState = {
  objective: {
    title: '',
    description: '',
    level: 0,
  },
  goals: [],
  activeSlot: null,
  visibleComponents: {
    title: true,
    description: true,
    cardColor: true,
    cardImage: true,
    progressBar: true,
    visualBadge: true,
  },
};

export const INITIAL_GOAL_FORM: GoalFormState = {
  title: '',
  description: '',
  indicator_text: '',
  indicator_color: '#10b981',
  metrics: [],
  show_progress_bar: true,
  overall_progress_display_mode: 'percentage',
  overall_progress_custom_value: '',
  overall_progress_override: undefined,
};
