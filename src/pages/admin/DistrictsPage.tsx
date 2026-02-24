import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Building2,
  Target,
  GraduationCap,
  Users,
  Loader2,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useDistrictsWithStats } from '../../hooks/useSystemAdminStats';
import { useUpdateDistrict, useDeleteDistrict } from '../../hooks/useDistricts';
import { useQueryClient } from '@tanstack/react-query';
import { buildSubdomainUrlWithPath } from '../../lib/subdomain';
import { DistrictFormModal } from '../../components/admin/DistrictFormModal';
import { DistrictActionsMenu } from '../../components/admin/DistrictActionsMenu';
import type { DistrictWithStats } from '../../lib/services/systemAdmin.service';
import type { District } from '../../lib/types';

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1 month ago';
  if (diffMonths < 12) return `${diffMonths} months ago`;
  const diffYears = Math.floor(diffMonths / 12);
  if (diffYears === 1) return '1 year ago';
  return `${diffYears} years ago`;
}

type SortField = 'name' | 'status' | 'created_at';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'inactive';
const PAGE_SIZE = 25;

export function DistrictsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingDistrict, setEditingDistrict] = useState<DistrictWithStats | null>(null);
  const [deletingDistrict, setDeletingDistrict] = useState<DistrictWithStats | null>(null);
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: districts = [], isLoading, error } = useDistrictsWithStats();
  const updateDistrict = useUpdateDistrict();
  const deleteDistrict = useDeleteDistrict();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    const result = districts.filter((d) => {
      const matchesSearch =
        !searchTerm ||
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && d.is_public) ||
        (statusFilter === 'inactive' && !d.is_public);
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortField === 'status') return (Number(a.is_public) - Number(b.is_public)) * dir;
      if (sortField === 'created_at')
        return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      return 0;
    });

    return result;
  }, [districts, searchTerm, statusFilter, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const handleEditSubmit = async (data: Partial<District>) => {
    if (!editingDistrict) return;
    await updateDistrict.mutateAsync({ id: editingDistrict.id, updates: data });
    queryClient.invalidateQueries({ queryKey: ['system-admin', 'districts-with-stats'] });
    setEditingDistrict(null);
  };

  const handleDelete = async () => {
    if (!deletingDistrict) return;
    await deleteDistrict.mutateAsync(deletingDistrict.id);
    queryClient.invalidateQueries({ queryKey: ['system-admin', 'districts-with-stats'] });
    setDeletingDistrict(null);
    setDeleteConfirmSlug('');
  };

  const handleRowClick = (district: DistrictWithStats) => {
    const adminUrl = buildSubdomainUrlWithPath('district', '/admin', district.slug);
    window.location.href = adminUrl;
  };

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-3.5 w-3.5 inline ml-1" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 inline ml-1" />
    );
  };

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
        <div className="flex items-center gap-3">
          <h1 className="font-['Playfair_Display',_Georgia,_serif] text-[28px] font-medium text-[#1a1a1a] tracking-tight">
            Districts
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f5f3ef] text-[#4a4a4a] border border-[#e8e6e1]">
            {districts.length}
          </span>
        </div>
        <Link
          to="/districts/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#b85c38] hover:bg-[#a04d2d] text-white text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add District
        </Link>
      </div>

      {/* Toolbar: Search + Status Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8a8a8a]" />
          <input
            type="text"
            placeholder="Search by name or slug..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#e8e6e1] bg-white text-sm focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] placeholder:text-[#8a8a8a]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as StatusFilter);
            setCurrentPage(1);
          }}
          className="px-3 py-2.5 rounded-lg border border-[#e8e6e1] bg-white text-sm text-[#4a4a4a] focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#e8e6e1] rounded-xl p-12 text-center">
          <div className="w-14 h-14 rounded-xl bg-[#f5f3ef] flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-7 w-7 text-[#8a8a8a]" />
          </div>
          <p className="text-sm font-medium text-[#4a4a4a] mb-1">
            {searchTerm || statusFilter !== 'all'
              ? 'No districts match your filters'
              : 'No districts yet'}
          </p>
          <p className="text-xs text-[#8a8a8a]">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Create your first district to get started'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#e8e6e1] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e8e6e1] bg-[#faf9f7]">
                <th
                  className="text-left text-xs font-semibold text-[#4a4a4a] uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-[#1a1a1a] select-none"
                  onClick={() => handleSort('name')}
                >
                  District
                  <SortIndicator field="name" />
                </th>
                <th
                  className="text-left text-xs font-semibold text-[#4a4a4a] uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-[#1a1a1a] select-none"
                  onClick={() => handleSort('status')}
                >
                  Status
                  <SortIndicator field="status" />
                </th>
                <th className="text-left text-xs font-semibold text-[#4a4a4a] uppercase tracking-wider px-4 py-3">
                  Stats
                </th>
                <th
                  className="text-left text-xs font-semibold text-[#4a4a4a] uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-[#1a1a1a] select-none"
                  onClick={() => handleSort('created_at')}
                >
                  Created
                  <SortIndicator field="created_at" />
                </th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {paginated.map((district) => (
                <tr
                  key={district.id}
                  onClick={() => handleRowClick(district)}
                  className="border-b border-[#e8e6e1] last:border-b-0 hover:bg-[#f5f3ef] transition-colors cursor-pointer"
                >
                  {/* District column */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-[3px] h-10 rounded-full flex-shrink-0"
                        style={{ backgroundColor: district.primary_color || '#c9a227' }}
                      />
                      {district.logo_url ? (
                        <img
                          src={district.logo_url}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: district.primary_color || '#c9a227' }}
                        >
                          {district.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#1a1a1a] truncate">
                          {district.name}
                        </div>
                        <code className="text-xs text-[#8a8a8a]">{district.slug}</code>
                      </div>
                    </div>
                  </td>
                  {/* Status column */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        district.is_public
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {district.is_public ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {/* Stats column */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4 text-xs text-[#4a4a4a]">
                      <span className="flex items-center gap-1">
                        <Target className="h-3.5 w-3.5 text-[#8a8a8a]" />
                        {district.goals_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5 text-[#8a8a8a]" />
                        {district.schools_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-[#8a8a8a]" />
                        {district.users_count}
                      </span>
                    </div>
                  </td>
                  {/* Created column */}
                  <td className="px-4 py-3 text-sm text-[#4a4a4a]">
                    {formatRelativeDate(district.created_at)}
                  </td>
                  {/* Actions column */}
                  <td
                    className="px-4 py-3 relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      aria-label="Actions"
                      onClick={() =>
                        setActiveMenu(activeMenu === district.id ? null : district.id)
                      }
                      className="w-8 h-8 rounded-lg hover:bg-[#e8e6e1] text-[#8a8a8a] hover:text-[#4a4a4a] flex items-center justify-center transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    <DistrictActionsMenu
                      district={district as unknown as District}
                      isOpen={activeMenu === district.id}
                      onClose={() => setActiveMenu(null)}
                      onEdit={() => {
                        setEditingDistrict(district);
                        setActiveMenu(null);
                      }}
                      onDelete={() => {
                        setDeletingDistrict(district);
                        setActiveMenu(null);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#e8e6e1] bg-[#faf9f7]">
              <p className="text-xs text-[#8a8a8a]">
                Showing {rangeStart}&ndash;{rangeEnd} of {filtered.length} districts
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded hover:bg-[#e8e6e1] disabled:opacity-40 disabled:cursor-not-allowed text-[#4a4a4a]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[28px] h-7 rounded text-xs font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-[#b85c38] text-white'
                        : 'hover:bg-[#e8e6e1] text-[#4a4a4a]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded hover:bg-[#e8e6e1] disabled:opacity-40 disabled:cursor-not-allowed text-[#4a4a4a]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingDistrict && (
        <DistrictFormModal
          district={editingDistrict as unknown as District}
          onClose={() => setEditingDistrict(null)}
          onSubmit={handleEditSubmit}
          isLoading={updateDistrict.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingDistrict && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border border-[#e8e6e1] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-3">Delete District</h3>
            <p className="text-sm text-[#4a4a4a] mb-4">
              This will permanently delete{' '}
              <strong>{deletingDistrict.name}</strong> and all associated data
              including goals, metrics, and team members.
            </p>
            <div className="mb-4">
              <label className="block text-sm text-[#4a4a4a] mb-1">
                Type <strong>{deletingDistrict.slug}</strong> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmSlug}
                onChange={(e) => setDeleteConfirmSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#e8e6e1] text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                placeholder={deletingDistrict.slug}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setDeletingDistrict(null);
                  setDeleteConfirmSlug('');
                }}
                className="px-4 py-2 rounded-lg border border-[#e8e6e1] text-sm text-[#4a4a4a] hover:bg-[#f5f3ef] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={
                  deleteConfirmSlug !== deletingDistrict.slug || deleteDistrict.isPending
                }
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {deleteDistrict.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  'Delete District'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
