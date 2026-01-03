import { Link, useParams } from 'react-router-dom';
import type { Goal } from '../../lib/types';
import { StatusBadge, calculateStatus } from './StatusBadge';

interface GoalHeaderProps {
  goal: Goal;
  parentObjective?: Goal;
}

// Color mapping for goal headers
const colorConfig = {
  red: {
    badge: 'bg-district-red',
  },
  blue: {
    badge: 'bg-district-blue',
  },
  amber: {
    badge: 'bg-district-amber',
  },
  green: {
    badge: 'bg-district-green',
  },
};

// Get color based on goal's color field or parent's color
function getColor(goal: Goal, parentObjective?: Goal): keyof typeof colorConfig {
  // Check goal's own color first
  if (goal.color && goal.color in colorConfig) {
    return goal.color as keyof typeof colorConfig;
  }
  // Then check parent's color
  if (parentObjective?.color && parentObjective.color in colorConfig) {
    return parentObjective.color as keyof typeof colorConfig;
  }
  // Default to red
  return 'red';
}

export function GoalHeader({ goal, parentObjective }: GoalHeaderProps) {
  const { slug } = useParams();
  const color = getColor(goal, parentObjective);
  const colors = colorConfig[color];
  const status = calculateStatus(goal.overall_progress);

  // Build breadcrumbs
  const breadcrumbs = [
    { label: 'Strategic Plan', href: `/${slug}` },
  ];

  if (parentObjective) {
    breadcrumbs.push({
      label: parentObjective.title,
      href: `/${slug}/goal/${parentObjective.id}`,
    });
  }

  breadcrumbs.push({
    label: `${goal.goal_number} ${goal.title}`,
    href: undefined, // Current page
  });

  return (
    <div className="mb-12">
      {/* Breadcrumbs */}
      <nav className="flex text-xs text-gray-500 space-x-2 items-center mb-4">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            {crumb.href ? (
              <Link to={crumb.href} className="hover:text-gray-900 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{crumb.label}</span>
            )}
            {i < breadcrumbs.length - 1 && <span className="text-gray-300">/</span>}
          </span>
        ))}
      </nav>

      {/* Title row */}
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 lg:w-14 lg:h-14 rounded-lg ${colors.badge} text-white flex items-center justify-center font-display font-semibold text-xl lg:text-2xl shadow-sm flex-shrink-0`}
        >
          {goal.goal_number}
        </div>
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="font-display font-semibold text-2xl lg:text-3xl text-gray-900 tracking-tight">
              {goal.title}
            </h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-gray-500 text-sm lg:text-base leading-relaxed">
            {goal.description || goal.executive_summary || 'Strategic goal for organizational growth and excellence.'}
          </p>
        </div>
      </div>
    </div>
  );
}
