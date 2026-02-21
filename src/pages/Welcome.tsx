import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserInvitations, useAcceptInvitation, useDeclineInvitation } from '../hooks/useInvitations';
import { buildSubdomainUrlWithPath } from '../lib/subdomain';
import { Loader2, CheckCircle2, XCircle, Mail, Building2 } from 'lucide-react';
import type { InvitationWithOrg } from '../lib/services/invitation.service';

function InvitationCard({ invitation }: { invitation: InvitationWithOrg }) {
  const accept = useAcceptInvitation();
  const decline = useDeclineInvitation();

  const handleAccept = async () => {
    try {
      await accept.mutateAsync(invitation.token);
      const adminUrl = buildSubdomainUrlWithPath('district', '/admin', invitation.organization.slug);
      window.location.href = adminUrl;
    } catch (err) {
      console.error('[Welcome] Accept error:', err);
    }
  };

  const handleDecline = async () => {
    try {
      await decline.mutateAsync(invitation.token);
    } catch (err) {
      console.error('[Welcome] Decline error:', err);
    }
  };

  const isActing = accept.isPending || decline.isPending;

  return (
    <div className="rounded-xl border p-5 flex items-center gap-4" style={{ borderColor: 'var(--editorial-border)', background: 'var(--editorial-surface)' }}>
      <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
        {invitation.organization.logo_url ? (
          <img src={invitation.organization.logo_url} alt={invitation.organization.name} className="h-full w-full object-cover" />
        ) : (
          <Building2 className="h-6 w-6 text-slate-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--editorial-text-primary)' }}>
          {invitation.organization.name}
        </p>
        <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--editorial-text-muted)' }}>
          Invited as {invitation.role}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleDecline}
          disabled={isActing}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
          style={{ color: 'var(--editorial-text-secondary)' }}
        >
          {decline.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
          Decline
        </button>
        <button
          onClick={handleAccept}
          disabled={isActing}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
          style={{ background: 'var(--editorial-accent-primary)' }}
        >
          {accept.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          Accept
        </button>
      </div>
    </div>
  );
}

export function Welcome() {
  const { user } = useAuth();
  const { data: invitations, isLoading } = useUserInvitations();

  const pending = invitations?.filter((inv) => !inv.expires_at || new Date(inv.expires_at) > new Date()) ?? [];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)' }}>
      <style>{`
        .fade-in { animation: fadeIn 0.6s ease-out forwards; opacity: 0; }
        @keyframes fadeIn { to { opacity: 1; } }
      `}</style>

      <div className="w-full max-w-lg fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 overflow-hidden rounded-lg shadow-sm">
            <img src="/assets/stratadash-logo.png" alt="StrataDash" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-slate-900">StrataDash</span>
        </div>

        {/* Welcome Card */}
        <div className="rounded-xl border bg-white p-8 shadow-sm" style={{ borderColor: 'var(--editorial-border, #e2e8f0)' }}>
          <h1 className="text-2xl font-semibold tracking-tight text-center" style={{ color: 'var(--editorial-text-primary)', fontFamily: 'Playfair Display, serif' }}>
            Welcome to StrataDash{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="mt-2 text-sm text-center" style={{ color: 'var(--editorial-text-secondary)' }}>
            Your account has been created successfully.
          </p>

          {/* Invitations Section */}
          <div className="mt-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : pending.length > 0 ? (
              <>
                <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--editorial-text-primary)' }}>
                  Pending Invitations
                </h2>
                <div className="space-y-3">
                  {pending.map((inv) => (
                    <InvitationCard key={inv.id} invitation={inv} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                  <Mail className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--editorial-text-primary)' }}>
                  No pending invitations
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--editorial-text-muted)' }}>
                  Your organization administrator will send you an invitation. You'll receive it here.
                </p>
              </div>
            )}
          </div>

          {/* Dashboard Link */}
          <div className="mt-8 text-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-md"
              style={{ background: 'var(--editorial-accent-primary, #4f46e5)' }}
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
