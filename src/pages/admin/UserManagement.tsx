import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Search, Loader2, Shield, ChevronDown } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { InviteUserModal } from '../../components/system-admin/InviteUserModal';
import { apiGet, apiPut } from '../../lib/api';

interface UserMembership {
  org_id: string;
  org_name: string;
  org_slug: string;
  role: string;
}

interface SystemUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  is_system_admin: boolean;
  created_at: string;
  memberships: UserMembership[];
}

const ROLE_STYLES: Record<string, { bg: string; text: string }> = {
  system_admin: { bg: 'rgba(234, 179, 8, 0.15)', text: '#eab308' },
  admin: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' },
  owner: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' },
  editor: { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7' },
  viewer: { bg: 'rgba(107, 114, 128, 0.15)', text: '#9ca3af' },
};

function RoleBadge({ role }: { role: string }) {
  const style = ROLE_STYLES[role] ?? ROLE_STYLES.viewer;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {role.replace('_', ' ')}
    </span>
  );
}

export function UserManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiGet<SystemUser[]>('/admin/users'),
  });

  const toggleAdminMutation = useMutation({
    mutationFn: ({ id, is_system_admin }: { id: string; is_system_admin: boolean }) =>
      apiPut(`/admin/users/${id}`, { is_system_admin }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const filtered = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      u.email.toLowerCase().includes(term) ||
      (u.name?.toLowerCase().includes(term) ?? false) ||
      u.memberships.some((m) => m.org_name.toLowerCase().includes(term))
    );
  });

  const totalAdmins = users.filter((u) => u.is_system_admin).length;
  const totalWithDistricts = users.filter((u) => u.memberships.length > 0).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--editorial-accent)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl p-6 text-center" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <p className="font-medium text-red-400">Failed to load users</p>
        <p className="text-sm text-red-400/70 mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--editorial-text)' }}>
            System Users
          </h1>
          <p className="mt-1" style={{ color: 'var(--editorial-muted)' }}>
            {users.length} users &middot; {totalAdmins} system admins &middot; {totalWithDistricts} with district access
          </p>
        </div>
        <Button onClick={() => setShowInviteModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--editorial-muted)' }} />
        <Input
          type="text"
          placeholder="Search by name, email, or district..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full sm:w-96"
        />
      </div>

      {/* Users table */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
        {/* Header row */}
        <div
          className="grid grid-cols-[1fr_1fr_1fr_140px_100px] gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--editorial-muted)', borderBottom: '1px solid var(--editorial-border)' }}
        >
          <span>User</span>
          <span>Email</span>
          <span>Districts</span>
          <span>System Admin</span>
          <span>Joined</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center" style={{ color: 'var(--editorial-muted)' }}>
            {searchTerm ? 'No users match your search' : 'No users found'}
          </div>
        ) : (
          filtered.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              isExpanded={expandedUser === u.id}
              onToggleExpand={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
              onToggleAdmin={() =>
                toggleAdminMutation.mutate({ id: u.id, is_system_admin: !u.is_system_admin })
              }
              isToggling={toggleAdminMutation.isPending}
            />
          ))
        )}
      </div>

      <InviteUserModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
    </div>
  );
}

function UserRow({
  user,
  isExpanded,
  onToggleExpand,
  onToggleAdmin,
  isToggling,
}: {
  user: SystemUser;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleAdmin: () => void;
  isToggling: boolean;
}) {
  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();
  const joined = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--';

  return (
    <div style={{ borderBottom: '1px solid var(--editorial-border)' }}>
      <div className="grid grid-cols-[1fr_1fr_1fr_140px_100px] gap-4 px-6 py-4 items-center">
        {/* User */}
        <div className="flex items-center gap-3 min-w-0">
          {user.image ? (
            <img src={user.image} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ backgroundColor: 'var(--editorial-accent)', color: '#fff' }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--editorial-text)' }}>
              {user.name ?? 'Unnamed'}
            </p>
            {user.is_system_admin && <RoleBadge role="system_admin" />}
          </div>
        </div>

        {/* Email */}
        <span className="text-sm truncate" style={{ color: 'var(--editorial-muted)' }}>
          {user.email}
        </span>

        {/* Districts */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {user.memberships.length === 0 ? (
            <span className="text-xs" style={{ color: 'var(--editorial-muted)' }}>None</span>
          ) : (
            <>
              {user.memberships.slice(0, 2).map((m) => (
                <span
                  key={m.org_id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                  style={{ backgroundColor: 'var(--editorial-bg)', color: 'var(--editorial-text)' }}
                >
                  {m.org_name}
                  <RoleBadge role={m.role} />
                </span>
              ))}
              {user.memberships.length > 2 && (
                <button
                  onClick={onToggleExpand}
                  className="text-xs px-1.5 py-0.5 rounded hover:opacity-80"
                  style={{ color: 'var(--editorial-accent)' }}
                >
                  +{user.memberships.length - 2} more
                  <ChevronDown className="inline h-3 w-3 ml-0.5" />
                </button>
              )}
            </>
          )}
        </div>

        {/* System Admin toggle */}
        <div>
          <button
            onClick={onToggleAdmin}
            disabled={isToggling}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
            style={{
              backgroundColor: user.is_system_admin ? 'rgba(234,179,8,0.15)' : 'var(--editorial-bg)',
              color: user.is_system_admin ? '#eab308' : 'var(--editorial-muted)',
              border: `1px solid ${user.is_system_admin ? 'rgba(234,179,8,0.3)' : 'var(--editorial-border)'}`,
            }}
          >
            <Shield className="h-3.5 w-3.5" />
            {user.is_system_admin ? 'Admin' : 'User'}
          </button>
        </div>

        {/* Joined */}
        <span className="text-xs" style={{ color: 'var(--editorial-muted)' }}>{joined}</span>
      </div>

      {/* Expanded memberships */}
      {isExpanded && user.memberships.length > 2 && (
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-1.5 pl-11">
            {user.memberships.slice(2).map((m) => (
              <span
                key={m.org_id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                style={{ backgroundColor: 'var(--editorial-bg)', color: 'var(--editorial-text)' }}
              >
                {m.org_name}
                <RoleBadge role={m.role} />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
