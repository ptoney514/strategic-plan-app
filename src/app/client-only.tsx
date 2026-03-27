'use client'
// ClientOnly: renders children only on the client side.
// Used by scaffold page wrappers to prevent SSR of existing React Router components.
// All src/views/ components use react-router-dom which requires a browser context.
// Phase 3 migration will replace this with proper App Router components.
import { useEffect, useState } from 'react'

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  if (!mounted) return null

  return <>{children}</>
}
