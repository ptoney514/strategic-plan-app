'use client'
import dynamic from 'next/dynamic'

const V2WidgetBuilder = dynamic(
  () => import('@/pages/v2/admin/V2WidgetBuilder').then((m) => ({ default: m.V2WidgetBuilder })),
  { ssr: false }
)

export default function DistrictWidgetsPage() {
  return <V2WidgetBuilder />
}
