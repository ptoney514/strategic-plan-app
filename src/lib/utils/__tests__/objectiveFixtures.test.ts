import { describe, it, expect } from 'vitest';
import {
  getObjectiveNarrative,
  OBJECTIVE_FIXTURES,
} from '../objectiveFixtures';

describe('objectiveFixtures', () => {
  describe('OBJECTIVE_FIXTURES map', () => {
    it('has entries keyed by "1" through "4"', () => {
      expect(OBJECTIVE_FIXTURES['1']).toBeDefined();
      expect(OBJECTIVE_FIXTURES['2']).toBeDefined();
      expect(OBJECTIVE_FIXTURES['3']).toBeDefined();
      expect(OBJECTIVE_FIXTURES['4']).toBeDefined();
    });

    it('gives Obj 04 a populated honestFraming block', () => {
      const fx = OBJECTIVE_FIXTURES['4'];
      expect(fx.honestFraming).toBeDefined();
      expect(fx.honestFraming?.problem.title).toMatch(/./);
      expect(fx.honestFraming?.action.title).toMatch(/./);
      expect(fx.honestFraming?.timeline.title).toMatch(/./);
    });

    it('does NOT populate honestFraming on Obj 01–03', () => {
      expect(OBJECTIVE_FIXTURES['1'].honestFraming).toBeUndefined();
      expect(OBJECTIVE_FIXTURES['2'].honestFraming).toBeUndefined();
      expect(OBJECTIVE_FIXTURES['3'].honestFraming).toBeUndefined();
    });

    it('gives each objective exactly 3 stat callouts', () => {
      (['1', '2', '3', '4'] as const).forEach((k) => {
        expect(OBJECTIVE_FIXTURES[k].stats).toHaveLength(3);
      });
    });

    it('gives each objective a signatureMetric with a non-empty series', () => {
      (['1', '2', '3', '4'] as const).forEach((k) => {
        const sig = OBJECTIVE_FIXTURES[k].signatureMetric;
        expect(sig.title).toMatch(/./);
        expect(sig.series.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getObjectiveNarrative', () => {
    it('returns Obj 01 fixture for goalNumber "1"', () => {
      expect(getObjectiveNarrative('1')).toBe(OBJECTIVE_FIXTURES['1']);
    });

    it('returns Obj 04 fixture for goalNumber "4"', () => {
      expect(getObjectiveNarrative('4')).toBe(OBJECTIVE_FIXTURES['4']);
    });

    it('returns the generic fallback for an unknown goalNumber', () => {
      const result = getObjectiveNarrative('99');
      expect(result).toBeDefined();
      expect(result.eyebrow).toMatch(/OBJECTIVE/);
      // Fallback must not be any of the 4 known fixtures
      expect(Object.values(OBJECTIVE_FIXTURES)).not.toContain(result);
    });

    it('returns the generic fallback when goalNumber is undefined', () => {
      const result = getObjectiveNarrative(undefined);
      expect(result).toBeDefined();
      expect(result.stats).toHaveLength(3);
    });
  });
});
