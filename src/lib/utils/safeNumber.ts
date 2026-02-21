/**
 * Coerce a value to a finite number, returning 0 for non-numeric values.
 * Use in frontend components where a numeric fallback is needed (e.g., .toFixed(), arithmetic).
 * Mirrors the API's api/lib/helpers/number.ts pattern.
 */
export function safeNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/**
 * Coerce a value to a finite number, returning null for null/undefined.
 * Useful when distinguishing "no value" from "zero" matters.
 */
export function safeNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}
