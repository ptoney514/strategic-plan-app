import { Mail, RefreshCw, XCircle } from 'lucide-react';
import { useResendInvitation, useRevokeInvitation } from '../../../hooks/useInvitations';
import type { Invitation } from '../../../lib/services/invitation.service';

interface PendingInvitationsTableProps {
  invitations: Invitation[];
  slug: string;
}

const roleBadgeStyles: Record<string, { bg: string; color: string }> = {
  admin: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
  editor: { bg: 'rgba(147, 51, 234, 0.1)', color: '#9333ea' },
  viewer: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' },
};

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

export function PendingInvitationsTable({ invitations, slug }: PendingInvitationsTableProps) {
  const resendInvitation = useResendInvitation(slug);
  const revokeInvitation = useRevokeInvitation(slug);

  // Filter out accepted invitations
  const pending = invitations.filter((inv) => !inv.accepted_at);

  if (pending.length === 0) {
    return (
      <div className="py-12 text-center">
        <Mail className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--editorial-border)' }} />
        <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--editorial-text-primary)' }}>
          No pending invitations
        </h3>
        <p className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
          Invite team members to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead style={{ backgroundColor: 'var(--editorial-surface-alt)', borderBottom: '1px solid var(--editorial-border)' }}>
          <tr>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--editorial-text-muted)' }}>Email</th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--editorial-text-muted)' }}>Role</th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: 'var(--editorial-text-muted)' }}>Invited By</th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: 'var(--editorial-text-muted)' }}>Sent</th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--editorial-text-muted)' }}>Status</th>
            <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--editorial-text-muted)' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pending.map((inv) => {
            const expired = isExpired(inv.expires_at);
            const badge = roleBadgeStyles[inv.role] || roleBadgeStyles.viewer;
            return (
              <tr key={inv.id} style={{ borderBottom: '1px solid var(--editorial-border-light)' }}>
                <td className="py-3 px-4 text-sm font-medium" style={{ color: 'var(--editorial-text-primary)' }}>
                  {inv.email}
                </td>
                <td className="py-3 px-4">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-xs font-medium capitalize"
                    style={{ backgroundColor: badge.bg, color: badge.color }}
                  >
                    {inv.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm hidden md:table-cell" style={{ color: 'var(--editorial-text-secondary)' }}>
                  {inv.invited_by_name || inv.invited_by_email || '--'}
                </td>
                <td className="py-3 px-4 text-sm hidden sm:table-cell" style={{ color: 'var(--editorial-text-muted)' }}>
                  {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : '--'}
                </td>
                <td className="py-3 px-4">
                  {expired ? (
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                      Expired
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04' }}>
                      Pending
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => resendInvitation.mutate(inv.id)}
                      disabled={resendInvitation.isPending}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: 'var(--editorial-accent-primary)' }}
                      title="Resend invitation"
                    >
                      <RefreshCw size={15} />
                    </button>
                    <button
                      onClick={() => revokeInvitation.mutate(inv.id)}
                      disabled={revokeInvitation.isPending}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: '#ef4444' }}
                      title="Revoke invitation"
                    >
                      <XCircle size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
