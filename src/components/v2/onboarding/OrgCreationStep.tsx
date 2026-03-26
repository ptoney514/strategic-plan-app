import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useCheckSlug } from '../../../hooks/v2/useOnboarding';

const ENTITY_TYPES = [
  { value: 'school_district', label: 'School District' },
  { value: 'school_university', label: 'School / University' },
  { value: 'nonprofit', label: 'Nonprofit' },
  { value: 'small_business', label: 'Small Business' },
  { value: 'other', label: 'Other' },
] as const;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface OrgCreationData {
  name: string;
  slug: string;
  entity_type: string;
}

interface OrgCreationStepProps {
  onNext: (data: OrgCreationData) => void;
  isSubmitting?: boolean;
}

export function OrgCreationStep({ onNext, isSubmitting }: OrgCreationStepProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [entityType, setEntityType] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Debounced slug for the check query
  const [debouncedSlug, setDebouncedSlug] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSlug(slug);
    }, 300);
    return () => clearTimeout(timer);
  }, [slug]);

  const { data: slugCheck, isFetching: isCheckingSlug } = useCheckSlug(debouncedSlug);

  // Auto-generate slug from name
  const handleNameChange = useCallback(
    (value: string) => {
      setName(value);
      if (!slugManuallyEdited) {
        setSlug(slugify(value));
      }
      setErrors((prev) => ({ ...prev, name: '' }));
    },
    [slugManuallyEdited],
  );

  const handleSlugChange = useCallback((value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(cleaned);
    setSlugManuallyEdited(true);
    setErrors((prev) => ({ ...prev, slug: '' }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Organization name is required';
    if (!slug || slug.length < 3) newErrors.slug = 'URL must be at least 3 characters';
    if (!entityType) newErrors.entity_type = 'Please select an organization type';
    if (slugCheck && !slugCheck.available) newErrors.slug = slugCheck.reason || 'This URL is not available';

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }

    onNext({ name: name.trim(), slug, entity_type: entityType });
  };

  const slugAvailable = slugCheck?.available === true;
  const slugUnavailable = slugCheck && !slugCheck.available && debouncedSlug === slug;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Tell us about your organization</h2>
        <p className="mt-1 text-sm text-gray-500">This information helps us set up your workspace.</p>
      </div>

      {/* Organization Name */}
      <div>
        <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 mb-1">
          Organization Name
        </label>
        <input
          id="org-name"
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Westside School District"
          className={`w-full px-3 py-2 text-sm rounded-lg border ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          } focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Entity Type */}
      <div>
        <label htmlFor="entity-type" className="block text-sm font-medium text-gray-700 mb-1">
          Organization Type
        </label>
        <select
          id="entity-type"
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value);
            setErrors((prev) => ({ ...prev, entity_type: '' }));
          }}
          className={`w-full px-3 py-2 text-sm rounded-lg border ${
            errors.entity_type ? 'border-red-300' : 'border-gray-300'
          } focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white`}
        >
          <option value="">Select type...</option>
          {ENTITY_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.entity_type && <p className="mt-1 text-sm text-red-600">{errors.entity_type}</p>}
      </div>

      {/* Slug / Public URL */}
      <div>
        <label htmlFor="org-slug" className="block text-sm font-medium text-gray-700 mb-1">
          Public URL
        </label>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-1">stratadash.org/</span>
          <div className="relative flex-1">
            <input
              id="org-slug"
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="your-org"
              className={`w-full px-3 py-2 pr-9 text-sm rounded-lg border ${
                errors.slug ? 'border-red-300' : slugAvailable ? 'border-green-300' : 'border-gray-300'
              } focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {/* Status indicator */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {isCheckingSlug && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
              {!isCheckingSlug && slugAvailable && debouncedSlug === slug && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
              {!isCheckingSlug && slugUnavailable && (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
        </div>
        {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
        {slugUnavailable && slugCheck?.suggestion && (
          <p className="mt-1 text-sm text-gray-500">
            Try{' '}
            <button
              type="button"
              onClick={() => setSlug(slugCheck.suggestion!)}
              className="text-blue-500 hover:underline"
            >
              {slugCheck.suggestion}
            </button>
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isCheckingSlug}
        className="w-full py-2.5 px-4 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating...
          </>
        ) : (
          'Continue'
        )}
      </button>
    </form>
  );
}
