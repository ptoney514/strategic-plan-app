'use client'
import dynamic from 'next/dynamic'

const ContactSubmissions = dynamic(() => import('@/views/admin/ContactSubmissions').then((m) => ({ default: m.ContactSubmissions })), { ssr: false })

export default function Page() {
  return <ContactSubmissions />
}
