import { useQuery } from '@tanstack/react-query';
import { UserDashboardService } from '../lib/services';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to fetch all plans the current user has access to
 */
export function useUserPlans() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-plans', user?.id],
    queryFn: () => UserDashboardService.getUserPlans(),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch plans with objective counts for dashboard display
 */
export function useUserPlansWithCounts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-plans-with-counts', user?.id],
    queryFn: () => UserDashboardService.getUserPlansWithCounts(),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
