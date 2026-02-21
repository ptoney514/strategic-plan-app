import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Building2,
  Target,
  GraduationCap,
  Users,
  ExternalLink,
  Eye,
  Loader2,
} from 'lucide-react';
import { useDistrictsWithStats } from '../../hooks/useSystemAdminStats';
import { buildSubdomainUrlWithPath } from '../../lib/subdomain';
import type { DistrictWithStats } from '../../lib/services/systemAdmin.service';

function DistrictCardItem({ district }: { district: DistrictWithStats }) {
  const publicUrl = buildSubdomainUrlWithPath('district', '', district.slug);
  const adminUrl = buildSubdomainUrlWithPath('district', '/admin', district.slug);

  return (
    <div className="bg-white border border-[#e8e6e1] rounded-xl overflow-hidden hover:shadow-lg transition-all group">
      {/* Color accent stripe */}
      <div
        className="h-1.5"
        style={{ backgroundColor: district.primary_color || '#c9a227' }}
      />

      <div className="p-5">
        {/* Header: Logo + Name */}
        <div className="flex items-start gap-3 mb-4">
          {district.logo_url ? (
            <img
              src={district.logo_url}
              alt=""
              className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center text-white text-base font-bold flex-shrink-0"
              style={{ backgroundColor: district.primary_color || '#c9a227' }}
            >
              {district.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-[#1a1a1a] truncate">
              {district.name}
            </h3>
            <code className="text-xs text-[#8a8a8a]">{district.slug}</code>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
              district.is_public
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {district.is_public ? 'Active' : 'Inactive'}
          </span>
        </div>

        {district.tagline && (
          <p className="text-xs text-[#8a8a8a] mb-4 line-clamp-2">
            {district.tagline}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#e8e6e1]">
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-[#8a8a8a]" />
            <span className="text-sm font-medium text-[#1a1a1a]">
              {district.goals_count}
            </span>
            <span className="text-xs text-[#8a8a8a]">goals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-[#8a8a8a]" />
            <span className="text-sm font-medium text-[#1a1a1a]">
              {district.schools_count}
            </span>
            <span className="text-xs text-[#8a8a8a]">schools</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[#8a8a8a]" />
            <span className="text-sm font-medium text-[#1a1a1a]">
              {district.users_count}
            </span>
            <span className="text-xs text-[#8a8a8a]">users</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => window.open(publicUrl, '_blank')}
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

export function DistrictsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: districts = [], isLoading, error } = useDistrictsWithStats();

  const filteredDistricts = districts.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#8a8a8a] mx-auto mb-3" />
          <p className="text-sm text-[#8a8a8a]">Loading districts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">Failed to load districts</p>
          <p className="text-sm text-red-500 mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-['Playfair_Display',_Georgia,_serif] text-[28px] font-medium text-[#1a1a1a] tracking-tight">
            Districts
          </h1>
          <p className="text-sm text-[#8a8a8a] mt-1">
            {districts.length} district{districts.length !== 1 ? 's' : ''}{' '}
            registered
          </p>
        </div>
        <Link
          to="/districts/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#b85c38] hover:bg-[#a04d2d] text-white text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add District
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8a8a8a]" />
          <input
            type="text"
            placeholder="Search by name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#e8e6e1] bg-white text-sm focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] placeholder:text-[#8a8a8a]"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredDistricts.length === 0 ? (
        <div className="bg-white border border-[#e8e6e1] rounded-xl p-12 text-center">
          <div className="w-14 h-14 rounded-xl bg-[#f5f3ef] flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-7 w-7 text-[#8a8a8a]" />
          </div>
          <p className="text-sm font-medium text-[#4a4a4a] mb-1">
            {searchTerm ? 'No districts match your search' : 'No districts yet'}
          </p>
          <p className="text-xs text-[#8a8a8a]">
            {searchTerm
              ? 'Try a different search term'
              : 'Create your first district to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDistricts.map((district) => (
            <DistrictCardItem key={district.id} district={district} />
          ))}
        </div>
      )}
    </div>
  );
}
