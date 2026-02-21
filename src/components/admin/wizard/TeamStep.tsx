import { UserPlus, Trash2 } from 'lucide-react';
import type { WizardState } from './NameStep';

interface TeamStepProps {
  data: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function TeamStep({ data, onChange }: TeamStepProps) {
  const addMember = () => {
    onChange({
      invitations: [...data.invitations, { email: '', role: 'admin' }],
    });
  };

  const updateMember = (index: number, updates: Partial<{ email: string; role: string }>) => {
    const updated = data.invitations.map((inv, i) =>
      i === index ? { ...inv, ...updates } : inv
    );
    onChange({ invitations: updated });
  };

  const removeMember = (index: number) => {
    onChange({ invitations: data.invitations.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'var(--editorial-accent-primary)', opacity: 0.15 }}
        >
          <UserPlus size={20} style={{ color: 'var(--editorial-accent-primary)' }} />
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--editorial-text-primary)' }}>
            Invite Team
          </h2>
          <p className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
            Add team members to manage this district
          </p>
        </div>
      </div>

      {/* Invitation List */}
      <div className="space-y-3">
        {data.invitations.map((inv, index) => {
          const emailInvalid = inv.email.length > 0 && !isValidEmail(inv.email);
          return (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-1">
                <input
                  type="email"
                  value={inv.email}
                  onChange={(e) => updateMember(index, { email: e.target.value })}
                  placeholder="team@example.com"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1"
                  style={{
                    backgroundColor: 'var(--editorial-surface)',
                    borderColor: emailInvalid ? '#ef4444' : 'var(--editorial-border)',
                    color: 'var(--editorial-text-primary)',
                  }}
                />
                {emailInvalid && (
                  <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
                    Invalid email address
                  </p>
                )}
              </div>
              <select
                value={inv.role}
                onChange={(e) => updateMember(index, { role: e.target.value })}
                className="px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1"
                style={{
                  backgroundColor: 'var(--editorial-surface)',
                  borderColor: 'var(--editorial-border)',
                  color: 'var(--editorial-text-primary)',
                }}
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeMember(index)}
                className="p-2.5 rounded-lg border hover:bg-red-50 transition-colors"
                style={{ borderColor: 'var(--editorial-border)' }}
                title="Remove"
              >
                <Trash2 size={16} style={{ color: 'var(--editorial-text-muted)' }} />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addMember}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors hover:opacity-80"
        style={{
          borderColor: 'var(--editorial-accent-primary)',
          color: 'var(--editorial-accent-primary)',
        }}
      >
        <UserPlus size={16} />
        Add Member
      </button>

      {data.invitations.length === 0 && (
        <div
          className="rounded-xl p-8 text-center border"
          style={{
            backgroundColor: 'var(--editorial-surface)',
            borderColor: 'var(--editorial-border)',
          }}
        >
          <UserPlus size={32} className="mx-auto mb-3" style={{ color: 'var(--editorial-text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
            No team members added yet. You can invite people after creating the district too.
          </p>
        </div>
      )}
    </div>
  );
}
