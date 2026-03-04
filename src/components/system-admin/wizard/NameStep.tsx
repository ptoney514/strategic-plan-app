import { Building2 } from 'lucide-react';

export interface WizardState {
  name: string;
  slug: string;
  entityType: string;
  entityLabel: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  invitations: Array<{ email: string; role: string }>;
}

interface NameStepProps {
  data: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

const entityTypes = [
  { value: 'school_district', label: 'School District' },
  { value: 'university', label: 'University' },
  { value: 'organization', label: 'Organization' },
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function NameStep({ data, onChange }: NameStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'var(--editorial-accent-primary)', opacity: 0.15 }}
        >
          <Building2 size={20} style={{ color: 'var(--editorial-accent-primary)' }} />
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--editorial-text-primary)' }}>
            Name & Details
          </h2>
          <p className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
            Basic information about the new district
          </p>
        </div>
      </div>

      {/* District Name */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--editorial-text-primary)' }}>
          District Name <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => {
            const name = e.target.value;
            onChange({ name, slug: generateSlug(name) });
          }}
          placeholder="e.g. Westside Unified School District"
          className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1"
          style={{
            backgroundColor: 'var(--editorial-surface)',
            borderColor: 'var(--editorial-border)',
            color: 'var(--editorial-text-primary)',
          }}
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--editorial-text-primary)' }}>
          URL Slug
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
            stratadash.org/
          </span>
          <input
            type="text"
            value={data.slug}
            onChange={(e) => onChange({ slug: generateSlug(e.target.value) })}
            placeholder="westside-unified"
            className="flex-1 px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1"
            style={{
              backgroundColor: 'var(--editorial-surface)',
              borderColor: 'var(--editorial-border)',
              color: 'var(--editorial-text-primary)',
            }}
          />
        </div>
      </div>

      {/* Entity Type */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--editorial-text-primary)' }}>
          Entity Type
        </label>
        <select
          value={data.entityType}
          onChange={(e) => onChange({ entityType: e.target.value })}
          className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1"
          style={{
            backgroundColor: 'var(--editorial-surface)',
            borderColor: 'var(--editorial-border)',
            color: 'var(--editorial-text-primary)',
          }}
        >
          {entityTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Entity Label */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--editorial-text-primary)' }}>
          Entity Label
        </label>
        <input
          type="text"
          value={data.entityLabel}
          onChange={(e) => onChange({ entityLabel: e.target.value })}
          placeholder="e.g. School, Department, Campus"
          className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1"
          style={{
            backgroundColor: 'var(--editorial-surface)',
            borderColor: 'var(--editorial-border)',
            color: 'var(--editorial-text-primary)',
          }}
        />
        <p className="text-xs mt-1" style={{ color: 'var(--editorial-text-muted)' }}>
          What do they call their sub-units?
        </p>
      </div>

      {/* Tagline */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--editorial-text-primary)' }}>
          Tagline
        </label>
        <textarea
          value={data.tagline}
          onChange={(e) => onChange({ tagline: e.target.value })}
          placeholder="A short description of the district's mission..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 resize-none"
          style={{
            backgroundColor: 'var(--editorial-surface)',
            borderColor: 'var(--editorial-border)',
            color: 'var(--editorial-text-primary)',
          }}
        />
      </div>
    </div>
  );
}
