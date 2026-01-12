import { Eye, ExternalLink } from 'lucide-react';
import { buildSubdomainUrlWithPath } from '../../../lib/subdomain';
import type { DistrictWithStats } from '../../../lib/services/systemAdmin.service';

interface DistrictCardProps {
  district: DistrictWithStats;
}

export function DistrictCard({ district }: DistrictCardProps) {
  const publicUrl = buildSubdomainUrlWithPath('district', '', district.slug);
  const adminUrl = `/${district.slug}/admin`;

  const handleViewPublic = () => {
    window.open(publicUrl, '_blank');
  };

  return (
    <div
      data-testid="district-card"
      className="bg-white border border-[#e8e6e1] rounded-xl p-6 hover:shadow-lg transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {district.logo_url ? (
            <img
              src={district.logo_url}
              alt=""
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-base font-bold flex-shrink-0"
              style={{ backgroundColor: district.primary_color || '#C03537' }}
            >
              {district.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-base font-semibold text-[#1a1a1a] truncate">
                {district.name}
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                  district.is_public
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {district.is_public ? 'Public' : 'Private'}
              </span>
            </div>
            {district.tagline && (
              <p className="text-xs text-[#8a8a8a] truncate">{district.tagline}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats - Updated to show Goals, Schools, Users */}
      <div className="flex items-center gap-6 mb-4 pb-4 border-b border-[#e8e6e1]">
        <div>
          <p className="text-2xl font-['Playfair_Display',_Georgia,_serif] font-medium text-[#1a1a1a]">
            {district.goals_count}
          </p>
          <p className="text-xs text-[#8a8a8a]">Goals</p>
        </div>
        <div>
          <p className="text-2xl font-['Playfair_Display',_Georgia,_serif] font-medium text-[#1a1a1a]">
            {district.schools_count}
          </p>
          <p className="text-xs text-[#8a8a8a]">Schools</p>
        </div>
        <div>
          <p className="text-2xl font-['Playfair_Display',_Georgia,_serif] font-medium text-[#1a1a1a]">
            {district.users_count}
          </p>
          <p className="text-xs text-[#8a8a8a]">Users</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <code className="text-xs text-[#8a8a8a]">
          {district.slug}
        </code>
        <div className="flex items-center gap-2">
          <button
            onClick={handleViewPublic}
            className="w-8 h-8 rounded-lg hover:bg-[#f5f3ef] text-[#8a8a8a] hover:text-[#4a4a4a] flex items-center justify-center transition-colors"
            title="Preview public site"
          >
            <Eye className="h-4 w-4" />
          </button>
          <a
            href={adminUrl}
            className="w-8 h-8 rounded-lg hover:bg-[#f5f3ef] text-[#8a8a8a] hover:text-[#4a4a4a] flex items-center justify-center transition-colors"
            title="Open district admin"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
