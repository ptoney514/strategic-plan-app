import { Link } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import { UserRoleBadge } from './UserRoleBadge';

interface User {
  id: string;
  email: string;
  role: 'district_admin' | 'school_admin' | 'editor' | 'viewer';
  name?: string;
  isPending?: boolean;
}

interface UsersListProps {
  users: User[];
  basePath: string;
  isLoading?: boolean;
}

/**
 * List of users with role badges for the dashboard sidebar
 */
export function UsersList({
  users,
  basePath,
  isLoading = false,
}: UsersListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Team</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-10 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-900">Team</h2>
        <Link
          to={`${basePath}/users`}
          className="text-sm text-amber-600 hover:text-amber-700 font-medium"
        >
          Manage
        </Link>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No team members yet</p>
          <Link
            to={`${basePath}/users`}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium mt-2 inline-block"
          >
            Invite team members
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {users.slice(0, 5).map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-sm flex-shrink-0">
                  {getInitials(user.name || user.email)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user.name || user.email.split('@')[0]}
                  </p>
                  {user.isPending && (
                    <span className="text-xs text-amber-600">Pending invite</span>
                  )}
                </div>
              </div>
              <UserRoleBadge role={user.role} size="sm" />
            </div>
          ))}

          {users.length > 5 && (
            <Link
              to={`${basePath}/users`}
              className="flex items-center justify-center gap-1 py-2 text-sm text-slate-500 hover:text-slate-700"
            >
              <span>+{users.length - 5} more</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(/[@\s]/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
