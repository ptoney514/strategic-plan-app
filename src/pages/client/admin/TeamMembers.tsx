import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useOrgMembers } from '../../../hooks/useMembers';
import { useOrgInvitations } from '../../../hooks/useInvitations';
import { MembersTable } from '../../../components/admin/team/MembersTable';
import { PendingInvitationsTable } from '../../../components/admin/team/PendingInvitationsTable';
import { InviteMemberModal } from '../../../components/admin/team/InviteMemberModal';

type Tab = 'active' | 'pending';

export function TeamMembers() {
  const { slug } = useSubdomain();
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { data: members = [], isLoading: membersLoading } = useOrgMembers(slug || '');
  const { data: invitations = [], isLoading: invitationsLoading } = useOrgInvitations(slug || '');

  const pendingInvitations = invitations.filter((inv) => !inv.accepted_at);
  const isLoading = membersLoading || invitationsLoading;

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-[1100px]">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded" style={{ backgroundColor: 'var(--editorial-border)' }} />
          <div className="h-4 w-64 rounded mt-2" style={{ backgroundColor: 'var(--editorial-border-light)' }} />
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'active', label: 'Active Members', count: members.length },
    { id: 'pending', label: 'Pending Invitations', count: pendingInvitations.length },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1100px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-[28px] font-medium tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
          >
            Team Members
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--editorial-text-muted)' }}>
            Manage who has access to your district
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors flex-shrink-0"
          style={{ backgroundColor: 'var(--editorial-accent-primary)' }}
        >
          <UserPlus size={16} />
          <span className="hidden sm:inline">Invite Member</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1" style={{ borderBottom: '1px solid var(--editorial-border)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2.5 text-sm font-medium transition-colors relative"
            style={{
              color: activeTab === tab.id ? '#22B8AE' : 'var(--editorial-text-muted)',
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: activeTab === tab.id ? 'rgba(34, 184, 174, 0.1)' : 'var(--editorial-surface-alt)',
                  color: activeTab === tab.id ? '#22B8AE' : 'var(--editorial-text-muted)',
                }}
              >
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: '#22B8AE' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
      >
        {activeTab === 'active' ? (
          <MembersTable members={members} slug={slug || ''} />
        ) : (
          <PendingInvitationsTable invitations={invitations} slug={slug || ''} />
        )}
      </div>

      {/* Invite Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        slug={slug || ''}
      />
    </div>
  );
}
