import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isSystemAdmin: boolean;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  hasDistrictAccess: (slug: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<ReturnType<typeof supabase.auth.signInWithPassword>>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider - Provides authentication state to the entire app
 *
 * Single subscription to Supabase auth changes at the root level.
 * All components share the same auth state via useAuth hook.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isSystemAdmin: false,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setAuthState({
        user,
        isAuthenticated: !!session,
        isSystemAdmin: user?.user_metadata?.role === 'system_admin' || user?.app_metadata?.role === 'system_admin',
        loading: false,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setAuthState({
        user,
        isAuthenticated: !!session,
        isSystemAdmin: user?.user_metadata?.role === 'system_admin' || user?.app_metadata?.role === 'system_admin',
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Check if user has admin access to a specific district
   */
  const hasDistrictAccess = async (slug: string): Promise<boolean> => {
    if (!authState.user) return false;

    // System admins have access to all districts
    if (authState.isSystemAdmin) return true;

    try {
      const { data, error } = await supabase
        .from('spb_district_admins')
        .select('id')
        .eq('user_id', authState.user.id)
        .eq('district_slug', slug)
        .maybeSingle();

      if (error) {
        console.error('[AuthContext] Error checking district access:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('[AuthContext] Exception checking district access:', error);
      return false;
    }
  };

  /**
   * Sign in with email and password
   */
  const login = async (email: string, password: string) => {
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response;
  };

  /**
   * Sign out current user
   */
  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  };

  const value: AuthContextValue = {
    ...authState,
    hasDistrictAccess,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth - Hook to access authentication state
 *
 * Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
