import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { authClient } from '../lib/auth-client';
import { mapBetterAuthUser, type AuthUser, type OrgMembership } from '../lib/types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isSystemAdmin: boolean;
  loading: boolean;
  hasDistrictAccess: (slug: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<{ data: { user: AuthUser | null } }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider - Provides authentication state to the entire app
 *
 * Uses Better Auth's useSession() hook for reactive session state.
 * Maintains identical useAuth() return type for backward compatibility.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, isPending } = authClient.useSession();
  const [memberships, setMemberships] = useState<OrgMembership[] | null>(null);

  // Map Better Auth session user to AuthUser
  const user: AuthUser | null = session?.user
    ? mapBetterAuthUser(session.user as Parameters<typeof mapBetterAuthUser>[0])
    : null;

  const isAuthenticated = !!session?.user;
  const isSystemAdmin = !!user?.isSystemAdmin;

  /**
   * Fetch memberships lazily (on first hasDistrictAccess call)
   */
  const fetchMemberships = useCallback(async (): Promise<OrgMembership[]> => {
    if (memberships !== null) return memberships;

    try {
      const res = await fetch('/api/user/memberships', { credentials: 'include' });
      if (!res.ok) return [];
      const data: OrgMembership[] = await res.json();
      setMemberships(data);
      return data;
    } catch (error) {
      console.error('[AuthContext] Error fetching memberships:', error);
      return [];
    }
  }, [memberships]);

  /**
   * Check if user has admin access to a specific district
   */
  const hasDistrictAccess = useCallback(async (slug: string): Promise<boolean> => {
    if (!user) return false;
    if (isSystemAdmin) return true;

    const orgs = await fetchMemberships();
    return orgs.some((m) => m.slug === slug);
  }, [user, isSystemAdmin, fetchMemberships]);

  /**
   * Sign in with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    const result = await authClient.signIn.email({ email, password });

    if (result.error) {
      throw new Error(result.error.message || 'Failed to sign in');
    }

    // Reset cached memberships on login
    setMemberships(null);

    // Return compatible shape so Login.tsx doesn't need changes
    const mappedUser = result.data?.user
      ? mapBetterAuthUser(result.data.user as Parameters<typeof mapBetterAuthUser>[0])
      : null;

    return { data: { user: mappedUser } };
  }, []);

  /**
   * Sign out current user
   */
  const logout = useCallback(async () => {
    const result = await authClient.signOut();

    if (result.error) {
      throw new Error(result.error.message || 'Failed to sign out');
    }

    setMemberships(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isSystemAdmin,
    loading: isPending,
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
