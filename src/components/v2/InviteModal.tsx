import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useSendInvitation } from '../../hooks/useInvitations';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
}

const ROLES = [
  { value: 'admin', label: 'Admin', desc: 'Full access to manage district' },
  { value: 'editor', label: 'Editor', desc: 'Can edit plans and goals' },
  { value: 'viewer', label: 'Viewer', desc: 'Read-only access' },
] as const;

export function InviteModal({ isOpen, onClose, slug }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [error, setError] = useState('');
  const sendInvitation = useSendInvitation(slug);

  if (!isOpen) return null;

  function handleClose() {
    setEmail('');
    setRole('editor');
    setError('');
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      await sendInvitation.mutateAsync({ email: email.trim(), role });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} onKeyDown={(e) => { if (e.key === 'Escape') handleClose(); }} />
      <div
        className="relative w-full max-w-md mx-4 rounded-xl shadow-xl p-6"
        style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Invite member"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--editorial-text-primary)' }}>
            Invite Member
          </h2>
          <button onClick={handleClose} className="p-1 rounded-md hover:bg-gray-100 transition-colors" aria-label="Close">
            <X className="h-4 w-4" style={{ color: 'var(--editorial-text-secondary)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="invite-email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--editorial-text-primary)' }}>
              Email address
            </label>
            <Input
              id="invite-email"
              type="email"
              placeholder="colleague@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error || undefined}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--editorial-text-primary)' }}>
              Role
            </label>
            <div className="space-y-2">
              {ROLES.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    role === r.value ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--editorial-text-primary)' }}>{r.label}</div>
                    <div className="text-xs" style={{ color: 'var(--editorial-text-secondary)' }}>{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={sendInvitation.isPending}>
              {sendInvitation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
