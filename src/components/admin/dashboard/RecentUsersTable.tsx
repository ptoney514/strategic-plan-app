import { Link } from 'react-router-dom';
import { User, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from '../../../lib/utils/formatTime';
import { UserRoleBadge } from './UserRoleBadge';
import type { UserWithRole } from '../../../lib/services/systemAdmin.service';

interface RecentUsersTableProps {
  users: UserWithRole[];
  isLoading?: boolean;
}

export function RecentUsersTable({ users, isLoading }: RecentUsersTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-[#e8e6e1] rounded-xl p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#8a8a8a]" />
          <span className="ml-2 text-sm text-[#8a8a8a]">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e8e6e1] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#e8e6e1] flex items-center justify-between">
        <h2 className="font-['Playfair_Display',_Georgia,_serif] text-xl font-medium text-[#1a1a1a]">
          Recent Users
        </h2>
        <Link
          to="/users"
          className="text-sm font-medium text-[#b85c38] hover:underline"
        >
          View all users
        </Link>
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <div className="px-6 py-8 text-center text-[#8a8a8a]">
          No users found
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-[#8a8a8a] uppercase tracking-wide border-b border-[#e8e6e1] bg-[#faf9f7]">
              <th className="px-6 py-3 font-semibold">User</th>
              <th className="px-6 py-3 font-semibold">Role</th>
              <th className="px-6 py-3 font-semibold">District / School</th>
              <th className="px-6 py-3 font-semibold">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8e6e1]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[#faf9f7] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#f5f3ef] flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-[#8a8a8a]" />
                    </div>
                    <div className="min-w-0">
                      <code className="text-xs text-[#4a4a4a] font-mono truncate block">
                        {user.user_id.slice(0, 8)}...
                      </code>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <UserRoleBadge role={user.role} />
                </td>
                <td className="px-6 py-4 text-sm text-[#4a4a4a]">
                  {user.district_name || user.school_name || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-[#8a8a8a]">
                  {formatDistanceToNow(new Date(user.created_at))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
