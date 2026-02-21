import { CheckCircle2, Building2, Palette, Users } from 'lucide-react';
import type { WizardState } from './NameStep';

interface FinishStepProps {
  data: WizardState;
  isCreating: boolean;
}

export function FinishStep({ data, isCreating }: FinishStepProps) {
  if (isCreating) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4"
          style={{ borderColor: 'var(--editorial-accent-primary)', borderTopColor: 'transparent' }}
        />
        <p className="text-sm font-medium" style={{ color: 'var(--editorial-text-primary)' }}>
          Creating district...
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--editorial-text-muted)' }}>
          Setting up everything for you
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'var(--editorial-accent-primary)', opacity: 0.15 }}
        >
          <CheckCircle2 size={20} style={{ color: 'var(--editorial-accent-primary)' }} />
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--editorial-text-primary)' }}>
            Review & Create
          </h2>
          <p className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
            Everything looks good! Review the details below.
          </p>
        </div>
      </div>

      {/* District Info */}
      <div
        className="rounded-xl p-5 border"
        style={{ backgroundColor: 'var(--editorial-surface)', borderColor: 'var(--editorial-border)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Building2 size={16} style={{ color: 'var(--editorial-accent-primary)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--editorial-text-primary)' }}>
            District Details
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt style={{ color: 'var(--editorial-text-muted)' }}>Name</dt>
          <dd style={{ color: 'var(--editorial-text-primary)' }}>{data.name}</dd>
          <dt style={{ color: 'var(--editorial-text-muted)' }}>Slug</dt>
          <dd className="font-mono text-xs" style={{ color: 'var(--editorial-text-primary)' }}>
            {data.slug}
          </dd>
          <dt style={{ color: 'var(--editorial-text-muted)' }}>Type</dt>
          <dd style={{ color: 'var(--editorial-text-primary)' }}>
            {data.entityType.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </dd>
          {data.entityLabel && (
            <>
              <dt style={{ color: 'var(--editorial-text-muted)' }}>Sub-unit Label</dt>
              <dd style={{ color: 'var(--editorial-text-primary)' }}>{data.entityLabel}</dd>
            </>
          )}
          {data.tagline && (
            <>
              <dt style={{ color: 'var(--editorial-text-muted)' }}>Tagline</dt>
              <dd className="col-span-1" style={{ color: 'var(--editorial-text-primary)' }}>
                {data.tagline}
              </dd>
            </>
          )}
        </dl>
      </div>

      {/* Branding */}
      <div
        className="rounded-xl p-5 border"
        style={{ backgroundColor: 'var(--editorial-surface)', borderColor: 'var(--editorial-border)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Palette size={16} style={{ color: 'var(--editorial-accent-primary)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--editorial-text-primary)' }}>
            Branding
          </span>
        </div>
        <div className="flex items-center gap-4">
          {data.logoUrl ? (
            <img
              src={data.logoUrl}
              alt="Logo"
              className="w-11 h-11 rounded-lg object-cover border"
              style={{ borderColor: 'var(--editorial-border)' }}
            />
          ) : (
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center text-white text-base font-bold"
              style={{ backgroundColor: data.primaryColor }}
            >
              {data.name ? data.name.charAt(0).toUpperCase() : 'D'}
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-md border" style={{ backgroundColor: data.primaryColor, borderColor: 'var(--editorial-border)' }} />
              <span className="text-xs font-mono" style={{ color: 'var(--editorial-text-muted)' }}>{data.primaryColor}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-md border" style={{ backgroundColor: data.secondaryColor, borderColor: 'var(--editorial-border)' }} />
              <span className="text-xs font-mono" style={{ color: 'var(--editorial-text-muted)' }}>{data.secondaryColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      {data.invitations.length > 0 && (
        <div
          className="rounded-xl p-5 border"
          style={{ backgroundColor: 'var(--editorial-surface)', borderColor: 'var(--editorial-border)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} style={{ color: 'var(--editorial-accent-primary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--editorial-text-primary)' }}>
              Team Invitations ({data.invitations.length})
            </span>
          </div>
          <ul className="space-y-2">
            {data.invitations.map((inv, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--editorial-text-primary)' }}>{inv.email}</span>
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium capitalize"
                  style={{
                    backgroundColor: 'var(--editorial-accent-primary)',
                    color: 'white',
                    opacity: 0.85,
                  }}
                >
                  {inv.role}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
