'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-100 mb-4">Something went wrong</h1>
        <p className="text-slate-400 mb-8">{error.message || 'An unexpected error occurred'}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
