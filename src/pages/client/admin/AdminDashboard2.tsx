import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import {
  Plus,
  Minus,
  ChevronRight,
  Search,
  List,
  LayoutGrid,
  EyeOff,
  Eye,
  HelpCircle,
  MoreHorizontal,
  X,
  Play,
  CheckCircle2
} from 'lucide-react';
import type { HierarchicalGoal } from '../../../lib/types';
import { useDistrict } from '../../../hooks/useDistricts';
import { useGoals } from '../../../hooks/useGoals';

/**
 * AdminDashboard2 - Editorial-style objectives dashboard
 * Clean, focused interface for managing strategic objectives
 * Updated: Title/Description split
 */
export function AdminDashboard2() {
  const { slug } = useSubdomain();
  const { data: district } = useDistrict(slug || '');
  const { data: goals, isLoading: goalsLoading } = useGoals(district?.id || '');

  const [activeTab, setActiveTab] = useState<'all' | 'following'>('all');
  const [viewMode, setViewMode] = useState<'compact' | 'list' | 'board'>('compact');
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Goals are returned as HierarchicalGoal[] with children nested in goal.children
  // Level 0 goals are at the root level of the array
  const objectives = goals || [];

  // Toggle expand/collapse for a goal
  const toggleExpand = (goalId: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  // Recursively collect IDs of goals with children
  const collectExpandableIds = (goalList: HierarchicalGoal[], ids: Set<string>) => {
    goalList.forEach(goal => {
      if (goal.children && goal.children.length > 0) {
        ids.add(goal.id);
        collectExpandableIds(goal.children, ids);
      }
    });
  };

  // Expand all objectives and their children
  const expandAll = () => {
    const allIds = new Set<string>();
    collectExpandableIds(objectives, allIds);
    setExpandedIds(allIds);
  };

  // Collapse all
  const collapseAll = () => {
    setExpandedIds(new Set());
  };

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

        {/* Title Row with Video Link */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <h1 className="font-['Playfair_Display',_Georgia,_serif] text-[32px] font-medium text-[#1a1a1a] tracking-tight">
              All objectives
            </h1>
            <button
              onClick={() => setShowVideoModal(true)}
              className="flex items-center gap-2 text-[#6b46c1] hover:opacity-80 transition-opacity group"
              aria-label="Watch how to create an OKR video"
            >
              <span className="w-7 h-7 rounded-full bg-[#6b46c1] flex items-center justify-center group-hover:bg-[#553c9a] transition-colors">
                <Play className="h-3.5 w-3.5 text-white fill-white ml-0.5" />
              </span>
              <span className="text-sm font-medium">How to create an OKR</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/objectives/create"
              className="bg-[#b85c38] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#a04d2d] transition-colors"
            >
              Create new strategic objective
            </Link>
            <button className="w-10 h-10 rounded-lg border border-[#e8e6e1] bg-white text-[#4a4a4a] hover:bg-[#f5f3ef] transition-colors flex items-center justify-center">
              <MoreHorizontal className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowVideoModal(false)}
          />
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e6e1]">
              <h2 className="text-lg font-semibold text-[#1a1a1a]">How to create an OKR</h2>
              <button
                onClick={() => setShowVideoModal(false)}
                className="w-8 h-8 rounded-full hover:bg-[#f5f3ef] flex items-center justify-center text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors"
                aria-label="Close video"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Video Container */}
            <div className="aspect-video bg-[#1a1a1a] flex items-center justify-center">
              {/* Placeholder for video - replace with actual video embed */}
              <div className="text-center text-white/60">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <Play className="h-10 w-10 text-white/80 fill-white/80 ml-1" />
                </div>
                <p className="text-sm">Video tutorial coming soon</p>
                <p className="text-xs mt-1 text-white/40">Learn how to create effective OKRs</p>
              </div>
            </div>
            {/* Footer */}
            <div className="px-6 py-4 bg-[#fafaf8] border-t border-[#e8e6e1]">
              <div className="flex items-center gap-2 text-sm text-[#6a6a6a]">
                <CheckCircle2 className="h-4 w-4 text-[#6b8f71]" />
                <span>Watch this 2-minute guide to get started with OKRs</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white border border-[#e8e6e1] rounded-xl p-5 mb-7">
        <div className={showFilters ? 'mb-4' : ''}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-[#6b46c1] text-[13px] font-medium hover:opacity-80 transition-opacity"
          >
            {showFilters ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {showFilters ? 'Hide filters' : 'Show filters'}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-3 gap-4">
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
          <button
            onClick={expandAll}
            className="text-[#4a6fa5] ml-1.5 hover:underline"
            data-testid="expand-all-btn"
          >
            Expand all
          </button>
          {' | '}
          <button
            onClick={collapseAll}
            className="text-[#4a6fa5] hover:underline"
            data-testid="collapse-all-btn"
          >
            Collapse all
          </button>
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
            const isExpanded = expandedIds.has(objective.id);
            const hasChildGoals = objective.children && objective.children.length > 0;

            return (
              <div
                key={objective.id}
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 0.05}s` }}
                data-testid="objective-row"
              >
                {/* Main Objective Row */}
                <div className="bg-white border border-[#e8e6e1] rounded-xl px-5 py-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-4">
                    {/* Expand Button */}
                    <button
                      onClick={() => hasChildGoals && toggleExpand(objective.id)}
                      className={`w-8 h-8 rounded-lg border border-[#e8e6e1] flex items-center justify-center transition-colors flex-shrink-0 ${
                        hasChildGoals
                          ? 'text-[#8a8a8a] hover:bg-[#f5f3ef] hover:text-[#4a4a4a] cursor-pointer'
                          : 'text-[#d4d1cb] cursor-default'
                      }`}
                      disabled={!hasChildGoals}
                      data-testid="expand-btn"
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? (
                        <Minus className="h-4 w-4" />
                      ) : hasChildGoals ? (
                        <Plus className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    {/* Number Badge */}
                    <div className="w-10 h-10 rounded-full bg-[#f5f3ef] flex items-center justify-center flex-shrink-0">
                      <span className="text-[13px] font-semibold text-[#4a4a4a]">
                        {objective.goal_number || (index + 1).toFixed(1)}
                      </span>
                    </div>

                    {/* Title and Description - stacked vertically */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <Link
                        to={`/admin/objectives/${objective.id}/edit`}
                        className="text-[15px] font-bold text-[#1a1a1a] leading-snug hover:text-[#b85c38] hover:underline transition-colors"
                        data-testid="objective-title"
                      >
                        {objective.title?.split(':')[0]?.trim() || objective.title}
                      </Link>
                      {(objective.description || objective.title?.includes(':')) && (
                        <p className="text-[13px] text-[#6a6a6a] leading-relaxed line-clamp-2" data-testid="objective-description">
                          {objective.description || objective.title?.split(':').slice(1).join(':').trim()}
                        </p>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 border border-[#e8e6e1] rounded-md flex-shrink-0">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: objective.indicator_color || '#6b8f71' }}
                      ></span>
                      <span className="text-[12px] font-semibold text-[#4a4a4a] uppercase tracking-wider">
                        {objective.indicator_text || 'On Target'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Children (Level 1 Goals) */}
                {isExpanded && hasChildGoals && (
                  <div className="ml-12 mt-2 flex flex-col gap-2" data-testid="children-container">
                    {objective.children?.map((child: HierarchicalGoal) => {
                      const isChildExpanded = expandedIds.has(child.id);
                      const hasGrandchildren = child.children && child.children.length > 0;

                      return (
                        <div key={child.id} data-testid="child-goal-row">
                          {/* Level 1 Goal Row */}
                          <div className="bg-[#fafaf8] border border-[#e8e6e1] rounded-lg px-4 py-3 hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-3">
                              {/* Expand Button for Level 1 */}
                              <button
                                onClick={() => hasGrandchildren && toggleExpand(child.id)}
                                className={`w-7 h-7 rounded-md border border-[#e8e6e1] flex items-center justify-center transition-colors flex-shrink-0 ${
                                  hasGrandchildren
                                    ? 'text-[#8a8a8a] hover:bg-[#f5f3ef] hover:text-[#4a4a4a] cursor-pointer'
                                    : 'text-[#d4d1cb] cursor-default'
                                }`}
                                disabled={!hasGrandchildren}
                                data-testid="child-expand-btn"
                                aria-expanded={isChildExpanded}
                              >
                                {isChildExpanded ? (
                                  <Minus className="h-3.5 w-3.5" />
                                ) : hasGrandchildren ? (
                                  <Plus className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5" />
                                )}
                              </button>

                              {/* Number Badge */}
                              <div className="w-8 h-8 rounded-full bg-[#e8e6e1] flex items-center justify-center flex-shrink-0">
                                <span className="text-[12px] font-semibold text-[#4a4a4a]">
                                  {child.goal_number}
                                </span>
                              </div>

                              {/* Title and Description */}
                              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                <Link
                                  to={`/admin/objectives/${child.id}/edit`}
                                  className="text-[14px] font-semibold text-[#1a1a1a] leading-snug hover:text-[#b85c38] hover:underline transition-colors"
                                  data-testid="child-goal-title"
                                >
                                  {child.title?.split(':')[0]?.trim() || child.title}
                                </Link>
                                {(child.description || child.title?.includes(':')) && (
                                  <p className="text-[12px] text-[#6a6a6a] truncate" data-testid="child-goal-description">
                                    {child.description || child.title?.split(':').slice(1).join(':').trim()}
                                  </p>
                                )}
                              </div>

                              {/* Status Badge */}
                              <div className="flex items-center gap-1.5 px-2 py-1 border border-[#e8e6e1] rounded flex-shrink-0">
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: child.indicator_color || '#6b8f71' }}
                                ></span>
                                <span className="text-[11px] font-semibold text-[#4a4a4a] uppercase tracking-wider">
                                  {child.indicator_text || 'On Target'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Grandchildren (Level 2 Sub-goals) */}
                          {isChildExpanded && hasGrandchildren && (
                            <div className="ml-10 mt-1.5 flex flex-col gap-1.5" data-testid="grandchildren-container">
                              {child.children?.map((grandchild: HierarchicalGoal) => (
                                <div
                                  key={grandchild.id}
                                  className="bg-[#fafaf8] border border-[#e8e6e1] rounded-lg px-4 py-3 hover:shadow-sm transition-shadow"
                                  data-testid="grandchild-goal-row"
                                >
                                  <div className="flex items-center gap-3">
                                    {/* Chevron - indicates no children (leaf node) */}
                                    <div className="w-7 h-7 rounded-md border border-[#e8e6e1] flex items-center justify-center text-[#d4d1cb] flex-shrink-0">
                                      <ChevronRight className="h-3.5 w-3.5" />
                                    </div>

                                    {/* Number Badge */}
                                    <div className="w-8 h-8 rounded-full bg-[#e8e6e1] flex items-center justify-center flex-shrink-0">
                                      <span className="text-[12px] font-semibold text-[#4a4a4a]">
                                        {grandchild.goal_number}
                                      </span>
                                    </div>

                                    {/* Title and Description */}
                                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                      <Link
                                        to={`/admin/objectives/${grandchild.id}/edit`}
                                        className="text-[14px] font-semibold text-[#1a1a1a] leading-snug hover:text-[#b85c38] hover:underline transition-colors"
                                        data-testid="grandchild-goal-title"
                                      >
                                        {grandchild.title?.split(':')[0]?.trim() || grandchild.title}
                                      </Link>
                                      {(grandchild.description || grandchild.title?.includes(':')) && (
                                        <p className="text-[12px] text-[#6a6a6a] truncate">
                                          {grandchild.description || grandchild.title?.split(':').slice(1).join(':').trim()}
                                        </p>
                                      )}
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex items-center gap-1.5 px-2 py-1 border border-[#e8e6e1] rounded flex-shrink-0">
                                      <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: grandchild.indicator_color || '#6b8f71' }}
                                      ></span>
                                      <span className="text-[11px] font-semibold text-[#4a4a4a] uppercase tracking-wider">
                                        {grandchild.indicator_text || 'On Target'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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
