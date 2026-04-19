import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scheduled Maintenance — StrataDASH',
  description: 'StrataDASH is undergoing scheduled maintenance. We will be back shortly.',
  robots: { index: false, follow: false },
}

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 text-white font-[family-name:var(--font-sora)] text-2xl font-semibold mb-8">
          S
        </div>

        <h1 className="font-[family-name:var(--font-sora)] text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 mb-4">
          We&rsquo;ll be right back.
        </h1>

        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          StrataDASH is undergoing scheduled maintenance as we polish a few things.
          Thanks for your patience — we&rsquo;ll be back online shortly.
        </p>

        <div className="inline-flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-full px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          Status: Maintenance in progress
        </div>

        <p className="mt-12 text-sm text-slate-400">
          Questions? Email{' '}
          <a href="mailto:support@stratadash.org" className="text-slate-600 hover:text-slate-900 underline underline-offset-2">
            support@stratadash.org
          </a>
        </p>
      </div>
    </main>
  )
}
