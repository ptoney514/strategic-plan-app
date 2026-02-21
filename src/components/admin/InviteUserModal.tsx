import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Loader2, Mail, Building2, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useSendInvitation } from '../../hooks/useInvitations';
import { apiGet } from '../../lib/api';
import type { District } from '../../lib/types';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLES = [
  { value: 'admin', label: 'Admin', description: 'Full district management access' },
  { value: 'editor', label: 'Editor', description: 'Can edit goals and metrics' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
] as const;

export function InviteUserModal({ isOpen, onClose }: InviteUserModalProps) {
  const [email, setEmail] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedRole, setSelectedRole] = useState('admin');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: districts = [] } = useQuery({
    queryKey: ['districts'],
    queryFn: () => apiGet<District[]>('/organizations'),
    enabled: isOpen,
  });

  const selectedSlug = districts.find(d => d.id === selectedDistrict)?.slug ?? '';
  const sendInvitation = useSendInvitation(selectedSlug);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!selectedDistrict) {
      setError('Please select a district');
      return;
    }

    try {
      await sendInvitation.mutateAsync({ email: email.trim(), role: selectedRole });
      const districtName = districts.find(d => d.id === selectedDistrict)?.name ?? 'district';
      setSuccess(`Invitation sent to ${email.trim()} for ${districtName}`);
      setEmail('');
      setSelectedDistrict('');
      setSelectedRole('admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    }
  };

  const handleClose = () => {
    setEmail('');
    setSelectedDistrict('');
    setSelectedRole('admin');
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
      <div
        className="relative w-full max-w-lg mx-4 rounded-xl p-6"
        style={{ backgroundColor: 'var(--editorial-surface)', color: 'var(--editorial-text)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--editorial-accent)', color: '#fff' }}
            >
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold">Invite User</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg transition-colors hover:opacity-70"
            style={{ color: 'var(--editorial-muted)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg p-3 text-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--editorial-muted)' }}>
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--editorial-muted)' }}>
              <Building2 className="inline h-4 w-4 mr-1 -mt-0.5" />
              District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--editorial-bg)',
                borderColor: 'var(--editorial-border)',
                color: 'var(--editorial-text)',
              }}
            >
              <option value="">Select a district...</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--editorial-muted)' }}>
              <Shield className="inline h-4 w-4 mr-1 -mt-0.5" />
              Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className="rounded-lg border p-3 text-left transition-all"
                  style={{
                    backgroundColor: selectedRole === role.value
                      ? 'var(--editorial-accent)'
                      : 'var(--editorial-bg)',
                    borderColor: selectedRole === role.value
                      ? 'var(--editorial-accent)'
                      : 'var(--editorial-border)',
                    color: selectedRole === role.value ? '#fff' : 'var(--editorial-text)',
                  }}
                >
                  <div className="text-sm font-medium">{role.label}</div>
                  <div
                    className="text-xs mt-0.5"
                    style={{
                      color: selectedRole === role.value ? 'rgba(255,255,255,0.8)' : 'var(--editorial-muted)',
                    }}
                  >
                    {role.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={sendInvitation.isPending}>
              {sendInvitation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
