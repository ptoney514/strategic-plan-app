import { describe, it, expect } from 'vitest';
import { safeNumber, safeNumberOrNull } from '../safeNumber';

describe('safeNumber', () => {
  it('returns the number for finite numbers', () => {
    expect(safeNumber(42)).toBe(42);
    expect(safeNumber(3.78)).toBe(3.78);
    expect(safeNumber(0)).toBe(0);
    expect(safeNumber(-5)).toBe(-5);
  });

  it('returns 0 for NaN and Infinity', () => {
    expect(safeNumber(NaN)).toBe(0);
    expect(safeNumber(Infinity)).toBe(0);
    expect(safeNumber(-Infinity)).toBe(0);
  });

  it('parses numeric strings', () => {
    expect(safeNumber('3.78')).toBe(3.78);
    expect(safeNumber('42')).toBe(42);
    expect(safeNumber('-5')).toBe(-5);
    expect(safeNumber('  3.5  ')).toBe(3.5);
  });

  it('returns 0 for non-numeric strings', () => {
    expect(safeNumber('abc')).toBe(0);
    expect(safeNumber('')).toBe(0);
    expect(safeNumber('  ')).toBe(0);
    expect(safeNumber('not a number')).toBe(0);
  });

  it('returns 0 for null, undefined, and other types', () => {
    expect(safeNumber(null)).toBe(0);
    expect(safeNumber(undefined)).toBe(0);
    expect(safeNumber(true)).toBe(0);
    expect(safeNumber(false)).toBe(0);
    expect(safeNumber({})).toBe(0);
    expect(safeNumber([])).toBe(0);
  });

  it('handles the production bug case: string values from JSONB', () => {
    // This is the exact scenario causing TypeError: e.toFixed is not a function
    const stringValue = '3.78';
    const result = safeNumber(stringValue);
    expect(result.toFixed(1)).toBe('3.8'); // No TypeError
    expect(result.toFixed(2)).toBe('3.78');
  });
});

describe('safeNumberOrNull', () => {
  it('returns the number for finite numbers', () => {
    expect(safeNumberOrNull(42)).toBe(42);
    expect(safeNumberOrNull(3.78)).toBe(3.78);
    expect(safeNumberOrNull(0)).toBe(0);
  });

  it('returns null for NaN and Infinity', () => {
    expect(safeNumberOrNull(NaN)).toBeNull();
    expect(safeNumberOrNull(Infinity)).toBeNull();
  });

  it('returns null for null and undefined', () => {
    expect(safeNumberOrNull(null)).toBeNull();
    expect(safeNumberOrNull(undefined)).toBeNull();
  });

  it('parses numeric strings', () => {
    expect(safeNumberOrNull('3.78')).toBe(3.78);
    expect(safeNumberOrNull('0')).toBe(0);
  });

  it('returns null for non-numeric strings', () => {
    expect(safeNumberOrNull('abc')).toBeNull();
    expect(safeNumberOrNull('')).toBeNull();
    expect(safeNumberOrNull('  ')).toBeNull();
  });

  it('returns null for other types', () => {
    expect(safeNumberOrNull(true)).toBeNull();
    expect(safeNumberOrNull({})).toBeNull();
    expect(safeNumberOrNull([])).toBeNull();
  });
});
