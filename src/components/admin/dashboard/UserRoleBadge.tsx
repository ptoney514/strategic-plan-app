import type { UserRole } from '../../../lib/services/systemAdmin.service';

interface UserRoleBadgeProps {
  role: UserRole;
}

const roleConfig: Record<UserRole, { label: string; classes: string }> = {
  system_admin: {
    label: 'System Admin',
    classes: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  district_admin: {
    label: 'District Admin',
    classes: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  school_admin: {
    label: 'School Admin',
    classes: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  editor: {
    label: 'Editor',
    classes: 'bg-gray-100 text-gray-600 border-gray-200',
  },
};

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const config = roleConfig[role];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
