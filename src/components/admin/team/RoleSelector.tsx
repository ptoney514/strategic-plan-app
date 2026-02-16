import { Shield, Edit3, Eye } from 'lucide-react';

interface RoleSelectorProps {
  value: string;
  onChange: (role: string) => void;
  includeOwner?: boolean;
}

const roles = [
  {
    id: 'admin',
    label: 'Admin',
    description: 'Full access to manage team, settings, and content',
    icon: Shield,
  },
  {
    id: 'editor',
    label: 'Editor',
    description: 'Can create and edit goals, metrics, and plans',
    icon: Edit3,
  },
  {
    id: 'viewer',
    label: 'Viewer',
    description: 'Can view district data and reports',
    icon: Eye,
  },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      {roles.map((role) => {
        const isSelected = value === role.id;
        const Icon = role.icon;
        return (
          <button
            key={role.id}
            type="button"
            onClick={() => onChange(role.id)}
            className="w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors"
            style={{
              backgroundColor: isSelected ? 'rgba(34, 184, 174, 0.08)' : 'var(--editorial-surface)',
              border: isSelected
                ? '2px solid var(--editorial-accent-primary)'
                : '1px solid var(--editorial-border)',
              padding: isSelected ? '11px' : '12px',
            }}
          >
            <Icon
              size={18}
              className="mt-0.5 flex-shrink-0"
              style={{ color: isSelected ? 'var(--editorial-accent-primary)' : 'var(--editorial-text-muted)' }}
            />
            <div>
              <div
                className="text-sm font-medium"
                style={{ color: isSelected ? 'var(--editorial-accent-primary)' : 'var(--editorial-text-primary)' }}
              >
                {role.label}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--editorial-text-muted)' }}>
                {role.description}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
