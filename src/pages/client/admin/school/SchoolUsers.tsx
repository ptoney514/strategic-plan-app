import { UserPlus, Users } from 'lucide-react';
import { useAdminContext } from '../../../../hooks/useAdminContext';
import { UserRoleBadge } from '../../../../components/admin/dashboard';

/**
 * SchoolUsers - Manage school team members and administrators
 * Placeholder for full user management implementation
 */
export function SchoolUsers() {
  const { school, isLoading: contextLoading } = useAdminContext();

  // Mock users - will be replaced with actual user management
  const mockUsers = [
    {
      id: '1',
      email: school?.principal_email || 'admin@school.com',
      role: 'school_admin' as const,
      name: school?.principal_name || 'Principal',
    },
  ];

  if (contextLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="h-4 w-32 bg-slate-100 rounded mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team</h1>
          <p className="text-sm text-slate-500 mt-1">
            {school?.name} • Manage school administrators and editors
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          onClick={() => alert('Invite user feature coming soon!')}
        >
          <UserPlus className="h-4 w-4" />
          Invite User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                User
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                Email
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                Role
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-slate-900 mb-1">
                    No team members yet
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Invite team members to help manage your school's strategic plan.
                  </p>
                </td>
              </tr>
            ) : (
              mockUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-sm">
                        {(user.name || user.email).substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-900">
                        {user.name || user.email.split('@')[0]}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {user.email}
                  </td>
                  <td className="py-3 px-4">
                    <UserRoleBadge role={user.role} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-sm text-slate-500 hover:text-slate-700">
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> School admins can manage their school's strategic plan.
          Editors can update content but cannot invite new users or change settings.
        </p>
      </div>
    </div>
  );
}
