/**
 * Validation utilities for ObjectiveBuilder
 */

export function validateObjectiveTitle(title: string): string | undefined {
  if (!title.trim()) {
    return 'Title is required';
  }
  if (title.trim().length < 3) {
    return 'Title must be at least 3 characters';
  }
  if (title.trim().length > 200) {
    return 'Title must be less than 200 characters';
  }
  return undefined;
}

export function validateObjectiveDescription(description: string): string | undefined {
  if (description && description.length > 2000) {
    return 'Description must be less than 2000 characters';
  }
  return undefined;
}

export function validateGoalTitle(title: string): string | undefined {
  if (!title.trim()) {
    return 'Goal title is required';
  }
  if (title.trim().length < 3) {
    return 'Goal title must be at least 3 characters';
  }
  if (title.trim().length > 200) {
    return 'Goal title must be less than 200 characters';
  }
  return undefined;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateBuilder(
  objective: { title?: string; description?: string },
  goals: Array<{ title?: string }>,
  entityLabel: string,
  childLabelSingular: string
): ValidationResult {
  // Validate required fields
  if (!objective.title?.trim()) {
    return { isValid: false, error: `Please enter a ${entityLabel.toLowerCase()} title` };
  }

  // Validate title length
  if (objective.title.trim().length < 3) {
    return { isValid: false, error: `${entityLabel} title must be at least 3 characters long` };
  }

  if (objective.title.trim().length > 200) {
    return { isValid: false, error: `${entityLabel} title must be less than 200 characters` };
  }

  // Validate description length if provided
  if (objective.description && objective.description.length > 2000) {
    return { isValid: false, error: 'Description must be less than 2000 characters' };
  }

  // Validate child goals/sub-goals
  for (let i = 0; i < goals.length; i++) {
    const goal = goals[i];
    if (!goal.title?.trim()) {
      return { isValid: false, error: `${childLabelSingular} ${i + 1} is missing a title` };
    }
    if (goal.title.trim().length < 3) {
      return { isValid: false, error: `${childLabelSingular} ${i + 1} title must be at least 3 characters long` };
    }
    if (goal.title.trim().length > 200) {
      return { isValid: false, error: `${childLabelSingular} ${i + 1} title must be less than 200 characters` };
    }
  }

  return { isValid: true };
}
