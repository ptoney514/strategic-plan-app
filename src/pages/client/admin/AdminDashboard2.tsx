import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Plus,
  Search,
  List,
  LayoutGrid,
  Filter,
  HelpCircle,
  MoreHorizontal,
  X
} from 'lucide-react';
import { useDistrict } from '../../../hooks/useDistricts';
import { useGoals } from '../../../hooks/useGoals';

/**
 * AdminDashboard2 - Editorial-style objectives dashboard
 * Clean, focused interface for managing strategic objectives
 * Updated: Title/Description split
 */
export function AdminDashboard2() {
  const { slug } = useParams();
  const { data: district } = useDistrict(slug!);
  const { data: goals, isLoading: goalsLoading } = useGoals(district?.id || '');

  const [activeTab, setActiveTab] = useState<'all' | 'following'>('all');
  const [viewMode, setViewMode] = useState<'compact' | 'list' | 'board'>('compact');
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'mine'>('all');

  // Get strategic objectives (level 0 goals)
  const objectives = goals?.filter(g => g.level === 0) || [];

  // Status counts (mock for now)
  const statusCounts = {
    onTrack: objectives.length,
    noStatus: 0
  };

  return (
    <div className="px-10 py-8 max-w-[1100px]">
      {/* Page Header */}
      <div className="mb-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-[#f5f3ef] text-[#1a1a1a]'
                : 'text-[#8a8a8a] hover:bg-[#f5f3ef] hover:text-[#4a4a4a]'
            }`}
          >
            All objectives
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'following'
                ? 'bg-[#f5f3ef] text-[#1a1a1a]'
                : 'text-[#8a8a8a] hover:bg-[#f5f3ef] hover:text-[#4a4a4a]'
            }`}
          >
            Objectives I follow
          </button>
        </div>

        {/* Title Row */}
        <div className="flex items-start justify-between mb-5">
          <h1 className="font-['Playfair_Display',_Georgia,_serif] text-[32px] font-medium text-[#1a1a1a] tracking-tight">
            All objectives
          </h1>
          <a
            href="#"
            className="flex items-center gap-1.5 text-[#b85c38] text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            How to create an OKR
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to={`/${slug}/admin/objectives/new`}
            className="bg-[#b85c38] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#a04d2d] transition-colors"
          >
            Create a new objective
          </Link>
          <button className="w-10 h-10 rounded-lg border border-[#e8e6e1] bg-white text-[#4a4a4a] hover:bg-[#f5f3ef] transition-colors flex items-center justify-center">
            <MoreHorizontal className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border border-[#e8e6e1] rounded-xl p-5 mb-7">
        <div className="flex items-center gap-5 mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 text-[#b85c38] text-[13px] font-medium"
          >
            <Filter className="h-3.5 w-3.5" />
            {showFilters ? 'Hide filters' : 'Show filters'}
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] text-[#8a8a8a] mr-1">Quick filters:</span>
            <button
              onClick={() => setQuickFilter('all')}
              className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                quickFilter === 'all'
                  ? 'bg-[#f5f3ef] text-[#1a1a1a]'
                  : 'text-[#4a4a4a] hover:bg-[#f5f3ef]'
              }`}
            >
              District-wide
            </button>
            <button
              onClick={() => setQuickFilter('mine')}
              className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                quickFilter === 'mine'
                  ? 'bg-[#f5f3ef] text-[#1a1a1a]'
                  : 'text-[#4a4a4a] hover:bg-[#f5f3ef]'
              }`}
            >
              My objectives
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">
                Objective Owners
              </label>
              <select className="px-3 py-2.5 text-[13px] border border-[#e8e6e1] rounded-lg bg-white text-[#4a4a4a] appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%238a8a8a%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_10px_center] pr-8 focus:outline-none focus:border-[#c9a227]">
                <option>Search for a person or group</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">
                Objective Type
              </label>
              <select className="px-3 py-2.5 text-[13px] border border-[#e8e6e1] rounded-lg bg-white text-[#4a4a4a] appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%238a8a8a%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_10px_center] pr-8 focus:outline-none focus:border-[#c9a227]">
                <option>Search for an objective type</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">
                Objective Status
              </label>
              <select className="px-3 py-2.5 text-[13px] border border-[#e8e6e1] rounded-lg bg-white text-[#4a4a4a] appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%238a8a8a%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_10px_center] pr-8 focus:outline-none focus:border-[#c9a227]">
                <option>Select a status</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">
                Objective State (1)
              </label>
              <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#f5f3ef] rounded-md text-[13px] text-[#1a1a1a]">
                Current
                <button className="text-[#8a8a8a] hover:text-[#b85c38] transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Objectives Summary */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#e8e6e1]">
        <div className="flex items-center gap-4">
          <h2 className="font-['Playfair_Display',_Georgia,_serif] text-lg font-medium italic text-[#1a1a1a] flex items-center gap-2">
            Objectives summary
            <span className="not-italic bg-[#f5f3ef] px-2.5 py-0.5 rounded-full font-['Source_Sans_3'] text-[13px] font-semibold">
              {objectives.length}
            </span>
            <HelpCircle className="h-4 w-4 text-[#8a8a8a] cursor-help" />
          </h2>
          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-1.5 text-[13px] text-[#4a4a4a]">
              <span className="w-2 h-2 rounded-full bg-[#6b8f71]"></span>
              {statusCounts.onTrack} on track
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-[#4a4a4a]">
              <span className="w-2 h-2 rounded-full bg-[#8a8a8a]"></span>
              {statusCounts.noStatus} no status
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search */}
          <div className="relative w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8a8a8a]" />
            <input
              type="text"
              placeholder="Search for a keyword"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-[13px] border border-[#e8e6e1] rounded-lg bg-white focus:outline-none focus:border-[#c9a227]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-[#e8e6e1] flex items-center justify-center text-[#8a8a8a] text-xs hover:bg-[#d4d1cb]"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* View Toggles */}
          <div className="flex border border-[#e8e6e1] rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('compact')}
              className={`w-9 h-9 flex items-center justify-center transition-colors ${
                viewMode === 'compact'
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-white text-[#8a8a8a] hover:bg-[#f5f3ef]'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-9 h-9 flex items-center justify-center border-l border-[#e8e6e1] transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-white text-[#8a8a8a] hover:bg-[#f5f3ef]'
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`w-9 h-9 flex items-center justify-center border-l border-[#e8e6e1] transition-colors ${
                viewMode === 'board'
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-white text-[#8a8a8a] hover:bg-[#f5f3ef]'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* List Controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13px] text-[#8a8a8a]">
          Showing {objectives.length} of {objectives.length} objectives
          <button className="text-[#4a6fa5] ml-1.5 hover:underline">Expand all</button>
          {' | '}
          <button className="text-[#4a6fa5] hover:underline">Collapse all</button>
        </div>
        <div className="text-[13px] text-[#8a8a8a]">
          Sort by{' '}
          <select className="border-none bg-transparent text-[13px] font-semibold text-[#b85c38] cursor-pointer">
            <option>A-Z</option>
            <option>Z-A</option>
            <option>Progress</option>
            <option>Due date</option>
          </select>
        </div>
      </div>

      {/* Objectives List */}
      <div className="flex flex-col gap-3">
        {goalsLoading ? (
          <div className="bg-white border border-[#e8e6e1] rounded-xl p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9a227] mx-auto"></div>
            <p className="mt-3 text-[#8a8a8a]">Loading objectives...</p>
          </div>
        ) : objectives.length === 0 ? (
          <div className="bg-white border border-[#e8e6e1] rounded-xl p-8 text-center">
            <div className="w-12 h-12 bg-[#f5f3ef] rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-6 w-6 text-[#8a8a8a]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">No objectives yet</h3>
            <p className="text-[#8a8a8a] mb-4">Create your first strategic objective to get started.</p>
            <Link
              to={`/${slug}/admin/objectives/new`}
              className="inline-flex items-center gap-2 bg-[#b85c38] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#a04d2d] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create objective
            </Link>
          </div>
        ) : (
          objectives.map((objective, index) => {
            return (
              <div
                key={objective.id}
                className="bg-white border border-[#e8e6e1] rounded-xl px-5 py-4 hover:shadow-sm transition-shadow animate-fadeInUp"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  {/* Expand Button */}
                  <button className="w-8 h-8 rounded-lg border border-[#e8e6e1] flex items-center justify-center text-[#8a8a8a] hover:bg-[#f5f3ef] hover:text-[#4a4a4a] transition-colors flex-shrink-0">
                    <Plus className="h-4 w-4" />
                  </button>

                  {/* Number Badge */}
                  <div className="w-10 h-10 rounded-full bg-[#f5f3ef] flex items-center justify-center flex-shrink-0">
                    <span className="text-[13px] font-semibold text-[#4a4a4a]">
                      {(index + 1).toFixed(1)}
                    </span>
                  </div>

                  {/* Title and Description */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <h3 className="text-[15px] font-bold text-[#1a1a1a] leading-snug">
                      {objective.name?.split(':')[0] || objective.name}
                    </h3>
                    {(objective.description || objective.name?.includes(':')) && (
                      <p className="text-[13px] text-[#6a6a6a] mt-0.5 truncate">
                        {objective.description || objective.name?.split(':').slice(1).join(':').trim()}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 px-3 py-1.5 border border-[#e8e6e1] rounded-md flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#6b8f71]"></span>
                    <span className="text-[12px] font-semibold text-[#4a4a4a] uppercase tracking-wider">
                      On Target
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add CSS for animation */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
