import { Eye, ExternalLink } from 'lucide-react';
import { buildSubdomainUrlWithPath } from '../../../lib/subdomain';
import type { DistrictWithStats } from '../../../lib/services/systemAdmin.service';

interface DistrictGridItemProps {
  district: DistrictWithStats;
}

export function DistrictGridItem({ district }: DistrictGridItemProps) {
  const publicUrl = buildSubdomainUrlWithPath('district', '', district.slug);
  const adminUrl = `/${district.slug}/admin`;

  const handleViewPublic = () => {
    window.open(publicUrl, '_blank');
  };

  return (
    <div
      data-testid="district-grid-item"
      className="bg-white border border-[#e8e6e1] rounded-xl p-4 hover:shadow-lg transition-all text-center group"
    >
      {/* Logo */}
      <div className="flex justify-center mb-3">
        {district.logo_url ? (
          <img
            src={district.logo_url}
            alt=""
            className="w-14 h-14 rounded-lg object-cover"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center text-white text-lg font-bold"
            style={{ backgroundColor: district.primary_color || '#C03537' }}
          >
            {district.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="text-sm font-semibold text-[#1a1a1a] mb-1 truncate px-2">
        {district.name}
      </h3>

      {/* Status Badge */}
      <div className="flex justify-center mb-2">
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${
            district.is_public
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {district.is_public ? 'Public' : 'Private'}
        </span>
      </div>

      {district.tagline && (
        <p className="text-xs text-[#8a8a8a] mb-3 truncate px-2">{district.tagline}</p>
      )}

      {/* Stats - Inline - Updated to show Goals, Schools, Users */}
      <div className="flex items-center justify-center gap-3 mb-3 pb-3 border-b border-[#e8e6e1]">
        <div>
          <p className="text-lg font-['Playfair_Display',_Georgia,_serif] font-medium text-[#1a1a1a]">
            {district.goals_count}
          </p>
          <p className="text-[10px] text-[#8a8a8a]">Goals</p>
        </div>
        <div className="w-px h-8 bg-[#e8e6e1]" />
        <div>
          <p className="text-lg font-['Playfair_Display',_Georgia,_serif] font-medium text-[#1a1a1a]">
            {district.schools_count}
          </p>
          <p className="text-[10px] text-[#8a8a8a]">Schools</p>
        </div>
        <div className="w-px h-8 bg-[#e8e6e1]" />
        <div>
          <p className="text-lg font-['Playfair_Display',_Georgia,_serif] font-medium text-[#1a1a1a]">
            {district.users_count}
          </p>
          <p className="text-[10px] text-[#8a8a8a]">Users</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <code className="text-xs text-[#8a8a8a]">
          {district.slug}
        </code>
        <div className="flex items-center gap-1">
          <button
            onClick={handleViewPublic}
            className="w-7 h-7 rounded-lg hover:bg-[#f5f3ef] text-[#8a8a8a] hover:text-[#4a4a4a] flex items-center justify-center transition-colors"
            title="Preview public site"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <a
            href={adminUrl}
            className="w-7 h-7 rounded-lg hover:bg-[#f5f3ef] text-[#8a8a8a] hover:text-[#4a4a4a] flex items-center justify-center transition-colors"
            title="Open district admin"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
