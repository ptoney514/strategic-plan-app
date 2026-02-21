import { Link } from 'react-router-dom';
import { PlusCircle, Users, FileText, Settings } from 'lucide-react';

interface QuickActionsPanelProps {
  slug: string;
}

const actions = [
  {
    title: 'Create Objective',
    description: 'Add a new strategic objective',
    path: '/admin/objectives/create',
    icon: PlusCircle,
  },
  {
    title: 'Manage Team',
    description: 'Invite members and manage roles',
    path: '/admin/users',
    icon: Users,
  },
  {
    title: 'View Plans',
    description: 'Manage strategic plans',
    path: '/admin/plans',
    icon: FileText,
  },
  {
    title: 'Settings',
    description: 'Configure district settings',
    path: '/admin/settings',
    icon: Settings,
  },
];

export function QuickActionsPanel({ slug: _slug }: QuickActionsPanelProps) {
  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
    >
      <h3
        className="text-lg font-medium mb-4"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
      >
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ title, description, path, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className="rounded-lg p-4 transition-colors group"
            style={{ backgroundColor: 'var(--editorial-bg)', border: '1px solid var(--editorial-border)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--editorial-accent-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--editorial-border)'; }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5"
              style={{ backgroundColor: 'rgba(45, 130, 130, 0.1)', color: '#2d8282' }}
            >
              <Icon size={18} />
            </div>
            <div
              className="text-sm font-semibold mb-0.5 group-hover:text-[#2d8282] transition-colors"
              style={{ color: 'var(--editorial-text-primary)' }}
            >
              {title}
            </div>
            <div className="text-xs" style={{ color: 'var(--editorial-text-muted)' }}>
              {description}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
