import { Link } from 'react-router-dom';
import {
  Building2,
  Target,
  Users,
  Settings,
  ArrowRight,
  User,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import {
  useSystemAdminStats,
  useRecentUsers,
} from '../../hooks/useSystemAdminStats';
import { UserRoleBadge } from '../../components/system-admin/dashboard';
import { formatDistanceToNow } from '../../lib/utils/formatTime';

const statsConfig = [
  {
    key: 'districts',
    label: 'Total Districts',
    icon: Building2,
    bgColor: 'bg-[#f5f3ef]',
    iconColor: 'text-[#b85c38]',
    field: 'totalDistricts' as const,
  },
  {
    key: 'users',
    label: 'Total Users',
    icon: Users,
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    field: 'totalUsers' as const,
  },
  {
    key: 'goals',
    label: 'Total Goals',
    icon: Target,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    field: 'totalGoals' as const,
  },
];

const quickActions = [
  {
    title: 'Manage Districts',
    description: 'View and manage all districts',
    icon: Building2,
    to: '/districts',
    bgColor: 'bg-[#f5f3ef]',
    iconColor: 'text-[#b85c38]',
  },
  {
    title: 'Manage Users',
    description: 'View all users across districts',
    icon: Users,
    to: '/users',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    title: 'Settings',
    description: 'System-wide configuration',
    icon: Settings,
    to: '/settings',
    bgColor: 'bg-[#f5f3ef]',
    iconColor: 'text-[#4a4a4a]',
  },
];

export function SystemDashboard() {
  const { data: stats, isLoading: statsLoading } = useSystemAdminStats();
  const { data: recentUsers = [], isLoading: usersLoading } = useRecentUsers(5);

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-['Playfair_Display',Georgia,serif] text-[28px] font-medium text-[#1a1a1a] tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-[#8a8a8a] mt-1">
          System overview and quick actions
        </p>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {statsConfig.map((stat) => (
          <div
            key={stat.key}
            className="bg-white border border-[#e8e6e1] rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-[#8a8a8a] uppercase tracking-wide mb-2">
                  {stat.label}
                </p>
                {statsLoading ? (
                  <div className="h-9 w-16 bg-[#f5f3ef] rounded animate-pulse" />
                ) : (
                  <p className="text-3xl font-['Playfair_Display',Georgia,serif] font-medium text-[#1a1a1a]">
                    {stats?.[stat.field] ?? 0}
                  </p>
                )}
              </div>
              <div
                className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
              >
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout: Growth Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Growth Chart Placeholder */}
        <div className="bg-white border border-[#e8e6e1] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e8e6e1]">
            <h2 className="font-['Playfair_Display',Georgia,serif] text-lg font-medium text-[#1a1a1a]">
              Platform Growth
            </h2>
          </div>
          <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <TrendingUp className="h-7 w-7 text-blue-500" />
            </div>
            <p className="text-sm font-medium text-[#4a4a4a] mb-1">
              Growth chart coming soon
            </p>
            <p className="text-xs text-[#8a8a8a] max-w-[240px]">
              District, user, and goal trends will appear here
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-[#e8e6e1] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e8e6e1]">
            <h2 className="font-['Playfair_Display',Georgia,serif] text-lg font-medium text-[#1a1a1a]">
              Quick Actions
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-[#faf9f7] transition-colors group"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center shrink-0`}
                >
                  <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a1a1a]">
                    {action.title}
                  </p>
                  <p className="text-xs text-[#8a8a8a]">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-[#8a8a8a] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white border border-[#e8e6e1] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e8e6e1] flex items-center justify-between">
          <h2 className="font-['Playfair_Display',Georgia,serif] text-lg font-medium text-[#1a1a1a]">
            Recent Users
          </h2>
          <Link
            to="/users"
            className="text-sm font-medium text-[#b85c38] hover:underline"
          >
            View all
          </Link>
        </div>

        {usersLoading ? (
          <div className="px-6 py-8 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#8a8a8a]" />
            <span className="ml-2 text-sm text-[#8a8a8a]">
              Loading users...
            </span>
          </div>
        ) : recentUsers.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-[#8a8a8a]">
            No users found
          </div>
        ) : (
          <div className="divide-y divide-[#e8e6e1]">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-[#faf9f7] transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#f5f3ef] flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-[#8a8a8a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#1a1a1a] truncate">
                      {user.name || user.email || user.user_id?.slice(0, 8) || user.id.slice(0, 8)}
                    </span>
                    <UserRoleBadge role={user.role} />
                  </div>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {user.district_name || user.school_name || 'System'}
                  </p>
                </div>
                <span className="text-xs text-[#8a8a8a] shrink-0">
                  {formatDistanceToNow(new Date(user.created_at))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
