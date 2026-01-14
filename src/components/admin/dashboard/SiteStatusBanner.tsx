import { ExternalLink, Globe } from 'lucide-react';

interface SiteStatusBannerProps {
  districtName: string;
  publicUrl: string;
  objectivesCount: number;
  draftsCount: number;
  usersCount: number;
  isPublic: boolean;
  onViewSite: () => void;
}

/**
 * Dark gradient banner showing site live status and key stats
 */
export function SiteStatusBanner({
  districtName: _districtName,
  publicUrl,
  objectivesCount,
  draftsCount,
  usersCount,
  isPublic,
  onViewSite,
}: SiteStatusBannerProps) {
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Status and URL */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isPublic ? 'bg-green-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-sm font-medium">
              {isPublic ? 'Live' : 'Draft'}
            </span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-600" />
          <button
            onClick={onViewSite}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm">{publicUrl}</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>

        {/* Right: Stats */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold">{objectivesCount}</p>
            <p className="text-xs text-slate-400">Objectives</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{draftsCount}</p>
            <p className="text-xs text-slate-400">Drafts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{usersCount}</p>
            <p className="text-xs text-slate-400">Users</p>
          </div>
        </div>
      </div>
    </div>
  );
}
