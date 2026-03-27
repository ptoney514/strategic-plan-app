import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { WizardStepIndicator } from '../../../components/v2/onboarding/WizardStepIndicator';
import { OrgCreationStep, type OrgCreationData } from '../../../components/v2/onboarding/OrgCreationStep';
import { TemplatePicker } from '../../../components/v2/onboarding/TemplatePicker';
import { BrandStep } from '../../../components/v2/onboarding/BrandStep';
import { useCreateOrg, useCompleteOnboarding } from '../../../hooks/v2/useOnboarding';
import type { DashboardTemplate } from '../../../lib/types';

interface OnboardingState {
  orgId: string;
  orgSlug: string;
  template: DashboardTemplate;
  primaryColor: string;
  logoUrl: string;
}

export function V2OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingState>({
    orgId: '',
    orgSlug: '',
    template: 'hierarchical',
    primaryColor: '#0099CC',
    logoUrl: '',
  });

  const createOrg = useCreateOrg();
  const completeOnboarding = useCompleteOnboarding();

  // Step 1 is always "done" since user is already authenticated
  // We start on step 2
  const currentStep = step + 1; // offset so step indicator shows step 2+ as active

  const handleOrgCreate = async (orgData: OrgCreationData) => {
    try {
      const result = await createOrg.mutateAsync({
        ...orgData,
        dashboard_template: data.template,
      });
      setData((prev) => ({
        ...prev,
        orgId: result.organization.id,
        orgSlug: result.organization.slug,
      }));
      setStep(2);
    } catch {
      // Error is handled by React Query in the mutation
    }
  };

  const handleTemplateSelect = () => {
    setStep(3);
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding.mutateAsync({
        organization_id: data.orgId,
        primary_color: data.primaryColor,
        logo_url: data.logoUrl || undefined,
        dashboard_template: data.template,
      });
      // Redirect to the new org's subdomain admin dashboard
      const host = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : '';
      const baseDomain = host.includes('lvh.me') ? 'lvh.me' : host.includes('localhost') ? 'localhost' : 'stratadash.org';
      window.location.href = `${window.location.protocol}//${data.orgSlug}.${baseDomain}${port}/admin`;
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col py-12 px-4">
      {/* Step indicator */}
      <div className="mb-12">
        <WizardStepIndicator currentStep={currentStep} />
      </div>

      {/* Step content */}
      <div className="flex-1 max-w-2xl mx-auto w-full">
        {step === 1 && (
          <OrgCreationStep
            onNext={handleOrgCreate}
            isSubmitting={createOrg.isPending}
          />
        )}

        {step === 2 && (
          <div className="space-y-6">
            <TemplatePicker
              selected={data.template}
              onChange={(template) => setData((prev) => ({ ...prev, template }))}
            />
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleTemplateSelect}
                className="px-8 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <BrandStep
              primaryColor={data.primaryColor}
              logoUrl={data.logoUrl}
              onColorChange={(color) => setData((prev) => ({ ...prev, primaryColor: color }))}
              onLogoChange={(url) => setData((prev) => ({ ...prev, logoUrl: url }))}
              onLogoRemove={() => setData((prev) => ({ ...prev, logoUrl: '' }))}
            />
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleComplete}
                disabled={completeOnboarding.isPending}
                className="px-8 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {completeOnboarding.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Organization'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error display */}
        {(createOrg.error || completeOnboarding.error) && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {createOrg.error?.message || completeOnboarding.error?.message}
          </div>
        )}
      </div>
    </div>
  );
}
