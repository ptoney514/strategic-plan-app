import { describe, it, expect, vi } from 'vitest';
import { appearanceReducer, defaultState, type AppearanceState, type AppearanceAction } from '../useAppearanceState';

// Mock TemplateRegistry for SET_TEMPLATE action
vi.mock('../../components/public/templates/TemplateRegistry', () => ({
  getMergedConfig: (templateId: string) => {
    const configs: Record<string, Record<string, unknown>> = {
      hierarchical: { showSidebar: true, showNarrativeHero: true, gridColumns: 3, enableAnimations: false, cardVariant: 'default' },
      'metrics-grid': { showSidebar: true, showNarrativeHero: true, gridColumns: 3, enableAnimations: true, cardVariant: 'compact' },
      'launch-traction': { showSidebar: false, showNarrativeHero: false, gridColumns: 4, enableAnimations: true, cardVariant: 'rich' },
    };
    return configs[templateId] || configs.hierarchical;
  },
}));

describe('appearanceReducer', () => {
  const baseState: AppearanceState = {
    primaryColor: '#0099CC',
    secondaryColor: '#FFB800',
    logoUrl: '',
    dashboardTemplate: 'hierarchical',
    dashboardConfig: {},
    isDirty: false,
  };

  describe('SET_PRIMARY_COLOR', () => {
    it('updates primary color and marks dirty', () => {
      const result = appearanceReducer(baseState, { type: 'SET_PRIMARY_COLOR', payload: '#FF0000' });
      expect(result.primaryColor).toBe('#FF0000');
      expect(result.isDirty).toBe(true);
    });

    it('preserves other state', () => {
      const result = appearanceReducer(baseState, { type: 'SET_PRIMARY_COLOR', payload: '#FF0000' });
      expect(result.secondaryColor).toBe('#FFB800');
      expect(result.dashboardTemplate).toBe('hierarchical');
    });
  });

  describe('SET_SECONDARY_COLOR', () => {
    it('updates secondary color and marks dirty', () => {
      const result = appearanceReducer(baseState, { type: 'SET_SECONDARY_COLOR', payload: '#00FF00' });
      expect(result.secondaryColor).toBe('#00FF00');
      expect(result.isDirty).toBe(true);
    });
  });

  describe('SET_LOGO_URL', () => {
    it('updates logo URL and marks dirty', () => {
      const result = appearanceReducer(baseState, { type: 'SET_LOGO_URL', payload: 'https://example.com/logo.png' });
      expect(result.logoUrl).toBe('https://example.com/logo.png');
      expect(result.isDirty).toBe(true);
    });

    it('can clear logo URL', () => {
      const stateWithLogo = { ...baseState, logoUrl: 'https://example.com/logo.png' };
      const result = appearanceReducer(stateWithLogo, { type: 'SET_LOGO_URL', payload: '' });
      expect(result.logoUrl).toBe('');
      expect(result.isDirty).toBe(true);
    });
  });

  describe('SET_TEMPLATE', () => {
    it('updates template and applies defaults', () => {
      const result = appearanceReducer(baseState, { type: 'SET_TEMPLATE', payload: 'launch-traction' });
      expect(result.dashboardTemplate).toBe('launch-traction');
      expect(result.dashboardConfig).toEqual({
        showSidebar: false,
        showNarrativeHero: false,
        gridColumns: 4,
        enableAnimations: true,
        cardVariant: 'rich',
      });
      expect(result.isDirty).toBe(true);
    });

    it('replaces existing config with template defaults', () => {
      const stateWithConfig = {
        ...baseState,
        dashboardConfig: { showSidebar: false, gridColumns: 2 as const },
      };
      const result = appearanceReducer(stateWithConfig, { type: 'SET_TEMPLATE', payload: 'metrics-grid' });
      expect(result.dashboardConfig).toEqual({
        showSidebar: true,
        showNarrativeHero: true,
        gridColumns: 3,
        enableAnimations: true,
        cardVariant: 'compact',
      });
    });
  });

  describe('UPDATE_CONFIG', () => {
    it('merges partial config and marks dirty', () => {
      const result = appearanceReducer(baseState, { type: 'UPDATE_CONFIG', payload: { showSidebar: false } });
      expect(result.dashboardConfig).toEqual({ showSidebar: false });
      expect(result.isDirty).toBe(true);
    });

    it('preserves existing config keys', () => {
      const stateWithConfig = {
        ...baseState,
        dashboardConfig: { showSidebar: true, gridColumns: 3 as const },
      };
      const result = appearanceReducer(stateWithConfig, { type: 'UPDATE_CONFIG', payload: { gridColumns: 4 } });
      expect(result.dashboardConfig).toEqual({ showSidebar: true, gridColumns: 4 });
    });
  });

  describe('INIT', () => {
    it('initializes state from district data', () => {
      const dirtyState: AppearanceState = {
        ...baseState,
        primaryColor: '#CHANGED',
        isDirty: true,
      };
      const result = appearanceReducer(dirtyState, {
        type: 'INIT',
        payload: {
          primaryColor: '#112233',
          secondaryColor: '#445566',
          logoUrl: 'https://example.com/logo.png',
          dashboardTemplate: 'metrics-grid',
          dashboardConfig: { gridColumns: 4 },
        },
      });
      expect(result.primaryColor).toBe('#112233');
      expect(result.secondaryColor).toBe('#445566');
      expect(result.logoUrl).toBe('https://example.com/logo.png');
      expect(result.dashboardTemplate).toBe('metrics-grid');
      expect(result.dashboardConfig).toEqual({ gridColumns: 4 });
      expect(result.isDirty).toBe(false);
    });

    it('uses defaults for missing fields', () => {
      const result = appearanceReducer(baseState, { type: 'INIT', payload: {} });
      expect(result.primaryColor).toBe(defaultState.primaryColor);
      expect(result.secondaryColor).toBe(defaultState.secondaryColor);
      expect(result.isDirty).toBe(false);
    });
  });

  describe('SAVED', () => {
    it('clears isDirty flag', () => {
      const dirtyState: AppearanceState = { ...baseState, isDirty: true };
      const result = appearanceReducer(dirtyState, { type: 'SAVED' });
      expect(result.isDirty).toBe(false);
    });

    it('preserves all other state', () => {
      const dirtyState: AppearanceState = {
        ...baseState,
        primaryColor: '#AABBCC',
        isDirty: true,
      };
      const result = appearanceReducer(dirtyState, { type: 'SAVED' });
      expect(result.primaryColor).toBe('#AABBCC');
    });
  });

  describe('unknown action', () => {
    it('returns current state', () => {
      const result = appearanceReducer(baseState, { type: 'UNKNOWN' } as unknown as AppearanceAction);
      expect(result).toBe(baseState);
    });
  });
});
