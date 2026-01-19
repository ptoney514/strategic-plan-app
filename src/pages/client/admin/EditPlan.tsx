import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronRight, Save, X, Globe, Lock, Calendar, Loader2 } from 'lucide-react';
import { usePlan, useUpdatePlan } from '../../../hooks/usePlans';

/**
 * EditPlan - Edit an existing strategic plan
 */
export function EditPlan() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const { data: plan, isLoading } = usePlan(planId || '');
  const updatePlan = useUpdatePlan();

  // Form state
  const [name, setName] = useState('');
  const [typeLabel, setTypeLabel] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when plan loads
  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setTypeLabel(plan.type_label || '');
      setDescription(plan.description || '');
      setIsPublic(plan.is_public);
      setIsActive(plan.is_active);
      setStartDate(plan.start_date || '');
      setEndDate(plan.end_date || '');
    }
  }, [plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Plan name is required');
      return;
    }

    if (!planId) {
      setError('Plan ID not found');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updatePlan.mutateAsync({
        id: planId,
        updates: {
          name: name.trim(),
          type_label: typeLabel.trim() || undefined,
          description: description.trim() || undefined,
          is_public: isPublic,
          is_active: isActive,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      });

      // Navigate back to the plan's detail page
      navigate(`/admin/plans/${planId}`);
    } catch (err) {
      console.error('Error updating plan:', err);
      setError('Failed to update plan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/plans/${planId}`);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Plan not found</h2>
          <p className="text-slate-500 mb-4">The plan you're looking for doesn't exist.</p>
          <Link
            to="/admin/plans"
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            Back to plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/admin/plans" className="hover:text-amber-600">
          Plans
        </Link>
        <ChevronRight size={14} />
        <Link to={`/admin/plans/${planId}`} className="hover:text-amber-600">
          {plan.name}
        </Link>
        <ChevronRight size={14} />
        <span className="text-slate-900">Edit</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Edit Plan</h1>
        <p className="text-sm text-slate-500 mt-1">
          Update your strategic plan details
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

        {/* Active Status */}
        <div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-slate-700">
              Active plan
            </span>
          </label>
          <p className="text-xs text-slate-500 mt-1 ml-7">
            Inactive plans are archived and won't appear in the main list
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
