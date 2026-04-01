'use client'
import dynamic from 'next/dynamic'

const V2OnboardingWizard = dynamic(
  () => import('@/views/v2/onboarding/V2OnboardingWizard').then((m) => ({ default: m.V2OnboardingWizard })),
  { ssr: false }
)

export default function OnboardPage() {
  return <V2OnboardingWizard />
}
