import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isSystemAdmin: boolean;
  loading: boolean;
}

/**
 * useAuth - Authentication hook with Supabase
 *
 * Manages user authentication state and provides auth methods.
 * Automatically syncs with Supabase auth state changes.
 */
export function useAuth() {
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
   * @param slug - District slug to check access for
   * @returns Promise<boolean> - True if user has access
   */
  const hasDistrictAccess = async (slug: string): Promise<boolean> => {
    if (!authState.user) return false;

    // System admins have access to all districts
    if (authState.isSystemAdmin) return true;

    try {
      // Check if user is in spb_district_admins for this district
      const { data, error } = await supabase
        .from('spb_district_admins')
        .select('id')
        .eq('user_id', authState.user.id)
        .eq('district_slug', slug)
        .maybeSingle();

      if (error) {
        console.error('[useAuth] Error checking district access:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('[useAuth] Exception checking district access:', error);
      return false;
    }
  };

  /**
   * Sign in with email and password
   * @param email - User email
   * @param password - User password
   * @returns Promise with auth response
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
   * @returns Promise with void
   */
  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  };

  return {
    ...authState,
    hasDistrictAccess,
    login,
    logout,
  };
}
