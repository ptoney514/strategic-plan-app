import type { MetricType } from '../types';

export type NumberFormat = 'whole' | 'decimal' | 'percentage';

export interface FormatMetricValueOptions {
  value: number | string | null | undefined;
  isPercentage?: boolean;
  decimalPlaces?: number;
  metricType?: MetricType;
  unit?: string;
  targetValue?: number | string; // For rating display (e.g., "3.83 / 5.0")
}

export interface FormattedValue {
  value: string;
  unit: string;
  display: string;
}

/**
 * Centralized utility for formatting metric values consistently across the app.
 *
 * Priority order:
 * 1. Explicit isPercentage flag takes precedence (when defined)
 * 2. Legacy metric_type handling (only when isPercentage is undefined)
 * 3. Standard number formatting with decimal_places
 */
export function formatMetricValue({
  value,
  isPercentage,
  decimalPlaces = 2,
  metricType,
  unit = '',
  targetValue,
}: FormatMetricValueOptions): FormattedValue {
  // Handle null/undefined
  if (value == null) {
    return { value: '--', unit: '', display: '--' };
  }

  const numericValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return { value: '--', unit: '', display: '--' };
  }

  // Clamp decimal places to valid range (0-4)
  const places = Math.max(0, Math.min(4, decimalPlaces));

  // Priority 1: Explicit isPercentage flag takes precedence when defined
  // This allows is_percentage=false to override metric_type='percent'
  if (isPercentage === true) {
    const formatted = numericValue.toFixed(places);
    return { value: formatted, unit: '%', display: `${formatted}%` };
  }

  // If isPercentage is explicitly false, skip the metric_type='percent' check
  const skipLegacyPercent = isPercentage === false;

  // Priority 2: Legacy metric_type handling (only when isPercentage is undefined)
  if (!skipLegacyPercent && metricType === 'percent') {
    const formatted = numericValue.toFixed(places);
    return { value: formatted, unit: '%', display: `${formatted}%` };
  }

  if (metricType === 'rating') {
    const formatted = numericValue.toFixed(places);
    const numericTargetValue = targetValue == null ? null : Number(targetValue);
    const ratingUnit = `/ ${Number.isFinite(numericTargetValue) ? numericTargetValue : 5.0}`;
    return { value: formatted, unit: ratingUnit, display: `${formatted} ${ratingUnit}` };
  }

  if (metricType === 'currency') {
    const formatted = numericValue.toLocaleString(undefined, {
      minimumFractionDigits: places,
      maximumFractionDigits: places,
    });
    return { value: `$${formatted}`, unit: '', display: `$${formatted}` };
  }

  // Priority 3: Standard number formatting with decimal_places
  // For whole numbers (0 decimal places), don't show decimals
  const formatted = places === 0
    ? Math.round(numericValue).toString()
    : numericValue.toFixed(places);

  // When isPercentage is explicitly false, clear % unit from legacy data
  const finalUnit = (isPercentage === false && unit === '%') ? '' : unit;

  return {
    value: formatted,
    unit: finalUnit,
    display: finalUnit ? `${formatted}${finalUnit}` : formatted,
  };
}

/**
 * Derive NumberFormat type from is_percentage and decimal_places
 */
export function getNumberFormat(isPercentage: boolean, decimalPlaces: number): NumberFormat {
  if (isPercentage) return 'percentage';
  if (decimalPlaces === 0) return 'whole';
  return 'decimal';
}

/**
 * Convert NumberFormat back to is_percentage and decimal_places
 */
export function parseNumberFormat(
  format: NumberFormat,
  currentDecimalPlaces: number
): { isPercentage: boolean; decimalPlaces: number } {
  switch (format) {
    case 'whole':
      return { isPercentage: false, decimalPlaces: 0 };
    case 'percentage':
      return { isPercentage: true, decimalPlaces: currentDecimalPlaces || 1 };
    case 'decimal':
    default:
      return { isPercentage: false, decimalPlaces: currentDecimalPlaces || 2 };
  }
}
