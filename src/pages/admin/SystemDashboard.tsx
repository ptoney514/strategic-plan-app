import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Eye, Settings, Trash2, Search, Users, Target, BarChart3, Loader2, X, Edit2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useDistricts, useCreateDistrict, useDeleteDistrict, useUpdateDistrict } from '../../hooks/useDistricts';
import type { District } from '../../lib/types';

/**
 * SystemDashboard - Main system administrator dashboard
 * Displays all districts and allows system-level management
 */
export function SystemDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">System Administration</h1>
        <p className="text-muted-foreground mt-2">
          Manage all districts and system-wide settings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Districts</p>
              <p className="text-3xl font-bold text-foreground mt-1">{districts.length}</p>
            </div>
            <Building2 className="h-12 w-12 text-primary opacity-50" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Goals</p>
              <p className="text-3xl font-bold text-foreground mt-1">{totalGoals}</p>
            </div>
            <Target className="h-12 w-12 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Metrics</p>
              <p className="text-3xl font-bold text-foreground mt-1">{totalMetrics}</p>
            </div>
            <BarChart3 className="h-12 w-12 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">District Admins</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {districts.reduce((sum, d) => sum + (d.admins_count || 0), 0)}
              </p>
            </div>
            <Users className="h-12 w-12 text-amber-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Districts Management */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-foreground">Districts</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search districts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New District
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  District
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Goals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Metrics
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDistricts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    {searchTerm ? 'No districts match your search' : 'No districts yet. Create your first district!'}
                  </td>
                </tr>
              ) : (
                filteredDistricts.map((district) => (
                  <tr key={district.id} className="hover:bg-muted/20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {district.logo_url ? (
                          <img src={district.logo_url} alt="" className="w-8 h-8 rounded object-cover" />
                        ) : (
                          <div
                            className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: district.primary_color || '#C03537' }}
                          >
                            {district.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-foreground">{district.name}</div>
                          {district.tagline && (
                            <div className="text-xs text-muted-foreground">{district.tagline}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">{district.slug}</code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-foreground">{district.goals_count || 0}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-foreground">{district.metrics_count || 0}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://${district.slug}.stratadash.org`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingDistrict(district)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/${district.slug}/admin`)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirm(district.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
