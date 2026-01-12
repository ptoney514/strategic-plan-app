import { Users } from 'lucide-react';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict } from '../../../hooks/useDistricts';
import { UserRoleBadge } from '../../../components/admin/dashboard';

/**
 * DistrictUsers - View district team members and administrators
 * Read-only display - users are managed via Supabase directly
 */
export function DistrictUsers() {
  const { slug } = useSubdomain();
  const { data: district, isLoading } = useDistrict(slug || '');

  // Mock users - in production, fetch from district_admins table
  const mockUsers = [
    {
      id: '1',
      email: 'admin@westside.edu',
      role: 'district_admin' as const,
      name: 'District Administrator',
    },
  ];

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="h-4 w-32 bg-slate-100 rounded mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Team</h1>
        <p className="text-sm text-slate-500 mt-1">
          {district?.name} administrators and editors
        </p>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockUsers.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12 text-center">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-slate-900 mb-1">
                    No team members yet
                  </h3>
                  <p className="text-sm text-slate-500">
                    Add team members via Supabase to manage your district's strategic plan.
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> User management is handled through Supabase.
          Contact your system administrator to add or modify team members.
        </p>
      </div>
    </div>
  );
}
