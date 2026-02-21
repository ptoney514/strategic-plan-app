import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Users } from 'lucide-react';
import { useUpdateMemberRole } from '../../../hooks/useMembers';
import { useRemoveMember } from '../../../hooks/useMembers';
import type { Member } from '../../../lib/services/member.service';

interface MembersTableProps {
  members: Member[];
  slug: string;
}

const roleBadgeStyles: Record<string, { bg: string; color: string }> = {
  admin: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
  editor: { bg: 'rgba(147, 51, 234, 0.1)', color: '#9333ea' },
  viewer: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' },
};

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
  }
  return email.substring(0, 2).toUpperCase();
}

function getAvatarColor(id: string): string {
  const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
  const index = id.charCodeAt(0) % colors.length;
  return colors[index];
}

export function MembersTable({ members, slug }: MembersTableProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const updateRole = useUpdateMemberRole(slug);
  const removeMember = useRemoveMember(slug);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (members.length === 0) {
    return (
      <div className="py-12 text-center">
        <Users className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--editorial-border)' }} />
        <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--editorial-text-primary)' }}>
          No team members yet
        </h3>
        <p className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
          Invite members to start collaborating.
        </p>
      </div>
    );
  }

  const handleRoleChange = (memberId: string, newRole: string) => {
    updateRole.mutate({ id: memberId, role: newRole });
    setOpenMenu(null);
  };

  const handleRemove = (memberId: string) => {
    removeMember.mutate(memberId);
    setConfirmRemove(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead style={{ backgroundColor: 'var(--editorial-surface-alt)', borderBottom: '1px solid var(--editorial-border)' }}>
          <tr>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--editorial-text-muted)' }}>User</th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: 'var(--editorial-text-muted)' }}>Email</th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--editorial-text-muted)' }}>Role</th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: 'var(--editorial-text-muted)' }}>Joined</th>
            <th className="w-12 py-3 px-4" />
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const badge = roleBadgeStyles[member.role] || roleBadgeStyles.viewer;
            return (
              <tr key={member.id} style={{ borderBottom: '1px solid var(--editorial-border-light)' }}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0"
                      style={{ backgroundColor: getAvatarColor(member.id) }}
                    >
                      {getInitials(member.user_name, member.user_email)}
                    </div>
                    <span className="font-medium text-sm" style={{ color: 'var(--editorial-text-primary)' }}>
                      {member.user_name || member.user_email.split('@')[0]}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm hidden sm:table-cell" style={{ color: 'var(--editorial-text-secondary)' }}>
                  {member.user_email}
                </td>
                <td className="py-3 px-4">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-xs font-medium capitalize"
                    style={{ backgroundColor: badge.bg, color: badge.color }}
                  >
                    {member.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm hidden md:table-cell" style={{ color: 'var(--editorial-text-muted)' }}>
                  {member.created_at ? new Date(member.created_at).toLocaleDateString() : '--'}
                </td>
                <td className="py-3 px-4 relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === member.id ? null : member.id)}
                    className="p-1 rounded transition-colors"
                    style={{ color: 'var(--editorial-text-muted)' }}
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenu === member.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-4 top-10 z-10 w-44 rounded-lg shadow-lg py-1"
                      style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
                    >
                      <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--editorial-text-muted)' }}>
                        Change Role
                      </div>
                      {['admin', 'editor', 'viewer'].map((r) => (
                        <button
                          key={r}
                          onClick={() => handleRoleChange(member.id, r)}
                          disabled={member.role === r}
                          className="w-full text-left px-3 py-1.5 text-sm capitalize disabled:opacity-40"
                          style={{ color: 'var(--editorial-text-primary)' }}
                        >
                          {r}
                        </button>
                      ))}
                      <div className="my-1" style={{ borderTop: '1px solid var(--editorial-border-light)' }} />
                      <button
                        onClick={() => { setConfirmRemove(member.id); setOpenMenu(null); }}
                        className="w-full text-left px-3 py-1.5 text-sm"
                        style={{ color: '#ef4444' }}
                      >
                        Remove Member
                      </button>
                    </div>
                  )}
                  {confirmRemove === member.id && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmRemove(null)} />
                      <div
                        className="relative rounded-xl p-6 max-w-sm w-full"
                        style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
                      >
                        <h3 className="text-base font-medium mb-2" style={{ color: 'var(--editorial-text-primary)' }}>
                          Remove Member
                        </h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--editorial-text-secondary)' }}>
                          Are you sure you want to remove <strong>{member.user_name || member.user_email}</strong>? They will lose access to this district.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setConfirmRemove(null)}
                            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium"
                            style={{ border: '1px solid var(--editorial-border)', color: 'var(--editorial-text-secondary)' }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleRemove(member.id)}
                            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-white"
                            style={{ backgroundColor: '#ef4444' }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
