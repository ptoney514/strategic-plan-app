import { useReducer, useCallback } from 'react';
import type { DashboardTemplate, DashboardConfig, District } from '../lib/types';
import { getMergedConfig } from '../components/public/templates/TemplateRegistry';

export interface AppearanceState {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  dashboardTemplate: DashboardTemplate;
  dashboardConfig: DashboardConfig;
  isDirty: boolean;
}

export type AppearanceAction =
  | { type: 'SET_PRIMARY_COLOR'; payload: string }
  | { type: 'SET_SECONDARY_COLOR'; payload: string }
  | { type: 'SET_LOGO_URL'; payload: string }
  | { type: 'SET_TEMPLATE'; payload: DashboardTemplate }
  | { type: 'UPDATE_CONFIG'; payload: Partial<DashboardConfig> }
  | { type: 'INIT'; payload: Partial<AppearanceState> }
  | { type: 'SAVED' };

const defaultState: AppearanceState = {
  primaryColor: '#0099CC',
  secondaryColor: '#FFB800',
  logoUrl: '',
  dashboardTemplate: 'hierarchical',
  dashboardConfig: {},
  isDirty: false,
};

function appearanceReducer(state: AppearanceState, action: AppearanceAction): AppearanceState {
  switch (action.type) {
    case 'SET_PRIMARY_COLOR':
      return { ...state, primaryColor: action.payload, isDirty: true };
    case 'SET_SECONDARY_COLOR':
      return { ...state, secondaryColor: action.payload, isDirty: true };
    case 'SET_LOGO_URL':
      return { ...state, logoUrl: action.payload, isDirty: true };
    case 'SET_TEMPLATE': {
      const templateDefaults = getMergedConfig(action.payload);
      return {
        ...state,
        dashboardTemplate: action.payload,
        dashboardConfig: templateDefaults,
        isDirty: true,
      };
    }
    case 'UPDATE_CONFIG':
      return {
        ...state,
        dashboardConfig: { ...state.dashboardConfig, ...action.payload },
        isDirty: true,
      };
    case 'INIT':
      return { ...defaultState, ...action.payload, isDirty: false };
    case 'SAVED':
      return { ...state, isDirty: false };
    default:
      return state;
  }
}

export function useAppearanceState(district: District | null | undefined) {
  const initialState: AppearanceState = district
    ? {
        primaryColor: district.primary_color || '#0099CC',
        secondaryColor: district.secondary_color || '#FFB800',
        logoUrl: district.logo_url || '',
        dashboardTemplate: district.dashboard_template || 'hierarchical',
        dashboardConfig: district.dashboard_config || {},
        isDirty: false,
      }
    : defaultState;

  const [state, dispatch] = useReducer(appearanceReducer, initialState);

  const initFromDistrict = useCallback((d: District) => {
    dispatch({
      type: 'INIT',
      payload: {
        primaryColor: d.primary_color || '#0099CC',
        secondaryColor: d.secondary_color || '#FFB800',
        logoUrl: d.logo_url || '',
        dashboardTemplate: d.dashboard_template || 'hierarchical',
        dashboardConfig: d.dashboard_config || {},
      },
    });
  }, []);

  return { state, dispatch, initFromDistrict };
}

export { appearanceReducer, defaultState };
