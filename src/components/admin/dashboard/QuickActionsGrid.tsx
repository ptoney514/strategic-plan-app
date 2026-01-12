import { Target, UserPlus, Palette, Eye } from 'lucide-react';

interface QuickActionsGridProps {
  onAddObjective: () => void;
  onInviteUser: () => void;
  onCustomize: () => void;
  onPreviewSite: () => void;
}

/**
 * Grid of 4 quick action cards for common admin tasks
 */
export function QuickActionsGrid({
  onAddObjective,
  onInviteUser,
  onCustomize,
  onPreviewSite,
}: QuickActionsGridProps) {
  const actions = [
    {
      title: 'Add Objective',
      description: 'Create a new strategic objective',
      icon: Target,
      onClick: onAddObjective,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      hoverBg: 'hover:bg-blue-100',
    },
    {
      title: 'Invite User',
      description: 'Add team members to collaborate',
      icon: UserPlus,
      onClick: onInviteUser,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      hoverBg: 'hover:bg-green-100',
    },
    {
      title: 'Customize',
      description: 'Update branding and appearance',
      icon: Palette,
      onClick: onCustomize,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      hoverBg: 'hover:bg-purple-100',
    },
    {
      title: 'Preview Site',
      description: 'See your public strategic plan',
      icon: Eye,
      onClick: onPreviewSite,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      hoverBg: 'hover:bg-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.title}
            onClick={action.onClick}
            className={`p-4 rounded-xl border border-slate-200 bg-white ${action.hoverBg} transition-colors text-left group`}
          >
            <div
              className={`inline-flex p-2 rounded-lg ${action.bgColor} mb-3`}
            >
              <Icon className={`h-5 w-5 ${action.iconColor}`} />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">
              {action.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{action.description}</p>
          </button>
        );
      })}
    </div>
  );
}
