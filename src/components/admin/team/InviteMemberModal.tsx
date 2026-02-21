import { useState } from 'react';
import { X } from 'lucide-react';
import { RoleSelector } from './RoleSelector';
import { useSendInvitation } from '../../../hooks/useInvitations';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
}

export function InviteMemberModal({ isOpen, onClose, slug }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const sendInvitation = useSendInvitation(slug);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      await sendInvitation.mutateAsync({
        email: email.trim(),
        role,
        message: message.trim() || undefined,
      });
      setEmail('');
      setRole('viewer');
      setMessage('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-xl p-6"
        style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-lg font-medium"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
          >
            Invite Team Member
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: 'var(--editorial-text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--editorial-text-secondary)' }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@district.edu"
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: 'var(--editorial-bg)',
                border: '1px solid var(--editorial-border)',
                color: 'var(--editorial-text-primary)',
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--editorial-text-secondary)' }}>
              Role
            </label>
            <RoleSelector value={role} onChange={setRole} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--editorial-text-secondary)' }}>
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal note..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm resize-none"
              style={{
                backgroundColor: 'var(--editorial-bg)',
                border: '1px solid var(--editorial-border)',
                color: 'var(--editorial-text-primary)',
              }}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: '#ef4444' }}>
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ border: '1px solid var(--editorial-border)', color: 'var(--editorial-text-secondary)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sendInvitation.isPending}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--editorial-accent-primary)' }}
            >
              {sendInvitation.isPending ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
