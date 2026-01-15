/**
 * EnvironmentBadge - Visual indicator showing current environment
 *
 * Displays a colored badge in the bottom-right corner:
 * - Green: development (local)
 * - Yellow: staging
 * - Blue: preview (PR deployments)
 * - Hidden: production
 *
 * Set VITE_ENVIRONMENT in .env.local to control the badge.
 */
const EnvironmentBadge = () => {
  const env = import.meta.env.VITE_ENVIRONMENT || 'development';

  // Don't show badge in production
  if (env === 'production') return null;

  const colors: Record<string, string> = {
    development: 'bg-green-500',
    staging: 'bg-yellow-500',
    preview: 'bg-blue-500',
  };

  const bgColor = colors[env] || 'bg-gray-500';

  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-3 py-1 rounded-full text-sm font-medium z-50 shadow-lg`}
    >
      {env.toUpperCase()}
    </div>
  );
};

export default EnvironmentBadge;
