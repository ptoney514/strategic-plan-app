import { useState } from 'react';
import { X, Building2, Loader2 } from 'lucide-react';
import { useCreateSchool } from '../../../hooks/useSchools';

interface AddSchoolModalProps {
  districtId: string;
  districtSlug: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type SchoolType = 'elementary' | 'middle' | 'high' | 'k-8' | 'k-12' | 'other';

/**
 * Modal for creating a new school in the district
 */
export function AddSchoolModal({
  districtId,
  districtSlug,
  isOpen,
  onClose,
  onSuccess,
}: AddSchoolModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [schoolType, setSchoolType] = useState<SchoolType>('elementary');
  const [error, setError] = useState<string | null>(null);

  const createSchool = useCreateSchool();

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    // Generate slug from name if user hasn't manually edited it
    const autoSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    setSlug(autoSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('School name is required');
      return;
    }

    if (!slug.trim()) {
      setError('School slug is required');
      return;
    }

    try {
      await createSchool.mutateAsync({
        district_id: districtId,
        name: name.trim(),
        slug: slug.trim(),
        description: `${schoolType.charAt(0).toUpperCase() + schoolType.slice(1)} School`,
        is_public: false,
      });

      // Reset form
      setName('');
      setSlug('');
      setSchoolType('elementary');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create school');
    }
  };

  const handleClose = () => {
    if (!createSchool.isPending) {
      setError(null);
      setName('');
      setSlug('');
      setSchoolType('elementary');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Building2 className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Add School</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={createSchool.isPending}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* School Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              School Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Washington Elementary"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              disabled={createSchool.isPending}
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              URL Slug *
            </label>
            <div className="flex items-center">
              <span className="text-sm text-slate-500 pr-1">{districtSlug}/schools/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, '')
                  )
                }
                placeholder="washington-elementary"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                disabled={createSchool.isPending}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              This will be used in the school's URL
            </p>
          </div>

          {/* School Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              School Type
            </label>
            <select
              value={schoolType}
              onChange={(e) => setSchoolType(e.target.value as SchoolType)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
              disabled={createSchool.isPending}
            >
              <option value="elementary">Elementary School</option>
              <option value="middle">Middle School</option>
              <option value="high">High School</option>
              <option value="k-8">K-8 School</option>
              <option value="k-12">K-12 School</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={createSchool.isPending}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createSchool.isPending || !name.trim() || !slug.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {createSchool.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create School'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
