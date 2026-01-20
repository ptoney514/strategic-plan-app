import { useQuery } from '@tanstack/react-query';
import { UserDashboardService } from '../lib/services';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to fetch districts the current user has admin access to
 */
export function useUserDistricts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-districts', user?.id],
    queryFn: () => UserDashboardService.getUserDistricts(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch dashboard statistics for the welcome banner
 */
export function useUserDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-dashboard-stats', user?.id],
    queryFn: () => UserDashboardService.getDashboardStats(),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
