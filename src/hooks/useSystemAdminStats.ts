import { useQuery } from '@tanstack/react-query';
import {
  SystemAdminService,
  type SystemAdminStats,
  type DistrictWithStats,
  type UserWithRole,
} from '../lib/services/systemAdmin.service';

/**
 * Hook to fetch aggregated system admin statistics
 */
export function useSystemAdminStats() {
  return useQuery<SystemAdminStats>({
    queryKey: ['system-admin', 'stats'],
    queryFn: () => SystemAdminService.getStats(),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch all districts with goals, schools, and users counts
 */
export function useDistrictsWithStats() {
  return useQuery<DistrictWithStats[]>({
    queryKey: ['system-admin', 'districts-with-stats'],
    queryFn: () => SystemAdminService.getDistrictsWithStats(),
  });
}

/**
 * Hook to fetch recent users (district and school admins)
 */
export function useRecentUsers(limit = 5) {
  return useQuery<UserWithRole[]>({
    queryKey: ['system-admin', 'recent-users', limit],
    queryFn: () => SystemAdminService.getRecentUsers(limit),
    staleTime: 60000, // 1 minute
  });
}
