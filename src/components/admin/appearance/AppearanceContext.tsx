import { createContext, useContext } from 'react';
import type { AppearanceState, AppearanceAction } from '../../../hooks/useAppearanceState';

interface AppearanceContextValue {
  state: AppearanceState;
  dispatch: React.Dispatch<AppearanceAction>;
  districtName: string;
  districtTagline?: string;
  districtSlug: string;
  save: () => Promise<void>;
  isSaving: boolean;
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: AppearanceContextValue;
}) {
  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) {
    throw new Error('useAppearance must be used within an AppearanceProvider');
  }
  return ctx;
}
