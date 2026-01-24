import { FileText, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserDashboardStats } from '../../hooks/useUserDistricts';

export function WelcomeBanner() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useUserDashboardStats();

  const displayName =
    user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';

  // Get first name for greeting
  const firstName = displayName.split(' ')[0];

  // Get initials for avatar
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <section className="rounded-2xl relative overflow-hidden shadow-lg shadow-brand-teal/10">
      {/* Background with gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(1000px circle at 22% 35%, rgba(255,255,255,.14) 0%, rgba(255,255,255,0) 55%),
            radial-gradient(900px circle at 88% 58%, rgba(54, 215, 195,.24) 0%, rgba(54, 215, 195,0) 55%),
            linear-gradient(135deg, #061427 0%, #0B1F3A 35%, #1A6F73 70%, #36D7C3 100%)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-10 brightness-100 contrast-150"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-brand-mint/20 rounded-full blur-3xl" />

      <div className="relative flex items-center p-8">
        <div className="flex items-center gap-6 w-full max-w-4xl">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
              <span className="text-2xl font-medium text-white tracking-widest">{initials}</span>
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-brand-mint border-[3px] border-brand-navy rounded-full" />
          </div>

          {/* Welcome text and stats */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">
              Welcome back, {firstName}!
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-brand-mint/80 text-sm font-medium">
              <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                <FileText size={16} />
                <span className="text-white">
                  {isLoading ? '...' : stats?.activePlansCount || 0} active plans
                </span>
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                <Bell size={16} />
                <span className="text-white">
                  {isLoading ? '...' : stats?.totalObjectivesCount || 0} objectives
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
