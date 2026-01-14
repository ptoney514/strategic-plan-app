import { describe, it, expect } from 'vitest';
import {
  formatMetricValue,
  getNumberFormat,
  parseNumberFormat,
} from '../formatMetricValue';

describe('formatMetricValue', () => {
  describe('null/undefined handling', () => {
    it('returns "--" for null value', () => {
      const result = formatMetricValue({ value: null });
      expect(result.value).toBe('--');
      expect(result.unit).toBe('');
      expect(result.display).toBe('--');
    });

    it('returns "--" for undefined value', () => {
      const result = formatMetricValue({ value: undefined });
      expect(result.value).toBe('--');
      expect(result.display).toBe('--');
    });
  });

  describe('whole number format (is_percentage=false, decimal_places=0)', () => {
    it('formats as whole number without decimals', () => {
      const result = formatMetricValue({
        value: 785,
        isPercentage: false,
        decimalPlaces: 0,
      });
      expect(result.value).toBe('785');
      expect(result.unit).toBe('');
      expect(result.display).toBe('785');
    });

    it('rounds decimal values to whole numbers', () => {
      const result = formatMetricValue({
        value: 785.7,
        isPercentage: false,
        decimalPlaces: 0,
      });
      expect(result.value).toBe('786');
    });

    it('overrides legacy metric_type=percent when is_percentage=false', () => {
      const result = formatMetricValue({
        value: 785,
        isPercentage: false,
        decimalPlaces: 0,
        metricType: 'percent', // Legacy field should be ignored
      });
      expect(result.value).toBe('785');
      expect(result.unit).toBe(''); // No % sign
      expect(result.display).toBe('785');
    });
  });

  describe('decimal format (is_percentage=false, decimal_places>0)', () => {
    it('formats with 1 decimal place', () => {
      const result = formatMetricValue({
        value: 785,
        isPercentage: false,
        decimalPlaces: 1,
      });
      expect(result.value).toBe('785.0');
      expect(result.display).toBe('785.0');
    });

    it('formats with 2 decimal places', () => {
      const result = formatMetricValue({
        value: 3.836,
        isPercentage: false,
        decimalPlaces: 2,
      });
      expect(result.value).toBe('3.84');
    });

    it('formats with 4 decimal places', () => {
      const result = formatMetricValue({
        value: 3.14159,
        isPercentage: false,
        decimalPlaces: 4,
      });
      expect(result.value).toBe('3.1416');
    });
  });

  describe('percentage format (is_percentage=true)', () => {
    it('formats with % suffix', () => {
      const result = formatMetricValue({
        value: 85.5,
        isPercentage: true,
        decimalPlaces: 1,
      });
      expect(result.value).toBe('85.5');
      expect(result.unit).toBe('%');
      expect(result.display).toBe('85.5%');
    });

    it('formats percentage with 0 decimal places', () => {
      const result = formatMetricValue({
        value: 85,
        isPercentage: true,
        decimalPlaces: 0,
      });
      expect(result.value).toBe('85');
      expect(result.unit).toBe('%');
      expect(result.display).toBe('85%');
    });
  });

  describe('legacy metric_type fallback', () => {
    it('uses metric_type=percent when isPercentage is undefined', () => {
      const result = formatMetricValue({
        value: 85.5,
        metricType: 'percent',
        decimalPlaces: 1,
        // isPercentage not passed
      });
      expect(result.unit).toBe('%');
      expect(result.display).toBe('85.5%');
    });

    it('formats rating type with target', () => {
      const result = formatMetricValue({
        value: 3.83,
        metricType: 'rating',
        decimalPlaces: 2,
        targetValue: 5.0,
      });
      expect(result.value).toBe('3.83');
      expect(result.unit).toBe('/ 5');
      expect(result.display).toBe('3.83 / 5');
    });

    it('formats currency type', () => {
      const result = formatMetricValue({
        value: 1234.56,
        metricType: 'currency',
        decimalPlaces: 2,
      });
      expect(result.value).toBe('$1,234.56');
      expect(result.display).toBe('$1,234.56');
    });
  });

  describe('decimal places clamping', () => {
    it('clamps negative decimal places to 0', () => {
      const result = formatMetricValue({
        value: 785.123,
        isPercentage: false,
        decimalPlaces: -1,
      });
      expect(result.value).toBe('785');
    });

    it('clamps decimal places above 4 to 4', () => {
      const result = formatMetricValue({
        value: 3.141592653,
        isPercentage: false,
        decimalPlaces: 10,
      });
      expect(result.value).toBe('3.1416');
    });
  });

  describe('unit handling', () => {
    it('includes custom unit in display', () => {
      const result = formatMetricValue({
        value: 100,
        isPercentage: false,
        decimalPlaces: 0,
        unit: ' students',
      });
      expect(result.value).toBe('100');
      expect(result.unit).toBe(' students');
      expect(result.display).toBe('100 students');
    });
  });
});

describe('getNumberFormat', () => {
  it('returns "percentage" when isPercentage is true', () => {
    expect(getNumberFormat(true, 2)).toBe('percentage');
  });

  it('returns "whole" when isPercentage is false and decimalPlaces is 0', () => {
    expect(getNumberFormat(false, 0)).toBe('whole');
  });

  it('returns "decimal" when isPercentage is false and decimalPlaces > 0', () => {
    expect(getNumberFormat(false, 2)).toBe('decimal');
  });
});

describe('parseNumberFormat', () => {
  it('parses "whole" format', () => {
    const result = parseNumberFormat('whole', 2);
    expect(result.isPercentage).toBe(false);
    expect(result.decimalPlaces).toBe(0);
  });

  it('parses "percentage" format', () => {
    const result = parseNumberFormat('percentage', 2);
    expect(result.isPercentage).toBe(true);
    expect(result.decimalPlaces).toBe(2);
  });

  it('parses "decimal" format', () => {
    const result = parseNumberFormat('decimal', 3);
    expect(result.isPercentage).toBe(false);
    expect(result.decimalPlaces).toBe(3);
  });

  it('defaults decimal places when 0 for percentage', () => {
    const result = parseNumberFormat('percentage', 0);
    expect(result.decimalPlaces).toBe(1);
  });

  it('defaults decimal places when 0 for decimal', () => {
    const result = parseNumberFormat('decimal', 0);
    expect(result.decimalPlaces).toBe(2);
  });
});
