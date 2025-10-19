import { supabase } from '../supabase';

export interface ProgressOverrideData {
  overrideValue: number | null;
  displayMode: string;
  reason: string;
  userId?: string; // Admin user ID
}

/**
 * Update or set a manual progress override for a goal
 */
export async function updateProgressOverride(
  goalId: string,
  data: ProgressOverrideData
): Promise<void> {
  const updateData: any = {
    overall_progress_display_mode: data.displayMode,
    updated_at: new Date().toISOString()
  };

  if (data.overrideValue !== null) {
    // Setting a manual override
    updateData.overall_progress_override = data.overrideValue;
    updateData.overall_progress_source = 'manual';
    updateData.overall_progress_override_at = new Date().toISOString();
    updateData.overall_progress_override_reason = data.reason;

    if (data.userId) {
      updateData.overall_progress_override_by = data.userId;
    }
  } else {
    // Clearing the override (null out override fields)
    updateData.overall_progress_override = null;
    updateData.overall_progress_source = 'calculated';
    updateData.overall_progress_override_at = null;
    updateData.overall_progress_override_by = null;
    updateData.overall_progress_override_reason = null;
  }

  const { error } = await supabase
    .from('spb_goals')
    .update(updateData)
    .eq('id', goalId);

  if (error) {
    throw new Error(`Failed to update progress override: ${error.message}`);
  }
}

/**
 * Clear a manual progress override (revert to auto-calculated)
 */
export async function clearProgressOverride(goalId: string): Promise<void> {
  await updateProgressOverride(goalId, {
    overrideValue: null,
    displayMode: 'percentage', // Reset to default
    reason: ''
  });
}

/**
 * Recalculate progress for all goals in a district
 * Calls the PostgreSQL function to batch recalculate
 */
export async function recalculateDistrictProgress(districtId: string): Promise<void> {
  const { error } = await supabase.rpc('recalculate_district_progress', {
    p_district_id: districtId
  });

  if (error) {
    throw new Error(`Failed to recalculate district progress: ${error.message}`);
  }
}

/**
 * Get progress breakdown for a goal (for debugging/admin view)
 */
export async function getProgressBreakdown(goalId: string): Promise<any> {
  const { data, error } = await supabase
    .from('spb_goals_progress_breakdown')
    .select('*')
    .eq('goal_id', goalId)
    .single();

  if (error) {
    throw new Error(`Failed to get progress breakdown: ${error.message}`);
  }

  return data;
}

/**
 * Update display mode only (without changing override value)
 */
export async function updateDisplayMode(
  goalId: string,
  displayMode: string
): Promise<void> {
  const { error } = await supabase
    .from('spb_goals')
    .update({
      overall_progress_display_mode: displayMode,
      updated_at: new Date().toISOString()
    })
    .eq('id', goalId);

  if (error) {
    throw new Error(`Failed to update display mode: ${error.message}`);
  }
}
