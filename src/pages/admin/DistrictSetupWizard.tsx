import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useCreateDistrict } from '../../hooks/useDistricts';
import { InvitationService } from '../../lib/services/invitation.service';
import { NameStep } from '../../components/system-admin/wizard/NameStep';
import { BrandStep } from '../../components/system-admin/wizard/BrandStep';
import { TeamStep } from '../../components/system-admin/wizard/TeamStep';
import { FinishStep } from '../../components/system-admin/wizard/FinishStep';
import type { WizardState } from '../../components/system-admin/wizard/NameStep';

const steps = ['Name & Details', 'Branding', 'Invite Team', 'Finish'];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function DistrictSetupWizard() {
  const navigate = useNavigate();
  const createDistrict = useCreateDistrict();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [data, setData] = useState<WizardState>({
    name: '',
    slug: '',
    entityType: 'school_district',
    entityLabel: 'School',
    tagline: '',
    logoUrl: '',
    primaryColor: '#c9a227',
    secondaryColor: '#1a1a2e',
    invitations: [],
  });

  const onChange = (updates: Partial<WizardState>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = (): boolean => {
    if (currentStep === 0) {
      return data.name.trim().length > 0 && data.slug.trim().length > 0;
    }
    if (currentStep === 2) {
      return data.invitations.every((inv) => inv.email === '' || isValidEmail(inv.email));
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleCreate = async () => {
    setError('');
    setIsCreating(true);
    try {
      const district = await createDistrict.mutateAsync({
        name: data.name,
        slug: data.slug,
        entity_type: data.entityType,
        entity_label: data.entityLabel || undefined,
        tagline: data.tagline || undefined,
        logo_url: data.logoUrl || undefined,
        primary_color: data.primaryColor,
        secondary_color: data.secondaryColor || undefined,
      });

      const slug = district.slug || data.slug;

      // Send invitations sequentially using the service directly
      // (the hook requires slug at call-site, but we only know it after creation)
      const validInvitations = data.invitations.filter((inv) => isValidEmail(inv.email));
      for (const inv of validInvitations) {
        try {
          await InvitationService.sendInvitation(slug, { email: inv.email, role: inv.role });
        } catch {
          // Continue sending remaining invitations even if one fails
        }
      }

      navigate('/districts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create district');
      setIsCreating(false);
    }
  };

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[720px] mx-auto">
      {/* Header */}
      <h1
        className="font-['Playfair_Display',Georgia,serif] text-[28px] font-medium tracking-tight mb-8"
        style={{ color: 'var(--editorial-text-primary)' }}
      >
        New District
      </h1>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((label, i) => {
          const isActive = i === currentStep;
          const isComplete = i < currentStep;
          return (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 transition-colors"
                style={{
                  backgroundColor: isActive
                    ? 'var(--editorial-accent-primary)'
                    : isComplete
                      ? 'var(--editorial-accent-primary)'
                      : 'var(--editorial-surface)',
                  color: isActive || isComplete ? 'white' : 'var(--editorial-text-muted)',
                  border: !isActive && !isComplete ? '1px solid var(--editorial-border)' : 'none',
                }}
              >
                {isComplete ? <Check size={16} /> : i + 1}
              </div>
              <span
                className="text-xs font-medium hidden sm:block truncate"
                style={{ color: isActive ? 'var(--editorial-text-primary)' : 'var(--editorial-text-muted)' }}
              >
                {label}
              </span>
              {i < steps.length - 1 && (
                <div
                  className="flex-1 h-px"
                  style={{
                    backgroundColor: isComplete ? 'var(--editorial-accent-primary)' : 'var(--editorial-border)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div
        className="rounded-xl p-6 border mb-6"
        style={{
          backgroundColor: 'var(--editorial-surface)',
          borderColor: 'var(--editorial-border)',
        }}
      >
        {currentStep === 0 && <NameStep data={data} onChange={onChange} />}
        {currentStep === 1 && <BrandStep data={data} onChange={onChange} />}
        {currentStep === 2 && <TeamStep data={data} onChange={onChange} />}
        {currentStep === 3 && <FinishStep data={data} isCreating={isCreating} />}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={currentStep === 0 ? () => navigate('/districts') : handleBack}
          disabled={isCreating}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-80 disabled:opacity-50"
          style={{ color: 'var(--editorial-text-muted)' }}
        >
          <ArrowLeft size={16} />
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--editorial-accent-primary)' }}
          >
            Next
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreating || !canProceed()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--editorial-accent-primary)' }}
          >
            {isCreating ? 'Creating...' : 'Create District'}
            {!isCreating && <Check size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}
