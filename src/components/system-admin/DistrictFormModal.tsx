import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { District } from '../../lib/types';

interface DistrictFormModalProps {
  district?: District | null;
  onClose: () => void;
  onSubmit: (data: Partial<District>) => Promise<void>;
  isLoading: boolean;
}

export function DistrictFormModal({ district, onClose, onSubmit, isLoading }: DistrictFormModalProps) {
  const [formData, setFormData] = useState({
    name: district?.name || '',
    slug: district?.slug || '',
    tagline: district?.tagline || '',
    primary_color: district?.primary_color || '#C03537',
    secondary_color: district?.secondary_color || '#c9a227',
    logo_url: district?.logo_url || '',
    admin_email: district?.admin_email || '',
    is_public: district?.is_public ?? true,
  });
  const [error, setError] = useState('');

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
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
      <div className="bg-white border border-[#e8e6e1] rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#1a1a1a]">
            {district ? 'Edit District' : 'Create New District'}
          </h3>
          <button onClick={onClose} className="text-[#8a8a8a] hover:text-[#1a1a1a]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1">
              District Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Westside School District"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Slug *</label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="westside"
            />
            <p className="text-xs text-[#8a8a8a] mt-1">
              URL: https://{formData.slug || 'district'}.stratadash.org
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Tagline</label>
            <Input
              value={formData.tagline}
              onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
              placeholder="Excellence in Education"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.primary_color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, primary_color: e.target.value }))
                }
                className="w-10 h-10 rounded border border-[#e8e6e1] cursor-pointer"
              />
              <Input
                value={formData.primary_color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, primary_color: e.target.value }))
                }
                placeholder="#C03537"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Secondary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.secondary_color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, secondary_color: e.target.value }))
                }
                className="w-10 h-10 rounded border border-[#e8e6e1] cursor-pointer"
              />
              <Input
                value={formData.secondary_color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, secondary_color: e.target.value }))
                }
                placeholder="#c9a227"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Logo URL</label>
            <Input
              value={formData.logo_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, logo_url: e.target.value }))}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Admin Email</label>
            <Input
              type="email"
              value={formData.admin_email}
              onChange={(e) => setFormData((prev) => ({ ...prev, admin_email: e.target.value }))}
              placeholder="admin@district.org"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Status</label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, is_public: !prev.is_public }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.is_public ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.is_public ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="ml-3 text-sm text-[#8a8a8a]">
                {formData.is_public ? 'Active' : 'Inactive'}
              </span>
            </div>
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
              ) : district ? (
                'Save Changes'
              ) : (
                'Create District'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
