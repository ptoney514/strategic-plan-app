import { Users } from 'lucide-react';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict } from '../../../hooks/useDistricts';
import { UserRoleBadge } from '../../../components/admin/dashboard';

/**
 * DistrictUsers - View district team members and administrators
 * Read-only display - users are managed via the admin dashboard
 * Restyled with editorial warm paper aesthetic
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
      <div className="p-6 lg:p-8 space-y-6 max-w-[1100px]">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded" style={{ backgroundColor: 'var(--editorial-border)' }} />
          <div className="h-4 w-32 rounded mt-2" style={{ backgroundColor: 'var(--editorial-border-light)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1100px]">
      {/* Header */}
      <div>
        <h1
          className="text-2xl sm:text-[28px] font-medium tracking-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
        >
          Team
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--editorial-text-muted)' }}>
          {district?.name} administrators and editors
        </p>
      </div>

      {/* Users Table */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
        <table className="w-full">
          <thead style={{ backgroundColor: 'var(--editorial-surface-alt)', borderBottom: '1px solid var(--editorial-border)' }}>
            <tr>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--editorial-text-muted)' }}>
                User
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--editorial-text-muted)' }}>
                Email
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--editorial-text-muted)' }}>
                Role
              </th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--editorial-border)' }} />
                  <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--editorial-text-primary)' }}>
                    No team members yet
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
                    Add team members to manage your district's strategic plan.
                  </p>
                </td>
              </tr>
            ) : (
              mockUsers.map((user) => (
                <tr
                  key={user.id}
                  style={{ borderBottom: '1px solid var(--editorial-border-light)' }}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm"
                        style={{ backgroundColor: 'var(--editorial-surface-alt)', color: 'var(--editorial-text-secondary)' }}
                      >
                        {(user.name || user.email).substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium" style={{ color: 'var(--editorial-text-primary)' }}>
                        {user.name || user.email.split('@')[0]}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm" style={{ color: 'var(--editorial-text-secondary)' }}>
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
      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: 'rgba(74, 111, 165, 0.08)', border: '1px solid rgba(74, 111, 165, 0.2)' }}
      >
        <p className="text-sm" style={{ color: 'var(--editorial-accent-link)' }}>
          <strong>Note:</strong> User management is handled through the admin dashboard.
          Contact your system administrator to add or modify team members.
        </p>
      </div>
    </div>
  );
}
