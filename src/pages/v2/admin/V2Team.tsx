import { useState } from 'react';
import { UserPlus, Trash2, Mail, RefreshCw, Loader2 } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useOrgMembers, useRemoveMember } from '../../../hooks/v2/useTeam';
import { useOrgInvitations, useRevokeInvitation, useResendInvitation } from '../../../hooks/useInvitations';
import { InviteModal } from '../../../components/v2/InviteModal';

function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case 'owner':
      return <Badge className="bg-blue-100 text-blue-800">Owner</Badge>;
    case 'admin':
      return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
    case 'editor':
      return <Badge variant="success">Editor</Badge>;
    case 'viewer':
      return <Badge variant="secondary">Viewer</Badge>;
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
}

export function V2Team() {
  const { slug } = useSubdomain();
  const [showInvite, setShowInvite] = useState(false);
  const { data: members = [], isLoading: membersLoading } = useOrgMembers(slug || '');
  const { data: invitations = [], isLoading: invitationsLoading } = useOrgInvitations(slug || '');
  const removeMember = useRemoveMember(slug || '');
  const revokeInvitation = useRevokeInvitation(slug || '');
  const resendInvitation = useResendInvitation(slug || '');

  function handleRemove(memberId: string, name: string) {
    if (window.confirm(`Remove ${name} from this district?`)) {
      removeMember.mutate(memberId);
    }
  }

  function handleRevoke(invitationId: string, email: string) {
    if (window.confirm(`Revoke invitation for ${email}?`)) {
      revokeInvitation.mutate(invitationId);
    }
  }

  const isLoading = membersLoading || invitationsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--editorial-accent-primary)' }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--editorial-text-primary)' }}>Team</h1>
        <Button size="sm" onClick={() => setShowInvite(true)}>
          <UserPlus className="h-4 w-4 mr-1.5" />
          Invite Member
        </Button>
      </div>

      {/* Members */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--editorial-text-secondary)' }}>
          Members ({members.length})
        </h2>
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--editorial-border)', backgroundColor: 'var(--editorial-surface)' }}>
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--editorial-border)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--editorial-text-primary)' }}>
                    {member.user_name || member.user_email}
                  </div>
                  {member.user_name && (
                    <div className="text-xs truncate" style={{ color: 'var(--editorial-text-secondary)' }}>{member.user_email}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <RoleBadge role={member.role} />
                {member.role !== 'owner' && (
                  <button
                    onClick={() => handleRemove(member.id, member.user_name || member.user_email)}
                    className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    aria-label={`Remove ${member.user_name || member.user_email}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pending Invitations */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--editorial-text-secondary)' }}>
          Pending Invitations ({invitations.length})
        </h2>
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--editorial-border)', backgroundColor: 'var(--editorial-surface)' }}>
          {invitations.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--editorial-text-secondary)' }}>
              No pending invitations
            </div>
          ) : (
            invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid var(--editorial-border)' }}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--editorial-text-primary)' }}>
                    {inv.email}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--editorial-text-secondary)' }}>
                    Sent {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <RoleBadge role={inv.role} />
                  <button
                    onClick={() => resendInvitation.mutate(inv.id)}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={`Resend invitation to ${inv.email}`}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRevoke(inv.id, inv.email)}
                    className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    aria-label={`Revoke invitation for ${inv.email}`}
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <InviteModal isOpen={showInvite} onClose={() => setShowInvite(false)} slug={slug || ''} />
    </div>
  );
}
