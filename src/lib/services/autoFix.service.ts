import { supabase } from '../supabase';
import type {
  StagedGoal,
  AutoFixSuggestion,
  ParsedGoal
} from '../types/import.types';
import { ValidationService } from './validation.service';

/**
 * Auto-Fix Service
 * Handles automatic fixing of common import issues
 */
export class AutoFixService {

  /**
   * Detect all missing parents in a set of goals
   */
  static detectMissingParents(
    goals: ParsedGoal[],
    existingGoals: any[]
  ): Map<string, AutoFixSuggestion> {
    const missingParents = new Map<string, AutoFixSuggestion>();

    goals.forEach(goal => {
      if (goal.level > 0 && goal.goal_number) {
        const parentNumber = this.getParentGoalNumber(goal.goal_number);

        if (parentNumber && !missingParents.has(parentNumber)) {
          // Check if parent exists in import or database
          const parentExists =
            goals.some(g => g.goal_number === parentNumber) ||
            existingGoals.some(g => g.goal_number === parentNumber);

          if (!parentExists) {
            const parentLevel = ValidationService.calculateLevel(parentNumber);
            const levelLabel = parentLevel === 0 ? 'Strategic Objective' : parentLevel === 1 ? 'Goal' : 'Goal';

            missingParents.set(parentNumber, {
              type: 'create-parent',
              missingGoalNumber: parentNumber,
              suggestedTitle: `${levelLabel} ${parentNumber} (Please rename)`,
              suggestedOwner: goal.owner_name,
              suggestedLevel: parentLevel,
              action: `Create placeholder ${levelLabel.toLowerCase()} "${parentNumber}"`
            });
          }
        }
      }
    });

    return missingParents;
  }

  /**
   * Generate a placeholder goal from an auto-fix suggestion
   */
  static generatePlaceholderGoal(
    suggestion: AutoFixSuggestion,
    sessionId: string,
    title?: string,
    owner?: string
  ): Partial<StagedGoal> {
    return {
      import_session_id: sessionId,
      row_number: -1, // Special marker for auto-generated
      raw_data: { auto_generated: true },
      parsed_hierarchy: `|${suggestion.missingGoalNumber}|`,
      goal_number: suggestion.missingGoalNumber,
      title: title || suggestion.suggestedTitle || `Goal ${suggestion.missingGoalNumber}`,
      description: 'Auto-generated placeholder goal - Please update',
      level: suggestion.suggestedLevel,
      owner_name: owner || suggestion.suggestedOwner,
      validation_status: 'valid',
      validation_messages: ['Auto-generated placeholder'],
      is_mapped: false,
      action: 'create',
      is_auto_generated: true
    };
  }

  /**
   * Apply auto-fix by inserting placeholder into staging table
   */
  static async applyAutoFix(
    sessionId: string,
    suggestion: AutoFixSuggestion,
    customTitle?: string,
    customOwner?: string
  ): Promise<StagedGoal> {
    const placeholderGoal = this.generatePlaceholderGoal(
      suggestion,
      sessionId,
      customTitle,
      customOwner
    );

    const { data, error } = await supabase
      .from('spb_staged_goals')
      .insert(placeholderGoal)
      .select()
      .single();

    if (error) {
      console.error('Error inserting placeholder goal:', error);
      throw error;
    }

    return data;
  }

  /**
   * Apply all auto-fixes in bulk
   */
  static async bulkAutoFix(
    sessionId: string,
    suggestions: AutoFixSuggestion[]
  ): Promise<StagedGoal[]> {
    const placeholders = suggestions.map(suggestion =>
      this.generatePlaceholderGoal(suggestion, sessionId)
    );

    const { data, error } = await supabase
      .from('spb_staged_goals')
      .insert(placeholders)
      .select();

    if (error) {
      console.error('Error bulk inserting placeholder goals:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get parent goal number
   */
  private static getParentGoalNumber(goalNumber: string): string | null {
    const parts = goalNumber.split('.');
    if (parts.length <= 1) return null;
    return parts.slice(0, -1).join('.');
  }

  /**
   * Recursively detect missing parents (e.g., if 1.2.3 exists but neither 1.2 nor 1 exist)
   */
  static detectAllMissingParentsRecursive(
    goals: ParsedGoal[],
    existingGoals: any[]
  ): AutoFixSuggestion[] {
    const allSuggestions: AutoFixSuggestion[] = [];
    const processed = new Set<string>();

    const checkParent = (goalNumber: string) => {
      if (processed.has(goalNumber)) return;
      processed.add(goalNumber);

      const parentNumber = this.getParentGoalNumber(goalNumber);
      if (!parentNumber) return;

      // Check if parent exists
      const parentExists =
        goals.some(g => g.goal_number === parentNumber) ||
        existingGoals.some(g => g.goal_number === parentNumber) ||
        allSuggestions.some(s => s.missingGoalNumber === parentNumber);

      if (!parentExists) {
        const parentLevel = ValidationService.calculateLevel(parentNumber);
        const levelLabel = parentLevel === 0 ? 'Strategic Objective' : parentLevel === 1 ? 'Goal' : 'Goal';

        allSuggestions.push({
          type: 'create-parent',
          missingGoalNumber: parentNumber,
          suggestedTitle: `${levelLabel} ${parentNumber} (Please rename)`,
          suggestedLevel: parentLevel,
          action: `Create placeholder ${levelLabel.toLowerCase()} "${parentNumber}"`
        });

        // Recursively check grandparent
        checkParent(parentNumber);
      }
    };

    // Check all goals
    goals.forEach(goal => {
      if (goal.goal_number) {
        checkParent(goal.goal_number);
      }
    });

    // Sort by goal number (parents first)
    return allSuggestions.sort((a, b) => {
      const aNum = a.missingGoalNumber || '';
      const bNum = b.missingGoalNumber || '';
      return aNum.localeCompare(bNum, undefined, { numeric: true });
    });
  }

  /**
   * Get all fixable issues from staged goals
   */
  static getFixableIssues(stagedGoals: StagedGoal[]): Map<string, AutoFixSuggestion[]> {
    const fixableIssues = new Map<string, AutoFixSuggestion[]>();

    stagedGoals.forEach(goal => {
      if (goal.validation_status === 'fixable' && goal.auto_fix_suggestions) {
        fixableIssues.set(goal.id, goal.auto_fix_suggestions);
      }
    });

    return fixableIssues;
  }

  /**
   * Count total fixable issues
   */
  static countFixableIssues(stagedGoals: StagedGoal[]): number {
    return stagedGoals.filter(g => g.validation_status === 'fixable').length;
  }
}
