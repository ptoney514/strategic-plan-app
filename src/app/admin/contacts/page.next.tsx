'use client'
import dynamic from 'next/dynamic'

const ContactSubmissions = dynamic(() => import('@/pages/admin/ContactSubmissions').then((m) => ({ default: m.ContactSubmissions })), { ssr: false })

export default function Page() {
  return <ContactSubmissions />
}
