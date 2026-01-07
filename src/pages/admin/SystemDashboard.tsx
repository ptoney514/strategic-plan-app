import { useState } from 'react';
import { Building2, Plus, Eye, Search, Users, Target, BarChart3, Loader2, X, Shield, MoreHorizontal, LayoutGrid, Grid as GridIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useDistricts, useCreateDistrict, useDeleteDistrict, useUpdateDistrict } from '../../hooks/useDistricts';
import { buildSubdomainUrlWithPath } from '../../lib/subdomain';
import type { District } from '../../lib/types';
import { DistrictActionsMenu } from '../../components/admin/DistrictActionsMenu';

/**
 * SystemDashboard - Main system administrator dashboard
 * Displays all districts and allows system-level management
 */
export function SystemDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('grid');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Fetch real data
  const { data: districts = [], isLoading, error } = useDistricts();
  const createDistrict = useCreateDistrict();
  const updateDistrict = useUpdateDistrict();
  const deleteDistrict = useDeleteDistrict();

  const filteredDistricts = districts.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalGoals = districts.reduce((sum, d) => sum + (d.goals_count || 0), 0);
  const totalMetrics = districts.reduce((sum, d) => sum + (d.metrics_count || 0), 0);

  const handleDelete = async (id: string) => {
    try {
      await deleteDistrict.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete district:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading districts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
        <p className="text-destructive font-medium">Failed to load districts</p>
        <p className="text-sm text-destructive/80 mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="px-10 py-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c9a227] flex items-center justify-center">
              <Shield className="h-5 w-5 text-[#1a1a1a]" />
            </div>
            <div>
              <h1 className="font-['Playfair_Display',_Georgia,_serif] text-[32px] font-medium text-[#1a1a1a] tracking-tight">
                System Administration
              </h1>
              <p className="text-sm text-[#8a8a8a]">Manage all districts and system-wide settings</p>
            </div>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="bg-[#b85c38] hover:bg-[#a04d2d] text-white">
            <Plus className="h-4 w-4 mr-2" />
            New District
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div data-testid="stats-card" className="bg-white border border-[#e8e6e1] rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#8a8a8a] uppercase tracking-wide mb-2">
                Total Districts
              </p>
              <p className="text-3xl font-['Playfair_Display',_Georgia,_serif] font-medium text-[#1a1a1a]">
                {districts.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#f5f3ef] flex items-center justify-center">
              <Building2 className="h-6 w-6 text-[#b85c38]" />
            </div>
          </div>
        </div>

        <div data-testid="stats-card" className="bg-white border border-[#e8e6e1] rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#8a8a8a] uppercase tracking-wide mb-2">
                Total Goals
              </p>
              <p className="text-3xl font-['Playfair_Display',_Georgia,_serif] font-medium text-[#1a1a1a]">
                {totalGoals}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div data-testid="stats-card" className="bg-white border border-[#e8e6e1] rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#8a8a8a] uppercase tracking-wide mb-2">
                Total Metrics
              </p>
              <p className="text-3xl font-['Playfair_Display',_Georgia,_serif] font-medium text-[#1a1a1a]">
                {totalMetrics}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div data-testid="stats-card" className="bg-white border border-[#e8e6e1] rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#8a8a8a] uppercase tracking-wide mb-2">
                District Admins
              </p>
              <p className="text-3xl font-['Playfair_Display',_Georgia,_serif] font-medium text-[#1a1a1a]">
                {districts.reduce((sum, d) => sum + (d.admins_count || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* View Controls */}
      <div className="bg-white border border-[#e8e6e1] rounded-xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="font-['Playfair_Display',_Georgia,_serif] text-xl font-medium text-[#1a1a1a]">
            Districts
          </h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8a8a8a]" />
              <Input
                type="text"
                placeholder="Search districts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64 border-[#e8e6e1] focus:border-[#c9a227]"
              />
            </div>
            {/* View mode toggle - Cards vs Grid only */}
            <div className="flex border border-[#e8e6e1] rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => setViewMode('card')}
                aria-label="Card view"
                className={`px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${
                  viewMode === 'card'
                    ? 'bg-[#1a1a1a] text-white'
                    : 'bg-white text-[#8a8a8a] hover:bg-[#f5f3ef]'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`px-4 py-2 flex items-center gap-2 text-sm font-medium border-l border-[#e8e6e1] transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#1a1a1a] text-white'
                    : 'bg-white text-[#8a8a8a] hover:bg-[#f5f3ef]'
                }`}
              >
                <GridIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDistricts.length === 0 ? (
            <div className="col-span-2 bg-white border border-[#e8e6e1] rounded-xl p-8 text-center text-[#8a8a8a]">
              {searchTerm ? 'No districts match your search' : 'No districts yet. Create your first district!'}
            </div>
          ) : (
            filteredDistricts.map((district) => (
              <div
                key={district.id}
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
                        {/* Status Badge */}
                        <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                          district.is_public
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {district.is_public ? 'Public' : 'Private'}
                        </span>
                      </div>
                      {district.tagline && (
                        <p className="text-xs text-[#8a8a8a] truncate">{district.tagline}</p>
                      )}
                    </div>
                  </div>
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setActionMenuOpen(actionMenuOpen === district.id ? null : district.id)}
                      className="w-8 h-8 rounded-lg hover:bg-[#f5f3ef] text-[#8a8a8a] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {actionMenuOpen === district.id && (
                      <DistrictActionsMenu
                        district={district}
                        isOpen={true}
                        onClose={() => setActionMenuOpen(null)}
                        onEdit={() => {
                          setEditingDistrict(district);
                          setActionMenuOpen(null);
                        }}
                        onDelete={() => {
                          setDeleteConfirm(district.id);
                          setActionMenuOpen(null);
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#e8e6e1]">
                  <div>
                    <p className="text-2xl font-['Playfair_Display',_Georgia,_serif] font-medium text-[#1a1a1a]">
                      {district.goals_count || 0}
                    </p>
                    <p className="text-xs text-[#8a8a8a]">Goals</p>
                  </div>
                  <div>
                    <p className="text-2xl font-['Playfair_Display',_Georgia,_serif] font-medium text-[#1a1a1a]">
                      {district.metrics_count || 0}
                    </p>
                    <p className="text-xs text-[#8a8a8a]">Metrics</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <code className="text-xs text-[#8a8a8a] bg-[#f5f3ef] px-2.5 py-1 rounded">
                    {district.slug}
                  </code>
                  <button
                    onClick={() => {
                      const publicUrl = buildSubdomainUrlWithPath('district', '', district.slug);
                      window.open(publicUrl, '_blank');
                    }}
                    className="text-xs font-medium text-[#b85c38] hover:underline flex items-center gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View public site
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDistricts.length === 0 ? (
            <div className="col-span-full bg-white border border-[#e8e6e1] rounded-xl p-8 text-center text-[#8a8a8a]">
              {searchTerm ? 'No districts match your search' : 'No districts yet. Create your first district!'}
            </div>
          ) : (
            filteredDistricts.map((district) => (
              <div
                key={district.id}
                data-testid="district-grid-item"
                className="bg-white border border-[#e8e6e1] rounded-xl p-4 hover:shadow-lg transition-all text-center group relative"
              >
                {/* Action Button */}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => setActionMenuOpen(actionMenuOpen === district.id ? null : district.id)}
                    className="w-7 h-7 rounded-lg hover:bg-[#f5f3ef] text-[#8a8a8a] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                  {actionMenuOpen === district.id && (
                    <DistrictActionsMenu
                      district={district}
                      isOpen={true}
                      onClose={() => setActionMenuOpen(null)}
                      onEdit={() => {
                        setEditingDistrict(district);
                        setActionMenuOpen(null);
                      }}
                      onDelete={() => {
                        setDeleteConfirm(district.id);
                        setActionMenuOpen(null);
                      }}
                    />
                  )}
                </div>

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
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    district.is_public
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {district.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
                {district.tagline && (
                  <p className="text-xs text-[#8a8a8a] mb-3 truncate px-2">{district.tagline}</p>
                )}

                {/* Stats - Inline */}
                <div className="flex items-center justify-center gap-3 mb-3 pb-3 border-b border-[#e8e6e1]">
                  <div>
                    <p className="text-lg font-['Playfair_Display',_Georgia,_serif] font-medium text-[#1a1a1a]">
                      {district.goals_count || 0}
                    </p>
                    <p className="text-[10px] text-[#8a8a8a]">Goals</p>
                  </div>
                  <div className="w-px h-8 bg-[#e8e6e1]" />
                  <div>
                    <p className="text-lg font-['Playfair_Display',_Georgia,_serif] font-medium text-[#1a1a1a]">
                      {district.metrics_count || 0}
                    </p>
                    <p className="text-[10px] text-[#8a8a8a]">Metrics</p>
                  </div>
                </div>

                {/* Slug */}
                <code className="text-xs text-[#8a8a8a] bg-[#f5f3ef] px-2 py-0.5 rounded">
                  {district.slug}
                </code>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create District Modal */}
      {showCreateForm && (
        <DistrictFormModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={async (data) => {
            await createDistrict.mutateAsync(data);
            setShowCreateForm(false);
          }}
          isLoading={createDistrict.isPending}
        />
      )}

      {/* Edit District Modal */}
      {editingDistrict && (
        <DistrictFormModal
          district={editingDistrict}
          onClose={() => setEditingDistrict(null)}
          onSubmit={async (data) => {
            await updateDistrict.mutateAsync({ id: editingDistrict.id, updates: data });
            setEditingDistrict(null);
          }}
          isLoading={updateDistrict.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete District?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This will permanently delete the district and all associated data. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteDistrict.isPending}
              >
                {deleteDistrict.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete District'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface DistrictFormModalProps {
  district?: District;
  onClose: () => void;
  onSubmit: (data: Partial<District>) => Promise<void>;
  isLoading: boolean;
}

function DistrictFormModal({ district, onClose, onSubmit, isLoading }: DistrictFormModalProps) {
  const [formData, setFormData] = useState({
    name: district?.name || '',
    slug: district?.slug || '',
    tagline: district?.tagline || '',
    primary_color: district?.primary_color || '#C03537',
    logo_url: district?.logo_url || '',
  });
  const [error, setError] = useState('');

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      // Auto-generate slug only for new districts
      slug: district ? prev.slug : generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('District name is required');
      return;
    }

    if (!formData.slug.trim()) {
      setError('Slug is required');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save district');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            {district ? 'Edit District' : 'Create New District'}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              District Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Westside School District"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Slug *
            </label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="westside"
            />
            <p className="text-xs text-muted-foreground mt-1">
              URL: {formData.slug || 'district'}.stratadash.org
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Tagline
            </label>
            <Input
              value={formData.tagline}
              onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
              placeholder="Excellence in Education"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.primary_color}
                onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                className="w-10 h-10 rounded border border-border cursor-pointer"
              />
              <Input
                value={formData.primary_color}
                onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                placeholder="#C03537"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Logo URL
            </label>
            <Input
              value={formData.logo_url}
              onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                district ? 'Save Changes' : 'Create District'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
