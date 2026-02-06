import { apiGet, apiPut, apiPost, apiDelete } from '../api';

export interface ProgressOverrideData {
  overrideValue: number | null;
  displayMode: string;
  reason: string;
  userId?: string;
}

/**
 * Update or set a manual progress override for a goal
 */
export async function updateProgressOverride(
  goalId: string,
  data: ProgressOverrideData
): Promise<void> {
  await apiPut(`/progress/${goalId}/override`, data);
}

/**
 * Clear a manual progress override (revert to auto-calculated)
 */
export async function clearProgressOverride(goalId: string): Promise<void> {
  await apiDelete(`/progress/${goalId}/override`);
}

/**
 * Recalculate progress for all goals in a district
 */
export async function recalculateDistrictProgress(districtId: string): Promise<void> {
  await apiPost(`/progress/recalculate/${districtId}`, {});
}

/**
 * Get progress breakdown for a goal (for debugging/admin view)
 */
export async function getProgressBreakdown(goalId: string): Promise<any> {
  return apiGet(`/progress/${goalId}/breakdown`);
}

/**
 * Update display mode only (without changing override value)
 */
export async function updateDisplayMode(
  goalId: string,
  displayMode: string
): Promise<void> {
  await apiPut(`/progress/${goalId}/display-mode`, { display_mode: displayMode });
}
