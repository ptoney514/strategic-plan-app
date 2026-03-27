'use client'
import dynamic from 'next/dynamic'

const DistrictSetupWizard = dynamic(() => import('@/pages/admin/DistrictSetupWizard').then((m) => ({ default: m.DistrictSetupWizard })), { ssr: false })

export default function Page() {
  return <DistrictSetupWizard />
}
