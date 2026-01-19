import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Save, X, Globe, Lock, Calendar } from 'lucide-react';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict } from '../../../hooks/useDistricts';
import { useCreatePlan } from '../../../hooks/usePlans';

/**
 * CreatePlan - Create a new strategic plan
 */
export function CreatePlan() {
  const navigate = useNavigate();
  const { slug } = useSubdomain();
  const { data: district } = useDistrict(slug || '');
  const createPlan = useCreatePlan();

  // Form state
  const [name, setName] = useState('');
  const [typeLabel, setTypeLabel] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Plan name is required');
      return;
    }

    if (!district?.id) {
      setError('District not found');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newPlan = await createPlan.mutateAsync({
        district_id: district.id,
        name: name.trim(),
        type_label: typeLabel.trim() || undefined,
        description: description.trim() || undefined,
        is_public: isPublic,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });

      // Navigate to the new plan's detail page
      navigate(`/admin/plans/${newPlan.id}`);
    } catch (err) {
      console.error('Error creating plan:', err);
      setError('Failed to create plan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/plans');
  };

  return (
    <div className="p-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/admin/plans" className="hover:text-amber-600">
          Plans
        </Link>
        <ChevronRight size={14} />
        <span className="text-slate-900">New Plan</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create Strategic Plan</h1>
        <p className="text-sm text-slate-500 mt-1">
          Create a new plan to organize your strategic objectives
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Plan Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
            Plan Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., 2025 Strategic Plan"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            required
          />
        </div>

        {/* Type Label */}
        <div>
          <label htmlFor="typeLabel" className="block text-sm font-medium text-slate-700 mb-2">
            Plan Type
          </label>
          <input
            type="text"
            id="typeLabel"
            value={typeLabel}
            onChange={(e) => setTypeLabel(e.target.value)}
            placeholder="e.g., Strategic, Functional, Annual"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            Optional label to categorize this plan
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Brief description of this strategic plan..."
            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-2">
              <Calendar size={14} className="inline-block mr-1" />
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-2">
              <Calendar size={14} className="inline-block mr-1" />
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Visibility
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                isPublic
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Globe size={18} />
              <span className="font-medium">Public</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                !isPublic
                  ? 'border-slate-500 bg-slate-50 text-slate-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Lock size={18} />
              <span className="font-medium">Private</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {isPublic
              ? 'This plan will be visible to the public on your district page'
              : 'This plan will only be visible to administrators'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors flex items-center gap-2"
          >
            <X size={18} />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {isSubmitting ? 'Creating...' : 'Create Plan'}
          </button>
        </div>
      </form>
    </div>
  );
}
